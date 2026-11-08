#!/usr/bin/env python3
"""Generate Josué atomic NTV flashcards; rebuild index and chapters.ts."""
from __future__ import annotations

import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VAULT = ROOT / "obsidian-vault" / "flashcards"
NOTES = ROOT / "obsidian-vault" / "notes"
INDEX = VAULT / "index.md"
CHAPTERS_TS = ROOT / "src" / "lib" / "chapters.ts"


def slugify(text: str, limit: int = 70) -> str:
    text = unicodedata.normalize("NFKD", text)
    text = "".join(c for c in text if not unicodedata.combining(c))
    text = text.lower()
    text = re.sub(r"[¿?¡!«»\"'`.,:;()\[\]—–-]+", " ", text)
    text = re.sub(r"[^a-z0-9\s-]", "", text)
    text = re.sub(r"\s+", "-", text.strip())
    return text[:limit].rstrip("-")


def md(question: str, answer: str, slug: str, title: str) -> str:
    return (
        "#flashcard\n\n"
        f"# {question}\n\n"
        "?\n"
        f"{answer}\n\n"
        "---\n"
        f"[[notes/{slug}|{title}]]\n"
    )


def cite(book: str, ch: int, verse: str, answer: str) -> str:
    ans = answer.rstrip(".")
    return f"{ans}. ({book} {ch}:{verse}, NTV)"


def write_chapter(slug: str, title: str, book: str, ch: int, cards: list[tuple[str, str, str]]) -> int:
    folder = VAULT / slug
    folder.mkdir(parents=True, exist_ok=True)
    n = 0
    used: set[str] = set()
    for q, a, verse in cards:
        name = slugify(q)
        if name in used:
            name = f"{name}-{verse.replace(':', '-')}"
        used.add(name)
        (folder / f"{name}.md").write_text(
            md(q, cite(book, ch, verse, a), slug, title), encoding="utf-8"
        )
        n += 1
    return n


CHAPTERS: list[tuple[str, str, str, int, list[tuple[str, str, str]]]] = []


def add(slug: str, title: str, book: str, ch: int, cards: list[tuple[str, str, str]]):
    CHAPTERS.append((slug, title, book, ch, cards))


add(
    "josue-1-encargo-a-josue",
    "Josué 1 — Encargo a Josué",
    "Josué",
    1,
    [
        ("Después de la muerte de Moisés, ¿a quién habló el Señor?", "A Josué hijo de Nun, ayudante de Moisés", "1"),
        ("¿Qué ordenó el Señor a Josué respecto al pueblo?", "Que se prepararan para cruzar el Jordán hacia la tierra que Él les daba", "2"),
        ("¿Hasta dónde prometió Dios darles toda la tierra que pisaran?", "Desde el desierto y el Líbano hasta el gran río Éufrates, y hasta el mar Grande", "3-4"),
        ("¿Qué promesa de presencia le dio Dios a Josué como a Moisés?", "Que estaría con él y no lo abandonaría", "5"),
        ("¿Qué debía hacer Josué con el libro de la ley día y noche?", "Meditarlo para cuidar de cumplir todo lo escrito en él", "8"),
        ("¿Qué exhortación repetida le dio el Señor a Josué?", "Que fuera fuerte y valiente, sin temor ni desaliento", "6-9"),
        ("¿Qué ordenaron los oficiales al pueblo sobre el cruce?", "Que se prepararan provisiones, porque en tres días cruzarían el Jordán", "10-11"),
        ("¿A qué tribus les recordó Josué su compromiso de ayudar a sus hermanos?", "A Rubén, Gad y la media tribu de Manasés", "12-15"),
        ("¿Qué respondió el pueblo a Josué sobre obedecerlo?", "Que lo obedecerían como habían obedecido a Moisés, y que el Señor estuviera con él", "16-17"),
        ("¿Qué pena mencionaron para quien se rebelara contra las órdenes de Josué?", "Que fuera muerto", "18"),
    ],
)

add(
    "josue-2-rahab-y-los-espias",
    "Josué 2 — Rajab y los espías",
    "Josué",
    2,
    [
        ("¿A dónde envió Josué dos espías desde Sitim?", "A explorar la tierra, especialmente Jericó", "1"),
        ("¿En casa de quién se hospedaron los espías en Jericó?", "En casa de Rajab, una prostituta", "1"),
        ("¿Qué le ordenó el rey de Jericó a Rajab?", "Que entregara a los hombres que habían entrado en su casa", "3"),
        ("¿Cómo ocultó Rajab a los espías?", "Los escondió entre los manojos de lino en la azotea", "4-6"),
        ("¿Qué dijo Rajab que sabía acerca del Señor y de Israel?", "Que el Señor había dado la tierra a Israel y que el terror de ellos había caído sobre los habitantes", "9"),
        ("¿Qué hechos del Éxodo mencionó Rajab como motivo de temor?", "El secamiento del mar Rojo y la derrota de Sehón y Og", "10"),
        ("¿Qué confesión hizo Rajab sobre el Señor?", "Que el Señor es Dios arriba en los cielos y abajo en la tierra", "11"),
        ("¿Qué pidió Rajab a cambio de haber salvado a los espías?", "Que salvaran la vida de su padre, madre, hermanos y toda su familia", "12-13"),
        ("¿Cómo debía marcar Rajab su casa para ser salvada?", "Atando un cordón rojo en la ventana por donde los bajó", "18"),
        ("¿Dónde se ocultaron los espías tres días antes de volver a Josué?", "En el monte", "22"),
        ("¿Qué informe dieron los espías a Josué al regresar?", "Que el Señor había entregado toda la tierra y que los habitantes estaban aterrados", "23-24"),
    ],
)

