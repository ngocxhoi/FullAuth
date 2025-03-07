<template>
  <div class="flex flex-col items-center justify-center h-full">
    <UFormGroup>
      <h1 class="text-xl">
        Your account has been created. Please check your email to verify your
        account
      </h1>
      <UDivider label="OR" class="my-4" />
      <h1 class="text-white text-2xl">Do you want to logout ?</h1>
      <UButton color="black" label="Logout" @click="handleLogout()" />
    </UFormGroup>
    <p>{{ userData }}</p>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: "Verify",
});

const { verifyMFA } = useAuth();
const { userData } = useStateStore();
const route = useRoute();

const { logOut } = useAuth();
const handleLogout = async () => {
  await logOut();
};
</script>

<style></style>
