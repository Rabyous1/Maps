import { cleanEnv, str, port, num } from 'envalid';

function validateEnv(): void {
    cleanEnv(process.env, {
        NODE_ENV: str({
            choices: ['dev', 'prod', 'test'],
        }),
        APP_PORT: port(),

        DB_USER: str(),
        DB_PASSWORD: str(),
        DB_NAME: str(),
        DB_HOST: str(),
        DB_PORT: num(),

        ACCESS_TOKEN_PRIVATE_KEY: str(),
        ACCESS_TOKEN_TIME: str(),

        REFRESH_TOKEN_PRIVATE_KEY: str(),
        REFRESH_TOKEN_TIME: str(),

        RESET_PASSWORD_TOKEN_PRIVATE_KEY: str(),
        RESET_PASSWORD_TIME: str(),

        RESET_PASSWORD_URL_FRONT: str(),
        CONFIRM_ACCOUNT_URL_FRONT: str(),

        COOKIE_MAX_AGE: num(),
    });
}

export default validateEnv;