add(
    "josue-3-cruce-del-jordan",
    "Josué 3 — Cruce del Jordán",
    "Josué",
    3,
    [
        ("¿Desde dónde partió Israel temprano hacia el Jordán?", "Desde Sitim", "1"),
        ("¿Quiénes debían llevar el arca del pacto delante del pueblo?", "Los sacerdotes levitas", "3"),
        ("¿Qué distancia debían guardar entre el pueblo y el arca?", "Como dos mil codos", "4"),
        ("¿Qué les dijo Josué al pueblo antes de cruzar?", "Que se santificaran, porque el Señor haría maravillas entre ellos", "5"),
        ("¿Qué prometió Dios hacer con Josué aquel día ante Israel?", "Exaltarlo a los ojos de todo Israel para que supieran que Él estaba con él como con Moisés", "7"),
        ("¿Qué debían hacer los sacerdotes al llegar a la orilla del Jordán?", "Detenerse en el Jordán", "8"),
        ("¿Cómo sabrían que el Dios vivo estaba entre ellos?", "Porque el arca iría delante y Él expulsaría a los cananeos y demás pueblos", "10"),
        ("¿En qué época del año estaba el Jordán desbordado?", "En tiempo de la cosecha", "15"),
        ("¿Qué ocurrió cuando los pies de los sacerdotes tocaron el agua?", "Las aguas que venían de arriba se detuvieron en un montón", "15-16"),
        ("¿Dónde se detuvieron las aguas del Jordán?", "Muy lejos, cerca de Adam, la ciudad junto a Zaretán", "16"),
        ("¿Hasta cuándo permanecieron los sacerdotes en medio del Jordán?", "Hasta que todo el pueblo acabó de cruzar", "17"),
    ],
)

add(
    "josue-4-doce-piedras",
    "Josué 4 — Doce piedras memoriales",
    "Josué",
    4,
    [
        ("¿Cuántos hombres debían tomar una piedra del Jordán?", "Doce hombres, uno por cada tribu", "2-4"),
        ("¿De dónde debían sacar las piedras?", "Del lugar donde se detuvieron los pies de los sacerdotes en medio del Jordán", "3"),
        ("¿Para qué servirían las piedras según Josué?", "Como señal memorial para que los hijos preguntaran qué significaban", "6-7"),
        ("¿Qué respuesta debían dar a sus hijos sobre las piedras?", "Que las aguas del Jordán se cortaron delante del arca del Señor", "7"),
        ("¿Dónde colocó Josué también doce piedras?", "En medio del Jordán, donde habían estado los pies de los sacerdotes", "9"),
        ("¿Quiénes cruzaron armados delante de los israelitas, según Moisés?", "Los de Rubén, Gad y la media tribu de Manasés", "12"),
        ("¿Cuántos hombres armados de aquellas tribus cruzaron?", "Como cuarenta mil preparados para la guerra", "13"),
        ("¿Qué hizo el Señor con Josué aquel día ante todo Israel?", "Lo exaltó, y le tuvieron respeto como a Moisés", "14"),
        ("¿Qué ordenó el Señor cuando el pueblo terminó de cruzar?", "Que Josué mandara a los sacerdotes salir del Jordán con el arca", "15-17"),
        ("¿Qué ocurrió cuando los sacerdotes salieron a tierra seca?", "Las aguas del Jordán volvieron a su lugar y se desbordaron como antes", "18"),
        ("¿En qué día del mes primero acampó el pueblo en Gilgal?", "El día diez del mes primero", "19"),
        ("¿Con qué milagro comparó Josué el secamiento del Jordán?", "Con el secamiento del mar Rojo", "23"),
    ],
)

add(
    "josue-5-circuncision-y-pascua",
    "Josué 5 — Circuncisión y Pascua",
    "Josué",
    5,
    [
        ("¿Cómo reaccionaron los reyes de los amorreos y cananeos al saber del cruce?", "Se desanimó su corazón y no les quedó ánimo ante Israel", "1"),
        ("¿Qué mandó el Señor a Josué hacer con cuchillos de pedernal?", "Circuncidar de nuevo a los hijos de Israel", "2"),
        ("¿Por qué había que circuncidar a aquella generación?", "Porque todos los nacidos en el desierto no habían sido circuncidados", "4-5"),
        ("¿Cuántos años anduvo Israel por el desierto hasta consumirse la generación anterior?", "Cuarenta años", "6"),
        ("¿Cómo se llamó el lugar donde se sanaron después de la circuncisión?", "Gilgal", "9"),
        ("¿Qué celebró Israel en la tarde del día catorce del mes en los llanos de Jericó?", "La Pascua", "10"),
        ("¿Qué comieron al día siguiente de la Pascua?", "Del fruto de la tierra: panes sin levadura y grano tostado", "11"),
        ("¿Qué cesó el día después de comer del producto de la tierra?", "El maná", "12"),
        ("¿A quién vio Josué cerca de Jericó con una espada desenvainada?", "Al príncipe del ejército del Señor", "13-14"),
        ("¿De qué lado dijo estar aquel hombre?", "Que era el príncipe del ejército del Señor", "14"),
        ("¿Qué ordenó el príncipe a Josué respecto al calzado?", "Que se lo quitara, porque el lugar era santo", "15"),
    ],
)

add(
    "josue-6-caida-de-jerico",
    "Josué 6 — Caída de Jericó",
    "Josué",
    6,
    [
        ("¿Cómo estaba Jericó por causa de los israelitas?", "Bien cerrada; nadie salía ni entraba", "1"),
        ("¿Qué prometió el Señor entregar en mano de Josué?", "Jericó, su rey y sus hombres de guerra", "2"),
        ("¿Cuántos días debían rodear la ciudad una vez al día?", "Seis días", "3"),
        ("¿Cuántos sacerdotes con trompetas de cuerno de carnero irían delante del arca?", "Siete", "4"),
        ("¿Qué debían hacer el séptimo día?", "Rodear la ciudad siete veces y tocar las trompetas", "4-5"),
        ("¿Qué ocurriría cuando el pueblo gritara al oír el toque prolongado?", "El muro de la ciudad caería", "5"),
        ("¿Qué ordenó Josué sobre el botín de Jericó?", "Que fuera consagrado al Señor; plata, oro, bronce y hierro irían al tesoro", "17-19"),
        ("¿A quiénes debían salvar vivos en Jericó?", "A Rajab y a todos los que estuvieran en su casa", "17"),
        ("¿Qué advertencia dio Josué sobre lo dedicado al anatema?", "Que no tomaran nada de ello, para no traer destrucción al campamento", "18"),
        ("¿Qué hicieron con la ciudad después de caer el muro?", "La destruyeron por completo, hombres, mujeres, niños y animales", "21"),
        ("¿Quiénes sacaron a Rajab y a su familia?", "Los dos jóvenes que habían espiado la tierra", "22-23"),
        ("¿Qué maldición pronunció Josué sobre quien reedificara Jericó?", "Que echaría el cimiento a costa de su primogénito y las puertas a costa de su menor", "26"),
    ],
)

