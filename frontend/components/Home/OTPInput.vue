<template>
  <div class="flex items-center justify-center space-x-2">
    <input
      v-for="(digit, index) in otp"
      :key="index"
      ref="otpInputs"
      v-model="otp[index]"
      type="text"
      maxlength="1"
      class="size-12 text-center border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      @input="handleInput(index, $event)"
      @keydown.delete="handleBackspace(index)"
    />
  </div>
</template>

<script setup lang="ts">
const otpLength = 6;
const otp = ref(Array(otpLength).fill(""));
const otpInputs = ref<HTMLInputElement[]>([]);

const handleInput = (index: number, event: Event) => {
  const input = event.target as HTMLInputElement;
  const value = input.value;

  if (!/^\d$/.test(value)) {
    otp.value[index] = "";
    return;
  }

  if (index < otpLength - 1 && value !== "") {
    otpInputs.value[index + 1]?.focus();
  }
};

const handleBackspace = (index: number) => {
  if (index > 0 && otp.value[index] === "") {
    otpInputs.value[index - 1]?.focus();
  }
};

defineExpose({ otp });
</script>
