import { APIMessage } from '@discordjs/core';
import {
    HeadingLevel,
    channelMention,
    heading,
    italic,
    spoiler,
    userMention,
} from '@discordjs/formatters';
import { Gremlin, GremlinsConfig } from '@prisma/client';
import { parse } from 'path';
import { api, prisma } from '../../../env.js';

export const postGremlin = async (
    config: GremlinsConfig,
    title: string,
): Promise<string | APIMessage> => {
    if (!config.dailyChannelId)
        return 'No daily channel ID set for this server.';

    const dailyChannel = await api.channels
        .get(config.dailyChannelId)
        .catch(() => {});
    if (!dailyChannel) return 'Invalid daily channel ID set for this server.';

    let gremlin;
    let imageBuffer;

    while (!imageBuffer) {
        gremlin = (
            (await prisma.$queryRaw`SELECT * FROM Gremlin WHERE guildId = ${config.guildId} ORDER BY RANDOM() LIMIT 1`) as Gremlin[]
        )[0];

        if (!gremlin) return 'No gremlins available.';

        const res = await fetch(gremlin.imageUrl);
        if (!res.ok) {
            // TODO: handle this better
            if (res.status === 404)
                await prisma.gremlin.delete({
                    where: { id: gremlin.id },
                });
            continue;
        }

        imageBuffer = Buffer.from(await res.arrayBuffer());
    }

    if (!gremlin) return 'No gremlins available.';
    if (!imageBuffer) return 'No valid gremlins available.';

    const content = [];
    content.push(heading(title));
    if (gremlin.description) {
        content.push(heading(gremlin.description, HeadingLevel.Two));
    }
    content.push(italic(`submitted by ${userMention(gremlin.submitterId)}`));
    if (config.submissionsChannelId) {
        content.push(
            spoiler(
                `Submit your gremlins in ${channelMention(config.submissionsChannelId)}`,
            ),
        );
    }

    const imagePathName = new URL(gremlin.imageUrl).pathname;
    const imageName = parse(imagePathName).base;

    const message = await api.channels.createMessage(config.dailyChannelId!, {
        content: content.join('\n'),
        files: [
            {
                name: imageName,
                data: imageBuffer,
            },
        ],
    });

    await prisma.gremlin.delete({
        where: {
            id: gremlin.id,
        },
    });

    return message;
};