add(
    "josue-7-acan-y-hai",
    "Josué 7 — Acán y Hai",
    "Josué",
    7,
    [
        ("¿Quién tomó del anatema provocando la ira del Señor contra Israel?", "Acán hijo de Carmi, de la tribu de Judá", "1"),
        ("¿A qué ciudad envió Josué hombres desde Jericó?", "A Hai, junto a Bet-avén, al oriente de Betel", "2"),
        ("¿Cuántos hombres recomendaron los espías para atacar Hai?", "Como dos o tres mil", "3"),
        ("¿Cuántos israelitas murieron en la derrota ante Hai?", "Como treinta y seis", "5"),
        ("¿Cómo reaccionó el pueblo tras la derrota?", "Se les derritió el corazón y se volvió como agua", "5"),
        ("¿Qué hizo Josué ante el arca del Señor hasta la tarde?", "Rasgó sus vestidos y se postró en tierra", "6"),
        ("¿Qué reveló el Señor como causa de la derrota?", "Que Israel había pecado tomando del anatema", "11"),
        ("¿Cómo se descubriría al culpable?", "Por suertes: tribu, familia, casa y hombre", "14"),
        ("¿Qué confesó Acán haber tomado?", "Un manto babilónico hermoso, doscientos siclos de plata y una barra de oro de cincuenta siclos", "21"),
        ("¿Dónde había escondido Acán lo robado?", "En la tierra, en medio de su tienda", "21"),
        ("¿Qué hicieron con Acán, su familia y lo robado en el valle de Acor?", "Los apedrearon y los quemaron", "24-25"),
        ("¿Cómo se llamó aquel lugar después?", "Valle de Acor", "26"),
    ],
)

add(
    "josue-8-victoria-sobre-hai",
    "Josué 8 — Victoria sobre Hai",
    "Josué",
    8,
    [
        ("¿Qué le dijo el Señor a Josué después del juicio de Acán?", "Que no temiera, porque entregaría a Hai, su rey, pueblo, ciudad y tierra", "1"),
        ("¿En qué se diferenciaba el botín de Hai del de Jericó?", "Podían tomar para sí el botín y el ganado", "2"),
        ("¿Cuántos hombres valientes escogió Josué para la emboscada?", "Treinta mil", "3"),
        ("¿Dónde debían colocarse los de la emboscada?", "Detrás de la ciudad", "4"),
        ("¿Qué estrategia usó Josué frente a Hai?", "Fingir huida para sacar a los de Hai de la ciudad", "5-6"),
        ("¿Cuántos hombres puso en emboscada entre Betel y Hai?", "Como cinco mil", "12"),
        ("¿Qué hizo Josué con la lanza cuando el Señor se lo indicó?", "La extendió hacia Hai", "18"),
        ("¿Qué hicieron los de la emboscada al ver la señal?", "Se levantaron, entraron en la ciudad y le prendieron fuego", "19"),
        ("¿Qué hicieron con el rey de Hai?", "Lo colgaron de un árbol hasta el atardecer y luego echaron su cadáver a la entrada de la ciudad", "29"),
        ("¿Dónde edificó Josué un altar al Señor conforme a Moisés?", "En el monte Ebal", "30"),
        ("¿Qué escribió Josué sobre las piedras?", "Una copia de la ley de Moisés", "32"),
        ("¿Ante quiénes leyó Josué todas las palabras de la ley, bendiciones y maldiciones?", "Ante toda la asamblea de Israel, con mujeres, niños y extranjeros", "33-35"),
    ],
)

add(
    "josue-9-gabaonitas",
    "Josué 9 — Engaño de los gabaonitas",
    "Josué",
    9,
    [
        ("¿Qué hicieron los reyes de la región al oír lo de Hai?", "Se reunieron de común acuerdo para pelear contra Josué e Israel", "1-2"),
        ("¿Cómo reaccionaron los habitantes de Gabaón?", "Actuaron con astucia fingiendo ser embajadores de lejos", "3-4"),
        ("¿Qué llevaban los gabaonitas para aparentar un viaje largo?", "Sacos viejos, odres rotos y remendados, ropa y calzado gastados, y pan seco y mohoso", "4-5"),
        ("¿Qué pidieron a Josué en Gilgal?", "Hacer un pacto con ellos", "6"),
        ("¿Qué sospecha expresaron los israelitas?", "Que quizás habitaban cerca de ellos", "7"),
        ("¿Consultaron a Josué y los jefes al Señor antes del pacto?", "No; no consultaron la boca del Señor", "14"),
        ("¿Qué pacto hizo Josué con ellos?", "Les juró dejarlos vivir", "15"),
        ("¿Cuándo descubrieron que eran vecinos?", "Al tercer día, al llegar a sus ciudades", "16-17"),
        ("¿Cuáles eran las ciudades de los gabaonitas?", "Gabaón, Cafira, Beerot y Quiriat-jearim", "17"),
        ("¿Por qué no los mató Israel al descubrir el engaño?", "Por el juramento que les habían hecho por el Señor", "18-20"),
        ("¿A qué trabajo los condenó Josué?", "A ser leñadores y aguadores para la congregación y para el altar del Señor", "21-27"),
    ],
)

