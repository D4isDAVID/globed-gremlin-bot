import { ButtonStyle, ComponentType } from '@discordjs/core';
import { Button } from '../../../../../../data.js';
import { createStatefulInteraction } from '../../../../../../stateful.js';
import { addAnswerModal } from './modal.js';

export const addAnswerButton = createStatefulInteraction<Button>({
    data: {
        type: ComponentType.Button,
        style: ButtonStyle.Primary,
        custom_id: 'forumpolls_add_answer',
        emoji: { name: '➕' },
        label: 'Add answer',
    },
    async execute({ data: interaction, api, state: channelId }) {
        await api.interactions.createModal(
            interaction.id,
            interaction.token,
            addAnswerModal.stateful(channelId),
        );
    },
});
