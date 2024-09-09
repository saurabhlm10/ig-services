import { APIGatewayProxyResult, SQSEvent } from 'aws-lambda';
import { errorHandler } from '../utils/errorHandler.util';
import { successReturn } from '../utils/successReturn.util';
import { getMonthAndYear } from '../helpers/getMonthAndYear';
import { apiHandler } from '../utils/apiHandler.util';
import { validate } from '../validator';
import { getNumberOfDaysInCurrentMonth } from '../helpers/getNumberOfDaysInCurrentMonth';
import { ENV } from '../constants';

interface Message {
    nicheId: string;
}

interface RawPostItem {
    _id: string;
    source_url: string;
    originalViews: number;
    source: string;
    nicheId: string;
    video_url: string;
    media_url: string;
    cover_url: string;
    caption: string;
    originalVideoPublishSchedule: {
        month: string;
        year: string | number;
    };
    schedule?: {
        month: string;
        year: string | number;
    };
    page: string;
}

interface NichePage {
    _id: string;
    name: string;
    stage: string;
    nicheId: string;
}

interface IUpdatePostDateAndTimeBody {
    posts: {
        _id: string;
        time: string;
        day: number;
    }[];
}

export const lambdaHandler = async (event: SQSEvent): Promise<APIGatewayProxyResult> => {
    const invincibleUrl = process.env.InvincibleUrl || '';
    const message = JSON.parse(event.Records[0].body) as Message;

    const { nicheId } = message;

    validate('nicheId', nicheId, true);

    const { postTimes } = ENV;

    try {
        const { month, year } = getMonthAndYear();

        // Get All Month Niche Raw Posts With Pages Assigned
        const getAllMonthNicheRawPostsWithPagesAssignedUrl = `${invincibleUrl}/rawPosts/month/withPagesAssigned/${nicheId}/${month}/${year}`;

        const rawPosts: RawPostItem[] = await apiHandler('get', getAllMonthNicheRawPostsWithPagesAssignedUrl);

        if (!rawPosts.length) return successReturn(`No Posts To Schedule For NicheId: ${nicheId}`);

        // Get All Niche Pages
        const getNichePagesUrl = `${invincibleUrl}/igpage/niche/${nicheId}`;

        const nichePages: NichePage[] = await apiHandler('get', getNichePagesUrl);

        const numberOfDaysInCurrentMonth = getNumberOfDaysInCurrentMonth();

        // Create tracker object
        const tracker: Record<string, Record<string, Record<string, string>>> = {};

        // Separate Posts according to Pages

        const separatedPosts: Record<string, Array<string>> = {};

        rawPosts.forEach((post) => {
            separatedPosts[post.page] = separatedPosts[post.page] || [];
            separatedPosts[post.page].push(post._id);
        });

        // Create Update Post Date and Time body
        const updatePostsDateAndTimeBody: IUpdatePostDateAndTimeBody = {
            posts: [],
        };

        // Schedule Posts

        nichePages.forEach((page) => {
            const pageName = page.name;
            if (!separatedPosts[pageName] || separatedPosts[pageName].length === 0) {
                return; // Skip this page as there are no posts
            }

            let currentPostIndex = 0;
            const pageTracker: Record<string, Record<string, string>> = {};

            for (let i = 1; i <= numberOfDaysInCurrentMonth; i++) {
                pageTracker[i] = pageTracker[i] || {};
                Object.values(postTimes).forEach((postTimeValue) => {
                    if (!separatedPosts[pageName][currentPostIndex]) return currentPostIndex++;

                    if (page.stage === '1' && ['7PM', '8PM', '9PM', '10PM', '11PM', '12AM'].includes(postTimeValue)) {
                        return;
                    }
                    if (page.stage === '2' && ['8PM', '9PM', '10PM', '11PM', '12AM'].includes(postTimeValue)) {
                        return;
                    }

                    const item = {
                        _id: separatedPosts[pageName][currentPostIndex],
                        time: postTimeValue,
                        day: i,
                    };

                    updatePostsDateAndTimeBody.posts.push(item);

                    pageTracker[i][postTimeValue] = separatedPosts[pageName][currentPostIndex];
                    currentPostIndex++;
                });
            }

            tracker[page.name] = pageTracker;
        });

        const updatePostsDateAndTimeUrl = `${invincibleUrl}/rawPosts/updateDateAndTime`;

        const { modifiedCount } = await apiHandler('put', updatePostsDateAndTimeUrl, updatePostsDateAndTimeBody);

        return successReturn(`Scheduled ${modifiedCount} Posts for nicheId ${nicheId}`);
    } catch (error) {
        return errorHandler(error);
    }
};
