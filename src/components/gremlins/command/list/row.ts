import {
    APIActionRowComponent,
    APIMessageActionRowComponent,
    ComponentType,
} from '@discordjs/core';
import pageButton from './page-button.js';

export default async (
    page: number,
    totalPages: number,
): Promise<APIActionRowComponent<APIMessageActionRowComponent>> => {
    const prev = pageButton.stateful((page - 1).toString());
    prev.emoji = { name: '⬅️' };
    prev.label = 'Previous';
    if (page - 1 <= 0) prev.disabled = true;

    const refresh = pageButton.stateful(page.toString());
    refresh.emoji = { name: '🔃' };
    refresh.label = 'Refresh';

    const next = pageButton.stateful((page + 1).toString());
    next.emoji = { name: '➡️' };
    next.label = 'Next';
    if (page + 1 > totalPages) next.disabled = true;

    return {
        type: ComponentType.ActionRow,
        components: [prev, refresh, next],
    };
};
