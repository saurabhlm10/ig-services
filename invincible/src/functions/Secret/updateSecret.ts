import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { errorHandler } from '../../utils/errorHandler.util';
import { connectToDB } from '../../config/db.config';
import { successReturn } from '../../utils/successReturn.util';
import { validate } from '../../validator';
import { updateSecretByPage } from '../../repository/secret.repository';
import CustomError from '../../utils/CustomError.util';
import { checkIGPageExists } from '../../repository/igpage.repository';
import { encrypt } from '../../helpers/encrypt';

interface Body {
    [key: string]: string;
}

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        await connectToDB();

        const body = JSON.parse(event.body ?? '{}') as Body;

        const { page, apify_key, ig_user_id } = body;

        if (!page) throw new CustomError('Page parameter is required', 400);

        validate('page', page);

        // Check if page exists
        const pageExists = await checkIGPageExists({ name: page });

        if (!pageExists) throw new CustomError('Page not found', 404);

        const updateBody = body;

        let encrypted_apify_key;

        if (apify_key) {
            encrypted_apify_key = encrypt(apify_key);
            delete updateBody.apify_key;
            updateBody.encrypted_apify_key = encrypted_apify_key;
        }

        const updatedSecret = await updateSecretByPage({
            page,
            encrypted_apify_key,
            ig_user_id,
        });

        if (!updatedSecret) throw new CustomError('Secret not found', 404);

        return successReturn('Secret updated successfully', updatedSecret);
    } catch (error) {
        return errorHandler(error);
    }
};
