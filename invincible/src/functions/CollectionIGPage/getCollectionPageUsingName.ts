import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { errorHandler } from '../../utils/errorHandler.util';
import { connectToDB } from '../../config/db.config';
import { validate } from '../../validator';
import { getCollectionPageUsingName } from '../../repository/collectionIGPage.repository';
import CustomError from '../../utils/CustomError.util';
import { successReturn } from '../../utils/successReturn.util';

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        await connectToDB();

        const data = event.pathParameters;

        const { collectionPageName } = data as { collectionPageName: string };

        validate('collectionPageName', collectionPageName);

        // Get Collection Page
        const collectionIGPage = await getCollectionPageUsingName({ username: collectionPageName });

        if (!collectionIGPage) throw new CustomError(`CollectionIGPage name: ${collectionPageName} Not Found`, 404);

        return successReturn('Fetched CollectionIGPage successfully', collectionIGPage);
    } catch (error) {
        return errorHandler(error);
    }
};
