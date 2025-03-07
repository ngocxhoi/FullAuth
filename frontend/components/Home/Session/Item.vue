<template>
  <div class="w-full flex items-center">
    <div
      class="shrink-0 mr-[16px] flex items-center justify-center w-[48px] h-[48px] rounded-full border border-[#eee] dark:border-[rgb(42,45,48)]"
    >
      <Icon :name="icon" size="24px" />
    </div>
    <div class="flex-1 flex items-center justify-between">
      <div class="flex-1">
        <h5 class="text-sm font-medium leading-1">{{ os }} / {{ browser }}</h5>
        <div class="flex items-center">
          <div
            v-if="session.isCurrent"
            class="bg-green-500/80 h-[20px] px-2 w-[81px] flex items-center justify-center text-xs text-white rounded-lg"
          >
            Active now
          </div>
          <span
            v-else
            class="mr-[16px] text-[12px] text-muted-foreground font-normal"
          >
            {{ timeAgo }}
          </span>
        </div>
      </div>

      <UButton
        @click="openModal = true"
        :loading="loading"
        :disabled="loading"
        size="lg"
        color="gray"
        variant="ghost"
        :icon="loading ? 'mdi:loading' : 'mdi:logout'"
      />
    </div>
  </div>

  <ClientOnly>
    <UModal v-model="openModal">
      <UCard>
        <template #header>
          <h2 class="text-xl font-semibold text-red-500">Are you sure?</h2>
        </template>
        <p v-if="session.isCurrent">
          If you remove this session, you will be logged out.
        </p>
        <p v-else>
          If you remove this session, the device with this session will be
          logged out.
        </p>
        <template #footer>
          <div class="flex items-center justify-end gap-4">
            <UButton color="red" label="Delete" @click="handleRemove()" />
            <UButton label="Cancel" @click="openModal = false" />
          </div>
        </template>
      </UCard>
    </UModal>
  </ClientOnly>
</template>

<script setup lang="ts">
import type { SessionType } from "~/lib/type";
import parseUserAgent from "~/utils/parseUserAgent";

const props = defineProps<{
  session: SessionType;
}>();
const { session } = toRefs(props);

const { browser, deviceType, icon, os, timeAgo } = parseUserAgent(
  session.value.userAgent,
  session.value.expires
);
const loading = ref(false);
const openModal = ref(false);

const emit = defineEmits(["emitSessionId"]);

async function handleRemove() {
  loading.value = true;
  const { data, error } = await authFunc(
    `/session/${session.value.id}`,
    "DELETE"
  );
  if (error.value?.data) {
    useCustomToast("Error", error.value?.data.error);
    loading.value = false;
    return;
  }
  useCustomToast("Success", data.value?.message);
  emit("emitSessionId", session.value.id);
}
</script>

<style></style>
