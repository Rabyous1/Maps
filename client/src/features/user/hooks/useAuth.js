import { jwtDecode } from 'jwt-decode';
import { useCurrentUser } from './users.hooks';
import { usePathname } from 'next/navigation'; 

export const useAuthorization = () => {
  const { data: user, isLoading } = useCurrentUser();
  const pathname = usePathname();

  if (isLoading) {
    return { isLoading: true, isAuthorized: false, user: null };
  }

  if (!user || !user.accessToken) {
    return { isLoading: false, isAuthorized: false, user: null };
  }

  try {
    const decodedToken = jwtDecode(user.accessToken);
    const allowedRoles = routePermissions[pathname]; 
    const isAuthorized = allowedRoles
      ? decodedToken.roles.some(role => allowedRoles.includes(role))
      : true;

    return { isLoading: false, isAuthorized, user: decodedToken };
  } catch (error) {
    console.error('Error decoding token:', error);
    return { isLoading: false, isAuthorized: false, user: null };
  }
};
