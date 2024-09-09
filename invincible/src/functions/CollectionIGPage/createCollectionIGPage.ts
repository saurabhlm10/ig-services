import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { errorHandler } from '../../utils/errorHandler.util';
import { checkNicheExists } from '../../repository/niche.repository';
import CustomError from '../../utils/CustomError.util';
import { successReturn } from '../../utils/successReturn.util';
import { validate } from '../../validator';
import { connectToDB } from '../../config/db.config';
import { createCollectionPage } from '../../repository/collectionIGPage.repository';

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        await connectToDB();

        const body = JSON.parse(event.body || '');

        const { username, followersCount, link, nicheId, source } = body as {
            username: string;
            followersCount: string;
            link: string;
            nicheId: string;
            source: string;
        };

        validate('username', username);
        validate('followersCount', followersCount);
        validate('link', link);
        validate('nicheId', nicheId, true);
        validate('source', source);

        const followersCountNumber = Number(followersCount);

        const nicheExists = await checkNicheExists({ _id: nicheId });
        if (!nicheExists) throw new CustomError('Niche not found', 404);

        if (!(source === 'tiktok' || source === 'instagram'))
            throw new CustomError('Invalid source. Must be: tiktok or instagram', 400);

        const createdCollectionIGPage = await createCollectionPage({
            ...body,
            followersCount: followersCountNumber,
        });

        return successReturn('Created New CollectionIGPage successfully', createdCollectionIGPage);
    } catch (error) {
        return errorHandler(error);
    }
};
