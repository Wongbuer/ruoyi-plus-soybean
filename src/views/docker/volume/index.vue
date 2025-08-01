<script setup lang="tsx">
import { ref } from 'vue';
import { NEllipsis, NTag } from 'naive-ui';
import { useBoolean } from '@sa/hooks';
import { fetchBatchDeleteVolume, fetchGetVolumeList } from '@/service/api/docker/volume';
import { useAppStore } from '@/store/modules/app';
import { useAuth } from '@/hooks/business/auth';
import { useDownload } from '@/hooks/business/download';
import { useTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import ButtonIcon from '@/components/custom/button-icon.vue';
import VolumeSearch from './modules/volume-search.vue';
import VolumeDetailDrawer from './modules/volume-detail-drawer.vue';
import VolumeOperateDrawer from './modules/volume-operate-drawer.vue';

defineOptions({
  name: 'VolumeList'
});

const appStore = useAppStore();
const { download } = useDownload();
const { hasAuth } = useAuth();

const { bool: isRefreshing, setTrue: startRefreshing, setFalse: endRefreshing } = useBoolean(false);
const { bool: drawerVisible, setTrue: openDrawer } = useBoolean(false);
const { bool: operateDrawerVisible, setTrue: openOperateDrawer, setFalse: closeOperateDrawer } = useBoolean(false);
const editingData = ref<string | null>(null);
const operateType = ref<NaiveUI.TableOperateType>('add');
const editingRowData = ref<Api.Docker.Volume | null>(null);

function handleEdit(name: string) {
  editingData.value = name;
  openDrawer();
}

function handleAdd() {
  operateType.value = 'add';
  editingRowData.value = null;
  openOperateDrawer();
}

async function getVolumeTableData(p: Api.Docker.VolumeSearchParams) {
  startRefreshing();
  const { data: fetchedData, error } = await fetchGetVolumeList();
  endRefreshing();

  if (error) {
    return Promise.resolve({
      data: {
        rows: [],
        total: 0,
        pageNum: 1,
        pageSize: 10
      },
      error: null,
      response: undefined
    });
  }

  if (!fetchedData) {
    return Promise.resolve({
      data: {
        rows: [],
        total: 0,
        pageNum: 1,
        pageSize: 10
      },
      error: null,
      response: undefined
    });
  }

  let filteredData = fetchedData;
  if (p.alias) {
    filteredData = filteredData.filter(v => v.labels.alias && v.labels.alias.includes(p.alias!));
  }
  if (p.name) {
    filteredData = filteredData.filter(v => v.name.includes(p.name!));
  }
  if (p.username) {
    filteredData = filteredData.filter(v => v.labels.username.includes(p.username!));
  }

  const pageNum = p.pageNum ?? 1;
  const pageSize = p.pageSize ?? 10;
  const start = (pageNum - 1) * pageSize;
  const end = start + pageSize;
  const paginatedData = filteredData.slice(start, end);

  return Promise.resolve({
    data: {
      rows: paginatedData,
      total: filteredData.length,
      pageNum,
      pageSize
    },
    error: null,
    response: undefined
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
  // @ts-expect-error - Custom table data function type mismatch
  apiFn: getVolumeTableData,
  apiParams: {
    pageNum: 1,
    pageSize: 10,
    params: {
      alias: null,
      name: null,
      username: null
    }
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
      key: 'alias',
      title: $t('page.docker.volume.labelsEnum.alias'),
      align: 'center',
      minWidth: 120,
      render: row => row.labels.alias || '-'
    },
    {
      key: 'name',
      title: $t('page.docker.volume.name'),
      align: 'center',
      minWidth: 120,
      render: row => (
        <NEllipsis tooltip={{ placement: 'bottom' }} style={{ maxWidth: '120px' }}>
          {row.name}
        </NEllipsis>
      )
    },
    {
      key: 'username',
      title: $t('page.docker.volume.labelsEnum.username'),
      align: 'center',
      minWidth: 120,
      render: row => row.labels.username
    },
    {
      key: 'driver',
      title: $t('page.docker.volume.driver'),
      align: 'center',
      minWidth: 120
    },
    {
      key: 'volumeType',
      title: $t('page.docker.volume.labelsEnum.volumeTypeEnum'),
      align: 'center',
      minWidth: 120,
      render: row => <NTag type="primary">{row.labels.volumeTypeEnum}</NTag>
    },
    {
      key: 'mountpoint',
      title: $t('page.docker.volume.mountpoint'),
      align: 'center',
      minWidth: 120,
      render: row => (
        <NEllipsis tooltip={{ placement: 'bottom' }} style={{ maxWidth: '120px' }}>
          {row.mountpoint}
        </NEllipsis>
      )
    },
    {
      key: 'createTime',
      title: $t('page.docker.volume.createTime'),
      align: 'center',
      minWidth: 120
    },
    {
      key: 'operate',
      title: $t('common.operate'),
      align: 'center',
      width: 130,
      render: row => {
        const detailBtn = () => {
          return (
            <ButtonIcon
              text
              type="primary"
              icon="gg:details-more"
              tooltipContent="详情"
              onClick={() => handleEdit(row.name)}
            />
          );
        };

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

        return (
          <div class="flex-center gap-8px">
            {detailBtn()}
            {deleteBtn()}
          </div>
        );
      }
    }
  ]
});

const { checkedRowKeys, onBatchDeleted, onDeleted } = useTableOperate(data, getData);

function handleOperateSubmitted() {
  closeOperateDrawer();
  getData();
}

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
    <NCard :title="$t('page.docker.volume.title')" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :disabled-delete="checkedRowKeys.length === 0"
          :loading="loading || isRefreshing"
          :show-add="hasAuth('docker:volume:add')"
          :show-delete="hasAuth('docker:volume:remove')"
          :show-export="hasAuth('docker:volume:export')"
          @add="handleAdd"
          @delete="handleBatchDelete"
          @export="handleExport"
          @refresh="getData"
        />
      </template>
      <NDataTable
        v-model:checked-row-keys="checkedRowKeys"
        :columns="columns as any"
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
    <VolumeDetailDrawer v-model:visible="drawerVisible" :volume-name="editingData" />
    <VolumeOperateDrawer
      v-model:visible="operateDrawerVisible"
      :operate-type="operateType"
      :row-data="editingRowData"
      @submitted="handleOperateSubmitted"
    />
  </div>
</template>

<style scoped></style>
