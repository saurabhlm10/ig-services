import { ApifyClient } from 'apify-client';

interface TikTokVideoData {
    id: string;
    text: string;
    createTime: number;
    createTimeISO: string;
    locationCreated: string;
    authorMeta: {
        id: string;
        profileUrl: string;
        name: string;
        nickName: string;
        verified: boolean;
        signature: string;
        bioLink: string;
        avatar: string;
        privateAccount: boolean;
        roomId: string;
        ttSeller: boolean;
        commerceUserInfo: {
            commerceUser: boolean;
        };
        following: number;
        friends: number;
        fans: number;
        heart: number;
        video: number;
        digg: number;
    };
    musicMeta: {
        musicName: string;
        musicAuthor: string;
        musicOriginal: boolean;
        playUrl: string;
        coverMediumUrl: string;
        musicId: string;
    };
    webVideoUrl: string;
    mediaUrls: string[];
    videoMeta: {
        height: number;
        width: number;
        duration: number;
        coverUrl: string;
        originalCoverUrl: string;
        definition: string;
        format: string;
        subtitleLinks: Array<unknown>; // You might want to define a more specific type if you know the structure
        downloadAddr: string;
    };
    diggCount: number;
    shareCount: number;
    playCount: number;
    collectCount: number;
    commentCount: number;
    mentions: string[];
    hashtags: Array<{
        id: string;
        name: string;
        title: string;
        cover: string;
    }>;
    effectStickers: unknown[]; // You might want to define a more specific type if you know the structure
    isSlideshow: boolean;
    isPinned: boolean;
    isSponsored: boolean;
    submittedVideoUrl: string;
}

export const getPostFromApify = async (apify_key: string, postUrl: string) => {
    // Initialize the ApifyClient with API token
    const client = new ApifyClient({
        token: apify_key,
    });

    // Prepare Actor input
    const input = {
        postURLs: [postUrl],
        resultsPerPage: 1,
        excludePinnedPosts: false,
        searchSection: '',
        maxProfilesPerQuery: 1,
        shouldDownloadVideos: true,
        shouldDownloadCovers: true,
        shouldDownloadSubtitles: false,
        shouldDownloadSlideshowImages: false,
    };

    // Run the Actor and wait for it to finish
    const run = await client.actor('OtzYfK1ndEGdwWFKQ').call(input);

    // Fetch and print Actor results from the run's dataset (if any)
    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    return items[0] as unknown as TikTokVideoData;
};
