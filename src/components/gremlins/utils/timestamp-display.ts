import { TimestampStyles, inlineCode, time } from '@discordjs/formatters';

export const constantTimeDisplay = (hour: number, minute: number): string =>
    inlineCode(
        `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
    );

export const timestampDisplay = (hour: number, minute: number): string => {
    const today = new Date();
    today.setUTCHours(hour, minute, 0, 0);
    return time(Math.floor(today.getTime() / 1000), TimestampStyles.ShortTime);
};
