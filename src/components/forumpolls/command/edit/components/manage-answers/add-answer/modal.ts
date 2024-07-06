import { ComponentType, TextInputStyle } from '@discordjs/core';
import { prisma } from '../../../../../../../env.js';
import { Modal } from '../../../../../../data.js';
import { mapModalTextInputValues } from '../../../../../../interactions.js';
import { createStatefulInteraction } from '../../../../../../stateful.js';
import { parseEmoji } from '../../../../../util/emoji.js';
import { embeds } from '../../../embeds.js';
import { manageAnswersComponents } from '../components.js';

export const addAnswerModal = createStatefulInteraction<Modal>({
    data: {
        custom_id: 'forumpolls_add_answer',
        title: 'Add answer',
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
    async execute({ data: interaction, api, state: channelId }) {
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
        await prisma.forumPollAnswer.create({
            data: {
                poll: { connect: { channelId } },
                text,
                emojiId: emoji.id,
                emojiName: emoji.name,
            },
        });

        const forumPoll = await prisma.forumPoll.findFirst({
            where: { channelId },
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
                content: '✅ Answer added.',
                embeds: embeds(forumPoll),
                components: manageAnswersComponents(forumPoll),
            },
        );
    },
});
