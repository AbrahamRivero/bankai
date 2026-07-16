"use client";

import Link from "next/link";
import useGetConfig from "@/hooks/queries/config/use-get-config";

type AuthToggleProps = {
  message: string;
  linkText: string;
  linkTo: string;
};

export function AuthToggle({ message, linkText, linkTo }: AuthToggleProps) {
  const { data: config } = useGetConfig();

  if (config?.disableRegistration || config?.disablePasswordRegistration) {
    return null;
  }

  return (
    <div className="text-center text-sm text-muted-foreground mt-3">
      {message}{" "}
      <Link
        href={linkTo}
        className="underline underline-offset-4 hover:text-primary"
      >
        {linkText}
      </Link>
    </div>
  );
}
