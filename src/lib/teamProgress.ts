import type { RosterUser, UserDocument } from '@/lib/userData'

export type MemberProgressStats = {
  known: number
  unknown: number
  unseen: number
  total: number
}

export type TeamMemberEntry = {
  displayName: string
  updatedAt: string | null
  known: number
  unknown: number
  unseen: number
}

export type TeamProgressFile = {
  schemaVersion: number
  updatedAt: string
  totalCards: number
  members: Record<string, TeamMemberEntry>
}

export function computeStatsFromUserDoc(
  doc: UserDocument,
  totalCards: number,
): MemberProgressStats {
  let known = 0
  let unknown = 0
  for (const entry of Object.values(doc.progress)) {
    if (entry.status === 'known') known += 1
    else if (entry.status === 'unknown') unknown += 1
  }
  const unseen = Math.max(0, totalCards - known - unknown)
  return { known, unknown, unseen, total: totalCards }
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
  }
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
  const merged = liveUserDoc
    ? applyLiveUserToTeamFile(file, liveUserDoc, totalCards)
    : mergeTeamProgressWithRoster(file, roster, totalCards)

  return roster
    .map((user) => {
      const entry = merged.members[user.id]
      const stats: MemberProgressStats = entry
        ? {
            known: entry.known,
            unknown: entry.unknown,
            unseen: entry.unseen,
            total: totalCards,
          }
        : {
            known: 0,
            unknown: 0,
            unseen: totalCards,
            total: totalCards,
          }
      return {
        userId: user.id,
        displayName: user.displayName,
        stats,
        updatedAt: entry?.updatedAt ?? null,
        isLive: liveUserDoc?.userId === user.id,
      }
    })
    .sort((a, b) =>
      a.displayName.localeCompare(b.displayName, 'es', { sensitivity: 'base' }),
    )
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
