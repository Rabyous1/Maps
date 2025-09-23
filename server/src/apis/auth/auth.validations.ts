import {Countries, Role } from '@/utils/helpers/constants';
import Joi from 'joi';

const signUpSchema = Joi.object({
    fullName: Joi.string().min(3).required(),
    phone: Joi.string().min(3),
    email: Joi.string().required().email(),
    country: Joi.valid(...Object.values(Countries)),
    password: Joi.string()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/)
        .required()
        .messages({
            'string.pattern.base': 'Password must include at least one uppercase, lowercase, number, and special character.',
        }),
});

const signInSchema = Joi.object({
    email: Joi.string().required().email(),
    password: Joi.string().min(8).required(),
});

const forgotPasswordSchema = Joi.object({
    email: Joi.string().required().email(),
});

const resetPasswordSchema = Joi.object({
    password: Joi.string()
        .min(8)
        .pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).*$/)
        .required()
        .messages({
            'string.pattern.base': 'Password must contain at least one letter, one number, and one special character.',
        }),
});

const tokenResetPasswordSchema = Joi.object({
    token: Joi.string().min(8).required(),
});

const confirmAccountSchema = Joi.object({
    token: Joi.string().min(40).max(40).required(),
});

const chooseRoleSchema = Joi.object({
    role: Joi.string().valid(Role.CANDIDAT, Role.RECRUTEUR).required().messages({
        'any.only': 'Role must be either CANDIDAT or RECRUTEUR',
        'string.empty': 'Role is required',
    }),
});

const firstTimeloggedInUserSchema = Joi.object({
    phone: Joi.string()
        .required()
        .custom((value: string, helpers: Joi.CustomHelpers) => {
            const allowedFormats = [
                /^\+216\s?\d{8}$/, // Tunisia
                /^\+213\s?\d{9}$/, // Algeria
                /^\+20\s?\d{10}$/, // Egypt
                /^\+212\s?\d{9}$/, // Morocco
                /^\+218\s?\d{9}$/, // Libya
                /^\+966\s?\d{9}$/, // Saudi Arabia
                /^\+33\s?\d{9}$/, // France
                /^\+971\s?\d{9}$/, // UAE
                /^\+41\s?\d{9}$/, // Switzerland
                // Add more countries as needed
            ];
            const isValidFormat = Object.values(allowedFormats).some(regex => regex.test(value));

            if (isValidFormat) {
                return value;
            }

            return helpers.error('any.invalid');
        }, 'Phone number validation'),
    country: Joi.valid(...Object.values(Countries)).required(),
    currentPassword: Joi.string().required(),
    newPassword: Joi.string()
        .min(8)
        .pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).*$/)
        .required()
        .messages({
            'string.pattern.base': 'Password must contain at least one letter, one number, and one special character.',
        }),
});

export {
    signUpSchema,
    signInSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    confirmAccountSchema,
    tokenResetPasswordSchema,
    chooseRoleSchema,
    firstTimeloggedInUserSchema,
};
