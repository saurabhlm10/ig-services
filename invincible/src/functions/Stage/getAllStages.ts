import { APIGatewayProxyResult } from 'aws-lambda';
import { errorHandler } from '../../utils/errorHandler.util';
import { connectToDB } from '../../config/db.config';
import { successReturn } from '../../utils/successReturn.util';
import { getAllStages } from '../../repository/stage.repository';

export const lambdaHandler = async (): Promise<APIGatewayProxyResult> => {
    try {
        await connectToDB();

        const allStages = await getAllStages();

        return successReturn('Fetched All Stages Successfully', allStages);
    } catch (error) {
        return errorHandler(error);
    }
};
