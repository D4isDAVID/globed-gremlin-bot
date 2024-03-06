import { ApplicationCommandOptionType, MessageFlags } from '@discordjs/core';
import {
    HeadingLevel,
    channelMention,
    heading,
    italic,
    messageLink,
    spoiler,
    userMention,
} from '@discordjs/formatters';
import { Gremlin } from '@prisma/client';
import { parse } from 'path';
import { prisma } from '../../../env.js';
import { Subcommand } from '../../subcommands.js';

export default {
    data: {
        type: ApplicationCommandOptionType.Subcommand,
        name: 'bonus-gremlin',
        description: 'Post a bonus gremlin.',
    },
    async execute({ data: interaction, api }) {
        const guildId = interaction.guild_id!;

        await api.interactions.defer(interaction.id, interaction.token, {
            flags: MessageFlags.Ephemeral,
        });

        const config = (await prisma.gremlinsConfig.findFirst({
            where: {
                guildId,
            },
        }))!;

        if (!config.dailyChannelId) {
            await api.interactions.editReply(
                interaction.application_id,
                interaction.token,
                {
                    content: 'No daily channel ID set in config.',
                },
            );
            return;
        }

        const dailyChannel = await api.channels
            .get(config.dailyChannelId)
            .catch(() => {});
        if (!dailyChannel) {
            await api.interactions.editReply(
                interaction.application_id,
                interaction.token,
                {
                    content: 'Invalid daily channel ID set in config.',
                },
            );
            return;
        }

        let gremlin;
        let imageBuffer;

        while (!imageBuffer) {
            gremlin = (
                (await prisma.$queryRaw`SELECT * FROM Gremlin WHERE guildId = ${guildId} ORDER BY RANDOM() LIMIT 1`) as Gremlin[]
            )[0];

            if (!gremlin) {
                await api.interactions.editReply(
                    interaction.application_id,
                    interaction.token,
                    {
                        content: 'No gremlins available.',
                    },
                );
                return;
            }

            const res = await fetch(gremlin.imageUrl);
            if (!res.ok) {
                // TODO: handle this better
                if (res.status === 404)
                    await prisma.gremlin.delete({
                        where: { id: gremlin.id },
                    });
                continue;
            }

            imageBuffer = Buffer.from(await res.arrayBuffer());
        }

        if (!gremlin) return;
        if (!imageBuffer) return;

        const content = [];
        content.push(heading(`Bonus Gremlin!`));
        if (gremlin.description) {
            content.push(heading(gremlin.description, HeadingLevel.Two));
        }
        content.push(
            italic(`submitted by ${userMention(gremlin.submitterId)}`),
        );
        if (config.submissionsChannelId) {
            content.push(
                spoiler(
                    `Submit your gremlins in ${channelMention(config.submissionsChannelId)}`,
                ),
            );
        }

        await prisma.gremlin.delete({
            where: {
                id: gremlin.id,
            },
        });

        const imagePathName = new URL(gremlin.imageUrl).pathname;
        const imageName = parse(imagePathName).base;

        const message = await api.channels.createMessage(dailyChannel.id, {
            content: content.join('\n'),
            files: [
                {
                    name: imageName,
                    data: imageBuffer,
                },
            ],
        });

        await api.interactions.editReply(
            interaction.application_id,
            interaction.token,
            {
                content: `Forcefully posted a daily in ${messageLink(message.channel_id, message.id)}.`,
                flags: MessageFlags.SuppressEmbeds,
            },
        );
    },
} satisfies Subcommand;
