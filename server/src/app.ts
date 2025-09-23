import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import swaggerUI from 'swagger-ui-express';
import cookieParser from 'cookie-parser';
import requestIp from 'request-ip';
import bodyParser from 'body-parser';
import path from 'path';
import http from 'http';
import YAML from 'yamljs';

import Controller from './utils/interfaces/controller.interface';
import ErrorMiddleware from './middlewares/error.middleware';
import { logger } from './utils/logger/';
import { postgresConnect } from './utils/databases';
import passport from 'passport';
import session from 'express-session';
//import { initialiseSocket } from '@/utils/config/socket';
import { initialiseSocket } from '@/utils/config/socket/index';
import { schedulePendingOpportunities } from './utils/jobs/startup-jobs';
import { startInterviewScheduler } from './utils/jobs/interviews.job';

const uploadsFolderPath = path.join(__dirname, 'uploads');
const publicFolderPath = path.join(__dirname, 'public');
const buildFrontendFolderPath = path.join(__dirname, '../build');

class App {
    public express: express.Application;
    public port: number;
    private server: http.Server;

    private sessionMiddleware = session({
        secret: process.env.SESSION_SECRET || 'your-secret-here',
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: Number(process.env.COOKIE_MAX_AGE),
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            sameSite: 'lax',
        },
    });

    constructor(controllers: Controller[], port: number) {
        this.express = express();
        this.port = port;
        this.server = http.createServer(this.express);

        initialiseSocket(this.server);

        this.express.use(cookieParser());
        this.express.use(this.sessionMiddleware);

        this.initialiseMiddleware();
        this.initialiseControllers(controllers);
        this.initialiseErrorHandling();
        this.initialiseDatabaseConnection();
    }

    private initialiseMiddleware(): void {
        this.express
            .use(bodyParser.json())
            .use(
                cors({
                    origin: process.env.ALLOWED_IPS?.split(',') || ['http://localhost:3000'],
                    credentials: true,
                }),
            )
            .use(requestIp.mw())
            .use(express.json())
            .use(express.urlencoded({ extended: true }))
            .use(passport.initialize())
            .use(passport.session())

            .use('/uploads', express.static(uploadsFolderPath))
            .use('/static', express.static(publicFolderPath));

        if (process.env.NODE_ENV !== 'dev') {
            this.express.use(express.static(buildFrontendFolderPath));
            this.express.get('*', (req, res) => {
                res.sendFile(path.join(buildFrontendFolderPath, 'index.html'));
            });
        }
    }

    private initialiseControllers(controllers: Controller[]): void {
        controllers.forEach((controller: Controller) => {
            this.express.use('/api/v1', controller.router);
        });
    }

    private initialiseErrorHandling(): void {
        this.express.use(ErrorMiddleware);
    }

    private async initialiseDatabaseConnection() {
        await postgresConnect();
        // await schedulePendingOpportunities();
        // startInterviewScheduler();
        if (process.env.NODE_ENV !== 'test') {
            await schedulePendingOpportunities();
            startInterviewScheduler();
        }
    }

    public listen(): void {
        const swaggerDocument = YAML.load('./swagger.yaml');
        this.express.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

        this.server.listen(this.port, () => {
            logger.info(`App listening on port ${this.port}`);
        });
    }
    public getServer(): express.Application {
        return this.express;
    }
}

export default App;


