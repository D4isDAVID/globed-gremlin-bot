import { RESTJSONErrorCodes, Snowflake } from '@discordjs/core';
import { DiscordAPIError } from '@discordjs/rest';
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
        where: { guildId },
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
                where: { guildId },
            });

            if (!config) {
                deleteDailyGremlinTask(guildId);
                return;
            }

            if (!config.dailyChannelId) return;

            const result = await fetchRandomGremlin(config);
            if (typeof result === 'string') return;

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
        },
        {
            timezone: 'Etc/GMT',
        },
    );

    task.start();
    tasks.set(guildId, task);
};
