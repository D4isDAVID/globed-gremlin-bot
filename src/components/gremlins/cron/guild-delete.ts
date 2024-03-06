import { GatewayDispatchEvents } from '@discordjs/core';
import { GatewayEvent } from '../../data.js';
import { deleteDailyGremlinTask } from './daily.js';

export default {
    name: GatewayDispatchEvents.GuildDelete,
    type: 'on',
    async execute({ data: guild }) {
        deleteDailyGremlinTask(guild.id);
    },
} satisfies GatewayEvent<GatewayDispatchEvents.GuildDelete>;
