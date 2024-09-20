import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { errorHandler } from '../../utils/errorHandler.util';
import { connectToDB } from '../../config/db.config';
import { successReturn } from '../../utils/successReturn.util';
import { validate } from '../../validator';
import CustomError from '../../utils/CustomError.util';
import { getPageWithBatch } from '../../repository/batch.repository';

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        await connectToDB();

        const { page } = event.pathParameters || {};

        if (!page) throw new CustomError('Page parameter is required', 400);

        validate('page', page);

        const result = await getPageWithBatch({ pageName: page });

        if (!result.length) {
            throw new CustomError('Page or batch not found', 404);
        }

        return successReturn('Access token retrieved successfully', {
            encrypted_access_token: result[0].batch.encrypted_access_token,
        });
    } catch (error) {
        return errorHandler(error);
    }
};
