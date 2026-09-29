#!/usr/bin/env python3
"""Generate 2 Samuel flashcards, regenerate index, optional dedupe."""
from __future__ import annotations

import json
import re
import unicodedata
from difflib import SequenceMatcher
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VAULT = ROOT / "obsidian-vault" / "flashcards"
NOTES = ROOT / "obsidian-vault" / "notes"

CHAPTERS = [
    {
        "slug": "2-samuel-1-david-ante-la-muerte-de-saul",
        "title": "2 Samuel 1 — David recibe la noticia de Saúl",
        "cards": [
            ("¿De qué ciudad llegó el mensajero que informó a David sobre la batalla?", "De la campiña de Jezreel. (2 Samuel 1:1, NTV)"),
            ("¿Con quién se había quedado David cuando llegó el mensajero?", "Con Aquinoam de Jezreel y con el pueblo que estaba con él. (2 Samuel 1:1, NTV)"),
            ("¿Qué señales llevaba el mensajero en la cabeza y en las manos?", "Tierra sobre la cabeza y ropa rasgada. (2 Samuel 1:2, NTV)"),
            ("¿Qué le preguntó David al mensajero al verlo llegar angustiado?", "De dónde venía y si la batalla había ido bien. (2 Samuel 1:3–4, NTV)"),
            ("Según el mensajero, ¿quién mató a Saúl?", "Él mismo, porque Saúl estaba gravemente herido. (2 Samuel 1:8–10, NTV)"),
            ("¿Qué hizo David y su gente al escuchar que Saúl y Jonatán habían muerto?", "Se rasgaron la ropa y lloraron, ayunando hasta el atardecer. (2 Samuel 1:11–12, NTV)"),
            ("¿Qué le preguntó David al joven amalecita sobre su origen?", "De dónde era. (2 Samuel 1:13, NTV)"),
            ("¿Por qué ejecutó David al mensajero que dijo haber matado a Saúl?", "Porque confesó haber dado muerte al ungido del Señor. (2 Samuel 1:14–16, NTV)"),
        ],
    },
    {
        "slug": "2-samuel-2-david-rey-de-juda",
        "title": "2 Samuel 2 — David rey de Judá",
        "cards": [
            ("Después de consultar al Señor, ¿a qué ciudad subió David?", "A Hebrón. (2 Samuel 2:1, NTV)"),
            ("¿Quiénes ungieron a David como rey sobre la casa de Judá?", "Los hombres de Judá. (2 Samuel 2:4, NTV)"),
            ("¿Qué mensaje envió David a los habitantes de Jabes de Galaad?", "Que el Señor los bendijera por haber honrado a Saúl con un entierro digno. (2 Samuel 2:5–6, NTV)"),
            ("¿Quién hizo rey a Is-boset sobre Israel?", "Abner, hijo de Ner, comandante del ejército de Saúl. (2 Samuel 2:8–9, NTV)"),
            ("¿Cuántos años reinó David en Hebrón sobre Judá?", "Siete años y seis meses. (2 Samuel 2:11, NTV)"),
            ("¿Qué propuso Abner a Joab para detener la guerra entre sus hombres?", "Que los jóvenes se levantaran y lucharan delante de ellos. (2 Samuel 2:14, NTV)"),
            ("¿Cuántos hombres de Benjamín y de los siervos de David murieron en aquella refriega?", "Veinte de Benjamín y dieciocho de los siervos de David. (2 Samuel 2:15–16, NTV)"),
            ("¿Qué grito hizo Abner para que la gente dejara de perseguir a sus hermanos?", "«¿No saben que se van a devorar unos a otros?» (2 Samuel 2:26, NTV)"),
        ],
    },
    {
        "slug": "2-samuel-3-abner-y-joab",
        "title": "2 Samuel 3 — Abner y Joab",
        "cards": [
            ("¿Por qué se enojó Abner con Is-boset?", "Porque Is-boset le reprochó haberse acostado con una concubina de Saúl. (2 Samuel 3:7–8, NTV)"),
            ("¿Qué ofreció Abner hacer con el reino?", "Transferir el reino de la casa de Saúl y establecer el trono de David sobre Israel y Judá. (2 Samuel 3:9–10, NTV)"),
            ("¿Con quién habló Abner en Hebrón para unir Israel a David?", "Con David personalmente. (2 Samuel 3:12–13, NTV)"),
            ("¿Qué condición puso David para recibir a Abner?", "Que trajera a Mical, hija de Saúl, cuando viniera. (2 Samuel 3:13–14, NTV)"),
            ("¿Qué hizo Joab cuando David envió a Abner de regreso en paz?", "Lo llamó aparte en la puerta de Hebrón y lo mató a traición. (2 Samuel 3:26–27, NTV)"),
            ("¿Por qué Joab y su hermano Abisai mataron a Abner?", "Porque Abner había dado muerte a su hermano Asael en la batalla de Gabaón. (2 Samuel 3:30, NTV)"),
            ("¿Qué ordenó David respecto al cuerpo de Abner?", "Que lo llevaran a enterrarlo en Hebrón, y el rey siguió el féretro. (2 Samuel 3:31–32, NTV)"),
            ("¿Qué declaró David sobre su inocencia en la muerte de Abner?", "Que él y su reino eran inocentes ante el Señor para siempre. (2 Samuel 3:28–29, NTV)"),
        ],
    },
    {
        "slug": "2-samuel-4-is-boset-y-el-reino-unido",
        "title": "2 Samuel 4 — Is-boset y el reino unido",
        "cards": [
            ("¿Qué efecto tuvo en Israel la muerte de Abner?", "Se desanimaron y perdieron el ánimo. (2 Samuel 4:1, NTV)"),
            ("¿Quiénes mataron a Is-boset mientras dormía la siesta?", "Recab y Baana, hijos de Rimón de Beerot. (2 Samuel 4:5–7, NTV)"),
            ("¿Qué parte del cuerpo de Is-boset llevaron a David?", "La cabeza. (2 Samuel 4:7–8, NTV)"),
            ("¿Cómo respondió David a Recab y Baana por matar a un hombre inocente en su casa?", "Ordenó ejecutarlos y colgar sus manos y pies junto al estanque de Hebrón. (2 Samuel 4:9–12, NTV)"),
            ("¿Qué hizo David con la cabeza de Is-boset?", "La sepultó en la tumba de Abner en Hebrón. (2 Samuel 4:12, NTV)"),
            ("¿Qué dijo David a Recab y Baana sobre matar a un hombre inocente?", "Que él, cuando luchaba contra Saúl, nunca habría hecho eso. (2 Samuel 4:10–11, NTV)"),
            ("¿De qué pueblo eran Recab y Baana?", "De Beerot, de los hijos de Benjamín. (2 Samuel 4:2–3, NTV)"),
            ("¿Dónde dormía Is-boset cuando lo mataron?", "En su cama, a la hora del mediodía. (2 Samuel 4:5, NTV)"),
        ],
    },
    {
        "slug": "2-samuel-5-david-toma-jerusalen",
        "title": "2 Samuel 5 — David toma Jerusalén",
        "cards": [
            ("¿Cuántos años y meses reinó David en Hebrón antes de reinar sobre todo Israel?", "Siete años y seis meses. (2 Samuel 5:5, NTV)"),
            ("¿Qué ciudad tomó David y llamó Ciudad de David?", "Jerusalén. (2 Samuel 5:7, NTV)"),
            ("¿Quiénes habitaban en Jerusalén cuando David llegó?", "Los jebuseos. (2 Samuel 5:6, NTV)"),
            ("¿Por qué David llamó a Jerusalén «Ciudad de David»?", "Porque la fortificó desde el terraplén hacia adentro. (2 Samuel 5:9, NTV)"),
            ("¿Quién construyó la ciudad alrededor, desde el terraplén hasta alrededor?", "Joab, hijo de Sarvia. (2 Samuel 5:9–11, NTV)"),
            ("¿Qué envió Hiram rey de Tiro a David?", "Carpinteros y canteros, y madera de cedro. (2 Samuel 5:11, NTV)"),
            ("¿Qué reconoció David que el Señor había hecho por él?", "Que lo había establecido como rey sobre Israel y exaltado su reino. (2 Samuel 5:12, NTV)"),
            ("¿Qué ocurrió cuando los filisteos subieron a buscar a David?", "David consultó al Señor y derrotó a los filisteos en Baal-perazim. (2 Samuel 5:17–20, NTV)"),
        ],
    },
    {
        "slug": "2-samuel-6-el-arca-en-jerusalen",
        "title": "2 Samuel 6 — El arca en Jerusalén",
        "cards": [
            ("¿Con cuántos hombres escogidos fue David a traer el arca desde Baala?", "Con treinta mil. (2 Samuel 6:1, NTV)"),
            ("¿Sobre qué llevaban inicialmente el arca de Dios?", "Sobre un carro nuevo. (2 Samuel 6:3, NTV)"),
            ("¿Qué hizo Uza cuando los bueyes tropezaron?", "Extendió la mano hacia el arca para sostenerla. (2 Samuel 6:6, NTV)"),
            ("¿Qué le sucedió a Uza por tocar el arca?", "Dios lo hirió allí y murió. (2 Samuel 6:7, NTV)"),
            ("¿Cómo reaccionó David al castigo de Uza?", "Se enojó porque el Señor había estallado contra Uza, y llamó aquel lugar Pérez-uza. (2 Samuel 6:8, NTV)"),
            ("¿Dónde dejó David el arca después de aquel incidente?", "En casa de Obed-edom de Gat. (2 Samuel 6:10–11, NTV)"),
            ("¿Cómo llevaba David el arca cuando finalmente la subió a Jerusalén?", "Con sacrificios y danzas delante del Señor. (2 Samuel 6:12–15, NTV)"),
            ("¿Qué dijo Mical al ver a David danzar delante del arca?", "Que el rey de Israel se había deshonrado delante de las criadas. (2 Samuel 6:20, NTV)"),
        ],
    },
    {
        "slug": "2-samuel-7-pacto-con-david",
        "title": "2 Samuel 7 — Pacto con David",
        "cards": [
            ("¿Qué deseaba David hacer para el arca de Dios?", "Construirle una casa, un templo. (2 Samuel 7:2, NTV)"),
            ("¿Qué mensaje envió el profeta Natán inicialmente a David sobre el templo?", "Que hiciera todo lo que tenía en su corazón, porque el Señor estaba con él. (2 Samuel 7:3, NTV)"),
            ("¿Qué le recordó Dios a David sobre su pasado desde el redil?", "Que lo había tomado del pastoreo para ser príncipe sobre su pueblo. (2 Samuel 7:8, NTV)"),
            ("¿Quién construiría casa al nombre del Señor según la palabra a David?", "Un descendiente de David, no David mismo. (2 Samuel 7:12–13, NTV)"),
            ("¿Qué prometió Dios establecer del linaje de David?", "Su reino y su trono para siempre. (2 Samuel 7:13, NTV)"),
            ("¿Cómo llamó David al Señor al orar después de oír estas promesas?", "Señor DIOS. (2 Samuel 7:18, NTV)"),
            ("En su oración, ¿qué reconoció David que Dios había hecho por Israel?", "Había rescatado a su pueblo y se había hecho un nombre. (2 Samuel 7:23, NTV)"),
            ("¿Qué pidió David que el Señor bendijera para siempre?", "La casa de su siervo y el trono de su reino. (2 Samuel 7:29, NTV)"),
        ],
    },
    {
        "slug": "2-samuel-8-victorias-de-david",
        "title": "2 Samuel 8 — Victorias de David",
        "cards": [
            ("¿A quiénes derrotó David y sometió en este capítulo?", "A los filisteos, moabitas, Hadad-ezer rey de Zoba y a los sirios. (2 Samuel 8:1–6, NTV)"),
            ("¿Qué hizo David con los moabitas que cayeron en su poder?", "Los midió con cordel y los sometió a servidumbre. (2 Samuel 8:2, NTV)"),
            ("¿Qué tomó David de Hadad-ezer cuando lo derrotó?", "Mil carros, siete mil jinetes y veinte mil soldados de a pie. (2 Samuel 8:4, NTV)"),
            ("¿Qué hizo David con los sirios que vinieron a socorrer a Hadad-ezer?", "Los derrotó y puso guarniciones en Damasco. (2 Samuel 8:5–6, NTV)"),
            ("¿Qué metales guardó David del botín para el Señor?", "Oro, plata y bronce. (2 Samuel 8:7–11, NTV)"),
            ("¿Quién era Joab en el reinado de David?", "El comandante del ejército. (2 Samuel 8:16, NTV)"),
            ("¿Quiénes eran Josafat hijo de Ahilud y Seraías?", "Josafat era el cronista; Seraías era el secretario. (2 Samuel 8:16–17, NTV)"),
            ("¿Qué se dice al final del capítulo sobre los edomitas?", "David los derrotó y puso guarniciones en todo Edom. (2 Samuel 8:14, NTV)"),
        ],
    },
    {
        "slug": "2-samuel-9-mefiboset",
        "title": "2 Samuel 9 — Mefiboset",
        "cards": [
            ("¿Qué preguntó David si aún quedaba alguien de la casa de Saúl?", "Si quedaba alguien a quien pudiera mostrar bondad por amor a Jonatán. (2 Samuel 9:1, NTV)"),
            ("¿Quién informó a David sobre un hijo de Jonatán lisiado de los pies?", "Ziba, siervo de la casa de Saúl. (2 Samuel 9:2–3, NTV)"),
            ("¿Cómo se llamaba el hijo de Jonatán?", "Mefiboset. (2 Samuel 9:6, NTV)"),
            ("¿Por qué Mefiboset tenía los pies lisiados?", "Porque su nodriza lo dejó caer al huir cuando llegó la noticia de Jezreel. (2 Samuel 4:4, NTV)"),
            ("¿Qué prometió David a Mefiboset?", "Devolverle todas las tierras de Saúl y que comería siempre a su mesa. (2 Samuel 9:7, NTV)"),
            ("¿A quién ordenó David que labrara las tierras de Mefiboset?", "A Ziba y a sus hijos y siervos. (2 Samuel 9:9–10, NTV)"),
            ("¿Dónde vivía Mefiboset después de ser llamado por David?", "En Jerusalén, comiendo siempre a la mesa del rey. (2 Samuel 9:11–13, NTV)"),
            ("¿Cómo se describe a Mefiboset ante David?", "Como lisiado de ambos pies. (2 Samuel 9:13, NTV)"),
        ],
    },
    {
        "slug": "2-samuel-10-guerra-con-los-amonitas",
        "title": "2 Samuel 10 — Guerra con los amonitas",
        "cards": [
            ("¿Qué hizo el rey de los amonitas con los siervos de David que envió a consolarlo?", "Los humilló cortándoles la mitad de la ropa hasta las nalgas. (2 Samuel 10:4, NTV)"),
            ("¿Cómo respondió David cuando supo que los amonitas lo habían tratado con desprecio?", "Envió al ejército, y los amonitas se prepararon para la guerra. (2 Samuel 10:5–6, NTV)"),
            ("¿A quiénes contrataron los amonitas como aliados?", "A los sirios de Bet-rehob y de Zoba, al rey de Maaca y a los de Tob. (2 Samuel 10:6, NTV)"),
            ("¿Quién comandaba el ejército de David en esta campaña?", "Joab. (2 Samuel 10:7, NTV)"),
            ("¿Cómo dividió Joab sus fuerzas ante los sirios y los amonitas?", "Puso a su hermano Abisai contra los amonitas y él mismo contra los sirios. (2 Samuel 10:9–10, NTV)"),
            ("¿Qué dijo Joab si los sirios eran demasiado fuertes para él?", "Que Abisai viniera en su ayuda; y si los amonitas eran demasiado fuertes, Joab iría a ayudar a Abisai. (2 Samuel 10:11–12, NTV)"),
            ("¿Qué hicieron los sirios cuando fueron derrotados por David?", "Huyeron y se sometieron, y los sirios no volvieron a ayudar a los amonitas. (2 Samuel 10:13–19, NTV)"),
            ("¿Quién fue el general sirio Hadad-ezer que David derrotó en el valle de la Sal?", "El que había tenido guarniciones en el Éufrates. (2 Samuel 10:16, NTV)"),
        ],
    },
    {
        "slug": "2-samuel-11-david-y-betsabe",
        "title": "2 Samuel 11 — David y Betsabé",
        "cards": [
            ("¿En qué temporada del año ocurrió que David envió al ejército contra los amonitas?", "Al tiempo de la primavera, cuando los reyes salían a la guerra. (2 Samuel 11:1, NTV)"),
            ("¿Desde dónde vio David a una mujer que se estaba bañando?", "Desde el techo de su palacio. (2 Samuel 11:2, NTV)"),
            ("¿Cómo se llamaba la mujer y quién era su esposo?", "Betsabé, hija de Eliam; su esposo era Urías el hitita. (2 Samuel 11:3, NTV)"),
            ("¿Qué hizo David después de dormir con Betsabé?", "Ella concibió y le envió a decir que estaba encinta. (2 Samuel 11:4–5, NTV)"),
            ("¿Qué intentó David lograr enviando a Urías de vuelta a su casa?", "Que Urías durmiera con su mujer para encubrir el embarazo. (2 Samuel 11:8–13, NTV)"),
            ("¿Por qué Urías no fue a su casa cuando David lo envió?", "Porque los arca y el ejército estaban en tiendas de campaña y él no podía ir a su casa. (2 Samuel 11:11, NTV)"),
            ("¿Qué orden final dio David a Joab respecto a Urías?", "Poner a Urías donde la batalla fuera más dura para que muriera. (2 Samuel 11:14–17, NTV)"),
            ("Después de llorar el periodo de duelo, ¿qué hizo David con Betsabé?", "La tomó por esposa y ella le dio un hijo. (2 Samuel 11:27, NTV)"),
        ],
    },
    {
        "slug": "2-samuel-12-natan-confronta-a-david",
        "title": "2 Samuel 12 — Natán confronta a David",
        "cards": [
            ("¿Qué historia contó Natán para confrontar a David?", "La del hombre rico que tomó la única cordera del pobre. (2 Samuel 12:1–4, NTV)"),
            ("¿Qué sentencia pronunció David contra el hombre de la parábola?", "Que debía morir y restituir cuatro veces. (2 Samuel 12:5–6, NTV)"),
            ("¿Qué le dijo Natán a David después de su sentencia?", "«¡Tú eres ese hombre!» (2 Samuel 12:7, NTV)"),
            ("¿Qué castigo anunció Natán por el pecado de David?", "La espada no se apartaría de su casa, y el niño concebido moriría. (2 Samuel 12:10–14, NTV)"),
            ("¿Qué hizo David cuando el niño enfermó?", "Ayunó y oró por el niño, acostado en tierra. (2 Samuel 12:16–17, NTV)"),
            ("¿Qué hizo David cuando el niño murió?", "Se levantó, se lavó, cambió de ropa y adoró; luego comió. (2 Samuel 12:20, NTV)"),
            ("¿Cómo explicó David a sus siervos su conducta tras la muerte del niño?", "Que ya no podía traerlo de vuelta, pero un día iría a él. (2 Samuel 12:22–23, NTV)"),
            ("¿Cómo se llamó el hijo que le nació a David y Betsabé después?", "Salomón, y el Señor lo amó. (2 Samuel 12:24–25, NTV)"),
        ],
    },
    {
        "slug": "2-samuel-13-amnon-y-tamar",
        "title": "2 Samuel 13 — Amnón y Tamar",
        "cards": [
            ("¿Por quién enfermó Amnón hasta enfermar de verdad?", "Por Tamar, su hermana media. (2 Samuel 13:1–2, NTV)"),
            ("¿Qué consejo le dio su amigo Jonadab a Amnón?", "Fingirse enfermo y pedir que Tamar viniera a prepararle comida. (2 Samuel 13:5–6, NTV)"),
            ("¿Qué hizo Amnón cuando Tamar se acercó para darle de comer?", "La tomó y la violó. (2 Samuel 13:10–14, NTV)"),
            ("Después del acto, ¿cómo cambió el amor de Amnón hacia Tamar?", "Se convirtió en un odio mayor que el amor que había tenido. (2 Samuel 13:15, NTV)"),
            ("¿Qué dijo Tamar a Amnón cuando este la echó?", "Que mandarla así era peor que lo que ya había hecho. (2 Samuel 13:16, NTV)"),
            ("¿Quién guardó silencio al oír lo ocurrido, pero aborreció a Amnón?", "Absalón, hermano de Tamar. (2 Samuel 13:22, NTV)"),
            ("¿Dónde invitó Absalón a Amnón bajo pretexto de una fiesta?", "A Baal-hazor, durante la esquila de sus ovejas. (2 Samuel 13:23–27, NTV)"),
            ("¿Qué hicieron los siervos de Absalón a Amnón en la fiesta?", "Lo mataron por orden de Absalón. (2 Samuel 13:28–29, NTV)"),
        ],
    },
    {
        "slug": "2-samuel-14-absalon-regresa",
        "title": "2 Samuel 14 — Absalón regresa",
        "cards": [
            ("¿Dónde había huido Absalón después de matar a Amnón?", "A Gesur, con Talmai hijo de Amiud. (2 Samuel 13:37–38, NTV)"),
            ("¿Qué sentía David respecto a Absalón después de tres años?", "Añoraba ir a él, porque ya se había consolado de la muerte de Amnón. (2 Samuel 13:38–39, NTV)"),
            ("¿Quién envió a una mujer de Tecoa para hablar con David?", "Joab. (2 Samuel 14:1–3, NTV)"),
            ("¿Qué historia fingió la mujer de Tecoa ante David?", "Que uno de sus hijos había matado al otro y la familia quería ejecutar al asesino. (2 Samuel 14:5–7, NTV)"),
            ("¿Qué juramento hizo David a la mujer sobre su hijo?", "Que ni un solo cabello de su hijo caería a tierra. (2 Samuel 14:10–11, NTV)"),
            ("¿Qué conclusión sacó David cuando la mujer aplicó la parábola a Absalón?", "Que debía traer de vuelta a su hijo desterrado. (2 Samuel 14:13, NTV)"),
            ("¿Qué condición puso David para el regreso de Absalón?", "Que viniera a Jerusalén pero no viera la cara del rey. (2 Samuel 14:24, NTV)"),
            ("¿Cuánto tiempo estuvo Absalón en Jerusalén sin ver el rostro de David?", "Dos años completos. (2 Samuel 14:28, NTV)"),
        ],
    },
    {
        "slug": "2-samuel-15-conspiracion-de-absalon",
        "title": "2 Samuel 15 — Conspiración de Absalón",
        "cards": [
            ("¿Qué hacía Absalón al principio para ganarse el corazón de Israel?", "Se ponía junto a la puerta y ofrecía justicia a quien venía al rey. (2 Samuel 15:1–6, NTV)"),
            ("¿Qué pretexto usó Absalón para ir a Hebrón?", "Cumplir un voto que había hecho al Señor en Aram. (2 Samuel 15:7–9, NTV)"),
            ("¿Qué señal acordó Absalón con sus seguidores en Hebrón?", "Que cuando oyeran el sonido de la trompeta dirían que Absalón reinaba en Hebrón. (2 Samuel 15:10, NTV)"),
            ("¿Quién fue el consejero de David que se pasó a Absalón?", "Ahitofel. (2 Samuel 15:12, NTV)"),
            ("¿Con quién dejó David diez concubinas al huir de Jerusalén?", "Para que cuidaran la casa. (2 Samuel 15:16, NTV)"),
            ("¿Qué respondió Itai el geteo cuando David le dijo que volviera?", "Que donde estuviera el rey, allí estaría él, viva o muerta. (2 Samuel 15:19–21, NTV)"),
            ("¿Qué hizo David con el arca cuando los sacerdotes la querían llevar?", "Ordenó que la llevaran de vuelta a la ciudad. (2 Samuel 15:25–29, NTV)"),
            ("¿Quién subió la colina llorando y con la cabeza cubierta al huir David?", "David mismo, y todo el pueblo que iba con él. (2 Samuel 15:30, NTV)"),
        ],
    },
    {
        "slug": "2-samuel-16-david-huye-simei",
        "title": "2 Samuel 16 — David huye; Simei",
        "cards": [
            ("¿Quién salió de Bahurim a maldecir y arrojar piedras a David?", "Simei, hijo de Gera, de la familia de la casa de Saúl. (2 Samuel 16:5–6, NTV)"),
            ("¿Qué decía Simei mientras maldecía a David?", "Que el Señor le había devuelto el reino a la casa de Saúl. (2 Samuel 16:8, NTV)"),
            ("¿Qué quería hacer Abisai con Simei?", "Pasar y quitarle la cabeza. (2 Samuel 16:9, NTV)"),
            ("¿Por qué David no permitió que mataran a Simei?", "Porque quizá el Señor lo había mandado a maldecirlo. (2 Samuel 16:10–12, NTV)"),
            ("¿Qué consejo dio Ahitofel a Absalón respecto a las concubinas de David?", "Que se acostara con ellas a la vista de todo Israel. (2 Samuel 16:20–22, NTV)"),
            ("¿Dónde puso Absalón su tienda de campaña para el acto?", "Sobre el terrado de la casa, a la vista de todo Israel. (2 Samuel 16:22, NTV)"),
            ("¿Cómo se sintió David al enterarse de lo que hizo Absalón?", "Se afligió, pero confió en que el Señor lo haría bien. (2 Samuel 16:23, NTV)"),
            ("¿Qué se dice de los consejos de Ahitofel ante David y Absalón?", "Eran como si uno consultara la palabra de Dios. (2 Samuel 16:23, NTV)"),
        ],
    },
    {
        "slug": "2-samuel-17-ahitofel-y-husai",
        "title": "2 Samuel 17 — Ahitofel y Husai",
        "cards": [
            ("¿Qué consejo dio Ahitofel para matar a David de inmediato?", "Perseguirlo esa misma noche con doce mil hombres. (2 Samuel 17:1–3, NTV)"),
            ("¿Por qué Absalón y los ancianos prefirieron el consejo de Husai?", "Porque el Señor había determinado anular el buen consejo de Ahitofel. (2 Samuel 17:14, NTV)"),
            ("¿Qué consejo contrario dio Husai?", "Reunir a todo Israel desde Dan hasta Beerseba y luego atacar. (2 Samuel 17:11–13, NTV)"),
            ("¿A quién envió Husai a avisar a David desde En-rogel?", "A los sacerdotes Zadok y Abiatar. (2 Samuel 17:15–16, NTV)"),
            ("¿Qué hicieron los siervos de David cuando los buscadores de Absalón los encontraron?", "Se escondieron en un pozo en Bahurim. (2 Samuel 17:17–20, NTV)"),
            ("¿Qué hizo una mujer para despistar a los hombres de Absalón?", "Cubrió la boca del pozo y dijo que no había nadie. (2 Samuel 17:18–20, NTV)"),
            ("¿Qué hizo Ahitofel cuando vio que no se siguió su consejo?", "Se fue a su casa, puso sus asuntos en orden y se ahorcó. (2 Samuel 17:23, NTV)"),
            ("¿Dónde acampó David cuando llegó el aviso de Husai?", "Al otro lado del Jordán, en Mahanaim. (2 Samuel 17:24–27, NTV)"),
        ],
    },
    {
        "slug": "2-samuel-18-muerte-de-absalon",
        "title": "2 Samuel 18 — Muerte de Absalón",
        "cards": [
            ("¿Cuántas divisiones puso David para la batalla contra Absalón?", "Tres: Joab, Abisai e Itai el geteo. (2 Samuel 18:1–2, NTV)"),
            ("¿Qué orden dio David a sus comandantes respecto a Absalón?", "Que trataran con cuidado al joven Absalón. (2 Samuel 18:5, NTV)"),
            ("¿Dónde se libró la batalla?", "En el bosque de Efraín. (2 Samuel 18:6, NTV)"),
            ("¿Qué le ocurrió a Absalón cuando cabalgaba bajo las ramas espesas?", "Su cabeza quedó atrapada en una encina y quedó colgando. (2 Samuel 18:9, NTV)"),
            ("¿Quién mató a Absalón a pesar de la orden de David?", "Joab, con tres dardos en el corazón. (2 Samuel 18:14–15, NTV)"),
            ("¿Dónde echaron el cuerpo de Absalón?", "En un gran hoyo en el bosque y levantaron un montón de piedras sobre él. (2 Samuel 18:17, NTV)"),
            ("¿Cómo reaccionó David al oír que Absalón estaba muerto?", "Se entregó al dolor y clamó: «¡Hijo mío Absalón!» (2 Samuel 18:33, NTV)"),
            ("¿Qué mensaje envió el mensajero a David desde la batalla?", "Que el Señor le había entregado hoy a quienes se levantaron contra él. (2 Samuel 18:31, NTV)"),
        ],
    },
    {
        "slug": "2-samuel-19-david-regresa",
        "title": "2 Samuel 19 — David regresa",
        "cards": [
            ("¿Qué dijo Joab a David por llorar demasiado por Absalón?", "Que había avergonzado a todos los que salvaron su vida. (2 Samuel 19:5–7, NTV)"),
            ("¿Qué hizo David después del reproche de Joab?", "Se sentó a la puerta, y todo el pueblo vino a él. (2 Samuel 19:8, NTV)"),
            ("¿Qué pidió Simei a David cuando este cruzaba el Jordán?", "Perdón por haberlo maldecido el día que salió de Jerusalén. (2 Samuel 19:18–20, NTV)"),
            ("¿Qué respondió David a los que querían matar a Simei?", "Que nadie moriría ese día, porque era día de regocijo por su regreso. (2 Samuel 19:22–23, NTV)"),
            ("¿Por qué Mefiboset no había cuidado sus pies ni su barba mientras David estaba ausente?", "Porque esperaba el regreso del rey. (2 Samuel 19:24, NTV)"),
            ("¿Qué disputa hubo entre las tribus del norte y Judá sobre el regreso de David?", "Judá acusó a Israel de no haber traído al rey; Israel respondió que tenían diez partes en David. (2 Samuel 19:41–43, NTV)"),
            ("¿Quién intentó provocar una nueva rebelión diciendo que David no los había repartido botín?", "Seba hijo de Bicri, hombre de Benjamín. (2 Samuel 20:1, NTV)"),
            ("¿A qué ciudad llegó David al regresar a su casa en Jerusalén?", "Jerusalén. (2 Samuel 19:33, NTV)"),
        ],
    },
    {
        "slug": "2-samuel-20-rebelion-de-seba",
        "title": "2 Samuel 20 — Rebelión de Seba",
        "cards": [
            ("¿Qué grito hizo Seba hijo de Bicri contra David?", "Que no tenían parte en David ni herencia en el hijo de Isaí. (2 Samuel 20:1, NTV)"),
            ("¿A qué tribu se unieron todos los hombres de Israel tras el grito de Seba?", "Se siguieron a Seba, pero Judá siguió fiel a David. (2 Samuel 20:2, NTV)"),
            ("¿A quién dejó David en Jerusalén con diez concubinas?", "Para que cuidaran la casa. (2 Samuel 20:3, NTV)"),
            ("¿A quién envió David contra Seba?", "A Amasa para reunir a los hombres de Judá. (2 Samuel 20:4–5, NTV)"),
            ("¿Qué hizo Joab a Amasa en Gabaón?", "Lo hirió de muerte con la espada. (2 Samuel 20:9–10, NTV)"),
            ("¿A qué ciudad sitió Joab cuando perseguía a Seba?", "Abel-bet-maaca. (2 Samuel 20:14–15, NTV)"),
            ("¿Qué consejo dio una mujer sabia desde la muralla?", "Entregar la cabeza de Seba para salvar la ciudad. (2 Samuel 20:16–22, NTV)"),
            ("¿Qué hicieron con la cabeza de Seba?", "La arrojaron a Joab, y él tocó la trompeta para retirar al ejército. (2 Samuel 20:22, NTV)"),
        ],
    },
    {
        "slug": "2-samuel-21-gabaonitas-y-gigantes",
        "title": "2 Samuel 21 — Gabaonitas y gigantes",
        "cards": [
            ("¿Qué aflicción hubo en los días de David según el inicio del capítulo?", "Hambre durante tres años consecutivos. (2 Samuel 21:1, NTV)"),
            ("¿Por qué el Señor envió el hambre según la respuesta a David?", "Por culpa de Saúl y su casa de sangre contra los gabaonitas. (2 Samuel 21:1, NTV)"),
            ("¿Qué pidieron los gabaonitas como compensación?", "Siete descendientes de Saúl para ejecutarlos ante el Señor en Gabaón. (2 Samuel 21:4–6, NTV)"),
            ("¿Quiénes fueron entregados de la casa de Saúl?", "Armoni y Mefiboset, hijos de Saúl con Rizpa, y cinco hijos de Mical. (2 Samuel 21:8–9, NTV)"),
            ("¿Qué hizo Rizpa con las osamentas de sus hijos?", "Los protegió del rocío y del calor sobre la peña desde la siega hasta la lluvia. (2 Samuel 21:10, NTV)"),
            ("¿Qué hizo David con los huesos de Saúl y Jonatán?", "Los recogió y los sepultó en la tumba de Cis. (2 Samuel 21:12–14, NTV)"),
            ("¿Contra quién hubo más guerra después de esto?", "Contra los filisteos. (2 Samuel 21:15, NTV)"),
            ("¿Qué le sucedió a David en la batalla contra un gigante filisteo?", "Se cansó, y Abisai lo socorrió y mató al filisteo. (2 Samuel 21:15–17, NTV)"),
        ],
    },
    {
        "slug": "2-samuel-22-cantico-de-david",
        "title": "2 Samuel 22 — Cántico de David",
        "cards": [
            ("¿Cuándo cantó David el cántico que comienza este capítulo?", "El día que el Señor lo libró de todos sus enemigos y de Saúl. (2 Samuel 22:1, NTV)"),
            ("¿A quién llama David su roca, fortaleza y libertador?", "Al Señor. (2 Samuel 22:2–3, NTV)"),
            ("¿De dónde dice David que el Señor lo oyó?", "De su templo. (2 Samuel 22:7, NTV)"),
            ("¿Qué hizo la tierra cuando el Señor descendió en ira?", "Tembló y se estremecieron los cimientos. (2 Samuel 22:8, NTV)"),
            ("¿Cómo describe David la intervención del Señor en su angustia?", "Que lo tomó y lo sacó de aguas profundas. (2 Samuel 22:17, NTV)"),
            ("¿Qué recompensa dice David que el Señor le da por su rectitud?", "Que le paga conforme a la limpieza de sus manos. (2 Samuel 22:21, NTV)"),
            ("¿A quién dice David que enseña sus caminos?", "A los que le temen. (2 Samuel 22:31, NTV)"),
            ("¿Cómo concluye David el cántico respecto a su reino?", "Que Dios es su torre de salvación y muestra misericordia a su rey. (2 Samuel 22:51, NTV)"),
        ],
    },
    {
        "slug": "2-samuel-23-valientes-de-david",
        "title": "2 Samuel 23 — Valientes de David",
        "cards": [
            ("¿Cómo se titula David en las últimas palabras registradas aquí?", "Hijo de Isaí, hombre alzado por el Altísimo, el ungido del Dios de Jacob. (2 Samuel 23:1, NTV)"),
            ("¿Qué compara David con la luz de la mañana?", "Que un gobernante justo es como la luz de la mañana sin nubes. (2 Samuel 23:3–4, NTV)"),
            ("¿Quién era el capitán de los treinta valientes?", "Josheb-bashebet el tacmonita, jefe de los tres. (2 Samuel 23:8, NTV)"),
            ("¿Qué hizo Eleazar hijo de Dodo en Pas-damim?", "Luchó hasta que su mano se pegó a la espada, y el Señor dio gran victoria. (2 Samuel 23:9–10, NTV)"),
            ("¿Qué pidió David en la cueva de Adulam que tres valientes arriesgaron conseguir?", "Un poco de agua del pozo de Belén junto a la puerta. (2 Samuel 23:13–16, NTV)"),
            ("¿Qué hizo David con el agua que le trajeron los tres?", "No la bebió, sino que la derramó como ofrenda al Señor. (2 Samuel 23:16–17, NTV)"),
            ("¿Quién era Urías el hitita entre los valientes?", "Uno de los treinta y siete en total. (2 Samuel 23:39, NTV)"),
            ("¿Cuántos valientes se nombran en la lista final del capítulo?", "Treinta y siete en total. (2 Samuel 23:39, NTV)"),
        ],
    },
    {
        "slug": "2-samuel-24-censo-y-plaga",
        "title": "2 Samuel 24 — Censo y plaga",
        "cards": [
            ("¿Qué movió a David a hacer un censo de Israel y Judá?", "La ira del Señor contra Israel. (2 Samuel 24:1, NTV)"),
            ("¿A quiénes envió David para el censo?", "A Joab, comandante del ejército, con los capitanes. (2 Samuel 24:2, NTV)"),
            ("¿Cuántos meses tardó el censo?", "Nueve meses y veinte días. (2 Samuel 24:8, NTV)"),
            ("¿Cuántos hombres valientes contó Joab en Israel?", "Ochocientos mil; en Judá, quinientos mil. (2 Samuel 24:9, NTV)"),
            ("¿Qué opciones ofreció el profeta Gad a David como castigo?", "Tres años de hambre, tres meses de fuga ante enemigos, o tres días de peste. (2 Samuel 24:11–13, NTV)"),
            ("¿Qué castigo eligió David?", "Caer en las manos del Señor, porque sus misericordias son muchas. (2 Samuel 24:14, NTV)"),
            ("¿Cuántos murieron en la plaga en Israel?", "Setenta mil hombres. (2 Samuel 24:15, NTV)"),
            ("¿Dónde construyó David un altar para detener la plaga?", "En la era de Arauna el jebuseo. (2 Samuel 24:18–25, NTV)"),
        ],
    },
]


