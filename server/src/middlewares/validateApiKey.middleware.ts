import fs from 'fs';
import path from 'path';

import { Request, Response, NextFunction } from 'express';

const apiKeyMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    //console.log("Headers reçus :", req.headers);

    if (req.headers?.accept !== 'application/json' && req.method === 'GET') {
        try {
            console.log("Requête bloquée : Accept n'est pas 'application/json'");

            const unauthorizedHtmlPath = path.join(__dirname, '../public/unauthorized.html');
            const unauthorizedHtml = fs.readFileSync(unauthorizedHtmlPath, 'utf-8');

            return res.status(403).send(unauthorizedHtml);
        } catch (error) {
            console.error('Erreur de lecture du fichier HTML:', error);
            return res.status(500).send('Internal Server Error');
        }
    }

    console.log("Requête autorisée");
    next();
};

export default apiKeyMiddleware;