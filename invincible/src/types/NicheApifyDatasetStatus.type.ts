import { QueryOptions, UpdateQuery } from 'mongoose';
import { INicheApifyDatasetStatus } from '../models/NicheApifyDatasetDetails.model';

export interface IGetNicheApifyDatasetStatusParams {
    nicheId: string;
    month: string;
    year: number;
}

export interface ICreateNicheApifyDatasetStatusParams {
    nicheId: string;
    month: string;
    year: number;
}

export interface ICheckCollectionPageAlreadyInNicheApifyDatasetStatusParams {
    nicheId: string;
    month: string;
    year: number;
    collectionPageId: string;
}

export type IUpdateNicheApifyDatasetStatus = {
    identifier: {
        nicheId: string;
        month: string;
        year: number;
    };
    updateData: UpdateQuery<INicheApifyDatasetStatus>;
    options?: QueryOptions;
};
