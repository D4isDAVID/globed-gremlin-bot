import { messageLink } from '@discordjs/formatters';
import { GremlinsConfig } from '@prisma/client';
import { prisma } from '../../../env.js';

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

        const res = await fetch(gremlin.contentUrl);
        if (!res.ok) {
            // TODO: handle this better
            if (res.status === 404) {
                console.log(
                    [
                        `Deleting gremlin with ID ${gremlin.id} due to 404:`,
                        `\tGuild ID: ${gremlin.guildId}`,
                        `\tMessage Link: ${messageLink(gremlin.channelId, gremlin.messageId)}`,
                        `\t404 Content URL: ${gremlin.contentUrl}`,
                    ].join('\n'),
                );

                await prisma.gremlin.delete({
                    where: { id: gremlin.id },
                });
            }
            continue;
        }

        contentBuffer = Buffer.from(await res.arrayBuffer());
    }

    if (!gremlin) return 'No gremlins available.';
    if (!contentBuffer) return 'No valid gremlins available.';

    return { gremlin, contentBuffer };
}
