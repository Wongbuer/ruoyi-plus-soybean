<script setup lang="tsx">
import { NDivider } from 'naive-ui';
import { fetchBatchDeleteOperateLog, fetchGetOperateLogList } from '@/service/api/saga/operateLog';
import { useAppStore } from '@/store/modules/app';
import { useAuth } from '@/hooks/business/auth';
import { useDownload } from '@/hooks/business/download';
import { useTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import ButtonIcon from '@/components/custom/button-icon.vue';
import OperateLogOperateDrawer from './modules/operate-log-operate-drawer.vue';
import OperateLogSearch from './modules/operate-log-search.vue';

defineOptions({
  name: 'OperateLogList'
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
  apiFn: fetchGetOperateLogList,
  apiParams: {
    pageNum: 1,
    pageSize: 10,
    // if you want to use the searchParams in Form, you need to define the following properties, and the value is null
    // the value can not be undefined, otherwise the property in Form will not be reactive
    sagaName: null,
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
      key: 'sagaOperateId',
      title: 'saga操作ID',
      align: 'center',
      minWidth: 120
    },
    {
      key: 'sagaName',
      title: 'saga名称',
      align: 'center',
      minWidth: 120
    },
    {
      key: 'sagaStatus',
      title: 'saga状态',
      align: 'center',
      minWidth: 120
    },
    {
      key: 'currentStepName',
      title: '当前步骤名称',
      align: 'center',
      minWidth: 120
    },
    {
      key: 'sagaContextJson',
      title: 'saga上下文json',
      align: 'center',
      minWidth: 120
    },
    {
      key: 'errorDetails',
      title: '错误详情',
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
          if (!hasAuth('saga:operateLog:edit') || !hasAuth('saga:operateLog:remove')) {
            return null;
          }
          return <NDivider vertical />;
        };

        const editBtn = () => {
          if (!hasAuth('saga:operateLog:edit')) {
            return null;
          }
          return (
            <ButtonIcon
              text
              type="primary"
              icon="material-symbols:drive-file-rename-outline-outline"
              tooltipContent={$t('common.edit')}
              onClick={() => edit(row.sagaOperateId!)}
            />
          );
        };

        const deleteBtn = () => {
          if (!hasAuth('saga:operateLog:remove')) {
            return null;
          }
          return (
            <ButtonIcon
              text
              type="error"
              icon="material-symbols:delete-outline"
              tooltipContent={$t('common.delete')}
              popconfirmContent={$t('common.confirmDelete')}
              onPositiveClick={() => handleDelete(row.sagaOperateId!)}
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
  const { error } = await fetchBatchDeleteOperateLog(checkedRowKeys.value);
  if (error) return;
  onBatchDeleted();
}

async function handleDelete(sagaOperateId: CommonType.IdType) {
  // request
  const { error } = await fetchBatchDeleteOperateLog([sagaOperateId]);
  if (error) return;
  onDeleted();
}

function edit(sagaOperateId: CommonType.IdType) {
  handleEdit('sagaOperateId', sagaOperateId);
}

function handleExport() {
  download('/saga/operateLog/export', searchParams, `Saga 操作日志_${new Date().getTime()}.xlsx`);
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <OperateLogSearch v-model:model="searchParams" @reset="resetSearchParams" @search="getDataByPage" />
    <NCard title="Saga 操作日志列表" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :disabled-delete="checkedRowKeys.length === 0"
          :loading="loading"
          :show-add="hasAuth('saga:operateLog:add')"
          :show-delete="hasAuth('saga:operateLog:remove')"
          :show-export="hasAuth('saga:operateLog:export')"
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
        :row-key="row => row.sagaOperateId"
        :pagination="mobilePagination"
        class="sm:h-full"
      />
      <OperateLogOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        @submitted="getDataByPage"
      />
    </NCard>
  </div>
</template>

<style scoped></style>
