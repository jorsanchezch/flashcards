#!/usr/bin/env python3
"""Fill glossary notes, name variants (aliases), and related terms from the deck."""

from __future__ import annotations

import json
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GLOSSARY = ROOT / "public" / "data" / "glossary.json"
CARDS = ROOT / "public" / "flashcards"
CITE = re.compile(r"\([^()\n]*\d+\s*:\s*\d+[^()\n]*,\s*NTV\)", re.I)

# Other spellings used in Spanish/English Bibles. Matching uses these aliases.
AKA: dict[str, list[str]] = {
    "aaron": ["Aaron"],
    "abdias": ["Obadiah", "Obadías"],
    "abel-bet-maaca": ["Abel Bet Maaca", "Abel Beth Maacah"],
    "abiam": ["Abijam", "Abías"],
    "abiatar": ["Abiathar"],
    "abinadab": ["Abinadab"],
    "abiram": ["Abiram"],
    "abisag": ["Abishag"],
    "abisai": ["Abishai"],
    "abner": ["Abner"],
    "absalon": ["Absalom"],
    "abias": ["Abijah"],
    "acab": ["Ahab"],
    "acaz": ["Ahaz"],
    "acbor": ["Achbor"],
    "adoniram": ["Adoniram", "Adoram"],
    "adonias": ["Adonijah"],
    "adramelec": ["Adrammelech"],
    "adulam": ["Adullam"],
    "afec": ["Aphek"],
    "agag": ["Agag"],
    "ahicam": ["Ahikam"],
    "ahilud": ["Ahilud"],
    "ahimelec": ["Ahimelech"],
    "ahitofel": ["Ahithophel"],
    "ahias": ["Ahijah"],
    "amasa": ["Amasa"],
    "amasias": ["Amaziah"],
    "amitai": ["Amittai"],
    "amiud": ["Ammihud"],
    "amnon": ["Amnon"],
    "amoz": ["Amoz"],
    "amon": ["Ammon", "Amón"],
    "ana": ["Hannah", "Anna"],
    "anamelec": ["Anammelech"],
    "anatot": ["Anathoth"],
    "aquinoam": ["Ahinoam"],
    "aquis": ["Achish"],
    "araba": ["Arabah"],
    "aram": ["Aram", "Syria"],
    "arauna": ["Araunah", "Ornan"],
    "arca": ["arca del pacto", "ark of the covenant", "arca de Dios"],
    "armoni": ["Armoni"],
    "arsa": ["Arza"],
    "asa": ["Asa"],
    "asael": ["Asahel"],
    "asaias": ["Asaiah"],
    "asdod": ["Ashdod", "Azoto"],
    "asera": ["Asherah", "Aserá"],
    "asima": ["Ashima"],
    "asiria": ["Assyria", "Asiria"],
    "astoret": ["Ashtoreth", "Astarté"],
    "ava": ["Avva"],
    "azarias": ["Azariah", "Uzías"],
    "baal": ["Baal"],
    "baal-hazor": ["Baal Hazor"],
    "baal-perazim": ["Baal Perazim"],
    "baal-zebub": ["Baal-Zebub", "Beelzebub"],
    "baala": ["Baalah"],
    "baana": ["Baanah"],
    "baasa": ["Baasha"],
    "babilonia": ["Babylon", "Babel"],
    "bahurim": ["Bahurim"],
    "baladan": ["Baladan"],
    "barac": ["Barak"],
    "barzilai": ["Barzillai"],
    "beerot": ["Beeroth"],
    "beerseba": ["Beersheba", "Beer-sheba"],
    "belen": ["Bethlehem", "Belén de Judá"],
    "ben-adad": ["Ben-Hadad", "Benhadad"],
    "benjamin": ["Benjamin"],
    "berodac-baladan": ["Berodach-Baladan", "Merodach-Baladan"],
    "bet-rehob": ["Beth Rehob"],
    "bet-semes": ["Beth Shemesh", "Bet-semés"],
    "betel": ["Bet-el", "Bethel"],
    "betsabe": ["Bathsheba", "Betsabé", "Bath-sheba"],
    "bezec": ["Bezek"],
    "bicri": ["Bichri"],
    "boaz": ["Boaz", "Booz"],
    "boscat": ["Bozkath"],
    "cabul": ["Cabul"],
    "carmelo": ["Carmel", "Monte Carmelo"],
    "carreta": ["carreta nueva"],
    "cedron": ["Kidron", "Cedrón"],
    "cis": ["Kish"],
    "cison": ["Kishon"],
    "cuta": ["Cuthah", "Cutha"],
    "dagon": ["Dagon"],
    "damasco": ["Damascus"],
    "dan": ["Dan"],
    "david": ["David"],
    "dodo": ["Dodo"],
    "doeg": ["Doeg"],
    "dotan": ["Dothan"],
    "ebenezer": ["Eben-ezer", "Eben Ezer"],
    "ecron": ["Ekron"],
    "edom": ["Edom", "Seir"],
    "efod": ["ephod"],
    "efrain": ["Ephraim"],
    "egipto": ["Egypt", "Egipto"],
    "elat": ["Elath", "Ezion"],
    "elcana": ["Elkanah"],
    "eleazar": ["Eleazar"],
    "eliada": ["Eliada"],
    "eliam": ["Eliam", "Ammiel"],
    "eliaquim": ["Eliakim"],
    "eliseo": ["Elisha"],
    "ela": ["Elah"],
    "eli": ["Eli"],
    "elias": ["Elijah", "Elías"],
    "en-rogel": ["En Rogel"],
    "esar-hadon": ["Esarhaddon"],
    "etanim": ["Ethanim"],
    "etbaal": ["Ethbaal"],
    "evil-merodac": ["Evil-Merodach", "Amel-Marduk"],
    "ezequias": ["Hezekiah"],
    "ezion-geber": ["Ezion Geber", "Ezion-geber"],
    "filisteos": ["Philistines", "filisteo"],
    "finees": ["Phinehas", "Fineés"],
    "gabaa": ["Gibeah", "Gabaa de Benjamín"],
    "gabaonitas": ["Gibeonites"],
    "gabaon": ["Gibeon"],
    "gad": ["Gad"],
    "gadi": ["Gadi"],
    "galaad": ["Gilead"],
    "galilea": ["Galilee"],
    "gat": ["Gath"],
    "geba": ["Geba"],
    "gebal": ["Gebal"],
    "gedalias": ["Gedaliah"],
    "gera": ["Gera"],
    "gesur": ["Geshur"],
    "gezer": ["Gezer"],
    "giezi": ["Gehazi"],
    "gihon": ["Gihon"],
    "gilgal": ["Guilgal", "Gilgal"],
    "goliat": ["Goliath"],
    "gozan": ["Gozan"],
    "guibea": ["Gibeah"],
    "habor": ["Habor"],
    "hadad": ["Hadad"],
    "hadad-ezer": ["Hadadezer"],
    "haguit": ["Haggith"],
    "halah": ["Halah"],
    "hamat": ["Hamath"],
    "hanani": ["Hanani"],
    "hazael": ["Hazael"],
    "hazor": ["Hazor"],
    "hebron": ["Hebron"],
    "heret": ["Hareth", "Hereth"],
    "hiel": ["Hiel"],
    "hilcias": ["Hilkiah"],
    "hiram": ["Hiram", "Huram"],
    "holocausto": ["burnt offering"],
    "horeb": ["Horeb", "Sinaí", "Sinai"],
    "hulda": ["Huldah"],
    "husai": ["Hushai"],
    "ibleam": ["Ibleam"],
    "ichabod": ["Icabod", "Ichabod"],
    "imla": ["Imlah"],
    "is-boset": ["Ishbosheth", "Isboset", "Eshbaal"],
    "isacar": ["Issachar"],
    "isai": ["Jesse", "Isaí"],
    "isaias": ["Isaiah"],
    "ismael": ["Ishmael"],
    "israel": ["Israel"],
    "israelitas": ["Israelites", "hijos de Israel"],
    "itai": ["Ittai"],
    "jabes": ["Jabesh", "Jabes de Galaad"],
    "jacob": ["Jacob", "Israel"],
    "jaquin": ["Jachin"],
    "jedida": ["Jedidah"],
    "jefte": ["Jephthah"],
    "jehu": ["Jehu"],
    "jeroboam": ["Jeroboam"],
    "jerubaal": ["Jerubbaal", "Gedeón", "Gideon"],
    "jerusalen": ["Jerusalem"],
    "jezabel": ["Jezebel"],
    "jezreel": ["Jezreel"],
    "joab": ["Joab"],
    "joacaz": ["Jehoahaz", "Joahaz"],
    "joacim": ["Jehoiakim"],
    "joaquin": ["Jehoiachin", "Joaquín", "Conías"],
    "joel": ["Joel"],
    "joiada": ["Jehoiada"],
    "jonadab": ["Jonadab", "Jehonadab"],
    "jonatan": ["Jonathan"],
    "jonas": ["Jonah", "Jonas"],
    "joram": ["Joram", "Jehoram"],
    "jordan": ["Jordan"],
    "josaba": ["Jehosheba", "Josaba"],
    "josafat": ["Jehoshaphat"],
    "josheb-bashebet": ["Josheb-Basshebeth", "Adino"],
    "josue": ["Joshua"],
    "josias": ["Josiah"],
    "jotam": ["Jotham"],
    "joas": ["Joash", "Jehoash"],
    "juda": ["Judah"],
    "kir": ["Kir"],
    "laquis": ["Lachish"],
    "levitas": ["Levites", "levita"],
    "levi": ["Levi"],
    "libna": ["Libnah"],
    "lugares-altos": ["high places", "altos"],
    "libano": ["Lebanon"],
    "maaca": ["Maacah"],
    "mahanaim": ["Mahanaim"],
    "manahem": ["Menahem"],
    "manases": ["Manasseh"],
    "mar-de-bronce": ["mar de fundición", "bronze sea", "mar de bronce"],
    "matanias": ["Mattaniah"],
    "matri": ["Matri"],
    "matan": ["Mattan"],
    "mefiboset": ["Mephibosheth", "Merib-baal"],
    "meguido": ["Megiddo"],
    "mical": ["Michal"],
    "micmas": ["Michmash"],
    "milcom": ["Milcom", "Molech"],
    "milo": ["Millo"],
    "miqueas": ["Micaiah", "Micah"],
    "mizpa": ["Mizpah", "Mizpeh"],
    "moab": ["Moab"],
    "moises": ["Moses"],
    "moloc": ["Molech", "Moloch"],
    "naaman": ["Naaman"],
    "nabat": ["Nebat"],
    "nabot": ["Naboth"],
    "nabucodonosor": ["Nebuchadnezzar", "Nabucodonosor"],
    "nabuzaradan": ["Nebuzaradan"],
    "nadab": ["Nadab"],
    "nahas": ["Nahash"],
    "naiot": ["Naioth"],
    "natan": ["Nathan"],
    "necao": ["Neco", "Necho", "Faraón Necao"],
    "neftali": ["Naphtali"],
    "nehustan": ["Nehushtan"],
    "ner": ["Ner"],
    "nergal": ["Nergal"],
    "netanias": ["Nethaniah"],
    "nibhaz": ["Nibhaz"],
    "nimsi": ["Nimshi"],
    "nisroc": ["Nisroch"],
    "nob": ["Nob"],
    "ninive": ["Nineveh"],
    "obed-edom": ["Obed-Edom"],
    "ocozias": ["Ahaziah"],
    "ofir": ["Ophir"],
    "ofni": ["Hophni"],
    "omri": ["Omri"],
    "oseas": ["Hoshea", "Hosea"],
    "pacto": ["covenant"],
    "pas-damim": ["Pas Dammim", "Ephes-dammim"],
    "peka": ["Pekah"],
    "penina": ["Peninnah"],
    "pul": ["Pul", "Tiglat-pileser"],
    "perez-uza": ["Perez Uzzah", "Pérez-uza"],
    "quemos": ["Chemosh"],
    "querit": ["Kerith", "Querit"],
    "querubines": ["cherubim", "querubín"],
    "quiriat-jearim": ["Kiriath Jearim", "Quiriat-jearim"],
    "rabsaces": ["Rabshakeh", "Rabsaces"],
    "ramot": ["Ramoth", "Ramot de Galaad"],
    "rama": ["Ramah"],
    "raquel": ["Rachel"],
    "ratones": ["mice", "tumors models"],
    "recab": ["Recab", "Rechab"],
    "reina-de-saba": ["reina de Saba", "queen of Sheba", "reina de Sheba"],
    "remalias": ["Remaliah"],
    "rezin": ["Rezin"],
    "rezon": ["Rezon"],
    "ribla": ["Riblah"],
    "rimon": ["Rimmon"],
    "rizpa": ["Rizpah"],
    "roboam": ["Rehoboam"],
    "ruben": ["Reuben"],
    "saba": ["Sheba", "Sabá"],
    "sadoc": ["Zadok", "Sadoq", "Zadoc"],
    "safat": ["Shaphat"],
    "safan": ["Shaphan"],
    "salmanasar": ["Shalmaneser"],
    "salomon": ["Solomon"],
    "salum": ["Shallum"],
    "samaria": ["Samaria"],
    "samuel": ["Samuel"],
    "sarepta": ["Zarephath", "Sarepta"],
    "sarezer": ["Sharezer"],
    "sarvia": ["Zeruiah"],
    "saul": ["Saul"],
    "seba": ["Sheba"],
    "sebna": ["Shebna"],
    "sedequias": ["Zedekiah"],
    "sefarvaim": ["Sepharvaim"],
    "segub": ["Segub"],
    "sela": ["Sela", "Petra"],
    "semaias": ["Shemaiah"],
    "semer": ["Shemer"],
    "senaquerib": ["Sennacherib"],
    "seraias": ["Seraiah"],
    "sidon": ["Sidon"],
    "sila": ["Silla"],
    "silo": ["Shiloh"],
    "simei": ["Shimei"],
    "siquem": ["Shechem"],
    "siria": ["Syria", "Aram"],
    "sisac": ["Shishak"],
    "sucot": ["Succoth"],
    "sucot-benot": ["Succoth Benoth"],
    "sisara": ["Sisera"],
    "tabernaculo": ["tabernacle", "tienda de reunión"],
    "tabor": ["Tabor"],
    "talmai": ["Talmai"],
    "tamar": ["Tamar"],
    "tarsis": ["Tarshish"],
    "tartac": ["Tartak"],
    "tecoa": ["Tekoah", "Tekoa"],
    "templo": ["templo de Jerusalén", "casa del Señor"],
    "tibni": ["Tibni"],
    "tifsa": ["Tiphsah"],
    "tiglat-pileser": ["Tiglath-Pileser", "Pul"],
    "tiro": ["Tyre"],
    "tirsa": ["Tirzah"],
    "tob": ["Tob"],
    "tumores": ["tumors", "hemorroides"],
    "ungido": ["anointed", "mesías"],
    "urias": ["Uriah"],
    "uza": ["Uzzah"],
    "uzias": ["Uzziah", "Azarías"],
    "zacarias": ["Zechariah"],
    "zaretan": ["Zarethan"],
    "zereda": ["Zeredah"],
    "ziba": ["Ziba"],
    "zimri": ["Zimri"],
    "zoba": ["Zobah"],
    "zohelet": ["Zoheleth"],
    "zuf": ["Zuph"],
    "eufrates": ["Euphrates"],
    "ezel": ["Ezel"],
}

