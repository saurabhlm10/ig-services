import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { errorHandler } from '../../utils/errorHandler.util';
import { connectToDB } from '../../config/db.config';
import { successReturn } from '../../utils/successReturn.util';
import { validate } from '../../validator';
import CustomError from '../../utils/CustomError.util';
import { encrypt } from '../../helpers/encrypt';
import { createBatch } from '../../repository/batch.repository';

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        await connectToDB();

        const { name, access_token } = JSON.parse(event.body ?? '{}');

        if (!(name && access_token)) {
            throw new CustomError('name and access_token required', 400);
        }

        validate('name', name);
        validate('access_token', access_token);

        const encrypted_access_token = encrypt(access_token);

        const createdBatch = await createBatch({ name, encrypted_access_token });

        return successReturn('Batch created successfully', createdBatch, 201);
    } catch (error) {
        return errorHandler(error);
    }
};
