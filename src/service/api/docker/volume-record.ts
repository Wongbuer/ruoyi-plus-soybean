import { request } from '@/service/request';

/** 获取软删除数据卷记录列表 */
export function fetchGetVolumeRecordList(params?: Api.Docker.VolumeRecordSearchParams) {
  return request<Api.Docker.VolumeRecordList>({
    url: '/docker/volumeRecord/list',
    method: 'get',
    params
  });
}

/** 新增软删除数据卷记录 */
export function fetchCreateVolumeRecord(data: Api.Docker.VolumeRecordOperateParams) {
  return request<boolean>({
    url: '/docker/volumeRecord',
    method: 'post',
    data
  });
}

/** 修改软删除数据卷记录 */
export function fetchUpdateVolumeRecord(data: Api.Docker.VolumeRecordOperateParams) {
  return request<boolean>({
    url: '/docker/volumeRecord',
    method: 'put',
    data
  });
}

/** 批量删除软删除数据卷记录 */
export function fetchBatchDeleteVolumeRecord(ids: CommonType.IdType[]) {
  return request<boolean>({
    url: `/docker/volumeRecord/${ids.join(',')}`,
    method: 'delete'
  });
}
