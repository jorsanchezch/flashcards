import {
  GROUP_DISPLAY_NAME,
  GROUP_DOCUMENT_USER_ID,
  isGroupDocument,
  isGuestDocument,
  type CardProgressEntry,
  type RosterUser,
  type UserDocument,
} from '@/lib/userData'

export type MemberProgressStats = {
  known: number
  unknown: number
  reviewed: number
  unseen: number
  total: number
}

export type TeamMemberEntry = {
  displayName: string
  updatedAt: string | null
  known: number
  unknown: number
  unseen: number
  reviewed?: number
}

export type TeamGroupProgress = TeamMemberEntry & {
  progress: Record<string, CardProgressEntry>
}

export type TeamProgressFile = {
  schemaVersion: number
  updatedAt: string
  totalCards: number
  members: Record<string, TeamMemberEntry>
  group?: TeamGroupProgress
}

export async function loadPublishedTeamProgress(): Promise<TeamProgressFile | null> {
  try {
    const base = import.meta.env.BASE_URL
    const res = await fetch(`${base}data/team-progress.json`)
    if (!res.ok) return null
    const data = (await res.json()) as TeamProgressFile
    if (!data.members || typeof data.members !== 'object') return null
    return data
  } catch {
    return null
  }
}

export function computeStatsFromUserDoc(
  doc: UserDocument,
  totalCards: number,
): MemberProgressStats {
  let known = 0
  let unknown = 0
  let reviewed = 0
  for (const entry of Object.values(doc.progress)) {
    if (entry.status === 'known') known += 1
    else if (entry.status === 'unknown') unknown += 1
    else if (entry.status === 'reviewed') reviewed += 1
  }
  const unseen = Math.max(0, totalCards - known - unknown - reviewed)
  return { known, unknown, reviewed, unseen, total: totalCards }
}

export function memberEntryFromStats(
  displayName: string,
  stats: MemberProgressStats,
  updatedAt: string | null,
): TeamMemberEntry {
  return {
    displayName,
    updatedAt,
    known: stats.known,
    unknown: stats.unknown,
    unseen: stats.unseen,
    reviewed: stats.reviewed,
  }
}

export function groupEntryFromDoc(
  doc: UserDocument,
  totalCards: number,
): TeamGroupProgress {
  const stats = computeStatsFromUserDoc(doc, totalCards)
  return {
    ...memberEntryFromStats(GROUP_DISPLAY_NAME, stats, doc.updatedAt),
    progress: doc.progress,
  }
}

export function mergeGroupDocWithPublished(
  local: UserDocument,
  file: TeamProgressFile,
): UserDocument {
  const published = file.group
  if (!published?.progress || typeof published.progress !== 'object') {
    return local
  }
  const localCount = Object.keys(local.progress).length
  const pubCount = Object.keys(published.progress).length
  if (pubCount === 0) return local
  if (localCount === 0) {
    return {
      ...local,
      userId: GROUP_DOCUMENT_USER_ID,
      displayName: GROUP_DISPLAY_NAME,
      progress: published.progress,
      updatedAt: published.updatedAt ?? local.updatedAt,
    }
  }
  const localAt = local.updatedAt ?? ''
  const pubAt = published.updatedAt ?? ''
  if (pubAt && pubAt > localAt) {
    return {
      ...local,
      userId: GROUP_DOCUMENT_USER_ID,
      displayName: GROUP_DISPLAY_NAME,
      progress: published.progress,
      updatedAt: published.updatedAt ?? local.updatedAt,
    }
  }
  return local
}

export function mergeTeamProgressWithRoster(
  file: TeamProgressFile,
  roster: RosterUser[],
  totalCards: number,
): TeamProgressFile {
  const members: Record<string, TeamMemberEntry> = { ...file.members }
  for (const user of roster) {
    if (!members[user.id]) {
      members[user.id] = memberEntryFromStats(user.displayName, {
        known: 0,
        unknown: 0,
        reviewed: 0,
        unseen: totalCards,
        total: totalCards,
      }, null)
    } else {
      members[user.id] = {
        ...members[user.id],
        displayName: user.displayName,
      }
    }
  }
  return {
    ...file,
    totalCards,
    members,
  }
}

