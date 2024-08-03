import { ButtonStyle, ComponentType } from '@discordjs/core';
import { codeBlock } from '@discordjs/formatters';
import { Button } from '../../../data.js';
import { createStatefulInteraction } from '../../../stateful.js';
import { ensureNoLetters } from '../../util/ensure-no-letters.js';
import { ensureSameUser } from '../../util/ensure-same-user.js';
import { getMathLine } from '../../util/math.js';

export const clearEntryButton = createStatefulInteraction<Button>({
    data: {
        type: ComponentType.Button,
        custom_id: `calculator_clear_entry`,
        style: ButtonStyle.Danger,
        label: 'CE',
    },
    async execute({ api, data: interaction, state: userId }) {
        if (!(await ensureSameUser(api, interaction, userId))) return;

        let math = getMathLine(interaction.message.content);
        math = ensureNoLetters(math);

        if (math.includes(' ')) {
            math = math.replace(/[^ ]*$/, '0');
        } else {
            math = '0';
        }

        await api.interactions.updateMessage(
            interaction.id,
            interaction.token,
            {
                content: codeBlock(math),
            },
        );
    },
});
