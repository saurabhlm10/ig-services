import mongoose from 'mongoose';
import IGPageModel from '../models/IGPage.model';
import { ICheckIGPageExistsParams } from '../types/IGPage.type';
import { IGetNichePagesParams } from '../types/Niche.type';

export const checkIGPageExists = async (data: ICheckIGPageExistsParams) => {
    const { id } = data;
    return IGPageModel.exists({ _id: id });
};

export const getNichePages = async (data: IGetNichePagesParams) => {
    const { nicheId } = data;
    return IGPageModel.find({ nicheId: new mongoose.Types.ObjectId(nicheId) });
};
