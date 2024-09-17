function getCurrentDateTimeIST(): { time: string; day: number; month: string; year: number } {
    // Create a date object in IST
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));

    // Format the time
    let hour = now.getHours();
    const minute = now.getMinutes();

    // Adjust hour based on the 30-minute offset
    if (minute >= 30) {
        hour = (hour + 1) % 24;
    }

    let formattedTime: string;
    if (hour === 0) {
        formattedTime = '12AM';
    } else if (hour < 12) {
        formattedTime = `${hour}AM`;
    } else if (hour === 12) {
        formattedTime = '12PM';
    } else {
        formattedTime = `${hour - 12}PM`;
    }

    // Get the day
    const day = now.getDate();

    // Get the month as a lowercase string
    const months = [
        'january',
        'february',
        'march',
        'april',
        'may',
        'june',
        'july',
        'august',
        'september',
        'october',
        'november',
        'december',
    ];
    const month = months[now.getMonth()];

    // Get the year
    const year = now.getFullYear();

    if (process.env.ENV === 'dev') formattedTime = '6PM';

    return { time: formattedTime, day, month, year };
}

export default getCurrentDateTimeIST;