# Meaning: who / what / where, one NTV-accurate line (Samuel–Reyes).
NOTES: dict[str, str] = {
    "aaron": "Hermano de Moisés; de su linaje sale el sacerdocio de Sadoc.",
    "abdias": "Mayordomo de Acab que escondió a cien profetas del Señor.",
    "abel-bet-maaca": "Ciudad del norte donde Joab sitió a Seba hijo de Bicri.",
    "abiam": "Rey de Judá, hijo de Roboam; guerra con Jeroboam.",
    "abiatar": "Sacerdote hijo de Ahimelec; huyó a David y luego fue depuesto por Salomón.",
    "abinadab": "Hombre de Quiriat-jearim en cuya casa estuvo el arca; también un hijo de Saúl.",
    "abiram": "Hijo de Hiel de Betel; murió al poner Hiel los cimientos de Jericó.",
    "abisag": "Joven de Sunem que cuidó a David anciano; Adonías la pidió por esposa.",
    "abisai": "Hijo de Sarvia, hermano de Joab; valiente de David.",
    "abner": "Jefe del ejército de Saúl, tío de Saúl; pasó a David y Joab lo mató.",
    "absalon": "Hijo de David que se rebeló, tomó Jerusalén y murió en el bosque de Efraín.",
    "abias": "Hijo de Jeroboam a quien Ahías anunció que moriría; o rey Abías de Judá.",
    "acab": "Rey de Israel en Samaria; esposo de Jezabel; combatió a Elías y a Ben-adad.",
    "acaz": "Rey de Judá que pidió ayuda a Asiria y copió el altar de Damasco.",
    "acbor": "Oficial de Josías enviado junto con Hilcías a consultar a Hulda.",
    "adoniram": "Encargado de los trabajos forzados bajo David, Salomón y Roboam.",
    "adonias": "Hijo de David y Haguit que se proclamó rey; Salomón lo perdonó y luego lo mató.",
    "adramelec": "Dios de Sepharvaim al que quemaban hijos; también un hijo de Senaquerib.",
    "adulam": "Cueva donde David se escondió y reunió a su gente.",
    "afec": "Lugar donde filisteos y Siria pelearon contra Israel.",
    "agag": "Rey amalecita a quien Saúl perdonó y Samuel ejecutó.",
    "ahicam": "Hijo de Safán; protegió a Jeremías; padre de Gedalías.",
    "ahilud": "Padre de Josafat, el cronista de David y Salomón.",
    "ahimelec": "Sacerdote de Nob que ayudó a David; Saúl lo mató por Doeg.",
    "ahitofel": "Consejero de David que se pasó a Absalón y luego se ahorcó.",
    "ahias": "Profeta de Silo que anunció a Jeroboam el reino de las diez tribus.",
    "amasa": "Sobrino de David, jefe de Absalón; Joab lo asesinó.",
    "amasias": "Rey de Judá, hijo de Joás; venció a Edom y desafió a Israel.",
    "amitai": "Padre del profeta Jonás, de Gat-hefer.",
    "amiud": "Padre de Talmai, rey de Gesur.",
    "amnon": "Hijo primogénito de David; violó a Tamar y Absalón lo mató.",
    "amoz": "Padre del profeta Isaías.",
    "amon": "Nación al este del Jordán; también un rey de Judá, padre de Josías.",
    "ana": "Madre de Samuel; oró en Silo y el Señor le dio un hijo.",
    "anamelec": "Dios de Sepharvaim al que se quemaban hijos.",
    "anatot": "Pueblo de sacerdotes en Benjamín; origen de Abiatar y Jeremías.",
    "aquinoam": "Esposa de David, de Jezreel; madre de Amnón.",
    "aquis": "Rey filisteo de Gat que dio a David Siclag.",
    "araba": "La depresión del Jordán, hacia el sur.",
    "aram": "Siria; Damasco y sus reyes (Hadad-ezer, Ben-adad, Hazael, Rezín).",
    "arauna": "Jebuseo cuyo era el era David compró para el altar (la era de Arauna).",
    "arca": "El arca del pacto del Señor, tomada por filisteos y luego a Jerusalén.",
    "armoni": "Hijo de Saúl y Rizpa; entregado a los gabaonitas.",
    "arsa": "Mayordomo de Ela en Tirsa; Zimri mató al rey en su casa.",
    "asa": "Rey de Judá que quitó ídolos y peleo con Baasa.",
    "asael": "Hermano de Joab, veloz; Abner lo mató en Gabaón.",
    "asaias": "Siervo del rey Josías enviado a Hulda.",
    "asdod": "Ciudad filistea; el arca derribó a Dagón allí.",
    "asera": "Poste o diosa cananea que Israel adoró junto a Baal.",
    "asima": "Ídolo que hicieron los de Hamat en Samaria.",
    "asiria": "Imperio que se llevó a Israel y amenazó a Judá en días de Ezequías.",
    "astoret": "Diosa cananea que Israel y Salomón llegaron a honrar.",
    "ava": "Lugar de donde Asiria trajo gente a Samaria.",
    "azarias": "Nombre de varios; un sacerdote o el rey Uzías de Judá.",
    "baal": "Dios cananeo cuyo culto Jezabel y Acab impulsaron en Israel.",
    "baal-hazor": "Lugar cerca de Efraín donde Absalón mató a Amnón.",
    "baal-perazim": "Sitio donde David venció a los filisteos: «el Señor irrumpió».",
    "baal-zebub": "Dios de Ecrón al que consultó Ocozías de Israel.",
    "baala": "Otro nombre de Quiriat-jearim, de donde David trajo el arca.",
    "baana": "Oficial de Salomón, o uno de los que mataron a Is-boset.",
    "baasa": "Rey de Israel que mató a Nadab y peleo con Asa de Judá.",
    "babilonia": "Imperio de Nabucodonosor que tomó Jerusalén y llevó al exilio.",
    "bahurim": "Pueblo de Benjamín; Simei maldijo a David allí.",
    "baladan": "Padre de Berodac-baladán, rey de Babilonia.",
    "barac": "Juez que, con Débora, venció a Sísara (recordado en el relato).",
    "barzilai": "Galaadita que sostuvo a David en Mahanaim.",
    "beerot": "Pueblo gabaonita; origen de los asesinos de Is-boset.",
    "beerseba": "Ciudad del sur de Judá; «desde Dan hasta Beerseba».",
    "belen": "Pueblo de Judá, ciudad de Isaí y David.",
    "ben-adad": "Nombre de reyes de Siria que pelearon con Acab y más tarde con Israel.",
    "benjamin": "Tribu y territorio de Saúl, Gabaa y Jerusalén al norte.",
    "berodac-baladan": "Rey de Babilonia que envió mensajeros a Ezequías.",
    "bet-rehob": "Región aramea de donde tomaron mercenarios contra David.",
    "bet-semes": "Pueblo de Judá adonde volvió el arca en la carreta; allí murieron hombres por mirar dentro.",
    "betel": "Santuario del norte; Jeroboam puso un becerro; Elías y Eliseo pasaron por allí.",
    "betsabe": "Esposa de Urías, luego de David; madre de Salomón.",
    "bezec": "Lugar donde Saúl reunió a Israel para socorrer a Jabes.",
    "bicri": "Padre de Seba, benjamita que se rebeló contra David.",
    "boaz": "Una de las dos columnas del pórtico del templo de Salomón.",
    "boscat": "Pueblo de Judá, origen de Jedida, madre de Josías.",
    "cabul": "Región de Galilea que Salomón dio a Hiram y no le agradó.",
    "carmelo": "Monte donde Elías enfrentó a los profetas de Baal.",
    "carreta": "Carreta nueva con que los filisteos devolvieron el arca.",
    "cedron": "Arroyo al oriente de Jerusalén; Asa y otros echaron allí ídolos.",
    "cis": "Padre de Saúl, benjamita.",
    "cison": "Arroyo al pie del Carmelo donde Elías degolló a los profetas de Baal.",
    "cuta": "Lugar de donde Asiria trajo colonos a Samaria.",
    "dagon": "Dios filisteo de Asdod; cayó roto ante el arca.",
    "damasco": "Capital de Siria; Hadad-ezer, Rezín, Hazael.",
    "dan": "Ciudad y tribu del extremo norte; Jeroboam puso el otro becerro.",
    "david": "Hijo de Isaí, rey de Israel y Judá; ungió Samuel; tomó Jerusalén.",
    "dodo": "Padre de Eleazar, uno de los tres valientes de David.",
    "doeg": "Edomita, pastor de Saúl, que delató a Ahimelec y mató a los sacerdotes de Nob.",
    "dotan": "Ciudad donde el ejército sirio rodeó a Eliseo.",
    "ebenezer": "«Piedra de ayuda»: memorial de Samuel; también campamento frente a Afec.",
    "ecron": "Ciudad filistea; el arca llegó allí y Ocozías consultó a Baal-zebub.",
    "edom": "Nación al sur de Judá, descendientes de Esaú; David puso guarniciones.",
    "efod": "Vestidura sacerdotal de lino; David y Samuel la usaron; el de Nob guardaba la espada de Goliat.",
    "efrain": "Tribu y monte; bosque donde murió Absalón; Elcaná era de la sierra de Efraín.",
    "egipto": "Tierra del éxodo; Salomón se emparentó con Faraón; refugio y amenaza (Sisac, Necao).",
    "elat": "Puerto al sur, junto a Ezión-geber, en el mar Rojo.",
    "elcana": "Padre de Samuel, de Ramá, esposo de Ana y Penina.",
    "eleazar": "Hijo de Abinadab que cuidó el arca; o el valiente hijo de Dodo.",
    "eliada": "Hijo de David nacido en Jerusalén.",
    "eliam": "Padre de Betsabé, uno de los treinta de David.",
    "eliaquim": "Mayordomo de Ezequías, hijo de Hilcías; salió al Rabsaces.",
    "eliseo": "Profeta sucesor de Elías; milagros en Israel, Naamán y Dotán.",
    "ela": "Rey de Israel, hijo de Baasa; Zimri lo mató en Tirsa.",
    "eli": "Sacerdote de Silo, padre de Ofni y Finees; crió a Samuel.",
    "elias": "Profeta de Tesba; sequía, Carmelo, Horeb; subió al cielo; enfrentó a Acab.",
    "en-rogel": "Fuente cerca de Jerusalén donde Adonías hizo banquete.",
    "esar-hadon": "Hijo de Senaquerib que reinó en Asiria después del asesinato de su padre.",
    "etanim": "Mes séptimo, cuando Salomón dedicó el templo.",
    "etbaal": "Rey de Sidón, padre de Jezabel.",
    "evil-merodac": "Rey de Babilonia que libertó a Joaquín de la prisión.",
    "ezequias": "Rey de Judá que confió en el Señor frente a Senaquerib y enfermó y sanó.",
    "ezion-geber": "Puerto de Salomón en el mar Rojo, junto a Elat.",
    "filisteos": "Pueblo de la costa (Gat, Asdod, Ecrón); enemigos de Saúl y David.",
    "finees": "Hijo de Elí; murió cuando el arca fue tomada; su mujer nombró a Ichabod.",
    "gabaa": "Pueblo de Saúl en Benjamín.",
    "gabaonitas": "Habitantes de Gabaón; Saúl los persiguió y David les entregó descendientes de Saúl.",
    "gabaon": "Ciudad donde el sol se detuvo en la memoria; estanque de Abner y Joab; Salomón ofreció allí.",
    "gad": "Profeta de David; o la tribu al este del Jordán.",
    "gadi": "Padre de Manahem, de Tirsa.",
    "galaad": "Región al este del Jordán; Jabes, Ramot, Mahanaim, Barzilai.",
    "galilea": "Norte de Israel; Cabul, que Salomón dio a Hiram.",
    "gat": "Ciudad filistea de Goliat y de Aquís; el arca pasó por allí.",
    "geba": "Pueblo de Benjamín, frontera con Micmas.",
    "gebal": "Canteros de Gebal ayudaron a Hiram y Salomón.",
    "gedalias": "Hijo de Ahicam; Nabucodonosor lo dejó gobernador; Ismael lo mató.",
    "gera": "Padre de Simei, benjamita de Bahurim.",
    "gesur": "Reino arameo; Talmai, abuelo de Absalón, que huyó allí.",
    "gezer": "Ciudad que Faraón dio a Salomón como dote.",
    "giezi": "Criado de Eliseo; mintió a Naamán y quedó leproso.",
    "gihon": "Manantial de Jerusalén donde ungieron a Salomón.",
    "gilgal": "Santuario donde Samuel y Saúl se encontraron; Elías y Eliseo pasaron.",
    "goliat": "Gigante filisteo de Gat a quien David mató.",
    "gozan": "Río o región a donde Asiria deportó a Israel.",
    "guibea": "Otra forma de Gabaa, pueblo de Saúl.",
    "habor": "Río de Gozán, destino del destierro de Israel.",
    "hadad": "Edomita adversario de Salomón; o nombre divino arameo.",
    "hadad-ezer": "Rey de Zoba a quien David derrotó.",
    "haguit": "Esposa de David, madre de Adonías.",
    "halah": "Lugar del destierro asirio de Israel.",
    "hamat": "Ciudad-estado al norte; frontera de David y Salomón.",
    "hanani": "Vidente que reprendió a Asa por confiar en Siria.",
    "hazael": "Rey de Siria ungido por Elías; hostigó a Israel.",
    "hazor": "Ciudad del norte que Salomón fortificó.",
    "hebron": "Ciudad de Judá; David reinó allí siete años.",
    "heret": "Bosque donde David se escondió.",
    "hiel": "De Betel; reconstruyó Jericó y perdió a Abiram y Segub.",
    "hilcias": "Sacerdote que halló el libro de la ley en días de Josías.",
    "hiram": "Rey de Tiro, amigo de David y Salomón; envió cedros y artesanos.",
    "holocausto": "Ofrenda quemada por completo al Señor.",
    "horeb": "Monte de Dios donde Elías oyó la voz suave.",
    "hulda": "Profetisa en Jerusalén que habló a Josías sobre el libro de la ley.",
    "husai": "Amigo de David que desbarató el consejo de Ahitofel.",
    "ibleam": "Ciudad cerca de Meguido; Ocozías de Judá huyó herido hacia allí.",
    "ichabod": "Hijo de la nuera de Elí: «se ha ido la gloria» cuando cayó el arca.",
    "imla": "Padre de Miqueas, el profeta que habló contra Acab.",
    "is-boset": "Hijo de Saúl, rey de Israel por Abner; lo asesinaron en su cama.",
    "isacar": "Tribu; Baasa era de Isacar.",
    "isai": "Padre de David, de Belén.",
    "isaias": "Profeta hijo de Amoz; consejero de Ezequías.",
    "ismael": "Hijo de Netanías; mató a Gedalías en Mizpa.",
    "israel": "El pueblo y el reino del norte (diez tribus) frente a Judá.",
    "israelitas": "Los hijos de Israel, el pueblo del Señor en estos relatos.",
    "itai": "Gateo que se quedó con David en la huida de Absalón.",
    "jabes": "Jabes de Galaad, a la que Saúl salvó; luego rescató su cuerpo.",
    "jacob": "Patriarca; Israel lleva su nombre.",
    "jaquin": "La otra columna del pórtico del templo, junto a Boaz.",
    "jedida": "Madre de Josías, de Boscat.",
    "jefte": "Juez de Galaad, recordado en el relato.",
    "jehu": "Rey de Israel ungido para acabar con la casa de Acab.",
    "jeroboam": "Primer rey del norte; puso becerros en Betel y Dan.",
    "jerubaal": "Gedeón, llamado Jerubaal.",
    "jerusalen": "Ciudad de David y del templo; capital de Judá.",
    "jezabel": "Esposa sidonia de Acab; persiguió profetas e hizo matar a Nabot.",
    "jezreel": "Valle y ciudad de Acab; Jehú ejecutó allí el juicio.",
    "joab": "Hijo de Sarvia, general de David; mató a Abner, Absalón y Amasa.",
    "joacaz": "Rey de Israel hijo de Jehú, o el hijo de Josías llevado a Egipto.",
    "joacim": "Rey de Judá, hijo de Josías; siervo de Nabucodonosor.",
    "joaquin": "Rey de Judá llevado a Babilonia; Evil-merodac lo exaltó.",
    "joel": "Padre de Haguit no; el mayor hijo de Samuel, juez en Beerseba.",
    "joiada": "Sacerdote que escondió a Joás y derribó a Atalía (en Reyes, con Josaba).",
    "jonadab": "Amigo de Amnón, o Jehonadab hijo de Recab aliado de Jehú.",
    "jonatan": "Hijo de Saúl, amigo de David; murió en Gilboa.",
    "jonas": "Profeta hijo de Amitai, enviado a Nínive (nombrado en Reyes).",
    "joram": "Rey de Israel (hijo de Acab) o de Judá (hijo de Josafat).",
    "jordan": "Río que Israel cruzó; Eliseo lo partió con el manto de Elías.",
    "josaba": "Hija de Joram; escondió al niño Joás del exterminio de Atalía.",
    "josafat": "Rey de Judá aliado de Acab; o el cronista hijo de Ahilud.",
    "josheb-bashebet": "El principal de los tres valientes de David.",
    "josue": "Sucesor de Moisés; recordado al echar suertes y al pacto.",
    "josias": "Rey de Judá que halló el libro de la ley y quitó ídolos.",
    "jotam": "Rey de Judá, hijo de Uzías.",
    "joas": "Rey de Judá salvado por Josaba, o rey de Israel hijo de Joacaz.",
    "juda": "Tribu y reino del sur, con capital en Jerusalén.",
    "kir": "Lugar a donde Tiglat-pileser llevó a la gente de Damasco.",
    "laquis": "Ciudad fortificada de Judá; Senaquerib la sitió.",
    "levitas": "Tribu de Leví al servicio del arca, el templo y el canto.",
    "levi": "Tribu sacerdotal de Moisés, Aarón y los levitas.",
    "libna": "Ciudad de Judá que se rebeló en días de Joram.",
    "lugares-altos": "Santuarios locales que muchos reyes no quitaron.",
    "libano": "Monte de cedros que Hiram envió a Salomón.",
    "maaca": "Esposa de David, madre de Absalón; o reina madre en Judá.",
    "mahanaim": "Ciudad de Galaad; Is-boset reinó allí y David huyó de Absalón allí.",
    "manahem": "Rey de Israel que mató a Salum y pagó tributo a Pul.",
    "manases": "Rey de Judá que llenó Jerusalén de ídolos; o la tribu.",
    "mar-de-bronce": "El gran recipiente de bronce del templo, sobre doce bueyes.",
    "matanias": "Tío de Joaquín a quien Nabucodonosor puso por rey como Sedequías.",
    "matri": "Clan de Benjamín al que pertenecía Saúl.",
    "matan": "sacerdote de Baal que Joiada mandó matar.",
    "mefiboset": "Hijo de Jonatán, cojo; David le dio la mesa del rey.",
    "meguido": "Ciudad del valle donde murió Josías frente a Necao.",
    "mical": "Hija de Saúl, esposa de David; lo salvó y luego lo despreció al danzar.",
    "micmas": "Paso donde Jonatán atacó a la guarnición filistea.",
    "milcom": "Dios de Amón, abominación que Salomón honró.",
    "milo": "Fortificación de Jerusalén que David y Salomón reforzaron.",
    "miqueas": "Hijo de Imlá; profetizó la derrota de Acab en Ramot.",
    "mizpa": "Lugar de reunión de Samuel; más tarde sede de Gedalías.",
    "moab": "Nación al este del mar Muerto; David los sometió; Rut era moabita.",
    "moises": "El siervo del Señor que sacó a Israel de Egipto y dio la ley.",
    "moloc": "Ídolo al que se quemaban hijos en el valle de Hinom.",
    "naaman": "General sirio sanado de lepra por Eliseo en el Jordán.",
    "nabat": "Padre de Jeroboam, efrateo de Zereda.",
    "nabot": "Jezreelita cuya viña Acab y Jezabel usurparon.",
    "nabucodonosor": "Rey de Babilonia que tomó Jerusalén y llevó cautivos.",
    "nabuzaradan": "Capitán de la guardia de Nabucodonosor; quemó el templo.",
    "nadab": "Hijo de Jeroboam; rey breve de Israel, muerto por Baasa.",
    "nahas": "Rey amonita que amenazó a Jabes; Saúl lo venció.",
    "naiot": "En Ramá, donde Samuel y David estuvieron y el Espíritu vino sobre Saúl.",
    "natan": "Profeta que reprendió a David por Betsabé y apoyó a Salomón.",
    "necao": "Faraón de Egipto que mató a Josías en Meguido.",
    "neftali": "Tribu del norte; Hazor y Kedes en su tierra.",
    "nehustan": "Nombre que Ezequías dio a la serpiente de bronce al destruirla.",
    "ner": "Padre de Abner, de la casa de Saúl.",
    "nergal": "Dios de Cuta que los colonos pusieron en Samaria.",
    "netanias": "Padre de Ismael, de linaje real, que mató a Gedalías.",
    "nibhaz": "Ídolo de los aveos en Samaria.",
    "nimsi": "Abuelo de Jehú (Jehú hijo de Josafat hijo de Nimsi).",
    "nisroc": "Dios de Senaquerib; lo mataron sus hijos en ese templo.",
    "nob": "Ciudad de sacerdotes; David huyó allí; Doeg masacró a los sacerdotes.",
    "ninive": "Capital asiria; Jonás fue enviado a ella.",
    "obed-edom": "Gateo en cuya casa el arca trajo bendición antes de subir a Jerusalén.",
    "ocozias": "Rey de Israel (hijo de Acab) o de Judá; cayó por la reja o huyó de Jehú.",
    "ofir": "Tierra del oro que la flota de Salomón traía.",
    "ofni": "Hijo de Elí, sacerdote corrupto; murió en la batalla del arca.",
    "omri": "Rey de Israel, padre de Acab; compró el monte de Samaria.",
    "oseas": "Último rey de Israel; Salmanasar lo sitió y llevó cautivo el norte.",
    "pacto": "La alianza del Señor con Israel, representada también por el arca.",
    "pas-damim": "Campo de batalla donde Eleazar hijo de Dodo peleó.",
    "peka": "Rey de Israel, hijo de Remalías; aliado de Rezín contra Acaz.",
    "penina": "Otra esposa de Elcaná, que provocaba a Ana.",
    "pul": "Nombre de Tiglat-pileser de Asiria, a quien Manahem pagó tributo.",
    "perez-uza": "Lugar donde Uza murió por tocar el arca: «estallido contra Uza».",
    "quemos": "Dios de Moab, abominación que Salomón honró.",
    "querit": "Arroyo donde Elías se escondió y los cuervos lo alimentaron.",
    "querubines": "Figuras sobre el arca y en el templo, donde el Señor se manifiesta.",
    "quiriat-jearim": "Ciudad de Judá donde el arca estuvo en casa de Abinadab.",
    "rabsaces": "Portavoz asirio de Senaquerib que insultó a Jerusalén.",
    "ramot": "Ramot de Galaad, ciudad de refugio; Acab murió peleando allí.",
    "rama": "Pueblo de Samuel (Ramá de Zuf); también frontera que Baasa fortificó.",
    "raquel": "Esposa de Jacob; su sepulcro se nombra cerca de Belén/Zelza.",
    "ratones": "Figuras de oro que los filisteos enviaron con el arca como ofrenda por la plaga.",
    "recab": "Padre o antepasado de Jehonadab, aliado de Jehú.",
    "reina-de-saba": "Reina de Sabá que visitó a Salomón para probar su sabiduría.",
    "remalias": "Padre de Peka, rey de Israel.",
    "rezin": "Rey de Siria aliado de Peka contra Acaz.",
    "rezon": "Adversario de Salomón, rey en Damasco.",
    "ribla": "En Hamat; allí Nabucodonosor juzgó a Sedequías.",
    "rimon": "Dios de Damasco (casa de Rimón) que Naamán menciona; o un pueblo.",
    "rizpa": "Concubina de Saúl; veló los cuerpos de sus hijos.",
    "roboam": "Hijo de Salomón; al endurecerse se dividió el reino.",
    "ruben": "Tribu al este del Jordán.",
    "saba": "Reino de la reina que visitó a Salomón (Sabá / Sheba).",
    "sadoc": "Sacerdote fiel a David y Salomón; linaje aarónico.",
    "safat": "Padre de Eliseo, de Abel-mehola.",
    "safan": "Escriba de Josías; su familia ayudó al libro de la ley.",
    "salmanasar": "Rey de Asiria que sitió Samaria en días de Oseas.",
    "salomon": "Hijo de David y Betsabé; rey sabio, edificó el templo.",
    "salum": "Rey de Israel que mató a Zacarías; o el que tomó el trono brevemente.",
    "samaria": "Capital del reino del norte, fundada por Omri.",
    "samuel": "Profeta y juez; nació por la oración de Ana; ungió a Saúl y a David.",
    "sarepta": "Pueblo de Sidón; Elías habitó con la viuda.",
    "sarezer": "Hijo de Senaquerib que mató a su padre.",
    "sarvia": "Hermana de David, madre de Joab, Abisai y Asael.",
    "saul": "Primer rey de Israel, hijo de Cis; rechazado; murió en Gilboa.",
    "seba": "Benjamita hijo de Bicri que se rebeló contra David.",
    "sebna": "Mayordomo o escriba de Ezequías ante el Rabsaces.",
    "sedequias": "Último rey de Judá; Nabucodonosor lo cegó en Ribla.",
    "sefarvaim": "Ciudad cuyos dioses Adramelec y Anamelec se honraron en Samaria.",
    "segub": "Hijo menor de Hiel; murió al poner las puertas de Jericó.",
    "sela": "Ciudad de Edom que Amasías tomó (el Peñasco).",
    "semaias": "Profeta que detuvo a Roboam de pelear contra Israel.",
    "semer": "Dueño del monte que Omri compró para Samaria.",
    "senaquerib": "Rey de Asiria que sitió a Ezequías; el Señor hirió su ejército.",
    "seraias": "Sumo sacerdote que Nabuzaradán ejecutó; o un escriba de David.",
    "sidon": "Ciudad fenicia; Etbaal y Jezabel; Elías a Sarepta de Sidón.",
    "sila": "Lugar cerca de Milo donde Joás de Judá fue herido.",
    "silo": "Santuario donde estaba el arca con Elí y Samuel.",
    "simei": "Benjamita de Bahurim que maldijo a David; Salomón lo restringió.",
    "siquem": "Ciudad de Efraín donde Israel hizo rey a Roboam y se dividió el reino.",
    "siria": "Aram; Damasco; enemigos y a veces aliados de Israel.",
    "sisac": "Faraón que saqueó el templo en días de Roboam.",
    "sucot": "Pueblo cerca del Jordán, en el relato de fundición del bronce.",
    "sucot-benot": "Ídolo que los de Babilonia pusieron en Samaria.",
    "sisara": "Capitán cananeo vencido en días de Débora y Barac.",
    "tabernaculo": "La tienda de reunión / morada del Señor antes del templo.",
    "tabor": "Monte; en el relato de Saúl y las ofrendas.",
    "talmai": "Rey de Gesur, padre de Maaca, abuelo de Absalón.",
    "tamar": "Hija de David, hermana de Absalón; Amnón la violó.",
    "tarsis": "Destino lejano de las naves de Salomón y Josafat.",
    "tartac": "Ídolo de los aveos en Samaria.",
    "tecoa": "Pueblo de Judá; la mujer sabia que Joab envió a David.",
    "templo": "La casa del Señor que Salomón edificó en Jerusalén.",
    "tibni": "Rival de Omri por el trono de Israel.",
    "tifsa": "Ciudad junto al Éufrates que Salomón dominó.",
    "tiglat-pileser": "Rey de Asiria (Pul) que intervino en Israel y Damasco.",
    "tiro": "Ciudad de Hiram, aliada de David y Salomón.",
    "tirsa": "Primera capital de Jeroboam y Baasa antes de Samaria.",
    "tob": "Tierra de donde tomaron mercenarios contra David.",
    "tumores": "Plaga que hirió a los filisteos mientras tenían el arca.",
    "ungido": "El elegido del Señor (Saúl, David); no tocar al ungido.",
    "urias": "Hitita, esposo de Betsabé, a quien David mandó matar.",
    "uza": "Hijo de Abinadab; murió por tocar el arca.",
    "uzias": "Rey de Judá (Azarías) que reinó largo tiempo.",
    "zacarias": "Rey de Israel, hijo de Jeroboam II; o el hijo de Joiada.",
    "zaretan": "Lugar cerca del Jordán, en la fundición del bronce.",
    "zereda": "Pueblo de Jeroboam hijo de Nabat.",
    "ziba": "Siervo de la casa de Saúl; David le encargó las tierras de Mefiboset.",
    "zimri": "Oficial que mató a Ela y reinó siete días en Tirsa.",
    "zoba": "Reino arameo de Hadad-ezer, vencido por David.",
    "zohelet": "Piedra junto a En-rogel, en el banquete de Adonías.",
    "zuf": "Región de Efraín de donde era Elcaná; Ramá de Zuf.",
    "eufrates": "Gran río, límite nordeste del dominio de David y Salomón.",
    "ezel": "Piedra donde David se escondió de Saúl, según lo acordado con Jonatán.",
}

