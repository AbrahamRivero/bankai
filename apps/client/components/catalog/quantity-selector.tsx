"use client";

import { Minus, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

type QuantitySelectorProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
};

function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
}: QuantitySelectorProps) {
  const { t } = useTranslation("store");
  const decrement = () => {
    if (value > min) onChange(value - 1);
  };

  const increment = () => {
    if (value < max) onChange(value + 1);
  };

  return (
    <div className="flex items-center">
      <button
        type="button"
        onClick={decrement}
        disabled={value <= min}
        className="group flex h-11 w-11 items-center justify-center rounded-l-full border border-border bg-background transition-all hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label={t("decreaseQuantity")}
      >
        <Minus className="h-4 w-4 text-foreground transition-all group-hover:scale-110" />
      </button>
      <div className="flex h-11 w-14 items-center justify-center border-y border-border bg-background">
        <span className="text-base font-semibold text-foreground select-none">
          {value}
        </span>
      </div>
      <button
        type="button"
        onClick={increment}
        disabled={value >= max}
        className="group flex h-11 w-11 items-center justify-center rounded-r-full border border-border bg-background transition-all hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label={t("increaseQuantity")}
      >
        <Plus className="h-4 w-4 text-foreground transition-all group-hover:scale-110" />
      </button>
    </div>
  );
}

export default QuantitySelector;
