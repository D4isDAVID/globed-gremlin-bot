import { APIEmbed } from '@discordjs/core';
import { channelMention, unorderedList } from '@discordjs/formatters';
import { ForumPoll, ForumPollAnswer } from '@prisma/client';
import { stringifyEmoji } from '../../util/emoji.js';

export function embeds(
    forumPoll: ForumPoll & { answers: ForumPollAnswer[] },
): APIEmbed[] {
    const answers =
        forumPoll.answers.length === 0
            ? 'None'
            : unorderedList(
                  forumPoll.answers.map(
                      (p) =>
                          `${stringifyEmoji(p.emojiName, p.emojiId) ?? ''} ${p.text}`,
                  ),
              );

    return [
        {
            title: 'Automatic Forum Poll',
            footer: { text: 'Last Updated' },
            timestamp: new Date().toISOString(),
            fields: [
                {
                    name: 'Question',
                    value: forumPoll.question,
                    inline: true,
                },
                {
                    name: 'Answers',
                    value: answers,
                    inline: true,
                },
                {
                    name: 'Channel',
                    value: channelMention(forumPoll.channelId),
                    inline: true,
                },
                {
                    name: 'Duration',
                    value: `${forumPoll.duration} hour(s)`,
                    inline: true,
                },
                {
                    name: 'Allow Multiselect',
                    value: forumPoll.allowMultiselect ? '✅ Yes' : '❌ No',
                    inline: true,
                },
                {
                    name: 'Pin',
                    value: forumPoll.pin ? '📌 Yes' : '❌ No',
                    inline: true,
                },
            ],
        },
    ];
}

export function getQuestionFromEmbeds(embeds: APIEmbed[]): string {
    return embeds[0]!.fields![0]!.value;
}
