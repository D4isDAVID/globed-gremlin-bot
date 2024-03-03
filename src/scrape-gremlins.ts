import {
    APITextChannel,
    ChannelType,
    RESTGetAPIChannelMessagesQuery,
} from '@discordjs/core';
import { exit, stdout } from 'process';
import prompts from 'prompts';
import { clearLine, moveCursor } from 'readline';
import { SUBMISSION_EMOJI } from './components/gremlins/command/constants.js';
import { api, prisma } from './env.js';

const { guildId } = (await prompts({
    type: 'text',
    name: 'guildId',
    message: 'What is the ID of the server to scrape?',
    validate: async (value) =>
        await api.guilds
            .get(value)
            .then(() => true)
            .catch((e) => e.message),
})) as { guildId: string };
if (!guildId) exit(1);

const { channelId } = (await prompts({
    type: 'text',
    name: 'channelId',
    message: 'What is the ID of the channel to scrape?',
    validate: async (value) =>
        await api.channels
            .get(value)
            .then((channel) => {
                if (
                    ![
                        ChannelType.AnnouncementThread,
                        ChannelType.GuildAnnouncement,
                        ChannelType.GuildText,
                        ChannelType.PrivateThread,
                        ChannelType.PublicThread,
                    ].includes(channel.type)
                )
                    return false;
                if ((channel as APITextChannel).guild_id !== guildId)
                    return false;
                return true;
            })
            .catch((e) => e.message),
})) as { channelId: string };
if (!channelId) exit(1);

const { firstUserId } = (await prompts({
    type: 'text',
    name: 'firstUserId',
    message: 'What is the ID of the user that added the gremlins?',
    validate: (value) => !!value,
})) as { firstUserId: string };
if (!firstUserId) exit(1);

const userIds = [firstUserId];
while (true) {
    const { userId } = (await prompts({
        type: 'text',
        name: 'userId',
        message: 'What is the ID of another user? (optional)',
    })) as { userId: string };
    if (!userId) break;
    userIds.push(userId);
}

let batch = 1;
let count = 0;

stdout.write('Scraping... ');

let prevMessageId = null;
while (true) {
    const query: RESTGetAPIChannelMessagesQuery = { limit: 100 };
    if (prevMessageId) query.before = prevMessageId;

    const messages = await api.channels.getMessages(channelId, query);
    if (messages.length === 0) break;

    const batchMessage = `Batch ${batch}... `;
    stdout.write(batchMessage);

    for await (const message of messages) {
        if (!message.reactions?.length) continue;

        const attachment = message.attachments[0];
        if (!attachment || !attachment.content_type?.startsWith('image'))
            continue;

        let submitted = false;
        for await (const userId of userIds) {
            const reaction = (
                await api.channels.getMessageReactions(
                    channelId,
                    message.id,
                    SUBMISSION_EMOJI,
                    {
                        after: `${BigInt(userId) - 1n}`,
                        limit: 1,
                    },
                )
            )[0];

            if (!reaction) continue;
            if (reaction.id !== userId) continue;

            submitted = true;
            break;
        }
        if (!submitted) continue;

        const existing = await prisma.gremlin.findFirst({
            where: {
                channelId,
                messageId: message.id,
            },
        });
        if (existing) continue;

        stdout.write(message.id);

        await prisma.gremlin.create({
            data: {
                guildId,
                channelId,
                messageId: message.id,
                submitterId: message.author.id,
                imageUrl: attachment.url,
                quote: message.content ? `"${message.content}"` : null,
            },
        });

        count++;

        moveCursor(stdout, -message.id.length, 0);
        clearLine(stdout, 1);
    }

    prevMessageId = messages[messages.length - 1]!.id;
    batch++;

    moveCursor(stdout, -batchMessage.length, 0);
    clearLine(stdout, 1);
}

console.log(`${count} gremlins added.`);
exit(0);
