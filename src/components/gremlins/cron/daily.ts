import { Snowflake } from '@discordjs/core';
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
        },
        {
            timezone: 'Etc/GMT',
        },
    );

    task.start();
    tasks.set(guildId, task);
};
