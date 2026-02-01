"use client";

import { v4 as uuidv4 } from "uuid";

const STORAGE_KEY = "kb_user_key";
export function getOrCreateUserKey(): string {
  if (typeof window === "undefined") {
    throw new Error("getOrCreateUserKey must be called on the client");
  }
  let key = window.localStorage.getItem(STORAGE_KEY);
  if (!key) {
    key = crypto.randomUUID();
    window.localStorage.setItem(STORAGE_KEY, key);
  }

  return key;
}
