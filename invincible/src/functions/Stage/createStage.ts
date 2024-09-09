import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { errorHandler } from '../../utils/errorHandler.util';
import { connectToDB } from '../../config/db.config';
import { successReturn } from '../../utils/successReturn.util';
import { validate } from '../../validator';
import { checkStageExists, createStage } from '../../repository/stage.repository';
import CustomError from '../../utils/CustomError.util';

interface Body {
    name: string;
    postsRequired: string;
}

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        await connectToDB();

        const body = JSON.parse(event.body || '') as Body;

        const { name, postsRequired } = body;

        validate('name', name);
        validate('postsRequired', postsRequired);

        // Check Stage Already Exists
        const checkStageAlreadyExists = await checkStageExists({ name });

        if (checkStageAlreadyExists) throw new CustomError('Stage Already Exists', 400);

        const createdStage = await createStage({ ...body, postsRequired: Number(postsRequired) });

        return successReturn('Stage Created Successfully', createdStage);
    } catch (error) {
        return errorHandler(error);
    }
};