add(
    "josue-10-sol-en-gabaon",
    "Josué 10 — Sol en Gabaón",
    "Josué",
    10,
    [
        ("¿Quién era el rey de Jerusalén que se alarmó por Gabaón?", "Adonisedec", "1"),
        ("¿Por qué temían a Gabaón?", "Porque era una ciudad grande, como una ciudad real, mayor que Hai, y todos sus hombres eran valientes", "2"),
        ("¿Cuántos reyes amorreos se aliaron contra Gabaón?", "Cinco", "3-5"),
        ("¿A quién pidieron ayuda los gabaonitas?", "A Josué en Gilgal", "6"),
        ("¿Qué le prometió el Señor a Josué sobre aquellos reyes?", "Que no le resistiría ninguno de ellos", "8"),
        ("¿Cómo intervino el Señor en la batalla?", "Sembró confusión entre ellos y lanzó grandes piedras desde el cielo", "10-11"),
        ("¿Qué pidió Josué ante todo Israel en aquel día?", "Que el sol se detuviera en Gabaón y la luna en el valle de Ajalón", "12"),
        ("¿Cuánto tiempo se detuvo el sol?", "Casi un día entero", "13"),
        ("¿Dónde se habían escondido los cinco reyes?", "En una cueva en Maqueda", "16"),
        ("¿Qué hizo Josué con los cinco reyes después de sacarlos?", "Los mató, los colgó de cinco árboles y luego los echó en la cueva", "26-27"),
        ("¿Qué otras ciudades del sur tomó Josué en aquella campaña?", "Maqueda, Libna, Laquis, Eglón, Hebrón y Debir, entre otras", "28-39"),
        ("¿Hasta dónde extendió Josué la conquista en aquella región?", "Desde Cades-barnea hasta Gaza, y toda la tierra de Gosén hasta Gabaón", "41"),
    ],
)

add(
    "josue-11-victoria-en-el-norte",
    "Josué 11 — Victoria en el norte",
    "Josué",
    11,
    [
        ("¿Quién era el rey de Hazor que reunió a los reyes del norte?", "Jabín", "1"),
        ("¿Dónde acamparon las fuerzas coaligadas del norte?", "Junto a las aguas de Merom", "5"),
        ("¿Qué le dijo el Señor a Josué sobre aquella multitud?", "Que no temiera, porque al día siguiente a esa hora Él los entregaría muertos", "6"),
        ("¿Qué debían hacer con los caballos y carros?", "Desjarretar los caballos y quemar los carros", "6"),
        ("¿Cómo atacó Josué a las fuerzas junto a Merom?", "De repente, cayendo sobre ellos", "7"),
        ("¿Qué ciudad especial quemó Josué entre las del norte?", "Hazor", "10-11"),
        ("¿Por qué quemó Hazor en particular?", "Porque antes era la cabeza de todos aquellos reinos", "10"),
        ("¿Tomaron botín de las ciudades del norte?", "Sí; el botín y el ganado, pero a toda persona la mataron", "14"),
        ("¿Qué había mandado el Señor a Moisés que Josué cumplió?", "No dejó nada sin cumplir de todo lo que el Señor había mandado a Moisés", "15"),
        ("¿Cuánto tiempo estuvo Josué haciendo guerra con todos aquellos reyes?", "Mucho tiempo", "18"),
        ("¿Hubo ciudad que hiciera paz con Israel aparte de los heveos de Gabaón?", "Ninguna; todas las tomaron en guerra", "19"),
        ("¿A quiénes destruyó Josué de los montes, desde Hebrón hasta Debir y Anab?", "A los anaceos", "21"),
        ("¿Dónde quedaron aún algunos anaceos?", "En Gaza, Gat y Asdod", "22"),
        ("¿Qué ocurrió con la tierra después de estas conquistas?", "Reposó de la guerra", "23"),
    ],
)

add(
    "josue-12-reyes-derrotados",
    "Josué 12 — Lista de reyes derrotados",
    "Josué",
    12,
    [
        ("¿A qué dos reyes derrotaron Moisés e Israel al oriente del Jordán?", "A Sehón rey de los amorreos y a Og rey de Basán", "1-4"),
        ("¿Desde dónde gobernaba Sehón?", "Desde Hesbón", "2"),
        ("¿Quiénes recibieron la tierra de Sehón y Og?", "Los rubenitas, los gaditas y la media tribu de Manasés", "6"),
        ("¿Cuántos reyes derrotó Josué al occidente del Jordán?", "Treinta y uno", "24"),
        ("¿Qué territorio al occidente se describe como conquistado?", "Desde Baal-gad en el valle del Líbano hasta el monte Halac que sube a Seir", "7"),
        ("¿Quiénes habitaban aquella tierra entre los pueblos mencionados?", "Hititas, amorreos, cananeos, ferezeos, heveos y jebuseos", "8"),
        ("¿Quién fue el rey de Jericó en la lista de Josué?", "El rey de Jericó", "9"),
        ("¿Quién fue el rey de Hai junto a Betel?", "El rey de Hai", "9"),
        ("¿Qué capital del norte encabezó la coalición y aparece en la lista?", "Hazor", "19"),
        ("¿Incluye la lista al rey de Jerusalén?", "Sí", "10"),
    ],
)

