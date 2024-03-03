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
                name: 'gremlin',
                description: 'The ID of the gremlin',
                required: true,
            },
        ],
    },
    async execute({ data: interaction, api, subcommandData }) {
        const { gremlin: gremlinId } = mapChatInputOptionValues(
            subcommandData,
        ) as {
            gremlin: number;
        };

        await api.interactions.defer(interaction.id, interaction.token, {
            flags: MessageFlags.Ephemeral,
        });

        const gremlin = await prisma.gremlin.findFirst({
            where: {
                id: gremlinId,
            },
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

        await prisma.gremlin.delete({
            where: {
                id: gremlin.id,
            },
        });

        await api.interactions.editReply(
            interaction.application_id,
            interaction.token,
            {
                content: 'Gremlin removed.',
            },
        );

        await api.channels.deleteOwnMessageReaction(
            gremlin.channelId,
            gremlin.messageId,
            SUBMISSION_EMOJI,
        );
    },
} satisfies Subcommand;