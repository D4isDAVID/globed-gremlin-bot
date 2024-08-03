const OPERATIONS = {
    '/': (a, b) => a / b,
    '*': (a, b) => a * b,
    '-': (a, b) => a - b,
    '+': (a, b) => a + b,
} satisfies Record<string, (a: number, b: number) => number>;

export function evaluateMath(math: string): number {
    const split = math.split(' ');

    if (split.length === 1) {
        return parseFloat(split[0]!);
    }

    return OPERATIONS[split[1]! as keyof typeof OPERATIONS]!(
        parseFloat(split[0]!),
        parseFloat(split[2]!),
    );
}
