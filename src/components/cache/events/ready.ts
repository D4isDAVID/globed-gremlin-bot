import { APIUser, GatewayDispatchEvents } from '@discordjs/core';
import { GatewayEvent } from '../../data.js';

let user: APIUser | null = null;
export const getBotUser = () => user;

export default {
    name: GatewayDispatchEvents.Ready,
    type: 'once',
    async execute({ data }) {
        user = data.user;
    },
} satisfies GatewayEvent<GatewayDispatchEvents.Ready>;