# Short relations to other glossary ids only.
REL: dict[str, list[tuple[str, str]]] = {
    "aaron": [("moises", "hermano"), ("sadoc", "linaje del sacerdocio"), ("levitas", "tribu")],
    "samuel": [("ana", "hijo"), ("elcana", "hijo"), ("eli", "criado en Silo"), ("saul", "lo ungió"), ("david", "lo ungió")],
    "ana": [("samuel", "madre"), ("elcana", "esposa"), ("penina", "la otra esposa"), ("silo", "oró allí")],
    "elcana": [("samuel", "padre"), ("ana", "esposo"), ("penina", "esposo"), ("rama", "de Ramá")],
    "eli": [("ofni", "padre"), ("finees", "padre"), ("samuel", "lo crió"), ("silo", "sacerdote allí"), ("ichabod", "abuelo")],
    "saul": [("cis", "hijo"), ("jonatan", "padre"), ("mical", "padre"), ("is-boset", "padre"), ("david", "lo persiguió"), ("samuel", "ungido por")],
    "david": [("isai", "hijo"), ("saul", "ungido en su lugar"), ("jonatan", "amigo"), ("salomon", "padre"), ("jerusalen", "su ciudad")],
    "salomon": [("david", "hijo"), ("betsabe", "hijo"), ("natan", "apoyado por"), ("templo", "lo edificó"), ("reina-de-saba", "la recibió")],
    "reina-de-saba": [("saba", "reina de"), ("salomon", "lo visitó")],
    "saba": [("reina-de-saba", "su reina"), ("salomon", "comercio y visita")],
    "jonatan": [("saul", "hijo"), ("david", "amigo"), ("mefiboset", "padre")],
    "mical": [("saul", "hija"), ("david", "esposa")],
    "absalon": [("david", "hijo"), ("tamar", "hermano"), ("amnon", "vengó a Tamar"), ("ahitofel", "su consejero"), ("joab", "lo mató")],
    "amnon": [("david", "hijo"), ("tamar", "la violó"), ("absalon", "lo mató"), ("aquinoam", "hijo")],
    "tamar": [("david", "hija"), ("absalon", "hermana"), ("amnon", "víctima de")],
    "joab": [("sarvia", "hijo"), ("david", "general de"), ("abner", "lo mató"), ("absalon", "lo mató")],
    "abner": [("ner", "hijo"), ("saul", "jefe de su ejército"), ("is-boset", "puso por rey"), ("joab", "lo asesinó")],
    "betsabe": [("urias", "esposa de"), ("david", "luego esposa de"), ("salomon", "madre"), ("eliam", "hija")],
    "urias": [("betsabe", "esposo"), ("david", "lo mandó matar")],
    "natan": [("david", "profeta de"), ("salomon", "lo apoyó")],
    "sadoc": [("abiatar", "sacerdote junto a"), ("david", "fiel a"), ("salomon", "lo ungió"), ("aaron", "linaje")],
    "abiatar": [("ahimelec", "hijo"), ("david", "huyó a"), ("sadoc", "compañero"), ("adonias", "apoyó a")],
    "ahimelec": [("abiatar", "padre"), ("nob", "sacerdote de"), ("doeg", "lo denunció"), ("saul", "lo mató")],
    "goliat": [("gat", "de Gat"), ("david", "lo mató"), ("filisteos", "campeón de")],
    "filisteos": [("gat", "una de sus ciudades"), ("asdod", "una de sus ciudades"), ("ecron", "una de sus ciudades"), ("arca", "la tomaron")],
    "arca": [("silo", "estaba allí"), ("dagon", "lo derribó"), ("quiriat-jearim", "descansó allí"), ("david", "la subió")],
    "acab": [("jezabel", "esposo"), ("ocozias", "padre"), ("joram", "padre"), ("elias", "lo enfrentó"), ("nabot", "le quitó la viña")],
    "jezabel": [("acab", "esposa"), ("etbaal", "hija"), ("elias", "lo persiguió"), ("jehu", "la hizo matar")],
    "elias": [("eliseo", "su sucesor"), ("acab", "lo reprendió"), ("carmelo", "el duelo con Baal"), ("sarepta", "la viuda")],
    "eliseo": [("elias", "discípulo"), ("safat", "hijo"), ("naaman", "lo sanó"), ("giezi", "su criado")],
    "jeroboam": [("nabat", "hijo"), ("roboam", "se separó de"), ("ahias", "profecía de"), ("betel", "becerro en")],
    "roboam": [("salomon", "hijo"), ("jeroboam", "se le fue el norte"), ("siquem", "allí se dividió el reino")],
    "omri": [("acab", "padre"), ("samaria", "fundó la capital"), ("tibni", "rival")],
    "jehu": [("nimsi", "nieto"), ("acab", "exterminó su casa"), ("jezabel", "hizo ejecutar"), ("eliseo", "ungido vía")],
    "ezequias": [("isaias", "profeta de"), ("senaquerib", "lo sitió"), ("manases", "padre de")],
    "senaquerib": [("ezequias", "sitió a"), ("asiria", "rey de"), ("esar-hadon", "padre de")],
    "josias": [("hulda", "consultó a"), ("hilcias", "el libro hallado"), ("necao", "murió frente a")],
    "nabucodonosor": [("babilonia", "rey de"), ("sedequias", "lo venció"), ("joaquin", "lo llevó cautivo")],
    "sedequias": [("matanias", "su nombre primero"), ("nabucodonosor", "vasallo de"), ("ribla", "juzgado allí")],
    "is-boset": [("saul", "hijo"), ("abner", "lo puso por rey"), ("mahanaim", "reinó allí")],
    "mefiboset": [("jonatan", "hijo"), ("david", "comió a su mesa"), ("ziba", "siervo de su casa")],
    "adonias": [("haguit", "hijo"), ("david", "se proclamó rey en vida de"), ("salomon", "rival"), ("abisag", "la pidió")],
    "hiram": [("tiro", "rey de"), ("salomon", "aliado de"), ("libano", "cedros de")],
    "naaman": [("eliseo", "sanado por"), ("siria", "general de"), ("jordan", "se bañó")],
    "nabot": [("acab", "su viña"), ("jezabel", "lo hizo matar"), ("jezreel", "de Jezreel")],
    "templo": [("salomon", "lo construyó"), ("jerusalen", "en"), ("querubines", "en el lugar santísimo")],
    "samaria": [("omri", "la fundó"), ("acab", "capital de"), ("asiria", "la tomó")],
    "jerusalen": [("david", "la tomó"), ("salomon", "el templo"), ("juda", "capital de")],
    "israel": [("juda", "el otro reino"), ("samaria", "su capital del norte"), ("jeroboam", "primer rey del norte")],
    "juda": [("israel", "el reino hermano"), ("jerusalen", "su capital"), ("david", "casa de")],
}


