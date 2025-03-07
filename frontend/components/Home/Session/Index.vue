<template>
  <div class="via-root to-root rounded-xl bg-gradient-to-r p-0.5">
    <div class="rounded-[10px] p-6">
      <h3 class="text-xl tracking-[-0.16px] text-slate-12 font-bold mb-1">
        Sessions
      </h3>
      <p
        class="mb-6 max-w-xl text-sm text-[#0007149f] dark:text-gray-100 font-normal"
      >
        Sessions are the devices you are using or that have used your Squeezy
        These are the sessions where your account is currently logged in. You
        can log out of each session.
      </p>
      <Icon
        v-if="isLoading"
        name="mdi:loading"
        size="35"
        class="animate-spin"
      />
      <div v-else class="rounded-t-xl max-w-xl">
        <div>
          <h5 class="text-base font-semibold">Current active session</h5>
          <p class="mb-6 text-sm text-[#0007149f] dark:text-gray-100">
            You’re logged into this Squeezy account on this device and are
            currently using it.
          </p>
        </div>
        <div class="w-full">
          <div v-if="currentSession" class="w-full py-2 border-b pb-5">
            <HomeSessionItem :session="currentSession" />
          </div>

          <div class="mt-4">
            <h5 class="text-base font-semibold">Other sessions</h5>
            <ul class="mt-4 w-full space-y-3 max-h-[400px overflow-y-auto">
              <li v-for="session in otherSessions">
                <HomeSessionItem
                  @emit-session-id="handleEmitted"
                  :loading="isPending"
                  :session="session"
                />
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SessionType } from "~/lib/type";

const isLoading = ref(false);
const isPending = ref(false);
const sessions = ref<SessionType[]>([]);
const currentSession = computed(() => {
  return sessions.value.find((s) => s.isCurrent);
});
const otherSessions = computed(() => {
  return sessions.value.filter((s) => !s.isCurrent);
});

onMounted(async () => {
  const { data, error } = await authFunc("/session/all");
  if (!data.value?.sessions) {
    useCustomToast("Error Get Session", "Can't get session");
    return;
  }
  sessions.value = data.value.sessions;
});

function handleEmitted(id: string) {
  sessions.value = sessions.value.filter((s) => s.id !== id);
}
</script>
