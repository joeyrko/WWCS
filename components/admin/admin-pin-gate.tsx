"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const PIN_LENGTH = 6;

export function AdminPinGate() {
  const router = useRouter();
  const [digits, setDigits] = useState<string[]>(Array(PIN_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  async function submit(pin: string) {
    if (pin.length !== PIN_LENGTH || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast.error(data?.error ?? "Incorrect PIN.");
        setDigits(Array(PIN_LENGTH).fill(""));
        inputRefs.current[0]?.focus();
        return;
      }

      router.refresh();
    } catch {
      toast.error("Something went wrong verifying the PIN.");
    } finally {
      setLoading(false);
    }
  }

  function updateDigit(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);

    if (digit && index < PIN_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (next.every((d) => d !== "")) {
      submit(next.join(""));
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, PIN_LENGTH);
    if (!pasted) return;
    e.preventDefault();
    const next = Array(PIN_LENGTH).fill("");
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setDigits(next);
    const lastIndex = Math.min(pasted.length, PIN_LENGTH - 1);
    inputRefs.current[lastIndex]?.focus();
    if (pasted.length === PIN_LENGTH) submit(pasted);
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <Lock className="h-10 w-10 text-wwc-red" />
      <h1 className="mt-4 font-display text-3xl uppercase tracking-wide text-white">
        Enter Admin PIN
      </h1>
      <p className="mt-2 max-w-sm text-sm text-wwc-grey-400">
        This account has admin access. Enter the 6-digit PIN to continue to the QC dashboard.
      </p>

      <div className="mt-8 flex gap-2.5">
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => {
              inputRefs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            maxLength={1}
            value={digit}
            disabled={loading}
            onChange={(e) => updateDigit(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            aria-label={`PIN digit ${i + 1}`}
            className={cn(
              "h-14 w-11 rounded-sm border border-wwc-grey-700 bg-wwc-grey-900 text-center font-display text-2xl text-white transition-colors focus:border-wwc-red focus:outline-none disabled:opacity-50"
            )}
          />
        ))}
      </div>
    </div>
  );
}
