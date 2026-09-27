"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";

export default function SiteNav() {
  const pathname = usePathname();
  if (pathname === "/login") return null;

  return (
    <nav>
      <Link href="/" className={pathname === "/" ? "active" : ""}>
        Quiz
      </Link>
      <Link href="/study" className={pathname === "/study" ? "active" : ""}>
        Study guide
      </Link>
      <form action={logout}>
        <button type="submit" className="nav-button">
          Log out
        </button>
      </form>
    </nav>
  );
}
