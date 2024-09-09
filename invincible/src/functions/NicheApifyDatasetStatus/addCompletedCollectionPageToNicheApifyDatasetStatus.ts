import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { connectToDB } from '../../config/db.config';
import { errorHandler } from '../../utils/errorHandler.util';
import { successReturn } from '../../utils/successReturn.util';
import CustomError from '../../utils/CustomError.util';
import { validate } from '../../validator';
import {
    checkCollectionPageInNicheApifyDatasetStatus,
    getNicheApifyDatasetStatus,
    updateNicheApifyDatasetStatus,
} from '../../repository/nicheApifyDatasetStatus.repository';
import { checkCollectionPageExists } from '../../repository/collectionIGPage.repository';

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        await connectToDB();

        const body = JSON.parse(event.body || '');

        const { nicheId, month, year, collectionPageId } = body as {
            nicheId: string;
            month: string;
            year: string;
            collectionPageId: string;
        };

        validate('nicheId', nicheId, true);
        validate('month', month);
        validate('year', year);
        validate('collectionPageId', collectionPageId, true);

        const yearInNumber = Number(year);

        // Check NicheApifyDatasetStatusExists
        const nicheApifyDatasetStatusExists = await getNicheApifyDatasetStatus({ nicheId, month, year: yearInNumber });
        if (!nicheApifyDatasetStatusExists) throw new CustomError('NicheApifyDatasetStatus not found', 404);

        // Check Collection Page Exists
        const collectionPageExists = await checkCollectionPageExists({ id: collectionPageId });
        if (!collectionPageExists) throw new CustomError('Collection Page not found', 404);

        const checkCollectionPageAlreadyInNicheApifyDatasetStatus = await checkCollectionPageInNicheApifyDatasetStatus({
            nicheId,
            month,
            year: yearInNumber,
            collectionPageId,
        });
        if (checkCollectionPageAlreadyInNicheApifyDatasetStatus)
            return successReturn(`Collection Page ${collectionPageId} already in NicheApifyDatasetStatus `);

        const updatedNicheApifyDatasetStatus = await updateNicheApifyDatasetStatus({
            identifier: { nicheId, month, year: yearInNumber },
            updateData: { $push: { completedCollectionPages: collectionPageId } },
            options: { new: true },
        });

        return successReturn(`Added Collection Page ${collectionPageId} successfully`, updatedNicheApifyDatasetStatus);
    } catch (error) {
        return errorHandler(error);
    }
};
