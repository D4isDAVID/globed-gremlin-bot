import { ButtonStyle, ComponentType } from '@discordjs/core';
import { Button } from '../../../data.js';
import { createStatefulInteraction } from '../../../stateful.js';
import { ensureSameUser } from '../../util/ensure-same-user.js';

export const closeButton = createStatefulInteraction<Button>({
    data: {
        type: ComponentType.Button,
        custom_id: `calculator_close`,
        style: ButtonStyle.Secondary,
        emoji: { name: '❌' },
    },
    async execute({ api, data: interaction, state: userId }) {
        if (!(await ensureSameUser(api, interaction, userId))) return;

        await api.interactions.updateMessage(
            interaction.id,
            interaction.token,
            {
                components: [],
            },
        );
    },
});
