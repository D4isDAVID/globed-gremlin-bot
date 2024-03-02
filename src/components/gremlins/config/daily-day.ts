import { ApplicationCommandOptionType, MessageFlags } from '@discordjs/core';
import { prisma } from '../../../env.js';
import { mapChatInputOptionValues } from '../../interactions.js';
import { Subcommand } from '../../subcommands.js';

export default {
    data: {
        type: ApplicationCommandOptionType.Subcommand,
        name: 'daily-day',
        description: 'Configurate the gremlins daily day',
        options: [
            {
                type: ApplicationCommandOptionType.Integer,
                name: 'day',
                description: 'The day',
                required: true,
            },
        ],
    },
    async execute({ data: interaction, api, subcommandData }) {
        const { day } = mapChatInputOptionValues(subcommandData) as {
            day: number;
        };

        await api.interactions.defer(interaction.id, interaction.token, {
            flags: MessageFlags.Ephemeral,
        });

        const config = await prisma.gremlinsConfig.update({
            where: { guildId: interaction.guild_id! },
            data: { dailyDay: day },
        });

        await api.interactions.editReply(
            interaction.application_id,
            interaction.token,
            {
                content: `Gremlins daily day set to Day ${config.dailyDay}.`,
            },
        );
    },
} satisfies Subcommand;
