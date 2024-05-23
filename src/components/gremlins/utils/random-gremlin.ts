import { Gremlin, GremlinsConfig } from '@prisma/client';
import { prisma } from '../../../env.js';

export async function fetchRandomGremlin(config: GremlinsConfig) {
    let gremlin;
    let contentBuffer;

    while (!contentBuffer) {
        gremlin = (
            (await prisma.$queryRaw`SELECT * FROM Gremlin WHERE guildId = ${config.guildId} ORDER BY RANDOM() LIMIT 1`) as Gremlin[]
        )[0];

        if (!gremlin) return 'No gremlins available.';

        const res = await fetch(gremlin.contentUrl);
        if (!res.ok) {
            // TODO: handle this better
            if (res.status === 404)
                await prisma.gremlin.delete({
                    where: { id: gremlin.id },
                });
            continue;
        }

        contentBuffer = Buffer.from(await res.arrayBuffer());
    }

    if (!gremlin) return 'No gremlins available.';
    if (!contentBuffer) return 'No valid gremlins available.';

    return { gremlin, contentBuffer };
}
