import type { KingRecord } from '@/lib/kingsTimelineData'

/** Evaluación según la fórmula de 1–2 Reyes (redacción cercana a NTV). */
export type LordStand = 'righteous' | 'evil' | 'mixed' | 'not_applicable'

export type KingAges = {
  /** Edad al comenzar a reinar, si el texto lo indica. */
  accessionAge?: number
  /** Años de reinado según el relato. */
  reignYears?: number
  /** Edad al morir, si se deduce o se menciona. */
  deathAge?: number
}

export type KingEnrichment = {
  ages?: KingAges
  lordStand: LordStand
  lordVerdict: string
}

export const KING_ENRICHMENT: Record<string, KingEnrichment> = {
  solomon: {
    ages: { reignYears: 40 },
    lordStand: 'mixed',
    lordVerdict:
      'Siguió al Señor como David su padre, pero en sus últimos años su corazón se apartó; el relato dice que hizo lo malo ante los ojos del Señor y no siguió plenamente al Señor como David (1 Reyes 11:4-6).',
  },
  rehoboam: {
    ages: { accessionAge: 41, reignYears: 17, deathAge: 58 },
    lordStand: 'evil',
    lordVerdict:
      'Hizo lo malo ante los ojos del Señor y se rebeló contra el Señor; no tuvo el corazón dispuesto a buscar al Señor (1 Reyes 14:22-24).',
  },
  'jeroboam-i': {
    ages: { reignYears: 22 },
    lordStand: 'evil',
    lordVerdict:
      'Hizo lo malo ante los ojos del Señor y pecó más que todos los que fueron antes de él (1 Reyes 14:9).',
  },
  abijah: {
    ages: { reignYears: 3 },
    lordStand: 'mixed',
    lordVerdict:
      'Cometió todos los pecados que su padre había cometido; aun así, en la batalla contra Jeroboam confió en el Señor (1 Reyes 15:3; 2 Crónicas 13:18).',
  },
  nadab: {
    ages: { reignYears: 2 },
    lordStand: 'evil',
    lordVerdict:
      'Hizo lo malo ante los ojos del Señor y siguió el ejemplo de su padre y en su pecado hizo pecar a Israel (1 Reyes 15:26).',
  },
  asa: {
    ages: { accessionAge: 41, reignYears: 41, deathAge: 82 },
    lordStand: 'righteous',
    lordVerdict:
      'Hizo lo recto ante los ojos del Señor, como David su antepasado; quitó los altares extraños, aunque no quitó todos los altares de las colinas (1 Reyes 15:11-14).',
  },
  baasha: {
    ages: { reignYears: 24 },
    lordStand: 'evil',
    lordVerdict:
      'Hizo lo malo ante los ojos del Señor y siguió el camino de Jeroboam, haciendo pecar a Israel (1 Reyes 15:34).',
  },
  elah: {
    ages: { reignYears: 2 },
    lordStand: 'evil',
    lordVerdict:
      'Hizo lo malo ante los ojos del Señor y siguió el ejemplo de su padre, en su pecado y en el pecado con que hizo pecar a Israel (1 Reyes 16:19).',
  },
  zimri: {
    ages: { reignYears: 0 },
    lordStand: 'evil',
    lordVerdict:
      'Reinó solo siete días; hizo lo malo ante los ojos del Señor y siguió el ejemplo de Jeroboam (1 Reyes 16:19).',
  },
  omri: {
    ages: { reignYears: 12 },
    lordStand: 'evil',
    lordVerdict:
      'Hizo lo malo ante los ojos del Señor, peor que todos los que fueron antes de él (1 Reyes 16:25).',
  },
  ahab: {
    ages: { reignYears: 22 },
    lordStand: 'evil',
    lordVerdict:
      'Hizo lo malo ante los ojos del Señor, más que todos los que fueron antes de él; siguió a Jezabel y sirvió a Baal (1 Reyes 16:30-33).',
  },
  jehoshaphat: {
    ages: { accessionAge: 35, reignYears: 25, deathAge: 60 },
    lordStand: 'righteous',
    lordVerdict:
      'Hizo lo recto ante los ojos del Señor, aunque no quitó los altares de las colinas y el pueblo aún ofrecía sacrificios allí (1 Reyes 22:43).',
  },
  'ahaziah-israel': {
    ages: { reignYears: 2 },
    lordStand: 'evil',
    lordVerdict:
      'Hizo lo malo ante los ojos del Señor y siguió el ejemplo de la familia de Acab (2 Reyes 1:2).',
  },
  'ahaziah-judah': {
    ages: { accessionAge: 22, reignYears: 1 },
    lordStand: 'evil',
    lordVerdict:
      'Siguió el ejemplo de la casa de Acab e hizo lo malo ante los ojos del Señor, como la casa de Acab (2 Reyes 8:27).',
  },
  'joram-israel': {
    ages: { reignYears: 12 },
    lordStand: 'evil',
    lordVerdict:
      'Hizo lo malo ante los ojos del Señor, aunque quitó el pilar sagrado de Baal; se aferró al pecado de Jeroboam (2 Reyes 3:2-3).',
  },
  'jehoram-judah': {
    ages: { accessionAge: 32, reignYears: 8, deathAge: 40 },
    lordStand: 'evil',
    lordVerdict:
      'Hizo lo malo ante los ojos del Señor y siguió los pasos de los reyes de Israel, como la casa de Acab (2 Reyes 8:18).',
  },
  athaliah: {
    ages: { reignYears: 6 },
    lordStand: 'evil',
    lordVerdict:
      'Usurpó el trono y destruyó a la descendencia real; promovió el culto de Baal en el reinado de su esposo (2 Reyes 11:1; 2 Crónicas 22:10).',
  },
  jehu: {
    ages: { reignYears: 28 },
    lordStand: 'mixed',
    lordVerdict:
      'Destruyó a la familia de Acab y el culto de Baal, pero no siguió de todo corazón la ley del Señor y siguió el pecado de Jeroboam (2 Reyes 10:30-31).',
  },
  'joash-judah': {
    ages: { accessionAge: 7, reignYears: 40, deathAge: 47 },
    lordStand: 'mixed',
    lordVerdict:
      'Hizo lo recto mientras vivió el sacerdote Joiada; después abandonó la casa del Señor y sirvió a los postes sagrados y a las imágenes de Asera (2 Reyes 12:2; 2 Crónicas 24:17-18).',
  },
  'hazael-aram': {
    lordStand: 'not_applicable',
    lordVerdict:
      'Rey extranjero; 1–2 Reyes no aplican la fórmula de «recto/malo ante los ojos del Señor» a los reyes de Aram.',
  },
  'jehoahaz-israel': {
    ages: { reignYears: 17 },
    lordStand: 'evil',
    lordVerdict:
      'Hizo lo malo ante los ojos del Señor y siguió el pecado de Jeroboam, que hizo pecar a Israel (2 Reyes 13:2).',
  },
  'jehoash-israel': {
    ages: { reignYears: 16 },
    lordStand: 'evil',
    lordVerdict:
      'Hizo lo malo ante los ojos del Señor y no se apartó de los pecados de Jeroboam (2 Reyes 13:11).',
  },
  amaziah: {
    ages: { accessionAge: 25, reignYears: 29, deathAge: 54 },
    lordStand: 'mixed',
    lordVerdict:
      'Al principio hizo lo recto ante los ojos del Señor, aunque no de todo corazón; después adoró dioses de Edom (2 Reyes 14:3-4; 2 Crónicas 25:14).',
  },
  'jeroboam-ii': {
    ages: { reignYears: 41 },
    lordStand: 'evil',
    lordVerdict:
      'Hizo lo malo ante los ojos del Señor y no se apartó de los pecados de Jeroboam (2 Reyes 14:24).',
  },
  uzziah: {
    ages: { accessionAge: 16, reignYears: 52, deathAge: 68 },
    lordStand: 'righteous',
    lordVerdict:
      'Hizo lo recto ante los ojos del Señor, como Amasías su padre; no se apartó de ella sino hasta que se hizo soberbio (2 Reyes 15:3; 2 Crónicas 26:4-16).',
  },
  'zechariah-israel': {
    ages: { reignYears: 6 },
    lordStand: 'evil',
    lordVerdict:
      'Hizo lo malo ante los ojos del Señor, como sus antepasados; no se apartó de los pecados de Jeroboam (2 Reyes 15:9).',
  },
  shallum: {
    ages: { reignYears: 0 },
    lordStand: 'evil',
    lordVerdict:
      'Reinó un mes en Tirsa; el relato lo sitúa en la serie de reyes que persistieron en el pecado de Jeroboam (2 Reyes 15:13-15).',
  },
  menahem: {
    ages: { reignYears: 10 },
    lordStand: 'evil',
    lordVerdict:
      'Hizo lo malo ante los ojos del Señor; durante todo su reinado no se apartó de los pecados de Jeroboam (2 Reyes 15:18).',
  },
  pekahiah: {
    ages: { reignYears: 2 },
    lordStand: 'evil',
    lordVerdict:
      'Hizo lo malo ante los ojos del Señor y no se apartó de los pecados de Jeroboam (2 Reyes 15:24).',
  },
  pekah: {
    ages: { reignYears: 20 },
    lordStand: 'evil',
    lordVerdict:
      'Hizo lo malo ante los ojos del Señor y no se apartó de los pecados de Jeroboam (2 Reyes 15:28).',
  },
  jotham: {
    ages: { accessionAge: 25, reignYears: 16, deathAge: 41 },
    lordStand: 'righteous',
    lordVerdict:
      'Hizo lo recto ante los ojos del Señor, conforme a todo lo que había hecho su padre Uzías; aun así el pueblo seguía sacrificando en los altares de las colinas (2 Reyes 15:34-35).',
  },
  'tiglath-pileser': {
    lordStand: 'not_applicable',
    lordVerdict:
      'Rey de Asiria; instrumento del juicio sobre Israel y Aram. Sin evaluación moral al estilo de los reyes de Judá o Israel.',
  },
  rezin: {
    lordStand: 'not_applicable',
    lordVerdict:
      'Rey de Aram en tiempos de Acaz; enemigo de Judá. No recibe la fórmula de evaluación de reyes hebreos.',
  },
  ahaz: {
    ages: { accessionAge: 20, reignYears: 16, deathAge: 36 },
    lordStand: 'evil',
    lordVerdict:
      'No hizo lo recto ante los ojos del Señor, como David su antepasado; imitó a los reyes de Israel y pasó a su hijo por el fuego (2 Reyes 16:2-4).',
  },
  hoshea: {
    ages: { reignYears: 9 },
    lordStand: 'evil',
    lordVerdict:
      'Hizo lo malo ante los ojos del Señor, aunque no tanto como los reyes de Israel que fueron antes de él (2 Reyes 17:2).',
  },
  'shalmaneser-v': {
    lordStand: 'not_applicable',
    lordVerdict:
      'Rey de Asiria que tomó Samaria; el juicio sobre el reino del norte se narra en 2 Reyes 17.',
  },
  hezekiah: {
    ages: { accessionAge: 25, reignYears: 29, deathAge: 54 },
    lordStand: 'righteous',
    lordVerdict:
      'Hizo lo recto ante los ojos del Señor, conforme a todo lo que había hecho David su antepasado (2 Reyes 18:3).',
  },
  sennacherib: {
    lordStand: 'not_applicable',
    lordVerdict:
      'Rey de Asiria que invadió Judá; el relato enfatiza la liberación de Jerusalén por el Señor (2 Reyes 18–19).',
  },
  manasseh: {
    ages: { accessionAge: 12, reignYears: 55, deathAge: 67 },
    lordStand: 'evil',
    lordVerdict:
      'Hizo lo malo ante los ojos del Señor, imitando las prácticas detestables de las naciones; llenó Jerusalén de sangre inocente (2 Reyes 21:2-9).',
  },
  amon: {
    ages: { accessionAge: 22, reignYears: 2, deathAge: 24 },
    lordStand: 'evil',
    lordVerdict:
      'Hizo lo malo ante los ojos del Señor, como Manasés su padre (2 Reyes 21:20).',
  },
  josiah: {
    ages: { accessionAge: 8, reignYears: 31, deathAge: 39 },
    lordStand: 'righteous',
    lordVerdict:
      'Hizo lo recto ante los ojos del Señor y siguió en todo el camino de David su antepasado; no se apartó ni a la derecha ni a la izquierda (2 Reyes 22:2).',
  },
  'pharaoh-necho': {
    lordStand: 'not_applicable',
    lordVerdict:
      'Faraón de Egipto; mató a Josías en Meguido y dominó brevemente a Judá (2 Reyes 23:29-35).',
  },
  jehoahaz: {
    ages: { accessionAge: 23, reignYears: 0 },
    lordStand: 'evil',
    lordVerdict:
      'Hizo lo malo ante los ojos del Señor, como sus antepasados (2 Reyes 23:32).',
  },
  jehoiakim: {
    ages: { accessionAge: 25, reignYears: 11, deathAge: 36 },
    lordStand: 'evil',
    lordVerdict:
      'Hizo lo malo ante los ojos del Señor, como sus antepasados (2 Reyes 23:37).',
  },
  jehoiachin: {
    ages: { accessionAge: 18, reignYears: 0 },
    lordStand: 'evil',
    lordVerdict:
      'Hizo lo malo ante los ojos del Señor, como su padre (2 Reyes 24:9).',
  },
  zedekiah: {
    ages: { accessionAge: 21, reignYears: 11, deathAge: 32 },
    lordStand: 'evil',
    lordVerdict:
      'Hizo lo malo ante los ojos del Señor, como Joacim su hermano; no se humilló ante el profeta Jeremías (2 Reyes 24:19-20).',
  },
  shishak: {
    lordStand: 'not_applicable',
    lordVerdict:
      'Faraón de Egipto que saqueó el templo en tiempos de Roboam (1 Reyes 14:25-26).',
  },
  'ben-hadad-ii': {
    lordStand: 'not_applicable',
    lordVerdict:
      'Rey de Aram; adversario de Israel en tiempos de Acab y Joram (1 Reyes 20; 2 Reyes 6–8).',
  },
}

export function applyKingEnrichment(base: KingRecord[]): KingRecord[] {
  return base.map((king) => {
    const extra = KING_ENRICHMENT[king.id]
    if (!extra) return king
    return { ...king, ...extra }
  })
}
