import React, { useCallback, useEffect } from 'react';
import { useAliveController } from 'react-activation';
import type { RouteObject } from 'react-router-dom';
import { history, matchRoutes, useAppData, useLocation } from 'umi';
import useSessionStorageState from 'ahooks/es/useSessionStorageState';
import useMemoizedFn from 'ahooks/es/useMemoizedFn';
import { createSearchParams } from 'react-router-dom';
import omit from 'lodash/omit';

declare module 'react-router-dom' {
  interface RouteObject {
    /** 标签label 模版，通过解析路由的params + search生成最终的label文案 */
    tabTemplate?: string; // 自定义标签显示文案
    /**
     *标签模式，single 仅显示一个，当路由是动态路由或带search时，多个地址会合并成一个Tab,当设置为inner时，会聚合在父标签中。
     */
    tabMode?: 'single' | 'inner';
    /** 页面不需要进行状态缓存，每次进入重新初始化 */
    noCache?: boolean;
    /** Tab 对应的Key */
    tabKey?: string;
    /** 重定向路由 */
    redirect?: boolean;

    /** 全局布局组件 umi 会自动加上该属性用于区分 */
    isLayout?: string;
  }

  interface RouteMatch {
    title: string;
  }
}

type DefaultWindowConfigType = {
  key?: string;
  closeable?: boolean;
  pathname?: string;
  search?: string
};

export type IWindow = {
  /** 窗口对应唯一key，对应于url */
  key: string;
  /** 窗口标题 */
  title: string;
  /** 窗口是否冻结，冻结窗口不允许修改、替换，对应于tabMode===‘single’ */
  freeze: boolean;
  /** 显示的badge 值 */
  badge?: number;
  /** Tab是否允许关闭 */
  closeable?: boolean;
  /** 窗口对应的路由 */
  route?: RouteObject;
};

/**
 * 获取命中的路由配置
 * @param routes
 * @param pathname
 */
function getMatchRoute(routes: RouteObject[], pathname: string) {
  const matchList = matchRoutes(routes, pathname);
  return matchList?.pop();
}

/**
 * 动态字符串生成
 * @param template
 * @param data
 */
function parseTemplateString(template: string, data: object) {
  const copyData = {...data};
  delete copyData['*'];// 特殊的需要删除，防止报错
  const names = Object.keys(copyData);
  const values = Object.values(copyData);
  return new Function(...names, 'tplParams', `return \`${template}\`;`)(...values, copyData);
}

/**
 * 将search 转成 object类型
 * @param search
 */
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

/**
 * 生成动态Tab Label，通过模版字符串和params、search参数来生成
 * @param pattern
 * @param params
 * @param search
 */
function getDynamicTabName(pattern: string, params: object, search?: string) {
  const searchParams = searchToObject(search);
  return parseTemplateString(pattern, { ...params, ...searchParams });
}

function getReactNodeName(element: React.ReactNode) {
  if (element) {
    if (typeof element === 'object') {
      if ('type' in element) {
        if (typeof element.type === 'string') {
          return element.type;
        }
        if (typeof element.type === 'object' && element.type && 'name' in element.type) {
          return element.type['name'];
        }
      }
    }
  }
  return undefined;
}

function getPathKey(pathname: string, search?: string) {
  return `${pathname}${search || ''}`;
}

/**
 * 通过 pathname + search 等路由信息创建Window
 * @param routes
 * @param pathname
 * @param search
 * @param closeable
 */
function createWindow(routes: RouteObject[], pathname: string, search?: string, closeable?: boolean): IWindow | undefined { // 支持search
  const matchRoute = getMatchRoute(routes, pathname);
  if (matchRoute) {
    const { route, params } = matchRoute;
    const { tabMode, title, tabTemplate, tabKey, redirect, element } = route;
    if (!!redirect || getReactNodeName(element) === 'NavigateWithParams') {
      return undefined; // 不创建Window,仅作为临时中间页面触发跳转
    }
    return {
      title: tabTemplate ? getDynamicTabName(tabTemplate, params, search) : (title || (route.id === '404'? '404' : 'unknown')),
      key: getPathKey(pathname, search),
      closeable: closeable,
      freeze: tabMode !== 'inner',
      route: omit(route, 'element'),
    };
  } else {
    return {
      title: '404',
      key: getPathKey(pathname, search),
      closeable: true,
      freeze: true,
    };
  }
}

/**
 * 添加Window 到Window队列中，检查是否可以替换
 * @param windows
 * @param win
 */
function addWindowToList(windows: IWindow[], win?: IWindow) {
  if (!win) {
    return windows;
  }
  const { route, key } = win;
  const existIndex = windows.findIndex(old => {
    if(old.key === key){
      return true;
    }
    return !old.freeze && (!old.route && !route && old.key === key || old.route && route && old.route.path === route.path);
  });
  if (existIndex > -1) {
    win.closeable = win.closeable || windows[existIndex].closeable; // 保持原来的值
    windows.splice(existIndex, 1, win);
  } else {
    windows.push(win);
  }
  return windows;
}

/**
 * 通过 location 数组生成对应的窗口列表
 * @param configList
 * @param routes
 */
