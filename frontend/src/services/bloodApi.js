/* BloodAPI service — fetches supplemental donor data from randomuser.me */

const API_URL        = "https://randomuser.me/api/";
const CACHE_KEY      = "bloodConnect_apiCache";
const CACHE_TIME_KEY = "bloodConnect_apiCacheTime";
const CACHE_TTL_MS   = 60 * 60 * 1000; // 1 hour

const ALL_BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const CITIES = [
  "Delhi","Mumbai","Bangalore","Chennai","Hyderabad","Pune","Ahmedabad","Jaipur",
  "Lucknow","Chandigarh","Kolkata","Surat","Bhopal","Kochi","Nagpur","Indore",
  "Patna","Vadodara","Coimbatore","Visakhapatnam","Gurgaon","Noida","Agra",
  "Varanasi","Meerut","Rajkot","Nashik","Aurangabad","Jodhpur","Mysore",
  "Amritsar","Faridabad","Ghaziabad","Ranchi","Thiruvananthapuram",
];

function readCache() {
  try {
    const timeStr = localStorage.getItem(CACHE_TIME_KEY);
    if (!timeStr) return null;
    if (Date.now() - parseInt(timeStr, 10) > CACHE_TTL_MS) return null;
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : null;
  } catch { return null; }
}

function writeCache(donors) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(donors));
    localStorage.setItem(CACHE_TIME_KEY, String(Date.now()));
  } catch { /* best effort */ }
}

function transformUser(user, index) {
  const bloodGroup = ALL_BLOOD_GROUPS[index % ALL_BLOOD_GROUPS.length];
  const city = CITIES[Math.floor(Math.random() * CITIES.length)];
  const monthsAgo = Math.floor(Math.random() * 16) + 2;
  const lastDate = new Date();
  lastDate.setMonth(lastDate.getMonth() - monthsAgo);
  return {
    id:               "api_" + user.login.uuid,
    name:             user.name.first + " " + user.name.last,
    age:              user.dob.age,
    bloodGroup,
    phone:            user.phone.replace(/[^0-9]/g, "").slice(-10).padStart(10, "9"),
    email:            user.email,
    location:         city,
    lastDonationDate: lastDate.toISOString().split("T")[0],
    eligible:         true,
    source:           "api",
    avatarUrl:        user.picture.medium,
    createdAt:        new Date().toISOString(),
  };
}

async function fetchFromAPI() {
  try {
    const res = await fetch(API_URL + "?results=40&nat=in&inc=name,email,phone,dob,picture,login");
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.results || !Array.isArray(data.results)) return [];
    const donors = data.results.map(transformUser);
    writeCache(donors);
    return donors;
  } catch { return []; }
}

export async function getDonorsByBloodGroup(bloodGroup) {
  const cached = readCache() || await fetchFromAPI();
  return bloodGroup ? cached.filter((d) => d.bloodGroup === bloodGroup) : cached;
}

export async function getAllDonorsFromAPI() {
  return readCache() || fetchFromAPI();
}

export async function getNearbyHospitals(query, city = "") {
  const q = encodeURIComponent("hospital " + query + (city ? " " + city : ""));
  const url = `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=6&addressdetails=1&countrycodes=in`;
  try {
    const r = await fetch(url, { headers: { "Accept-Language": "en" } });
    const results = await r.json();
    return (results || []).map((item) => {
      const parts = item.display_name.split(",");
      return { name: parts[0].trim(), address: parts.slice(1, 3).join(",").trim() };
    });
  } catch { return []; }
}

export async function getCityFromCoords(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
  try {
    const r = await fetch(url, { headers: { "Accept-Language": "en" } });
    const data = await r.json();
    return (
      data.address?.city ||
      data.address?.town ||
      data.address?.county ||
      data.address?.state ||
      ""
    );
  } catch { return ""; }
}
