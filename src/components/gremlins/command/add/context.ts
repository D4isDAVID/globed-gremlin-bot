import {
    ApplicationCommandType,
    ComponentType,
    MessageFlags,
    PermissionFlagsBits,
} from '@discordjs/core';
import { prisma } from '../../../../env.js';
import { MessageCommand } from '../../../data.js';
import { getMessageContentUrls } from '../../utils/message-content-urls.js';
import { SUBMISSION_EMOJI } from '../constants.js';
import editDescription from './edit-new-gremlin-description/index.js';

export default {
    data: {
        type: ApplicationCommandType.Message,
        name: 'Add gremlin',
        default_member_permissions: `${PermissionFlagsBits.ManageGuild}`,
        dm_permission: false,
    },
    async execute({ data: interaction, api }) {
        const messageId = interaction.data.target_id;
        const message = interaction.data.resolved.messages[messageId]!;

        if (message.author.bot) {
            await api.interactions.reply(interaction.id, interaction.token, {
                content:
                    "This command isn't allowed to be used on bot messages.",
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        await api.interactions.defer(interaction.id, interaction.token, {
            flags: MessageFlags.Ephemeral,
        });

        const urls = await getMessageContentUrls(message);
        if (urls.length === 0) {
            await api.interactions.editReply(
                interaction.application_id,
                interaction.token,
                {
                    content:
                        "This messages doesn't have any image/video attachments or embeds.",
                },
            );
            return;
        }

        let filteredContent = message.content;
        for (const url of urls) {
            filteredContent = filteredContent.replaceAll(url, '');
        }
        const quote = filteredContent.trim().split('\n')[0];
        const description = quote ? `"${quote}"` : null;

        let count = 0;
        for await (const url of urls) {
            const existing = await prisma.gremlin.findFirst({
                where: { contentUrl: url },
            });
            if (existing) continue;

            await prisma.gremlin.create({
                data: {
                    guildId: interaction.guild_id!,
                    channelId: interaction.channel.id,
                    messageId: message.id,
                    submitterId: message.author.id,
                    contentUrl: url,
                    description,
                },
            });

            count++;
        }

        if (count === 0) {
            await api.interactions.editReply(
                interaction.application_id,
                interaction.token,
                {
                    content: 'This gremlin is already submitted.',
                },
            );
            return;
        }

        await api.interactions.editReply(
            interaction.application_id,
            interaction.token,
            {
                content: `${count} gremlin${count === 1 ? '' : 's'} added with ${description ? `quote: ${description}` : 'no quote attached.'}`,
                components: [
                    {
                        type: ComponentType.ActionRow,
                        components: [editDescription.stateful(`${messageId}`)],
                    },
                ],
            },
        );

        await api.channels.addMessageReaction(
            interaction.channel.id,
            message.id,
            SUBMISSION_EMOJI,
        );
    },
} satisfies MessageCommand;
