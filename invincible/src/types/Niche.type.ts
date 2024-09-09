import { QueryOptions, UpdateQuery } from 'mongoose';
import { INiche } from '../models/Niche.model';

export interface ICheckNicheExistsParams {
    _id?: string;
    name?: string;
}

export interface ICreateNicheParams {
    name: string;
}

export interface IGetNicheParams {
    nicheId: string;
}

export type IGetNichePagesParams = IGetNicheParams;

export interface ICheckIGPageInNicheParams {
    nicheId: string;
    pageId: string;
}

export interface IUpdateNicheByIdParams {
    id: string;
    updateData: UpdateQuery<INiche>;
    options?: QueryOptions;
}
