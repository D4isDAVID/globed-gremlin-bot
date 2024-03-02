import {
    ApplicationCommandOptionType,
    ComponentType,
    MessageFlags,
} from '@discordjs/core';
import { prisma } from '../../../../env.js';
import { mapChatInputOptionValues } from '../../../interactions.js';
import { Subcommand } from '../../../subcommands.js';
import { SUBMISSION_EMOJI } from '../constants.js';
import addQuote from './add-quote/index.js';

export default {
    data: {
        type: ApplicationCommandOptionType.Subcommand,
        name: 'add',
        description: 'Add a gremlin',
        options: [
            {
                type: ApplicationCommandOptionType.Channel,
                name: 'channel',
                description: 'The channel where the gremlin is located',
                required: true,
            },
            {
                type: ApplicationCommandOptionType.String,
                name: 'message',
                description: 'The message where the gremlin is located',
                required: true,
            },
        ],
    },
    async execute({ data: interaction, api, subcommandData }) {
        const { channel: channelId, message: messageId } =
            mapChatInputOptionValues(subcommandData) as {
                channel: string;
                message: string;
            };

        await api.interactions.defer(interaction.id, interaction.token, {
            flags: MessageFlags.Ephemeral,
        });

        const message = await api.channels
            .getMessage(channelId, messageId)
            .catch(() => {});
        if (!message) {
            await api.interactions.editReply(
                interaction.application_id,
                interaction.token,
                {
                    content: 'Invalid message and/or channel.',
                },
            );
            return;
        }

        const attachment = message.attachments[0];
        if (!attachment || !attachment.content_type?.startsWith('image')) {
            await api.interactions.editReply(
                interaction.id,
                interaction.token,
                {
                    content:
                        "This message doesn't have an image attachment as its first attachment.",
                },
            );
            return;
        }

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
                quote: message.content
                    ? `"${message.content.split('\n')[0]}"`
                    : null,
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
} satisfies Subcommand;
