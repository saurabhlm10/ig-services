import { APIGatewayProxyResult } from 'aws-lambda';
import { successReturn } from '../utils/successReturn.util';
import { errorHandler } from '../utils/errorHandler.util';
import { apiHandler } from '../utils/apiHandler.util';
import getCurrentDateTimeIST from '../helpers/getCurrentDateTimeIST';
import AWS from 'aws-sdk';

const sqs = new AWS.SQS();
const lambda = new AWS.Lambda();

interface Page {
    name: string;
}

interface Event {
    type?: string;
    pages?: string[];
}

export const lambdaHandler = async (event: Event): Promise<APIGatewayProxyResult> => {
    const quillQueueUrl = process.env.QuillQueueUrl as string;
    const functionName = process.env.AWS_LAMBDA_FUNCTION_NAME as string;

    try {
        if (event?.type && event.type === 'process') {
            // This is a subsequent invocation
            await processMessagesInBatches(event.pages || [], quillQueueUrl, functionName);
        } else {
            // This is the initial invocation
            // Get All Pages
            const getAllPagesUrl = '/igpage/all';
            const rawPages: Page[] = await apiHandler('get', getAllPagesUrl);
            const pages = rawPages.map((page) => page.name);

            // Invoke itself with the pages
            await invokeLambda(pages, functionName);
        }

        return successReturn('Processing started');
    } catch (err: unknown) {
        return errorHandler(err);
    }
};

async function processMessagesInBatches(pages: string[], queueUrl: string, functionName: string): Promise<void> {
    const timeInfo = getCurrentDateTimeIST();

    while (pages.length > 0) {
        const batch = pages.splice(0, 10); // Take up to 10 pages
        const entries = batch.map((page, index) => ({
            Id: `${index}`,
            MessageBody: JSON.stringify({ page, ...timeInfo }),
        }));

        const params = {
            Entries: entries,
            QueueUrl: queueUrl,
        };

        await sqs.sendMessageBatch(params).promise();
    }

    if (pages.length > 0) {
        // If there are remaining pages, invoke the function again
        await invokeLambda(pages, functionName);
    }
}

async function invokeLambda(pages: string[], functionName: string): Promise<void> {
    await lambda
        .invoke({
            FunctionName: functionName,
            InvocationType: 'Event',
            Payload: JSON.stringify({ type: 'process', pages }),
        })
        .promise();
}
