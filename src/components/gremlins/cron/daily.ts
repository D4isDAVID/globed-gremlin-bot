import { Snowflake } from '@discordjs/core';
import { Prisma } from '@prisma/client';
import { ScheduledTask, schedule } from 'node-cron';
import { prisma } from '../../../env.js';
import { postGremlin } from '../utils/post-gremlin.js';

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

            await postGremlin(config, `Gremlin of the Day #${config.dailyDay}`);

            await prisma.gremlinsConfig.update({
                where: { guildId },
                data: {
                    dailyDay: config.dailyDay + 1,
                },
            });

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
