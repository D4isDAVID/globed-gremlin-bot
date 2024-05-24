import { GatewayDispatchEvents } from '@discordjs/core';
import { GatewayEvent } from '../../data.js';
import { deleteDailyGremlinTask } from './daily.js';
import { deleteMonthlyResetGremlinTask } from './monthly-reset.js';
import { deleteMonthlyGremlinTask } from './monthly.js';

export default {
    name: GatewayDispatchEvents.GuildDelete,
    type: 'on',
    async execute({ data: guild }) {
        deleteDailyGremlinTask(guild.id);
        deleteMonthlyGremlinTask(guild.id);
        deleteMonthlyResetGremlinTask(guild.id);
    },
} satisfies GatewayEvent<GatewayDispatchEvents.GuildDelete>;
