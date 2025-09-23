import HttpException from '@/utils/exceptions/http.exception';
import { auth } from '@/utils/services';
import { Socket } from 'socket.io';

function getTokenFromSocket(socket: Socket, tokenName: string): string {
    const cookieHeader = socket.request.headers.cookie;

    if (!cookieHeader) {
        throw new HttpException(401, 'Unauthorized');
    }

    const token = cookieHeader
        .split('; ')
        .find(c => c.startsWith(`${tokenName}=`))
        ?.split('=')[1];

    if (!token) {
        throw new HttpException(401, `Missing ${tokenName}`);
    }

    return token;
}

export async function setupAuthMiddleware(socket: Socket, next: (err?: any) => void) {
    try {
        const accessToken = getTokenFromSocket(socket, 'accessToken');

        const { payload: rawPayload } = await auth.verifyToken(accessToken, process.env.ACCESS_TOKEN_PRIVATE_KEY!);

        const payload = typeof rawPayload === 'string' ? null : rawPayload;

        if (!payload) {
            return next(new HttpException(401, 'Invalid token payload'));
        }

        socket.data.user = payload;
        next();
    } catch (err: any) {
        return next(new HttpException(500, `Auth error: ${err.message}`));
    }
}
