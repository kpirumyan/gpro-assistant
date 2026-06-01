# ADR-009: Universal Fuel Consumption Unit (L/km)

**Context**: Fuel consumption was previously calculated and displayed as Liters per lap (L/lap). This made it impossible to compare fuel efficiency between different tracks, as track lengths vary.

**Decision**: Store and analyze fuel consumption universally as Liters per kilometer (L/km). During the race data sync, the track's lap distance is used to convert lap-based consumption into distance-based consumption.

**Consequence**: Users can now directly compare their car's fuel efficiency across all synced tracks. Historical data is migrated without data loss.
