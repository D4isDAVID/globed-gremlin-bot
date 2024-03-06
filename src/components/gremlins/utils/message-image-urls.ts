import { APIMessage, EmbedType } from '@discordjs/core';

export const getMessageImageUrls = async (
    message: APIMessage,
): Promise<string[]> => {
    const urls: string[] = [];

    for (const attachment of message.attachments) {
        if (!attachment.content_type?.startsWith('image')) continue;
        urls.push(attachment.url);
    }

    await Promise.all(
        message.embeds.map(async (embed) => {
            if (!embed.url) return;
            if (!embed.thumbnail?.url) return;
            if (embed.url !== embed.thumbnail.url) return;

            // deprecated but useful for now
            if (embed.type && embed.type === EmbedType.Image) {
                urls.push(embed.url);
                return;
            }

            const response = await fetch(embed.url, { method: 'HEAD' });
            if (!response.ok) return;
            if (!response.headers.get('Content-Type')?.startsWith('image'))
                return;

            urls.push(embed.url);
        }),
    );

    return urls;
};
