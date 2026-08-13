import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  className?: string;
};

export function Logo({ className = "" }: LogoProps) {
  return (
    <Link href="/" className={`w-auto ${className}`}>
      <Image
        src="/favicon.webp"
        alt="Bankai Project"
        width={28}
        height={28}
        className="h-7 w-auto"
      />
    </Link>
  );
}