def slugify(text: str, max_len: int = 60) -> str:
    text = text.lower()
    text = (
        text.replace("¿", "")
        .replace("?", "")
        .replace("«", "")
        .replace("»", "")
        .replace("'", "")
    )
    text = unicodedata.normalize("NFKD", text)
    text = "".join(c for c in text if not unicodedata.combining(c))
    text = re.sub(r"[^a-z0-9]+", "-", text)
    text = re.sub(r"-+", "-", text).strip("-")
    return text[:max_len].rstrip("-")


def write_card(folder: Path, slug: str, question: str, answer: str, note_slug: str, title: str) -> Path:
    folder.mkdir(parents=True, exist_ok=True)
    path = folder / f"{slug}.md"
    content = (
        "#flashcard\n\n"
        f"# {question}\n\n"
        "?\n"
        f"{answer}\n\n"
        "---\n"
        f"[[notes/{note_slug}|{title}]]\n"
    )
    path.write_text(content, encoding="utf-8")
    return path


def parse_card(path: Path) -> dict | None:
    text = path.read_text(encoding="utf-8")
    if "#flashcard" not in text:
        return None
    m = re.search(r"^#\s+(.+?)\s*\n\n\?\s*\n(.+?)(?:\n---|\Z)", text, re.M | re.S)
    if not m:
        return None
    q = m.group(1).strip()
    a_block = m.group(2).strip()
    a_core = re.sub(r"\s*\([^)]*\)\s*$", "", a_block).strip().lower()
    a_core = re.sub(r"[«»\"'.,;:!?¿¡\-—–]", "", a_core)
    a_core = re.sub(r"\s+", " ", a_core)
    q_norm = re.sub(r"[¿?«»\"'.,;:!¡\-—–]", "", q.lower())
    q_norm = re.sub(r"\s+", " ", q_norm)
    return {
        "path": path,
        "rel": str(path.relative_to(VAULT)),
        "q": q,
        "a": a_block,
        "a_core": a_core,
        "q_norm": q_norm,
        "len_q": len(q),
    }


