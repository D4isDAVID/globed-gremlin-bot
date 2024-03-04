import { ButtonStyle, ComponentType } from '@discordjs/core';
import { Button } from '../../../../data.js';
import { createStatefulInteraction } from '../../../../stateful.js';
import modal from './modal.js';

export default createStatefulInteraction<Button>({
    data: {
        type: ComponentType.Button,
        custom_id: 'edit_new_gremlin_quote',
        style: ButtonStyle.Secondary,
        label: 'Edit Quote',
        emoji: { name: '💬' },
    },
    async execute({ data: interaction, api, state }) {
        await api.interactions.createModal(
            interaction.id,
            interaction.token,
            modal.stateful(state),
        );
    },
});