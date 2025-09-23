import Joi from 'joi';
import {
    Language,
    Visibility,
    Industry,
    OpportunityType,
    Countries,
    WorkMode,
    EmploymentType,
    Source,
    ContractType,
    JobStatus,
} from '@/utils/helpers/constants';

const opportunityVersionSchema = Joi.object({
    title: Joi.string().min(3).required(),
    language: Joi.valid(...Object.values(Language)).optional(),
    jobDescription: Joi.string().min(10).required(),
    visibility: Joi.valid(...Object.values(Visibility)).required(),
    isArchived: Joi.boolean().default(false),
});

const createOpportunitySchema = Joi.object({
    isPublished: Joi.boolean().default(false),
    publishAt: Joi.date().optional(),
    opportunityType: Joi.valid(...Object.values(OpportunityType)).required(),
    dateOfExpiration: Joi.date().iso().allow(null),
    industry: Joi.valid(...Object.values(Industry)).required(),
    urgent: Joi.boolean(),
    salaryMinimum: Joi.string(),
    country: Joi.valid(...Object.values(Countries)).required(),
    contractType: Joi.valid(...Object.values(ContractType)).required(),
    minExperience: Joi.number().integer().min(0).required(),
    maxExperience: Joi.number().integer().min(Joi.ref('minExperience')).required().messages({
        'number.min': '"maxExperience" must be greater than or equal to "minExperience"',
    }),
    workMode: Joi.valid(...Object.values(WorkMode)).optional(),
    employmentType: Joi.valid(...Object.values(EmploymentType)).optional(),
    source: Joi.valid(...Object.values(Source)).optional(),
    OpportunityVersions: Joi.array().items(opportunityVersionSchema).min(1).required().messages({
        'array.min': 'At least one OpportunityVersion is required',
    }),
    city: Joi.object({
        name: Joi.string().required(),
    })
        .required()
        .messages({
            'any.required': '"city" is required',
            'object.base': '"city" must be an object with a name',
        }),
});

const updateOpportunitySchema = Joi.object({
    isPublished: Joi.boolean(),
    publishAt: Joi.date().optional(),
    opportunityType: Joi.valid(...Object.values(OpportunityType)),
    dateOfExpiration: Joi.date().iso().allow(null),
    industry: Joi.alternatives().try(
        Joi.array().items(Joi.string().valid(...Object.values(Industry))),
        Joi.string().valid(...Object.values(Industry)),
    ),
    urgent: Joi.boolean(),
    salaryMinimum: Joi.string(),
    country: Joi.valid(...Object.values(Countries)),
    contractType: Joi.valid(...Object.values(ContractType)),
    minExperience: Joi.number().integer().min(0),
    maxExperience: Joi.number().integer().min(Joi.ref('minExperience')).messages({
        'number.min': '"maxExperience" must be greater than or equal to "minExperience"',
    }),
    workMode: Joi.valid(...Object.values(WorkMode)),
    employmentType: Joi.alternatives().try(
        Joi.array().items(Joi.string().valid(...Object.values(EmploymentType))),
        Joi.string().valid(...Object.values(EmploymentType)),
    ),
    createdBy: Joi.string(),
    source: Joi.valid(...Object.values(Source)),
    OpportunityVersions: Joi.array().items(opportunityVersionSchema).min(1),
    city: Joi.object({
        name: Joi.string().required(),
        lat: Joi.number().min(-90).max(90).required().messages({
            'number.base': '"lat" must be a number',
            'any.required': '"lat" is required',
        }),
        lng: Joi.number().min(-180).max(180).required().messages({
            'number.base': '"lng" must be a number',
            'any.required': '"lng" is required',
        }),
    })
        .optional()
        .messages({
            'object.base': '"city" must be an object with name, lat, and lng',
        }),
});

export const filterOpportunitySchema = Joi.object({
    country: Joi.string().valid(...Object.values(Countries)),
    industry: Joi.alternatives().try(
        Joi.array().items(Joi.string().valid(...Object.values(Industry))),
        Joi.string().valid(...Object.values(Industry)),
    ),
    opportunityType: Joi.string().valid(...Object.values(OpportunityType)),
    minExperience: Joi.number().integer().min(0),
    maxExperience: Joi.number().integer().min(0),
    contractType: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()),
    city: Joi.string().min(1),
    workMode: Joi.string().valid(...Object.values(WorkMode)),
    employmentType: Joi.alternatives().try(
        Joi.array().items(Joi.string().valid(...Object.values(EmploymentType))),
        Joi.string().valid(...Object.values(EmploymentType)),
    ),
    createdBy: Joi.string(),
    isPublished: Joi.boolean(),
    isArchived: Joi.boolean(),
    urgent: Joi.boolean(),
    visibility: Joi.string().valid(...Object.values(Visibility)),
    orderBy: Joi.string().valid('createdAt', 'dateOfExpiration', 'minExperience', 'maxExperience', 'salaryMinimum').default('createdAt'),
    status: Joi.alternatives().try(
        Joi.array().items(Joi.string().valid(...Object.values(JobStatus))),
        Joi.string().valid(...Object.values(JobStatus)),
    ),
    orderDirection: Joi.string().valid('ASC', 'DESC').default('DESC'),
    limit: Joi.number().integer().min(1).max(100).default(20),
    offset: Joi.number().integer().min(0).default(0),
    title: Joi.string().min(1).optional(),
});


export {
  createOpportunitySchema,
  updateOpportunitySchema,
};
