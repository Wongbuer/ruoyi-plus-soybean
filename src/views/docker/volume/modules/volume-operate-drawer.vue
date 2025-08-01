<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { fetchCreateVolume, fetchUpdateVolume } from '@/service/api/docker/volume';
import { fetchGetUserList } from '@/service/api/system/user';
import { useAuthStore } from '@/store/modules/auth';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'VolumeOperateDrawer'
});

interface Props {
  /** the type of operation */
  operateType: NaiveUI.TableOperateType;
  /** the edit row data */
  rowData?: Api.Docker.Volume | null;
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
const authStore = useAuthStore();

// 用户选择相关状态
const userOptions = ref<Array<{ label: string; value: string }>>([]);
const userLoading = ref(false);

// 判断当前用户角色和权限
const currentUser = computed(() => authStore.userInfo.user);
const isNormalUser = computed(() => {
  const roles = authStore.userInfo.roles;
  return !roles.includes('superadmin') && !roles.includes('admin') && !roles.includes('deptadmin');
});

const isSuperAdmin = computed(() => {
  const roles = authStore.userInfo.roles;
  return roles.includes('superadmin');
});

type Model = Api.Docker.VolumeOperateParams;

function createDefaultModel(): Model {
  return {
    alias: '',
    userId: '',
    volumeType: '数据集数据',
    isBuiltin: false
  };
}

const model: Model = reactive(createDefaultModel());

// 获取用户选择列表
async function loadUserOptions() {
  if (isNormalUser.value && currentUser.value) {
    // 普通用户只能选择自己
    userOptions.value = [
      {
        label: `${currentUser.value.nickName}(${currentUser.value.userName})`,
        value: currentUser.value.userId.toString()
      }
    ];
    // 自动设置为当前用户
    model.userId = currentUser.value.userId.toString();
    return;
  }

  try {
    userLoading.value = true;
    const { data } = await fetchGetUserList({ pageNum: 1, pageSize: 1000 });
    if (data?.rows) {
      userOptions.value = data.rows.map(user => ({
        label: `${user.nickName}(${user.userName})`,
        value: user.userId.toString()
      }));
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to load users:', error);
  } finally {
    userLoading.value = false;
  }
}

const title = computed(() => {
  const titles: Record<NaiveUI.TableOperateType, string> = {
    add: '新增数据卷',
    edit: '编辑数据卷'
  };
  return titles[props.operateType];
});

const rules = computed(() => {
  const baseRules: Record<string, App.Global.FormRule> = {
    alias: createRequiredRule('数据卷别称不能为空'),
    userId: createRequiredRule('用户不能为空'),
    volumeType: createRequiredRule('卷类型不能为空')
  };

  // 只有超级管理员才需要验证 isBuiltin 字段
  if (isSuperAdmin.value) {
    baseRules.isBuiltin = createRequiredRule('是否内置不能为空');
  }

  return baseRules;
});

// Volume type options
const volumeTypeOptions = [
  { label: '个人数据', value: '个人数据' },
  { label: '数据集数据', value: '数据集数据' },
  { label: 'UV缓存', value: 'UV缓存' }
];

// Is builtin options
const isBuiltinOptions = [
  { label: '是', value: true },
  { label: '否', value: false }
];

function handleUpdateModelWhenEdit() {
  if (props.operateType === 'add') {
    Object.assign(model, createDefaultModel());
    return;
  }

  if (props.operateType === 'edit' && props.rowData) {
    Object.assign(model, {
      alias: props.rowData.labels.alias,
      userId: props.rowData.labels.userId,
      volumeType: props.rowData.labels.volumeTypeEnum,
      isBuiltin: props.rowData.labels.isBuiltIn
    });
  }
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();

  // request
  if (props.operateType === 'add') {
    const { alias, userId, volumeType, isBuiltin } = model;
    const { error } = await fetchCreateVolume({ alias, userId, volumeType, isBuiltin });
    if (error) return;
  }

  if (props.operateType === 'edit') {
    const { alias, userId, volumeType, isBuiltin } = model;
    const { error } = await fetchUpdateVolume({ alias, userId, volumeType, isBuiltin });
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
    loadUserOptions();
  }
});
</script>

<template>
  <NDrawer v-model:show="visible" :title="title" display-directive="show" :width="800" class="max-w-90%">
    <NDrawerContent :title="title" :native-scrollbar="false" closable>
      <NForm ref="formRef" :model="model" :rules="rules">
        <NFormItem label="数据卷别称" path="alias">
          <NInput v-model:value="model.alias" placeholder="请输入数据卷别称" />
        </NFormItem>
        <NFormItem label="用户" path="userId">
          <NSelect
            v-model:value="model.userId"
            :options="userOptions"
            :loading="userLoading"
            :disabled="isNormalUser"
            placeholder="请选择用户"
            filterable
          />
        </NFormItem>
        <NFormItem label="卷类型" path="volumeType">
          <NSelect v-model:value="model.volumeType" :options="volumeTypeOptions" placeholder="请选择卷类型" />
        </NFormItem>
        <NFormItem v-if="isSuperAdmin" label="是否内置" path="isBuiltin">
          <NRadioGroup v-model:value="model.isBuiltin">
            <NRadio v-for="item in isBuiltinOptions" :key="String(item.value)" :value="item.value">
              {{ item.label }}
            </NRadio>
          </NRadioGroup>
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
