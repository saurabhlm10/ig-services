import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { connectToDB } from '../../config/db.config';
import { validate } from '../../validator';
import { getNiche } from '../../repository/niche.repository';
import CustomError from '../../utils/CustomError.util';
import { errorHandler } from '../../utils/errorHandler.util';
import { successReturn } from '../../utils/successReturn.util';

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        await connectToDB();
        const queryParams = event.pathParameters;

        const { id } = queryParams as { id: string };

        validate('id', id, true);

        const niche = await getNiche({ nicheId: id });

        if (!niche) throw new CustomError('Cannot find Niche', 404);

        return successReturn('Fetched Niche successfully', niche);
    } catch (err) {
        return errorHandler(err);
    }
};