function getWindowTabList(configList: Array<DefaultWindowConfigType>, routes: RouteObject[]) {
  let windowTabList: IWindow[] = [];
  for (let i = 0; i < configList.length; i++) {
    const config = configList[i];
    const pathname = config.key || config.pathname;
    const search = config.search;
    const closeable = config.closeable;
    const newWindow = createWindow(routes, pathname!, search, closeable);
    if (newWindow) {
      addWindowToList(windowTabList, newWindow);
    }
  }
  return windowTabList;
}

const useTabs = (defaultTabs: Array<string | DefaultWindowConfigType> = []) => {
  const location = useLocation();
  const { clientRoutes } = useAppData();
  const { dropScope, refresh } = useAliveController();

  const [tabState, setTabState] = useSessionStorageState<{
    activeKey: string;
    wins: IWindow[];
  }>('__window_tabs_cache__', {
    deserializer: (value) => {
      const state: { wins: IWindow[]; activeKey: string; } = JSON.parse(value); // wins
      const wins = state.wins || [];
      const { pathname, search } = location;
      const newWindow = createWindow(clientRoutes as unknown as RouteObject[], pathname!, search);
      return {
        wins: addWindowToList(wins, newWindow),
        activeKey: getPathKey(pathname, search), // Tab 不选中
      };
    },
    defaultValue: () => {
      const { pathname, search } = location;
      const initTabConfigList = defaultTabs.map(item => {
        return typeof item === 'string' ? { key: item } : item;
      });
      const defaultWindowList = getWindowTabList(initTabConfigList, clientRoutes as unknown as RouteObject[]);
      const newWindow = createWindow(clientRoutes as unknown as RouteObject[], pathname!, search);
      return {
        wins: addWindowToList(defaultWindowList, newWindow),
        activeKey: getPathKey(pathname, search),
      };
    },
  });

  const onPathChange = useCallback((pathname: string, search?: string) => {
    const nextWindow = createWindow(clientRoutes as unknown as RouteObject[], pathname, search);
    setTabState((tabState) => {
      const { wins, activeKey } = tabState!;
      return {
        activeKey: getPathKey(pathname, search),
        wins: addWindowToList(wins, nextWindow),
      };
    });
  }, []);

  useEffect(() => {
    history.listen(function(updater){ // 比 location Effect 提前一些，会快一点
      const {action, location} = updater;
      if(action !== 'POP'){
         const {pathname, search} = location;
         onPathChange(pathname, search);
      }
    });
  }, []);

  const removeTabByIndex = useCallback(
    (index: number) => {
      const { activeKey, wins } = tabState!;
      const removeWin = wins[index];
      const key = removeWin.key;
      wins.splice(index, 1);

      if (activeKey === key) {
        // next 优先激活前一个标签，如果没有则激活后一个标签
        const nextIndex = index === 0 ? 0: index-1;
        const lastWin = wins[nextIndex]; // 最后一个
        history.push(lastWin ? lastWin.key : '/');
      } else {
        setTabState({ activeKey, wins: [...wins] });
      }
      // 清除缓存
      dropScope(key);
    },
    [tabState],
  );

  const removeTab = useCallback(
    (key: string) => {
      const { wins } = tabState!;
      const index = wins.findIndex((win) => win.key === key);
      if (index > -1) {
        removeTabByIndex(index);
      }
    },
    [tabState],
  );



  // 不需要重制页面地址
  const removeOthers = useCallback(
    (index: number) => {
      setTabState((tabState) => {
        const { wins, activeKey } = tabState!;
        let nextWins: IWindow[] = [];
        let cleanWins: IWindow[] = [];
        const nextActiveKey = wins[index].key;
        for (let i = 0; i < wins.length; i++) {
          const win = wins[i];
          if (win.closeable === false || i === index) {
            nextWins.push(win);
          } else {
            cleanWins.push(win);
          }
        }
        if (nextActiveKey !== activeKey) {
          history.push(nextActiveKey);
        }
        setTimeout(() => {
          cleanWins.forEach(win => {
            // 清除
            dropScope(win.key);
          });
        }, 100);// 切换完成后释放
        return {
          activeKey: nextActiveKey, // 当前的保持不变
          wins: nextWins,
        };
      });
    },
    [],
  );

  const removeAll = useCallback((actionIndex: number) => {
    setTabState((tabState) => {
      const { wins, activeKey } = tabState!;
      const currentWin = wins[actionIndex];
      let nextWins: IWindow[] = [];
      let cleanWins: IWindow[] = [];
      for (let i = 0; i < wins.length; i++) {
        const win = wins[i];
        if (win.closeable === false) {
          nextWins.push(win);
        } else {
          cleanWins.push(win);
        }
      }
      const nextPathname = currentWin.closeable === false ? activeKey : (nextWins[0]?.key || '/');
      if (nextPathname !== activeKey) {
        history.push(nextPathname);
      }
      setTimeout(() => {
        cleanWins.forEach(win => {
          dropScope(win.key); // 清除关闭的缓存
        });
      }, 100); // 切换完成后释放
      return {
        activeKey: nextPathname,
        wins: nextWins,
      };
    });
  }, []);

  const refreshPage = useCallback(
    (index: number) => {
      const activeWin = tabState!.wins[index];
      refresh(activeWin.key);
    },
    [tabState],
  );

  return {
    ...tabState,
    removeTab,
    removeTabByIndex,
    removeOthers,
    removeAll,
    refreshPage,
  };
};

export { useTabs };
