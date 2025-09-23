import Joi from 'joi';

export const fileSchema = Joi.object({
    resource: Joi.string().required(),
    ipSender: Joi.string().required(),
    uuid: Joi.string().required(),
    fileName: Joi.string().required(),
    fileType: Joi.string().required(),
    fileSize: Joi.string().required(),
    fileDisplayName: Joi.string().optional(),
    checksum: Joi.string(),
});
