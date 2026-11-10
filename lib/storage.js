import { Redis } from '@upstash/redis';

let client;
function getRedis() {
  if (!client) {
    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;
    if (!url || !token) throw new Error('KV_REST_API_URL / KV_REST_API_TOKEN belum diset.');
    client = new Redis({ url, token });
  }
  return client;
}

const parseJson = (value) => (typeof value === 'string' ? JSON.parse(value) : value);

const EVENTS_KEY = 'events';

// HARUS sama persis dengan skema di project form pendaftaran.
const regKeys = (id) => ({
  members: `reg:{${id}}:members`,
  data: `reg:{${id}}:data`,
  counter: `reg:{${id}}:counter`,
  free: `reg:{${id}}:free`,
});

// ---------- event ----------
export async function getEvents() {
  const all = await getRedis().hgetall(EVENTS_KEY);
  if (!all) return [];
  return Object.values(all)
    .map(parseJson)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}

export async function getEvent(id) {
  const value = await getRedis().hget(EVENTS_KEY, id);
  return value ? parseJson(value) : null;
}

/** true jika berhasil dibuat, false jika ID sudah dipakai (HSETNX atomik). */
export async function createEvent(event) {
  const created = await getRedis().hsetnx(EVENTS_KEY, event.id, JSON.stringify(event));
  return created === 1;
}

export async function saveEvent(event) {
  await getRedis().hset(EVENTS_KEY, { [event.id]: JSON.stringify(event) });
}

/** Hapus event beserta seluruh key pendaftarannya. Hanya dipanggil jika pendaftar = 0. */
export async function deleteEvent(id) {
  const k = regKeys(id);
  await getRedis()
    .pipeline()
    .hdel(EVENTS_KEY, id)
    .del(k.members, k.data, k.counter, k.free)
    .exec();
}

// KEYS: events, members, data, counter, free | ARGV: id, jumlahPendaftarYangDiharapkan
// Hapus hanya jika jumlah pendaftar masih sama dengan yang sudah diarsipkan.
const DELETE_IF_UNCHANGED_SCRIPT = `
if redis.call('HLEN', KEYS[2]) ~= tonumber(ARGV[2]) then
  return 0
end
redis.call('HDEL', KEYS[1], ARGV[1])
redis.call('DEL', KEYS[2], KEYS[3], KEYS[4], KEYS[5])
return 1
`;

export async function deleteEventIfUnchanged(id, expectedCount) {
  const k = regKeys(id);
  const deleted = await getRedis().eval(
    DELETE_IF_UNCHANGED_SCRIPT,
    [EVENTS_KEY, k.members, k.data, k.counter, k.free],
    [id, expectedCount],
  );
  return deleted === 1;
}

// ---------- pendaftar ----------
export async function countRegistrants(id) {
  return Number(await getRedis().hlen(regKeys(id).members));
}

export async function getRegistrantCounts(events) {
  if (events.length === 0) return {};
  const pipeline = getRedis().pipeline();
  for (const event of events) pipeline.hlen(regKeys(event.id).members);
  const counts = await pipeline.exec();
  return Object.fromEntries(events.map((event, i) => [event.id, Number(counts[i])]));
}

/** Daftar pendaftar urut nomor: [{ number, name, discord, whatsapp, note, createdAt }] */
export async function listRegistrants(id) {
  const all = await getRedis().hgetall(regKeys(id).data);
  if (!all) return [];
  return Object.entries(all)
    .map(([number, value]) => ({ number: Number(number), ...parseJson(value) }))
    .sort((a, b) => a.number - b.number);
}

// ---------- throttle login (per IP) ----------
const MAX_FAILURES = 5;
const WINDOW_SECONDS = 15 * 60;
const failKey = (ip) => `admin:loginfail:${ip}`;

export async function isLoginBlocked(ip) {
  return Number((await getRedis().get(failKey(ip))) ?? 0) >= MAX_FAILURES;
}

export async function recordLoginFailure(ip) {
  const redis = getRedis();
  const count = await redis.incr(failKey(ip));
  if (count === 1) await redis.expire(failKey(ip), WINDOW_SECONDS);
}

export async function clearLoginFailures(ip) {
  await getRedis().del(failKey(ip));
}