import { ButtonStyle, ComponentType } from '@discordjs/core';
import { codeBlock } from '@discordjs/formatters';
import { Button } from '../../../data.js';
import {
    createStatefulInteraction,
    StatefulInteraction,
} from '../../../stateful.js';
import { ensureNoLetters } from '../../util/ensure-no-letters.js';
import { ensureSameUser } from '../../util/ensure-same-user.js';
import { getMathLine } from '../../util/math.js';

function createNumberButton(char: string): StatefulInteraction<Button> {
    return createStatefulInteraction<Button>({
        data: {
            type: ComponentType.Button,
            custom_id: `calculator_number${char}`,
            style: ButtonStyle.Secondary,
            label: char,
        },
        async execute({ api, data: interaction, state: userId }) {
            if (!(await ensureSameUser(api, interaction, userId))) return;

            let math = getMathLine(interaction.message.content);
            math = ensureNoLetters(math);

            if (math === '0' || math.endsWith(' 0')) {
                math = math.replace(/0$/, char);
            } else {
                math += char;
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
}

export const numberButtons = Array.from(Array(10), (_, i) =>
    createNumberButton(`${i}`),
);
