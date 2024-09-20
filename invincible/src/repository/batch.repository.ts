import { Types } from 'mongoose';
import BatchModel from '../models/Batch.model';
import IGPageModel from '../models/IGPage.model';

export interface IFindBatchWithPageParams {
    pageId: Types.ObjectId;
}

export const findBatchWithPage = (params: IFindBatchWithPageParams) => {
    return BatchModel.findOne({
        pages: { $elemMatch: { $eq: params.pageId } },
    });
};

export const findBatchWithLeastPages = () => {
    return BatchModel.aggregate([
        { $addFields: { numPages: { $size: '$pages' } } },
        { $sort: { numPages: 1 } },
        { $limit: 1 },
    ]).then((results) => results[0]);
};

export interface IUpdateBatchPagesParams {
    batchId: Types.ObjectId;
    pageId: Types.ObjectId;
}

export const updateBatchPages = async (params: IUpdateBatchPagesParams) => {
    await BatchModel.updateOne({ _id: params.batchId }, { $push: { pages: params.pageId } });
    return BatchModel.findById(params.batchId);
};

export interface ICreateBatchParams {
    name: string;
    encrypted_access_token: string;
}

export const createBatch = (params: ICreateBatchParams) => {
    return BatchModel.create({
        name: params.name,
        encrypted_access_token: params.encrypted_access_token,
    });
};

export const getAllBatches = () => {
    return BatchModel.find();
};

export interface IGetPageWithBatchParams {
    pageName: string;
}

export const getPageWithBatch = (params: IGetPageWithBatchParams) => {
    return IGPageModel.aggregate([
        { $match: { name: params.pageName } },
        {
            $lookup: {
                from: BatchModel.collection.name,
                localField: '_id',
                foreignField: 'pages',
                as: 'batch',
            },
        },
        { $unwind: '$batch' },
    ]);
};

export interface IUpdateBatchAccessTokenByPageParams {
    pageName: string;
    encryptedAccessToken: string;
}

export const updateBatchAccessTokenByPage = async (params: IUpdateBatchAccessTokenByPageParams) => {
    const result = await IGPageModel.aggregate([
        { $match: { name: params.pageName } },
        {
            $lookup: {
                from: BatchModel.collection.name,
                localField: '_id',
                foreignField: 'pages',
                as: 'batch',
            },
        },
        { $unwind: '$batch' },
        { $set: { 'batch.encrypted_access_token': params.encryptedAccessToken } },
        { $out: BatchModel.collection.name },
    ]);

    return result.length > 0;
};

export interface IUpdateBatchAccessTokenByNameParams {
    batchName: string;
    encryptedAccessToken: string;
}

export const updateBatchAccessTokenByName = async (params: IUpdateBatchAccessTokenByNameParams) => {
    const batch = await BatchModel.findOneAndUpdate(
        { name: params.batchName },
        { encrypted_access_token: params.encryptedAccessToken },
        { new: true },
    );

    return batch !== null;
};

export interface IUpdateBatchPagesUsingNameParams {
    batchName: string;
    pages: Types.ObjectId[];
}

export const updateBatchPagesusingName = async (params: IUpdateBatchPagesUsingNameParams) => {
    return BatchModel.findOneAndUpdate({ name: params.batchName }, { pages: params.pages }, { new: true });
};
