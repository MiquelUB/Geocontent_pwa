/**
 * PXX — next-intl configuration
 * Internationalization setup for Next.js
 */

import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async () => {
  // For now, use a fixed locale. In the future, this will be
  // determined by the user's preference or Accept-Language header.
  const locale = "ca";

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
