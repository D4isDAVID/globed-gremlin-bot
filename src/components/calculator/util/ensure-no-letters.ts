const LETTERS_REGEX = /[A-Za-z]+/;

export function ensureNoLetters(math: string): string {
    return LETTERS_REGEX.test(math) ? '0' : math;
}
