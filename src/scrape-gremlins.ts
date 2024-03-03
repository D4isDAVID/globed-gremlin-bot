import {
    APITextChannel,
    ChannelType,
    RESTGetAPIChannelMessagesQuery,
} from '@discordjs/core';
import { exit, stdout } from 'process';
import prompts from 'prompts';
import { clearLine, moveCursor } from 'readline';
import { SUBMISSION_EMOJI } from './components/gremlins/command/constants.js';
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
while (true) {
    const { userId } = (await prompts({
        type: 'text',
        name: 'userId',
        message: 'What is the ID of a user that added the gremlins?',
        validate: (value) =>
            userIds.length === 0 && !value
                ? 'Must provide at least 1 ID'
                : true,
    })) as { userId: string };
    if (!userId) {
        const { valid } = (await prompts({
            type: 'confirm',
            name: 'valid',
            message: `Are these valid user IDs? (${userIds.join(', ')})`,
            initial: true,
        })) as { valid: boolean };
        if (valid) break;
        continue;
    }
    userIds.push(userId);
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

        const attachment = message.attachments[0];
        const embed = message.embeds[0];

        if (
            (!attachment || !attachment.content_type?.startsWith('image')) &&
            (!embed || !embed.url)
        )
            continue;

        oldImageUrls.add(attachment?.url || embed!.url!);
    }

    prevMessageId = messages[messages.length - 1]!.id;
}

console.log(`${oldImageUrls.size} old daily gremlins found.`);
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

        const attachment = message.attachments[0];
        if (!attachment || !attachment.content_type?.startsWith('image'))
            continue;

        if (oldImageUrls.has(attachment.url)) continue;

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

        const existing = await prisma.gremlin.findFirst({
            where: {
                channelId,
                messageId: message.id,
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
                imageUrl: attachment.url,
                quote: message.content ? `"${message.content}"` : null,
            },
        });

        count++;

        moveCursor(stdout, -message.id.length, 0);
        clearLine(stdout, 1);
    }

    prevMessageId = messages[messages.length - 1]!.id;
    batch++;

    moveCursor(stdout, -batchMessage.length, 0);
    clearLine(stdout, 1);
}

console.log(`${count} gremlins added.`);
exit(0);