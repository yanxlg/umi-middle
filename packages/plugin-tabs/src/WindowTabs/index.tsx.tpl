import { Menu as AntdMenu, MenuProps, Tabs, Tooltip, Badge } from "antd";
import type { MenuInfo } from "rc-menu/lib/interface";
import React, { useCallback } from "react";
import { history, useAppData } from "umi";
import "./themes/otb/index.less";
import { useTabs } from "./useTabs";

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
    label: "关闭当前",
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
  const { removeTabByIndex, removeOthers, removeAll, refreshPage } = props;
  const handleMenuClick = (info: MenuInfo) => {
    const key = info.key;
    const actionIndex = props.propsFromTrigger?.index!;
    switch (key) {
      case "close":
        removeTabByIndex(actionIndex);
        break;
      case "close-others":
        removeOthers(actionIndex);
        break;
      case "close-all":
        removeAll();
        break;
      case "refresh":
        refreshPage(actionIndex);
        break;
    }
  };

  return <AntdMenu onClick={handleMenuClick} items={contextMenus} />;
};


const defaultWidthConfig = {
  type: 'maxWidth',
  width: 120
};



interface IWindowTabsProps {
  closeable?: boolean;
  /** 当只有一个Tab时是否可以删除 */
  firstTabCloseable?: boolean;
  /** 当没有Tabs时是否显示 */
  showWhenEmptyTabs?: boolean;
  style?: React.CSSProperties;
  className?: string;
  theme?: 'otb';// 内置主题
  /** 宽度模式 */
  widthType?: 'fit-content' | { type: 'maxWidth'; width: number } | { type: 'width'; width: number };
  defaultTabs?: string[];// 默认显示的tabs，通过path自动显示默认标签
}


function TabLabel({widthType, name, badge}:{widthType: IWindowTabsProps['widthType'], name: string, badge?: number}) {
  const content = widthType === 'fit-content' ? name : <Tooltip title={name}><div style={ {[widthType.type]: widthType.width, textOverflow: 'ellipsis', overflow: 'hidden'} }>{name}</div></Tooltip>;
  if(void 0 === badge) {
    return content;
  }
  return <Badge count={badge}>{content}</Badge>
}


export let setTabBadge = (tabKey: string, badge?: number)=>{};

export default function WindowTabs(props: IWindowTabsProps) {
  const {
    activeKey,
    wins,
    removeTab,
    removeTabByIndex,
    removeOthers,
    removeAll,
    refreshPage,
    setTabBadge: _setTabBadge,
  } = useTabs(props.defaultTabs);

  const { pluginManager } = useAppData();

  const { firstTabCloseable = true, closeable = true, widthType = defaultWidthConfig, showWhenEmptyTabs = true, style, className, theme } = props;

  const { show } = useContextMenu({
    id: MENU_ID,
  });

  const showContextMenu = useCallback(
    (index: number, event: React.MouseEvent<Element, MouseEvent>) => {
      show({
        event,
        props: {
          index: index,
        },
      });
    },
    []
  );

  const handleContextMenu = useCallback(
    (event: React.MouseEvent<Element, MouseEvent>) => {
      const target = event.target as HTMLElement;
      const tabIndex = checkInTab(target);
      if (tabIndex !== false) {
        event.preventDefault();
        showContextMenu(tabIndex, event);
      }
    },
    []
  );

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
    setTabBadge = _setTabBadge;
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
        items={wins.map((node, index) => ({
          key: node.pathname,
          label: <TabLabel widthType={widthType} name={node.name}/>,
          closable: wins.length === 1 ? firstTabCloseable : closeable,
        }))}
        onContextMenu={handleContextMenu}
      />
      <Menu id={MENU_ID} style={ { padding: 0 } }>
        <ReplaceMenuWithAnt
          removeTabByIndex={removeTabByIndex}
          removeOthers={removeOthers}
          removeAll={removeAll}
          refreshPage={refreshPage}
        />
      </Menu>
    </>
  );
}
