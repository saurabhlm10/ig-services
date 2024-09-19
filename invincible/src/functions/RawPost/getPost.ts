import { APIGatewayProxyEvent, APIGatewayProxyEventQueryStringParameters, APIGatewayProxyResult } from 'aws-lambda';
import { errorHandler } from '../../utils/errorHandler.util';
import { successReturn } from '../../utils/successReturn.util';
import { connectToDB } from '../../config/db.config';
import { getPost } from '../../repository/rawPost.repository';
import CustomError from '../../utils/CustomError.util';

interface IParams {
    page: string;
    time: string;
    day: number;
    month: string;
    year: number;
}

function parseParams(params: APIGatewayProxyEventQueryStringParameters | null): IParams {
    if (!params) {
        throw new CustomError('Missing query parameters', 400);
    }

    const { page, time, day, month, year } = params;

    if (!page || !time || !day || !month || !year) {
        throw new CustomError('Missing required query parameters', 400);
    }

    const parsedDay = parseInt(day, 10);
    const parsedYear = parseInt(year, 10);

    if (isNaN(parsedDay) || isNaN(parsedYear)) {
        throw new CustomError('Invalid day or year parameter', 400);
    }

    return {
        page,
        time,
        day: parsedDay,
        month,
        year: parsedYear,
    };
}

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        await connectToDB();

        console.log(typeof event.queryStringParameters);

        const params = parseParams(event.queryStringParameters);

        console.log(params);

        const post = await getPost(params);

        if (!post) {
            throw new CustomError(
                `No Post found for page: ${params.page} time: ${params.time} day: ${params.day} month: ${params.month} year: ${params.year}`,
                404,
            );
        }

        return successReturn('Fetched post successfully', post);
    } catch (error) {
        return errorHandler(error);
    }
};
