import { ApplicationCommandOptionType, MessageFlags } from '@discordjs/core';
import { prisma } from '../../../env.js';
import { mapChatInputOptionValues } from '../../interactions.js';
import { Subcommand } from '../../subcommands.js';
import { createMonthlyGremlinTask } from '../cron/monthly.js';
import {
    constantTimeDisplay,
    timestampDisplay,
} from '../utils/timestamp-display.js';

export default {
    data: {
        type: ApplicationCommandOptionType.Subcommand,
        name: 'monthly-time',
        description: 'Configurate the gremlins monthly posting time (UTC)',
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
            data: { monthlyHour: hour, monthlyMinute: minute },
        });

        await createMonthlyGremlinTask(guildId);

        await api.interactions.editReply(
            interaction.application_id,
            interaction.token,
            {
                content: `Gremlins monthly posting time set to ${constantTimeDisplay(config.monthlyHour, config.monthlyMinute)} (${timestampDisplay(config.monthlyHour, config.monthlyMinute)}).`,
            },
        );
    },
} satisfies Subcommand;
