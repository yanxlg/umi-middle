import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useState,
} from "react";

// 可能存在Tab 下面包括多个页面（隐藏Tab）的情况。二级激活。

// 监听路由变化，生成Tab列表，不通过页面关系。

type ITab = {
  pattern: string; // 路由规则
  pathname: string; // 路由
};

interface TabContextProps {
  tabs: ITab[];
  setTabs: React.Dispatch<React.SetStateAction<ITab[]>>;
  addTab: (tab: ITab) => void;
  removeTab: (tab: ITab) => void;
}

const TabContext = createContext<TabContextProps>(null as unknown as any);

const TabWrapper: React.FC<PropsWithChildren<unknown>> = ({ children }) => {
  const [tabs, setTabs] = useState<ITab[]>([]);

  const addTab = useCallback((tab: ITab) => {
    setTabs((tabs) => [...tabs, tab]);
  }, []);

  const removeTab = useCallback((tab: ITab) => {
    // tab下面的缓存对象是不是全部删除
    // 删除Tab
  }, []);

  return (
    <TabContext.Provider value={{ tabs, setTabs, addTab, removeTab }}>
      {children}
    </TabContext.Provider>
  );
};

const useTabs = () => {
  return useContext(TabContext).tabs;
};

// 返回所有操作
const useTabController = () => {
  return useContext(TabContext);
};

export { TabContext, TabWrapper, useTabs, useTabController };
