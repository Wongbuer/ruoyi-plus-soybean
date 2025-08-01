<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { NCard, NDescriptions, NDescriptionsItem, NDrawer, NDrawerContent, NTag } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { fetchGetVolumeDetail } from '@/service/api/docker/volume';

defineOptions({
  name: 'VolumeDetailDrawer'
});

interface Props {
  volumeName: string | null;
  visible: boolean;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'update:visible', visible: boolean): void;
}

const emit = defineEmits<Emits>();

const { t } = useI18n();

const to = ref('#app');

const volumeDetail = ref<Api.Docker.Volume | null>(null);
const loading = ref(false);

// 根据标签键名和值获取标签颜色
function getTagColor(
  key: string,
  value: string | boolean
): 'primary' | 'info' | 'success' | 'warning' | 'error' | 'default' {
  // 用户相关信息 - 蓝色
  if (key === 'userId' || key === 'username') {
    return 'primary';
  }

  // 数据卷类型 - 信息色
  if (key === 'volumeTypeEnum') {
    return 'info';
  }

  // 路径相关信息 - 灰色
  if (key === 'zfsDataset' || key === 'device') {
    return 'default';
  }

  // 布尔状态 - 绿色(false)/红色(true)
  if (key === 'isBuiltIn') {
    return value === 'true' || value === true ? 'error' : 'success';
  }

  // 配置选项 - 橙色
  if (key === 'o' || key === 'type') {
    return 'warning';
  }

  // 数值信息 - 青色
  if (key === 'quota' || key === 'priority') {
    return 'info';
  }

  // 默认颜色
  return 'info';
}

const showDrawer = computed({
  get() {
    return props.visible;
  },
  set(visible: boolean) {
    emit('update:visible', visible);
  }
});

watch(
  () => props.volumeName,
  newValue => {
    if (newValue) {
      loading.value = true;
      fetchGetVolumeDetail(newValue)
        .then(({ data }) => {
          volumeDetail.value = data;
        })
        .finally(() => {
          loading.value = false;
        });
    } else {
      volumeDetail.value = null;
    }
  }
);
</script>

<template>
  <NDrawer v-model:show="showDrawer" :width="600" :to="to">
    <NDrawerContent :title="t('page.docker.volume.detailTitle')" closable>
      <NCard :loading="loading" :bordered="false" :content-style="{ padding: 0 }">
        <div v-if="volumeDetail" class="flex flex-col gap-4">
          <NDescriptions label-placement="left" :column="2" bordered size="small" label-style="width: 100px">
            <NDescriptionsItem :label="t('page.docker.volume.name')" :span="2">
              {{ volumeDetail.name }}
            </NDescriptionsItem>
            <NDescriptionsItem :label="t('page.docker.volume.driver')">
              <NTag type="warning">{{ volumeDetail.driver }}</NTag>
            </NDescriptionsItem>
            <NDescriptionsItem :label="t('page.docker.volume.createTime')">
              {{ volumeDetail.createTime }}
            </NDescriptionsItem>
            <NDescriptionsItem :label="t('page.docker.volume.mountpoint')" :span="2">
              {{ volumeDetail.mountpoint }}
            </NDescriptionsItem>
          </NDescriptions>
          <NCard :title="t('page.docker.volume.labels')" size="small">
            <NDescriptions
              label-placement="left"
              :column="1"
              bordered
              size="small"
              label-style="width: 160px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
              content-style="word-break: break-all;"
            >
              <NDescriptionsItem
                v-for="(value, key) in volumeDetail.labels"
                :key="key"
                :label="t(`page.docker.volume.labelsEnum.${key}`)"
                :title="t(`page.docker.volume.labelsEnum.${key}`)"
              >
                <NTag :type="getTagColor(key, value)" class="tag-break-all">{{ value }}</NTag>
              </NDescriptionsItem>
            </NDescriptions>
          </NCard>
          <NCard :title="t('page.docker.volume.options')" size="small">
            <NDescriptions
              label-placement="left"
              :column="1"
              bordered
              size="small"
              label-style="width: 160px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
              content-style="word-break: break-all;"
            >
              <NDescriptionsItem
                v-for="(value, key) in volumeDetail.options"
                :key="key"
                :label="t(`page.docker.volume.optionsEnum.${key}`)"
                :title="t(`page.docker.volume.optionsEnum.${key}`)"
              >
                <NTag :type="getTagColor(key, value)" class="tag-break-all">{{ value }}</NTag>
              </NDescriptionsItem>
            </NDescriptions>
          </NCard>
          <NCard v-if="volumeDetail.quotaRule" :title="t('page.docker.volume.quotaRule')" size="small">
            <NDescriptions
              label-placement="left"
              :column="1"
              bordered
              size="small"
              label-style="width: 160px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
              content-style="word-break: break-all;"
            >
              <NDescriptionsItem
                :label="t('page.docker.volume.quotaRuleEnum.zfsPool')"
                :title="t('page.docker.volume.quotaRuleEnum.zfsPool')"
              >
                <NTag type="default">{{ volumeDetail.quotaRule.zfsPool }}</NTag>
              </NDescriptionsItem>
              <NDescriptionsItem
                :label="t('page.docker.volume.quotaRuleEnum.volumeType')"
                :title="t('page.docker.volume.quotaRuleEnum.volumeType')"
              >
                <NTag type="info">{{ volumeDetail.quotaRule.volumeType }}</NTag>
              </NDescriptionsItem>
              <NDescriptionsItem
                :label="t('page.docker.volume.quotaRuleEnum.quota')"
                :title="t('page.docker.volume.quotaRuleEnum.quota')"
              >
                <NTag type="info">{{ volumeDetail.quotaRule.quotaSize }}{{ volumeDetail.quotaRule.quotaUnit }}</NTag>
              </NDescriptionsItem>
              <NDescriptionsItem
                :label="t('page.docker.volume.quotaRuleEnum.priority')"
                :title="t('page.docker.volume.quotaRuleEnum.priority')"
              >
                <NTag type="info">{{ volumeDetail.quotaRule.priority }}</NTag>
              </NDescriptionsItem>
            </NDescriptions>
          </NCard>
        </div>
      </NCard>
    </NDrawerContent>
  </NDrawer>
</template>

<style scoped>
.tag-break-all {
  max-width: 100%;
  word-break: break-all;
}
</style>
