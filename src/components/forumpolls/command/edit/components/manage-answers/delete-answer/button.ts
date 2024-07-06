import { ButtonStyle, ComponentType } from '@discordjs/core';
import { prisma } from '../../../../../../../env.js';
import { Button } from '../../../../../../data.js';
import { createStatefulInteraction } from '../../../../../../stateful.js';
import { stringifyEmoji } from '../../../../../util/emoji.js';
import { deleteAnswerCancelButton } from './cancel-button.js';
import { deleteAnswerStringSelect } from './string-select.js';

export const deleteAnswerButton = createStatefulInteraction<Button>({
    data: {
        type: ComponentType.Button,
        style: ButtonStyle.Danger,
        custom_id: 'forumpolls_delete_answer_prompt',
        emoji: { name: '🗑️' },
        label: 'Delete answer',
    },
    async execute({ data: interaction, api, state: channelId }) {
        await api.interactions.deferMessageUpdate(
            interaction.id,
            interaction.token,
        );

        const answers = await prisma.forumPollAnswer.findMany({
            where: { channelId },
        });

        const stringSelect = deleteAnswerStringSelect.stateful(channelId);
        stringSelect.options.push(
            ...answers.map((a) => ({
                label: `${stringifyEmoji(a.emojiName, a.emojiId) ?? ''} ${a.text}`,
                value: `${a.id}`,
            })),
        );

        await api.interactions.editReply(
            interaction.application_id,
            interaction.token,
            {
                content: 'Select an answer to delete:',
                embeds: [],
                components: [
                    {
                        type: ComponentType.ActionRow,
                        components: [stringSelect],
                    },
                    {
                        type: ComponentType.ActionRow,
                        components: [
                            deleteAnswerCancelButton.stateful(channelId),
                        ],
                    },
                ],
            },
        );
    },
});
