import { APIGatewayProxyResult } from 'aws-lambda';
import { errorHandler } from '../../utils/errorHandler.util';
import { connectToDB } from '../../config/db.config';
import { successReturn } from '../../utils/successReturn.util';
import { getAllBatches } from '../../repository/batch.repository';

export const lambdaHandler = async (): Promise<APIGatewayProxyResult> => {
    try {
        await connectToDB();

        const batches = await getAllBatches();

        if (batches.length === 0) {
            return successReturn('No batches found.', [], 404);
        }

        return successReturn('Batches retrieved successfully', batches);
    } catch (error) {
        return errorHandler(error);
    }
};
