import { ComponentType, TextInputStyle } from '@discordjs/core';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { prisma } from '../../../../../../../env.js';
import { Modal } from '../../../../../../data.js';
import { mapModalTextInputValues } from '../../../../../../interactions.js';
import { createStatefulInteraction } from '../../../../../../stateful.js';
import { parseEmoji } from '../../../../../util/emoji.js';
import { embeds } from '../../../embeds.js';
import { manageAnswersComponents } from '../components.js';

export const editAnswerModal = createStatefulInteraction<Modal>({
    data: {
        custom_id: 'forumpolls_edit_answer',
        title: 'Edit answer',
        components: [
            {
                type: ComponentType.ActionRow,
                components: [
                    {
                        type: ComponentType.TextInput,
                        style: TextInputStyle.Short,
                        custom_id: 'emoji',
                        label: 'Emoji',
                        required: false,
                    },
                ],
            },
            {
                type: ComponentType.ActionRow,
                components: [
                    {
                        type: ComponentType.TextInput,
                        style: TextInputStyle.Short,
                        custom_id: 'text',
                        label: 'Answer',
                        max_length: 55,
                        required: true,
                    },
                ],
            },
        ],
    },
    async execute({ data: interaction, api, state }) {
        const [channelId, answerIdRaw] = state.split('_');
        const answerId = parseInt(answerIdRaw!);

        const { emoji: emojiRaw, text } = mapModalTextInputValues(
            interaction.data,
        ) as {
            emoji: string;
            text: string;
        };

        await api.interactions.deferMessageUpdate(
            interaction.id,
            interaction.token,
        );

        const emoji = parseEmoji(emojiRaw);

        let content = '';
        try {
            await prisma.forumPollAnswer.update({
                where: {
                    id: answerId!,
                    channelId: channelId!,
                },
                data: {
                    text,
                    emojiId: emoji.id,
                    emojiName: emoji.name,
                },
            });

            content = '✅ Answer edited.';
        } catch (e) {
            if (
                !(e instanceof PrismaClientKnownRequestError) ||
                e.code !== 'P2025'
            )
                throw e;

            content = '❌ Answer was deleted.';
        }

        const forumPoll = await prisma.forumPoll.findFirst({
            where: { channelId: channelId! },
            include: { answers: true },
        });

        if (forumPoll === null) {
            await api.interactions.editReply(
                interaction.application_id,
                interaction.token,
                {
                    content: '❌ Form poll was deleted.',
                    embeds: [],
                    components: [],
                },
            );
            return;
        }

        await api.interactions.editReply(
            interaction.application_id,
            interaction.token,
            {
                content,
                embeds: embeds(forumPoll),
                components: manageAnswersComponents(forumPoll),
            },
        );
    },
});
