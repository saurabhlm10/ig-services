import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { errorHandler } from '../../utils/errorHandler.util';
import { connectToDB } from '../../config/db.config';
import { successReturn } from '../../utils/successReturn.util';
import { validate } from '../../validator';
import { checkNicheExists } from '../../repository/niche.repository';
import CustomError from '../../utils/CustomError.util';
import { getMonthNicheRawPostsWithPageAssigned } from '../../repository/rawPost.repository';

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        await connectToDB();

        const queryParams = event.pathParameters;

        const { nicheId, month, year } = queryParams as { nicheId: string; month: string; year: string };

        validate('nicheId', nicheId, true);
        validate('month', month);
        validate('year', year);

        const nicheExists = await checkNicheExists({ _id: nicheId });
        if (!nicheExists) throw new CustomError('Niche not found', 404);

        const rawPosts = await getMonthNicheRawPostsWithPageAssigned({ nicheId, month, year: Number(year) });

        return successReturn(
            `Fetched RawPosts for nicheId ${nicheId} month: ${month} year: ${year} successfully`,
            rawPosts,
        );
    } catch (error) {
        return errorHandler(error);
    }
};
