import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { errorHandler } from '../../utils/errorHandler.util';
import { connectToDB } from '../../config/db.config';

import { successReturn } from '../../utils/successReturn.util';
import { validate } from '../../validator';
import { checkIGPageInNiche, checkNicheExists } from '../../repository/niche.repository';
import CustomError from '../../utils/CustomError.util';
import { checkIGPageExists } from '../../repository/igpage.repository';
import Niche from '../../models/Niche.model';

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        await connectToDB();

        const queryParams = event.pathParameters;

        const { nicheId, pageId } = queryParams as { nicheId: string; pageId: string };
        validate('nicheId', nicheId, true);
        validate('pageId', pageId, true);

        const nicheExists = await checkNicheExists({ _id: nicheId });
        if (!nicheExists) throw new CustomError('Niche not found', 404);

        const IGPageExists = await checkIGPageExists({ id: pageId });

        if (!IGPageExists) throw new CustomError('IGPage not found', 404);

        const checkIGPageAlreadyInNiche = await checkIGPageInNiche({ nicheId, pageId });

        if (checkIGPageAlreadyInNiche) return successReturn(`IGPage ${pageId} already in Niche ${nicheId}`);

        const updatedNiche = await Niche.findByIdAndUpdate(nicheId, { $push: { pages: pageId } }, { new: true });

        return successReturn('Page added successfully to the Niche', updatedNiche);
    } catch (error) {
        return errorHandler(error);
    }
};
