import { Component } from '../data.js';
import { backspaceButton } from './command/buttons/backspace.js';
import { clearEntryButton } from './command/buttons/clear-entry.js';
import { clearButton } from './command/buttons/clear.js';
import { closeButton } from './command/buttons/close.js';
import { decimalButton } from './command/buttons/decimal.js';
import { evaluateButton } from './command/buttons/evaluate.js';
import { numberButtons } from './command/buttons/numbers.js';
import { operationButtons } from './command/buttons/operations.js';
import { calculatorCommand } from './command/index.js';

export default {
    commands: [calculatorCommand],
    messageComponents: [
        clearEntryButton,
        clearButton,
        backspaceButton,
        ...numberButtons,
        ...Object.values(operationButtons),
        closeButton,
        decimalButton,
        evaluateButton,
    ],
} satisfies Component;
