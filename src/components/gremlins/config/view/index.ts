import {
    ApplicationCommandOptionType,
    ComponentType,
    MessageFlags,
} from '@discordjs/core';
import { Subcommand } from '../../../subcommands.js';
import button from './button.js';
import { embed } from './embed.js';

export default {
    data: {
        type: ApplicationCommandOptionType.Subcommand,
        name: 'view',
        description: 'View the current configuration',
    },
    async execute({ data: interaction, api }) {
        await api.interactions.defer(interaction.id, interaction.token, {
            flags: MessageFlags.Ephemeral,
        });

        await api.interactions.editReply(
            interaction.application_id,
            interaction.token,
            {
                embeds: [await embed(interaction.guild_id!)],
                components: [
                    {
                        type: ComponentType.ActionRow,
                        components: [button.data],
                    },
                ],
            },
        );
    },
} satisfies Subcommand;
