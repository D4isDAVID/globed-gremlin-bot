import { ButtonStyle, ComponentType } from '@discordjs/core';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { prisma } from '../../../../../../../env.js';
import { Button } from '../../../../../../data.js';
import { createStatefulInteraction } from '../../../../../../stateful.js';
import { embeds } from '../../../embeds.js';
import { editPollComponents } from '../components.js';

export const pinEnableButton = createStatefulInteraction<Button>({
    data: {
        type: ComponentType.Button,
        style: ButtonStyle.Success,
        custom_id: 'forumpolls_pin_enable',
        emoji: { name: '📌' },
        label: 'Enable pin',
    },
    async execute({ data: interaction, api, state: channelId }) {
        await api.interactions.deferMessageUpdate(
            interaction.id,
            interaction.token,
        );

        try {
            const forumPoll = await prisma.forumPoll.update({
                where: { channelId },
                data: { pin: true },
                include: { answers: true },
            });

            await api.interactions.editReply(
                interaction.application_id,
                interaction.token,
                {
                    content: '✅ Pin enabled.',
                    embeds: embeds(forumPoll),
                    components: editPollComponents(forumPoll),
                },
            );
        } catch (e) {
            if (
                !(e instanceof PrismaClientKnownRequestError) ||
                e.code !== 'P2025'
            )
                throw e;

            await api.interactions.editReply(
                interaction.application_id,
                interaction.token,
                {
                    content: '❌ Forum poll was deleted.',
                    embeds: [],
                    components: [],
                },
            );
        }
    },
});
