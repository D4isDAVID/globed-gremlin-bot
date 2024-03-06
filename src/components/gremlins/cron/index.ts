import { Snowflake } from '@discordjs/core';
import {
    HeadingLevel,
    channelMention,
    heading,
    italic,
    spoiler,
    userMention,
} from '@discordjs/formatters';
import { Gremlin } from '@prisma/client';
import { ScheduledTask, schedule } from 'node-cron';
import { parse } from 'node:path';
import { URL } from 'node:url';
import { api, prisma } from '../../../env.js';

const tasks = new Map<Snowflake, ScheduledTask>();

export const deleteDailyGremlinTask = (guildId: Snowflake) => {
    tasks.get(guildId)?.stop();
    tasks.delete(guildId);
};

export const createDailyGremlinTask = async (guildId: Snowflake) => {
    deleteDailyGremlinTask(guildId);

    const hour = (
        await prisma.gremlinsConfig.findFirst({
            where: {
                guildId,
            },
            select: {
                dailyGmtHour: true,
            },
        })
    )?.dailyGmtHour;

    if (typeof hour !== 'number') return;

    const task = schedule(
        `0 ${hour} * * *`,
        async () => {
            const config = await prisma.gremlinsConfig.findFirst({
                where: {
                    guildId,
                },
            });

            if (!config) {
                deleteDailyGremlinTask(guildId);
                return;
            }
            if (!config.dailyChannelId) return;

            const dailyChannel = await api.channels
                .get(config.dailyChannelId)
                .catch(() => {});
            if (!dailyChannel) return;

            let gremlin;
            let imageBuffer;

            while (!imageBuffer) {
                gremlin = (
                    (await prisma.$queryRaw`SELECT * FROM Gremlin WHERE guildId = ${guildId} ORDER BY RANDOM() LIMIT 1`) as Gremlin[]
                )[0];

                if (!gremlin) return;

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

            if (!gremlin) return;
            if (!imageBuffer) return;

            const content = [];
            content.push(heading(`Gremlin of the Day #${config.dailyDay}`));
            if (gremlin.description) {
                content.push(heading(gremlin.description, HeadingLevel.Two));
            }
            content.push(
                italic(`submitted by ${userMention(gremlin.submitterId)}`),
            );
            if (config.submissionsChannelId) {
                content.push(
                    spoiler(
                        `Submit your gremlins in ${channelMention(config.submissionsChannelId)}`,
                    ),
                );
            }

            await prisma.gremlin.delete({
                where: {
                    id: gremlin.id,
                },
            });

            const imagePathName = new URL(gremlin.imageUrl).pathname;
            const imageName = parse(imagePathName).base;

            await api.channels.createMessage(dailyChannel.id, {
                content: content.join('\n'),
                files: [
                    {
                        name: imageName,
                        data: imageBuffer,
                    },
                ],
            });

            await prisma.gremlinsConfig.update({
                where: { guildId },
                data: {
                    dailyDay: config.dailyDay + 1,
                },
            });
        },
        {
            timezone: 'Etc/GMT',
        },
    );

    task.start();
    tasks.set(guildId, task);
};
