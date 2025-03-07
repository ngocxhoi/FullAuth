<template>
  <div class="flex flex-col items-center justify-center h-full">
    <UCard
      class="flex flex-col gap-4 min-w-[600px] p-10 mx-auto border rounded-lg shadow-lg"
    >
      <template #header>
        <div class="flex justify-center">
          <Logo size="w-32" />
        </div>
        <h1
          class="text-xl tracking-[-0.16px] dark:text-[#fcfdffef] font-bold mb-1.5 mt-8 text-center sm:text-left"
        >
          Account confirmation
        </h1>
        <p
          class="mb-6 text-center sm:text-left text-base dark:text-[#f1f7feb5] font-normal"
        >
          To confirm your account, please follow the button below.
        </p>
      </template>

      <UButton
        @click="handleSubmit()"
        :loading="isLoading"
        block
        color="black"
        size="lg"
        label="Confirm Account"
      />

      <p
        className="mt-6 text-sm text-muted-foreground dark:text-[#f1f7feb5] font-normal"
      >
        If you have any issue confirming your account please, contact
        <a
          className="outline-none transition duration-150 ease-in-out 
            focus-visible:ring-2 text-primary hover:underline focus-visible:ring-primary"
          href="#"
        >
          support@squeezy.com
        </a>
        .
      </p>
    </UCard>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: "Forgot password",
});

const route = useRoute();

const isLoading = ref(false);
const code = ref("");

onMounted(() => {
  code.value = route.query.code as string;
  // if (!code.value) {
  //   useCustomToast("Error", "Can not verify account ");
  //   navigateTo("/");
  // }
});

async function handleSubmit() {
  isLoading.value = true;
  const { data, error } = await authFunc("/auth/verify/email", "POST", {
    code: code.value,
  });

  if (error.value?.data) {
    useCustomToast("Error", error.value.data.error ?? "Something went wrong");
    isLoading.value = false;
    return;
  }
  isLoading.value = false;

  useCustomToast("Success", data.value?.message);

  navigateTo("/");
}
</script>

<style></style>
