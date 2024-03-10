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
        name: 'daily-minute',
        description: 'Configurate the gremlins daily posting minute (UTC)',
        options: [
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
        const { minute } = mapChatInputOptionValues(subcommandData) as {
            minute: number;
        };
        const guildId = interaction.guild_id!;

        await api.interactions.defer(interaction.id, interaction.token, {
            flags: MessageFlags.Ephemeral,
        });

        const config = await prisma.gremlinsConfig.update({
            where: { guildId },
            data: { dailyMinute: minute },
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
