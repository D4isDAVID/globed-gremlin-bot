import { APIEmbed, Snowflake } from '@discordjs/core';
import { messageLink } from '@discordjs/formatters';
import { prisma } from '../../../../env.js';
import { LIST_PAGE_SIZE } from '../constants.js';

export default async (
    page: number,
    totalPages: number,
    guildId: Snowflake,
): Promise<APIEmbed> => {
    const embed: APIEmbed = {
        color: 0xd0d0d0,
        title: 'Gremlins List',
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
            value: `${s.quote ? `${s.quote}\n` : ''}${messageLink(s.channelId, s.messageId)}`,
        }));
    }

    return embed;
};
