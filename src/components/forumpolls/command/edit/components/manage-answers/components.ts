import {
    APIActionRowComponent,
    APIMessageActionRowComponent,
    ComponentType,
} from '@discordjs/core';
import { ForumPoll } from '@prisma/client';
import { backButton } from '../back-button.js';
import { addAnswerButton } from './add-answer/button.js';
import { deleteAnswerButton } from './delete-answer/button.js';
import { editAnswerButton } from './edit-answer/button.js';

export function manageAnswersComponents(
    forumPoll: ForumPoll,
): APIActionRowComponent<APIMessageActionRowComponent>[] {
    return [
        {
            type: ComponentType.ActionRow,
            components: [
                addAnswerButton.stateful(forumPoll.channelId),
                editAnswerButton.stateful(forumPoll.channelId),
                deleteAnswerButton.stateful(forumPoll.channelId),
            ],
        },
        {
            type: ComponentType.ActionRow,
            components: [backButton.stateful(forumPoll.channelId)],
        },
    ];
}
