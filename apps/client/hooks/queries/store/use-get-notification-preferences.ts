import { useQuery } from "@tanstack/react-query";
import { getNotificationPreferences } from "@/lib/fetchers/notification-preferences";

function useGetNotificationPreferences() {
  return useQuery({
    queryFn: getNotificationPreferences,
    queryKey: ["notification-preferences"],
  });
}

export default useGetNotificationPreferences;
