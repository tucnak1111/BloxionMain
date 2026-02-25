import { NextResponse } from "next/server";

const ABSURD_PATTERNS = [
  /\bteapot\b/i,
  /\bcoffee\b/i,
  /\bkettle\b/i,
  /\bbrew\b/i,
  /\bunicorn\b/i,
  /\bbanana\b/i,
  /\bnonsense\b/i,
];

function hasAbsurdContent(value: string): boolean {
  if (!value) return false;
  return ABSURD_PATTERNS.some((pattern) => pattern.test(value));
}

export function shouldBrewTeapot(values: Array<string | null | undefined>): boolean {
  return values.some((value) => hasAbsurdContent((value ?? "").toString()));
}

export function teapotResponse(reason = "Absurd request detected. I am a teapot.") {
  return NextResponse.json({ error: reason }, { status: 418 });
}
