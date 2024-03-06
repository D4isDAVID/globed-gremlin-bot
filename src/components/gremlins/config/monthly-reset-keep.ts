import { ApplicationCommandOptionType, MessageFlags } from '@discordjs/core';
import { prisma } from '../../../env.js';
import { mapChatInputOptionValues } from '../../interactions.js';
import { Subcommand } from '../../subcommands.js';

export default {
    data: {
        type: ApplicationCommandOptionType.Subcommand,
        name: 'monthly-reset-keep',
        description:
            'Configurate how many posts will be kept after the monthly reset',
        options: [
            {
                type: ApplicationCommandOptionType.Integer,
                name: 'amount',
                description: 'The amount of posts',
                required: true,
                min_value: 0,
            },
        ],
    },
    async execute({ data: interaction, api, subcommandData }) {
        const { amount } = mapChatInputOptionValues(subcommandData) as {
            amount: number;
        };

        await api.interactions.defer(interaction.id, interaction.token, {
            flags: MessageFlags.Ephemeral,
        });

        const config = await prisma.gremlinsConfig.update({
            where: { guildId: interaction.guild_id! },
            data: { monthlyResetKeep: amount },
        });

        await api.interactions.editReply(
            interaction.application_id,
            interaction.token,
            {
                content: `Set gremlins monthly reset keep amount to ${config.monthlyResetKeep}.`,
            },
        );
    },
} satisfies Subcommand;
