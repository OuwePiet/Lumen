/** Verified against the Holy See's published 6–17 November 2026 itinerary.
 * This is a planned itinerary, NOT a live location tracker.
 * No external fetch, API key, image hotlink, or paid service.
 */
export const PAPAL_ITINERARY_SOURCE = "https://press.vatican.va/content/leo-xiv/en/travels/2026/documents/uruguay-argentina-peru-6-17novembre2026.html"
export const PAPAL_JOURNEY_2026 = [
  { day:6, country:"UY", place:"Montevideo", detail:"16:30 arrival · 17:30 welcome ceremony" },
  { day:7, country:"UY", place:"Montevideo · Paysandú", detail:"10:00 Mass in Paysandú · 19:00 prayer vigil in Montevideo" },
  { day:8, country:"UY", place:"Florida · Montevideo", detail:"10:30 Mass in Florida · departure to Argentina" },
  { day:8, country:"AR", place:"Buenos Aires", detail:"16:30 arrival · 17:20 welcome ceremony" },
  { day:9, country:"AR", place:"Claypole · Buenos Aires", detail:"09:15 visit to Claypole · 11:30 Mass in Buenos Aires" },
  { day:10, country:"AR", place:"Córdoba · Buenos Aires", detail:"10:00 Mass in Córdoba · 20:15 youth vigil in Buenos Aires" },
  { day:11, country:"AR", place:"Buenos Aires · Luján", detail:"10:00 Mass in Luján · departure to Peru" },
  { day:11, country:"PE", place:"Callao · Lima", detail:"17:30 arrival in Callao · 18:15 welcome in Lima" },
  { day:12, country:"PE", place:"Lima", detail:"10:20 cathedral prayer · 18:00 youth prayer vigil" },
  { day:13, country:"PE", place:"Chiclayo · Pimentel", detail:"10:30 Mass near Pampas de Pimentel" },
  { day:14, country:"PE", place:"Chiclayo · Santa Cruz de Succhabamba", detail:"11:00 Mass in Santa Cruz de Succhabamba" },
  { day:15, country:"PE", place:"Cusco · Pucallpa · Lima", detail:"11:45 Angelus in Cusco · 16:45 Mass in Pucallpa" },
  { day:16, country:"PE", place:"Lima · Callao", detail:"10:30 Mass · 13:45 departure for Rome" },
  { day:17, country:"IT", place:"Rome", detail:"10:25 scheduled arrival at Rome/Fiumicino" },
] as const
