<template>
  <div class="flex items-center justify-center h-full">
    <UForm
      v-if="!isSubmitted"
      :schema="registerSchema"
      :state="credentials"
      @submit.prevent="handleSubmit"
      class="flex flex-col gap-4 min-w-[600px] p-10 mx-auto border rounded-lg shadow-lg"
    >
      <Logo size="w-32" />

      <UFormGroup
        size="xl"
        label="Email"
        name="email"
        required
        class="mt-4 [&_*]:bg-transparent"
      >
        <UInput
          size="lg"
          type="email"
          v-model="credentials.email"
          placeholder="Enter email"
        />
      </UFormGroup>

      <UFormGroup
        size="xl"
        label="Name"
        name="name"
        required
        class="mt-4 [&_*]:bg-transparent"
      >
        <UInput
          size="lg"
          type="text"
          v-model="credentials.name"
          placeholder="Enter name"
        />
      </UFormGroup>

      <UFormGroup
        size="xl"
        label="Password"
        name="password"
        required
        class="mb-4 [&_*]:bg-transparent"
      >
        <UInput
          size="lg"
          type="password"
          v-model="credentials.password"
          placeholder="Enter password"
        />
      </UFormGroup>

      <UFormGroup
        size="xl"
        label="Confirm Password"
        name="confirmPassword"
        required
        class="mb-4 [&_*]:bg-transparent"
      >
        <UInput
          size="lg"
          type="password"
          v-model="credentials.confirmPassword"
          placeholder="Enter password"
        />
      </UFormGroup>

      <UFormGroup class="flex justify-start items-center">
        <ULink
          to="/auth/forgot-password"
          class="text-sm hover:underline hover:text-blue-500"
        >
          Forgot password?
        </ULink>
      </UFormGroup>

      <UButton
        type="submit"
        :loading="isLoading"
        label="Register"
        color="black"
        block
        size="lg"
      />

      <UFormGroup class="flex justify-center items-center">
        <span class="text-sm">Already have an account? </span>
        <ULink
          to="/auth/login"
          class="text-sm hover:underline hover:text-blue-500"
        >
          Login
        </ULink>
      </UFormGroup>
    </UForm>

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
          We just sent a verification link to {{ credentials.email }}.
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

<script lang="ts" setup>
import { type RegisterSchema, registerSchema } from "../../lib/zod.schema";
import type { FormSubmitEvent } from "#ui/types";
useSeoMeta({
  title: "Auth",
});

const credentials = ref({
  email: "ngocxhoi.dev@gmail.com",
  name: "Theodore Larson",
  password: "1212121212",
  confirmPassword: "1212121212",
});
const isLoading = ref(false);
const isSubmitted = ref(false);

async function handleSubmit(event: FormSubmitEvent<RegisterSchema>) {
  isLoading.value = true;
  const { data, error } = await authFunc("/auth/register", "POST", {
    ...event.data,
    userAgent: navigator.userAgent,
  });

  if (error.value?.data) {
    useCustomToast("Error", error.value.data.error);
    isLoading.value = false;
    return;
  }
  isLoading.value = false;

  useCookie("user").value = data.value?.data as any;

  isSubmitted.value = true;
}
</script>
