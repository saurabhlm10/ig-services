import axios from 'axios';
import { AxiosError } from 'axios';

function urlEncodeString(string: string) {
    return encodeURIComponent(string);
}

export const uploadMedia = async (
    media_url: string,
    cover_url: string,
    ig_user_id: string,
    page: string,
    ownerUsername: string,
    access_token: string,
) => {
    try {
        const copyrightDisclaimer = `

  To request a takedown of any post, please send an email to copyright.frenchiesforthewin@gmail.com with the post url
  `;

        const tempCaption = `@${ownerUsername}`;

        const captionHastags = `
  
  Rate This 1-10 🥰

  Tag your Friends!
  
  Follow @${page} for more
  Follow @${page} for more
  Follow @${page} for more
  
  🔊Turn on post notifications
  
  (All rights® are reserved & belong
  to their respective owners)
  `;

        const uriEncodedCaption = urlEncodeString(tempCaption + captionHastags + copyrightDisclaimer);

        const coverUrl = cover_url || '';
        const thumbOffset = '';
        const locationId = '';
        const uploadParamsString = `caption=${uriEncodedCaption}&cover_url=${coverUrl}&thumb_offset=${thumbOffset}&location_id=${locationId}&access_token=${access_token}`;
        const uploadVideoUri = `https://graph.facebook.com/v17.0/${ig_user_id}/media?media_type=REELS&video_url=${media_url}&${uploadParamsString}`;

        const uploadResponse = await axios.post(uploadVideoUri);

        return uploadResponse.data.id;
    } catch (error) {
        // console.log(error);
        if (error instanceof AxiosError) {
            console.log(error.response?.data.error.message);
            // Check if it is Graph API error
            if (error.response?.data?.error?.message) throw new Error(error.response?.data.error.message);

            throw new Error(error.response?.data);
        }
        if (error instanceof Error) {
            throw new Error(error.message);
        }
    }
};