add(
    "josue-13-tierra-por-repartir",
    "Josué 13 — Tierra aún por repartir",
    "Josué",
    13,
    [
        ("¿Cómo describe el Señor a Josué al inicio de este capítulo?", "Anciano y entrado en años", "1"),
        ("¿Qué quedaba aún por poseer según el Señor?", "Mucha tierra", "1"),
        ("¿Qué regiones menciona entre la tierra pendiente?", "Los territorios de los filisteos y de los gesureos, entre otros", "2"),
        ("¿A quiénes debía repartir Josué aquella tierra por heredad?", "A Israel, como el Señor había mandado", "6"),
        ("¿Qué tribu no recibió heredad de tierra entre sus hermanos?", "La tribu de Leví", "14"),
        ("¿Cuál era la heredad de los levitas?", "Los sacrificios encendidos del Señor, Dios de Israel", "14"),
        ("¿Qué recibió la tribu de Rubén al oriente?", "Desde Aroer junto al arroyo Arnón, con Hesbón y sus ciudades", "15-17"),
        ("¿Qué territorio recibió Gad?", "Jazer, todas las ciudades de Galaad y la mitad de la tierra de los amonitas, entre otras", "24-25"),
        ("¿Qué recibió la media tribu de Manasés al oriente?", "Desde Mahanaim, todo Basán, el reino de Og, y las villas de Jair", "29-31"),
        ("¿Por qué Leví no recibió porción en la tierra?", "Porque el Señor Dios de Israel era su heredad, como Él les había dicho", "33"),
    ],
)

add(
    "josue-14-caleb-pide-hebron",
    "Josué 14 — Caleb pide Hebrón",
    "Josué",
    14,
    [
        ("¿Quiénes repartieron la tierra en Canaán a los hijos de Israel?", "El sacerdote Eleazar, Josué hijo de Nun y los jefes de las casas paternas", "1"),
        ("¿Cómo se repartió la heredad?", "Por suertes, como el Señor había mandado por medio de Moisés", "2"),
        ("¿Quién se acercó a Josué en Gilgal de parte de Judá?", "Caleb hijo de Jefone el cenezeo", "6"),
        ("¿Cuántos años tenía Caleb cuando Moisés lo envió a espiar desde Cades-barnea?", "Cuarenta años", "7"),
        ("¿Qué testimonio dio Caleb sobre su corazón al espiar la tierra?", "Que lo siguió por completo al Señor su Dios", "8"),
        ("¿Cuántos años tenía Caleb cuando habló con Josué en Gilgal?", "Ochenta y cinco años", "10"),
        ("¿Cómo describió Caleb sus fuerzas a los ochenta y cinco?", "Tan fuerte para la guerra como el día en que Moisés lo envió", "11"),
        ("¿Qué monte pidió Caleb conforme a la palabra del Señor?", "Aquel monte donde estaban los anaceos y ciudades grandes y fortificadas; Hebrón", "12-15"),
        ("¿Qué le dio Josué a Caleb por heredad?", "Hebrón", "13"),
        ("¿Por qué Hebrón fue de Caleb?", "Porque siguió plenamente al Señor Dios de Israel", "14"),
        ("¿Cómo se llamaba antes Hebrón?", "Quiriat-arba, por Arba, el hombre más grande entre los anaceos", "15"),
        ("¿Qué ocurrió con la tierra después de esto?", "Reposó de la guerra", "15"),
    ],
)

add(
    "josue-15-herencia-de-juda",
    "Josué 15 — Herencia de Judá",
    "Josué",
    15,
    [
        ("¿Hasta dónde llegaba el límite sur de la heredad de Judá?", "Hasta el desierto de Zin, al extremo sur", "1"),
        ("¿Qué mar formaba el límite oriental de Judá?", "El mar Salado, hasta la desembocadura del Jordán", "5"),
        ("¿Quién conquistó Quiriat-sefer (Debir)?", "Otoniel hijo de Quenaz, hermano de Caleb", "16-17"),
        ("¿Qué dio Caleb a Otoniel por tomar Debir?", "A su hija Acsa por esposa", "16-17"),
        ("¿Qué pidió Acsa a su padre además del campo?", "Fuentes de agua; y él le dio las de arriba y las de abajo", "18-19"),
        ("¿A quiénes no pudieron echar los de Judá de Jerusalén?", "A los jebuseos", "63"),
        ("¿Qué se dice de los jebuseos en Jerusalén hasta el día de este relato?", "Que habitaron con los de Judá en Jerusalén", "63"),
        ("¿Cuántas ciudades con sus aldeas se enumeran en la región del Neguev para Judá?", "Veintinueve", "32"),
        ("¿Qué ciudad de los anaceos recibió Caleb dentro de Judá?", "Hebrón (Quiriat-arba)", "13"),
        ("¿Qué hizo Caleb con los tres hijos de Anac en Hebrón?", "Los echó de allí: Sesai, Ahimán y Talmai", "14"),
    ],
)

add(
    "josue-16-efrain-y-manases",
    "Josué 16 — Efraín y Manasés",
    "Josué",
    16,
    [
        ("¿Desde dónde salió la suerte de los hijos de José?", "Desde el Jordán junto a Jericó, hacia las aguas de Jericó al oriente", "1"),
        ("¿Hasta qué mar llegaba el límite de los hijos de José?", "Hasta el mar", "3"),
        ("¿Quiénes recibieron heredad como hijos de José?", "Manasés y Efraín", "4"),
        ("¿Qué ciudad fronteriza se menciona hacia el oriente para Efraín?", "Atarot-adar hasta Bet-horón la de arriba, entre otras", "5"),
        ("¿Qué ciudades de Efraín quedaban en medio de la heredad de Manasés?", "Algunas ciudades separadas para los efraimitas", "9"),
        ("¿A quiénes no echaron los de Efraín que habitaban en Gezer?", "A los cananeos", "10"),
        ("¿Qué ocurrió con los cananeos de Gezer?", "Habitaron en medio de Efraín sujetos a tributo", "10"),
        ("¿Formaba Jericó parte de la descripción del límite de José?", "Sí, hacia el oriente junto al Jordán", "1"),
        ("¿Hacia el norte, qué límite tocaba la heredad descrita?", "Desde el Jordán hasta el mar, pasando por Betel y Luz", "1-2"),
        ("¿Se describe aquí sobre todo la heredad de cuál hijo de José?", "La de los efraimitas", "5"),
    ],
)

