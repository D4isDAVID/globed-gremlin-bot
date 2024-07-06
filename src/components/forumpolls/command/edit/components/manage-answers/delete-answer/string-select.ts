import { ComponentType } from '@discordjs/core';
import { prisma } from '../../../../../../../env.js';
import { StringSelect } from '../../../../../../data.js';
import { createStatefulInteraction } from '../../../../../../stateful.js';
import { stringifyEmoji } from '../../../../../util/emoji.js';
import { embeds } from '../../../embeds.js';
import { manageAnswersComponents } from '../components.js';
import { deleteAnswerCancelButton } from './cancel-button.js';
import { deleteAnswerConfirmButton } from './confirm-button.js';

export const deleteAnswerStringSelect = createStatefulInteraction<StringSelect>(
    {
        data: {
            type: ComponentType.StringSelect,
            custom_id: 'forumpolls_delete_answer_list',
            options: [],
        },
        async execute({ data: interaction, api, state: channelId }) {
            const answerIdRaw = interaction.data.values[0]!;
            const answerId = parseInt(answerIdRaw);

            await api.interactions.deferMessageUpdate(
                interaction.id,
                interaction.token,
            );

            const answer = await prisma.forumPollAnswer.findFirst({
                where: { id: answerId, channelId },
            });

            if (!answer) {
                const forumPoll = await prisma.forumPoll.findFirst({
                    where: { channelId },
                    include: { answers: true },
                });

                if (forumPoll === null) {
                    await api.interactions.editReply(
                        interaction.application_id,
                        interaction.token,
                        {
                            content: 'Forum poll was deleted.',
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
                        content: 'Answer was already deleted.',
                        embeds: embeds(forumPoll),
                        components: manageAnswersComponents(forumPoll),
                    },
                );
                return;
            }

            await api.interactions.editReply(
                interaction.application_id,
                interaction.token,
                {
                    content: [
                        'Are you sure you want to delete this answer?',
                        `${stringifyEmoji(answer.emojiName, answer.emojiId) ?? ''} ${answer.text}`,
                    ].join('\n'),
                    embeds: [],
                    components: [
                        {
                            type: ComponentType.ActionRow,
                            components: [
                                deleteAnswerConfirmButton.stateful(
                                    `${channelId}_${answerId}`,
                                ),
                                deleteAnswerCancelButton.stateful(channelId),
                            ],
                        },
                    ],
                },
            );
        },
    },
);
