import * as dotenv from 'dotenv';
import path from 'path';

const envFilePath = path.resolve(__dirname, `../.env.${process.env.NODE_ENV}`);
dotenv.config({ path: envFilePath });

import 'module-alias/register';
import validateEnv from './utils/validateEnv';
import App from './app';

import AuthController from '@/apis/auth/auth.controller';
import UserController from '@/apis/user/controllers/user.controller';
import AccountController from '@/apis/user/controllers/account.controller';

import OpportunityController from './apis/opportunity/opportunity.controller';
import { ApplicationController } from './apis/application/application.controller';
import FilesController from './apis/storage/files.controller';
import AuthSocialMediaController from './apis/auth/authSocialMedia/authsocialmedia.controller';
import { DashboardController } from './apis/dashboard/dashboard.controller';
import InterviewController from './apis/interviews/interviews.controller';

validateEnv();

const app = new App(
    [
        new AuthController(),
        new AccountController(),
        new UserController(),
        new AuthSocialMediaController(),
        new AuthSocialMediaController(),
        new OpportunityController(),
        new ApplicationController(),
        new FilesController(),
        new DashboardController(),
        new InterviewController(),
    ],
    Number(process.env.APP_PORT),
);

app.listen();