add(
    "josue-17-manases-y-zelofehad",
    "Josué 17 — Manasés y las hijas de Zelofehad",
    "Josué",
    17,
    [
        ("¿Quién fue el primogénito de José cuya suerte se describe?", "Manasés", "1"),
        ("¿Quiénes eran las hijas de Zelofehad que pidieron heredad?", "Maala, Noa, Hogla, Milca y Tirsa", "3"),
        ("¿Ante quiénes presentaron su caso las hijas de Zelofehad?", "Ante Eleazar, Josué y los jefes", "4"),
        ("¿Qué les dio el Señor por medio de Moisés según ellas?", "Heredad entre los hermanos de su padre", "4"),
        ("¿Cuántas partes tocó a Manasés además de Galaad y Basán al oriente?", "Diez partes", "5"),
        ("¿Qué le pidieron los hijos de José a Josué sobre su heredad?", "Que les diera más tierra, porque eran un pueblo numeroso", "14"),
        ("¿Qué les respondió Josué?", "Que subieran al bosque y lo desmontaran en tierra de los ferezeos y de los gigantes", "15"),
        ("¿De qué se quejaron los hijos de José respecto a los cananeos?", "Que tenían carros de hierro y eran fuertes", "16"),
        ("¿Qué ánimo les dio Josué a pesar de los carros de hierro?", "Que eran un pueblo numeroso y poderoso, y echarían a los cananeos", "17-18"),
        ("¿A quiénes no pudieron echar los de Manasés de ciertas ciudades?", "A los cananeos de aquellas ciudades", "12"),
        ("¿Qué hicieron cuando Israel se hizo fuerte con los cananeos restantes?", "Los sujetaron a tributo, pero no los echaron del todo", "13"),
    ],
)

add(
    "josue-18-silo-y-benjamin",
    "Josué 18 — Tabernáculo en Silo; Benjamín",
    "Josué",
    18,
    [
        ("¿Dónde se reunió toda la congregación de Israel y levantó el tabernáculo?", "En Silo", "1"),
        ("¿Cuántas tribus quedaban aún sin repartir su heredad?", "Siete", "2"),
        ("¿Qué reproche hizo Josué a los hijos de Israel?", "¿Hasta cuándo serán negligentes para poseer la tierra?", "3"),
        ("¿Cuántos hombres por tribu debían enviar para reconocer la tierra?", "Tres hombres por cada tribu", "4"),
        ("¿En cuántas partes debían describir la tierra?", "En siete partes", "5-6"),
        ("¿Quiénes no tendrían parte entre aquellas siete?", "Los levitas, porque el sacerdocio del Señor era su heredad; y Gad, Rubén y media Manasés ya habían recibido al oriente", "7"),
        ("¿Ante quién echaron las suertes en Silo?", "Ante el Señor, a la entrada del tabernáculo de reunión", "10"),
        ("¿Qué tribu salió primero en la suerte entre las siete?", "Benjamín", "11"),
        ("¿Entre qué tribus quedó la heredad de Benjamín?", "Entre la de Judá y la de los hijos de José", "11"),
        ("¿Qué ciudades importantes se mencionan en la heredad de Benjamín?", "Jericó, Betel, Gabaón, Jerusalén (Jebús), entre otras", "21-28"),
        ("¿Cuántas ciudades con sus aldeas recibió Benjamín?", "Catorce", "28"),
    ],
)

add(
    "josue-19-demas-tribus",
    "Josué 19 — Herencias de las demás tribus",
    "Josué",
    19,
    [
        ("¿Qué tribu recibió la segunda suerte?", "Simeón", "1"),
        ("¿Dentro de la heredad de quién estaba la de Simeón?", "Dentro de la heredad de Judá", "1"),
        ("¿Por qué Simeón recibió dentro de Judá?", "Porque la parte de Judá era demasiada para ellos", "9"),
        ("¿Qué tribu recibió la tercera suerte?", "Zabulón", "10"),
        ("¿Qué tribu recibió la cuarta suerte?", "Isacar", "17"),
        ("¿Qué tribu recibió la quinta suerte?", "Aser", "24"),
        ("¿Qué tribu recibió la sexta suerte?", "Neftalí", "32"),
        ("¿Qué tribu recibió la séptima suerte?", "Dan", "40"),
        ("¿Qué problema tuvo el territorio de Dan?", "Les era estrecho, y subieron a pelear contra Lesem (Lais)", "47"),
        ("¿Cómo llamaron a Lesem después de tomarla?", "Dan, según el nombre de su padre", "47"),
        ("¿Qué ciudad dieron los hijos de Israel a Josué por heredad?", "Timnat-sera, en el monte de Efraín", "49-50"),
        ("¿Quién edificó la ciudad que pidió Josué y habitó en ella?", "Josué hijo de Nun", "50"),
    ],
)

add(
    "josue-20-ciudades-de-refugio",
    "Josué 20 — Ciudades de refugio",
    "Josué",
    20,
    [
        ("¿Qué mandó el Señor a Josué señalar para Israel?", "Ciudades de refugio", "1-2"),
        ("¿Para quiénes eran las ciudades de refugio?", "Para el homicida que matara a alguien por accidente, sin intención", "3"),
        ("¿De quién debía refugiarse el homicida?", "Del vengador de la sangre", "3"),
        ("¿Ante quiénes debía presentar su causa al llegar a la ciudad?", "Ante los ancianos de aquella ciudad", "4"),
        ("¿Hasta cuándo debía permanecer en la ciudad de refugio?", "Hasta ser juzgado ante la congregación, y hasta la muerte del sumo sacerdote", "6"),
        ("¿Qué podía hacer después de la muerte del sumo sacerdote?", "Volver a su ciudad y a su casa", "6"),
        ("¿Cuáles fueron las ciudades de refugio en Canaán?", "Quedes en Galilea (Neftalí), Siquem en Efraín y Quiriat-arba (Hebrón) en Judá", "7"),
        ("¿Cuáles fueron las ciudades de refugio al oriente del Jordán?", "Beser en Rubén, Ramot de Galaad en Gad y Golán en Basán (Manasés)", "8"),
        ("¿Para quiénes más valían estas ciudades además de los israelitas?", "También para el extranjero y el que moraba entre ellos", "9"),
        ("¿Con qué propósito general se designaron?", "Para que nadie muriera a mano del vengador de la sangre sin haber sido juzgado", "9"),
    ],
)

