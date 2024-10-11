import axios from 'axios';
import { isUploadSuccessful } from './isUploadSuccessful';

export const publishMedia = async ({
    creation_id,
    currentPostId,
    ig_user_id,
    access_token,
}: {
    creation_id: string;
    currentPostId: string;
    ig_user_id: string;
    access_token: string;
}) => {
    const checkStatusUri = `https://graph.facebook.com/v17.0/${creation_id}?fields=status,status_code&access_token=${access_token}`;
    const isUploaded = await isUploadSuccessful(0, checkStatusUri, currentPostId);

    // When uploaded successfully, publish the video
    if (isUploaded) {
        const publishVideoUri = `https://graph.facebook.com/v17.0/${ig_user_id}/media_publish?creation_id=${creation_id}&access_token=${access_token}`;
        const publishResponse = await axios.post(publishVideoUri);
        return publishResponse.data.id;
    } else {
        throw new Error('Failed to publish media because it is taking too long to process');
    }
};
