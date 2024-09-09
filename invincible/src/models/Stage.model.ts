import mongoose, { Schema } from 'mongoose';

const stageSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            enum: ['1', '2', '3'],
            unique: true,
        },
        postsRequired: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true,
    },
);

const Stage = mongoose.model('stage', stageSchema);

export default Stage;
