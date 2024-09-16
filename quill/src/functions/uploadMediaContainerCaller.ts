import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { successReturn } from '../utils/successReturn.util';
import { errorHandler } from '../utils/errorHandler.util';

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        // Get All Pages

        // Get time, day, month, year

        return successReturn('Ok');
    } catch (err: unknown) {
        return errorHandler(err);
    }
};
