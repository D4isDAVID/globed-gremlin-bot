import { GatewayDispatchEvents } from '@discordjs/core';
import { GatewayEvent } from '../../data.js';
import { sendPoll } from '../util/send-poll.js';

export const threadCreate = {
    name: GatewayDispatchEvents.ThreadCreate,
    type: 'on',
    async execute({ data: thread, api }) {
        if (!thread.newly_created) return;
        sendPoll(api, thread);
    },
} satisfies GatewayEvent<GatewayDispatchEvents.ThreadCreate>;
