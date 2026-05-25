import { http, HttpResponse, type HttpHandler } from "msw";

/**
 * GPRO API mock handlers — add when integrating api.gpro.net.
 * @see https://mswjs.io/docs/http/intercepting-requests
 */
export const handlers: HttpHandler[] = [
  http.get("https://gpro.net/en/backend/api/v2/Menu", ({ request }) => {
    const authHeader = request.headers.get("Authorization");
    if (authHeader === "Bearer VALID_TOKEN") {
      return HttpResponse.json({}, { status: 200 });
    }
    return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
  }),
];
