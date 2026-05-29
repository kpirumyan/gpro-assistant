import { http, HttpResponse, type HttpHandler } from "msw";
import driverProfileFixture from "@/lib/gpro/__fixtures__/driver-profile.json";
import carDataFixture from "@/lib/gpro/__fixtures__/car-data.json";
import calendarFixture from "@/lib/gpro/__fixtures__/calendar.json";
import raceAnalysisFixture from "@/lib/gpro/__fixtures__/race-analysis.json";
import historyCalendarFixture from "@/lib/gpro/__fixtures__/history-calendar.json";
import trackProfileFixture from "@/lib/gpro/__fixtures__/track-profile.json";

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

  http.get("https://gpro.net/en/backend/api/v2/Calendar", ({ request }) => {
    if (isAuthorized(request)) {
      return HttpResponse.json(calendarFixture, { status: 200 });
    }
    return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
  }),

  http.get("https://gpro.net/en/backend/api/v2/DriProfile", ({ request }) => {
    if (isAuthorized(request)) {
      return HttpResponse.json(driverProfileFixture, { status: 200 });
    }
    return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
  }),

  http.get("https://gpro.net/en/backend/api/v2/UpdateCar", ({ request }) => {
    if (isAuthorized(request)) {
      return HttpResponse.json(carDataFixture, { status: 200 });
    }
    return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
  }),

  http.get("https://gpro.net/en/backend/api/v2/RaceAnalysis", ({ request }) => {
    if (!isAuthorized(request)) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = new URL(request.url);
    const sr = url.searchParams.get("SR");
    
    if (sr === "99,1") {
      return HttpResponse.json(raceAnalysisFixture, { status: 200 });
    }

    if (sr === "1,1") {
      return HttpResponse.json({ error: "Not Found" }, { status: 404 });
    }

    return HttpResponse.json({ error: "Not Found" }, { status: 404 });
  }),

  http.get("https://gpro.net/en/backend/api/v2/HistoryCalendar", ({ request }) => {
    if (isAuthorized(request)) {
      return HttpResponse.json(historyCalendarFixture, { status: 200 });
    }
    return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
  }),

  http.get("https://gpro.net/en/backend/api/v2/TrackProfile", ({ request }) => {
    if (isAuthorized(request)) {
      return HttpResponse.json(trackProfileFixture, { status: 200 });
    }
    return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
  }),
];
