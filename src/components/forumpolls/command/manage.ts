import {
    ApplicationCommandOptionType,
    ChannelType,
    ComponentType,
    MessageFlags,
    Snowflake,
} from '@discordjs/core';
import { channelLink } from '@discordjs/formatters';
import { prisma } from '../../../env.js';
import { mapChatInputOptionValues } from '../../interactions.js';
import { Subcommand } from '../../subcommands.js';
import { createButton } from './create-button.js';
import { components } from './edit/components.js';
import { embeds } from './edit/embeds.js';

export const forumPollsManageSubcommand = {
    data: {
        type: ApplicationCommandOptionType.Subcommand,
        name: 'manage',
        description: 'Manage automatic forum polls.',
        options: [
            {
                type: ApplicationCommandOptionType.Channel,
                name: 'channel',
                description:
                    'The channel for which to manage automatic forum polls.',
                channel_types: [ChannelType.GuildForum],
                required: true,
            },
        ],
    },
    async execute({ data: interaction, api, subcommandData }) {
        const { channel: channelId } = mapChatInputOptionValues(
            subcommandData,
        ) as { channel: Snowflake };

        await api.interactions.defer(interaction.id, interaction.token, {
            flags: MessageFlags.Ephemeral,
        });

        const forumPoll = await prisma.forumPoll.findFirst({
            where: { channelId },
            include: { answers: true },
        });

        if (forumPoll === null) {
            await api.interactions.editReply(
                interaction.application_id,
                interaction.token,
                {
                    content: `No forum poll found for this forum channel (${channelLink(channelId)}).`,
                    components: [
                        {
                            type: ComponentType.ActionRow,
                            components: [createButton.stateful(channelId)],
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
                embeds: embeds(forumPoll),
                components: components(forumPoll),
            },
        );
    },
} satisfies Subcommand;
