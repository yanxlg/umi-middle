@layout-header-tab-height: 32px;
@layout-header-tab-right: 44px;
@layout-header-tab-padding: 8px 12px;
@layout-header-tab-scroll-padding: 0 12px;
@layout-header-tab-radius: 4px;

@layout-header-tabs-bg: #376bd3;
@layout-header-tab-bg: #00000026;
@layout-header-tab-hover-bg: #ffffff26;
@layout-header-tab-active-bg: #fff;
@layout-header-tab-color: #ffffffd9;
@layout-header-tab-active-color: #525865;
@layout-header-tab-active-remove-color: #525865;
@layout-header-tab-more-color: #ffffffd9;
@layout-header-tab-more-hover-color: #fff;

// TODO 需要生成 ant-prefix  umijs中配置的
@ant-prefix: {{{antdPrefix}}};

.window-tabs-theme-otb {
  justify-content: center;
  height: 100%;
  background: @layout-header-tabs-bg;
  &.@{ant-prefix}-tabs {
    line-height: 1;
  }
  & > .@{ant-prefix}-tabs-nav {
    height: @layout-header-tab-height;
    margin: 0;
    padding: @layout-header-tab-scroll-padding;

    &::before {
      display: none;
    }

    .@{ant-prefix}-tabs-nav-list {
      & > .@{ant-prefix}-tabs-tab {
        padding: @layout-header-tab-padding;
        background-color: @layout-header-tab-bg;
        border: none;
        border-radius: @layout-header-tab-radius;

        &:hover {
          background-color: @layout-header-tab-hover-bg;
        }

        .@{ant-prefix}-tabs-tab-remove {
          color: @layout-header-tab-color;
        }

        .@{ant-prefix}-tabs-tab-btn {
          color: @layout-header-tab-color;
        }

        &.@{ant-prefix}-tabs-tab-active {
          background-color: @layout-header-tab-active-bg;

          .@{ant-prefix}-tabs-tab-btn {
            color: @layout-header-tab-active-color;
          }

          .@{ant-prefix}-tabs-tab-remove {
            color: @layout-header-tab-active-remove-color;
          }
        }
      }
    }

    .@{ant-prefix}-tabs-nav-more {
      color: @layout-header-tab-more-color;

      &:hover {
        color: @layout-header-tab-more-hover-color;
      }
    }
  }
  .@{ant-prefix}-tabs-content-holder {
    display: none;
  }
}
