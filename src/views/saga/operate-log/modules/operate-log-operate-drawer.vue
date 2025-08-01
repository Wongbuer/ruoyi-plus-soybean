<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { fetchCreateOperateLog, fetchUpdateOperateLog } from '@/service/api/saga/operateLog';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'OperateLogOperateDrawer'
});

interface Props {
  /** the type of operation */
  operateType: NaiveUI.TableOperateType;
  /** the edit row data */
  rowData?: Api.Saga.OperateLog | null;
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
    add: '新增Saga 操作日志',
    edit: '编辑Saga 操作日志'
  };
  return titles[props.operateType];
});

type Model = Api.Saga.OperateLogOperateParams;

const model: Model = reactive(createDefaultModel());

function createDefaultModel(): Model {
  return {
    sagaName: '',
    sagaStatus: '',
    currentStepName: '',
    sagaContextJson: '',
    errorDetails: ''
  };
}

type RuleKey = Extract<keyof Model, 'sagaOperateId' | 'sagaName' | 'sagaStatus' | 'currentStepName'>;

const rules: Record<RuleKey, App.Global.FormRule> = {
  sagaOperateId: createRequiredRule('saga操作ID不能为空'),
  sagaName: createRequiredRule('saga名称不能为空'),
  sagaStatus: createRequiredRule('saga状态不能为空'),
  currentStepName: createRequiredRule('当前步骤名称不能为空')
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
    const { sagaName, sagaStatus, currentStepName, sagaContextJson, errorDetails } = model;
    const { error } = await fetchCreateOperateLog({
      sagaName,
      sagaStatus,
      currentStepName,
      sagaContextJson,
      errorDetails
    });
    if (error) return;
  }

  if (props.operateType === 'edit') {
    const { sagaOperateId, sagaName, sagaStatus, currentStepName, sagaContextJson, errorDetails } = model;
    const { error } = await fetchUpdateOperateLog({
      sagaOperateId,
      sagaName,
      sagaStatus,
      currentStepName,
      sagaContextJson,
      errorDetails
    });
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
        <NFormItem label="saga名称" path="sagaName">
          <NInput v-model:value="model.sagaName" placeholder="请输入saga名称" />
        </NFormItem>
        <NFormItem label="saga状态" path="sagaStatus">
          <NInput v-model:value="model.sagaStatus" placeholder="请输入saga状态" />
        </NFormItem>
        <NFormItem label="当前步骤名称" path="currentStepName">
          <NInput v-model:value="model.currentStepName" placeholder="请输入当前步骤名称" />
        </NFormItem>
        <NFormItem label="saga上下文json" path="sagaContextJson">
          <NInput v-model:value="model.sagaContextJson" placeholder="请输入saga上下文json" />
        </NFormItem>
        <NFormItem label="错误详情" path="errorDetails">
          <NInput v-model:value="model.errorDetails" :rows="3" type="textarea" placeholder="请输入错误详情" />
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
