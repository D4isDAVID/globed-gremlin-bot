import { ButtonStyle, ComponentType } from '@discordjs/core';
import { prisma } from '../../../../env.js';
import { Button } from '../../../data.js';
import { createStatefulInteraction } from '../../../stateful.js';
import { LIST_PAGE_SIZE } from '../constants.js';
import embed from './embed.js';
import row from './row.js';

const pageButton = createStatefulInteraction<Button>({
    data: {
        type: ComponentType.Button,
        custom_id: 'gremlin_list_page',
        style: ButtonStyle.Secondary,
    },
    async execute({ data: interaction, api, state }) {
        const guildId = interaction.guild_id!;

        await api.interactions.deferMessageUpdate(
            interaction.id,
            interaction.token,
        );

        const count = await prisma.gremlin.count({
            where: { guildId },
        });

        const totalPages = Math.ceil(count / LIST_PAGE_SIZE);
        let page = parseInt(state);
        if (page > totalPages) page = totalPages || 1;

        await api.interactions.editReply(
            interaction.application_id,
            interaction.token,
            {
                embeds: [await embed(page, totalPages, guildId)],
                components: [await row(page, totalPages)],
            },
        );
    },
});

export default pageButton;
