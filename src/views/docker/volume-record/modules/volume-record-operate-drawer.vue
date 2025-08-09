<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { fetchCreateVolumeRecord, fetchUpdateVolumeRecord } from '@/service/api/docker/volume-record';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'VolumeRecordOperateDrawer'
});

interface Props {
  /** the type of operation */
  operateType: NaiveUI.TableOperateType;
  /** the edit row data */
  rowData?: Api.Docker.VolumeRecord | null;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const { formRef, validate, restoreValidation } = useNaiveForm();
const { createRequiredRule } = useFormRules();

const title = computed(() => {
  const titles: Record<NaiveUI.TableOperateType, string> = {
    add: '新增软删除数据卷记录',
    edit: '编辑软删除数据卷记录'
  };
  return titles[props.operateType];
});

type Model = Api.Docker.VolumeRecordOperateParams;

const model: Model = reactive(createDefaultModel());

function createDefaultModel(): Model {
  return {
    volumeName: '',
    zfsDataset: '',
    driver: '',
    labels: '',
    options: ''
  };
}

type RuleKey = Extract<keyof Model, 'labels' | 'options'>;

const rules: Record<RuleKey, App.Global.FormRule> = {
  labels: createRequiredRule('原始标签(JSON格式)，用于恢复不能为空'),
  options: createRequiredRule('原始选项(JSON格式)，用于恢复不能为空')
};

function handleUpdateModelWhenEdit() {
  if (props.operateType === 'add') {
    Object.assign(model, createDefaultModel());
    return;
  }

  if (props.operateType === 'edit' && props.rowData) {
    Object.assign(model, props.rowData);
  }
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();

  // request
  if (props.operateType === 'add') {
    const { volumeName, zfsDataset, driver, labels, options } = model;
    const { error } = await fetchCreateVolumeRecord({ volumeName, zfsDataset, driver, labels, options });
    if (error) return;
  }

  if (props.operateType === 'edit') {
    const { id, volumeName, zfsDataset, driver, labels, options, remark } = model;
    const { error } = await fetchUpdateVolumeRecord({ id, volumeName, zfsDataset, driver, labels, options, remark });
    if (error) return;
  }

  window.$message?.success($t('common.updateSuccess'));
  closeDrawer();
  emit('submitted');
}

watch(visible, () => {
  if (visible.value) {
    handleUpdateModelWhenEdit();
    restoreValidation();
  }
});
</script>

<template>
  <NDrawer v-model:show="visible" :title="title" display-directive="show" :width="800" class="max-w-90%">
    <NDrawerContent :title="title" :native-scrollbar="false" closable>
      <NForm ref="formRef" :model="model" :rules="rules">
        <NFormItem label="原始Docker Volume名称" path="volumeName">
          <NInput v-model:value="model.volumeName" placeholder="请输入原始Docker Volume名称" />
        </NFormItem>
        <NFormItem label="关联的ZFS数据集路径" path="zfsDataset">
          <NInput v-model:value="model.zfsDataset" :rows="3" type="textarea" placeholder="请输入关联的ZFS数据集路径" />
        </NFormItem>
        <NFormItem label="Volume驱动" path="driver">
          <NInput v-model:value="model.driver" placeholder="请输入Volume驱动" />
        </NFormItem>
        <NFormItem label="原始标签(JSON格式)，用于恢复" path="labels">
          <NInput v-model:value="model.labels" placeholder="请输入原始标签(JSON格式)，用于恢复" />
        </NFormItem>
        <NFormItem label="原始选项(JSON格式)，用于恢复" path="options">
          <NInput v-model:value="model.options" placeholder="请输入原始选项(JSON格式)，用于恢复" />
        </NFormItem>
        <NFormItem label="备注" path="remark">
          <NInput v-model:value="model.remark" :rows="3" type="textarea" placeholder="请输入备注" />
        </NFormItem>
      </NForm>
      <template #footer>
        <NSpace :size="16">
          <NButton @click="closeDrawer">{{ $t('common.cancel') }}</NButton>
          <NButton type="primary" @click="handleSubmit">{{ $t('common.confirm') }}</NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>

<style scoped></style>