def similar_q(a: str, b: str) -> bool:
    if a == b:
        return True
    r = SequenceMatcher(None, a, b).ratio()
    if r >= 0.82:
        return True
    stop = {
        "que", "el", "la", "los", "las", "de", "del", "en", "a", "al", "y", "o",
        "por", "para", "con", "su", "sus", "un", "una", "como", "cuando", "donde",
        "quien", "cual", "segun", "despues", "antes", "sobre", "entre", "se", "lo",
        "le", "les", "fue", "era", "habia", "ese", "esa", "esto", "esta", "este",
    }
    ta = set(a.split()) - stop
    tb = set(b.split()) - stop
    if not ta or not tb:
        return False
    inter = len(ta & tb)
    union = len(ta | tb)
    return inter / union >= 0.65 and r >= 0.55


def dedupe_deck() -> list[str]:
    cards = []
    for p in VAULT.rglob("*.md"):
        if p.name == "index.md":
            continue
        c = parse_card(p)
        if c:
            cards.append(c)
    removed: list[str] = []
    to_remove: set[Path] = set()
    for i in range(len(cards)):
        if cards[i]["path"] in to_remove:
            continue
        for j in range(i + 1, len(cards)):
            if cards[j]["path"] in to_remove:
                continue
            if cards[i]["a_core"] != cards[j]["a_core"]:
                continue
            if not similar_q(cards[i]["q_norm"], cards[j]["q_norm"]):
                continue
            keep, drop = cards[i], cards[j]
            if drop["len_q"] > keep["len_q"]:
                keep, drop = drop, keep
            to_remove.add(drop["path"])
            removed.append(str(drop["rel"]))
    for p in to_remove:
        p.unlink()
    return removed


