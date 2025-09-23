import Joi from 'joi';
import { ApplicationStatus, InterestStatus } from '@/utils/helpers/constants';

export const applicationSchema = Joi.object({
  id: Joi.string().uuid().required(),

  status: Joi.string()
    .valid(...Object.values(ApplicationStatus))
    .required(),

  applicationDate: Joi.date().required(),

  note: Joi.string().allow('', null),
  resume: Joi.string().uri().required(), 
  cvvideo: Joi.string().uri().optional, 

  candidate: Joi.object({
    id: Joi.string().uuid().required(), 
  }).required(),

  opportunity: Joi.object({
    id: Joi.string().uuid().required(),
  }).required(),

  createdAt: Joi.date().required(),
  updatedAt: Joi.date().required()
});

export const applicationUpdateSchema = Joi.object({
  status: Joi.string().valid(...Object.values(ApplicationStatus)),

  cvvideo: Joi.string().uri().optional,

  note: Joi.string().allow('', null),

  
});
export const interestUpdateSchema = Joi.object({
    interest: Joi.string().valid(...Object.values(InterestStatus)),
});

