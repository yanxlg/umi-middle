{{#useYhDesign}}
import { YHMenu as AntdMenu, MenuProps, YHTabs as Tabs, YHTooltip as Tooltip, YHBadge as Badge } from "@yh/yh-design";
{{/useYhDesign}}
{{^useYhDesign}}
import { Menu as AntdMenu, MenuProps, Tabs, Tooltip, Badge } from "antd";
{{/useYhDesign}}
import type { MenuInfo } from "rc-menu/lib/interface";
import React, { useCallback, useEffect, useMemo } from "react";
import { history, useAppData } from "umi";
import "./themes/otb/index.less";
import { useTabs, IWindow } from "./useTabs";
import ReloadOutlined from '@ant-design/icons/ReloadOutlined';
import { Menu, useContextMenu } from "react-contexify";
import "react-contexify/dist/ReactContexify.css";

const MENU_ID = "tab_context_menu";


const antPrefixCls = "{{{antdPrefix}}}"; // TODO 需要插件生成

const id = "__window-tabs";
const tabClassSelector = `${antPrefixCls}-tabs-tab`;

const contextMenus = [
  {
    label: "刷新",
    key: "refresh",
  },
  {
    type: "divider",
  },
  {
    label: "关闭当前", // 如果当前的不能关闭
    key: "close",
  },
  {
    label: "关闭其它",
    key: "close-others",
  },
  {
    label: "关闭所有",
    key: "close-all",
  },
] as MenuProps["items"];

function checkInTab(element: HTMLElement): false | number {
  if (element === document.body || element.id === id) {
    return false;
  }
  const classList = element.classList;
  if (classList.contains(tabClassSelector)) {
    const container = element.parentElement!;
    const count = container.children.length;
    for (let i = 0; i < count; i++) {
      if (container.children.item(i) === element) {
        return i;
      }
    }
    return false;
  }
  const parent = element.parentElement;
  if (parent) {
    return checkInTab(parent);
  }
  return false;
}


const ReplaceMenuWithAnt = (props: {
  propsFromTrigger?: { index: 0 };
  removeTabByIndex: (index: number) => void;
  removeOthers: (index: number) => void;
  removeAll: () => void;
  refreshPage: (index: number) => void;
}) => {
  const { removeTabByIndex, removeOthers, removeAll, refreshPage, propsFromTrigger } = props;
  const handleMenuClick = (info: MenuInfo) => {
    const key = info.key;
    const actionIndex = propsFromTrigger?.index!;
    switch (key) {
      case "close":
        removeTabByIndex(actionIndex);
        break;
      case "close-others":
        removeOthers(actionIndex);
        break;
      case "close-all":
        removeAll(actionIndex);
        break;
      case "refresh":
        refreshPage(actionIndex);
        break;
    }
  };

  // 如果当前是不可关闭的标签，则没有关闭操作和关闭所有操作
  const config = propsFromTrigger?.config;
  const items = contextMenus.filter(item=>{
    if(config && config.closeable === false && (item.key === 'close' || item.key === 'close-all')){
      return false;
    }
    return true;
  });
  return <AntdMenu onClick={handleMenuClick} items={items} />;
};


const defaultWidthConfig = {
  type: 'maxWidth',
  width: 120
};



export interface IWindowTabsProps {
  closeable?: boolean;
  /** @deprecated 没有实际作用，请使用defaultTabs代替配置默认的Tab列表及关闭开关，已废弃⚠️ */
  firstTabCloseable?: boolean;
  /** 当没有Tabs时是否显示 */
  showWhenEmptyTabs?: boolean;
  style?: React.CSSProperties;
  className?: string;
  theme?: 'otb';// 内置主题
  /** 宽度模式 */
  widthType?: 'fit-content' | { type: 'maxWidth'; width: number } | { type: 'width'; width: number };
  /** 默认显示的标签列表，通过closeable配置是否可以关闭 */
  defaultTabs?: Array<string | {key: string; closeable?: boolean;}>;
  rightMenu?: boolean;// 是否显示右键操作按钮。
  reloadIcon?: boolean; // 是否显示刷新图标
}


function TabLabel({index, widthType, name, badge, onReload}:{index:number; widthType: IWindowTabsProps['widthType']; name: string; badge?: number; onReload?: Function}) {
  const content = widthType === 'fit-content' ? name : <Tooltip title={name}><div style={ {[widthType.type]: widthType.width, textOverflow: 'ellipsis', overflow: 'hidden'} }>{name}</div></Tooltip>;
  return (
    <>
      {content}
      { badge === void 0 ? null:<Badge count={badge} offset={[15,-20]} style={ {position:'absolute'} }/>}
      {
        onReload?(
          <ReloadOutlined
           style={ { marginLeft: 10, marginRight: 0 } }
           onClick={()=>onReload(index)}
         />
        ):null
      }
    </>
  );
}

const TabPanel = Tabs.TabPane;

export let setTabBadge = (tabKey: string, badge?: number)=>{};


const defaultConfig = {{{defaultConfig}}};

export default function WindowTabs(props: IWindowTabsProps & {
  badgeMap?: {[key:string]: number}
}) {
  const {pluginManager} = useAppData();

  const config = useMemo(()=>{
    const runtimeConfig = pluginManager.applyPlugins({
      key: 'tabs',
      type: 'modify',
    });
    return {...defaultConfig, ...runtimeConfig, props};
  },[]);

  const { defaultTabs, closeable = true, widthType = defaultWidthConfig, showWhenEmptyTabs = true, style, className, theme, rightMenu = true, reloadIcon = false } = config;
  const badgeMap = props.badgeMap;

  const {
    activeKey,
    wins,
    removeTab,
    removeTabByIndex,
    removeOthers,
    removeAll,
    refreshPage,
    setTabBadge: _setTabBadge,
  } = useTabs(defaultTabs);

  const { show } = useContextMenu({
    id: MENU_ID,
  });

  const showContextMenu = useCallback(
    (index: number, config: IWindow, event: React.MouseEvent<Element, MouseEvent>) => {
      show({
        event,
        props: {
          index: index,
          config: config
        },
      });
    },
    []
  );

  const handleContextMenu = (event: React.MouseEvent<Element, MouseEvent>) => {
    const target = event.target as HTMLElement;
    const tabIndex = checkInTab(target);
    if (tabIndex !== false) {
      event.preventDefault();
      const config = wins[tabIndex];
      showContextMenu(tabIndex, config, event);
    }
  };

  const onEdit = useCallback(
    (
      pathname:
        | string
        | React.MouseEvent<Element, MouseEvent>
        | React.KeyboardEvent<Element>,
      action: "remove" | "add"
    ) => {
      if (action === "remove" && typeof pathname === "string") {
        removeTab(pathname);
      }
    },
    [wins]
  );

  const onTabChange = useCallback((pathname: string) => {
    // 切换到新的页面
    history.push(pathname);
  }, []);


  useEffect(()=>{
    setTabBadge = badgeMap? (tabKey: string, badge?: number)=>{console.warning('props传入了badgeMap，请通过props更新')}: _setTabBadge;// 如果props传递了对象，则使用props
  },[]);


  return (
    <>
      <Tabs
        id={id}
        className={`${theme === 'otb'? 'window-tabs-theme-otb':''} --window-tab-container ${className||''}`}
        activeKey={activeKey}
        type="editable-card"
        hideAdd
        style={ {...style, ...showWhenEmptyTabs === false && wins.length ===0? {display:'none'}:{} } }
        tabBarStyle={ { marginBottom: 0 } }
        tabBarGutter={8}
        onChange={onTabChange}
        onEdit={onEdit}
        animated={false}
        items={!!TabPanel ? undefined : wins.map((node, index) => ({
          key: node.pathname,
          label: <TabLabel index={index} widthType={widthType} name={node.name} badge={badgeMap?badgeMap[node.pathname]:node.badge} onReload={reloadIcon ? refreshPage: null}/>,
          closable: node.closeable??closeable,
        }))}
        onContextMenu={rightMenu ? handleContextMenu : null}
      >
        {
          !!TabPanel ? wins.map((win, index) => {
            return (
              <Tabs.TabPane
                closable={win.closeable??closeable}
                key={win.pathname}
                tab={
                  <TabLabel
                    index={index}
                    widthType={widthType as any}
                    name={win.name!}
                    badge={badgeMap?badgeMap[win.pathname]:win.badge}
                    onReload={reloadIcon ? refreshPage : undefined}
                  />
                }
              />
            )
          }) : null
        }
      </Tabs>
      {
        rightMenu? (
          <Menu id={MENU_ID} style={ { padding: 0 } }>
            <ReplaceMenuWithAnt
              removeTabByIndex={removeTabByIndex}
              removeOthers={removeOthers}
              removeAll={removeAll}
              refreshPage={refreshPage}
            />
          </Menu>
        ):null
      }
    </>
  );
}