add(
    "josue-21-ciudades-levitas",
    "Josué 21 — Ciudades de los levitas",
    "Josué",
    21,
    [
        ("¿Quiénes se acercaron a Eleazar y a Josué en Silo pidiendo ciudades?", "Los jefes de los padres de los levitas", "1"),
        ("¿Qué les había mandado el Señor por Moisés?", "Que se les dieran ciudades para habitar, con sus ejidos para el ganado", "2"),
        ("¿Cuántas ciudades con sus ejidos recibieron los levitas en total?", "Cuarenta y ocho", "41"),
        ("¿Qué familia levítica recibió por suerte primero, incluyendo Hebrón?", "Los coatitas, de los hijos de Aarón", "4-13"),
        ("¿Qué ciudad de refugio en Judá se dio a los hijos de Aarón?", "Hebrón", "13"),
        ("¿Quién se quedó con el campo y las aldeas de Hebrón?", "Caleb hijo de Jefone", "12"),
        ("¿Qué se dice al final sobre las promesas del Señor a Israel?", "Que no falló ni una de todas las buenas palabras; todo se cumplió", "45"),
        ("¿Dio el Señor reposo alrededor a Israel como había jurado?", "Sí", "44"),
        ("¿Se levantó hombre delante de ellos de todos sus enemigos?", "Ninguno; el Señor entregó a todos sus enemigos en su mano", "44"),
        ("¿De parte de quién recibieron los levitas sus ciudades?", "De la heredad de los hijos de Israel, según la suerte", "8"),
    ],
)

add(
    "josue-22-altar-junto-al-jordan",
    "Josué 22 — Altar junto al Jordán",
    "Josué",
    22,
    [
        ("¿A quiénes llamó Josué para despedirlos a sus tiendas?", "A los de Rubén, Gad y la media tribu de Manasés", "1"),
        ("¿Qué reconoció Josué que habían cumplido?", "Todo lo que Moisés les mandó y haber obedecido su voz en todo", "2"),
        ("¿Qué les encargó Josué al despedirlos?", "Que amaran al Señor, anduvieran en sus caminos, guardaran sus mandamientos y se aferraran a Él", "5"),
        ("¿Con qué los bendijo Josué al enviarlos?", "Con grandes riquezas, ganado, plata, oro, bronce, hierro y muchos vestidos", "7-8"),
        ("¿Qué edificaron junto al Jordán al llegar a la región del Jordán?", "Un altar de gran tamaño", "10"),
        ("¿Cómo reaccionó el resto de Israel al oír del altar?", "Se reunieron en Silo para subir contra ellos a la guerra", "11-12"),
        ("¿A quién enviaron primero a hablar con las tribus del oriente?", "A Finees hijo de Eleazar, con diez príncipes", "13-14"),
        ("¿De qué pecado temían que se tratara el altar?", "De rebelión o apostasía contra el Señor, como en Peor o con Acán", "16-20"),
        ("¿Qué explicaron Rubén, Gad y Manasés sobre el altar?", "Que no era para holocaustos, sino como testimonio entre ellos y sus hermanos", "21-27"),
        ("¿Cómo se llamó el altar?", "Ed, porque era testimonio entre ellos de que el Señor es Dios", "34"),
        ("¿Cómo terminó el conflicto?", "Finees y los príncipes se agradaron de la explicación y no subieron a guerra", "30-33"),
    ],
)

add(
    "josue-23-despedida-de-josue",
    "Josué 23 — Despedida de Josué",
    "Josué",
    23,
    [
        ("¿Cuánto tiempo después de dar el Señor reposo a Israel habló Josué siendo anciano?", "Muchos días después", "1"),
        ("¿A quiénes convocó Josué?", "A todo Israel: ancianos, jefes, jueces y oficiales", "2"),
        ("¿Quién había peleado por Israel según Josué?", "El Señor su Dios", "3"),
        ("¿Qué les recordó sobre las naciones restantes?", "Que el Señor las expulsaría para que posean su tierra", "4-5"),
        ("¿Qué debían cuidar de cumplir?", "Todo lo escrito en el libro de la ley de Moisés, sin apartarse a derecha ni izquierda", "6"),
        ("¿Qué no debían hacer con las naciones que quedaban?", "Mezclarse con ellas ni mencionar el nombre de sus dioses, ni jurar por ellos, servirles ni postrarse", "7"),
        ("¿A quién debían aferrarse como habían hecho hasta aquel día?", "Al Señor su Dios", "8"),
        ("¿Qué pasaría si se volvían atrás y se allegaban a las naciones restantes?", "El Señor no expulsaría más a aquellas naciones; serían lazo, azote y espinas", "12-13"),
        ("¿Qué afirmó Josué sobre las promesas buenas del Señor?", "Que ni una había fallado de todas las buenas palabras", "14"),
        ("¿Qué también vendría si quebrantaban el pacto?", "Que el Señor traería sobre ellos todo el mal amenazado hasta destruirlos de la tierra buena", "15-16"),
    ],
)

