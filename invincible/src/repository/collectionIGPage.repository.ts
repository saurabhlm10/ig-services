import CollectionIGPage from '../models/CollectionIGPage.model';
import {
    ICollectionIGPageExistsParams,
    ICreateCollectionPage,
    IGetAllNicheCollectionPages,
    IGetCollectionIGPageUsingNameParams,
} from '../types/CollectionIGPage.type';

export const checkCollectionPageExists = async (data: ICollectionIGPageExistsParams) => {
    const { id } = data;

    return CollectionIGPage.exists({ _id: id });
};

export const getCollectionPageUsingName = async (data: IGetCollectionIGPageUsingNameParams) => {
    const { username } = data;

    return CollectionIGPage.findOne({ username });
};

export const getAllNicheCollectionPages = async (data: IGetAllNicheCollectionPages) => {
    const { nicheId } = data;

    return CollectionIGPage.find({ nicheId });
};

export const createCollectionPage = async (data: ICreateCollectionPage) => {
    return CollectionIGPage.create(data);
};
