export function getMathLine(content: string): string {
    return [/^```\n/, /\n```$/].reduce((c, r) => c.replace(r, ''), content);
}
