import { ButtonStyle, ComponentType } from '@discordjs/core';
import { Button } from '../../../../../../data.js';
import { createStatefulInteraction } from '../../../../../../stateful.js';
import { editDurationCancelButton } from './cancel-button.js';
import { editDurationStringSelect } from './string-select.js';

export const editDurationButton = createStatefulInteraction<Button>({
    data: {
        type: ComponentType.Button,
        style: ButtonStyle.Secondary,
        custom_id: 'forumpolls_edit_duration_prompt',
        emoji: { name: '⏳' },
        label: 'Edit duration',
    },
    async execute({ data: interaction, api, state: channelId }) {
        await api.interactions.updateMessage(
            interaction.id,
            interaction.token,
            {
                content: 'Select a poll duration:',
                embeds: [],
                components: [
                    {
                        type: ComponentType.ActionRow,
                        components: [
                            editDurationStringSelect.stateful(channelId),
                        ],
                    },
                    {
                        type: ComponentType.ActionRow,
                        components: [
                            editDurationCancelButton.stateful(channelId),
                        ],
                    },
                ],
            },
        );
    },
});
