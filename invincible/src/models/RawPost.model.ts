import mongoose, { Schema } from 'mongoose';
import { ENV } from '../constants';

const { months } = ENV;

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
    },
    {
        timestamps: true,
    },
);

const RawPost = mongoose.model('RawPost', rawPostsSchema);

export default RawPost;
