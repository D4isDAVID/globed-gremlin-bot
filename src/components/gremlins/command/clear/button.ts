import { ButtonStyle, ComponentType } from '@discordjs/core';
import { prisma } from '../../../../env.js';
import { Button } from '../../../data.js';

export default {
    data: {
        type: ComponentType.Button,
        custom_id: 'gremlins_clear_button',
        style: ButtonStyle.Danger,
        emoji: { name: '⚠️' },
        label: 'DELETE ALL GREMLINS',
    },
    async execute({ data: interaction, api }) {
        await api.interactions.deferMessageUpdate(
            interaction.id,
            interaction.token,
        );

        const { count } = await prisma.gremlin.deleteMany();

        await api.interactions.editReply(
            interaction.application_id,
            interaction.token,
            {
                content: `Gremlins list cleared; ${count} gremlins deleted.`,
                components: [],
            },
        );
    },
} satisfies Button;
