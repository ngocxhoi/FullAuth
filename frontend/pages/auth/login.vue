<template>
  <div class="flex flex-col items-center justify-center h-full">
    <UForm
      :schema="loginSchema"
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

      <UFormGroup class="flex justify-start items-center">
        <p
          @click="
            navigateTo(`/auth/forgot-password?email=${credentials.email}`)
          "
          class="text-sm hover:underline hover:text-blue-500 cursor-pointer"
        >
          Forgot password?
        </p>
      </UFormGroup>

      <UButton
        type="submit"
        :loading="isLoading"
        label="Login"
        color="black"
        block
        size="lg"
      />

      <UFormGroup class="flex justify-center items-center">
        <span class="text-sm">Don't have an account?</span>
        <ULink
          to="/auth/signup"
          class="text-sm hover:underline hover:text-blue-500"
        >
          Sign up
        </ULink>
      </UFormGroup>
    </UForm>
  </div>
</template>

<script lang="ts" setup>
import { type LoginSchema, loginSchema } from "../../lib/zod.schema";
import type { FormSubmitEvent } from "#ui/types";
import { authFunc } from "~/composables/useAPI";
useSeoMeta({
  title: "Auth",
});

const credentials = ref({
  email: "ngocxhoi.dev@gmail.com",
  password: "1212121212",
});
const isLoading = ref(false);

async function handleSubmit(event: FormSubmitEvent<LoginSchema>) {
  isLoading.value = true;
  const { data, error } = await authFunc("/auth/login", "POST", {
    ...event.data,
    userAgent: navigator.userAgent,
  });
  if (error.value?.data) {
    useCustomToast("Error", error.value?.data.error, "red");
    isLoading.value = false;
    return;
  }
  isLoading.value = false;

  useCookie("user").value = data.value?.data as any;

  useCustomToast("Success", data.value?.message);

  navigateTo("/");
}
</script>
