<script setup lang="tsx">
import { useBoolean } from '@sa/hooks';
import { fetchBatchDeleteVolume, fetchGetVolumeList } from '@/service/api/docker/volume';
import { useAppStore } from '@/store/modules/app';
import { useAuth } from '@/hooks/business/auth';
import { useDownload } from '@/hooks/business/download';
import { useTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import ButtonIcon from '@/components/custom/button-icon.vue';
import VolumeSearch from './modules/volume-search.vue';

defineOptions({
  name: 'VolumeList'
});

const appStore = useAppStore();
const { download } = useDownload();
const { hasAuth } = useAuth();

const { bool: isRefreshing, setTrue: startRefreshing, setFalse: endRefreshing } = useBoolean(false);

async function getVolumeTableData(p: Api.Docker.VolumeSearchParams) {
  startRefreshing();
  const { data: fetchedData, error } = await fetchGetVolumeList();
  endRefreshing();

  if (error) {
    return Promise.resolve({ data: { rows: [], total: 0 } });
  }

  let filteredData = fetchedData || [];
  if (p.name) {
    filteredData = filteredData.filter(v => v.name.includes(p.name!));
  }
  if (p.username) {
    filteredData = filteredData.filter(v => v.labels.username.includes(p.username!));
  }

  const { pageNum = 1, pageSize = 10 } = p;
  const start = (pageNum - 1) * pageSize;
  const end = start + pageSize;
  const paginatedData = filteredData.slice(start, end);

  return Promise.resolve({
    data: {
      rows: paginatedData,
      total: filteredData.length
    }
  });
}

const {
  columns,
  columnChecks,
  data,
  getData,
  getDataByPage,
  loading,
  mobilePagination,
  searchParams,
  resetSearchParams
} = useTable({
  apiFn: getVolumeTableData,
  apiParams: {
    pageNum: 1,
    pageSize: 10,
    name: null,
    username: null,
    params: {}
  },
  columns: () => [
    {
      type: 'selection',
      align: 'center',
      width: 48
    },
    {
      key: 'index',
      title: $t('common.index'),
      align: 'center',
      width: 64
    },
    {
      key: 'name',
      title: '数据卷名称',
      align: 'center',
      minWidth: 120
    },
    {
      key: 'username',
      title: '所属用户',
      align: 'center',
      minWidth: 120,
      render: row => row.labels.username
    },
    {
      key: 'driver',
      title: '驱动类型',
      align: 'center',
      minWidth: 120
    },
    {
      key: 'volumeType',
      title: '数据卷类型',
      align: 'center',
      minWidth: 120,
      render: row => row.labels.volumeTypeEnum
    },
    {
      key: 'createTime',
      title: '创建时间',
      align: 'center',
      minWidth: 120
    },
    {
      key: 'operate',
      title: $t('common.operate'),
      align: 'center',
      width: 130,
      render: row => {
        const deleteBtn = () => {
          if (!hasAuth('docker:volume:remove')) {
            return null;
          }
          return (
            <ButtonIcon
              text
              type="error"
              icon="material-symbols:delete-outline"
              tooltipContent={$t('common.delete')}
              popconfirmContent={$t('common.confirmDelete')}
              onPositiveClick={() => handleDelete(row.name)}
            />
          );
        };

        return <div class="flex-center gap-8px">{deleteBtn()}</div>;
      }
    }
  ]
});

const { checkedRowKeys, onBatchDeleted, onDeleted } = useTableOperate(data, getData);

async function handleBatchDelete() {
  // request
  const { error } = await fetchBatchDeleteVolume(checkedRowKeys.value);
  if (error) return;
  onBatchDeleted();
}

async function handleDelete(name: string) {
  // request
  const { error } = await fetchBatchDeleteVolume([name]);
  if (error) return;
  onDeleted();
}

function handleExport() {
  download('/docker/volume/export', searchParams, `用户数据卷信息_${new Date().getTime()}.xlsx`);
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <VolumeSearch v-model:model="searchParams" @reset="resetSearchParams" @search="getDataByPage" />
    <NCard title="用户数据卷信息列表" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :disabled-delete="checkedRowKeys.length === 0"
          :loading="loading || isRefreshing"
          :show-add="false"
          :show-delete="hasAuth('docker:volume:remove')"
          :show-export="hasAuth('docker:volume:export')"
          @delete="handleBatchDelete"
          @export="handleExport"
          @refresh="getData"
        />
      </template>
      <NDataTable
        v-model:checked-row-keys="checkedRowKeys"
        :columns="columns"
        :data="data"
        size="small"
        :flex-height="!appStore.isMobile"
        :scroll-x="962"
        :loading="loading"
        remote
        :row-key="row => row.name"
        :pagination="mobilePagination"
        class="sm:h-full"
      />
    </NCard>
  </div>
</template>

<style scoped></style>