def chapter_order_key(folder: str) -> tuple:
    if folder.startswith("2-samuel-"):
        m = re.match(r"2-samuel-(\d+)", folder)
        return (2, int(m.group(1)) if m else 0, folder)
    if folder.startswith("samuel-"):
        m = re.match(r"samuel-(\d+)", folder)
        return (1, int(m.group(1)) if m else 0, folder)
    return (9, 0, folder)


CHAPTER_TITLES = {c["slug"]: c["title"] for c in CHAPTERS}
# 1 Samuel titles from chapters.ts (manual mirror)
CHAPTER_TITLES.update(
    {
        "samuel-1-2-ana-samuel-y-eli": "1 Samuel 1–2 — Ana, Samuel y Elí",
        "samuel-3-4-llamado-y-arca": "1 Samuel 3–4 — Llamado de Samuel y el arca",
        "samuel-5-7-arca-y-regreso": "1 Samuel 5–7 — El arca y el regreso a Israel",
        "samuel-8-10-israel-pide-rey": "1 Samuel 8–10 — Israel pide un rey",
        "samuel-11-saul-libera-jabes": "1 Samuel 11 — Saúl libera a Jabes",
        "samuel-12-samuel-se-despide": "1 Samuel 12 — Samuel se despide como juez",
        "samuel-13-sacrificio-de-saul": "1 Samuel 13 — El sacrificio de Saúl",
        "samuel-14-jonathan-y-los-filisteos": "1 Samuel 14 — Jonatán y los filisteos",
        "samuel-15-saul-y-los-amalecitas": "1 Samuel 15 — Saúl y los amalecitas",
        "samuel-16-david-ungeido": "1 Samuel 16 — David ungido",
        "samuel-17-david-y-goliat": "1 Samuel 17 — David y Goliat",
        "samuel-18-saul-y-david": "1 Samuel 18 — Saúl y David",
        "samuel-19-david-huye-de-saul": "1 Samuel 19 — David huye de Saúl",
        "samuel-20-jonathan-y-david": "1 Samuel 20 — Jonatán y David",
        "samuel-21-david-en-nob-y-gat": "1 Samuel 21 — David en Nob y Gat",
        "samuel-22-cueva-de-adulam": "1 Samuel 22 — Cueva de Adulam",
    }
)


