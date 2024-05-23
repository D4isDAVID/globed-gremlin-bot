import { APIEmbed, Snowflake } from '@discordjs/core';
import { channelMention } from '@discordjs/formatters';
import { prisma } from '../../../../env.js';
import {
    constantTimeDisplay,
    timestampDisplay,
} from '../../utils/timestamp-display.js';

export const embed = async (guildId: Snowflake): Promise<APIEmbed> => {
    const config = (await prisma.gremlinsConfig.findFirst({
        where: { guildId },
    }))!;

    return {
        color: 0xd0d0d0,
        title: 'Gremlins Config',
        fields: [
            {
                name: 'Daily Day',
                value: `Day ${config.dailyDay}`,
                inline: true,
            },
            {
                name: 'Daily Channel',
                value: config.dailyChannelId
                    ? channelMention(config.dailyChannelId)
                    : 'None',
                inline: true,
            },
            {
                name: 'Daily Time',
                value: [
                    `UTC: ${constantTimeDisplay(config.dailyHour, config.dailyMinute)}`,
                    `Local Time: ${timestampDisplay(config.dailyHour, config.dailyMinute)}`,
                ].join('\n'),
                inline: true,
            },
            {
                name: 'Submissions Channel',
                value: config.submissionsChannelId
                    ? channelMention(config.submissionsChannelId)
                    : 'None',
            },
            {
                name: 'Monthly Reset',
                value: config.monthlyReset ? 'Enabled' : 'Disabled',
                inline: true,
            },
            {
                name: 'Posts Kept After Monthly Reset',
                value: `${config.monthlyResetKeep}`,
                inline: true,
            },
            {
                name: 'Monthly Reset Time',
                value: [
                    `UTC: ${constantTimeDisplay(config.monthlyResetHour, config.monthlyResetMinute)}`,
                    `Local Time: ${timestampDisplay(config.monthlyResetHour, config.monthlyResetMinute)}`,
                ].join('\n'),
                inline: true,
            },
        ],
        footer: {
            text: 'Last Updated',
        },
        timestamp: new Date().toISOString(),
    };
};
