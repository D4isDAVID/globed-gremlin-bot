import { ComponentType, TextInputStyle } from '@discordjs/core';
import { prisma } from '../../../../../env.js';
import { Modal } from '../../../../data.js';
import { mapModalTextInputValues } from '../../../../interactions.js';
import { createStatefulInteraction } from '../../../../stateful.js';

export default createStatefulInteraction<Modal>({
    data: {
        custom_id: 'edit_new_gremlin_quote',
        title: 'Edit New Gremlin Quote',
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
        const { quote } = mapModalTextInputValues(interaction.data) as {
            quote: string;
        };

        await api.interactions.deferMessageUpdate(
            interaction.id,
            interaction.token,
        );

        const gremlin = await prisma.gremlin.findFirst({
            where: { messageId },
            select: { channelId: true, messageId: true },
        });

        if (!gremlin) {
            await api.interactions.editReply(
                interaction.application_id,
                interaction.token,
                {
                    content: 'This gremlin is no longer registered.',
                    components: [],
                },
            );
            return;
        }

        await prisma.gremlin.updateMany({
            where: { messageId },
            data: { quote },
        });

        await api.interactions.editReply(
            interaction.application_id,
            interaction.token,
            {
                content: `Quote edited: ${quote}`,
            },
        );
    },
});
