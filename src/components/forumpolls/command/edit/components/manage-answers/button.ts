import { ButtonStyle, ComponentType } from '@discordjs/core';
import { prisma } from '../../../../../../env.js';
import { Button } from '../../../../../data.js';
import { createStatefulInteraction } from '../../../../../stateful.js';
import { embeds } from '../../embeds.js';
import { manageAnswersComponents } from './components.js';

export const manageAnswersButton = createStatefulInteraction<Button>({
    data: {
        type: ComponentType.Button,
        style: ButtonStyle.Secondary,
        custom_id: 'forumpolls_manage_answers',
        emoji: { name: '🔧' },
        label: 'Manage answers',
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
                content: '',
                embeds: embeds(forumPoll),
                components: manageAnswersComponents(forumPoll),
            },
        );
    },
});
