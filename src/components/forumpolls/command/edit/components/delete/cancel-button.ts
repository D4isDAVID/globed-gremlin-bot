import { ButtonStyle, ComponentType } from '@discordjs/core';
import { prisma } from '../../../../../../env.js';
import { Button } from '../../../../../data.js';
import { createStatefulInteraction } from '../../../../../stateful.js';
import { components } from '../../components.js';
import { embeds } from '../../embeds.js';

export const deleteCancelButton = createStatefulInteraction<Button>({
    data: {
        type: ComponentType.Button,
        style: ButtonStyle.Secondary,
        custom_id: 'forumpolls_delete_cancel',
        emoji: { name: '❌' },
        label: 'Cancel',
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
                    content: '❌ Forum poll was already deleted.',
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
                content: '✅ Deletion cancelled.',
                embeds: embeds(forumPoll),
                components: components(forumPoll),
            },
        );
    },
});
