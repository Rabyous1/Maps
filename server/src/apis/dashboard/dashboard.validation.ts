import Joi from 'joi';

export const candidateDashboardQuerySchema = Joi.object({
    from: Joi.date().iso().required(), 
    to: Joi.date().iso().required(),
});

export type CandidateDashboardQuery = {
    from: Date;
    to: Date;
};
