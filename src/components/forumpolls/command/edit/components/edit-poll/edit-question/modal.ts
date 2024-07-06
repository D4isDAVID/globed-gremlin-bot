import { ComponentType, TextInputStyle } from '@discordjs/core';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { prisma } from '../../../../../../../env.js';
import { Modal } from '../../../../../../data.js';
import { mapModalTextInputValues } from '../../../../../../interactions.js';
import { createStatefulInteraction } from '../../../../../../stateful.js';
import { embeds } from '../../../embeds.js';
import { editPollComponents } from '../components.js';

export const editQuestionModal = createStatefulInteraction<Modal>({
    data: {
        custom_id: 'forumpolls_edit_question',
        title: 'Edit question',
        components: [
            {
                type: ComponentType.ActionRow,
                components: [
                    {
                        type: ComponentType.TextInput,
                        style: TextInputStyle.Short,
                        custom_id: 'question',
                        label: 'Question',
                        max_length: 300,
                        required: true,
                    },
                ],
            },
        ],
    },
    async execute({ data: interaction, api, state: channelId }) {
        const { question } = mapModalTextInputValues(interaction.data) as {
            question: string;
        };

        await api.interactions.deferMessageUpdate(
            interaction.id,
            interaction.token,
        );

        try {
            const forumPoll = await prisma.forumPoll.update({
                where: { channelId },
                data: { question },
                include: { answers: true },
            });

            await api.interactions.editReply(
                interaction.application_id,
                interaction.token,
                {
                    content: '✅ Question edited.',
                    embeds: embeds(forumPoll),
                    components: editPollComponents(forumPoll),
                },
            );
        } catch (e) {
            if (
                !(e instanceof PrismaClientKnownRequestError) ||
                e.code !== 'P2025'
            )
                throw e;

            await api.interactions.editReply(
                interaction.application_id,
                interaction.token,
                {
                    content: '❌ Form poll was deleted.',
                    embeds: [],
                    components: [],
                },
            );
        }
    },
});
