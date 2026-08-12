const FALLBACK_ORIGIN = "https://hhgoa-builder-house.vercel.app";

const PLACEHOLDER_HOSTS = new Set([
  "your-production-domain.com",
  "your-vercel-domain.vercel.app",
]);

function validOrigin(value?: string) {
  if (!value) return null;

  try {
    const url = new URL(value.trim());
    if ((url.protocol !== "https:" && url.protocol !== "http:") || PLACEHOLDER_HOSTS.has(url.hostname)) {
      return null;
    }
    return url.origin;
  } catch {
    return null;
  }
}

/**
 * Safe for static build-time metadata. An invalid dashboard environment value
 * should never be able to fail an otherwise healthy deployment.
 */
export function configuredSiteOrigin() {
  return validOrigin(process.env.NEXT_PUBLIC_APP_URL)
    ?? validOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined)
    ?? validOrigin(process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined)
    ?? FALLBACK_ORIGIN;
}

/**
 * A share card needs the URL that received the request if a canonical origin
 * has not been configured correctly in the deployment dashboard.
 */
export function publicSiteOrigin(request: Request) {
  return validOrigin(process.env.NEXT_PUBLIC_APP_URL)
    ?? new URL(request.url).origin;
}
