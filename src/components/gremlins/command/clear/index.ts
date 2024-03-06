import {
    ApplicationCommandOptionType,
    ComponentType,
    MessageFlags,
} from '@discordjs/core';
import { bold, underscore } from '@discordjs/formatters';
import { Subcommand } from '../../../subcommands.js';
import button from './button.js';

export default {
    data: {
        type: ApplicationCommandOptionType.Subcommand,
        name: 'clear',
        description: 'Clear the gremlins list.',
    },
    async execute({ data: interaction, api }) {
        await api.interactions.reply(interaction.id, interaction.token, {
            content: `Are you sure you want to clear the gremlins list? ${bold(underscore('This will delete all the gremlins from the database!'))}`,
            components: [
                {
                    type: ComponentType.ActionRow,
                    components: [button.data],
                },
            ],
            flags: MessageFlags.Ephemeral,
        });
    },
} satisfies Subcommand;
