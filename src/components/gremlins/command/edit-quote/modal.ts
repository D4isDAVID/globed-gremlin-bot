import { ComponentType, MessageFlags, TextInputStyle } from '@discordjs/core';
import { HeadingLevel, heading } from '@discordjs/formatters';
import { prisma } from '../../../../env.js';
import { Modal } from '../../../data.js';
import { mapModalTextInputValues } from '../../../interactions.js';
import { createStatefulInteraction } from '../../../stateful.js';

export default createStatefulInteraction<Modal>({
    data: {
        custom_id: 'edit_gremlin_quote',
        title: 'Edit Gremlin Quote',
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
    async execute({ data: interaction, api, state }) {
        const { quote } = mapModalTextInputValues(interaction.data) as {
            quote: string;
        };

        const daily = state.includes('daily');
        const messageId = state.replace('daily', '');
        const channelId = interaction.channel!.id;

        await api.interactions.defer(interaction.id, interaction.token, {
            flags: MessageFlags.Ephemeral,
        });

        if (!daily) {
            const count = await prisma.gremlin.count({
                where: { channelId, messageId },
            });
            if (count === 0) {
                await api.interactions.editReply(
                    interaction.application_id,
                    interaction.token,
                    {
                        content: "This gremlin isn't submitted.",
                    },
                );
                return;
            }

            await prisma.gremlin.updateMany({
                where: { channelId, messageId },
                data: { quote },
            });

            await api.interactions.editReply(
                interaction.application_id,
                interaction.token,
                {
                    content: `Quote edited for ${count} gremlin${count === 1 ? '' : 's'}: ${quote}`,
                },
            );
            return;
        }

        const message = await api.channels.getMessage(channelId, messageId);
        let content = message.content;

        const formatted = heading(quote, HeadingLevel.Two);
        const quoteRegex = new RegExp(heading('.*', HeadingLevel.Two));
        const titleRegex = new RegExp(heading('.*'));

        if (content.match(quoteRegex)) {
            content = content.replace(quoteRegex, formatted);
        } else {
            const titleMatch = content.match(titleRegex);

            if (titleMatch) {
                content = content.replace(
                    titleRegex,
                    `${titleMatch[0]}\n${formatted}`,
                );
            } else {
                content = `${formatted}${content}`;
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
