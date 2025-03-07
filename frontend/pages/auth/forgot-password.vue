<template>
  <div class="flex flex-col items-center justify-center h-full">
    <UCard
      v-if="!isSubmitted"
      class="flex flex-col gap-4 min-w-[600px] p-10 mx-auto border rounded-lg shadow-lg"
    >
      <template #header>
        <div class="flex justify-center">
          <Logo size="w-32" />
        </div>
        <h1
          class="text-xl tracking-[-0.16px] dark:text-[#fcfdffef] font-bold mb-1.5 mt-8 text-center sm:text-left"
        >
          Reset password
        </h1>
        <p
          class="mb-6 text-center sm:text-left text-base dark:text-[#f1f7feb5] font-normal"
        >
          Include the email address associated <br />
          with your account and we’ll send you an email with instructions <br />
          to reset your password.
        </p>
      </template>

      <UForm @submit="handleSubmit" :schema="emailSchema" :state="emailState">
        <UFormGroup name="email" label="Email" required>
          <UInput
            v-model="emailState.email"
            type="email"
            size="lg"
            placeholder="Enter email"
          />
        </UFormGroup>
        <UButton
          type="submit"
          :loading="isLoading"
          block
          color="black"
          size="lg"
          label="Send reset instructions"
          class="mt-6"
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
      <div class="flex flex-col gap-y-4 items-center justify-center rounded-md">
        <div class="size-fit">
          <Icon
            name="mdi:email-arrow-left-outline"
            size="60"
            class="animate-bounce"
          />
        </div>
        <h2 class="text-2xl tracking-[-0.16px] dark:text-[#fcfdffef] font-bold">
          Check your email
        </h2>
        <p
          class="mb-2 text-center text-muted-foreground dark:text-[#f1f7feb5] font-normal"
        >
          We just sent a verification link to {{ emailState.email }}.
        </p>
        <UButton
          to="/auth/login"
          size="lg"
          color="black"
          label="Go to login"
          trailing-icon="mdi:arrow-right-thin"
        />
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: "Forgot password",
});
import { emailSchema } from "~/lib/zod.schema";

const route = useRoute();

const emailState = ref({
  email: "",
});
const isSubmitted = ref(false);
const isLoading = ref(false);

onMounted(() => {
  emailState.value.email = route.query.email as string;
});

async function handleSubmit() {
  isLoading.value = true;
  const { error } = await authFunc("/auth/password/forgot", "POST", {
    email: emailState.value.email,
  });

  if (error.value?.data) {
    useCustomToast("Error", error.value.data.error ?? "Some thing went wrong");
    isLoading.value = false;
    return;
  }
  isLoading.value = false;

  isSubmitted.value = true;
}
</script>

<style></style>
