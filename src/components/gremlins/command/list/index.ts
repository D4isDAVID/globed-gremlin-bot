import { ApplicationCommandOptionType, MessageFlags } from '@discordjs/core';
import { prisma } from '../../../../env.js';
import { Subcommand } from '../../../subcommands.js';
import { LIST_PAGE_SIZE } from '../constants.js';
import embed from './embed.js';
import row from './row.js';

export default {
    data: {
        type: ApplicationCommandOptionType.Subcommand,
        name: 'list',
        description: 'List gremlins',
    },
    async execute({ data: interaction, api }) {
        const guildId = interaction.guild_id!;

        await api.interactions.defer(interaction.id, interaction.token, {
            flags: MessageFlags.Ephemeral,
        });

        const count = await prisma.gremlin.count({
            where: { guildId },
        });
        const totalPages = Math.ceil(count / LIST_PAGE_SIZE);
        let page = 1;

        await api.interactions.editReply(
            interaction.application_id,
            interaction.token,
            {
                embeds: [await embed(page, totalPages, count, guildId)],
                components: [await row(page, totalPages)],
            },
        );
    },
} satisfies Subcommand;
