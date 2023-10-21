import {useCallback, useEffect, useRef} from 'react';
import {useAliveController} from 'react-activation';
import {RouteObject, matchRoutes, RouteMatch, useLocation, useNavigate} from 'react-router-dom';
import omit from 'lodash/omit';
import useSessionStorageState from 'ahooks/es/useSessionStorageState';
import useMemoizedFn from 'ahooks/es/useMemoizedFn';

// 扩展路由中自定义配置
declare module 'react-router-dom' {
  interface RouteObject {
    tabTemplate?: string; // 自定义标签显示文案
    name?: string;
    /**
     *标签模式，single 仅显示一个，当路由是动态路由时，多个地址会合并成一个Tab,当设置为inner时，会聚合在父标签中。
     */
    tabMode?: 'single' | 'inner';
    noCache?: boolean; // 不缓存，不缓存的页面每次都会重新生成。 ==> CacheWrapper 中不使用KeepAlive包裹
    saveScrollPosition?: boolean | string;
    isLayout?: boolean;
    tabKey?: string;
    redirect?: boolean;
  }
}

type PageType = RouteObject & {
  pathname: string;
};

export type IWindow = RouteObject & {
  initPathName?: string;
  pathname: string;
  name?: string;
  pages: PageType[]; // 多个页面共用一个Tab.
  badge?: number; // badge显示
};

function getMatchRoutes(routes: RouteObject[], pathname: string) {
  const segs = pathname.split('/');
  const _routes: RouteMatch[] = [];
  for (let i = 0; i < segs.length; i++) {
    const path = segs.slice(0, i + 1).join('/');
    const _matchRoutes = matchRoutes(routes, path);
    if (_matchRoutes && _matchRoutes.length > 0) {
      _routes.push(_matchRoutes[_matchRoutes.length - 1]);
    }
  }
  return _routes;
}

