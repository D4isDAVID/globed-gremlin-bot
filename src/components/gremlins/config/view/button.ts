import { ButtonStyle, ComponentType } from '@discordjs/core';
import { Button } from '../../../data.js';
import { embed } from './embed.js';

export default {
    data: {
        type: ComponentType.Button,
        custom_id: 'reload_config_view',
        style: ButtonStyle.Secondary,
        label: 'Reload',
        emoji: { name: '🔃' },
    },
    async execute({ data: interaction, api }) {
        await api.interactions.deferMessageUpdate(
            interaction.id,
            interaction.token,
        );

        await api.interactions.editReply(
            interaction.application_id,
            interaction.token,
            {
                embeds: [await embed(interaction.guild_id!)],
            },
        );
    },
} satisfies Button;
