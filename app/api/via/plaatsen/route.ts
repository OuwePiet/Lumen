// Shared geographic lookup for VIA Wereldkalender and De WereldSpiegel.
// Both products use the same GeoNames source, country codes and location records.
// The existing WereldSpiegel endpoint remains available for compatibility.
export { GET, runtime, dynamic } from "../../wereldspiegel/plaatsen/route";
