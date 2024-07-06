import { ButtonStyle, ComponentType } from '@discordjs/core';
import { prisma } from '../../../../../../env.js';
import { Button } from '../../../../../data.js';
import { createStatefulInteraction } from '../../../../../stateful.js';
import { deleteCancelButton } from './cancel-button.js';
import { deleteConfirmButton } from './confirm-button.js';

export const deleteButton = createStatefulInteraction<Button>({
    data: {
        type: ComponentType.Button,
        style: ButtonStyle.Danger,
        custom_id: 'forumpolls_delete_prompt',
        emoji: { name: '🗑️' },
        label: 'Delete poll',
    },
    async execute({ data: interaction, api, state: channelId }) {
        await api.interactions.deferMessageUpdate(
            interaction.id,
            interaction.token,
        );

        const forumPoll = await prisma.forumPoll.findFirst({
            where: { channelId },
            include: { answers: true },
        });

        if (forumPoll === null) {
            await api.interactions.editReply(
                interaction.application_id,
                interaction.token,
                {
                    content: '❌ Forum poll was deleted.',
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
                content: `Are you sure you want to delete this forum poll?`,
                components: [
                    {
                        type: ComponentType.ActionRow,
                        components: [
                            deleteConfirmButton.stateful(channelId),
                            deleteCancelButton.stateful(channelId),
                        ],
                    },
                ],
            },
        );
    },
});
