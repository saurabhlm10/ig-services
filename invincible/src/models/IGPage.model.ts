import mongoose, { Schema } from 'mongoose';

export enum PageStages {
    One = 1,
    Two = 2,
    Three = 3,
}

const IGPageSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        nicheId: {
            type: Schema.Types.ObjectId,
            required: true,
            unique: true,
        },
        followersCount: {
            type: Number,
            required: true,
        },
        stage: {
            type: String,
            required: true,
            enum: PageStages,
            default: PageStages.One,
        },
    },
    {
        timestamps: true,
    },
);

const IGPageModel = mongoose.model('IGPage', IGPageSchema);

export default IGPageModel;