export function applyLiveUserToTeamFile(
  file: TeamProgressFile,
  userDoc: UserDocument,
  totalCards: number,
): TeamProgressFile {
  if (isGroupDocument(userDoc)) {
    return applyLiveGroupToTeamFile(file, userDoc, totalCards)
  }
  const stats = computeStatsFromUserDoc(userDoc, totalCards)
  const members = {
    ...file.members,
    [userDoc.userId]: memberEntryFromStats(
      userDoc.displayName,
      stats,
      userDoc.updatedAt,
    ),
  }
  return {
    ...file,
    totalCards,
    members,
    updatedAt: new Date().toISOString(),
  }
}

export function applyLiveGroupToTeamFile(
  file: TeamProgressFile,
  groupDoc: UserDocument,
  totalCards: number,
): TeamProgressFile {
  return {
    ...file,
    totalCards,
    group: groupEntryFromDoc(groupDoc, totalCards),
    updatedAt: new Date().toISOString(),
  }
}

function liveDocForPublishedTeam(
  liveUserDoc: UserDocument | null,
  roster: RosterUser[],
): UserDocument | null {
  if (!liveUserDoc || isGuestDocument(liveUserDoc)) return null
  if (!roster.some((u) => u.id === liveUserDoc.userId)) return null
  return liveUserDoc
}

export function statsFromMemberEntry(
  entry: TeamMemberEntry | undefined,
  totalCards: number,
): MemberProgressStats {
  if (!entry) {
    return {
      known: 0,
      unknown: 0,
      reviewed: 0,
      unseen: totalCards,
      total: totalCards,
    }
  }
  const reviewed =
    typeof entry.reviewed === 'number'
      ? entry.reviewed
      : Math.max(0, totalCards - entry.known - entry.unknown - entry.unseen)
  return {
    known: entry.known,
    unknown: entry.unknown,
    reviewed,
    unseen: entry.unseen,
    total: totalCards,
  }
}

export function buildTeamRows(
  file: TeamProgressFile,
  roster: RosterUser[],
  totalCards: number,
  liveUserDoc: UserDocument | null,
): {
  userId: string
  displayName: string
  stats: MemberProgressStats
  updatedAt: string | null
  isLive: boolean
}[] {
  const liveForTeam = liveDocForPublishedTeam(liveUserDoc, roster)
  const merged = liveForTeam
    ? applyLiveUserToTeamFile(file, liveForTeam, totalCards)
    : mergeTeamProgressWithRoster(file, roster, totalCards)

  return roster
    .map((user) => {
      const entry = merged.members[user.id]
      const stats = statsFromMemberEntry(entry, totalCards)
      return {
        userId: user.id,
        displayName: user.displayName,
        stats,
        updatedAt: entry?.updatedAt ?? null,
        isLive: liveForTeam?.userId === user.id,
      }
    })
    .sort((a, b) => {
      const aDone = a.stats.known + a.stats.reviewed
      const bDone = b.stats.known + b.stats.reviewed
      if (bDone !== aDone) return bDone - aDone
      if (a.stats.unseen !== b.stats.unseen) return a.stats.unseen - b.stats.unseen
      return a.displayName.localeCompare(b.displayName, 'es', {
        sensitivity: 'base',
      })
    })
}

export function mergePublishedTeamExport(
  file: TeamProgressFile,
  roster: RosterUser[],
  totalCards: number,
  liveUserDoc: UserDocument | null,
  liveGroupDoc: UserDocument | null,
): TeamProgressFile {
  let result = mergeTeamProgressWithRoster(file, roster, totalCards)
  const live = liveDocForPublishedTeam(liveUserDoc, roster)
  if (live) {
    result = applyLiveUserToTeamFile(result, live, totalCards)
  }
  const groupSource =
    liveGroupDoc && isGroupDocument(liveGroupDoc)
      ? liveGroupDoc
      : liveUserDoc && isGroupDocument(liveUserDoc)
        ? liveUserDoc
        : null
  if (groupSource && Object.keys(groupSource.progress).length > 0) {
    result = applyLiveGroupToTeamFile(result, groupSource, totalCards)
  } else if (file.group) {
    result = { ...result, group: file.group }
  }
  return {
    ...result,
    updatedAt: new Date().toISOString(),
    totalCards,
  }
}

export function downloadTeamProgressFile(file: TeamProgressFile) {
  const blob = new Blob([JSON.stringify(file, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'team-progress.json'
  a.click()
  URL.revokeObjectURL(url)
}
