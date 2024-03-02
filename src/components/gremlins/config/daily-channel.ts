import {
    ApplicationCommandOptionType,
    ChannelType,
    MessageFlags,
} from '@discordjs/core';
import { channelMention } from '@discordjs/formatters';
import { prisma } from '../../../env.js';
import { mapChatInputOptionValues } from '../../interactions.js';
import { Subcommand } from '../../subcommands.js';

export default {
    data: {
        type: ApplicationCommandOptionType.Subcommand,
        name: 'daily-channel',
        description: 'Configurate the gremlins daily channel',
        options: [
            {
                type: ApplicationCommandOptionType.Channel,
                name: 'channel',
                description: 'The channel',
                required: true,
                channel_types: [
                    ChannelType.GuildAnnouncement,
                    ChannelType.GuildText,
                ],
            },
        ],
    },
    async execute({ data: interaction, api, subcommandData }) {
        const { channel: channelId } = mapChatInputOptionValues(
            subcommandData,
        ) as { channel: string };

        await api.interactions.defer(interaction.id, interaction.token, {
            flags: MessageFlags.Ephemeral,
        });

        const config = await prisma.gremlinsConfig.update({
            where: { guildId: interaction.guild_id! },
            data: { dailyChannelId: channelId },
        });

        await api.interactions.editReply(
            interaction.application_id,
            interaction.token,
            {
                content: `Gremlins daily channel set to ${channelMention(config.dailyChannelId!)}.`,
            },
        );
    },
} satisfies Subcommand;
