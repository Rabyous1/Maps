
import { candidateStatus, Countries, Industry, LanguageLevel, LanguageName, LegalStatus, Role } from '@/utils/helpers/constants';
import * as Joi from 'joi';
const createUserSchema = Joi.object({
    fullName: Joi.string().min(3).required(),
    phone: Joi.string().trim().min(1).optional().messages({
        'string.empty': 'Phone number is required',
    }),
    email: Joi.string().required().email(),
    roles: Joi.valid(...Object.values(Role)).required(),
    country: Joi.valid(...Object.values(Countries)).required(),
    profilePicture: Joi.string(),
    dateOfBirth: Joi.alternatives()
        .try(
            Joi.string().allow('', null),
            Joi.date().custom(value => {
                const date = new Date(value);
                return date.toISOString().split('T')[0];
            }, 'Format dateOfBirth to YYYY-MM-DD'),
        )
        .optional(),
}).options({ abortEarly: false });

const updateUserSchema = Joi.object({
    fullName: Joi.string().trim().min(1).optional().messages({
        'string.empty': 'Full name is required',
    }),
    email: Joi.string().trim().email().optional().messages({
        'string.email': 'Invalid email',
        'string.empty': 'Email is required',
    }),

    phone: Joi.string().trim().min(1).optional().messages({
        'string.empty': 'Phone number is required',
    }),

    country: Joi.string()
        .valid(...Object.values(Countries))
        .optional()
        .messages({
            'any.only': 'Invalid country selected',
            'string.empty': 'Country is required',
        }),

    roles: Joi.string()
        .valid(...Object.values(Role))
        .optional()
        .messages({
            'any.only': 'Invalid role selected',
            'string.empty': 'Role is required',
        }),
    dateOfBirth: Joi.alternatives()
        .try(
            Joi.string().allow('', null),
            Joi.date().custom(value => {
                const date = new Date(value);
                return date.toISOString().split('T')[0];
            }, 'Format dateOfBirth to YYYY-MM-DD'),
        )
        .optional(),
}); 

const commonAccountFields = {
  fullName: Joi.string().trim().min(3).optional().messages({
    'string.min': 'Fullname must be at least 3 characters',
    'string.empty': 'Fullname is required',
  }),
  phone: Joi.string().trim().min(1).optional().messages({
    'string.empty': 'Phone number is required',
  }),
  country: Joi.string()
    .valid(...Object.values(Countries))
    .optional()
    .messages({
      'any.only': 'Invalid country',
      'string.empty': 'Country is required',
    }),
  profilePicture: Joi.string().optional().allow(null),
  email: Joi.string().email().optional().messages({
    'string.email': 'Invalid email address',
    'string.empty': 'Email is required',
  }),
  dateOfBirth: Joi.alternatives()
    .try(
      Joi.string().allow('', null),
      Joi.date().custom((value) => {
        const date = new Date(value);
        return date.toISOString().split('T')[0];
      }, 'Format dateOfBirth to YYYY-MM-DD')
    )
    .optional(),
};

const candidateOnlyFields = {
    summary: Joi.string()
        .allow('', null) 
        .optional()
        .custom((value, helpers) => {
            if (typeof value !== 'string' || value.trim() === '') return value; // skip check if empty
            const words = value.trim().split(/\s+/).filter(Boolean);
            if (words.length < 5) return helpers.error('string.minWords');
            return value;
        })
        .messages({
            'string.minWords': 'Summary must be at least 5 words',
        }),

    linkedinLink: Joi.string().uri().optional().allow('', null),
    targetRole: Joi.string()
        .optional()
        .allow('', null)
        .custom((value, helpers) => {
            const words = (value || '').trim().split(/\s+/);
            if (words.length === 0) return helpers.error('string.minWords');
            if (words.length > 5) return helpers.error('string.maxWords');
            return value;
        })
        .messages({
            'string.minWords': 'Target role must contain at least one word',
            'string.maxWords': 'Target role must not exceed 5 words',
        }),
    skills: Joi.array().items(Joi.string()).optional().allow(null),
    education: Joi.array().items(Joi.object()).optional().allow(null),
    professionalExperience: Joi.array().items(Joi.object()).optional().allow(null),
    certification: Joi.array().items(Joi.object()).optional().allow(null),
    industry: Joi.string()
        .valid(...Object.values(Industry))
        .optional()
        .allow(null),
    languages: Joi.array()
        .items(
            Joi.object({
                name: Joi.string()
                    .valid(...Object.values(LanguageName))
                    .required(),
                level: Joi.string()
                    .valid(...Object.values(LanguageLevel))
                    .required(),
            }),
        )
        .custom((value, helpers) => {
            for (const lang of value) {
                const hasName = !!lang.name;
                const hasLevel = !!lang.level;
                if (hasName !== hasLevel) {
                    return helpers.error('any.invalid', {
                        message: 'Both language name and level must be provided together.',
                    });
                }
            }
            return value;
        }, 'name and level must be together')
        .optional()
        .allow(null)
        .messages({
            'any.invalid': 'Both language name and level must be provided together.',
        }),
    nationalities: Joi.array().items(Joi.string()).optional().allow(null),
    status: Joi.string()
        .valid(...Object.values(candidateStatus))
        .optional(),
    monthsOfExperiences: Joi.number().integer().optional().allow(null),
    numberOfCertifications: Joi.number().integer().optional().allow(null),
    numberOfEducations: Joi.number().integer().optional().allow(null),
    numberOfSkills: Joi.number().integer().optional().allow(null),
    numberOfExperiences: Joi.number().integer().optional().allow(null),
    numberOfLanguages: Joi.number().integer().optional().allow(null),
};

const recruiterOnlyFields = {
  position: Joi.string().optional().allow('', null),
  department: Joi.string().optional().allow('', null),
  companyName: Joi.string().optional().allow('', null),
  companyWebsite: Joi.string().uri().optional().allow('', null),
  companySize: Joi.string().optional().allow('', null),
  recruiterSummary: Joi.string().optional().allow('', null),
  legalStatus: Joi.string().valid(...Object.values(LegalStatus)).optional().allow(null),
  fiscalNumber: Joi.string().optional().allow('', null),
  currentCompany: Joi.string().optional().allow('', null), 
};


// Schema final conditionnel
const updateUserAccountSchema = Joi.object({
  ...commonAccountFields,
}).when(Joi.object({ roles: Joi.valid('Candidat') }).unknown(), {
  then: Joi.object({ ...candidateOnlyFields }),
}).when(Joi.object({ roles: Joi.valid('Recruteur') }).unknown(), {
  then: Joi.object({ ...recruiterOnlyFields }),
});



const updatePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string()
    .min(8)
    .pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).*$/)
    .required()
    .messages({
      'string.pattern.base':
        'Password must contain at least one letter, one number, and one special character.',
    }),
});
export {
  createUserSchema,
  updateUserSchema ,

  updateUserAccountSchema,
  updatePasswordSchema
};