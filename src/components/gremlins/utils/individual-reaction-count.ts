import {
    APIMessage,
    RESTGetAPIChannelMessageReactionUsersQuery,
    Snowflake,
} from '@discordjs/core';
import { api } from '../../../env.js';

export async function getIndividualReactionCount(message: APIMessage) {
    if (!message.reactions) return 0;
    const users = new Set<Snowflake>();

    for await (const reaction of message.reactions) {
        let prevUserId = null;
        while (true) {
            const query: RESTGetAPIChannelMessageReactionUsersQuery = {
                limit: 100,
            };
            if (prevUserId) query.after = prevUserId;

            const reactions = await api.channels.getMessageReactions(
                message.channel_id,
                message.id,
                reaction.emoji.id
                    ? `${reaction.emoji.name}:${reaction.emoji.id}`
                    : reaction.emoji.name!,
                query,
            );
            if (reactions.length === 0) break;

            prevUserId = reactions[reactions.length - 1]!.id;
            reactions.forEach((r) => users.add(r.id));
        }
    }

    return users.size;
}
