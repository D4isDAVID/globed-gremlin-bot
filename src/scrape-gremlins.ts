import {
    APITextChannel,
    ChannelType,
    RESTGetAPIChannelMessagesQuery,
} from '@discordjs/core';
import { exit, stdout } from 'process';
import prompts from 'prompts';
import { clearLine, moveCursor } from 'readline';
import { SUBMISSION_EMOJI } from './components/gremlins/command/constants.js';
import { getMessageContentUrls } from './components/gremlins/utils/message-content-urls.js';
import { api, prisma } from './env.js';

let guildName;
const { guildId } = (await prompts({
    type: 'text',
    name: 'guildId',
    message: 'What is the ID of the server to scrape?',
    validate: async (value) =>
        await api.guilds
            .get(value)
            .then((g) => {
                guildName = g.name;
                return true;
            })
            .catch((e) => e.message),
})) as { guildId: string };
if (!guildId) exit(1);
console.log(`Using server: ${guildName}`);

let channelName;
const { channelId } = (await prompts({
    type: 'text',
    name: 'channelId',
    message: 'What is the ID of the channel to scrape?',
    validate: async (value) =>
        await api.channels
            .get(value)
            .then((channel) => {
                if (
                    ![
                        ChannelType.AnnouncementThread,
                        ChannelType.GuildAnnouncement,
                        ChannelType.GuildText,
                        ChannelType.PrivateThread,
                        ChannelType.PublicThread,
                    ].includes(channel.type)
                )
                    return false;
                if ((channel as APITextChannel).guild_id !== guildId)
                    return false;
                channelName = channel.name;
                return true;
            })
            .catch((e) => e.message),
})) as { channelId: string };
if (!channelId) exit(1);
console.log(`Using channel: ${channelName}`);

let dailyChannelName;
const { dailyChannelId } = (await prompts({
    type: 'text',
    name: 'dailyChannelId',
    message: 'What is the ID of the old daily gremlins channel?',
    validate: async (value) =>
        await api.channels
            .get(value)
            .then((channel) => {
                if (
                    ![
                        ChannelType.AnnouncementThread,
                        ChannelType.GuildAnnouncement,
                        ChannelType.GuildText,
                        ChannelType.PrivateThread,
                        ChannelType.PublicThread,
                    ].includes(channel.type)
                )
                    return false;
                if ((channel as APITextChannel).guild_id !== guildId)
                    return false;
                dailyChannelName = channel.name;
                return true;
            })
            .catch((e) => e.message),
})) as { dailyChannelId: string };
if (!dailyChannelId) exit(1);
console.log(`Using daily channel: ${dailyChannelName}`);

const userIds = [];
const userNames = [];
while (true) {
    const { userId } = (await prompts({
        type: 'text',
        name: 'userId',
        message: 'What is the ID of a user that added the gremlins?',
        validate: (value) => {
            if (!value)
                return userIds.length !== 0 || 'Must provide at least 1 ID';

            return api.users
                .get(value)
                .then(() => true)
                .catch((e) => e.message);
        },
    })) as { userId: string };

    if (!userId) {
        if (userIds.length === 0) break;
        const { valid } = (await prompts(
            {
                type: 'confirm',
                name: 'valid',
                message: `Are these valid users? (${userNames.join(', ')})`,
                initial: false,
            },
            {
                onCancel: () => exit(1),
            },
        )) as { valid: boolean };
        if (valid) break;
        continue;
    }

    const user = await api.users.get(userId);
    userIds.push(user.id);
    userNames.push(user.username);
}
if (userIds.length === 0) exit(1);

const now = new Date();
const firstDayOfMonth = new Date(now.getUTCFullYear(), now.getUTCMonth(), 1);
const { onlyCurrentMonth } = (await prompts(
    {
        type: 'confirm',
        name: 'onlyCurrentMonth',
        message: `Only scrape old gremlins for the current month? (${firstDayOfMonth.getUTCMonth() + 1})`,
        initial: true,
    },
    {
        onCancel: () => exit(1),
    },
)) as { onlyCurrentMonth: boolean };

let batch = 1;
let count = 0;
let dailyMessageCount = 0;
let prevMessageId = null;
let oldContentUrls = new Set<string>();

while (true) {
    const query: RESTGetAPIChannelMessagesQuery = { limit: 100 };
    if (prevMessageId) query.before = prevMessageId;

    const messages = await api.channels.getMessages(dailyChannelId, query);
    dailyMessageCount += messages.length;
    if (messages.length === 0) break;

    for await (const message of messages) {
        const urls = await getMessageContentUrls(message);
        for (const url of urls) oldContentUrls.add(url);
    }

    prevMessageId = messages[messages.length - 1]!.id;
}

console.log(
    `Found ${oldContentUrls.size} unique old daily gremlins out of ${dailyMessageCount} messages.`,
);
stdout.write('Scraping... ');

prevMessageId = null;
let messageCount = 0;
let reachedMonth = false;
while (!reachedMonth) {
    const query: RESTGetAPIChannelMessagesQuery = { limit: 100 };
    if (prevMessageId) query.before = prevMessageId;

    const messages = await api.channels.getMessages(channelId, query);
    messageCount += messages.length;
    if (messages.length === 0) break;

    const batchMessage = `Batch ${batch} / ${messageCount} messages... `;
    stdout.write(batchMessage);

    let countMessage = `${count} gremlins`;
    stdout.write(countMessage);

    for await (const message of messages) {
        if (onlyCurrentMonth && new Date(message.timestamp) < firstDayOfMonth) {
            reachedMonth = true;
            break;
        }
        if (!message.reactions?.length) continue;

        let submitted = false;
        for await (const userId of userIds) {
            const reaction = (
                await api.channels.getMessageReactions(
                    channelId,
                    message.id,
                    SUBMISSION_EMOJI,
                    {
                        after: `${BigInt(userId) - 1n}`,
                        limit: 1,
                    },
                )
            )[0];

            if (!reaction) continue;
            if (reaction.id !== userId) continue;

            submitted = true;
            break;
        }
        if (!submitted) continue;

        const urls = await getMessageContentUrls(message);

        let filteredContent = message.content;
        for (const url of urls) {
            filteredContent = filteredContent.replaceAll(url, '');
        }
        const quote = filteredContent.trim().split('\n')[0];
        const description = quote ? `"${quote}"` : null;

        for await (const url of urls) {
            if (oldContentUrls.has(url)) continue;

            const existing = await prisma.gremlin.findFirst({
                where: {
                    channelId,
                    messageId: message.id,
                    contentUrl: url,
                },
            });
            if (existing) continue;

            await prisma.gremlin.create({
                data: {
                    guildId,
                    channelId,
                    messageId: message.id,
                    submitterId: message.author.id,
                    contentUrl: url,
                    description,
                },
            });

            count++;

            moveCursor(stdout, -countMessage.length, 0);
            clearLine(stdout, 1);
            countMessage = `${count} gremlins`;
            stdout.write(countMessage);
        }
    }
    moveCursor(stdout, -countMessage.length, 0);
    clearLine(stdout, 1);

    prevMessageId = messages[messages.length - 1]!.id;
    batch++;

    moveCursor(stdout, -batchMessage.length, 0);
    clearLine(stdout, 1);
}

console.log('Done!');
console.log(`Added ${count} gremlins out of ${messageCount} messages.`);
exit(0);
