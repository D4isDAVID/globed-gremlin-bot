import { ApplicationCommandOptionType, MessageFlags } from '@discordjs/core';
import { prisma } from '../../../../env.js';
import { mapChatInputOptionValues } from '../../../interactions.js';
import { Subcommand } from '../../../subcommands.js';

export default {
    data: {
        type: ApplicationCommandOptionType.Subcommand,
        name: 'edit-quote',
        description: 'Edit the quote of a gremlin',
        options: [
            {
                type: ApplicationCommandOptionType.Integer,
                name: 'id',
                description: 'The ID of the gremlin',
                required: true,
            },
            {
                type: ApplicationCommandOptionType.String,
                name: 'quote',
                description: 'The new quote',
                required: true,
            },
        ],
    },
    async execute({ data: interaction, api, subcommandData }) {
        const { id, quote } = mapChatInputOptionValues(subcommandData) as {
            id: string;
            quote: string;
        };

        await api.interactions.defer(interaction.id, interaction.token, {
            flags: MessageFlags.Ephemeral,
        });

        const gremlin = await prisma.gremlin.findFirst({
            where: { id: parseInt(id) },
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

        await prisma.gremlin.update({
            where: { id: gremlin.id },
            data: { quote },
        });

        await api.interactions.editReply(
            interaction.application_id,
            interaction.token,
            {
                content: `Quote edited to: ${quote}`,
            },
        );
    },
} satisfies Subcommand;
