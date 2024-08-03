import {
    APIInteractionResponseCallbackData,
    ApplicationCommandOptionType,
    ApplicationCommandType,
    ComponentType,
    MessageFlags,
} from '@discordjs/core';
import { codeBlock } from '@discordjs/formatters';
import { ChatInputCommand } from '../../data.js';
import { mapChatInputOptionValues } from '../../interactions.js';
import { backspaceButton } from './buttons/backspace.js';
import { clearEntryButton } from './buttons/clear-entry.js';
import { clearButton } from './buttons/clear.js';
import { closeButton } from './buttons/close.js';
import { decimalButton } from './buttons/decimal.js';
import { evaluateButton } from './buttons/evaluate.js';
import { numberButtons } from './buttons/numbers.js';
import { operationButtons } from './buttons/operations.js';

export const calculatorCommand = {
    data: {
        type: ApplicationCommandType.ChatInput,
        name: 'calculator',
        description: 'Open a calculator',
        options: [
            {
                type: ApplicationCommandOptionType.Boolean,
                name: 'private',
                description: 'Whether to privately open the calculator',
                required: false,
            },
        ],
    },
    async execute({ api, data: interaction }) {
        const { private: ephemeral } = mapChatInputOptionValues(
            interaction.data,
        ) as { private: boolean };

        const user = interaction.user ?? interaction.member!.user;

        const data: APIInteractionResponseCallbackData = {
            content: codeBlock('0'),
            components: [
                {
                    type: ComponentType.ActionRow,
                    components: [
                        clearEntryButton.stateful(user.id),
                        clearButton.stateful(user.id),
                        backspaceButton.stateful(user.id),
                        operationButtons['/']!.stateful(user.id),
                    ],
                },
                {
                    type: ComponentType.ActionRow,
                    components: [
                        numberButtons[7]!.stateful(user.id),
                        numberButtons[8]!.stateful(user.id),
                        numberButtons[9]!.stateful(user.id),
                        operationButtons['*']!.stateful(user.id),
                    ],
                },
                {
                    type: ComponentType.ActionRow,
                    components: [
                        numberButtons[4]!.stateful(user.id),
                        numberButtons[5]!.stateful(user.id),
                        numberButtons[6]!.stateful(user.id),
                        operationButtons['-']!.stateful(user.id),
                    ],
                },
                {
                    type: ComponentType.ActionRow,
                    components: [
                        numberButtons[1]!.stateful(user.id),
                        numberButtons[2]!.stateful(user.id),
                        numberButtons[3]!.stateful(user.id),
                        operationButtons['+']!.stateful(user.id),
                    ],
                },
                {
                    type: ComponentType.ActionRow,
                    components: [
                        closeButton.stateful(user.id),
                        numberButtons[0]!.stateful(user.id),
                        decimalButton.stateful(user.id),
                        evaluateButton.stateful(user.id),
                    ],
                },
            ],
        };

        if (ephemeral) {
            data.flags = MessageFlags.Ephemeral;
        }

        await api.interactions.reply(interaction.id, interaction.token, data);
    },
} satisfies ChatInputCommand;
