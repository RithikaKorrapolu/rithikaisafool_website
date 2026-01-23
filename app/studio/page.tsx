"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Studio() {
  const router = useRouter();

  useEffect(() => {
    router.push('/');
  }, [router]);

  return null;
}
