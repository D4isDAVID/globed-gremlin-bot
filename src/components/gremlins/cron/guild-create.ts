import { GatewayDispatchEvents } from '@discordjs/core';
import { prisma } from '../../../env.js';
import { GatewayEvent } from '../../data.js';
import { createDailyGremlinTask } from './daily.js';

export default {
    name: GatewayDispatchEvents.GuildCreate,
    type: 'on',
    async execute({ data: guild }) {
        const config = await prisma.gremlinsConfig.findFirst({
            where: { guildId: guild.id },
        });

        if (!config) {
            await prisma.gremlinsConfig.create({
                data: { guildId: guild.id },
            });
        }

        createDailyGremlinTask(guild.id);
    },
} satisfies GatewayEvent<GatewayDispatchEvents.GuildCreate>;
