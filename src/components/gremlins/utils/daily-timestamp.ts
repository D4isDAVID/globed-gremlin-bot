import { TimestampStyles, time } from '@discordjs/formatters';

export const constantTimeDisplay = (hour: number, minute: number): string =>
    `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

export const timestampDisplay = (hour: number, minute: number): string =>
    time(hour * 60 * 60 + minute * 60, TimestampStyles.ShortTime);
