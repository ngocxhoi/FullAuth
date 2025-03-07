<template>
  <div class="via-root to-root rounded-xl bg-gradient-to-r p-0.5">
    <div class="rounded-[10px] p-6">
      <div class="flex items-center gap-3">
        <h3 class="text-xl tracking-[-0.16px] text-slate-12 font-bold mb-1">
          Multi-Factor Authentication (MFA)
        </h3>
        <span
          v-if="user?.enable2FA"
          class="select-none whitespace-nowrap font-medium bg-green-100 text-green-500 text-xs h-6 px-2 rounded flex flex-row items-center justify-center gap-1"
        >
          Enabled
        </span>
      </div>

      <p class="mb-6 text-sm text-[#0007149f] dark:text-gray-100 font-normal">
        Protect your account by adding an extra layer of security.
      </p>

      <div class="flex gap-4">
        <UButton
          :disabled="!user?.enable2FA"
          label="Revoke Access"
          size="lg"
          :loading="loadingRevokeMfa"
          color="red"
          @click="openModalRevoke = true"
        />
        <UButton
          :disabled="user?.enable2FA"
          :loading="isLoading"
          label="Enable Access"
          size="lg"
          color="blue"
          @click="handleSetupMfa()"
        />
      </div>

      <ClientOnly>
        <UModal v-model="openModal" prevent-close>
          <UCard
            :ui="{
              ring: '',
              divide: 'divide-y divide-gray-100 dark:divide-gray-800',
            }"
          >
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="text-xl font-semibold leading-6">Enable MFA</h3>
                <UButton
                  color="gray"
                  variant="ghost"
                  icon="i-heroicons-x-mark-20-solid"
                  class="-my-1"
                  @click="openModal = false"
                />
              </div>
              <div class="flex flex-1 py-2">
                <p class="font-semibold">Setup Multi-Factor Authentication</p>
              </div>
            </template>

            <div>
              <p class="mt-6 text-[#0007149f] dark:text-inherit font-bold">
                Scan the QR code
              </p>
              <span
                class="text-sm text-[#0007149f] dark:text-inherit font-normal"
              >
                Use an app like
                <a
                  class="!text-primary underline decoration-primary decoration-1 underline-offset-2 transition duration-200 ease-in-out hover:decoration-blue-11 dark:text-current dark:decoration-slate-9 dark:hover:decoration-current"
                  rel="noopener noreferrer"
                  target="_blank"
                  href="https://support.1password.com/one-time-passwords/"
                >
                  1Password
                </a>
                <span>or</span>
                <a
                  class="!text-primary underline decoration-primary decoration-1 underline-offset-2 transition duration-200 ease-in-out hover:decoration-blue-11 dark:text-current dark:decoration-slate-9 dark:hover:decoration-current"
                  rel="noopener noreferrer"
                  target="_blank"
                  href="https://safety.google/authentication/"
                >
                  Google Authenticator </a
                >to scan the QR code below.
              </span>
            </div>

            <div class="mt-4 flex flex-row items-center gap-4">
              <div
                class="shrink-0 rounded-md border p-2 border-[#0009321f] dark:border-gray-600 bg-white"
              >
                <USkeleton
                  v-if="isLoading || !mfaData?.qrImageUrl"
                  class="size-40"
                />
                <img
                  v-else
                  alt="QR code"
                  decoding="async"
                  :src="mfaData.qrImageUrl"
                  width="160"
                  height="160"
                  class="rounded-md"
                />
              </div>

              <div v-if="showKey" class="w-full">
                <div
                  class="flex items-center gap-1 text-sm text-[#0007149f] dark:text-muted-foreground font-normal"
                >
                  <span>Copy setup key</span>
                  <UButton
                    :disabled="copied"
                    color="gray"
                    variant="ghost"
                    :icon="
                      copied ? 'mdi:check-circle-outline' : 'mdi:content-copy'
                    "
                    @click="onCopy(mfaData?.qrImageUrl)"
                  />
                </div>
                <p
                  class="text-sm block truncate w-[200px] text-black dark:text-muted-foreground"
                >
                  {{ mfaData?.secret }}
                </p>
              </div>

              <span
                v-else
                class="text-sm text-[#0007149f] dark:text-muted-foreground font-normal"
              >
                Can't scan the code?
                <button
                  class="block text-primary transition duration-200 ease-in-out hover:underline dark:text-white"
                  type="button"
                  @click="handleShowKey()"
                >
                  View the Setup Key
                </button>
              </span>
            </div>

            <template #footer>
              <div>
                <p class="mt-6 text-[#0007149f] dark:text-inherit font-bold">
                  Then enter the code
                </p>
                <div class="p-6 mx-auto space-y-4">
                  <h2 class="mb-4 text-lg font-semibold text-center">
                    Input OTP
                  </h2>
                  <OTPInput ref="otpRef" />
                  <UButton
                    @click="handleSubmit()"
                    block
                    :loading="isLoading"
                    size="lg"
                    label="Submit"
                  />
                </div>
              </div>
            </template>
          </UCard>
        </UModal>

        <UModal v-model="openModalRevoke">
          <UCard>
            <template #header>
              <h2 class="text-xl font-semibold text-red-500">Are you sure?</h2>
            </template>

            <template #footer>
              <div class="flex items-center justify-end gap-4">
                <UButton
                  color="red"
                  label="Yes, I'm sure"
                  @click="handleRevokeMfa()"
                />
                <UButton label="Cancel" @click="openModalRevoke = false" />
              </div>
            </template>
          </UCard>
        </UModal>
      </ClientOnly>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MfaType, User } from "~/lib/type";
import OTPInput from "./OTPInput.vue";

const otpRef = ref();
const user = useCookie<User | null>("user").value;
const loadingRevokeMfa = ref(false);
const isLoading = ref(false);
const openModal = ref(false);
const openModalRevoke = ref(false);
const showKey = ref(false);
const mfaData = ref<MfaType>();
const copied = ref(false);

function onCopy(url: string | undefined) {
  if (!url) {
    useCustomToast("Error", "Can't copied url");
    return;
  }
  navigator.clipboard.writeText(url);
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

function handleShowKey() {
  showKey.value = true;
  setTimeout(() => (showKey.value = false), 5000);
}

async function handleSetupMfa() {
  isLoading.value = true;
  const { data, error } = await authFunc("/mfa/setup");

  if (error.value?.data) {
    useCustomToast("Error", error.value.data.error);
    isLoading.value = false;
    return;
  }

  mfaData.value = data.value?.data as MfaType;
  isLoading.value = false;
  openModal.value = true;
}

async function handleSubmit() {
  const opts = otpRef.value?.otp.join("");
  if (opts && opts.length < 6) {
    useCustomToast("Error Format", "OPT must be 6 characters.", "red");
    return;
  }
  const { data, error } = await authFunc("/mfa/verify", "POST", {
    code: opts,
    secretKey: mfaData.value?.secret,
  });

  if (error.value?.data) {
    useCustomToast("Error", error.value.data.error);
    return;
  }

  useCustomToast("Success", data.value?.message);
  user!.enable2FA = true;
  openModal.value = false;
}

async function handleRevokeMfa() {
  openModalRevoke.value = false;
  loadingRevokeMfa.value = true;

  const { error } = await authFunc("/mfa/revoke", "PUT");
  if (error.value?.data) {
    useCustomToast("Error", error.value.data.error);
    loadingRevokeMfa.value = false;
    return;
  }

  loadingRevokeMfa.value = false;
  user!.enable2FA = false;
}
</script>

<style></style>
