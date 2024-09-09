import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { connectToDB } from '../../config/db.config';
import { checkNicheExists, createNiche } from '../../repository/niche.repository';
import { validate } from '../../validator';
import { errorHandler } from '../../utils/errorHandler.util';
import CustomError from '../../utils/CustomError.util';
import { successReturn } from '../../utils/successReturn.util';

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        await connectToDB();

        const data = JSON.parse(event.body || '');

        const { name } = data;

        validate('name', name);

        // Find already exists
        const exists = await checkNicheExists(data);

        if (exists) throw new CustomError('Niche already exists', 400);

        const createdNiche = await createNiche(data);

        return successReturn('Niche created successfully', createdNiche);
    } catch (err) {
        return errorHandler(err);
    }
};
