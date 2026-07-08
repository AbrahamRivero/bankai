import { useMutation } from "@tanstack/react-query";
import type { ValidatePromotionInput } from "@/fetchers/promotions/validate-promotion";
import validatePromotion from "@/fetchers/promotions/validate-promotion";

function useValidatePromotion() {
  return useMutation({
    mutationFn: (data: ValidatePromotionInput) => validatePromotion(data),
  });
}

export default useValidatePromotion;
