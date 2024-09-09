import NicheApifyDatasetStatus from '../models/NicheApifyDatasetDetails.model';
import {
    ICheckCollectionPageAlreadyInNicheApifyDatasetStatusParams,
    ICreateNicheApifyDatasetStatusParams,
    IGetNicheApifyDatasetStatusParams,
    IUpdateNicheApifyDatasetStatus,
} from '../types/NicheApifyDatasetStatus.type';

export const getNicheApifyDatasetStatus = (data: IGetNicheApifyDatasetStatusParams) => {
    const { nicheId, month, year } = data;

    return NicheApifyDatasetStatus.findOne({ nicheId, month, year });
};

export const createNicheApifyDatasetStatus = (data: ICreateNicheApifyDatasetStatusParams) => {
    return NicheApifyDatasetStatus.create(data);
};

export const checkCollectionPageInNicheApifyDatasetStatus = (
    data: ICheckCollectionPageAlreadyInNicheApifyDatasetStatusParams,
) => {
    const { nicheId, month, year, collectionPageId } = data;
    return NicheApifyDatasetStatus.exists({ nicheId, month, year, completedCollectionPages: collectionPageId });
};

export const updateNicheApifyDatasetStatus = (data: IUpdateNicheApifyDatasetStatus) => {
    const { identifier, updateData, options } = data;
    return NicheApifyDatasetStatus.findOneAndUpdate(identifier, updateData, options);
};
