import { ComponentType, TextInputStyle } from '@discordjs/core';
import { ForumPoll, ForumPollAnswer } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { prisma } from '../../../../../../../env.js';
import { Modal } from '../../../../../../data.js';
import { mapModalTextInputValues } from '../../../../../../interactions.js';
import { createStatefulInteraction } from '../../../../../../stateful.js';
import { embeds } from '../../../embeds.js';
import { editPollComponents } from '../components.js';

const MAX_HOURS = 24 * 32; // 32 days

export const editDurationModal = createStatefulInteraction<Modal>({
    data: {
        custom_id: 'forumpolls_edit_duration',
        title: 'Edit duration',
        components: [
            {
                type: ComponentType.ActionRow,
                components: [
                    {
                        type: ComponentType.TextInput,
                        style: TextInputStyle.Short,
                        custom_id: 'duration',
                        label: 'Duration in Hours',
                        placeholder: `Max. ${MAX_HOURS}`,
                        max_length: 3,
                        required: true,
                    },
                ],
            },
        ],
    },
    async execute({ data: interaction, api, state: channelId }) {
        const { duration: durationRaw } = mapModalTextInputValues(
            interaction.data,
        ) as {
            duration: string;
        };

        const duration = parseInt(durationRaw);

        await api.interactions.deferMessageUpdate(
            interaction.id,
            interaction.token,
        );

        let forumPoll: (ForumPoll & { answers: ForumPollAnswer[] }) | null;
        let content: string = '';

        if (isNaN(duration) || duration < 1 || duration > MAX_HOURS) {
            forumPoll = await prisma.forumPoll.findFirst({
                where: { channelId },
                include: { answers: true },
            });
            content = '❌ Invalid duration provided.';
        } else {
            try {
                forumPoll = await prisma.forumPoll.update({
                    where: { channelId },
                    data: { duration },
                    include: { answers: true },
                });

                content = '✅ Duration updated.';
            } catch (e) {
                if (
                    !(e instanceof PrismaClientKnownRequestError) ||
                    e.code !== 'P2025'
                )
                    throw e;

                forumPoll = null;
            }
        }

        if (forumPoll === null) {
            await api.interactions.editReply(
                interaction.application_id,
                interaction.token,
                {
                    content: '❌ Forum poll was deleted.',
                    embeds: [],
                    components: [],
                },
            );
            return;
        }

        await api.interactions.editReply(
            interaction.application_id,
            interaction.token,
            {
                content,
                embeds: embeds(forumPoll),
                components: editPollComponents(forumPoll),
            },
        );
    },
});
