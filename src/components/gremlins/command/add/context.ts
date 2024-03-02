import {
    ApplicationCommandType,
    ComponentType,
    MessageFlags,
} from '@discordjs/core';
import { prisma } from '../../../../env.js';
import { MessageCommand } from '../../../data.js';
import { SUBMISSION_EMOJI } from '../constants.js';
import addQuote from './add-quote/index.js';

export default {
    data: {
        type: ApplicationCommandType.Message,
        name: 'Add Gremlin',
        default_member_permissions: '0',
        dm_permission: false,
    },
    async execute({ data: interaction, api }) {
        const messageId = interaction.data.target_id;
        const message = interaction.data.resolved.messages[messageId]!;

        const attachment = message.attachments[0];
        if (!attachment || !attachment.content_type?.startsWith('image')) {
            await api.interactions.reply(interaction.id, interaction.token, {
                content:
                    "This message doesn't have an image attachment as its first attachment.",
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        await api.interactions.defer(interaction.id, interaction.token, {
            flags: MessageFlags.Ephemeral,
        });

        const existing = await prisma.gremlin.findFirst({
            where: {
                channelId: interaction.channel.id,
                messageId: message.id,
            },
        });
        if (existing) {
            await api.interactions.editReply(
                interaction.application_id,
                interaction.token,
                {
                    content: 'This gremlin has already been submitted.',
                },
            );
            return;
        }

        const gremlin = await prisma.gremlin.create({
            data: {
                guildId: interaction.guild_id!,
                channelId: interaction.channel.id,
                messageId: message.id,
                submitterId: interaction.member!.user.id,
                imageUrl: attachment.url,
                quote: message.content ? `"${message.content}"` : null,
            },
        });

        await api.interactions.editReply(
            interaction.application_id,
            interaction.token,
            {
                content: `Gremlin added. ${gremlin.quote ? '' : 'No quote attached.'}`,
                components: gremlin.quote
                    ? undefined
                    : [
                          {
                              type: ComponentType.ActionRow,
                              components: [
                                  addQuote.stateful(gremlin.id.toString()),
                              ],
                          },
                      ],
            },
        );

        await api.channels.addMessageReaction(
            gremlin.channelId,
            gremlin.messageId,
            SUBMISSION_EMOJI,
        );
    },
} satisfies MessageCommand;
