// src/lib/apiFetch.ts
"use client";

import { getOrCreateUserKey } from "./userKey";

type ApiFetchOptions = Omit<RequestInit, "headers"> & {
  headers?: HeadersInit;
};

/**
 * Client-side fetch wrapper that always attaches x-user-key.
 */
export async function apiFetch(input: RequestInfo | URL, init: ApiFetchOptions = {}) {
  const userKey = getOrCreateUserKey();
    console.log("apiFetch userKey =", userKey);


  // Merge headers safely
  const headers = new Headers(init.headers);
  headers.set("x-user-key", userKey);
    console.log("apiFetch outgoing headers x-user-key =", headers.get("x-user-key"));



  // Default JSON behavior only when sending a body
  if (init.body && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  return fetch(input, {
    ...init,
    headers,
  });
}