add(
    "josue-24-pacto-en-siquem",
    "Josué 24 — Renovación del pacto en Siquem",
    "Josué",
    24,
    [
        ("¿Dónde reunió Josué a todas las tribus de Israel?", "En Siquem", "1"),
        ("¿Desde dónde hizo venir Dios a Abraham según el relato de Josué?", "De más allá del río, de la familia de Taré que servía a otros dioses", "2-3"),
        ("¿A quiénes envió Dios para sacar a Israel de Egipto?", "A Moisés y a Aarón", "5"),
        ("¿Qué naciones del oriente mencionó que Dios entregó a Israel?", "A los amorreos, y a Balac que llamó a Balaam", "8-10"),
        ("¿Con qué no conquistaron la tierra, según Josué?", "No con su espada ni con su arco", "12"),
        ("¿Qué les dio Dios que ellos no edificaron ni plantaron?", "Ciudades y viñas y olivares", "13"),
        ("¿A quiénes debían quitar para servir al Señor con integridad?", "A los dioses a los que sirvieron sus padres más allá del río y en Egipto", "14"),
        ("¿Qué elección famosa planteó Josué al pueblo?", "Escoger a quién servir; él y su casa servirían al Señor", "15"),
        ("¿Qué respondió el pueblo?", "Que no abandonarían al Señor para servir a otros dioses", "16-18"),
        ("¿Qué advirtió Josué sobre servir al Señor?", "Que es Dios santo y celoso; si lo abandonaban, les haría mal", "19-20"),
        ("¿Qué erigió Josué como testimonio del pacto?", "Una gran piedra bajo la encina junto al santuario del Señor", "25-27"),
        ("¿Cuántos años tenía Josué cuando murió?", "Ciento diez años", "29"),
        ("¿Dónde sepultaron a Josué?", "En Timnat-sera, en el monte de Efraín", "30"),
        ("¿Qué huesos de José sepultaron en Siquem?", "Los huesos que los hijos de Israel habían traído de Egipto", "32"),
        ("¿Quién murió también y fue sepultado en Gabaa de Finees?", "Eleazar hijo de Aarón", "33"),
    ],
)


def write_notes(titles: dict[str, str]) -> None:
    NOTES.mkdir(parents=True, exist_ok=True)
    for slug, title in titles.items():
        note_path = NOTES / f"{slug}.md"
        if note_path.exists():
            continue
        note_path.write_text(
            f"# {title}\n\nNotas de contexto (Josué, NTV).\n",
            encoding="utf-8",
        )


def patch_chapters_ts(titles: dict[str, str]) -> None:
    text = CHAPTERS_TS.read_text(encoding="utf-8")
    m = re.search(
        r"export const CHAPTER_TITLES: Record<string, string> = \{([\s\S]*?)\n\}",
        text,
    )
    if not m:
        raise SystemExit("CHAPTER_TITLES not found")
    existing = dict(re.findall(r"'([^']+)': '([^']*)'", m.group(1)))
    # Keep prior order, then append any new Josué titles in chapter order.
    for k, v in titles.items():
        existing[k] = v
    ordered: list[tuple[str, str]] = []
    seen: set[str] = set()
    for k, v in existing.items():
        if k.startswith("josue-"):
            continue
        ordered.append((k, v))
        seen.add(k)
    josue_keys = sorted(
        (k for k in existing if k.startswith("josue-")),
        key=lambda s: int(re.match(r"josue-(\d+)", s).group(1)),
    )
    # Insert Josué before 1 Samuel (samuel-*) entries.
    insert_at = next(
        (i for i, (k, _) in enumerate(ordered) if k.startswith("samuel-") or k.startswith("1-samuel") or k.startswith("2-samuel")),
        0,
    )
    for k in josue_keys:
        ordered.insert(insert_at, (k, existing[k]))
        insert_at += 1
        seen.add(k)
    for k, v in existing.items():
        if k not in seen:
            ordered.append((k, v))
    body = ",\n".join(f"  '{k}': '{v}'" for k, v in ordered)
    new = f"export const CHAPTER_TITLES: Record<string, string> = {{\n{body},\n}}"
    CHAPTERS_TS.write_text(text[: m.start()] + new + text[m.end() :], encoding="utf-8")


def rebuild_index(titles: dict[str, str]) -> int:
    folders = [p for p in VAULT.iterdir() if p.is_dir()]

    def key(p: Path):
        slug = p.name
        if slug.startswith("josue-"):
            n = int(re.match(r"josue-(\d+)", slug).group(1))
            return (0, n, slug)
        if slug.startswith("1-reyes-"):
            n = int(re.match(r"1-reyes-(\d+)", slug).group(1))
            return (3, n, slug)
        if slug.startswith("2-reyes-"):
            n = int(re.match(r"2-reyes-(\d+)", slug).group(1))
            return (4, n, slug)
        if slug.startswith("2-samuel-"):
            n = int(re.match(r"2-samuel-(\d+)", slug).group(1))
            return (2, n, slug)
        m = re.match(r"samuel-(\d+)", slug)
        n = int(m.group(1)) if m else 99
        return (1, n, slug)

    folders.sort(key=key)
    lines = ["# Índice de flashcards", "", "Total: **COUNT** tarjetas.", ""]
    total = 0
    for folder in folders:
        files = sorted(folder.glob("*.md"))
        if not files:
            continue
        title = titles.get(folder.name, folder.name)
        lines.append(f"## {title}")
        lines.append("")
        for f in files:
            text = f.read_text(encoding="utf-8")
            qm = re.search(r"^# (.+)$", text, re.M)
            q = qm.group(1).strip() if qm else f.stem
            short = q if len(q) <= 70 else q[:69] + "…"
            rel = f"flashcards/{folder.name}/{f.stem}"
            lines.append(f"- [[{rel}|{short}]]")
            total += 1
        lines.append("")
    text = "\n".join(lines).replace("COUNT", str(total)) + "\n"
    INDEX.write_text(text, encoding="utf-8")
    return total


def main() -> None:
    titles = {slug: title for slug, title, *_ in CHAPTERS}
    added = 0
    for slug, title, book, ch, cards in CHAPTERS:
        added += write_chapter(slug, title, book, ch, cards)
    write_notes(titles)
    ts = CHAPTERS_TS.read_text(encoding="utf-8")
    existing = dict(re.findall(r"'([^']+)': '([^']*)'", ts))
    existing.update(titles)
    patch_chapters_ts(existing)
    total = rebuild_index(existing)
    print(f"JOSUE_WRITTEN={added}")
    print(f"CHAPTERS={len(CHAPTERS)}")
    print(f"INDEX_TOTAL={total}")


if __name__ == "__main__":
    main()
