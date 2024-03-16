import { ApplicationCommandType, PermissionFlagsBits } from '@discordjs/core';
import { heading } from '@discordjs/formatters';
import { getBotUser } from '../../../cache/events/ready.js';
import { MessageCommand } from '../../../data.js';
import modal from './modal.js';

export default {
    data: {
        type: ApplicationCommandType.Message,
        name: 'Edit gremlin description',
        default_member_permissions: `${PermissionFlagsBits.ManageGuild}`,
        dm_permission: false,
    },
    async execute({ data: interaction, api }) {
        const messageId = interaction.data.target_id;
        const message = interaction.data.resolved.messages[messageId]!;

        const titleRegex = new RegExp(
            heading('Gremlin of the Day #[0-9]+'),
            'i',
        );

        let state = messageId;
        if (
            message.author.id === getBotUser()!.id &&
            message.content.match(titleRegex)
        ) {
            state += 'daily';
        }

        await api.interactions.createModal(
            interaction.id,
            interaction.token,
            modal.stateful(state),
        );
    },
} satisfies MessageCommand;
