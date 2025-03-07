<template>
  <div class="flex items-center justify-between">
    <Logo size="w-32" />
    <UButton
      icon="mdi:page-layout-sidebar-left"
      color="black"
      size="lg"
      variant="solid"
      @click="openAsideBar = !openAsideBar"
    />
  </div>
  <div>
    <div
      class="flex max-w-3xl flex-col gap-2 mx-auto w-full md:max-w-5xl px-6 py-8"
    >
      <h1
        class="text-[28px] leading-[34px] tracking-[-0.416px] text-[#000509e3] dark:text-inherit font-extrabold"
      >
        Setup security and sessions
      </h1>
      <p class="text-sm text-[#0007149f] dark:text-gray-100 font-normal">
        Follow the steps to activate using the Squeezy.
      </p>
    </div>
    <div class="relative max-w-3xl py-0 mx-auto w-full px-6 md:max-w-5xl">
      <div
        class="steps-gradient dark:bg-gray-800 absolute top-0 h-[700px] w-px bg-primary-500"
      />

      <div class="flex flex-col gap-5">
        <div class="relative pl-6 transition duration-200 ease-in-out">
          <div
            class="bg-white dark:bg-background absolute -left-[9.5px] top-7 z-10 block h-5 w-5 rounded-full"
          >
            <div
              class="ml-1 mt-1 h-3 w-3 rounded-full border-2 transition duration-200 ease-in-out border-primary"
            />
          </div>
          <div>
            <HomeEnableMFA />
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-5">
        <div class="relative pl-6 transition duration-200 ease-in-out">
          <div
            class="bg-white dark:bg-background absolute -left-[9.5px] top-7 z-10 block h-5 w-5 rounded-full"
          >
            <div
              class="ml-1 mt-1 h-3 w-3 rounded-full border-2 transition duration-200 ease-in-out border-primary"
            ></div>
          </div>
          <div>
            <HomeSession />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: "Home",
});

const { openAsideBar } = useStateStore();
</script>

<style></style>
