import {
    API,
    APIMessage,
    APIPollAnswer,
    APIThreadChannel,
    PollLayoutType,
} from '@discordjs/core';
import { prisma } from '../../../env.js';

export async function sendPoll(
    api: API,
    thread: APIThreadChannel,
): Promise<APIMessage | null> {
    const forumPoll = await prisma.forumPoll.findFirst({
        where: { channelId: thread.parent_id! },
        include: { answers: true },
    });

    if (forumPoll === null || forumPoll.answers.length === 0) return null;

    const message = await api.channels.createMessage(thread.id, {
        poll: {
            question: {
                text: forumPoll.question,
            },
            answers: forumPoll.answers.map((a) => {
                const obj: Omit<APIPollAnswer, 'answer_id'> = {
                    poll_media: {
                        text: a.text,
                    },
                };

                if (a.emojiName !== null) {
                    obj.poll_media.emoji = {
                        id: a.emojiId,
                        name: a.emojiName,
                    };
                }

                return obj;
            }),
            duration: forumPoll.duration,
            allow_multiselect: forumPoll.allowMultiselect,
            layout_type: PollLayoutType.Default,
        },
    });

    if (forumPoll.pin) {
        await api.channels.pinMessage(thread.id, message.id);
    }

    return message;
}
