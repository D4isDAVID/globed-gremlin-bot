import {
    ApplicationCommandOptionType,
    MessageFlags,
    RESTJSONErrorCodes,
} from '@discordjs/core';
import { messageLink } from '@discordjs/formatters';
import { DiscordAPIError } from '@discordjs/rest';
import { prisma } from '../../../env.js';
import { Subcommand } from '../../subcommands.js';
import { postAndDeleteGremlin } from '../utils/post-gremlin.js';
import { fetchRandomGremlin } from '../utils/random-gremlin.js';
import { getSubmissionsMessage } from '../utils/submissions-message.js';

export default {
    data: {
        type: ApplicationCommandOptionType.Subcommand,
        name: 'post-bonus',
        description: 'Post a bonus gremlin',
    },
    async execute({ data: interaction, api }) {
        await api.interactions.defer(interaction.id, interaction.token, {
            flags: MessageFlags.Ephemeral,
        });

        const config = await prisma.gremlinsConfig.findFirst({
            where: {
                guildId: interaction.guild_id!,
            },
        });

        if (!config) {
            await api.interactions.editReply(
                interaction.application_id,
                interaction.token,
                {
                    content: 'No config set for this server.',
                },
            );
            return;
        }

        if (!config.dailyChannelId) {
            await api.interactions.editReply(
                interaction.application_id,
                interaction.token,
                {
                    content: 'No daily channel ID set for this server.',
                },
            );
            return;
        }

        const result = await fetchRandomGremlin(config);
        if (typeof result === 'string') {
            await api.interactions.editReply(
                interaction.application_id,
                interaction.token,
                {
                    content: result,
                },
            );
            return;
        }

        try {
            const message = await postAndDeleteGremlin(
                config.dailyChannelId,
                result.gremlin,
                result.contentBuffer,
                'Bonus Gremlin!',
                getSubmissionsMessage(config),
            );

            await api.interactions.editReply(
                interaction.application_id,
                interaction.token,
                {
                    content: `Sent a bonus gremlin in ${messageLink(message.channel_id, message.id)}.`,
                    flags: MessageFlags.SuppressEmbeds,
                },
            );
        } catch (e) {
            if (
                e instanceof DiscordAPIError &&
                e.code === RESTJSONErrorCodes.UnknownChannel
            ) {
                await api.interactions.editReply(
                    interaction.application_id,
                    interaction.token,
                    {
                        content:
                            'Invalid daily channel ID set for this server.',
                    },
                );
                return;
            }

            throw e;
        }
    },
} satisfies Subcommand;
