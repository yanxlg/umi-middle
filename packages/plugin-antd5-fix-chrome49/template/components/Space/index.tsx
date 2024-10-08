/*
 * @author: yanxianliang
 * @date: 2024-03-01 09:06
 * @desc: Space 需要兼容Chrome 49
 *
 * Copyright (c) 2024 by yanxianliang, All Rights Reserved.
 */
import { Space as AntSpace, SpaceProps, ConfigProvider, GlobalToken } from 'antd';
import { useContext, useMemo } from 'react';
import { isValidGapNumber } from 'antd/es/_util/gapSize';
import useToken from 'antd/es/theme/useToken';
import { createStyles, cx } from 'antd-style';
import React from 'react';

const useStyles = createStyles(({ css },{direction}:{direction?: SpaceProps['direction']}) => {
  return {
    container: css`
      display: ${direction === 'vertical'? 'flex': 'inline-flex'};
    `,
  };
});

function getPresetSize(size: string | number | undefined, token: GlobalToken) {
  switch (size) {
    case 'small':
      return token.paddingXS;
    case 'middle':
      return token.padding;
    case 'large':
      return token.paddingLG;
    default:
      return isValidGapNumber(size) ? size : 0;
  }
}

export const Space = (props: SpaceProps) => {
  const direction = props.direction;
  const {
    space,
  } = useContext(ConfigProvider.ConfigContext);
  const token = useToken()[3];

  const {styles} = useStyles({
    direction: direction,
  });

  const { size = (space === null || space === void 0 ? void 0 : space.size) || 'small' } = props;
  const customStyle = props.style;
  const [horizontalSize, verticalSize] = Array.isArray(size) ? size : [size, size];

  // 从token 中获取不同尺寸。
  const horizontalSpace = getPresetSize(horizontalSize, token);
  const verticalSpace = getPresetSize(verticalSize, token);

  const style = useMemo(() => {
    return Object.assign({...customStyle}, horizontalSpace && direction!=='vertical' ? {
      marginLeft: -horizontalSpace,
    } : {}, verticalSpace ? {
      marginTop: -verticalSpace,
    } : {});
  }, [horizontalSpace, verticalSpace, direction]);

  const itemStyle = useMemo(() => {
    return Object.assign({}, horizontalSpace && direction!=='vertical' ? {
      marginLeft: horizontalSpace,
    } : {}, verticalSpace ? {
      marginTop: verticalSpace,
    } : {});
  }, [horizontalSpace, verticalSpace, direction]);

  return (
    <div className={styles.container}>
      <AntSpace
        {...props}
        size={0}
        style={style}
        styles={{ item: itemStyle }}
      />
    </div>
  );
};

export default Space;
