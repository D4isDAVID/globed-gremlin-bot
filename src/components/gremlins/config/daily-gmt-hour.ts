import { ApplicationCommandOptionType, MessageFlags } from '@discordjs/core';
import { prisma } from '../../../env.js';
import { mapChatInputOptionValues } from '../../interactions.js';
import { Subcommand } from '../../subcommands.js';
import { createDailyGremlinTask } from '../cron/index.js';

export default {
    data: {
        type: ApplicationCommandOptionType.Subcommand,
        name: 'daily-gmt-hour',
        description: 'Configurate the gremlins daily hour (in GMT)',
        options: [
            {
                type: ApplicationCommandOptionType.Integer,
                name: 'hour',
                description: 'The hour (in GMT)',
                required: true,
                min_value: 0,
                max_value: 23,
            },
        ],
    },
    async execute({ data: interaction, api, subcommandData }) {
        const { hour } = mapChatInputOptionValues(subcommandData) as {
            hour: number;
        };
        const guildId = interaction.guild_id!;

        await api.interactions.defer(interaction.id, interaction.token, {
            flags: MessageFlags.Ephemeral,
        });

        const config = await prisma.gremlinsConfig.update({
            where: { guildId },
            data: { dailyGmtHour: hour },
        });

        createDailyGremlinTask(guildId);

        await api.interactions.editReply(
            interaction.application_id,
            interaction.token,
            {
                content: `Gremlins daily hour (in GMT) set to ${config.dailyGmtHour.toString().padStart(2, '0')}:00.`,
            },
        );
    },
} satisfies Subcommand;
