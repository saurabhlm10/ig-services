import mongoose, { Schema } from 'mongoose';

export interface INiche extends Document {
    name: string;
    pages: mongoose.Types.ObjectId[];
    collectionPages: mongoose.Types.ObjectId[];
    createdAt?: Date;
    updatedAt?: Date;
}

const nicheSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        pages: {
            type: [Schema.Types.ObjectId],
            required: true,
            default: [],
        },
        collectionPages: {
            type: [Schema.Types.ObjectId],
            required: true,
            default: [],
            ref: 'CollectionIGPage',
        },
    },
    { timestamps: true },
);

const Niche = mongoose.model('Niche', nicheSchema);

export default Niche;
