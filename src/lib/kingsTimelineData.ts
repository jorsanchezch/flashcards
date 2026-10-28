/** Reyes de Israel, Judá y potencias vecinas en 1–2 Reyes (cronología convencional aproximada). */

import { applyKingEnrichment } from '@/lib/kingsTimelineEnrichment'

export type KingdomId =
  | 'united'
  | 'judah'
  | 'israel'
  | 'aram'
  | 'assyria'
  | 'egypt'

export type KingdomMeta = {
  id: KingdomId
  label: string
  shortLabel: string
  color: string
}

export const KINGDOMS: KingdomMeta[] = [
  { id: 'united', label: 'Monarquía unida', shortLabel: 'Unida', color: 'hsl(262 55% 48%)' },
  { id: 'judah', label: 'Reino de Judá', shortLabel: 'Judá', color: 'hsl(221 70% 48%)' },
  { id: 'israel', label: 'Reino de Israel (norte)', shortLabel: 'Israel', color: 'hsl(152 45% 38%)' },
  { id: 'aram', label: 'Aram (Siria)', shortLabel: 'Aram', color: 'hsl(32 75% 44%)' },
  { id: 'assyria', label: 'Asiria', shortLabel: 'Asiria', color: 'hsl(0 62% 45%)' },
  { id: 'egypt', label: 'Egipto', shortLabel: 'Egipto', color: 'hsl(45 80% 42%)' },
]

export type KingAges = {
  accessionAge?: number
  reignYears?: number
  deathAge?: number
}

export type LordStand = 'righteous' | 'evil' | 'mixed' | 'not_applicable'

export type KingRecord = {
  id: string
  name: string
  kingdom: KingdomId
  /** Año inicial del reinado (a. C., número positivo). */
  startBc: number
  /** Año final del reinado (a. C.). */
  endBc: number
  predecessor?: string
  father?: string
  ages?: KingAges
  lordStand?: LordStand
  /** Redacción cercana a la evaluación de 1–2 Reyes (NTV). */
  lordVerdict?: string
  events: string
  /** Referencias en español (NTV en Bible Gateway). */
  passages: string[]
}

/** Desde Is-boset (2 Samuel), antes de Salomón, hasta la caída de Judá. */
export const TIMELINE_START_BC = 1020
export const TIMELINE_END_BC = 580

