import { GatewayDispatchEvents } from '@discordjs/core';
import { prisma } from '../../../env.js';
import { GatewayEvent } from '../../data.js';
import { createDailyGremlinTask } from './daily.js';
import { createMonthlyResetGremlinTask } from './monthly-reset.js';
import { createMonthlyGremlinTask } from './monthly.js';

export default {
    name: GatewayDispatchEvents.Ready,
    type: 'on',
    async execute({ data: bot }) {
        for (const guild of bot.guilds) {
            const config = await prisma.gremlinsConfig.findFirst({
                where: { guildId: guild.id },
            });

            if (!config) {
                await prisma.gremlinsConfig.create({
                    data: { guildId: guild.id },
                });
            }

            createDailyGremlinTask(guild.id);
            createMonthlyGremlinTask(guild.id);
            createMonthlyResetGremlinTask(guild.id);
        }
    },
} satisfies GatewayEvent<GatewayDispatchEvents.Ready>;
