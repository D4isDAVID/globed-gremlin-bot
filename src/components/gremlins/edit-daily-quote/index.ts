import { ApplicationCommandType, MessageFlags } from '@discordjs/core';
import { heading } from '@discordjs/formatters';
import { getBotUser } from '../../cache/events/ready.js';
import { MessageCommand } from '../../data.js';
import modal from './modal.js';

export default {
    data: {
        type: ApplicationCommandType.Message,
        name: 'Edit Daily Gremlin Quote',
        default_member_permissions: '0',
        dm_permission: false,
    },
    async execute({ data: interaction, api }) {
        const messageId = interaction.data.target_id;
        const message = interaction.data.resolved.messages[messageId]!;

        const titleRegex = new RegExp(
            heading('Gremlin of the Day #[0-9]+'),
            'i',
        );

        if (
            message.author.id !== getBotUser()!.id ||
            !message.content.match(titleRegex)
        ) {
            await api.interactions.reply(interaction.id, interaction.token, {
                content: "This isn't a daily gremlin.",
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        await api.interactions.createModal(
            interaction.id,
            interaction.token,
            modal.stateful(messageId),
        );
    },
} satisfies MessageCommand;
