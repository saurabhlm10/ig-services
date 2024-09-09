import CollectionIGPage from '../models/CollectionIGPage.model';

export interface ICollectionIGPageExistsParams {
    id: string;
}

export interface IGetCollectionIGPageUsingNameParams {
    username: string;
}

export interface IGetAllNicheCollectionPages {
    nicheId: string;
}

export type ICreateCollectionPage = typeof CollectionIGPage;
