import { ButtonStyle, ComponentType } from '@discordjs/core';
import { codeBlock } from '@discordjs/formatters';
import { Button } from '../../../data.js';
import { createStatefulInteraction } from '../../../stateful.js';
import { ensureNoLetters } from '../../util/ensure-no-letters.js';
import { ensureSameUser } from '../../util/ensure-same-user.js';
import { getMathLine } from '../../util/math.js';

export const backspaceButton = createStatefulInteraction<Button>({
    data: {
        type: ComponentType.Button,
        custom_id: `calculator_backspace`,
        style: ButtonStyle.Danger,
        label: '⌫',
    },
    async execute({ api, data: interaction, state: userId }) {
        if (!(await ensureSameUser(api, interaction, userId))) return;

        let math = getMathLine(interaction.message.content);
        math = ensureNoLetters(math);

        if (math.endsWith(' 0')) {
            math = math.replace(/ . 0$/, '');
        } else if (math.length === 1) {
            math = '0';
        } else {
            math = math.slice(0, -1);
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
