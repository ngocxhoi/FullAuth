<template>
  <div
    class="mx-auto max-w-screen-2xl h-screen min-w-[600px] flex flex-col p-4"
  >
    <div>
      <NuxtPage />
    </div>
  </div>
  <NuxtRouteAnnouncer />
  <UNotifications />
  <ClientOnly>
    <Asidebar />
  </ClientOnly>
</template>

<script setup lang="ts">
const appConfig = useAppConfig();
useHead({
  titleTemplate: (titleChunk: string | undefined): any => {
    return titleChunk ? `${titleChunk} | ${appConfig.title}` : appConfig.title;
  },
});

onMounted(async () => {
  await getAccessToken();
});
</script>
