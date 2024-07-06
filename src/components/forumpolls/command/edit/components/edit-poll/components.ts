import {
    APIActionRowComponent,
    APIMessageActionRowComponent,
    ComponentType,
} from '@discordjs/core';
import { ForumPoll } from '@prisma/client';
import { backButton } from '../back-button.js';
import { editDurationButton } from './edit-duration/button.js';
import { editQuestionButton } from './edit-question/button.js';
import { multiselectDisableButton } from './multiselect/disable-button.js';
import { multiselectEnableButton } from './multiselect/enable-button.js';
import { pinDisableButton } from './pin/disable-button.js';
import { pinEnableButton } from './pin/enable-button.js';

export function editPollComponents(
    forumPoll: ForumPoll,
): APIActionRowComponent<APIMessageActionRowComponent>[] {
    return [
        {
            type: ComponentType.ActionRow,
            components: [
                editQuestionButton.stateful(forumPoll.channelId),
                editDurationButton.stateful(forumPoll.channelId),
                (forumPoll.allowMultiselect
                    ? multiselectDisableButton
                    : multiselectEnableButton
                ).stateful(forumPoll.channelId),
                (forumPoll.pin ? pinDisableButton : pinEnableButton).stateful(
                    forumPoll.channelId,
                ),
            ],
        },
        {
            type: ComponentType.ActionRow,
            components: [backButton.stateful(forumPoll.channelId)],
        },
    ];
}