def regenerate_index() -> int:
    folders = sorted(
        {p.parent.name for p in VAULT.rglob("*.md") if p.name != "index.md"},
        key=chapter_order_key,
    )
    lines = ["# Índice de flashcards", ""]
    total = 0
    body: list[str] = []
    for folder in folders:
        title = CHAPTER_TITLES.get(folder, folder.replace("-", " "))
        cards = []
        for p in sorted((VAULT / folder).glob("*.md")):
            c = parse_card(p)
            if c:
                cards.append(c)
        if not cards:
            continue
        total += len(cards)
        body.append(f"## {title}")
        body.append("")
        for c in cards:
            q = c["q"]
            display = q if len(q) <= 75 else q[:72] + "…"
            rel = c["rel"].replace(".md", "")
            body.append(f"- [[flashcards/{rel}|{display}]]")
        body.append("")
    lines.append(f"Total: **{total}** tarjetas.")
    lines.append("")
    lines.extend(body)
    (VAULT / "index.md").write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")
    return total


def write_notes():
    NOTES.mkdir(parents=True, exist_ok=True)
    for ch in CHAPTERS:
        note_path = NOTES / f"{ch['slug']}.md"
        if note_path.exists():
            continue
        note_path.write_text(
            f"# {ch['title']}\n\nNotas de contexto (2 Samuel, NTV).\n",
            encoding="utf-8",
        )


def generate_samuel2() -> int:
    write_notes()
    count = 0
    used_slugs: dict[str, set[str]] = {}
    for ch in CHAPTERS:
        folder = VAULT / ch["slug"]
        used_slugs[ch["slug"]] = set()
        for q, a in ch["cards"]:
            base = slugify(q)
            slug = base
            n = 2
            while slug in used_slugs[ch["slug"]]:
                slug = f"{base[:50]}-{n}"
                n += 1
            used_slugs[ch["slug"]].add(slug)
            write_card(folder, slug, q, a, ch["slug"], ch["title"])
            count += 1
    return count


if __name__ == "__main__":
    import sys

    cmd = sys.argv[1] if len(sys.argv) > 1 else "all"
    if cmd == "samuel2":
        n = generate_samuel2()
        print(json.dumps({"added_samuel2": n}))
    elif cmd == "dedupe":
        removed = dedupe_deck()
        print(json.dumps({"removed": removed, "count": len(removed)}))
    elif cmd == "index":
        total = regenerate_index()
        print(json.dumps({"total": total}))
    elif cmd == "all":
        removed2 = dedupe_deck()
        total = regenerate_index()
        print(json.dumps({"removed_round2": removed2, "total": total}))
