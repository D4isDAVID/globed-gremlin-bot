import { ButtonStyle, ComponentType } from '@discordjs/core';
import { Button } from '../../../../../../data.js';
import { createStatefulInteraction } from '../../../../../../stateful.js';
import { getQuestionFromEmbeds } from '../../../embeds.js';
import { editQuestionModal } from './modal.js';

export const editQuestionButton = createStatefulInteraction<Button>({
    data: {
        type: ComponentType.Button,
        style: ButtonStyle.Primary,
        custom_id: 'forumpolls_edit_question',
        emoji: { name: '❓' },
        label: 'Edit question',
    },
    async execute({ data: interaction, api, state: channelId }) {
        const modal = editQuestionModal.stateful(channelId!);
        modal.components[0]!.components[0]!.value = getQuestionFromEmbeds(
            interaction.message.embeds,
        );

        await api.interactions.createModal(
            interaction.id,
            interaction.token,
            modal,
        );
    },
});
