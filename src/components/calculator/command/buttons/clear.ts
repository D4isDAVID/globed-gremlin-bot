import { ButtonStyle, ComponentType } from '@discordjs/core';
import { codeBlock } from '@discordjs/formatters';
import { Button } from '../../../data.js';
import { createStatefulInteraction } from '../../../stateful.js';
import { ensureSameUser } from '../../util/ensure-same-user.js';

export const clearButton = createStatefulInteraction<Button>({
    data: {
        type: ComponentType.Button,
        custom_id: `calculator_clear_all`,
        style: ButtonStyle.Danger,
        label: 'C',
    },
    async execute({ api, data: interaction, state: userId }) {
        if (!(await ensureSameUser(api, interaction, userId))) return;

        await api.interactions.updateMessage(
            interaction.id,
            interaction.token,
            {
                content: codeBlock('0'),
            },
        );
    },
});