def fold(s: str) -> str:
    s = unicodedata.normalize("NFD", s)
    return "".join(c for c in s if unicodedata.category(c) != "Mn").lower()


def parse_card(text: str) -> tuple[str, str]:
    q = a = ""
    phase = "meta"
    for line in text.replace("\r\n", "\n").split("\n"):
        t = line.strip()
        if t == "#flashcard":
            continue
        if t == "?":
            phase = "answer"
            continue
        if phase == "meta":
            if t.startswith("#"):
                q = re.sub(r"^#+\s*", "", t)
                phase = "question"
            continue
        if phase == "question":
            if t.startswith("---") or t.startswith("[["):
                break
            if t:
                q = f"{q} {t}"
            continue
        if phase == "answer":
            if t.startswith("---") or t.startswith("[["):
                break
            if t:
                a = f"{a} {t}" if a else t
    return CITE.sub("", q).strip(), CITE.sub("", a).strip()


def shorten(text: str, limit: int = 140) -> str:
    text = re.sub(r"\s+", " ", text).strip()
    if len(text) <= limit:
        return text
    cut = text[: limit - 1]
    if " " in cut:
        cut = cut.rsplit(" ", 1)[0]
    return cut + "…"


def auto_note(term: str, hits: list[tuple[str, str]]) -> str:
    low = fold(term)
    for q, a in hits:
        ql, al = fold(q), fold(a)
        if q.startswith("¿Quién") or q.startswith("¿Qué es") or q.startswith("¿Qué era") or q.startswith("¿Dónde"):
            return shorten(a)
        if low in ql and (q.startswith("¿Qué") or q.startswith("¿Cuál")):
            return shorten(a)
    if hits:
        q, a = hits[0]
        if a:
            return shorten(a)
        return shorten(q)
    return ""


