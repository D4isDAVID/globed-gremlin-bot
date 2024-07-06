import { formatEmoji } from '@discordjs/formatters';

export function parseEmoji(str: string): {
    id: string | null;
    name: string | null;
} {
    const customMatch = /^<:(.*):(.*)>$/.exec(str);
    if (customMatch) {
        return { id: customMatch[2] ?? null, name: customMatch[1] ?? null };
    }

    const emojiMatch = /^\p{Emoji_Presentation}$/u.exec(str);
    if (emojiMatch) {
        return { id: null, name: str };
    }

    return { id: null, name: null };
}

export function stringifyEmoji(
    name?: string | null,
    id?: string | null,
): string | undefined {
    if (!name) return;
    return id ? formatEmoji(id) : name;
}
