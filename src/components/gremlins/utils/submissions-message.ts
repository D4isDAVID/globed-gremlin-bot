import { channelMention } from '@discordjs/formatters';
import { GremlinsConfig } from '@prisma/client';

export function getSubmissionsMessage(config: GremlinsConfig) {
    return config.submissionsChannelId
        ? `Submit your gremlins in ${channelMention(config.submissionsChannelId)}`
        : null;
}
