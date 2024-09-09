import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { errorHandler } from '../../utils/errorHandler.util';
import { connectToDB } from '../../config/db.config';
import { successReturn } from '../../utils/successReturn.util';
import CustomError from '../../utils/CustomError.util';
import { updatePostsDateAndTime } from '../../repository/rawPost.repository';

interface IUpdatePostDateAndTimeBody {
    posts: {
        _id: string;
        time: string;
        day: number;
    }[];
}

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const body = JSON.parse(event.body || '') as IUpdatePostDateAndTimeBody;

    const { posts } = body;
    try {
        await connectToDB();

        if (!posts.length) throw new CustomError('Posts array is empty', 400);

        const update = await updatePostsDateAndTime({ posts });

        return successReturn(`Updated ${update.modifiedCount} Posts Date and Time Successfully`, update);
    } catch (error) {
        return errorHandler(error);
    }
};
