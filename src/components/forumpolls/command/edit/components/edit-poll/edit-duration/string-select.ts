import { ComponentType } from '@discordjs/core';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { prisma } from '../../../../../../../env.js';
import { StringSelect } from '../../../../../../data.js';
import { createStatefulInteraction } from '../../../../../../stateful.js';
import { embeds } from '../../../embeds.js';
import { editPollComponents } from '../components.js';
import { editDurationModal } from './modal.js';

export const editDurationStringSelect = createStatefulInteraction<StringSelect>(
    {
        data: {
            type: ComponentType.StringSelect,
            custom_id: 'forumpolls_edit_duration_list',
            options: [
                {
                    label: 'Custom',
                    value: 'custom',
                },
                {
                    label: '1 hour',
                    value: '1',
                },
                {
                    label: '4 hours',
                    value: '4',
                },
                {
                    label: '8 hours',
                    value: '8',
                },
                {
                    label: '24 hours',
                    value: '24',
                },
                {
                    label: '3 days',
                    value: '72',
                },
                {
                    label: '1 week',
                    value: '168',
                },
                {
                    label: '2 weeks',
                    value: '336',
                },
            ],
        },
        async execute({ data: interaction, api, state: channelId }) {
            const durationRaw = interaction.data.values[0]!;
            if (durationRaw === 'custom') {
                await api.interactions.createModal(
                    interaction.id,
                    interaction.token,
                    editDurationModal.stateful(channelId),
                );
                return;
            }
            const duration = parseInt(durationRaw);

            await api.interactions.deferMessageUpdate(
                interaction.id,
                interaction.token,
            );

            try {
                const forumPoll = await prisma.forumPoll.update({
                    where: { channelId },
                    data: { duration },
                    include: { answers: true },
                });

                await api.interactions.editReply(
                    interaction.application_id,
                    interaction.token,
                    {
                        content: '✅ Duration updated.',
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
                        content: '❌ Forum poll was deleted.',
                        embeds: [],
                        components: [],
                    },
                );
            }
        },
    },
);
