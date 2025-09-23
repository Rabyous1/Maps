import Joi from 'joi';

export const sendMessageSchema = Joi.object({
    content: Joi.string().required().messages({
        'string.empty': 'Message content is required',
    }),
    receiverIds: Joi.string().required().messages({
        'string.empty': 'Receiver IDs are required',
    }),
    isAnnouncement: Joi.boolean().default(false),
});
