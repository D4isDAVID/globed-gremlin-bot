import {
    APIActionRowComponent,
    APIMessageActionRowComponent,
    ComponentType,
} from '@discordjs/core';
import { ForumPoll } from '@prisma/client';
import { deleteButton } from './components/delete/button.js';
import { editPollButton } from './components/edit-poll/button.js';
import { manageAnswersButton } from './components/manage-answers/button.js';
import { reloadButton } from './components/reload-button.js';

export function components(
    forumPoll: ForumPoll,
): APIActionRowComponent<APIMessageActionRowComponent>[] {
    return [
        {
            type: ComponentType.ActionRow,
            components: [
                editPollButton.stateful(forumPoll.channelId),
                manageAnswersButton.stateful(forumPoll.channelId),
                deleteButton.stateful(forumPoll.channelId),
            ],
        },
        {
            type: ComponentType.ActionRow,
            components: [reloadButton.stateful(forumPoll.channelId)],
        },
    ];
}
