import mongoose, { Document, Schema } from 'mongoose';

export enum NicheApifyDatasetStatusEnum {
    INITIATED = 'INITIATED',
    COMPLETED = 'COMPLETED',
}

const months = [
    'january',
    'february',
    'march',
    'april',
    'may',
    'june',
    'july',
    'august',
    'september',
    'october',
    'november',
    'december',
];

export interface INicheApifyDatasetStatus extends Document {
    nicheId: mongoose.Types.ObjectId;
    status: string;
    completedCollectionPages: mongoose.Types.ObjectId[];
    month: string;
    year: number;
}

const nicheApifyDatasetStatusSchema = new mongoose.Schema<INicheApifyDatasetStatus>(
    {
        nicheId: {
            type: Schema.Types.ObjectId,
            required: true,
            unique: true,
        },
        status: {
            type: String,
            enum: NicheApifyDatasetStatusEnum,
            required: true,
            default: NicheApifyDatasetStatusEnum.INITIATED,
        },
        completedCollectionPages: {
            type: [Schema.Types.ObjectId],
            required: true,
            default: [],
            ref: 'CollectionIGPage',
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
    {
        timestamps: true,
    },
);

const NicheApifyDatasetStatus = mongoose.model('NicheApifyDatasetStatus', nicheApifyDatasetStatusSchema);

export default NicheApifyDatasetStatus;
