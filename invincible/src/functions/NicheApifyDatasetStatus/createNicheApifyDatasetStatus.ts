import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { connectToDB } from '../../config/db.config';
import { checkNicheExists } from '../../repository/niche.repository';
import {
    createNicheApifyDatasetStatus,
    getNicheApifyDatasetStatus,
} from '../../repository/nicheApifyDatasetStatus.repository';
import { errorHandler } from '../../utils/errorHandler.util';
import { successReturn } from '../../utils/successReturn.util';
import CustomError from '../../utils/CustomError.util';
import { validate } from '../../validator';

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        await connectToDB();
        const data = JSON.parse(event.body || '');

        const { nicheId, month, year } = data as { nicheId: string; month: string; year: number };

        validate('nicheId', nicheId, true);
        validate('month', month);
        validate('year', year);

        // Validate Niche
        const niche = await checkNicheExists({ _id: nicheId });

        if (!niche) throw new CustomError('Niche not valid', 400);

        // Find already exists
        const exists = await getNicheApifyDatasetStatus({ nicheId, month, year });

        if (exists) throw new CustomError('NicheApifyDatasetStatus already exists', 400);

        const createdNicheApifyDatasetStatus = await createNicheApifyDatasetStatus(data);

        return successReturn('Niche created successfully', createdNicheApifyDatasetStatus);
    } catch (err) {
        return errorHandler(err);
    }
};
