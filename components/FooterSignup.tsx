"use client";

import { useState } from "react";

export default function FooterSignup() {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setErrorMsg("Please enter your email");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, email, phone }),
      });

      if (response.ok) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMsg("Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Something went wrong. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <div className="mb-6 flex justify-center">
        <div className="border border-white/30 rounded-xl p-5 py-6 w-full max-w-5xl">
          <p className="text-[#dcff73] font-bold text-lg text-center">
            Thank you for being part of my world.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 flex justify-center">
      <div className="border border-white/30 rounded-xl p-5 py-6 w-full max-w-5xl">
        <form onSubmit={handleSubmit}>
          {errorMsg && (
            <p className="text-red-500 text-sm mb-2 text-center">{errorMsg}</p>
          )}

          <span className="block text-white font-semibold text-xl md:text-2xl text-left font-[family-name:var(--font-inter)] mb-4">
            For cool, secret things
          </span>

          <div className="flex flex-col md:flex-row gap-2">
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name *"
              className="w-full md:flex-1 px-4 py-3 md:py-3 border border-white outline-none text-white placeholder:text-white/50 [&::placeholder]:after:text-red-500 text-base rounded-full bg-transparent"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email *"
              className="w-full md:flex-1 px-4 py-3 md:py-3 border border-white outline-none text-white placeholder:text-white/50 text-base rounded-full bg-transparent"
            />
            <div className="flex items-center px-4 py-3 border border-white rounded-full bg-transparent">
              <span className="mr-1 text-base">🇺🇸</span>
              <span className="text-white text-base mr-1">+1</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone"
                className="flex-1 md:w-24 text-white placeholder:text-white/50 text-base focus:outline-none bg-transparent"
              />
            </div>
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full md:w-auto px-6 py-3 bg-[#dcff73] text-black font-bold hover:bg-white transition-colors text-base rounded-full whitespace-nowrap disabled:opacity-50"
            >
              {status === "loading" ? "Joining..." : "Join"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
