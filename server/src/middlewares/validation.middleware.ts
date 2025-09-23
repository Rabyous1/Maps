import { BaseUserEntitySchema } from '@/apis/user/schemas/base-user.schema';
import { UserRepository } from '@/apis/user/UserRepository';
import { AppDataSource } from '@/utils/databases';
import HttpException from '@/utils/exceptions/http.exception';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import Joi from 'joi';


export function validationMiddleware(schema: Joi.Schema): RequestHandler {
    return async (request: Request, response: Response, next: NextFunction): Promise<void> => {
        const validationOptions = {
            abortEarly: false,
            allowUnknown: true,
            stripUnknown: true,
        };

        try {
            const value = await schema.validateAsync(request.body, validationOptions);

            request.body = value;
            next();
        } catch (error: any) {
            console.error(error);

            const errors: string[] = [];
            error.details.forEach((error: Joi.ValidationErrorItem) => {
                errors.push(error.message);
            });
            response.status(406).send(errors);
        }
    };
}

export function validationWithFileMiddleware(schema: Joi.Schema): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const validationOptions = {
            abortEarly: false,
            allowUnknown: true,
            stripUnknown: true,
        };
        const candidatObjectFromUpload = req.file?.buffer.toString();

        if (candidatObjectFromUpload === undefined) {
            res.status(500).send({ error: 'Upload file field is empty' });
            return;
        }

        try {
            const value = await schema.validateAsync(JSON.parse(candidatObjectFromUpload), validationOptions);
            req.body = value;
            next();
        } catch (e: any) {
            console.error(e);

            const errors: string[] = [];
            e.details.forEach((error: Joi.ValidationErrorItem) => {
                errors.push(error.message);
            });
            res.status(406).send(errors);
        }
    };
}


export const validateUUID = (req: Request, res: Response, next: NextFunction) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  for (const [key, rawValue] of Object.entries(req.params)) {
    if (!rawValue) continue;

    const value = rawValue.includes('.') ? rawValue.split('.')[0] : rawValue;

    // Si la valeur ressemble à un UUID (contient des tirets ou fait 32 à 36 chars), on valide
    const mightBeUUID = value.includes('-') || value.length >= 32;

    if (mightBeUUID) {
      console.log(`[validateUUID] Checking param '${key}' → ${value}`);

      if (!uuidRegex.test(value)) {
        console.error(`[validateUUID] Invalid UUID for '${key}': ${value}`);
        return next(new HttpException(406, `Invalid UUID format for '${key}'`));
      }
    }
  }

  next();
};



export const validateParams = (req: Request, res: Response, next: NextFunction) => {
  const { resource, folder } = req.params;

  // 🔎 Vérification du format de l'année
  const year = parseInt(folder, 10);
  if (isNaN(year) || year.toString() !== folder) {
    return next(new HttpException(404, 'Invalid folder format'));
  }

  const currentYear = new Date().getFullYear();
  if (year <= 2005 || year > currentYear) {
    return next(new HttpException(404, 'Invalid folder format'));
  }

  // ✅ Ressources autorisées
  const allowedResources = ['users', 'candidate', 'resumes', 'irf', 'video', 'avatar'];

  if (!resource || !allowedResources.includes(resource)) {
    return next(new HttpException(404, 'Invalid resource'));
  }

  next();
};

const userRepository = new UserRepository();
export const checkUserExists = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId =
            req.params.userId ||
            req.body.userId ||
            req.query.userId ||
            (req as any).user?._id; 

        console.log('[checkUserExists] Checking user existence for userId:', userId);

        if (!userId) {
            console.warn('[checkUserExists] Missing userId in request');
            return next(new HttpException(400, 'Missing userId'));
        }

        const user = await userRepository.findById(userId);

        if (!user) {
            console.warn(`[checkUserExists] User not found for userId: ${userId}`);
            return next(new HttpException(404, 'User not found'));
        }

        console.log(`[checkUserExists] User found for userId: ${userId}`);

        next();
    } catch (error) {
        console.error('[checkUserExists] Internal error:', error);
        return next(new HttpException(500, 'Internal server error while checking user existence'));
    }
};