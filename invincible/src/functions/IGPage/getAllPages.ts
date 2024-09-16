import { APIGatewayProxyResult } from 'aws-lambda';
import { connectToDB } from '../../config/db.config';
import { errorHandler } from '../../utils/errorHandler.util';
import { successReturn } from '../../utils/successReturn.util';
import { getAllPages } from '../../repository/igpage.repository';

export const lambdaHandler = async (): Promise<APIGatewayProxyResult> => {
    try {
        await connectToDB();

        const pages = await getAllPages();

        return successReturn('Fetched All Pages successfully', pages);
    } catch (err) {
        return errorHandler(err);
    }
};
