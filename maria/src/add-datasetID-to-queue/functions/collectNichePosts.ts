import { APIGatewayProxyResult, SQSEvent } from 'aws-lambda';
import { errorHandler } from '../utils/errorHandler.util';
import { successReturn } from '../utils/successReturn.util';
import { apiHandler } from '../utils/apiHandler.util';
import { triggerApifyPostCollectionn } from '../helpers/triggerApifyPostCollection';
import { decrypt } from '../helpers/decrypt';

interface IMessage {
    collectionPages: string[];
    nicheId: string;
    nicheName: string;
    pages: string[];
    createdAt: string;
    updatedAt: string;
    encryptedApifyKey: string;
    __v: string;
}

interface INicheCollectionPage {
    _id: string;
    username: string;
    followersCount: number;
    link: string;
    nicheId: string;
    source: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export const lambdaHandler = async (event: SQSEvent): Promise<APIGatewayProxyResult> => {
    const message = JSON.parse(event.Records[0].body);

    const { nicheId, nicheName, encryptedApifyKey } = message as IMessage;
    try {
        // Get all niche collection pages
        const getAllNicheCollectionPagesUrl = '/collectionIGPages';
        const getAllNichePagesCollectionParams = {
            nicheId,
        };
        const nicheCollectionPages: INicheCollectionPage[] = await apiHandler(
            'get',
            getAllNicheCollectionPagesUrl,
            null,
            null,
            getAllNichePagesCollectionParams,
        );

        const nichePagesNames = nicheCollectionPages.map((nicheCollectionPage) => nicheCollectionPage.username);

        // Trigger Apify Post Collection
        await triggerApifyPostCollectionn(decrypt(encryptedApifyKey), nichePagesNames);

        return successReturn('Triggered Apify Post Collection for' + ' ' + nicheName);
    } catch (error) {
        return errorHandler(error);
    }
};
