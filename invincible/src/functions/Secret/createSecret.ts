import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { errorHandler } from '../../utils/errorHandler.util';
import { connectToDB } from '../../config/db.config';
import { successReturn } from '../../utils/successReturn.util';
import { validate } from '../../validator';
import CustomError from '../../utils/CustomError.util';
import { encrypt } from '../../helpers/encrypt';
import { checkIGPageExists } from '../../repository/igpage.repository';
import { createSecret } from '../../repository/secret.repository';

interface Body {
    page: string;
    apify_key: string;
    ig_user_id: string;
}

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        await connectToDB();

        const body = JSON.parse(event.body ?? '') as Body;

        const { page, apify_key, ig_user_id } = body;

        validate('page', page);
        validate('apify_key', apify_key);
        validate('ig_user_id', ig_user_id);

        // Check if page exists
        const pageExists = await checkIGPageExists({ name: page });

        if (!pageExists) throw new CustomError(`Page: ${page} not found`, 404);

        const encrypted_apify_key = encrypt(apify_key);

        const createdSecret = await createSecret({ page, encrypted_apify_key, ig_user_id });

        return successReturn('Secret Created Successfully', createdSecret);
    } catch (error) {
        return errorHandler(error);
    }
};
