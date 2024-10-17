import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { errorHandler } from '../../utils/errorHandler.util';
import { successReturn } from '../../utils/successReturn.util';
import { connectToDB } from '../../config/db.config';
import { getAllNicheCollectionPages } from '../../repository/collectionIGPage.repository';

interface IGetNicheCollectionPagesParams {
    nicheId: string;
}

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        await connectToDB();

        const { nicheId } = event.queryStringParameters as unknown as IGetNicheCollectionPagesParams;

        const nicheCollectionPages = await getAllNicheCollectionPages({ nicheId });

        return successReturn('Fetched Niche Collection Pages Successfully', nicheCollectionPages);
    } catch (error) {
        return errorHandler(error);
    }
};
