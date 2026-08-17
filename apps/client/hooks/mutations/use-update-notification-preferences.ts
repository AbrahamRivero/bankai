import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateNotificationPreferences } from "@/lib/fetchers/notification-preferences";

function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateNotificationPreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notification-preferences"],
      });
    },
  });
}

export default useUpdateNotificationPreferences;
