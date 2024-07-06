import { ButtonStyle, ComponentType } from '@discordjs/core';
import { prisma } from '../../../env.js';
import { Button } from '../../data.js';
import { createStatefulInteraction } from '../../stateful.js';
import { components } from './edit/components.js';
import { embeds } from './edit/embeds.js';

export const createButton = createStatefulInteraction<Button>({
    data: {
        type: ComponentType.Button,
        style: ButtonStyle.Primary,
        custom_id: 'forumpolls_create',
        emoji: { name: '📝' },
        label: 'Create one now',
    },
    async execute({ data: interaction, api, state: channelId }) {
        await api.interactions.deferMessageUpdate(
            interaction.id,
            interaction.token,
        );

        let forumPoll = await prisma.forumPoll.findFirst({
            where: { channelId },
            include: { answers: true },
        });
        let content;

        if (forumPoll !== null) {
            content = '❌ Already exists.';
        } else {
            forumPoll = await prisma.forumPoll.create({
                data: { channelId },
                include: { answers: true },
            });
            content = '✅ Successfully created.';
        }

        await api.interactions.editReply(
            interaction.application_id,
            interaction.token,
            {
                content,
                embeds: embeds(forumPoll),
                components: components(forumPoll),
            },
        );
    },
});
