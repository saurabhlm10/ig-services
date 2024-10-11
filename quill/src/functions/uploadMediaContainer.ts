import { APIGatewayProxyResult, SQSEvent } from 'aws-lambda';
import { errorHandler } from '../utils/errorHandler.util';
import { successReturn } from '../utils/successReturn.util';
import { apiHandler } from '../utils/apiHandler.util';
import { decrypt } from '../helpers/decrypt';
import { getPostFromApify } from '../helpers/getPostFromApify';
import { uploadMedia } from '../helpers/uploadMedia';
import AWS from 'aws-sdk';
const sqs = new AWS.SQS();

interface IMessage {
    page: string;
    time: string;
    day: number;
    month: string;
    year: number;
}

interface ISecrets {
    _id: string;
    page: string;
    encrypted_apify_key: string;
    ig_user_id: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

interface IPost {
    originalVideoPublishSchedule: {
        month: string;
        year: number;
    };
    schedule: {
        month: string;
        year: number;
        day: number;
        time: string;
    };
    _id: string;
    originalViews: number;
    nicheId: string;
    source_url: string;
    source: string;
    caption: string;
    video_url: string;
    cover_url: string;
    media_url: string;
    mediaType: string;
    ownerUsername: string;
    __v: number;
    createdAt: string;
    updatedAt: string;
    page: string;
}

interface IGetPageAccessTokenResponse {
    encrypted_access_token: string;
}

interface IPublishPostMessageBody {
    encrypted_access_token: string;
    ig_user_id: string;
    creation_id: string;
    currentPostId: string;
}

export const lambdaHandler = async (event: SQSEvent): Promise<APIGatewayProxyResult> => {
    const quillDelayQueueUrl = process.env.QuillDelayQueueUrl as string;
    try {
        const message = JSON.parse(event.Records[0].body) as IMessage;

        const { page } = message;

        // Get Post
        const getPostUrl = '/rawPosts/one';

        const getPostParams = message;

        const post: IPost = await apiHandler('get', getPostUrl, null, {}, getPostParams);

        // Get Page Apify token
        const getPageSecretsUrl = '/secret';

        const getPageSecretsParams = {
            page,
        };

        const encryptedSecrets: ISecrets = await apiHandler('get', getPageSecretsUrl, null, null, getPageSecretsParams);

        const apify_key = decrypt(encryptedSecrets.encrypted_apify_key);
        const ig_user_id = encryptedSecrets.ig_user_id;

        // Get Post from apify
        const apifyPost = await getPostFromApify(apify_key, post.source_url);

        const videoUrl = apifyPost.videoMeta.downloadAddr;
        const coverUrl = apifyPost.videoMeta.coverUrl;
        const ownerUsername = apifyPost.authorMeta.name;

        // Get page access token
        const getPageAccessTokenUrl = `/page/${page}/access-token`;

        const getPageAccessTokenResponse: IGetPageAccessTokenResponse = await apiHandler('get', getPageAccessTokenUrl);

        const accessToken = decrypt(getPageAccessTokenResponse.encrypted_access_token);

        // Upload Media Container
        const creation_id = await uploadMedia(videoUrl, coverUrl, ig_user_id, page, ownerUsername, accessToken);

        if (creation_id) {
            // Update status in db
            const updateRawPostUrl = '/rawPosts';
            const updateRawPostBody = {
                creation_id,
            };
            const updateRawPostParams = {
                id: post._id,
            };

            await apiHandler('put', updateRawPostUrl, updateRawPostBody, null, updateRawPostParams);

            const publishPostMessageBody: IPublishPostMessageBody = {
                creation_id,
                currentPostId: post._id,
                encrypted_access_token: getPageAccessTokenResponse.encrypted_access_token,
                ig_user_id,
            };

            console.log('publishPostMessageBody', publishPostMessageBody);

            // Add to publish delay queue
            const params = {
                MessageBody: JSON.stringify(publishPostMessageBody),
                QueueUrl: quillDelayQueueUrl,
            };

            await sqs.sendMessage(params).promise();
        }
        return successReturn('Uploaded Media Successfully and added to quill delay queue');
    } catch (error) {
        return errorHandler(error);
    }
};
