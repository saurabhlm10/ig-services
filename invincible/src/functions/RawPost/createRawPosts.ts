import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import mongoose from 'mongoose';
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
        mongoose.set('debug', true);
        await connectToDB();
        console.log('MongoDB connection state:', mongoose.connection.readyState);

        const data = JSON.parse(event.body || '') as CreateRawPostsBody;

        const { nicheId, month, year, posts } = data;

        console.log('posts', posts.length);

        const yearInNumber = Number(year);

        validate('nicheId', nicheId, true);

        // Check Niche Valid
        const nicheExists = await checkNicheExists({ _id: nicheId });

        if (!nicheExists) throw new CustomError('Niche not found', 404);

        const insertBody = posts.map((item) => {
            const originalYear = Number(item.originalVideoPublishSchedule.year);
            if (isNaN(originalYear)) {
                console.warn(`Invalid year for item: ${item.source_url}`);
            }

            // Ensure the month is a valid enum value
            const validMonths = [
                'January',
                'February',
                'March',
                'April',
                'May',
                'June',
                'July',
                'August',
                'September',
                'October',
                'November',
                'December',
            ];
            const originalMonth = validMonths.includes(item.originalVideoPublishSchedule.month)
                ? item.originalVideoPublishSchedule.month
                : 'January'; // Default to January if invalid

            return {
                ...item,
                originalViews: Number(item.originalViews),
                nicheId: new mongoose.Types.ObjectId(nicheId),
                originalVideoPublishSchedule: {
                    month: originalMonth,
                    year: isNaN(originalYear) ? new Date().getFullYear() : originalYear, // Use current year as default if NaN
                },
                schedule: {
                    month: validMonths.includes(month) ? month : 'January', // Ensure month is valid
                    year: yearInNumber,
                },
                ownerUsername: item.ownerUsername || '', // Empty string if missing, as it's required
                mediaType: 'REELS', // Default to 'REELS' as per your schema
            };
        });

        console.log('insertBody', insertBody.length);
        console.log('Sample input item:', JSON.stringify(insertBody[0], null, 2));

        let insertedCount = 0;
        let insertionErrorCount = 0;
        let duplicateErrorCount = 0;

        try {
            const result = await RawPost.insertMany(insertBody, { ordered: false, rawResult: true });
            console.log('Raw insertion result:', JSON.stringify(result, null, 2));
            insertedCount = result.insertedCount;
        } catch (error: any) {
            console.error('Error during insertion:', error);
            if (error.writeErrors) {
                insertionErrorCount = error.writeErrors.length;
                duplicateErrorCount = error.writeErrors.filter((err: any) => err.code === 11000).length;
                insertedCount = error.insertedCount;
            }
        }

        console.log(`Inserted: ${insertedCount}, Errors: ${insertionErrorCount}, Duplicates: ${duplicateErrorCount}`);

        // Verify the actual count in the database
        const actualCount = await RawPost.countDocuments({
            nicheId: new mongoose.Types.ObjectId(nicheId),
            'schedule.month': month,
            'schedule.year': yearInNumber,
        });
        console.log(`Actual count in database: ${actualCount}`);

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
