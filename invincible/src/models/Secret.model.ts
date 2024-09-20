import mongoose from 'mongoose';

const secretSchema = new mongoose.Schema(
    {
        page: {
            type: String,
            required: true,
            unique: true,
        },
        encrypted_apify_key: {
            type: String,
        },
        ig_user_id: {
            type: String,
            unique: true,
        },
    },
    {
        timestamps: true,
    },
);

const SecretModel = mongoose.model('Secret', secretSchema);

export default SecretModel;
