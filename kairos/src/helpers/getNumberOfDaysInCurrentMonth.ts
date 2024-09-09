export const getNumberOfDaysInCurrentMonth = () => {
    const today = new Date();
    const startOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const lastDayOfCurrentMonth = new Date(Number(startOfNextMonth) - 1);
    return lastDayOfCurrentMonth.getDate();
};
