<script setup lang="tsx">
import { NDivider, NEllipsis } from 'naive-ui';
import { fetchBatchDeleteVolumeRecord, fetchGetVolumeRecordList } from '@/service/api/docker/volume-record';
import { useAppStore } from '@/store/modules/app';
import { useAuth } from '@/hooks/business/auth';
import { useDownload } from '@/hooks/business/download';
import { useTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import ButtonIcon from '@/components/custom/button-icon.vue';
import VolumeRecordOperateDrawer from './modules/volume-record-operate-drawer.vue';
import VolumeRecordSearch from './modules/volume-record-search.vue';

defineOptions({
  name: 'VolumeRecordList'
});

const appStore = useAppStore();
const { download } = useDownload();
const { hasAuth } = useAuth();

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
  apiFn: fetchGetVolumeRecordList,
  apiParams: {
    pageNum: 1,
    pageSize: 10,
    // if you want to use the searchParams in Form, you need to define the following properties, and the value is null
    // the value can not be undefined, otherwise the property in Form will not be reactive
    volumeName: null,
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
      key: 'id',
      title: $t('page.docker.volumeRecord.id'),
      align: 'center',
      minWidth: 120
    },
    {
      key: 'volumeName',
      title: $t('page.docker.volumeRecord.volumeName'),
      align: 'center',
      minWidth: 120,
      render: row => (
        <NEllipsis tooltip={{ placement: 'bottom' }} style={{ maxWidth: '120px' }}>
          {row.volumeName}
        </NEllipsis>
      )
    },
    {
      key: 'zfsDataset',
      title: $t('page.docker.volumeRecord.zfsDataset'),
      align: 'center',
      minWidth: 120,
      render: row => (
        <NEllipsis tooltip={{ placement: 'bottom' }} style={{ maxWidth: '120px' }}>
          {row.zfsDataset}
        </NEllipsis>
      )
    },
    {
      key: 'driver',
      title: $t('page.docker.volumeRecord.driver'),
      align: 'center',
      minWidth: 120
    },
    {
      key: 'labels',
      title: $t('page.docker.volumeRecord.labels'),
      align: 'center',
      minWidth: 120,
      render: row => (
        <NEllipsis
          tooltip={{
            placement: 'bottom',
            width: 400
          }}
          style={{ maxWidth: '120px' }}
        >
          {row.labels}
        </NEllipsis>
      )
    },
    {
      key: 'options',
      title: $t('page.docker.volumeRecord.options'),
      align: 'center',
      minWidth: 120,
      render: row => (
        <NEllipsis
          tooltip={{
            placement: 'bottom',
            width: 400
          }}
          style={{ maxWidth: '120px' }}
        >
          {row.options}
        </NEllipsis>
      )
    },
    {
      key: 'remark',
      title: $t('page.common.remark'),
      align: 'center',
      minWidth: 120
    },
    {
      key: 'operate',
      title: $t('common.operate'),
      align: 'center',
      width: 130,
      render: row => {
        const divider = () => {
          if (!hasAuth('docker:volumeRecord:edit') || !hasAuth('docker:volumeRecord:remove')) {
            return null;
          }
          return <NDivider vertical />;
        };

        const editBtn = () => {
          if (!hasAuth('docker:volumeRecord:edit')) {
            return null;
          }
          return (
            <ButtonIcon
              text
              type="primary"
              icon="material-symbols:drive-file-rename-outline-outline"
              tooltipContent={$t('common.edit')}
              onClick={() => edit(row.id!)}
            />
          );
        };

        const deleteBtn = () => {
          if (!hasAuth('docker:volumeRecord:remove')) {
            return null;
          }
          return (
            <ButtonIcon
              text
              type="error"
              icon="material-symbols:delete-outline"
              tooltipContent={$t('common.delete')}
              popconfirmContent={$t('common.confirmDelete')}
              onPositiveClick={() => handleDelete(row.id!)}
            />
          );
        };

        return (
          <div class="flex-center gap-8px">
            {editBtn()}
            {divider()}
            {deleteBtn()}
          </div>
        );
      }
    }
  ]
});

const { drawerVisible, operateType, editingData, handleAdd, handleEdit, checkedRowKeys, onBatchDeleted, onDeleted } =
  useTableOperate(data, getData);

async function handleBatchDelete() {
  // request
  const { error } = await fetchBatchDeleteVolumeRecord(checkedRowKeys.value);
  if (error) return;
  onBatchDeleted();
}

async function handleDelete(id: CommonType.IdType) {
  // request
  const { error } = await fetchBatchDeleteVolumeRecord([id]);
  if (error) return;
  onDeleted();
}

function edit(id: CommonType.IdType) {
  handleEdit('id', id);
}

function handleExport() {
  download(
    '/docker/volumeRecord/export',
    searchParams,
    `${$t('page.docker.volumeRecord.title')}_${new Date().getTime()}.xlsx`
  );
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <VolumeRecordSearch v-model:model="searchParams" @reset="resetSearchParams" @search="getDataByPage" />
    <NCard
      :title="$t('page.docker.volumeRecord.title')"
      :bordered="false"
      size="small"
      class="card-wrapper sm:flex-1-hidden"
    >
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :disabled-delete="checkedRowKeys.length === 0"
          :loading="loading"
          :show-add="hasAuth('docker:volumeRecord:add')"
          :show-delete="hasAuth('docker:volumeRecord:remove')"
          :show-export="hasAuth('docker:volumeRecord:export')"
          @add="handleAdd"
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
        :row-key="row => row.id"
        :pagination="mobilePagination"
        class="sm:h-full"
      />
      <VolumeRecordOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        @submitted="getDataByPage"
      />
    </NCard>
  </div>
</template>

<style scoped></style>
