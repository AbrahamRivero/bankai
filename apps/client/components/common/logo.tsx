import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  className?: string;
};

export function Logo({ className = "" }: LogoProps) {
  return (
    <Link href="/dashboard" className={`w-auto ${className}`}>
      <Image
        src="/logo-dark.svg"
        alt="Kaneo"
        width={96}
        height={24}
        className="h-6 w-auto dark:hidden"
      />
      <Image
        src="/logo-light.svg"
        alt="Kaneo"
        width={96}
        height={24}
        className="hidden h-6 w-auto dark:block"
      />
    </Link>
  );
}
