import mongoose from 'mongoose';
import RawPost from '../models/RawPost.model';
import {
    IAddPagesToRawPostsParams,
    IGetAllMonthNicheRawPosts,
    IGetAllNicheRawPosts,
    IGetMonthNicheRawPostsWithPageAssignedParams,
    IUpdatePostsDateAndTimeParams,
} from '../types/RawPost.type';

export const getAllNicheRawPosts = async (data: IGetAllNicheRawPosts) => {
    const { nicheId } = data;

    return RawPost.find({ nicheId });
};

export const getAllMonthNicheRawPosts = async (data: IGetAllMonthNicheRawPosts) => {
    const { nicheId, month, year } = data;

    return RawPost.find({ nicheId, schedule: { month, year } });
};

export const getMonthNicheRawPostsWithPageAssigned = async (data: IGetMonthNicheRawPostsWithPageAssignedParams) => {
    const { nicheId, month, year } = data;

    return RawPost.find({
        nicheId: nicheId,
        'schedule.month': month,
        'schedule.year': year,
        page: { $ne: null, $exists: true }, // Ensures 'page' is always not null and exists
        $or: [
            {
                'schedule.day': null, // Includes documents where day is explicitly null
                'schedule.time': null, // Includes documents where time is explicitly null
            },
            {
                'schedule.day': { $exists: false }, // Includes documents where day does not exist
                'schedule.time': { $exists: false }, // Includes documents where time does not exist
            },
        ],
    });
};

export const addPagesToRawPosts = async (data: IAddPagesToRawPostsParams) => {
    const { posts } = data;
    const operations = posts.map((post) => ({
        updateOne: {
            filter: { _id: new mongoose.Types.ObjectId(post.id) },
            update: { $set: { page: post.page } },
        },
    }));

    return RawPost.bulkWrite(operations);
};

export const updatePostsDateAndTime = (updateBody: IUpdatePostsDateAndTimeParams) => {
    const bulkOps = updateBody.posts.map((post) => {
        return {
            updateOne: {
                filter: { _id: post._id },
                update: {
                    $set: {
                        'schedule.time': post.time,
                        'schedule.day': post.day,
                    },
                },
            },
        };
    });

    return RawPost.bulkWrite(bulkOps);
};
