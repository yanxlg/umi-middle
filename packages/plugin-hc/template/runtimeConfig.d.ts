type LayoutType = {
  siderMinWidth?: number;
  siderMaxWidth?: number;
  contentPadding?: number;
  headerHeight?: number;
  layoutWrapper?: any;// Wrapper 组件，children 为Layout组件，可以向Layout传递props.
};

export interface IRuntimeConfig {
  hcLayout?: () => LayoutType;
}
