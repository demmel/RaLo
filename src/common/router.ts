import { format as formatUrl, parse as parseUrl } from "url";
import isDev from "common/isDev";
import * as path from "path";

const routes = Object.freeze({
  onboarding: {},
} as const);

type RouteName = keyof typeof routes;

const HOST = "localhost";
const PATH = isDev ? "/" : path.join(__dirname, "index.html");
const PROTOCOL = isDev ? "http:" : "file:";
const PORT = isDev ? process.env.ELECTRON_WEBPACK_WDS_PORT : undefined;

export function getRouteURL(route: RouteName): string {
  return formatUrl({
    hostname: HOST,
    pathname: PATH,
    protocol: PROTOCOL,
    slashes: true,
    port: PORT,
    query: {
      route,
    },
  });
}

export function getRouteFromURL(url: string): RouteName {
  const { pathname, hostname, protocol, port, query } = parseUrl(url, true);
  if (
    pathname != PATH ||
    hostname != HOST ||
    protocol != PROTOCOL ||
    port != PORT
  ) {
    throw new Error(`Invalid route url: ${url}`);
  }
  const route = query["route"];
  if (route == null) {
    throw new Error(`URL did not contain route`);
  }
  return route as RouteName;
}
