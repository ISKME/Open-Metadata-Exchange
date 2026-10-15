// @ts-nocheck
// React form utility in case need to get a token.
let loading: Promise<typeof grecaptcha> | null = null;

export function loadRecaptcha(siteKey: string) {
  if ((window as any).grecaptcha) return Promise.resolve((window as any).grecaptcha);
  if (loading) return loading;

  loading = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-recaptcha="true"]') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve((window as any).grecaptcha));
      existing.addEventListener('error', reject);
      return;
    }
    const s = document.createElement('script');
    s.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`;
    s.async = true; s.defer = true; s.dataset.recaptcha = 'true';
    s.onload = () => resolve((window as any).grecaptcha);
    s.onerror = reject;
    document.head.appendChild(s);
  });

  return loading;
}

const inflight: Record<string, Promise<string>> = {};
export async function getRecaptchaToken(siteKey: string, action: string) {
  const k = `${siteKey}:${action}`;
  if (inflight[k]) return inflight[k];
  const gre = await loadRecaptcha(siteKey);
  inflight[k] = gre.execute(siteKey, { action }).finally(() => { delete inflight[k]; });
  return inflight[k];
}
