import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { errorHandler } from '../../utils/errorHandler.util';
import { connectToDB } from '../../config/db.config';
import { successReturn } from '../../utils/successReturn.util';
import { validate } from '../../validator';
import CustomError from '../../utils/CustomError.util';
import { updateBatchPagesusingName } from '../../repository/batch.repository';

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        await connectToDB();

        const { batchName, pages } = JSON.parse(event.body ?? '{}');

        if (!batchName || !pages) {
            throw new CustomError('batchName and pages are required', 400);
        }

        validate('batchName', batchName);
        validate('pages', pages);

        const updatedBatch = await updateBatchPagesusingName({ batchName, pages });

        if (!updatedBatch) {
            throw new CustomError('Batch not found', 404);
        }

        return successReturn('Batch pages updated successfully', updatedBatch);
    } catch (error) {
        return errorHandler(error);
    }
};
