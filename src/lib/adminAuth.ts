const PEPPER = 'flashcards-admin:v1:'
const LOCAL_HASH_PREFIX = 'flashcards-admin-hash-v1:'

export type AdminRecord = {
  id: string
  passwordSha256: string
}

type AdminsFile = {
  admins: AdminRecord[]
}

let cachedAdmins: AdminRecord[] | null = null

export async function hashAdminSecret(secret: string): Promise<string> {
  const data = new TextEncoder().encode(`${PEPPER}${secret}`)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(buf)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function loadAdminRecords(): Promise<AdminRecord[]> {
  if (cachedAdmins) return cachedAdmins
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}data/admins.json`)
    if (!res.ok) {
      cachedAdmins = []
      return cachedAdmins
    }
    const data = (await res.json()) as AdminsFile
    const list = Array.isArray(data.admins) ? data.admins : []
    cachedAdmins = list.filter(
      (row) =>
        row &&
        typeof row.id === 'string' &&
        typeof row.passwordSha256 === 'string' &&
        row.passwordSha256.length > 0,
    )
    return cachedAdmins
  } catch {
    cachedAdmins = []
    return cachedAdmins
  }
}

export function isAdminUserId(userId: string | null | undefined, admins: AdminRecord[]): boolean {
  if (!userId) return false
  return admins.some((a) => a.id === userId)
}

function localHashKey(userId: string) {
  return `${LOCAL_HASH_PREFIX}${userId}`
}

export function readLocalAdminHash(userId: string): string | null {
  try {
    return localStorage.getItem(localHashKey(userId))
  } catch {
    return null
  }
}

export function writeLocalAdminHash(userId: string, hash: string) {
  localStorage.setItem(localHashKey(userId), hash)
}

export function publishedHashFor(
  userId: string,
  admins: AdminRecord[],
): string | null {
  const row = admins.find((a) => a.id === userId)
  return row?.passwordSha256 ?? null
}

export async function verifyAdminSecret(
  userId: string,
  secret: string,
  admins: AdminRecord[],
): Promise<boolean> {
  const expected = publishedHashFor(userId, admins) ?? readLocalAdminHash(userId)
  if (!expected) return false
  const actual = await hashAdminSecret(secret)
  return actual === expected
}

export async function setupAdminSecretIfMissing(
  userId: string,
  secret: string,
  admins: AdminRecord[],
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (publishedHashFor(userId, admins) || readLocalAdminHash(userId)) {
    return { ok: false, message: 'Esta cuenta ya tiene clave.' }
  }
  const trimmed = secret.trim()
  if (trimmed.length < 4) {
    return { ok: false, message: 'La clave es demasiado corta.' }
  }
  writeLocalAdminHash(userId, await hashAdminSecret(trimmed))
  return { ok: true }
}

export function adminNeedsPasswordSetup(
  userId: string,
  admins: AdminRecord[],
): boolean {
  return isAdminUserId(userId, admins) && !publishedHashFor(userId, admins) && !readLocalAdminHash(userId)
}
