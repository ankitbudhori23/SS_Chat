"use client";

import Chat from "@/components/chat";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PulseLoader } from "react-spinners";

export default function Home() {
  const router = useRouter();
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    if (!token) {
      localStorage.clear();
      router.replace("auth/login");
      return;
    }
  }, []);

  if (!token) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#1a1a1a",
        }}
      >
        <PulseLoader color="#16aa7e" size={15} />
      </div>
    );
  }

  return <Chat />;
}