const KINGS_BASE: KingRecord[] = [
  {
    id: 'is-boset',
    name: 'Is-boset',
    kingdom: 'israel',
    startBc: 1010,
    endBc: 1008,
    father: 'Saúl',
    predecessor: 'Saúl',
    ages: { accessionAge: 40, reignYears: 2, deathAge: 42 },
    events:
      'Hijo de Saúl y rival de David. Abner lo proclamó rey sobre Israel en Mahanaim; reinó dos años mientras David reinaba en Hebrón sobre Judá. Recab y Baaná lo asesinaron.',
    passages: ['2 Samuel 2:8-10', '2 Samuel 4:5-8'],
  },
  {
    id: 'solomon',
    name: 'Salomón',
    kingdom: 'united',
    startBc: 970,
    endBc: 931,
    father: 'David',
    predecessor: 'David',
    events:
      'Último rey de la monarquía unida: sabiduría, templo en Jerusalén, riqueza y alianzas; al final idolatría y adversarios (Jeroboam, Rezón, Hadad). Tras su muerte la nación se divide.',
    passages: ['1 Reyes 1:1', '1 Reyes 3:1', '1 Reyes 6:1', '1 Reyes 11:1-13', '1 Reyes 11:43'],
  },
  {
    id: 'rehoboam',
    name: 'Roboam',
    kingdom: 'judah',
    startBc: 931,
    endBc: 913,
    father: 'Salomón',
    predecessor: 'Salomón',
    events:
      'Rechazó aliviar el yugo; diez tribus siguieron a Jeroboam. Guerras con Israel; invasión de Sisac de Egipto; fortificaciones en Judá.',
    passages: ['1 Reyes 12:1-24', '1 Reyes 14:21-31', '2 Crónicas 10:1'],
  },
  {
    id: 'jeroboam-i',
    name: 'Jeroboam I',
    kingdom: 'israel',
    startBc: 931,
    endBc: 910,
    predecessor: 'Reino nuevo (tras división)',
    events:
      'Primer rey del norte; altares en Betel y Dan; profeta anónimo y Ahías; castigo anunciado contra su casa.',
    passages: ['1 Reyes 12:25-33', '1 Reyes 13:1', '1 Reyes 14:1-20'],
  },
  {
    id: 'abijah',
    name: 'Abías (Abiam)',
    kingdom: 'judah',
    startBc: 913,
    endBc: 911,
    father: 'Roboam',
    events: 'Breve reinado; batalla contra Jeroboam; Judá confió en el Señor.',
    passages: ['1 Reyes 15:1-8', '2 Crónicas 13:1'],
  },
  {
    id: 'nadab',
    name: 'Nadab',
    kingdom: 'israel',
    startBc: 910,
    endBc: 909,
    father: 'Jeroboam I',
    events: 'Reinó poco; Baasa lo mató y tomó el trono.',
    passages: ['1 Reyes 15:25-31'],
  },
  {
    id: 'asa',
    name: 'Asa',
    kingdom: 'judah',
    startBc: 911,
    endBc: 870,
    father: 'Abías',
    events: 'Reformas religiosas; derrotó a Zera el cusita; conflicto con Baasa de Israel.',
    passages: ['1 Reyes 15:9-24', '2 Crónicas 14:1', '2 Crónicas 16:1'],
  },
  {
    id: 'baasha',
    name: 'Baasa',
    kingdom: 'israel',
    startBc: 909,
    endBc: 886,
    predecessor: 'Nadab',
    events: 'Exterminó la casa de Jeroboam; guerras con Asa y con Ben-adad de Aram.',
    passages: ['1 Reyes 15:27-16:7'],
  },
  {
    id: 'elah',
    name: 'Elá',
    kingdom: 'israel',
    startBc: 886,
    endBc: 885,
    father: 'Baasa',
    events: 'Asesinado por Zimri mientras el ejército sitiaba Gibetón.',
    passages: ['1 Reyes 16:8-14'],
  },
  {
    id: 'zimri',
    name: 'Zimri',
    kingdom: 'israel',
    startBc: 885,
    endBc: 885,
    predecessor: 'Elá',
    events: 'Reinó solo siete días; se quemó en el palacio al perder Tirsa.',
    passages: ['1 Reyes 16:9-20'],
  },
  {
    id: 'omri',
    name: 'Omri',
    kingdom: 'israel',
    startBc: 885,
    endBc: 874,
    predecessor: 'Zimri / lucha civil',
    events: 'Fundó Samaria como capital; política más fuerte que la de reinos anteriores.',
    passages: ['1 Reyes 16:21-28'],
  },
  {
    id: 'ahab',
    name: 'Acab',
    kingdom: 'israel',
    startBc: 874,
    endBc: 853,
    father: 'Omri',
    events:
      'Casó con Jezabel; culto a Baal; confrontación con Elías; batallas con Aram (Ramot de Galaad); muerte en batalla.',
    passages: ['1 Reyes 16:29-34', '1 Reyes 18:1', '1 Reyes 21:1', '1 Reyes 22:1-40'],
  },
  {
    id: 'jehoshaphat',
    name: 'Josafat',
    kingdom: 'judah',
    startBc: 870,
    endBc: 848,
    father: 'Asa',
    events: 'Alianza con Acab; reformas y jueces; victoria sobre Moab y Amón.',
    passages: ['1 Reyes 22:41-50', '2 Crónicas 17:1', '2 Crónicas 18:1'],
  },
  {
    id: 'ahaziah-israel',
    name: 'Ocozías (Israel)',
    kingdom: 'israel',
    startBc: 853,
    endBc: 852,
    father: 'Acab',
    events: 'Herido en Ramot; consultó a Baal-zebub; Elías lo confrontó.',
    passages: ['1 Reyes 22:51', '2 Reyes 1:1-18'],
  },
  {
    id: 'ahaziah-judah',
    name: 'Ocozías (Judá)',
    kingdom: 'judah',
    startBc: 848,
    endBc: 841,
    father: 'Josafat',
    events: 'Reinó poco; alianza con Joram de Israel; visitó Jezabel en Jezreel.',
    passages: ['2 Reyes 8:24-29', '2 Crónicas 22:1'],
  },
  {
    id: 'joram-israel',
    name: 'Joram (Israel)',
    kingdom: 'israel',
    startBc: 852,
    endBc: 841,
    father: 'Acab',
    events: 'Quitó el pilar de Baal; guerras con Moab y con Hazael de Aram; asesinado por Jehú.',
    passages: ['2 Reyes 3:1', '2 Reyes 6:24', '2 Reyes 9:1-24'],
  },
  {
    id: 'jehoram-judah',
    name: 'Joram (Judá)',
    kingdom: 'judah',
    startBc: 848,
    endBc: 841,
    father: 'Josafat',
    events: 'Matrimonio con la casa de Acab; edomitas se rebelaron; invasión filistea.',
    passages: ['2 Reyes 8:16-24', '2 Crónicas 21:1'],
  },
  {
    id: 'athaliah',
    name: 'Atalía',
    kingdom: 'judah',
    startBc: 841,
    endBc: 835,
    events: 'Destruyó a la descendencia real; Joás rescatado; derrocada por el sacerdote Joiada.',
    passages: ['2 Reyes 11:1-16', '2 Crónicas 22:10'],
  },
  {
    id: 'jehu',
    name: 'Jehú',
    kingdom: 'israel',
    startBc: 841,
    endBc: 814,
    predecessor: 'Joram',
    events:
      'Ungido para exterminar la casa de Acab; mató a Joram, Ocozías y Jezabel; destruyó el culto de Baal.',
    passages: ['2 Reyes 9:1', '2 Reyes 10:1-36'],
  },
  {
    id: 'joash-judah',
    name: 'Joás',
    kingdom: 'judah',
    startBc: 835,
    endBc: 796,
    events: 'Reparación del templo bajo Joiada; luego idolatría; asesinado.',
    passages: ['2 Reyes 11:21', '2 Reyes 12:1-21', '2 Crónicas 24:1'],
  },
  {
    id: 'hazael-aram',
    name: 'Hazael',
    kingdom: 'aram',
    startBc: 842,
    endBc: 796,
    predecessor: 'Ben-adad II',
    events: 'Oprimió a Israel por mandato profético; atacó a Gath y amenazó Jerusalén (tiempo de Joás/Joacaz).',
    passages: ['1 Reyes 19:15', '2 Reyes 8:7-15', '2 Reyes 10:32', '2 Reyes 12:17'],
  },
  {
    id: 'jehoahaz-israel',
    name: 'Joacaz',
    kingdom: 'israel',
    startBc: 814,
    endBc: 798,
    father: 'Jehú',
    events: 'Oprimido por Hazael y Ben-adad; pidió ayuda al Señor y hubo liberación parcial.',
    passages: ['2 Reyes 13:1-9'],
  },
  {
    id: 'jehoash-israel',
    name: 'Joás (Israel)',
    kingdom: 'israel',
    startBc: 798,
    endBc: 782,
    father: 'Joacaz',
    events: 'Tres victorias sobre Ben-adad; visitó al moribundo Eliseo y golpeó el suelo.',
    passages: ['2 Reyes 13:10-25'],
  },
  {
    id: 'amaziah',
    name: 'Amasías',
    kingdom: 'judah',
    startBc: 796,
    endBc: 767,
    father: 'Joás',
    events: 'Victoria sobre Edom; desafió a Jeroboam II y perdió; asesinado en Lachis.',
    passages: ['2 Reyes 14:1-22', '2 Crónicas 25:1'],
  },
  {
    id: 'jeroboam-ii',
    name: 'Jeroboam II',
    kingdom: 'israel',
    startBc: 782,
    endBc: 753,
    father: 'Joás (Israel)',
    events: 'Reinado largo y expansivo; profetas Amós y Oseas en su tiempo; aún idolatría en Israel.',
    passages: ['2 Reyes 14:23-29'],
  },
  {
    id: 'uzziah',
    name: 'Uzías (Azarías)',
    kingdom: 'judah',
    startBc: 767,
    endBc: 740,
    father: 'Amasías',
    events: 'Edificó Elat; lepra por entrar al templo; reinó con su hijo Jotam como regente.',
    passages: ['2 Reyes 15:1-7', '2 Crónicas 26:1'],
  },
  {
    id: 'zechariah-israel',
    name: 'Zacarías',
    kingdom: 'israel',
    startBc: 753,
    endBc: 752,
    father: 'Jeroboam II',
    events: 'Último de la dinastía de Jehú; asesinado por Salum.',
    passages: ['2 Reyes 15:8-12'],
  },
  {
    id: 'shallum',
    name: 'Salum',
    kingdom: 'israel',
    startBc: 752,
    endBc: 752,
    events: 'Reinó un mes; Menahem lo mató en Samaria.',
    passages: ['2 Reyes 15:13-15'],
  },
  {
    id: 'menahem',
    name: 'Menahem',
    kingdom: 'israel',
    startBc: 752,
    endBc: 742,
    events: 'Crueldad en Tifsa; tributo a Pul (Tiglat-pileser) de Asiria.',
    passages: ['2 Reyes 15:16-22'],
  },
  {
    id: 'pekahiah',
    name: 'Pekaías',
    kingdom: 'israel',
    startBc: 742,
    endBc: 740,
    father: 'Menahem',
    events: 'Asesinado por Peka, hijo de Remalías.',
    passages: ['2 Reyes 15:23-26'],
  },
  {
    id: 'pekah',
    name: 'Peka',
    kingdom: 'israel',
    startBc: 740,
    endBc: 732,
    events: 'Alianza con Rezín de Aram contra Judá; Tiglat-pileser capturó territorio y mató a Peka.',
    passages: ['2 Reyes 15:27-31', '2 Reyes 16:5'],
  },
  {
    id: 'jotham',
    name: 'Jotam',
    kingdom: 'judah',
    startBc: 740,
    endBc: 732,
    father: 'Uzías',
    events: 'Edificó la puerta superior del templo; venció a los amonitas.',
    passages: ['2 Reyes 15:32-38', '2 Crónicas 27:1'],
  },
  {
    id: 'tiglath-pileser',
    name: 'Tiglat-pileser III (Pul)',
    kingdom: 'assyria',
    startBc: 745,
    endBc: 727,
    events:
      'Expansión asiria; recibió tributo de Menahem; deportó galilea y Transjordania; Ahaz de Judá pagó tributo.',
    passages: ['2 Reyes 15:19', '2 Reyes 15:29', '2 Reyes 16:7-10'],
  },
  {
    id: 'rezin',
    name: 'Rezón',
    kingdom: 'aram',
    startBc: 750,
    endBc: 732,
    events: 'Se alió con Peka contra Acaz; Damasco cayó ante Asiria; muerte de Rezón.',
    passages: ['2 Reyes 16:5-9'],
  },
  {
    id: 'ahaz',
    name: 'Acaz',
    kingdom: 'judah',
    startBc: 732,
    endBc: 716,
    father: 'Jotam',
    events:
      'Pidió ayuda a Asiria contra Aram e Israel; altar sirio en el templo; hijo Ezequías.',
    passages: ['2 Reyes 16:1-20', '2 Crónicas 28:1'],
  },
  {
    id: 'hoshea',
    name: 'Oseas',
    kingdom: 'israel',
    startBc: 732,
    endBc: 722,
    events:
      'Último rey de Israel; conspiró con Egipto; Samaria cayó tras tres años de asedio; deportación a Asiria.',
    passages: ['2 Reyes 17:1-6', '2 Reyes 18:9-12'],
  },
  {
    id: 'shalmaneser-v',
    name: 'Salmanasar V',
    kingdom: 'assyria',
    startBc: 727,
    endBc: 722,
    events: 'Asedió Samaria; caída del reino del norte.',
    passages: ['2 Reyes 17:3-6', '2 Reyes 18:9'],
  },
  {
    id: 'hezekiah',
    name: 'Ezequías',
    kingdom: 'judah',
    startBc: 716,
    endBc: 687,
    father: 'Acaz',
    events:
      'Gran reforma y restauración del culto; revuelta contra Asiria; invasión de Senaquerib; milagro en Jerusalén.',
    passages: ['2 Reyes 18:1', '2 Reyes 20:1-21', '2 Crónicas 29:1'],
  },
  {
    id: 'sennacherib',
    name: 'Senaquerib',
    kingdom: 'assyria',
    startBc: 705,
    endBc: 681,
    events: 'Campaña contra Judá; Lachis y Libna; el ángel hirió el campamento asirio.',
    passages: ['2 Reyes 18:13', '2 Reyes 19:1-37'],
  },
  {
    id: 'manasseh',
    name: 'Manasés',
    kingdom: 'judah',
    startBc: 687,
    endBc: 642,
    father: 'Ezequías',
    events: 'Reinado largo con gran idolatría; luego humillación y reforma tardía según 2 Crónicas.',
    passages: ['2 Reyes 21:1-18', '2 Crónicas 33:1'],
  },
  {
    id: 'amon',
    name: 'Amón',
    kingdom: 'judah',
    startBc: 642,
    endBc: 640,
    father: 'Manasés',
    events: 'Reinó dos años en impiedad; asesinado por sus siervos.',
    passages: ['2 Reyes 21:19-26'],
  },
  {
    id: 'josiah',
    name: 'Josías',
    kingdom: 'judah',
    startBc: 640,
    endBc: 609,
    father: 'Amón',
    events:
      'Hallazgo del libro de la ley; gran reforma; celebración de Pascua; muerto en Meguido frente a Necao de Egipto.',
    passages: ['2 Reyes 22:1', '2 Reyes 23:1-30', '2 Crónicas 34:1'],
  },
  {
    id: 'pharaoh-necho',
    name: 'Necao II',
    kingdom: 'egypt',
    startBc: 610,
    endBc: 595,
    events: 'Mató a Josías en Meguido; puso a Joacaz y luego a Joacim; batalla en Carquemis.',
    passages: ['2 Reyes 23:29-35', '2 Crónicas 35:20'],
  },
  {
    id: 'jehoahaz',
    name: 'Joacaz',
    kingdom: 'judah',
    startBc: 609,
    endBc: 609,
    father: 'Josías',
    events: 'Reinó tres meses; depuesto y llevado a Egipto por Necao.',
    passages: ['2 Reyes 23:31-35', '2 Crónicas 36:1-4'],
  },
  {
    id: 'jehoiakim',
    name: 'Joacim',
    kingdom: 'judah',
    startBc: 609,
    endBc: 598,
    father: 'Josías',
    events: 'Tributo a Babilonia y luego rebelión; raid caldeo; muerte en el reinado.',
    passages: ['2 Reyes 23:36', '2 Reyes 24:1-7'],
  },
  {
    id: 'jehoiachin',
    name: 'Joaquín',
    kingdom: 'judah',
    startBc: 598,
    endBc: 598,
    father: 'Joacim',
    events: 'Reinó tres meses; se entregó a Nabucodonosor; deportado a Babilonia.',
    passages: ['2 Reyes 24:8-16', '2 Crónicas 36:9-10'],
  },
  {
    id: 'zedekiah',
    name: 'Sedequías',
    kingdom: 'judah',
    startBc: 597,
    endBc: 586,
    father: 'Josías',
    events:
      'Último rey de Judá; rebelión contra Babilonia; asedio y caída de Jerusalén; templo y murallas destruidos.',
    passages: ['2 Reyes 24:17', '2 Reyes 25:1-21', '2 Crónicas 36:11-21'],
  },
  {
    id: 'shishak',
    name: 'Sisac',
    kingdom: 'egypt',
    startBc: 945,
    endBc: 924,
    events: 'Invadió Judá en tiempos de Roboam; tomó los tesoros del templo.',
    passages: ['1 Reyes 14:25-28', '2 Crónicas 12:1-9'],
  },
  {
    id: 'ben-hadad-ii',
    name: 'Ben-adad II',
    kingdom: 'aram',
    startBc: 860,
    endBc: 842,
    events: 'Guerras con Acab y Joram; sitió a Samaria; Eliseo predijo liberación.',
    passages: ['1 Reyes 20:1', '2 Reyes 6:24', '2 Reyes 8:7-15'],
  },
]

export const KINGS: KingRecord[] = applyKingEnrichment(KINGS_BASE)
