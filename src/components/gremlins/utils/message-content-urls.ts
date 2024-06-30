import { APIMessage, EmbedType } from '@discordjs/core';

const EMBED_TYPES = [EmbedType.Image, EmbedType.Video];
const CONTENT_TYPES = ['image', 'video'];

export const getMessageContentUrls = async (
    message: APIMessage,
): Promise<string[]> => {
    const urls: string[] = [];

    for (const attachment of message.attachments) {
        if (
            !CONTENT_TYPES.includes(
                attachment.content_type?.split('/')[0] ?? '',
            )
        )
            continue;
        urls.push(attachment.url);
    }

    await Promise.all(
        message.embeds.map(async (embed) => {
            const url = embed.video?.url || embed.thumbnail?.url;
            if (!url) return;

            // deprecated but useful for now
            if (embed.type && EMBED_TYPES.includes(embed.type)) {
                urls.push(url);
                return;
            }

            const response = await fetch(url, { method: 'HEAD' });
            if (!response.ok) return;
            if (
                !CONTENT_TYPES.includes(
                    response.headers.get('Content-Type')?.split('/')[0] ?? '',
                )
            )
                return;

            urls.push(url);
        }),
    );

    return urls;
};
