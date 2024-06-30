export function isLastDayOfMonth(date: Date) {
    const cloned = new Date(date);
    cloned.setUTCDate(cloned.getUTCDate() + 1);
    return cloned.getUTCDate() === 1;
}
