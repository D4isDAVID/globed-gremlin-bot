import { APIEmbed, Snowflake } from '@discordjs/core';
import { channelMention } from '@discordjs/formatters';
import { prisma } from '../../../../env.js';
import {
    constantTimeDisplay,
    timestampDisplay,
} from '../../utils/daily-timestamp.js';

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
            },
            {
                name: 'Daily Channel',
                value: config.dailyChannelId
                    ? channelMention(config.dailyChannelId)
                    : 'None',
            },
            {
                name: 'Daily Time',
                value: [
                    `UTC: ${constantTimeDisplay(config.dailyHour, config.dailyMinute)}`,
                    `Local Time: ${timestampDisplay(config.dailyHour, config.dailyMinute)}`,
                ].join('\n'),
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
            },
            {
                name: 'Posts Kept After Monthly Reset',
                value: `${config.monthlyResetKeep}`,
            },
        ],
        footer: {
            text: 'Last Updated',
        },
        timestamp: new Date().toISOString(),
    };
};
