import {
    APIMessage,
    RESTGetAPIChannelMessagesQuery,
    Snowflake,
} from '@discordjs/core';
import { api } from '../../../env.js';
import { getIndividualReactionCount } from './individual-reaction-count.js';
import { getMessageContentUrls } from './message-content-urls.js';

export async function extractTopMonthlyGremlins(
    channelId: Snowflake,
    gremlinCount: number,
) {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const reactionCounts: {
        message: APIMessage;
        submitterId: Snowflake;
        contentUrls: string[];
        reactions: number;
    }[] = [];

    let prevMessageId = null;
    let reachedMonth = false;
    while (!reachedMonth) {
        const query: RESTGetAPIChannelMessagesQuery = { limit: 100 };
        if (prevMessageId) query.before = prevMessageId;

        const messages = await api.channels.getMessages(channelId, query);
        if (messages.length === 0) break;

        prevMessageId = messages[messages.length - 1]!.id;
        await Promise.all(
            messages.map(async (message) => {
                if (new Date(message.timestamp) < firstDayOfMonth) {
                    reachedMonth = true;
                    return;
                }

                const submitterId = /submitted by <@([0-9]*)>/.exec(
                    message.content,
                )?.[1];
                if (!submitterId) return;

                const contentUrls = await getMessageContentUrls(message);
                if (contentUrls.length === 0) return;

                reactionCounts.push({
                    message,
                    submitterId,
                    contentUrls,
                    reactions: await getIndividualReactionCount(message),
                });
            }),
        );
    }

    return reactionCounts
        .sort((a, b) => b.reactions - a.reactions)
        .slice(0, gremlinCount);
}
