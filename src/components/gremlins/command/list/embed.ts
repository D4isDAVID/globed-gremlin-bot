import { APIEmbed, Snowflake } from '@discordjs/core';
import { messageLink, userMention } from '@discordjs/formatters';
import { prisma } from '../../../../env.js';
import { LIST_PAGE_SIZE } from '../constants.js';

export default async (
    page: number,
    totalPages: number,
    count: number,
    guildId: Snowflake,
): Promise<APIEmbed> => {
    const embed: APIEmbed = {
        color: 0xd0d0d0,
        title: `Gremlins List (${count} total)`,
        footer: {
            text: `Page ${page}/${totalPages} | Last Updated`,
        },
        timestamp: new Date().toISOString(),
    };

    if (totalPages === 0) embed.description = 'No gremlins yet.';
    else {
        const gremlins = await prisma.gremlin.findMany({
            where: { guildId },
            skip: LIST_PAGE_SIZE * (page - 1),
            take: LIST_PAGE_SIZE,
        });

        embed.fields = gremlins.map((s) => ({
            name: `Gremlin ID ${s.id}`,
            value: `${messageLink(s.channelId, s.messageId)} - ${s.quote ? `${s.quote} ` : ''}by ${userMention(s.submitterId)}`,
        }));
    }

    return embed;
};
