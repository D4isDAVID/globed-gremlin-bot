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
    const first = pageButton.stateful('1_'); // prevents duplicate ids
    first.emoji = { name: '⏪' };
    if (page <= 1) first.disabled = true;

    const prev = pageButton.stateful(`${page - 1}`);
    prev.emoji = { name: '⬅️' };
    if (page - 1 <= 0) prev.disabled = true;

    const refresh = pageButton.stateful(`${page}`);
    refresh.emoji = { name: '🔃' };

    const next = pageButton.stateful(`${page + 1}`);
    next.emoji = { name: '➡️' };
    if (page + 1 > totalPages) next.disabled = true;

    const last = pageButton.stateful(`${totalPages}__`); // prevents duplicate ids
    last.emoji = { name: '⏩' };
    if (page >= totalPages) last.disabled = true;

    return {
        type: ComponentType.ActionRow,
        components: [first, prev, refresh, next, last],
    };
};
