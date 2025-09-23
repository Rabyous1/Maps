import buildDevLogger from './dev-logger';
import buildProdLogger from './prod-logger';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export let logger: any;

if (process.env.NODE_ENV === 'development') {
    logger = buildDevLogger();
} else {
    logger = buildProdLogger();
}