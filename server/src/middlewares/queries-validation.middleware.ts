import { Request, Response, NextFunction } from 'express';

const validateQueries = async (request: Request, response: Response, next: NextFunction) => {
    const queries: any = request.query;

    const { pageNumber, pageSize } = queries;
    if (pageNumber || pageSize) {
        if (pageNumber < 1 || pageSize < 1 || isNaN(pageNumber) || isNaN(pageSize)) return response.status(406).json({
            message: 'Invalid pageNumber or pageSize'
        });
    }

    next();
};

export default validateQueries;
