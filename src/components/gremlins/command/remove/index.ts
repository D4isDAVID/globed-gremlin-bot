import { ApplicationCommandOptionType, MessageFlags } from '@discordjs/core';
import { prisma } from '../../../../env.js';
import { mapChatInputOptionValues } from '../../../interactions.js';
import { Subcommand } from '../../../subcommands.js';
import { SUBMISSION_EMOJI } from '../constants.js';

export default {
    data: {
        type: ApplicationCommandOptionType.Subcommand,
        name: 'remove',
        description: 'Remove a gremlin',
        options: [
            {
                type: ApplicationCommandOptionType.Integer,
                name: 'id',
                description: 'The ID of the gremlin',
                required: true,
            },
        ],
    },
    async execute({ data: interaction, api, subcommandData }) {
        const { id } = mapChatInputOptionValues(subcommandData) as {
            id: number;
        };

        await api.interactions.defer(interaction.id, interaction.token, {
            flags: MessageFlags.Ephemeral,
        });

        const gremlin = await prisma.gremlin.findFirst({
            where: { id },
        });
        if (!gremlin) {
            await api.interactions.editReply(
                interaction.application_id,
                interaction.token,
                {
                    content: 'Invalid gremlin ID.',
                },
            );
            return;
        }

        const count = await prisma.gremlin.count({
            where: {
                channelId: gremlin.channelId,
                messageId: gremlin.messageId,
            },
        });

        await prisma.gremlin.delete({
            where: { id: gremlin.id },
        });

        await api.interactions.editReply(
            interaction.application_id,
            interaction.token,
            {
                content: 'Gremlin removed.',
            },
        );

        if (count === 1)
            await api.channels.deleteOwnMessageReaction(
                gremlin.channelId,
                gremlin.messageId,
                SUBMISSION_EMOJI,
            );
    },
} satisfies Subcommand;
