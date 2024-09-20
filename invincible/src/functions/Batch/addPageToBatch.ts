import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { errorHandler } from '../../utils/errorHandler.util';
import { connectToDB } from '../../config/db.config';
import { successReturn } from '../../utils/successReturn.util';
import { validate } from '../../validator';
import CustomError from '../../utils/CustomError.util';
import { findBatchWithPage, findBatchWithLeastPages, updateBatchPages } from '../../repository/batch.repository';
import { checkIGPageExists } from '../../repository/igpage.repository';

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        await connectToDB();

        const { page: pageName } = JSON.parse(event.body || '{}');

        if (!pageName) throw new CustomError('Page name is required', 400);

        validate('page', pageName);

        // Find the page by name
        const page = await checkIGPageExists({ name: pageName });
        if (!page) throw new CustomError('Page not found', 404);

        // Check if the page already exists in any batch
        const existingBatch = await findBatchWithPage({ pageId: page._id });
        if (existingBatch) throw new CustomError('Page already exists in a batch', 400);

        // Find the batch with the least number of pages
        const batchWithLeastPages = await findBatchWithLeastPages();
        if (!batchWithLeastPages) throw new CustomError('Batch not found', 404);

        // Add the page to the batch
        const updatedBatch = await updateBatchPages({
            batchId: batchWithLeastPages._id,
            pageId: page._id,
        });

        return successReturn('Page added to batch successfully', updatedBatch!);
    } catch (error) {
        return errorHandler(error);
    }
};
