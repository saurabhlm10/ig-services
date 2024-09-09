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

const mongoUri = process.env.MongoUri || '';

export const ENV = {
    months,
    mongoUri,
};
