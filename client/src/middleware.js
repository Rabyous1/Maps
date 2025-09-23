import { i18nRouter } from "next-i18n-router";
import { NextResponse } from "next/server";

import i18nConfig from "../i18nConfig";

export async function middleware(req) {
  const url = req.nextUrl.clone();
  const { defaultLocale } = i18nConfig;
  const { pathname } = req.nextUrl;

  if (
    !pathname.startsWith("/fr") &&
    !pathname.startsWith(`/${defaultLocale}`)
  ) {
    url.pathname = `/en${pathname}`;
    return NextResponse.rewrite(url);
  }

  return i18nRouter(req, i18nConfig);
}

export const config = {
  matcher: "/((?!api|static|.*\\..*|_next).*)",
};
