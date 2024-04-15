/*
 * @author: yanxianliang
 * @date: 2024-04-15 14:28
 * @desc: 分页hooks
 * 从ahooks usePagination 定制 & 扩展
 * Copyright (c) 2024 by yanxianliang, All Rights Reserved.
 */
import {default as _usePagination} from 'ahooks/es/usePagination';
import type {Data} from "ahooks/es/usePagination/types";
import {TablePaginationConfig} from "antd";
import type {Options} from "ahooks/es/useRequest/src/types";
import type {FilterValue, SorterResult, TableCurrentDataSource} from 'antd/es/table/interface';


export type Params = Array<{
  current: number;
  pageSize: number;
  order?: string;
  orderBy?: string;
  [key: string]: any;
}>

export type Service<TData extends Data, TParams extends Params> = (...args: TParams) => Promise<TData>;

export interface PaginationOptions<TData extends Data, TParams extends Params> extends Options<TData, TParams> {
  defaultPageSize?: number;
  defaultCurrent?: number;
}


export type PageOptions<TData extends Data, TParams extends Params> = PaginationOptions<TData, TParams> & {
  sortOrders?: [string, string];// 排序字段解析
}

function usePagination<TData extends Data, TParams extends Params>(service: Service<TData, TParams>, options?: PageOptions<TData, TParams>) {
  const defaultCurrent = options?.defaultCurrent ??1;
  const defaultPageSize = options?.defaultPageSize;

  const {run, params,pagination, ...extras} = _usePagination<TData, any>(
    ({ current = defaultCurrent, pageSize = defaultPageSize, order, ...extra }) => {
      const [ascOrder = 'ascend', descOrder = 'descend'] = options?.sortOrders || ['ascend', 'descend'];
      return service(...[{
        order:
          order === 'descend'
            ? descOrder
            : order === 'ascend'
              ? ascOrder
              : undefined,
        current,
        pageSize,
        ...extra,
      }] as TParams);
    },
    {
      ...options,
      defaultCurrent,
      defaultPageSize,
    }
  );
  const onChange = (pagination: TablePaginationConfig, filters?: Record<string, FilterValue | null>, sorter?: SorterResult<TData['list'][number]> | SorterResult<TData['list'][number]>[], extra?: TableCurrentDataSource<TData['list'][number]>) => {
    const {columnKey, order} =
    (sorter as { columnKey: string; order: 'ascend' | 'descend' }) ||
    {};
    run({
      ...params[0],
      current: pagination.current!,
      pageSize: pagination.pageSize!,
      orderBy: order ? columnKey : undefined,
      order: order,
    });
  }
  return {
    run,
    params,
    pagination: pagination,
    onChange,
    ...extras
  };
}

export default usePagination;
