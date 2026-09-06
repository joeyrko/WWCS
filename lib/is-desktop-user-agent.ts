// Matches phone/tablet browsers (iOS, Android, Kindle/Silk, Windows Phone,
// BlackBerry, Opera Mini) and our own Android TV app's WebView, which tags
// itself with this marker in MainActivity.kt. Anything else — desktop
// Chrome/Firefox/Safari/Edge, or an unrecognized/empty User-Agent — is
// treated as desktop. This is a User-Agent check, not real device
// verification: it's meant to steer normal visitors toward the apps, not to
// resist someone deliberately spoofing their UA.
const ALLOWED_DEVICE_UA = /WWCTVApp|Android|iPhone|iPad|iPod|IEMobile|BlackBerry|Opera Mini|Mobile|Silk|Kindle|PlayBook|Windows Phone/i;

export function isDesktopUserAgent(userAgent: string | null): boolean {
  if (!userAgent) return true;
  return !ALLOWED_DEVICE_UA.test(userAgent);
}
