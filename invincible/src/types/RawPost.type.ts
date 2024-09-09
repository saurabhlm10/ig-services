export interface IGetAllNicheRawPosts {
    nicheId: string;
}

export interface IGetAllMonthNicheRawPosts {
    nicheId: string;
    month: string;
    year: number;
}

export interface IAddPagesToRawPostsParams {
    posts: {
        id: string;
        page: string;
    }[];
}

export interface IGetMonthNicheRawPostsWithPageAssignedParams {
    nicheId: string;
    month: string;
    year: number;
}

export interface IUpdatePostsDateAndTimeParams {
    posts: {
        _id: string;
        time: string;
        day: number;
    }[];
}
