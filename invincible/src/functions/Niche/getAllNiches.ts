import { APIGatewayProxyResult } from 'aws-lambda';
import { errorHandler } from '../../utils/errorHandler.util';
import { successReturn } from '../../utils/successReturn.util';
import { getAllNiches } from '../../repository/niche.repository';
import { connectToDB } from '../../config/db.config';

export const lambdaHandler = async (): Promise<APIGatewayProxyResult> => {
    await connectToDB();
    try {
        const niches = await getAllNiches();

        return successReturn('Fetched All Niches Successfully', niches);
    } catch (error) {
        return errorHandler(error);
    }
};
