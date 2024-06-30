import { APIMessage, MessageFlags, Snowflake } from '@discordjs/core';
import {
    HeadingLevel,
    heading,
    italic,
    spoiler,
    userMention,
} from '@discordjs/formatters';
import { Gremlin } from '@prisma/client';
import { parse } from 'path';
import { api, prisma } from '../../../env.js';

export async function postAndDeleteGremlin(
    channelId: Snowflake,
    gremlin: Gremlin,
    contentBuffer: Buffer,
    title: string,
    appendix?: string | null,
): Promise<APIMessage> {
    const content: string[] = [heading(title)];

    if (gremlin.description) {
        content.push(heading(gremlin.description, HeadingLevel.Two));
    }

    content.push(italic(`submitted by ${userMention(gremlin.submitterId)}`));

    if (appendix) {
        content.push(spoiler(appendix));
    }

    const contentPathName = new URL(gremlin.contentUrl).pathname;
    const contentName = parse(contentPathName).base;

    const message = await api.channels.createMessage(channelId!, {
        content: content.join('\n'),
        files: [
            {
                name: contentName,
                data: contentBuffer,
            },
        ],
        flags: MessageFlags.SuppressEmbeds,
    });

    await prisma.gremlin.delete({
        where: { id: gremlin.id },
    });

    return message;
}
