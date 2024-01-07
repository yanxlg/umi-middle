import { matchRoutes, title } from 'umi';

export function onRouteChange({ clientRoutes, location }: any) {
  const route = matchRoutes(clientRoutes, location.pathname)?.pop()?.route;
  if (route) {
    const {title: pageTitle} = route;
    document.title = pageTitle ? `${title} - ${pageTitle}` : title;
  }
}
