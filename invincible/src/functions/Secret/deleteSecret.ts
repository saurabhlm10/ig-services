import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { errorHandler } from '../../utils/errorHandler.util';
import { connectToDB } from '../../config/db.config';
import { successReturn } from '../../utils/successReturn.util';
import { validate } from '../../validator';
import { deleteSecretByPage } from '../../repository/secret.repository';
import CustomError from '../../utils/CustomError.util';
import { checkIGPageExists } from '../../repository/igpage.repository';

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        await connectToDB();

        const { page } = event.queryStringParameters || {};

        if (!page) throw new CustomError('Page parameter is required', 400);

        validate('page', page);

        // Check if page exists
        const pageExists = await checkIGPageExists({ name: page });

        if (!pageExists) throw new CustomError('Page not found', 404);

        await deleteSecretByPage({ page });

        return successReturn('Secret deleted successfully');
    } catch (error) {
        return errorHandler(error);
    }
};
