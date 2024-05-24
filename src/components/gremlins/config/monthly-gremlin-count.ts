import { ApplicationCommandOptionType, MessageFlags } from '@discordjs/core';
import { prisma } from '../../../env.js';
import { mapChatInputOptionValues } from '../../interactions.js';
import { Subcommand } from '../../subcommands.js';

export default {
    data: {
        type: ApplicationCommandOptionType.Subcommand,
        name: 'monthly-gremlin-count',
        description: 'Configurate the gremlins monthly gremlin count',
        options: [
            {
                type: ApplicationCommandOptionType.Integer,
                name: 'count',
                description: 'The gremlin count',
                required: true,
                min_value: 0,
                max_value: 10,
            },
        ],
    },
    async execute({ data: interaction, api, subcommandData }) {
        const { count } = mapChatInputOptionValues(subcommandData) as {
            count: number;
        };
        const guildId = interaction.guild_id!;

        await api.interactions.defer(interaction.id, interaction.token, {
            flags: MessageFlags.Ephemeral,
        });

        const config = await prisma.gremlinsConfig.update({
            where: { guildId },
            data: { monthlyGremlinCount: count },
        });

        await api.interactions.editReply(
            interaction.application_id,
            interaction.token,
            {
                content: `Gremlins monthly gremlin count set to ${config.monthlyGremlinCount}.`,
            },
        );
    },
} satisfies Subcommand;
