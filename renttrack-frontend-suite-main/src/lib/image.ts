const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "https://renttrack-backend-production.up.railway.app/api";

// remove /api
export const BACKEND_URL = API_BASE.replace("/api", "");

// src/lib/image.ts

export function getImageUrl(path?: string) {
  if (!path) return "/placeholder.png";

  if (path.startsWith("http")) return path;

  return `https://renttrack-backend-production.up.railway.app${path}`;
}

