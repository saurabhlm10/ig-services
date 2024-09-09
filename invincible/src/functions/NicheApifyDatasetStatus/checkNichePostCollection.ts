import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { errorHandler } from '../../utils/errorHandler.util';
import { connectToDB } from '../../config/db.config';
import { validate } from '../../validator';
import CustomError from '../../utils/CustomError.util';
import { successReturn } from '../../utils/successReturn.util';
import { getNicheApifyDatasetStatus } from '../../repository/nicheApifyDatasetStatus.repository';
import { getAllNicheCollectionPages } from '../../repository/collectionIGPage.repository';

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        await connectToDB();

        const data = event.pathParameters;

        const { nicheId, month, year } = data as { nicheId: string; month: string; year: string };

        validate('nicheId', nicheId, true);
        validate('month', month);
        validate('year', year);

        const yearInNumber = Number(year);

        // Get NicheApifyDatasetStatus
        const nicheApifyDatasetStatus = await getNicheApifyDatasetStatus({ nicheId, month, year: yearInNumber });

        if (!nicheApifyDatasetStatus) throw new CustomError(`NicheApifyDatasetStatus ${nicheId} not found`, 404);

        // Get All Niche Collection Pages
        const nicheCollectionPages = await getAllNicheCollectionPages({ nicheId });

        let message = 'Niche Collection Not Completed';
        let completed = false;

        // Compare
        if (nicheApifyDatasetStatus.completedCollectionPages.length === nicheCollectionPages.length) {
            message = 'Niche Collection Completed';
            completed = true;
        }
        return successReturn('Got Niche Completed Status Successfully', { message, completed });
        // Send Response
    } catch (error) {
        return errorHandler(error);
    }
};
