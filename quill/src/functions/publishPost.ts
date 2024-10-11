import { APIGatewayProxyResult, SQSEvent } from 'aws-lambda';
import { errorHandler } from '../utils/errorHandler.util';
import { successReturn } from '../utils/successReturn.util';
import { decrypt } from '../helpers/decrypt';
import { publishMedia } from '../helpers/publishMedia';
import { apiHandler } from '../utils/apiHandler.util';

interface IMessage {
    encrypted_access_token: string;
    ig_user_id: string;
    creation_id: string;
    currentPostId: string;
}

export const lambdaHandler = async (event: SQSEvent): Promise<APIGatewayProxyResult> => {
    try {
        const message = JSON.parse(event.Records[0].body) as IMessage;

        const { encrypted_access_token, currentPostId, ig_user_id, creation_id } = message;

        const access_token = decrypt(encrypted_access_token);

        const published_id = await publishMedia({ creation_id, currentPostId, ig_user_id, access_token });

        if (published_id) {
            // Update status in db
            const updateRawPostUrl = '/rawposts';
            const updateRawPostParams = {
                id: currentPostId,
            };
            const updateRawPostBody = {
                published_id,
            };

            await apiHandler('put', updateRawPostUrl, updateRawPostBody, null, updateRawPostParams);
        }

        return successReturn('Published Post Successfully');
    } catch (error) {
        return errorHandler(error);
    }
};
