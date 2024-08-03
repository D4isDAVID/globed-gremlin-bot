import { ButtonStyle, ComponentType } from '@discordjs/core';
import { codeBlock } from '@discordjs/formatters';
import { Button } from '../../../data.js';
import {
    createStatefulInteraction,
    StatefulInteraction,
} from '../../../stateful.js';
import { ensureNoLetters } from '../../util/ensure-no-letters.js';
import { ensureSameUser } from '../../util/ensure-same-user.js';
import { evaluateMath } from '../../util/evaluate.js';
import { getMathLine } from '../../util/math.js';

const ZEROS_REGEX = / . 0\.?0*$/;

function createOperationButton(op: string): StatefulInteraction<Button> {
    return createStatefulInteraction<Button>({
        data: {
            type: ComponentType.Button,
            custom_id: `calculator_operation${op}`,
            style: ButtonStyle.Primary,
            label: op,
        },
        async execute({ api, data: interaction, state: userId }) {
            if (!(await ensureSameUser(api, interaction, userId))) return;

            let math = getMathLine(interaction.message.content);

            if (ZEROS_REGEX.test(math)) {
                math = math.replace(ZEROS_REGEX, '');
            }

            if (math.includes(' ')) {
                math = `${evaluateMath(math)}`;
            }

            math += ` ${op} 0`;
            math = ensureNoLetters(math);

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

export const operationButtons = ['+', '-', '*', '/'].reduce(
    (obj, op) => {
        obj[op] = createOperationButton(op);
        return obj;
    },
    {} as Record<string, StatefulInteraction<Button>>,
);
