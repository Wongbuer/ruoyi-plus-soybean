import { request } from '@/service/request';

/** 获取用户数据卷信息列表 */
export function fetchGetVolumeList(params?: Api.Docker.VolumeSearchParams) {
  return request<Api.Docker.VolumeList>({
    url: '/docker/volume/list',
    method: 'get',
    params
  });
}
/** 获取用户数据卷详细信息 */
export function fetchGetVolumeDetail(volumeName: string) {
  return request<Api.Docker.Volume>({
    url: `/docker/volume/${volumeName}`,
    method: 'get'
  });
}

/** 新增用户数据卷信息 */
export function fetchCreateVolume(data: Api.Docker.VolumeOperateParams) {
  return request<boolean>({
    url: '/docker/volume',
    method: 'post',
    data
  });
}

/** 修改用户数据卷信息 */
export function fetchUpdateVolume(data: Api.Docker.VolumeOperateParams) {
  return request<boolean>({
    url: '/docker/volume',
    method: 'put',
    data
  });
}

/** 批量删除用户数据卷信息 */
export function fetchBatchDeleteVolume(ids: CommonType.IdType[]) {
  return request<boolean>({
    url: `/docker/volume/${ids.join(',')}`,
    method: 'delete'
  });
}
