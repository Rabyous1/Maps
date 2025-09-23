import { routePermissions } from '@/helpers/RoutesList';

// export const getRequiredRoles = (pathname) => {
//   return (
//     //loop sur routep (le 1er)
//     Object.entries(routePermissions).find(([route]) =>
//       pathname.startsWith(route)
//     )?.[1] || null
//   );
// };
export const getRequiredRoles = (pathname) => {
  const entries = Object.entries(routePermissions);

  for (const [route, roles] of entries) {
    if (route.includes(":")) {
      const dynamicRoutePattern = "^" + route.replace(/:[^/]+/g, "[^/]+") + "$";
      const regex = new RegExp(dynamicRoutePattern);
      if (regex.test(pathname)) {
        return roles;
      }
    } else if (pathname === route) {
      return roles;
    }
  }

  return null;
};

export const useAuthorization = (pathname, user) => {
  const requiredRoles = getRequiredRoles(pathname);
  const isProtected = Boolean(requiredRoles);

  const isUnauthorized =
    isProtected && (!user || !requiredRoles.some(role => user.roles.includes(role)));

  return {
    isProtected,
    isUnauthorized,
    requiredRoles,
  };
};
