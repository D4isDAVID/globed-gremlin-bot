export function isLastDayOfMonth(date: Date) {
    const cloned = new Date(date);
    cloned.setDate(cloned.getDate() + 1);
    return cloned.getDate() === 1;
}
