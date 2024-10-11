import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { errorHandler } from '../../utils/errorHandler.util';
import { connectToDB } from '../../config/db.config';
import { successReturn } from '../../utils/successReturn.util';
import CustomError from '../../utils/CustomError.util';
import { updatePostsDateAndTime, updateRawPost } from '../../repository/rawPost.repository';
import { UpdateQuery } from 'mongoose';
import { IRawPost } from '../../models/RawPost.model';
import { validate } from '../../validator';

interface IUpdatePostParams {
    id: string;
}

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const { id } = (event.queryStringParameters || {}) as unknown as IUpdatePostParams;

    const body = JSON.parse(event.body ?? '') as UpdateQuery<IRawPost>;

    console.log('body', body);

    try {
        await connectToDB();

        validate('id', id, true);

        const updatedRawPost = await updateRawPost({ id, updateData: body });

        return successReturn(`Updated RawPost Successfully`, updatedRawPost ?? {});
    } catch (error) {
        return errorHandler(error);
    }
};
