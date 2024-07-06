import { APIStringSelectComponent, ComponentType } from '@discordjs/core';
import { StringSelect } from '../../../../../../data.js';
import { createStatefulInteraction } from '../../../../../../stateful.js';
import { parseEmoji, stringifyEmoji } from '../../../../../util/emoji.js';
import { editAnswerModal } from './modal.js';

export const editAnswerStringSelect = createStatefulInteraction<StringSelect>({
    data: {
        type: ComponentType.StringSelect,
        custom_id: 'forumpolls_edit_answer_list',
        options: [],
    },
    async execute({ data: interaction, api, state }) {
        const answerIdRaw = interaction.data.values[0]!;

        const stringSelect = interaction.message.components![0]!
            .components[0] as APIStringSelectComponent;
        const [emojiRaw, ...textRest] = stringSelect.options
            .filter((o) => o.value === answerIdRaw)[0]!
            .label.split(' ');

        const emoji = parseEmoji(emojiRaw!);
        if (emoji.name === null) {
            textRest.unshift(emojiRaw!);
        }
        const text = textRest.join(' ');

        const modal = editAnswerModal.stateful(`${state}_${answerIdRaw}`);
        modal.components[0]!.components[0]!.value =
            stringifyEmoji(emoji.name, emoji.id) ?? '';
        modal.components[1]!.components[0]!.value = text;

        await api.interactions.createModal(
            interaction.id,
            interaction.token,
            modal,
        );
    },
});
