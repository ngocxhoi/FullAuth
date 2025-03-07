<template>
  <div class="flex flex-col items-center justify-center h-full">
    <UCard
      v-if="isValid"
      class="flex flex-col gap-4 min-w-[600px] p-10 mx-auto border rounded-lg shadow-lg"
    >
      <template #header>
        <div class="flex justify-center">
          <Logo size="w-32" />
        </div>
        <h1
          class="text-xl tracking-[-0.16px] dark:text-[#fcfdffef] font-bold mb-1.5 mt-8 text-center sm:text-left"
        >
          Set up a new password
        </h1>
        <p
          class="mb-6 text-center sm:text-left text-base dark:text-[#f1f7feb5] font-normal"
        >
          Your password must be different from your previous one.
        </p>
      </template>

      <UForm
        @submit="handleSubmit"
        :schema="resetPasswordSchema"
        :state="resetPasswordState"
        class="space-y-6"
      >
        <UFormGroup name="password" label="New Password" required>
          <UInput
            v-model="resetPasswordState.password"
            type="password"
            size="lg"
            placeholder="********"
          />
        </UFormGroup>
        <UFormGroup name="confirmPassword" label="Confirm Password" required>
          <UInput
            v-model="resetPasswordState.confirmPassword"
            type="password"
            size="lg"
            placeholder="********"
          />
        </UFormGroup>
        <UButton
          type="submit"
          :loading="isLoading"
          block
          color="black"
          size="lg"
          label="Update password"
        />
      </UForm>
    </UCard>

    <UCard
      v-else
      class="flex flex-col gap-4 min-w-[600px] p-10 mx-auto border rounded-lg shadow-lg"
    >
      <template #header>
        <div class="flex justify-center">
          <Logo size="w-32" />
        </div>
      </template>
      <div class="flex flex-col gap-2 items-center justify-center rounded-md">
        <div class="size-[48px]">
          <Frown size="48px" class="animate-bounce text-red-500" />
          <Icon name="mdi:frown" />
        </div>
        <h2 class="text-2xl tracking-[-0.16px] dark:text-[#fcfdffef] font-bold">
          Invalid or expired reset link
        </h2>
        <p
          class="mb-2 text-center text-muted-foreground dark:text-[#f1f7feb5] font-normal"
        >
          You can request a new password reset link
        </p>
        <Link href="/auth/forgot-password?email=">
          <UButton
            trailing-icon="mdi:arrow-right-thin"
            color="black"
            label="Go to forgot password"
          />
        </Link>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: "Reset password",
});
import { resetPasswordSchema } from "~/lib/zod.schema";

const route = useRoute();

const resetPasswordState = ref({
  password: "",
  confirmPassword: "",
});
const isValid = ref(true);
const isLoading = ref(false);
const code = ref("");
const userId = ref("");

onMounted(() => {
  code.value = route.query.code as string;
  userId.value = route.query.id as string;
  if (!code.value || !userId.value) navigateTo("/auth/forgot-password?email=");
  const exp = route.query.exp as string;

  if (Number(exp) < Date.now()) isValid.value = false;
});

async function handleSubmit() {
  isLoading.value = true;
  const { data, error } = await authFunc("/auth/password/reset", "POST", {
    password: resetPasswordState.value.password,
    verificationCode: code.value,
    userId: userId.value,
  });

  if (error.value?.data) {
    useCustomToast("Error", error.value.data.error ?? "Something went wrong");
    isLoading.value = false;
    isValid.value = false;
    return;
  }
  isLoading.value = false;

  navigateTo("/auth/login");
}
</script>

<style></style>
