import { MessageFlags, Snowflake } from '@discordjs/core';
import {
    HeadingLevel,
    channelLink,
    heading,
    italic,
    messageLink,
    spoiler,
    userMention,
} from '@discordjs/formatters';
import { ScheduledTask, schedule } from 'node-cron';
import { parse } from 'path';
import { api, prisma } from '../../../env.js';
import { isLastDayOfMonth } from '../utils/is-last-day-of-month.js';
import { extractTopMonthlyGremlins } from '../utils/top-monthly-gremlins.js';

const tasks = new Map<Snowflake, ScheduledTask>();

export const deleteMonthlyGremlinTask = (guildId: Snowflake) => {
    tasks.get(guildId)?.stop();
    tasks.delete(guildId);
};

export const createMonthlyGremlinTask = async (guildId: Snowflake) => {
    deleteMonthlyGremlinTask(guildId);

    const config = await prisma.gremlinsConfig.findFirst({
        where: { guildId },
        select: {
            monthlyHour: true,
            monthlyMinute: true,
        },
    });

    if (!config) return;

    const task = schedule(
        `${config.monthlyMinute} ${config.monthlyHour} 28-31 * *`,
        async () => {
            const config = await prisma.gremlinsConfig.findFirst({
                where: { guildId },
            });

            if (!config) {
                deleteMonthlyGremlinTask(guildId);
                return;
            }

            if (config.monthlyGremlinCount <= 0) return;
            if (!isLastDayOfMonth(new Date())) return;
            if (!config.dailyChannelId) return;

            const topGremlins = await extractTopMonthlyGremlins(
                config.dailyChannelId,
                config.monthlyGremlinCount,
            );

            const monthName = new Date().toLocaleString('en-US', {
                month: 'long',
            });
            for await (const [
                i,
                { message, submitterId, contentUrls, reactions },
            ] of topGremlins.entries()) {
                if (i === 0) {
                    await api.channels.createMessage(config.dailyChannelId, {
                        content: heading(`Best of ${monthName}`),
                    });
                }

                const files = (
                    await Promise.all(
                        contentUrls.map(async (url) => {
                            const res = await fetch(url);
                            if (!res.ok) return null;
                            return {
                                name: parse(new URL(url).pathname).base,
                                data: Buffer.from(await res.arrayBuffer()),
                            };
                        }),
                    )
                ).filter(
                    (a): a is { name: string; data: Buffer } => a !== null,
                );

                const description = /^## (.*)$/m.exec(message.content)?.[1];

                const content: string[] = [];
                if (description) {
                    content.push(heading(description, HeadingLevel.Two));
                }
                content.push(
                    italic(
                        `submitted by ${userMention(submitterId)} in ${messageLink(message.channel_id, message.id)} with ${reactions} unique reaction${reactions === 1 ? '' : 's'}`,
                    ),
                );

                await api.channels.createMessage(config.dailyChannelId, {
                    content: content.join('\n'),
                    files,
                });

                if (i === topGremlins.length - 1) {
                    await api.channels.createMessage(config.dailyChannelId, {
                        content: spoiler(
                            `these gremlins were the most upvoted in ${monthName}${config.submissionsChannelId ? `, you can submit your gremlins in ${channelLink(message.channel_id)}` : ''}`,
                        ),
                        flags: MessageFlags.SuppressEmbeds,
                    });
                }
            }
        },
        {
            timezone: 'Etc/GMT',
        },
    );

    task.start();
    tasks.set(guildId, task);
};
