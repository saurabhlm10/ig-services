import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { errorHandler } from '../../utils/errorHandler.util';
import { connectToDB } from '../../config/db.config';
import { successReturn } from '../../utils/successReturn.util';
import CustomError from '../../utils/CustomError.util';
import { addPagesToRawPosts } from '../../repository/rawPost.repository';

interface AddPagesToRawPostsBody {
    posts: {
        id: string;
        page: string;
    }[];
}

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const body = JSON.parse(event.body || '') as AddPagesToRawPostsBody;

    const { posts } = body;
    try {
        await connectToDB();

        if (!posts.length) throw new CustomError('posts array is empty', 400);

        const updatedRawPosts = await addPagesToRawPosts({ posts });

        return successReturn('Add Pages To RawPosts Successfully', updatedRawPosts);
    } catch (error) {
        return errorHandler(error);
    }
};
