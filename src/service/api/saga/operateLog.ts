import { request } from '@/service/request';

/** 获取Saga 操作日志列表 */
export function fetchGetOperateLogList(params?: Saga.OperateLogSearchParams) {
  return request<Saga.OperateLogList>({
    url: '/saga/operateLog/list',
    method: 'get',
    params
  });
}

/** 新增Saga 操作日志 */
export function fetchCreateOperateLog(data: Saga.OperateLogOperateParams) {
  return request<boolean>({
    url: '/saga/operateLog',
    method: 'post',
    data
  });
}

/** 修改Saga 操作日志 */
export function fetchUpdateOperateLog(data: Saga.OperateLogOperateParams) {
  return request<boolean>({
    url: '/saga/operateLog',
    method: 'put',
    data
  });
}

/** 批量删除Saga 操作日志 */
export function fetchBatchDeleteOperateLog(sagaOperateIds: CommonType.IdType[]) {
  return request<boolean>({
    url: `/saga/operateLog/${sagaOperateIds.join(',')}`,
    method: 'delete'
  });
}
