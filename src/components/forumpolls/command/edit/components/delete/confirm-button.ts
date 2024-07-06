import { ButtonStyle, ComponentType } from '@discordjs/core';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { prisma } from '../../../../../../env.js';
import { Button } from '../../../../../data.js';
import { createStatefulInteraction } from '../../../../../stateful.js';

export const deleteConfirmButton = createStatefulInteraction<Button>({
    data: {
        type: ComponentType.Button,
        style: ButtonStyle.Danger,
        custom_id: 'forumpolls_delete_confirm',
        emoji: { name: '🗑️' },
        label: 'Delete',
    },
    async execute({ data: interaction, api, state: channelId }) {
        await api.interactions.deferMessageUpdate(
            interaction.id,
            interaction.token,
        );

        let content: string;

        try {
            await prisma.forumPoll.delete({
                where: { channelId },
            });

            content = '✅ Successfully deleted.';
        } catch (e) {
            if (
                !(e instanceof PrismaClientKnownRequestError) ||
                e.code !== 'P2025'
            )
                throw e;

            content = '❌ Forum poll was already deleted.';
        }

        await api.interactions.editReply(
            interaction.application_id,
            interaction.token,
            {
                content,
                embeds: [],
                components: [],
            },
        );
    },
});
