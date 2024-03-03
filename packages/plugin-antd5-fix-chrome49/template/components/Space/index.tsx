/*
 * @author: yanxianliang
 * @date: 2024-03-01 09:06
 * @desc: Space 需要兼容Chrome 49
 *
 * Copyright (c) 2024 by yanxianliang, All Rights Reserved.
 */
import { Space as AntSpace, SpaceProps, ConfigProvider, GlobalToken } from 'antd';
import styled from 'styled-components';
import { useContext, useMemo } from 'react';
import { isValidGapNumber } from 'antd/es/_util/gapSize';
import useToken from 'antd/es/theme/useToken';

const StyledSpace = styled.div`
  display: inline-flex;
`;

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
  const {
    space,
  } = useContext(ConfigProvider.ConfigContext);
  const token = useToken()[3];

  const { size = (space === null || space === void 0 ? void 0 : space.size) || 'small' } = props;
  const customStyle = props.style;
  const [horizontalSize, verticalSize] = Array.isArray(size) ? size : [size, size];

  // 从token 中获取不同尺寸。
  const horizontalSpace = getPresetSize(horizontalSize, token);
  const verticalSpace = getPresetSize(verticalSize, token);

  const style = useMemo(() => {
    return Object.assign({...customStyle}, horizontalSpace ? {
      marginLeft: -horizontalSpace,
    } : {}, verticalSpace ? {
      marginTop: -verticalSpace,
    } : {});
  }, [horizontalSpace, verticalSpace]);

  const itemStyle = useMemo(() => {
    return Object.assign({}, horizontalSpace ? {
      marginLeft: horizontalSpace,
    } : {}, verticalSpace ? {
      marginTop: verticalSpace,
    } : {});
  }, [horizontalSpace, verticalSpace]);

  return (
    <StyledSpace>
      <AntSpace
        size={0}
        {...props}
        style={style}
        styles={{ item: itemStyle }}
      />
    </StyledSpace>
  );
};

export default Space;
