import Stage from '../models/Stage.model';
import { ICheckStageExistsParams, ICreateStageParams } from '../types/Stage.type';

export const createStage = async (data: ICreateStageParams) => {
    return Stage.create(data);
};

export const checkStageExists = async (data: ICheckStageExistsParams) => {
    const { name } = data;
    return Stage.exists({ name });
};

export const getAllStages = async () => {
    return Stage.find();
};