def load_cards() -> list[tuple[str, str, str]]:
    out = []
    for folder in CARDS.iterdir():
        if not folder.is_dir():
            continue
        for f in folder.iterdir():
            if f.is_file() and not f.name.startswith("."):
                q, a = parse_card(f.read_text(encoding="utf-8"))
                out.append((q, a, fold(q + " " + a)))
    return out


def main() -> None:
    data = json.loads(GLOSSARY.read_text(encoding="utf-8"))
    entries = data["entries"]
    ids = {e["id"] for e in entries}
    cards = load_cards()

    for e in entries:
        eid = e["id"]
        term = e["term"]
        aliases = list(e.get("aliases") or [])
        extra = AKA.get(eid, [])
        seen = {fold(term)}
        merged = []
        for a in aliases + extra:
            k = fold(a)
            if not a or k in seen:
                continue
            seen.add(k)
            merged.append(a)
        e["aliases"] = merged
        e["properName"] = e.get("kind") in ("persona", "lugar")
        note = NOTES.get(eid) or ""
        if not note:
            forms = [term, *merged]
            hits = []
            for form in forms:
                ff = fold(form)
                for q, a, hay in cards:
                    if ff and ff in hay:
                        hits.append((q, a))
                        if len(hits) >= 4:
                            break
                if len(hits) >= 4:
                    break
            note = auto_note(term, hits)
        e["note"] = note
        related = []
        seen_r = set()
        for oid, rel in REL.get(eid, []):
            if oid not in ids or oid == eid or oid in seen_r:
                continue
            seen_r.add(oid)
            related.append({"id": oid, "rel": rel})
        e["related"] = related

    # For remaining terms, link other glossary words that share a card.
    by_id = {e["id"]: e for e in entries}
    folded_forms: list[tuple[str, str]] = []
    for e in entries:
        folded_forms.append((e["id"], fold(e["term"])))
        for a in e.get("aliases") or []:
            folded_forms.append((e["id"], fold(a)))

    co: dict[str, dict[str, int]] = {e["id"]: {} for e in entries}
    for _q, _a, hay in cards:
        present = []
        seen_ids = set()
        for eid, ff in folded_forms:
            if ff and ff in hay and eid not in seen_ids:
                present.append(eid)
                seen_ids.add(eid)
        for i, a in enumerate(present):
            for b in present[i + 1 :]:
                co[a][b] = co[a].get(b, 0) + 1
                co[b][a] = co[b].get(a, 0) + 1

    for e in entries:
        if e.get("related"):
            continue
        ranked = sorted(co.get(e["id"], {}).items(), key=lambda kv: -kv[1])
        related = []
        for oid, _n in ranked[:3]:
            other = by_id.get(oid)
            if not other:
                continue
            related.append({"id": oid, "rel": "aparece en las mismas tarjetas"})
        e["related"] = related

    GLOSSARY.write_text(
        json.dumps({"entries": entries}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    with_note = sum(1 for e in entries if e.get("note"))
    with_aka = sum(1 for e in entries if e.get("aliases"))
    with_rel = sum(1 for e in entries if e.get("related"))
    print(
        f"Wrote {len(entries)} entries: {with_note} notes, {with_aka} with aliases, {with_rel} with related"
    )


if __name__ == "__main__":
    main()
