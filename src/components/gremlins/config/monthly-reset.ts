import { ApplicationCommandOptionType, MessageFlags } from '@discordjs/core';
import { prisma } from '../../../env.js';
import { mapChatInputOptionValues } from '../../interactions.js';
import { Subcommand } from '../../subcommands.js';

export default {
    data: {
        type: ApplicationCommandOptionType.Subcommand,
        name: 'monthly-reset',
        description: 'Configurate the gremlins monthly reset',
        options: [
            {
                type: ApplicationCommandOptionType.Boolean,
                name: 'enable',
                description: 'Whether to enable the monthly reset',
                required: true,
            },
        ],
    },
    async execute({ data: interaction, api, subcommandData }) {
        const { enable } = mapChatInputOptionValues(subcommandData) as {
            enable: boolean;
        };

        await api.interactions.defer(interaction.id, interaction.token, {
            flags: MessageFlags.Ephemeral,
        });

        const config = await prisma.gremlinsConfig.update({
            where: { guildId: interaction.guild_id! },
            data: { monthlyReset: enable },
        });

        await api.interactions.editReply(
            interaction.application_id,
            interaction.token,
            {
                content: `${config.monthlyReset ? 'Enabled' : 'Disabled'} gremlins monthly reset.`,
            },
        );
    },
} satisfies Subcommand;
