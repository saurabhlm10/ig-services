import { ApifyClient } from 'apify-client';

export const triggerApifyPostCollectionn = async (token: string, profiles: string[]) => {
    // Initialize the ApifyClient with API token
    const client = new ApifyClient({
        token,
    });

    // Prepare Actor input
    const input = {
        excludePinnedPosts: false,
        maxProfilesPerQuery: 1,
        profiles,
        resultsPerPage: 20,
        shouldDownloadCovers: true,
        shouldDownloadSlideshowImages: true,
        shouldDownloadSubtitles: false,
        shouldDownloadVideos: true,
        searchSection: '',
    };
    // Run the Actor and wait for it to finish
    await client.actor('OtzYfK1ndEGdwWFKQ').start(input);
};
