export const useCustomToast = (
  title: string,
  message?: string,
  color = "green",
  timeout = 5000,
  icon = "mdi:check-circle-outline"
) => {
  const toast = useToast();

  toast.add({
    title,
    description: message,
    color: title.includes("Error") ? ("red" as any) : color,
    icon: title.includes("Error") ? "mdi:alert-circle-outline" : icon,
    timeout,
  });
};
