const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

// remove /api
export const BACKEND_URL = API_BASE.replace("/api", "");

// src/lib/image.ts

export function getImageUrl(path?: string) {
  if (!path) return "/placeholder.png";

  if (path.startsWith("http")) return path;

  return `http://localhost:8080${path}`;
}

