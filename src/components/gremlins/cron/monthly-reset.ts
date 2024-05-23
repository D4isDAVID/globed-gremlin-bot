import { Snowflake } from '@discordjs/core';
import { Prisma } from '@prisma/client';
import { ScheduledTask, schedule } from 'node-cron';
import { prisma } from '../../../env.js';
import { isLastDayOfMonth } from '../utils/is-last-day-of-month.js';

const tasks = new Map<Snowflake, ScheduledTask>();

export const deleteMonthlyResetGremlinTask = (guildId: Snowflake) => {
    tasks.get(guildId)?.stop();
    tasks.delete(guildId);
};

export const createMonthlyResetGremlinTask = async (guildId: Snowflake) => {
    deleteMonthlyResetGremlinTask(guildId);

    const config = await prisma.gremlinsConfig.findFirst({
        where: { guildId },
        select: {
            monthlyResetHour: true,
            monthlyResetMinute: true,
        },
    });

    if (!config) return;

    const task = schedule(
        `${config.monthlyResetMinute} ${config.monthlyResetHour} 28-31 * *`,
        async () => {
            const config = await prisma.gremlinsConfig.findFirst({
                where: { guildId },
            });

            if (!config) {
                deleteMonthlyResetGremlinTask(guildId);
                return;
            }

            if (!config.monthlyReset) return;
            if (!isLastDayOfMonth(new Date())) return;

            const id = (
                await prisma.gremlin.findMany({
                    select: { id: true },
                    orderBy: { id: 'desc' },
                    skip: config.monthlyResetKeep - 1,
                    take: 1,
                })
            )?.[0]?.id;

            const args: { where: Prisma.GremlinWhereInput } | undefined = id
                ? { where: { id: { lt: id } } }
                : undefined;

            await prisma.gremlin.deleteMany(args);
        },
        {
            timezone: 'Etc/GMT',
        },
    );

    task.start();
    tasks.set(guildId, task);
};
