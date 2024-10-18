import { APIGatewayProxyResult, SQSEvent } from 'aws-lambda';
import { errorHandler } from '../utils/errorHandler.util';
import { successReturn } from '../utils/successReturn.util';
import axios from 'axios';
import { apiHandler } from '../utils/apiHandler.util';
import AWS from 'aws-sdk';
import { getMonthAndYear } from '../helpers/getMonthAndYear';
import { ENV } from '../constants';
const sqs = new AWS.SQS();

interface Message {
    nicheId: string;
    datasetId: string;
}

interface TikTokVideo {
    id: string;
    text: string;
    createTime: number;
    createTimeISO: string;
    authorMeta: {
        id: string;
        name: string;
        nickName: string;
        verified: boolean;
        signature: string;
        avatar: string;
        following: number;
        fans: number;
        heart: number;
        video: number;
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
        downloadAddr: string;
    };
    diggCount: number;
    shareCount: number;
    playCount: number;
    collectCount: number;
    commentCount: number;
    hashtags: { name: string }[];
}

interface TempPostItem {
    source_url: string;
    originalViews: number;
    source: string;
    nicheId?: string;
    video_url: string;
    media_url?: string;
    cover_url: string;
    caption: string;
    mediaType?: 'REELS';
    ownerUsername?: string;
    originalVideoPublishSchedule: {
        month: string;
        year: number | string;
    };
    schedule?: {
        month: string;
        year: number | string;
    };
}

export const lambdaHandler = async (event: SQSEvent): Promise<APIGatewayProxyResult> => {
    const vulcanQueueUrl = process.env.VulcanQueueUrl ?? '';
    const { months } = ENV;
    try {
        const message = JSON.parse(event.Records[0].body) as Message;

        const { nicheId, datasetId } = message;

        const getDatasetUrl = 'https://api.apify.com/v2/datasets/' + datasetId + '/items';

        const params = {
            format: 'json',
        };

        const response = await axios.get(getDatasetUrl, { params });

        const datasetItems: TikTokVideo[] = response.data;

        const { month, year } = getMonthAndYear();

        const createTempPostsInDBBody: {
            nicheId: string;
            month: string;
            year: string;
            posts: TempPostItem[];
        } = {
            nicheId,
            month,
            year,
            posts: [],
        };

        datasetItems.forEach((item) => {
            const currentMonth = months[new Date(item.createTime * 1000).getMonth()];
            const currentYear = new Date(item.createTime * 1000).getFullYear();

            createTempPostsInDBBody.posts.push({
                source_url: item.webVideoUrl,
                originalViews: item.playCount,
                source: 'tiktok',
                nicheId,
                video_url: item.mediaUrls[0],
                media_url: item.mediaUrls[0], // Adding media_url to match RawPostItem
                cover_url: item.videoMeta.coverUrl,
                caption: item.text,
                mediaType: 'REELS',
                ownerUsername: item.authorMeta.name,
                originalVideoPublishSchedule: {
                    month: currentMonth,
                    year: currentYear,
                },
                schedule: {
                    month,
                    year,
                },
            });
        });

        const createTempPostsUrl = '/rawPosts';

        await apiHandler('post', createTempPostsUrl, createTempPostsInDBBody);

        // If Niche Post Collection is done put it in vulcan queue
        const messageParams = {
            MessageBody: JSON.stringify({ nicheId }),
            QueueUrl: vulcanQueueUrl,
        };

        await sqs.sendMessage(messageParams).promise();

        return successReturn('Message received and stored posts in DB');
    } catch (error) {
        return errorHandler(error);
    }
};
