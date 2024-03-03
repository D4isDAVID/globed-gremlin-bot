import {
    ActivityType,
    GatewayDispatchEvents,
    PresenceUpdateStatus,
} from '@discordjs/core';
import { client } from '../../env.js';
import { Component, GatewayEvent } from '../data.js';

export default {
    gatewayEvents: [
        {
            name: GatewayDispatchEvents.Ready,
            type: 'on',
            async execute({ shardId }) {
                await client.updatePresence(shardId, {
                    status: PresenceUpdateStatus.Online,
                    afk: false,
                    since: null,
                    activities: [
                        {
                            type: ActivityType.Watching,
                            name: 'silly cat videos :3',
                        },
                    ],
                });
            },
        } satisfies GatewayEvent<GatewayDispatchEvents.Ready>,
    ],
} satisfies Component;
