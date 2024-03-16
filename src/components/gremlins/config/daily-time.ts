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
                type: ApplicationCommandOptionType.String,
                name: 'time',
                description: 'The time (UTC Unix timestamp in seconds)',
                required: true,
            },
        ],
    },
    async execute({ data: interaction, api, subcommandData }) {
        const { time: input } = mapChatInputOptionValues(subcommandData) as {
            time: string;
        };

        const rawTime = /[0-9]+/.exec(input)?.[0];
        if (!rawTime) {
            await api.interactions.reply(interaction.id, interaction.token, {
                content: 'Your input did not contain a timestamp.',
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        const time = parseInt(rawTime);
        const guildId = interaction.guild_id!;

        await api.interactions.defer(interaction.id, interaction.token, {
            flags: MessageFlags.Ephemeral,
        });

        const date = new Date(time * 1000);

        const config = await prisma.gremlinsConfig.update({
            where: { guildId },
            data: {
                dailyHour: date.getUTCHours(),
                dailyMinute: date.getUTCMinutes(),
            },
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
