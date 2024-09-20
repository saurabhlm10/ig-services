export interface ICreateSecretParams {
    page: string;
    encrypted_apify_key: string;
    ig_user_id: string;
}

export interface IGetSecretByPageParams {
    page: string;
}

export type IDeleteSecretByPageParams = IGetSecretByPageParams;

export type IUpdateSecretParams = {
    page: string;
    encrypted_apify_key?: string;
    ig_user_id?: string;
};
