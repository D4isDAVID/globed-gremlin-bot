import { messageLink } from '@discordjs/formatters';
import { Gremlin, GremlinsConfig } from '@prisma/client';
import { api, prisma } from '../../../env.js';
import { getMessageContentUrls } from './message-content-urls.js';

async function deleteGremlins(gremlin: Gremlin) {
    console.log(
        [
            `Deleting gremlin(s) due to 404:`,
            `\tGuild ID: ${gremlin.guildId}`,
            `\tMessage Link: ${messageLink(gremlin.channelId, gremlin.messageId)}`,
        ].join('\n'),
    );

    await prisma.gremlin.deleteMany({
        where: {
            channelId: gremlin.channelId,
            messageId: gremlin.messageId,
        },
    });
}

export async function fetchRandomGremlin(config: GremlinsConfig) {
    let gremlin;
    let contentBuffer;

    while (!contentBuffer) {
        const count = await prisma.gremlin.count();
        gremlin = await prisma.gremlin.findFirst({
            where: { guildId: config.guildId },
            skip: Math.floor(Math.random() * count),
        });

        if (!gremlin) return 'No gremlins available.';

        let res = await fetch(gremlin.contentUrl);
        if (!res.ok) {
            const newUrls = await api.channels
                .getMessage(gremlin.channelId, gremlin.messageId)
                .then(getMessageContentUrls)
                .catch(() => {});

            if (!newUrls) {
                await deleteGremlins(gremlin);
                continue;
            }

            gremlin.contentUrl = newUrls[0]!;
            res = await fetch(gremlin.contentUrl);

            if (!res.ok) {
                await deleteGremlins(gremlin);
                continue;
            }

            await prisma.gremlin.deleteMany({
                where: {
                    id: { not: gremlin.id },
                    channelId: gremlin.channelId,
                    messageId: gremlin.messageId,
                },
            });
        }

        contentBuffer = Buffer.from(await res.arrayBuffer());
    }

    if (!gremlin) return 'No gremlins available.';
    if (!contentBuffer) return 'No valid gremlins available.';

    return { gremlin, contentBuffer };
}
