import { ApplicationCommandOptionType, MessageFlags } from '@discordjs/core';
import { prisma } from '../../../../env.js';
import { mapChatInputOptionValues } from '../../../interactions.js';
import { Subcommand } from '../../../subcommands.js';

export default {
    data: {
        type: ApplicationCommandOptionType.Subcommand,
        name: 'edit-description',
        description: 'Edit the description of a gremlin',
        options: [
            {
                type: ApplicationCommandOptionType.Integer,
                name: 'id',
                description: 'The ID of the gremlin',
                required: true,
            },
            {
                type: ApplicationCommandOptionType.String,
                name: 'description',
                description: 'The new description',
                required: true,
            },
        ],
    },
    async execute({ data: interaction, api, subcommandData }) {
        const { id, description } = mapChatInputOptionValues(
            subcommandData,
        ) as {
            id: string;
            description: string;
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
            data: { description },
        });

        await api.interactions.editReply(
            interaction.application_id,
            interaction.token,
            {
                content: `Description edited to: ${description}`,
            },
        );
    },
} satisfies Subcommand;
