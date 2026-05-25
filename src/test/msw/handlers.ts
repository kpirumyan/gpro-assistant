import { http, HttpResponse, type HttpHandler } from "msw";
import driverProfileFixture from "@/lib/gpro/__fixtures__/driver-profile.json";
import carDataFixture from "@/lib/gpro/__fixtures__/car-data.json";

function isAuthorized(request: Request): boolean {
  return request.headers.get("Authorization") === "Bearer VALID_TOKEN";
}

/**
 * GPRO API mock handlers — add when integrating api.gpro.net.
 * @see https://mswjs.io/docs/http/intercepting-requests
 */
export const handlers: HttpHandler[] = [
  http.get("https://gpro.net/en/backend/api/v2/Menu", ({ request }) => {
    if (isAuthorized(request)) {
      return HttpResponse.json({}, { status: 200 });
    }
    return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
  }),

  http.get("https://gpro.net/en/backend/api/v2/GetDriverProfile", ({ request }) => {
    if (isAuthorized(request)) {
      return HttpResponse.json(driverProfileFixture, { status: 200 });
    }
    return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
  }),

  http.get("https://gpro.net/en/backend/api/v2/GetCar", ({ request }) => {
    if (isAuthorized(request)) {
      return HttpResponse.json(carDataFixture, { status: 200 });
    }
    return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
  }),
];
