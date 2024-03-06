import {
    APITextChannel,
    ChannelType,
    RESTGetAPIChannelMessagesQuery,
} from '@discordjs/core';
import { exit, stdout } from 'process';
import prompts from 'prompts';
import { clearLine, moveCursor } from 'readline';
import { SUBMISSION_EMOJI } from './components/gremlins/command/constants.js';
import { getMessageImageUrls } from './components/gremlins/utils/message-image-urls.js';
import { api, prisma } from './env.js';

const { guildId } = (await prompts({
    type: 'text',
    name: 'guildId',
    message: 'What is the ID of the server to scrape?',
    validate: async (value) =>
        await api.guilds
            .get(value)
            .then(() => true)
            .catch((e) => e.message),
})) as { guildId: string };
if (!guildId) exit(1);

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
                return true;
            })
            .catch((e) => e.message),
})) as { channelId: string };
if (!channelId) exit(1);

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
                return true;
            })
            .catch((e) => e.message),
})) as { dailyChannelId: string };
if (!dailyChannelId) exit(1);

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

let batch = 1;
let count = 0;
let prevMessageId = null;
let oldImageUrls = new Set<string>();

while (true) {
    const query: RESTGetAPIChannelMessagesQuery = { limit: 100 };
    if (prevMessageId) query.before = prevMessageId;

    const messages = await api.channels.getMessages(dailyChannelId, query);
    if (messages.length === 0) break;

    for await (const message of messages) {
        if (!message.content.match(/gremlin of the day #[0-9]+/i)) continue;

        const urls = await getMessageImageUrls(message);
        for (const url of urls) oldImageUrls.add(url);
    }

    prevMessageId = messages[messages.length - 1]!.id;
}

console.log(`${oldImageUrls.size} unique old daily gremlins found.`);
stdout.write('Scraping... ');

prevMessageId = null;
while (true) {
    const query: RESTGetAPIChannelMessagesQuery = { limit: 100 };
    if (prevMessageId) query.before = prevMessageId;

    const messages = await api.channels.getMessages(channelId, query);
    if (messages.length === 0) break;

    const batchMessage = `Batch ${batch}... `;
    stdout.write(batchMessage);

    for await (const message of messages) {
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

        const urls = await getMessageImageUrls(message);

        let filteredContent = message.content;
        for (const url of urls) {
            filteredContent = filteredContent.replaceAll(url, '');
        }
        const quote = filteredContent.trim().split('\n')[0];
        const description = quote ? `"${quote}"` : null;

        for await (const url of urls) {
            if (oldImageUrls.has(url)) continue;

            const existing = await prisma.gremlin.findFirst({
                where: {
                    channelId,
                    messageId: message.id,
                    imageUrl: url,
                },
            });
            if (existing) continue;

            stdout.write(message.id);

            await prisma.gremlin.create({
                data: {
                    guildId,
                    channelId,
                    messageId: message.id,
                    submitterId: message.author.id,
                    imageUrl: url,
                    description,
                },
            });

            count++;

            moveCursor(stdout, -message.id.length, 0);
            clearLine(stdout, 1);
        }
    }

    prevMessageId = messages[messages.length - 1]!.id;
    batch++;

    moveCursor(stdout, -batchMessage.length, 0);
    clearLine(stdout, 1);
}

console.log(`${count} gremlins added.`);
exit(0);
