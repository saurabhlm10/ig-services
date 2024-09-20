import SecretModel from '../models/Secret.model';
import {
    ICreateSecretParams,
    IDeleteSecretByPageParams,
    IGetSecretByPageParams,
    IUpdateSecretParams,
} from '../types/Secret.type';

export const createSecret = (data: ICreateSecretParams) => {
    return SecretModel.create(data);
};

export const getSecretByPage = (data: IGetSecretByPageParams) => {
    return SecretModel.findOne({ page: data.page });
};

export const deleteSecretByPage = (data: IDeleteSecretByPageParams) => {
    return SecretModel.deleteOne({ page: data.page });
};

export const updateSecretByPage = (data: Partial<IUpdateSecretParams>) => {
    const { page } = data;

    const updateData = {
        encrypted_api_key: data.encrypted_apify_key,
        ig_user_id: data.ig_user_id,
    };
    return SecretModel.findOneAndUpdate({ page }, updateData, { new: true }).lean();
};
