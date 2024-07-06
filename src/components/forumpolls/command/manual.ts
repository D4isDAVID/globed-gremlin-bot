import {
    APIThreadChannel,
    ApplicationCommandOptionType,
    ChannelType,
    ComponentType,
    MessageFlags,
} from '@discordjs/core';
import { messageLink } from '@discordjs/formatters';
import { Subcommand } from '../../subcommands.js';
import { sendPoll } from '../util/send-poll.js';
import { createButton } from './create-button.js';

export const forumPollsManualSubcommand = {
    data: {
        type: ApplicationCommandOptionType.Subcommand,
        name: 'manual',
        description: 'Manually send a forum poll here.',
    },
    async execute({ data: interaction, api }) {
        if (
            ![ChannelType.PublicThread, ChannelType.PrivateThread].includes(
                interaction.channel.type,
            )
        ) {
            await api.interactions.reply(interaction.id, interaction.token, {
                content: '❌ You may only use this command in threads.',
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        const thread = interaction.channel as APIThreadChannel;

        await api.interactions.defer(interaction.id, interaction.token, {
            flags: MessageFlags.Ephemeral,
        });

        const message = await sendPoll(api, thread);

        if (message === null) {
            await api.interactions.editReply(
                interaction.application_id,
                interaction.token,
                {
                    content: `❌ No forum poll defined for this forum.`,
                    components: [
                        {
                            type: ComponentType.ActionRow,
                            components: [
                                createButton.stateful(thread.parent_id!),
                            ],
                        },
                    ],
                },
            );
            return;
        }

        await api.interactions.editReply(
            interaction.application_id,
            interaction.token,
            {
                content: `✅ Poll created - ${messageLink(thread.id, message.id)}.`,
            },
        );
    },
} satisfies Subcommand;
