import axios from 'axios';
import { apiHandler } from '../utils/apiHandler.util';
/**
 * Setting retries with 3 seconds delay, as async video upload may take a while in the backend to return success
 * @param {*} n
 * @returns
 */
function _wait(n: number) {
    return new Promise((resolve) => setTimeout(resolve, n));
}

async function setStatus(currentPostId: string, statusMessage: string) {
    console.log('currentPostId', currentPostId);
    console.log('setStatus');

    let errorMessage = '';

    switch (statusMessage) {
        case 'PUBLISHED':
            errorMessage = 'Post is already published';
            break;
        case 'EXPIRED':
            errorMessage = 'Media container has expired';
            break;
        case 'ERROR':
            errorMessage = 'An error occured while checking media container';
            break;
        default:
            errorMessage = 'An error occurred while publishing the post';
    }

    const updateRawPostUrl = '/rawposts';
    const updateRawPostParams = {
        id: currentPostId,
    };
    const updateRawPostBody = {
        errorMessage,
    };

    await apiHandler('put', updateRawPostUrl, updateRawPostBody, null, updateRawPostParams);
}

/**
 * Retrieves container status for the uploaded video, while it's uploading in the backend asynchronously
 * and checks if the upload is complete.
 * @param {*} retryCount
 * @param {*} checkStatusUri
 * @returns Promise<boolean>
 */
export const isUploadSuccessful = async (
    retryCount: number,
    checkStatusUri: string,
    currentPostId: string,
): Promise<boolean> => {
    console.log(retryCount);
    if (retryCount > 30) return false;
    const response = await axios.get(checkStatusUri);
    if (response.data.status_code === 'PUBLISHED' || response.data.status_code === 'EXPIRED') {
        // Update the published status of the post and save to DB
        console.log('currentPostId inside isUploadSuccessful', currentPostId);
        await setStatus(currentPostId, response.data.status_code);
        return true;
    }
    if (response.data.status_code === 'ERROR') {
        await setStatus(currentPostId, response.data.status_code);
        throw new Error('Error' + response.data.status);
    }
    if (response.data.status_code !== 'FINISHED') {
        await _wait(3000);
        return isUploadSuccessful(retryCount + 1, checkStatusUri, currentPostId);
    }
    return true;
};
