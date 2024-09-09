import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { errorHandler } from '../../utils/errorHandler.util';
import { connectToDB } from '../../config/db.config';
import { successReturn } from '../../utils/successReturn.util';
import { checkNicheExists } from '../../repository/niche.repository';
import CustomError from '../../utils/CustomError.util';
import { validate } from '../../validator';
import { getAllNicheRawPosts } from '../../repository/rawPost.repository';

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        await connectToDB();

        const queryParams = event.pathParameters;

        const { nicheId } = queryParams as { nicheId: string };

        validate('nicheId', nicheId, true);

        const nicheExists = await checkNicheExists({ _id: nicheId });

        if (!nicheExists) throw new CustomError('Niche not found', 404);

        const rawPosts = await getAllNicheRawPosts({ nicheId });

        return successReturn(`Fetched RawPosts for nicheId ${nicheId} successfully`, rawPosts);
    } catch (error) {
        return errorHandler(error);
    }
};
