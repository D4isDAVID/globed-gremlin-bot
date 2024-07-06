import { ButtonStyle, ComponentType } from '@discordjs/core';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { prisma } from '../../../../../../../env.js';
import { Button } from '../../../../../../data.js';
import { createStatefulInteraction } from '../../../../../../stateful.js';
import { embeds } from '../../../embeds.js';
import { manageAnswersComponents } from '../components.js';

export const deleteAnswerConfirmButton = createStatefulInteraction<Button>({
    data: {
        type: ComponentType.Button,
        style: ButtonStyle.Danger,
        custom_id: 'forumpolls_delete_answer_confirm',
        emoji: { name: '🗑️' },
        label: 'Delete',
    },
    async execute({ data: interaction, api, state }) {
        const [channelId, answerIdRaw] = state.split('_');
        const answerId = parseInt(answerIdRaw!);

        await api.interactions.deferMessageUpdate(
            interaction.id,
            interaction.token,
        );

        let content: string;

        try {
            await prisma.forumPollAnswer.delete({
                where: { id: answerId, channelId: channelId! },
            });

            content = '✅ Answer deleted.';
        } catch (e) {
            if (
                !(e instanceof PrismaClientKnownRequestError) ||
                e.code !== 'P2025'
            )
                throw e;

            content = '❌ Answer was already deleted.';
        }

        const forumPoll = await prisma.forumPoll.findFirst({
            where: { channelId: channelId! },
            include: { answers: true },
        });

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
                components: manageAnswersComponents(forumPoll),
            },
        );
    },
});
