import { APIEmbed, Snowflake } from '@discordjs/core';
import { channelMention } from '@discordjs/formatters';
import { prisma } from '../../../../env.js';

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
                name: 'Daily Hour (in GMT)',
                value: `${config.dailyGmtHour.toString().padStart(2, '0')}:00`,
            },
            {
                name: 'Submissions Channel',
                value: config.submissionsChannelId
                    ? channelMention(config.submissionsChannelId)
                    : 'None',
            },
        ],
        footer: {
            text: 'Last Updated',
        },
        timestamp: new Date().toISOString(),
    };
};
