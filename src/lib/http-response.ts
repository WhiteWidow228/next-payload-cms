import { NextResponse } from "next/server";

export function redirectSeeOther(location: string) {
  if (!location.startsWith("/") || location.startsWith("//")) {
    throw new Error("Redirect location must be a local path.");
  }

  return new NextResponse(null, {
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      Location: location,
    },
    status: 303,
  });
}
