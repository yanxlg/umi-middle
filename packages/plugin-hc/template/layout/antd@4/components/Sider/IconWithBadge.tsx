/*
 * @author: yanxianliang
 * @date: 2024-01-14 08:27
 * @desc: $Desc$
 *
 * Copyright (c) 2024 by yanxianliang, All Rights Reserved.
 */
import {Badge} from "antd";
import React from "react";

const IconWithBadge = ({className, iconNode, count}: {
  className?: string;
  iconNode?: React.ReactNode;
  count?: number
}) => {
  return (
    <>
      <Badge
        overflowCount={9999}
        count={count}
        offset={[0, -10]}
        style={{
          pointerEvents: 'none',
          background: 'rgba(255,77,79,0.9)',
          insetInlineEnd: 'unset',
          transform: 'translate(-50%, -50%)',
          left: 8
        }}
      >
        <i/>
      </Badge>
      {iconNode ? React.cloneElement(iconNode as unknown as React.ReactElement, {className}) : null}
    </>
  )
}

export {IconWithBadge};
