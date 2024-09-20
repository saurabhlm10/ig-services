import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { errorHandler } from '../../utils/errorHandler.util';
import { connectToDB } from '../../config/db.config';
import { successReturn } from '../../utils/successReturn.util';
import { validate } from '../../validator';
import CustomError from '../../utils/CustomError.util';
import { encrypt } from '../../helpers/encrypt';
import { updateBatchAccessTokenByPage, updateBatchAccessTokenByName } from '../../repository/batch.repository';

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        await connectToDB();

        const { access_token, page: pageName, batch: batchName } = JSON.parse(event.body ?? '{}');

        if (!access_token) throw new CustomError('access_token is required', 400);
        if (!pageName && !batchName) throw new CustomError('Either pageName or batchName must be provided', 400);

        validate('access_token', access_token);
        if (pageName) validate('pageName', pageName);
        if (batchName) validate('batchName', batchName);

        const encryptedAccessToken = encrypt(access_token);
        console.log('access_token', access_token);
        console.log('encryptedAccessToken', encryptedAccessToken);

        let updateResult;

        if (pageName) {
            updateResult = await updateBatchAccessTokenByPage({
                pageName,
                encryptedAccessToken,
            });
        } else if (batchName) {
            updateResult = await updateBatchAccessTokenByName({
                batchName,
                encryptedAccessToken,
            });
        }

        if (!updateResult) throw new CustomError('Page or batch not found', 404);

        return successReturn('Access token updated successfully');
    } catch (error) {
        return errorHandler(error);
    }
};