function parseTemplateString(template: string, data: object) {
  if (/\$\{/.test(template)) {
    const names = Object.keys(data);
    const values = Object.values(data);
    return new Function(...names, `return \`${template}\`;`)(...values);
  }
  return template;
}

function getDynamicTabName(pattern: string, params: object) {
  // 对于详情页面生成不同的标签名
  return parseTemplateString(pattern, params);
}

function getTargetTab(routes: RouteObject[], pathname: string, search?: string) {
  const matchedRoutes = getMatchRoutes(routes, pathname);
  if (matchedRoutes && matchedRoutes.length > 0) {
    const extractRoute = matchedRoutes.pop()!;
    const {route, params} = extractRoute;

    const {tabMode, name, tabTemplate, tabKey, redirect, element} = route;// 如果重定向, 则忽略
    // @ts-ignore
    if (!!redirect || element?.type?.name === 'NavigateWithParams' || (!name && !tabTemplate)) {
      return undefined;
    }
    if (tabMode === 'inner') {
      // 父级, 获取到的父级可能有问题，有可能是layout
      const parent = matchedRoutes.pop();
      if (parent && !parent.route.isLayout) {
        // 根据父级生成对应的Tab
        return {
          tabKey,
          ...omit(parent.route, ['element']),
          initPathName: parent.pathname,
          tabMode: 'inner', // 需要替换父级菜单
          name: parent.route.tabTemplate
            ? getDynamicTabName(parent.route.tabTemplate, params)
            : parent.route.name,
          pathname: pathname + search,
          pages: [
            {
              ...omit(route, ['element']),
              name: tabTemplate ? getDynamicTabName(tabTemplate, params) : name,
              pathname,
            },
          ],
        } as IWindow;
      }
    }
    const page = {
      ...omit(route, ['element']),
      name: tabTemplate ? getDynamicTabName(tabTemplate, params) : name,
      pathname: pathname + search,
    };
    return {
      tabKey,
      ...page,
      initPathName: pathname,
      pages: [page],
    } as IWindow;
  }
  return undefined;
}

function addPage(pages: PageType[], page: PageType) {
  if (
    pages.find(
      (_page) => _page.pathname === page.pathname && _page.path === page.path,
    )
  ) {
    return;
  }
  pages.push(page);
}


function getWindowTabList(paths: string[], routes: RouteObject[], search?: string) {
  const tabPathList = Array.from(new Set(paths));// 可能会存在重复，
  let windowTabList: IWindow[] = [];
  for (let i = 0; i < tabPathList.length; i++) {
    const path = tabPathList[i];
    const target = getTargetTab(routes, path, search);
    if (target) {
      const sameIndex = windowTabList.findIndex(_ => _.initPathName === target.initPathName)
      if (sameIndex > -1) {
        windowTabList.splice(sameIndex, 1, target);
      } else {
        windowTabList.push(target);
      }
    }
  }
  return windowTabList;
}

type TabState = {
  activeKey: string;
  wins: IWindow[];
}

// 跟sessionStorage 联动
const useTabs = (defaultTabs: string[] = [], routes: RouteObject[]) => {
  const location = useLocation();
  const {dropScope, refresh, getCachingNodes} = useAliveController();
  const navigate = useNavigate();
  const initRef= useRef(true);

  const [tabState, setTabState] = useSessionStorageState<TabState>('__window_tabs_cache__', {
    defaultValue: () => {
      const pathname = location.pathname;
      const defaultTabList = getWindowTabList([...defaultTabs], routes);
      const targetTabList = getWindowTabList([pathname], routes, location.search);
      return {
        activeKey: pathname,
        wins: [...defaultTabList,...targetTabList],
      };
    }
  }) as [TabState, (value?: TabState | ((before: TabState) => TabState)) => void];

  const onPathChange = useCallback((pathname: string, search?: string) => {
    const targetTab = getTargetTab(routes, pathname, search);
    if (targetTab) {
      const {tabMode} = targetTab;
      setTabState((tabState: TabState) => {
        const {wins} = tabState!;
        if (tabMode === 'inner') {
          // 聚合在父级Tab下，如果没有则创建
          const findParentTab = wins.find(
            (parent) =>
              String(parent.path).toLowerCase() === String(targetTab.path).toLowerCase() &&
              String(parent.initPathName).toLowerCase() === String(targetTab.initPathName).toLowerCase(),
          );
          if (!findParentTab) {
            return {
              ...tabState,
              activeKey: targetTab.pathname,
              wins: [...wins, targetTab],
            };
          }
          findParentTab.pathname = targetTab.pathname;
          const page = targetTab.pages[0];
          addPage(findParentTab.pages, page!);
          return {
            ...tabState,
            activeKey: findParentTab.pathname,
            wins: [...wins],
          };
        }
        if (tabMode === 'single') {
          // 不同params只存在一个Tab
          const findExistTab = wins.find((tab) => tab.path === targetTab.path);
          if (!findExistTab) {
            return {
              ...tabState,
              activeKey: targetTab.pathname,
              wins: [...wins, targetTab],
            };
          }
          if (findExistTab.pathname !== targetTab.pathname) {
            dropScope(findExistTab.pathname);
            findExistTab.pathname = targetTab.pathname;
          }
          const page = targetTab.pages[0];
          addPage(findExistTab.pages, page!);
          findExistTab.name = targetTab.name;
          // 需要清楚缓存
          return {
            ...tabState,
            activeKey: findExistTab.pathname,
            wins: [...wins],
          };
        }
        // pathname 被修改了，
        const findExist = wins.find(
          (tab) => tab.initPathName === targetTab.initPathName,
        );
        if (!findExist) {
          return {
            ...tabState,
            activeKey: targetTab.pathname,
            wins: [...wins, targetTab],
          };
        }
        const page = targetTab.pages[0];
        addPage(findExist.pages, page!);

        if (findExist.pathname !== targetTab.pathname) {
          dropScope(findExist.pathname);
          findExist.pathname = targetTab.pathname;
        }

        return {
          ...tabState,
          activeKey: findExist.pathname,
        };
      });
    }
  }, []);

  useEffect(() => {
    if(!initRef.current){
      const pathname = location.pathname; // 这个会包括base部分需要截掉
      onPathChange(pathname, location.search);
    }else{
      initRef.current = false;
    }
  }, [location]);

  const removeTab = useCallback(
    (pathname: string) => {
      const {wins} = tabState;
      const winIndex = wins.findIndex((win) => win.pathname === pathname);
      if (winIndex > -1) {
        const win = wins[winIndex];
        const pages = win.pages;
        // 查找
        wins.splice(winIndex, 1);
        const lastWin = wins[wins.length - 1]; // 最后一个
        navigate(lastWin ? lastWin.pathname : '/');
        pages.forEach((page) => {
          console.log('清除页面缓存', page.pathname);
          dropScope(page.pathname); // 占用用不能清除
        });
      }
    },
    [tabState],
  );

  // 菜单功能
  const removeTabByIndex = useCallback(
    (index: number) => {
      // TODO 可能不是当前激活的，不一定需要重制页面地址。
      const removeWin = tabState.wins[index];
      const pathname = removeWin.pathname;
      const {activeKey, wins} = tabState;
      wins.splice(index, 1);
      if (activeKey === pathname) {
        // 激活的关闭了需要跳转新的
        const lastWin = wins[wins.length - 1]; // 最后一个
        navigate(lastWin ? lastWin.pathname : '/');
      } else {
        setTabState({activeKey, wins: [...wins]});
      }
      const pages = removeWin.pages;
      pages.forEach((page) => {
        dropScope(page.pathname); // 占用用不能清除
      });
    },
    [tabState],
  );

  // 不需要重制页面地址
  const removeOthers = useCallback(
    (index: number) => {
      const {wins, activeKey} = tabState;
      const nextWins = wins.splice(index, 1);
      setTabState({
        activeKey,
        wins: nextWins,
      });
      wins.forEach((win) => {
        const pages = win.pages;
        pages.forEach((page) => {
          dropScope(page.pathname); // 占用用不能清除
        });
      });
    },
    [tabState],
  );

  const removeAll = useCallback(() => {
    const {wins} = tabState;
    setTabState({
      activeKey: '/',
      wins: [],
    });
    navigate('/');
    wins.forEach((win) => {
      const pages = win.pages;
      pages.forEach((page) => {
        dropScope(page.pathname);
      });
    });
  }, [tabState]);

  const refreshPage = useCallback(
    (index: number) => {
      const activeWin = tabState.wins[index];
      const pathname = activeWin.pathname;
      refresh(pathname);
    },
    [tabState],
  );

  const setTabBadge = useMemoizedFn((tabKey: string, badge?: number) => {
    setTabState(tabState => {
      tabState.wins = tabState.wins.map(win => {
        if (win.tabKey === tabKey) {
          return {...win, badge};
        }
        return win;
      });
      return {...tabState}
    });
  });

  return {
    ...tabState,
    removeTab,
    removeTabByIndex,
    removeOthers,
    removeAll,
    refreshPage,
    setTabBadge,
  };
};

export {useTabs};
