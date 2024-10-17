import { APIGatewayProxyResult } from 'aws-lambda';
import { errorHandler } from '../utils/errorHandler.util';
import { successReturn } from '../utils/successReturn.util';
import { apiHandler } from '../utils/apiHandler.util';
import AWS from 'aws-sdk';

const sqs = new AWS.SQS();
const lambda = new AWS.Lambda();

interface Niche {
    _id: string;
    name: string;
    pages: string[];
    createdAt: string;
    updatedAt: string;
    encrypted_apify_key: string;
    collectionPages: string[];
}

interface Event {
    type?: string;
    niches?: Niche[];
}

export const lambdaHandler = async (event: Event): Promise<APIGatewayProxyResult> => {
    const nicheQueueUrl = process.env.MariaCollectTriggerQueueUrl as string;
    const functionName = process.env.AWS_LAMBDA_FUNCTION_NAME as string;

    try {
        if (event?.type && event.type === 'process') {
            // This is a subsequent invocation
            await processMessagesInBatches(event.niches || [], nicheQueueUrl, functionName);
        } else {
            // This is the initial invocation
            // Get All Niches
            const getAllNichesUrl = '/niche/all';
            const niches: Niche[] = await apiHandler('get', getAllNichesUrl);

            console.log(niches[0]);

            // Invoke itself with the niches
            await invokeLambda(niches, functionName);
        }

        return successReturn('Processing started');
    } catch (err: unknown) {
        return errorHandler(err);
    }
};

async function processMessagesInBatches(niches: Niche[], queueUrl: string, functionName: string): Promise<void> {
    while (niches.length > 0) {
        const batch = niches.splice(0, 10); // Take up to 10 niches
        const entries = batch.map((niche, index) => ({
            Id: `${index}`,
            MessageBody: JSON.stringify({
                nicheId: niche._id,
                nicheName: niche.name,
                pages: niche.pages,
                encryptedApifyKey: niche.encrypted_apify_key,
            }),
        }));

        const params = {
            Entries: entries,
            QueueUrl: queueUrl,
        };

        await sqs.sendMessageBatch(params).promise();
    }

    if (niches.length > 0) {
        // If there are remaining niches, invoke the function again
        await invokeLambda(niches, functionName);
    }
}

async function invokeLambda(niches: Niche[], functionName: string): Promise<void> {
    await lambda
        .invoke({
            FunctionName: functionName,
            InvocationType: 'Event',
            Payload: JSON.stringify({ type: 'process', niches }),
        })
        .promise();
}
