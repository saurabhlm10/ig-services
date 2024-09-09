import mongoose, { Schema } from 'mongoose';
import { ENV } from '../constants';

const { months } = ENV;

const tempPostSchema = new Schema(
    {
        originalViews: {
            type: Number,
            required: true,
        },
        nicheId: {
            type: Schema.Types.ObjectId,
            required: true,
        },
        source_url: {
            type: String,
            required: true,
            unique: true,
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
            required: true,
        },
        ownerUsername: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['not-processed', 'processed'],
            default: 'not-processed',
        },
        page: {
            type: String,
        },
        publishMonth: {
            type: String,
            enum: months,
        },
        caption: {
            type: String,
        },
        source: {
            type: String,
            enum: ['tiktok'],
        },
    },
    {
        timestamps: true,
    },
);

const TempPost = mongoose.model('TempPost', tempPostSchema);

export default TempPost;
