import { ApplicationCommandOptionType, MessageFlags } from '@discordjs/core';
import { messageLink } from '@discordjs/formatters';
import { prisma } from '../../../env.js';
import { Subcommand } from '../../subcommands.js';
import { postGremlin } from '../utils/post-gremlin.js';

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

        const result = await postGremlin(config, 'Bonus Gremlin!');
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

        await api.interactions.editReply(
            interaction.application_id,
            interaction.token,
            {
                content: `Sent a bonus gremlin in ${messageLink(result.channel_id, result.id)}.`,
                flags: MessageFlags.SuppressEmbeds,
            },
        );
    },
} satisfies Subcommand;
