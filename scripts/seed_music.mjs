/**
 * Music Seeding Script
 * This script populates your database with musical tracks from different mood quadrants.
 * Run this while your Next.js server is running: npm run dev
 */

const SAMPLE_DATA = [
  // Happy / High Energy
  { artist: "NewJeans", track: "Ditto", cover_url: "https://lastfm.freetls.fastly.net/i/u/300x300/29e1eb04a29a5089f81ac42e2329cbc5.png" },
  { artist: "Pharrell Williams", track: "Happy" },
  { artist: "Dua Lipa", track: "Levitating" },
  
  // Sad / Melancholy
  { artist: "Adele", track: "Someone Like You" },
  { artist: "Billie Eilish", track: "when the party's over" },
  { artist: "Radiohead", track: "Creep" },
  
  // Calm / Relaxing
  { artist: "Nujabes", track: "Luv(sic) pt3" },
  { artist: "Debussy", track: "Clair de Lune" },
  { artist: "Norah Jones", track: "Don't Know Why" },
  
  // Energetic / Intense (Angry/Tense)
  { artist: "Linkin Park", track: "In the End" },
  { artist: "Metallica", track: "Enter Sandman" },
  { artist: "System of a Down", track: "Chop Suey!" }
];

async function syncTrack(item) {
  try {
    console.log(`Syncing: ${item.artist} - ${item.track}...`);
    // Note: Using port 3001 as 3000 is occupied in your environment
    const response = await fetch("http://localhost:3001/api/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item)
    });
    
    const result = await response.json();
    if (result.success) {
      console.log(`✅ Success: ${item.track}`);
    } else {
      console.log(`❌ Failed: ${item.track} - ${result.error}`);
    }
  } catch (err) {
    console.error(`💥 Error syncing ${item.track}:`, err.message);
  }
}

async function seed() {
  console.log("🚀 Starting parallel music data synchronization...");
  
  // Process all tracks in parallel
  await Promise.all(SAMPLE_DATA.map(item => syncTrack(item)));
  
  console.log("\n✨ Data seeding complete!");
}

seed();
