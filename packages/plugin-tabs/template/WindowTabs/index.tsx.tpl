{{#useYhDesign}}
import { MenuProps, YHTabs as Tabs, YHTooltip as Tooltip, YHBadge as Badge, YHDropdown as Dropdown } from "@yh/yh-design";
{{/useYhDesign}}
{{^useYhDesign}}
import { MenuProps, Tabs, Tooltip, Badge, Dropdown } from "antd";
{{/useYhDesign}}
import type { MenuInfo } from "rc-menu/lib/interface";
import React, { useCallback, useMemo, useState } from "react";
import { history, useAppData } from "umi";
import "./themes/otb/index.less";
import { useTabs, IWindow } from "./useTabs";
import ReloadOutlined from '@ant-design/icons/ReloadOutlined';
import styled from 'styled-components';
import { StyledTabs } from './StyledTabs';
import { CloseBtn } from './CloseBtn';


const antPrefixCls = "{{{antdPrefix}}}"; // TODO 需要插件生成
const defaultConfig = {{{defaultConfig}}};

const id = "__window-tabs";
const tabClassSelector = `${antPrefixCls}-tabs-tab`;

const contextMenus = [
  {
    label: "刷新当前页",
    key: "refresh",
  },
  {
      label: "刷新浏览器",
      key: "refresh-all",
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
] as Exclude<MenuProps['items'], undefined>;

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
  /** badge 上限值 */
  overflowCount?: number;
}


const BlockBadge = styled(Badge)`
  span&{
    display: block;
    color: inherit;
  }
`;


function TabLabel({index, widthType, title, badge, onReload, overflowCount}:{index:number; widthType: IWindowTabsProps['widthType']; title: string; badge?: number; onReload?: Function; overflowCount?: number}) {
  // 对于()中内容进行截断溢出处理
  const showLabel = title.replace(/\((\S+)\)/,function(value,$1){
    if($1.length > 5){
      return '(' +$1.substr(0,2) + '...' + $1.substr(-2) + ')';
    }
    return value;
  });
  const content = widthType === 'fit-content' ?
    <Tooltip title={title}><span style={ {fontFeatureSettings: 'normal',fontVariant: 'none'} }>{showLabel}</span></Tooltip> :
    <Tooltip title={title}><div style={ {[widthType!.type]: widthType!.width, textOverflow: 'ellipsis', overflow: 'hidden', fontFeatureSettings: 'normal',fontVariant: 'none'} }>{showLabel}</div></Tooltip>;
  return (
    <>
      { badge === void 0 ? content:<BlockBadge count={badge} overflowCount={overflowCount} style={ {position: 'absolute', left:0, right:'unset', transform: 'translate(-50%,-50%)', marginLeft: -5, pointerEvents: 'none', background: 'rgba(255,77,79,0.9)', zIndex: 5} }>{content}</BlockBadge>}
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

  const { defaultTabs, overflowCount, closeable = true, widthType = defaultWidthConfig, showWhenEmptyTabs = true, style, className, theme, rightMenu = true, reloadIcon = false } = config;
  const badgeMap = props.badgeMap;

  const {
    activeKey,
    wins = [],
    removeTab,
    removeTabByIndex,
    removeOthers,
    removeAll,
    refreshPage,
  } = useTabs(defaultTabs);

  const [menuConfig, setMenuConfig] = useState(undefined); // 右键菜单显示的items

  const handleContextMenu = (event: React.MouseEvent<Element, MouseEvent>) => {
    const target = event.target as HTMLElement;
    const tabIndex = checkInTab(target);
    event.preventDefault();
    if (tabIndex !== false) {
      const handleMenuClick = (info: MenuInfo) => {
        const key = info.key;
        switch (key) {
          case "close":
            removeTabByIndex(tabIndex);
            break;
          case "close-others":
            removeOthers(tabIndex);
            break;
          case "close-all":
            removeAll(tabIndex);
            break;
          case "refresh":
            refreshPage(tabIndex);
            break;
          case 'refresh-all':
            location.reload();
            break;
        }
      };
      const win = wins[tabIndex];
      const isActive = win.key === activeKey;
      const items = contextMenus.filter(item=>{
        if(item.key === 'refresh'){
          return !!isActive;
        }
        return !(win && win.closeable === false && item && (item.key === 'close' || item.key === 'close-all'));
      });
      setMenuConfig({items, handleMenuClick});
    }else{
      setMenuConfig(undefined);
    }
  };

  const onEdit = useCallback(
    (
      key:
        | string
        | React.MouseEvent<Element, MouseEvent>
        | React.KeyboardEvent<Element>,
      action: "remove" | "add"
    ) => {
      if (action === "remove" && typeof key === "string") {
        removeTab(key);
      }
    },
    [wins, activeKey]
  );

  const onTabChange = useCallback((pathname: string) => {
    history.push(pathname);
  }, []);

  const onOpenChange = (nextOpen: boolean)=>{
    if(!nextOpen){
      setMenuConfig(undefined);
    }
  }


  return (
    <Dropdown open={!!menuConfig} onOpenChange={onOpenChange} menu={ {...menuConfig, style:{minWidth: 140} } } trigger={['contextMenu']}>
      <StyledTabs
        id={id}
        className={`${theme === 'otb'? 'window-tabs-theme-otb':''} --window-tab-container ${className||''}`}
        activeKey={activeKey}
        type="editable-card"
        hideAdd
        style={ {...style, ...!showWhenEmptyTabs && wins.length ===0? {display:'none'}:{} } }
        tabBarStyle={ { marginBottom: 0 } }
        onChange={onTabChange}
        onEdit={onEdit}
        animated={false}
        tabBarGutter={0}
        items={!!TabPanel ? undefined : wins.map((win, index) => {
          return {
            key: win.key,
            label: <TabLabel overflowCount={overflowCount} index={index} widthType={widthType} title={win.title} badge={badgeMap?badgeMap[win.key]:win.badge} onReload={reloadIcon ? refreshPage: undefined}/>,
            closable: win.closeable??closeable,
          }
        })}
        tabBarExtraContent={<CloseBtn closeOthers={removeOthers} closeAll={removeAll} />}
        onContextMenu={rightMenu ? handleContextMenu : null}
      >
        {
          !!TabPanel ? wins.map((win, index) => {
            return (
              <Tabs.TabPane
                closable={win.closeable??closeable}
                key={win.key}
                tab={
                  <TabLabel
                    overflowCount={overflowCount}
                    index={index}
                    widthType={widthType as any}
                    title={win.title!}
                    badge={badgeMap?badgeMap[win.key]:win.badge}
                    onReload={reloadIcon ? refreshPage : undefined}
                  />
                }
              />
            )
          }) : null
        }
      </StyledTabs>
    </Dropdown>
  );
}
