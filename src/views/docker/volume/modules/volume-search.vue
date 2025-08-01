<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { fetchGetUserList } from '@/service/api/system/user';
import { useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'VolumeSearch'
});

interface Emits {
  (e: 'reset'): void;
  (e: 'search'): void;
}

const emit = defineEmits<Emits>();

const { formRef, validate, restoreValidation } = useNaiveForm();

const model = defineModel<Api.Docker.VolumeSearchParams>('model', { required: true });

// 用户选择相关状态
const userOptions = ref<Array<{ label: string; value: string }>>([]);
const userLoading = ref(false);

// 获取用户选择列表
async function loadUserOptions() {
  try {
    userLoading.value = true;
    const { data } = await fetchGetUserList({ pageNum: 1, pageSize: 1000 });
    if (data?.rows) {
      userOptions.value = data.rows.map(user => ({
        label: `${user.nickName}(${user.userName})`,
        value: user.userName
      }));
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to load users:', error);
  } finally {
    userLoading.value = false;
  }
}

async function reset() {
  Object.assign(model.value.params!, {});
  await restoreValidation();
  emit('reset');
}

async function search() {
  await validate();
  emit('search');
}

onMounted(() => {
  loadUserOptions();
});
</script>

<template>
  <NCard :bordered="false" size="small" class="card-wrapper">
    <NCollapse>
      <NCollapseItem :title="$t('common.search')" name="user-search">
        <NForm ref="formRef" :model="model" label-placement="left" :label-width="70">
          <NGrid responsive="screen" item-responsive>
            <NFormItemGi span="24 s:12 m:8" label="卷别称" path="alias" class="pr-24px">
              <NInput v-model:value="model.alias" placeholder="请输入数据卷别称" />
            </NFormItemGi>
            <NFormItemGi span="24 s:12 m:8" label="卷名称" path="name" class="pr-24px">
              <NInput v-model:value="model.name" placeholder="请输入数据卷名称" />
            </NFormItemGi>
            <NFormItemGi span="24 s:12 m:8" label="所属用户" path="username" class="pr-24px">
              <NSelect
                v-model:value="model.username"
                :options="userOptions"
                :loading="userLoading"
                placeholder="请选择所属用户"
                filterable
                clearable
              />
            </NFormItemGi>
            <NFormItemGi span="24" class="pr-24px">
              <NSpace class="w-full" justify="end">
                <NButton @click="reset">
                  <template #icon>
                    <icon-ic-round-refresh class="text-icon" />
                  </template>
                  {{ $t('common.reset') }}
                </NButton>
                <NButton type="primary" ghost @click="search">
                  <template #icon>
                    <icon-ic-round-search class="text-icon" />
                  </template>
                  {{ $t('common.search') }}
                </NButton>
              </NSpace>
            </NFormItemGi>
          </NGrid>
        </NForm>
      </NCollapseItem>
    </NCollapse>
  </NCard>
</template>

<style scoped></style>
