import mongoose, { Schema, Types } from 'mongoose';
import { ENV } from '../constants';

const { months } = ENV;

type Month =
    | 'January'
    | 'February'
    | 'March'
    | 'April'
    | 'May'
    | 'June'
    | 'July'
    | 'August'
    | 'September'
    | 'October'
    | 'November'
    | 'December';

export interface IRawPost {
    originalViews: number;
    nicheId: Types.ObjectId;
    source_url: string;
    source: 'tiktok';
    caption: string;
    video_url?: string;
    cover_url?: string;
    media_url?: string;
    mediaType: 'REELS';
    ownerUsername: string;
    originalVideoPublishSchedule: {
        month: Month;
        year: number;
    };
    schedule: {
        time?: PostTimeEnum;
        day?: number;
        month: Month;
        year: number;
    };
    page?: string;
    createdAt: Date;
    updatedAt: Date;
}

enum PostTimeEnum {
    SIX_PM = '6PM',
    SEVEN_PM = '7PM',
    EIGHT_PM = '8PM',
    NINE_PM = '9PM',
    TEN_PM = '10PM',
    ELEVEN_PM = '11PM',
    TWELVE_AM = '12AM',
}

const rawPostsSchema = new Schema(
    {
        originalViews: {
            type: Number,
            required: true,
        },
        nicheId: {
            type: Schema.Types.ObjectId,
            required: true,
            Ref: 'Niche',
        },
        source_url: {
            type: String,
            required: true,
            unique: true,
        },
        source: {
            type: String,
            enum: ['tiktok'],
        },
        caption: {
            type: String,
            required: true,
        },
        video_url: {
            type: String,
            unique: true,
        },
        cover_url: {
            type: String,
            unique: true,
        },
        media_url: {
            type: String,
            unique: true,
        },
        mediaType: {
            type: String,
            enum: ['REELS'],
            required: true,
        },
        ownerUsername: {
            type: String,
            required: true,
        },
        originalVideoPublishSchedule: {
            month: {
                type: String,
                enum: months,
                required: true,
            },
            year: {
                type: Number,
                required: true,
            },
        },
        schedule: {
            time: {
                type: String,
                enum: PostTimeEnum,
            },
            day: {
                type: Number,
            },
            month: {
                type: String,
                enum: months,
                required: true,
            },
            year: {
                type: Number,
                required: true,
            },
        },
        page: {
            type: String,
        },
        creation_id: String,
        published_id: String,
        errorMessage: String,
    },
    {
        timestamps: true,
    },
);

const RawPost = mongoose.model<IRawPost>('RawPost', rawPostsSchema);

export default RawPost;
