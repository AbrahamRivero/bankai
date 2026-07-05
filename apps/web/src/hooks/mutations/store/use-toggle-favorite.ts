import { useMutation, useQueryClient } from "@tanstack/react-query";
import toggleFavorite from "@/fetchers/products/toggle-favorite";

function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => toggleFavorite(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export default useToggleFavorite;
