import { ButtonStyle, ComponentType } from '@discordjs/core';
import { codeBlock } from '@discordjs/formatters';
import { Button } from '../../../data.js';
import { createStatefulInteraction } from '../../../stateful.js';
import { ensureNoLetters } from '../../util/ensure-no-letters.js';
import { ensureSameUser } from '../../util/ensure-same-user.js';
import { evaluateMath } from '../../util/evaluate.js';
import { getMathLine } from '../../util/math.js';

export const evaluateButton = createStatefulInteraction<Button>({
    data: {
        type: ComponentType.Button,
        custom_id: `calculator_evaluate`,
        style: ButtonStyle.Success,
        label: '=',
    },
    async execute({ api, data: interaction, state: userId }) {
        if (!(await ensureSameUser(api, interaction, userId))) return;

        let math = getMathLine(interaction.message.content);
        math = ensureNoLetters(math);

        await api.interactions.updateMessage(
            interaction.id,
            interaction.token,
            {
                content: codeBlock(`${evaluateMath(math)}`),
            },
        );
    },
});
