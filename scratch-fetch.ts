import { db } from "./src/lib/db/index";
import { gproCredentials } from "./src/lib/db/schema";
import { fetchHistoryCalendar, fetchRaceAnalysis } from "./src/lib/gpro/client";

async function testFetch() {
  const creds = await db.query.gproCredentials.findFirst();
  if (!creds) {
    console.error("No credentials found");
    process.exit(1);
  }

  const token = creds.token;
  console.log("Token found. Testing fetchHistoryCalendar with Season 110...");

  try {
    const response = await fetch("https://gpro.net/en/backend/api/v2/History?table=Calendar&season=110", {
        headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Calendar HTTP status:", response.status);
    if (response.ok) {
        console.log("Calendar correct URL works!");
    } else {
        console.error("Calendar correct URL failed:", response.statusText);
    }
  } catch (err: unknown) {
    console.error("Calendar failed:", err instanceof Error ? err.message : String(err));
  }
  
  console.log("\nTesting fetchRaceAnalysis with S110 R10...");
  try {
    const analysis = await fetchRaceAnalysis(token, 110, 10);
    console.log("Analysis successful!");
  } catch (err: unknown) {
    console.error("Analysis failed:", err instanceof Error ? err.message : String(err));
  }
  
  process.exit(0);
}

testFetch();
