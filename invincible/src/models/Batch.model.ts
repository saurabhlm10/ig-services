import mongoose from 'mongoose';

const BatchSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        encrypted_access_token: {
            type: String,
            required: true,
            unique: true,
        },
        pages: {
            type: [mongoose.Schema.ObjectId],
            required: true,
            default: [],
        },
    },
    {
        timestamps: true,
    },
);

const BatchModel = mongoose.model('Batch', BatchSchema);

export default BatchModel;
