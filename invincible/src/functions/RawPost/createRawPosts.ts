import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { errorHandler } from '../../utils/errorHandler.util';
import { connectToDB } from '../../config/db.config';
import { successReturn } from '../../utils/successReturn.util';
import { checkNicheExists } from '../../repository/niche.repository';
import CustomError from '../../utils/CustomError.util';
import { validate } from '../../validator';
import RawPost from '../../models/RawPost.model';
import { NicheApifyDatasetStatusEnum } from '../../models/NicheApifyDatasetDetails.model';
import { updateNicheApifyDatasetStatus } from '../../repository/nicheApifyDatasetStatus.repository';

interface CreateRawPostsBody {
    nicheId: string;
    month: string;
    year: string;
    posts: RawPostItem[];
}

interface RawPostItem {
    source_url: string;
    originalViews: number;
    source: string;
    nicheId: string;
    video_url: string;
    media_url: string;
    cover_url: string;
    caption: string;
    mediaType: 'REELS';
    ownerUsername: string;
    originalVideoPublishSchedule: {
        month: string;
        year: string | number;
    };
    schedule?: {
        month: string;
        year: string | number;
    };
}

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        await connectToDB();

        const data = JSON.parse(event.body || '') as CreateRawPostsBody;

        const { nicheId, month, year, posts } = data;

        const yearInNumber = Number(year);

        validate('nicheId', nicheId, true);

        // Check Niche Valid
        const nicheExists = await checkNicheExists({ _id: nicheId });

        if (!nicheExists) throw new CustomError('Niche not found', 404);

        const insertBody = posts.map((item) => {
            return {
                ...item,
                originalViews: Number(item.originalViews),
                nicheId,
                originalVideoPublishSchedule: {
                    ...item.originalVideoPublishSchedule,
                    year: Number(item.originalVideoPublishSchedule.year),
                },
                schedule: {
                    month,
                    year,
                },
            };
        });

        // Total errors
        let insertionErrorCount = 0;
        // Duplicate key errors
        let duplicateErrorCount = 0;

        await RawPost.insertMany(insertBody, { ordered: false }).catch((error: any) => {
            console.error('Error inserting documents:', error);
            insertionErrorCount = error.results.length;
            duplicateErrorCount = error.writeErrors.filter((err: any) => err.err.code === 11000).length;
        });

        let successMessage = 'RawPosts created successfully';

        if (insertionErrorCount && insertionErrorCount === duplicateErrorCount)
            successMessage = `RawPosts created successfully, except ${duplicateErrorCount} duplicates out of ${posts.length}`;
        else if (insertionErrorCount && insertionErrorCount !== duplicateErrorCount) {
            successMessage = `Encountered ${insertionErrorCount - duplicateErrorCount} document errors out of ${
                posts.length
            } documents`;
        }

        // Update NicheApifyDatasetStatus
        await updateNicheApifyDatasetStatus({
            identifier: { nicheId, month, year: yearInNumber },
            updateData: { status: NicheApifyDatasetStatusEnum.COMPLETED },
        });

        return successReturn(successMessage);
    } catch (error) {
        return errorHandler(error);
    }
};
