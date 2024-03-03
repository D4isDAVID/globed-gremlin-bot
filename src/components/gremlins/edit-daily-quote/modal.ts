import { ComponentType, MessageFlags, TextInputStyle } from '@discordjs/core';
import { HeadingLevel, heading } from '@discordjs/formatters';
import { Modal } from '../../data.js';
import { mapModalTextInputValues } from '../../interactions.js';
import { createStatefulInteraction } from '../../stateful.js';

export default createStatefulInteraction<Modal>({
    data: {
        custom_id: 'edit_daily_gremlin_quote',
        title: 'Edit Daily Gremlin Quote',
        components: [
            {
                type: ComponentType.ActionRow,
                components: [
                    {
                        type: ComponentType.TextInput,
                        custom_id: 'quote',
                        label: 'Quote',
                        style: TextInputStyle.Short,
                        required: true,
                        placeholder: '"eeby gremlin"',
                    },
                ],
            },
        ],
    },
    async execute({ data: interaction, api, state: messageId }) {
        const { quote: raw } = mapModalTextInputValues(interaction.data) as {
            quote: string;
        };
        const quote = heading(raw, HeadingLevel.Two);
        const channelId = interaction.channel!.id;

        await api.interactions.defer(interaction.id, interaction.token, {
            flags: MessageFlags.Ephemeral,
        });

        const message = await api.channels.getMessage(channelId, messageId);
        let content = message.content;

        const quoteRegex = new RegExp(heading('.*', HeadingLevel.Two));
        const titleRegex = new RegExp(heading('.*'));

        if (content.match(quoteRegex)) {
            content = content.replace(quoteRegex, quote);
        } else {
            const titleMatch = content.match(titleRegex);

            if (titleMatch) {
                content = content.replace(
                    titleRegex,
                    `${titleMatch[0]}\n${quote}`,
                );
            } else {
                content = `${quote}${content}`;
            }
        }

        await api.channels.editMessage(channelId, messageId, {
            content,
        });

        await api.interactions.editReply(
            interaction.application_id,
            interaction.token,
            { content: 'Quote edited.' },
        );
    },
});
