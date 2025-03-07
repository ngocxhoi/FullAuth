<template>
  <div>
    <USlideover side="left" v-model="openAsideBar">
      <UCard
        class="flex flex-col flex-1"
        :ui="{
          body: { base: 'flex-1' },
          ring: '',
          divide: 'divide-y divide-gray-100 dark:divide-gray-800',
        }"
      >
        <template #header>
          <Logo size="w-32" />
        </template>

        <ul class="space-y-4">
          <li
            v-for="el in list"
            class="flex gap-4 items-center cursor-pointer hover:bg-gray-200 p-2 rounded border-b-2 border-gray-200"
          >
            <Icon :name="el.icon" size="30" />
            <p class="text-lg font-semibold">{{ el.name }}</p>
          </li>
        </ul>

        <template #footer>
          <div v-if="user" class="w-full flex items-center justify-between">
            <div class="flex items-center gap-2">
              <UAvatar :alt="user.name" size="xl" />
              <div>
                <p class="text-lg font-semibold">{{ user.name }}</p>
                <p class="text-sm">{{ user.email }}</p>
              </div>
            </div>
            <UDropdown
              :items="items"
              :popper="{ placement: 'right-end' }"
              class="[&>*]:transition-none"
            >
              <Icon name="mdi:dots-horizontal" size="24" />
              <template #theme="{ item }">
                <span class="truncate font-semibold">{{ item.label }}</span>
                <div class="ms-auto">
                  <ThemeSwitch />
                </div>
              </template>
              <template #logout="{ item }">
                <span class="truncate font-semibold text-red-500">{{
                  item.label
                }}</span>
                <Icon name="mdi:logout" class="ms-auto text-red-500" />
              </template>
            </UDropdown>
          </div>
        </template>
      </UCard>
    </USlideover>
  </div>
</template>

<script setup lang="ts">
import type { User } from "~/lib/type";

const user = useCookie<User>("user").value;
const { openAsideBar } = useStateStore();

const list = [
  {
    icon: "mdi:home-outline",
    name: "Home",
  },
  {
    icon: "mdi:lock-outline",
    name: "Sessions",
  },
  {
    icon: "mdi:account-outline",
    name: "Account",
  },
  {
    icon: "mdi:cog-outline",
    name: "Setting",
  },
];
const items = [
  [
    {
      label: "Theme",
      slot: "theme",
    },
  ],
  [
    {
      label: "Logout",
      slot: "logout",
      click: async () => {
        await handleLogout();
      },
    },
  ],
];

async function handleLogout() {
  const { error } = await authFunc("/auth/logout", "POST");
  if (error.value?.data?.error) {
    useCustomToast("Error", error.value?.data?.error);
    return;
  }

  useCustomToast("Success", "User");

  navigateTo("/auth/login");
}
</script>
