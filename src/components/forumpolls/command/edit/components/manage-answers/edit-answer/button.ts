import { ButtonStyle, ComponentType } from '@discordjs/core';
import { prisma } from '../../../../../../../env.js';
import { Button } from '../../../../../../data.js';
import { createStatefulInteraction } from '../../../../../../stateful.js';
import { stringifyEmoji } from '../../../../../util/emoji.js';
import { editAnswerCancelButton } from './cancel-button.js';
import { editAnswerStringSelect } from './string-select.js';

export const editAnswerButton = createStatefulInteraction<Button>({
    data: {
        type: ComponentType.Button,
        style: ButtonStyle.Secondary,
        custom_id: 'forumpolls_edit_answer_prompt',
        emoji: { name: '✏️' },
        label: 'Edit answer',
    },
    async execute({ data: interaction, api, state: channelId }) {
        await api.interactions.deferMessageUpdate(
            interaction.id,
            interaction.token,
        );

        const answers = await prisma.forumPollAnswer.findMany({
            where: { channelId },
        });

        const stringSelect = editAnswerStringSelect.stateful(channelId);
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
                content: 'Select an answer to edit:',
                embeds: [],
                components: [
                    {
                        type: ComponentType.ActionRow,
                        components: [stringSelect],
                    },
                    {
                        type: ComponentType.ActionRow,
                        components: [
                            editAnswerCancelButton.stateful(channelId),
                        ],
                    },
                ],
            },
        );
    },
});
