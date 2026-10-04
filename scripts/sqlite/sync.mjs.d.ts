import type { DatabaseSync } from 'node:sqlite'

export function openFlashcardsDb(file?: string): DatabaseSync
export function applySchema(db: DatabaseSync): void
export function seedDatabase(db: DatabaseSync): Promise<{ cards: number; glossary: number }>
export function cardsFromDb(db: DatabaseSync): unknown[]
export function glossaryFromDb(db: DatabaseSync, versionId?: string): unknown[]
export function exportStatic(db: DatabaseSync): Promise<{ cards: number; glossary: number }>
