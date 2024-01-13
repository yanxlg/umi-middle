import { matchRoutes, title } from 'umi';
import { createSearchParams } from 'react-router-dom';

function parseTemplateString(template: string, data: object) {
  const names = Object.keys(data);
  const values = Object.values(data);
  return new Function(...names, 'tplParams', `return \`${template}\`;`)(...values, data);
}

function searchToObject(search?: string) {
  if (search) {
    const searchParams = createSearchParams(search);
    let params: { [key: string]: string } = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  }
  return {};
}

function getDynamicTitle(pattern: string, params: object, search?: string) {
  const searchParams = searchToObject(search);
  return parseTemplateString(pattern, { ...params, ...searchParams });
}

export function onRouteChange({ clientRoutes, location }: any) {
  const matchRoute = matchRoutes(clientRoutes, location.pathname)?.pop();
  if(matchRoute){
    const { route, params } = matchRoute;
    const {title: pageTitle} = route;
    const dynamicTitle = getDynamicTitle(pageTitle, params, location.search);
    document.title = pageTitle ? `${title} - ${dynamicTitle}` : title;
  }
}
