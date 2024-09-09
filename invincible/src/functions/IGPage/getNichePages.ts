import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { connectToDB } from '../../config/db.config';
import { validate } from '../../validator';
import { errorHandler } from '../../utils/errorHandler.util';
import { successReturn } from '../../utils/successReturn.util';
import { getNichePages } from '../../repository/igpage.repository';

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        await connectToDB();
        const queryParams = event.pathParameters;

        const { nicheId } = queryParams as { nicheId: string };

        validate('nicheId', nicheId, true);

        const niche = await getNichePages({ nicheId });

        return successReturn('Fetched Niche Pages successfully', niche);
    } catch (err) {
        return errorHandler(err);
    }
};
