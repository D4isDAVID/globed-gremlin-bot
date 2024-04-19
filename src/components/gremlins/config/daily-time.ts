import { ApplicationCommandOptionType, MessageFlags } from '@discordjs/core';
import { prisma } from '../../../env.js';
import { mapChatInputOptionValues } from '../../interactions.js';
import { Subcommand } from '../../subcommands.js';
import { createDailyGremlinTask } from '../cron/daily.js';
import {
    constantTimeDisplay,
    timestampDisplay,
} from '../utils/daily-timestamp.js';

export default {
    data: {
        type: ApplicationCommandOptionType.Subcommand,
        name: 'daily-time',
        description: 'Configurate the gremlins daily posting hour (UTC)',
        options: [
            {
                type: ApplicationCommandOptionType.Integer,
                name: 'hour',
                description: 'The hour (UTC)',
                required: true,
                min_value: 0,
                max_value: 23,
            },
            {
                type: ApplicationCommandOptionType.Integer,
                name: 'minute',
                description: 'The minute (UTC)',
                required: true,
                min_value: 0,
                max_value: 59,
            },
        ],
    },
    async execute({ data: interaction, api, subcommandData }) {
        const { hour, minute } = mapChatInputOptionValues(subcommandData) as {
            hour: number;
            minute: number;
        };
        const guildId = interaction.guild_id!;

        await api.interactions.defer(interaction.id, interaction.token, {
            flags: MessageFlags.Ephemeral,
        });

        const config = await prisma.gremlinsConfig.update({
            where: { guildId },
            data: { dailyHour: hour, dailyMinute: minute },
        });

        createDailyGremlinTask(guildId);

        await api.interactions.editReply(
            interaction.application_id,
            interaction.token,
            {
                content: `Gremlins daily time set to ${constantTimeDisplay(config.dailyHour, config.dailyMinute)} (${timestampDisplay(config.dailyHour, config.dailyMinute)}).`,
            },
        );
    },
} satisfies Subcommand;
