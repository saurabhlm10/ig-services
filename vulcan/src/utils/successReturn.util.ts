import { APIGatewayProxyResult } from 'aws-lambda';

export function successReturn(message: string, data: object = {}, statusCode = 200): APIGatewayProxyResult {
    return {
        statusCode,
        body: JSON.stringify({
            message,
            data,
        }),
    };
}
