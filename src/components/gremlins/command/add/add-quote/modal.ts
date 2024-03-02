import { ComponentType, TextInputStyle } from '@discordjs/core';
import { prisma } from '../../../../../env.js';
import { Modal } from '../../../../data.js';
import { mapModalTextInputValues } from '../../../../interactions.js';
import { createStatefulInteraction } from '../../../../stateful.js';

export default createStatefulInteraction<Modal>({
    data: {
        custom_id: 'add_quote',
        title: 'Add Quote',
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
    async execute({ data: interaction, api, state: submissionId }) {
        const { quote } = mapModalTextInputValues(interaction.data) as {
            quote: string;
        };

        await api.interactions.deferMessageUpdate(
            interaction.id,
            interaction.token,
        );

        const submission = await prisma.gremlin.update({
            where: { id: parseInt(submissionId) },
            data: { quote },
            select: { quote: true },
        });

        await api.interactions.editReply(
            interaction.application_id,
            interaction.token,
            {
                content: `Quote added: ${submission.quote}`,
                components: [],
            },
        );
    },
});
