import { RESTJSONErrorCodes, Snowflake } from '@discordjs/core';
import { DiscordAPIError } from '@discordjs/rest';
import { Prisma } from '@prisma/client';
import { ScheduledTask, schedule } from 'node-cron';
import { prisma } from '../../../env.js';
import { postAndDeleteGremlin } from '../utils/post-gremlin.js';
import { fetchRandomGremlin } from '../utils/random-gremlin.js';
import { getSubmissionsMessage } from '../utils/submissions-message.js';

const tasks = new Map<Snowflake, ScheduledTask>();

export const deleteDailyGremlinTask = (guildId: Snowflake) => {
    tasks.get(guildId)?.stop();
    tasks.delete(guildId);
};

export const createDailyGremlinTask = async (guildId: Snowflake) => {
    deleteDailyGremlinTask(guildId);

    const config = await prisma.gremlinsConfig.findFirst({
        where: {
            guildId,
        },
        select: {
            dailyHour: true,
            dailyMinute: true,
        },
    });

    if (!config) return;

    const task = schedule(
        `${config.dailyMinute} ${config.dailyHour} * * *`,
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

            const result = await fetchRandomGremlin(config);
            if (typeof result === 'object') {
                try {
                    await postAndDeleteGremlin(
                        config.dailyChannelId,
                        result.gremlin,
                        result.contentBuffer,
                        `Gremlin of the Day #${config.dailyDay}`,
                        getSubmissionsMessage(config),
                    );

                    await prisma.gremlinsConfig.update({
                        where: { guildId },
                        data: { dailyDay: config.dailyDay + 1 },
                    });
                } catch (e) {
                    if (
                        e instanceof DiscordAPIError &&
                        e.code === RESTJSONErrorCodes.UnknownChannel
                    ) {
                        return;
                    }

                    throw e;
                }
            }

            // Monthly reset
            const date = new Date();
            date.setDate(date.getDate() + 1);
            if (config.monthlyReset && date.getDate() === 1) {
                const id = (
                    await prisma.gremlin.findMany({
                        select: {
                            id: true,
                        },
                        orderBy: {
                            id: 'desc',
                        },
                        skip: config.monthlyResetKeep - 1,
                        take: 1,
                    })
                )?.[0]?.id;

                const args: { where: Prisma.GremlinWhereInput } | undefined = id
                    ? {
                          where: {
                              id: {
                                  lt: id,
                              },
                          },
                      }
                    : undefined;

                await prisma.gremlin.deleteMany(args);
            }
        },
        {
            timezone: 'Etc/GMT',
        },
    );

    task.start();
    tasks.set(guildId, task);
};
