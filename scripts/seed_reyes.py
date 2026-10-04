#!/usr/bin/env python3
"""Generate 1 Reyes and 2 Reyes atomic NTV flashcards; densify; rebuild index."""
from __future__ import annotations

import json
import re
import unicodedata
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VAULT = ROOT / "obsidian-vault" / "flashcards"
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
    used = set()
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


# (slug, title, book, chapter, [(q, a, verse), ...])
KINGS: list[tuple[str, str, str, int, list[tuple[str, str, str]]]] = []


def add(slug: str, title: str, book: str, ch: int, cards: list[tuple[str, str, str]]):
    KINGS.append((slug, title, book, ch, cards))


add(
    "1-reyes-1-adolonias-y-salomon",
    "1 Reyes 1 — Adonías y Salomón",
    "1 Reyes",
    1,
    [
        ("Cuando David era anciano, ¿qué hacían para abrigarlo?", "Le buscaban una joven que durmiera junto a él para darle calor", "1-4"),
        ("¿Cómo se llamaba la joven sunamita que sirvió al rey David en su vejez?", "Abisag", "3"),
        ("¿Qué hijo de David se proclamó rey sin que su padre lo supiera?", "Adonías, hijo de Haguit", "5"),
        ("¿Qué dos líderes apoyaron a Adonías en su intento de reinar?", "Joab e Abiatar el sacerdote", "7"),
        ("¿Quiénes no fueron invitados al banquete de Adonías junto a la piedra de Zohélet?", "Natán, Benaía, los valientes de David y Salomón", "8-10"),
        ("¿Qué le pidió Natán a Betsabé que hiciera ante David?", "Que le recordara el juramento de que Salomón reinaría", "11-13"),
        ("¿Qué ordenó David para que Salomón fuera reconocido como rey?", "Que lo montaran en su mula, lo ungieran y lo proclamaran en Gihón", "32-34"),
        ("¿Quiénes ungieron a Salomón en Gihón?", "Sadoc el sacerdote y Natán el profeta", "38-39"),
        ("Cuando Adonías oyó el ruido de la proclamación, ¿adónde huyó?", "Se agarró de los cuernos del altar", "50"),
        ("¿Qué condición puso Salomón para perdonar la vida a Adonías?", "Que se mostrara digno; si se hallaba maldad en él, moriría", "52"),
        ("¿Qué hizo todo el pueblo cuando Salomón fue ungido?", "Gritaron de alegría y la tierra tembló con el ruido", "40"),
    ],
)

add(
    "1-reyes-2-muerte-de-david",
    "1 Reyes 2 — Encargos de David y muerte",
    "1 Reyes",
    2,
    [
        ("Antes de morir, ¿qué le encargó David a Salomón respecto a la ley del Señor?", "Que se mantuviera fiel, anduviera en sus caminos y cumpliera sus mandamientos", "1-3"),
        ("¿Qué le pidió David a Salomón acerca de Joab?", "Que no lo dejara llegar a viejo en paz, por la sangre de Abner y Amasa", "5-6"),
        ("¿A quién debía tratar Salomón con bondad, según el encargo de David?", "A los hijos de Barzilai de Galaad", "7"),
        ("¿Qué debía hacer Salomón con Simei, que había maldecido a David?", "No dejarlo impune, aunque David no lo mató aquel día", "8-9"),
        ("¿Dónde fue sepultado David y cuánto tiempo reinó?", "En la Ciudad de David; cuarenta años: siete en Hebrón y treinta y tres en Jerusalén", "10-11"),
        ("¿Qué pidió Adonías a Betsabé para presentárselo a Salomón?", "Que le dieran a Abisag la sunamita por esposa", "13-17"),
        ("¿Cómo interpretó Salomón la petición de Abisag?", "Como un intento de Adonías de tomar el reino", "22"),
        ("¿Quién ejecutó a Adonías por orden de Salomón?", "Benaía hijo de Joiada", "25"),
        ("¿Qué hizo Salomón con el sacerdote Abiatar?", "Lo destituyó del sacerdocio y lo envió a Anatot", "26-27"),
        ("¿Dónde mató Benaía a Joab?", "Junto al altar, en el tabernáculo del Señor, adonde Joab había huido", "28-34"),
        ("¿Qué condición puso Salomón a Simei para dejarlo vivir?", "Que no saliera de Jerusalén; si cruzaba el arroyo Cedrón, moriría", "36-37"),
        ("¿Por qué murió Simei al final?", "Salió a Gat a buscar a sus siervos y violó la orden del rey", "39-46"),
    ],
)

add(
    "1-reyes-3-sabiduria-de-salomon",
    "1 Reyes 3 — Sabiduría de Salomón",
    "1 Reyes",
    3,
    [
        ("¿Con la hija de qué rey se casó Salomón al inicio de su reinado?", "Con la hija del faraón de Egipto", "1"),
        ("¿Por qué el pueblo aún sacrificaba en los lugares altos?", "Porque todavía no se había construido el templo del Señor", "2"),
        ("¿Dónde se le apareció el Señor a Salomón en un sueño?", "En Gabaón", "5"),
        ("¿Qué le ofreció Dios a Salomón en Gabaón?", "Que pidiera lo que quisiera", "5"),
        ("¿Qué pidió Salomón en lugar de larga vida o riquezas?", "Un corazón entendido para gobernar y distinguir entre el bien y el mal", "9"),
        ("¿Qué más le concedió Dios además de sabiduría?", "Riquezas y honra como ningún otro rey, y larga vida si obedecía", "12-14"),
        ("Cuando Salomón despertó, ¿qué hizo en Jerusalén?", "Se presentó ante el arca, ofreció holocaustos y dio un banquete", "15"),
        ("¿Qué disputa llevaron dos prostitutas ante Salomón?", "Cuál de las dos era la madre del niño vivo", "16-22"),
        ("¿Qué ordenó Salomón para descubrir a la verdadera madre?", "Que partieran al niño vivo en dos", "24-25"),
        ("¿Cómo se reconoció a la verdadera madre?", "Prefirió que el niño se lo dieran a la otra antes que lo mataran", "26-27"),
        ("¿Qué efecto tuvo el fallo de Salomón en todo Israel?", "Temieron al rey, al ver que Dios le había dado sabiduría para juzgar", "28"),
    ],
)

# continued in following adds

add("1-reyes-4-oficiales-y-prosperidad","1 Reyes 4 — Oficiales y prosperidad","1 Reyes",4,[
("¿Quién era el sacerdote principal junto a Sadoc en la lista de oficiales de Salomón?","Azarías hijo de Sadoc","2"),
("¿Cuántos gobernadores regionales tenía Salomón para abastecer la corte?","Doce gobernadores, cada uno un mes al año","7"),
("¿A qué se compara la sabiduría de Salomón en este capítulo?","Era mayor que la de todos los orientales y que la de Egipto","30"),
("¿Cuántos proverbios y cánticos se le atribuyen aquí a Salomón?","Tres mil proverbios y mil cinco cánticos","32"),
("¿De qué temas habló Salomón al enseñar?","De árboles, animales, aves, reptiles y peces","33"),
("¿De dónde venían personas a oír la sabiduría de Salomón?","De todos los pueblos, enviados por los reyes de la tierra","34"),
("¿Cómo se describe la paz de Judá e Israel en sus días?","Habitaban seguros, cada uno bajo su vid y su higuera","25"),
("¿Cuántos pesebres de caballos para carros se mencionan?","Cuarenta mil pesebres de caballos para sus carros","26"),
("¿Quién era el oficial a cargo de los gobernadores?","Azarías hijo de Natán","5"),
("¿Qué recibía cada gobernador el mes que le tocaba?","Víveres para el rey y para todos los que comían a su mesa","7,27"),
])

add("1-reyes-5-hiram-y-la-madera","1 Reyes 5 — Hiram y los preparativos del templo","1 Reyes",5,[
("¿Quién era Hiram, rey que había sido amigo de David?","Rey de Tiro","1"),
("¿Qué le pidió Salomón a Hiram para la casa del Señor?","Cedros del Líbano","6"),
("¿Por qué David no había construido el templo, según Salomón?","Por las guerras que lo rodearon hasta que el Señor le dio reposo","3"),
("¿Qué enviaba Hiram a cambio de trigo y aceite?","Madera de cedro y de ciprés, flotando por mar","8-11"),
("¿Cuántos peones de carga destinó Salomón a la obra?","Setenta mil que llevaban cargas","15"),
("¿Cuántos canteros en las montañas menciona el relato?","Ochenta mil","15"),
("¿Cuántos capataces había sobre la obra?","Tres mil trescientos que mandaban al pueblo","16"),
("¿Qué piedra extraían para los cimientos?","Piedras grandes y costosas, piedras labradas","17"),
("¿Qué trabajadores de Hiram colaboraban junto a los de Salomón?","Los obreros de Gebal junto con los de Salomón e Hiram","18"),
("¿Cómo recibió Hiram el mensaje de Salomón?","Se alegró mucho y bendijo al Señor que dio a David un hijo sabio","7"),
])

add("1-reyes-6-construccion-del-templo","1 Reyes 6 — Construcción del templo","1 Reyes",6,[
("¿En qué año del éxodo de Egipto comenzó Salomón a edificar el templo?","En el año cuatrocientos ochenta después de salir de Egipto","1"),
("¿En qué año del reinado de Salomón empezó la obra?","En el cuarto año de su reinado","1"),
("¿Cuáles eran las medidas del templo?","Sesenta codos de largo, veinte de ancho y treinta de alto","2"),
("¿De qué se recubrió el interior de la casa?","De oro","21-22"),
("¿Qué había en el lugar santísimo?","Dos querubines de olivo recubiertos de oro","23-28"),
("¿Cuántos años tardó Salomón en construir el templo?","Siete años","38"),
("¿Qué le prometió el Señor a Salomón mientras se edificaba la casa?","Que habitaría en medio de Israel si Salomón guardaba sus estatutos","11-13"),
("¿De qué madera eran las puertas del lugar santísimo?","De olivo, con querubines, palmeras y flores abiertas","31-32"),
("¿Se oían herramientas de hierro en el templo mientras se construía?","No; las piedras se labraban en la cantera","7"),
("¿Qué recubría el piso de la casa?","Oro","30"),
])

add("1-reyes-7-palacio-y-ajuares","1 Reyes 7 — Palacio y ajuares del templo","1 Reyes",7,[
("¿Cuántos años tardó Salomón en construir su propio palacio?","Trece años","1"),
("¿Cómo se llamaba el pórtico de columnas de su palacio?","El Bosque del Líbano","2"),
("¿Quién fundió los objetos de bronce para el templo?","Hiram de Tiro, hijo de una viuda de Neftalí","13-14"),
("¿Cómo se llamaban las dos columnas de bronce a la entrada?","Jaquín y Boaz","21"),
("¿Qué era el Mar de bronce?","Un gran depósito circular sobre doce bueyes, para el agua del templo","23-25"),
("¿Cuántas copas o fuentes de bronce había sobre las bases?","Diez","27,38"),
("¿De qué estaban hechos el altar, el Mar y las bases móviles?","De bronce pulido","45-47"),
("¿Qué objetos del lugar santo eran de oro?","El altar de oro, la mesa de los panes y los candelabros","48-49"),
("¿Qué hizo Salomón con las ofrendas consagradas por David?","Las puso entre los tesoros de la casa del Señor","51"),
("¿Dónde fundían las piezas grandes de bronce?","En la llanura del Jordán, entre Sucot y Zaretán","46"),
])

add("1-reyes-8-dedicacion-del-templo","1 Reyes 8 — Dedicación del templo","1 Reyes",8,[
("¿Qué llevaron los sacerdotes al lugar santísimo en la dedicación?","El arca del pacto del Señor","6"),
("¿Qué había dentro del arca en ese momento?","Las dos tablas de piedra que Moisés puso en Horeb","9"),
("¿Qué llenó la casa cuando los sacerdotes salieron del lugar santo?","Una nube; la gloria del Señor llenó la casa","10-11"),
("En su oración, ¿qué dijo Salomón que ni los cielos pueden contener?","A Dios; mucho menos esa casa que él había edificado","27"),
("¿Para qué pedía Salomón que los extranjeros oraran hacia esa casa?","Para que todos los pueblos de la tierra conocieran el nombre del Señor","41-43"),
("¿Cuántos bueyes y ovejas se sacrificaron en la dedicación?","Veintidós mil bueyes y ciento veinte mil ovejas","63"),
("¿Cuántos días duró la fiesta de la dedicación junto con la fiesta?","Catorce días en total","65"),
("¿Qué hizo el rey al volverse a bendecir a toda la asamblea?","Bendijo al pueblo en voz alta","54-55"),
("¿Qué pidió Salomón si el pueblo pecaba y era llevado cautivo?","Que Dios oyera su oración hacia esa tierra y los perdonara","46-50"),
("Cuando el pueblo se fue, ¿cómo estaba de ánimo?","Alegres y con el corazón contento por todo el bien que Dios había hecho","66"),
])

add("1-reyes-9-pacto-y-ciudades","1 Reyes 9 — Pacto, Hiram y ciudades","1 Reyes",9,[
("Cuando el Señor se le apareció de nuevo a Salomón, ¿qué le prometió si era fiel?","Que afirmaría el trono de su reino para siempre","4-5"),
("¿Qué advirtió Dios si Israel se apartaba y servía a otros dioses?","Que arrancaría a Israel de la tierra y la casa sería escombros","6-8"),
("¿Cuántas ciudades dio Salomón a Hiram en Galilea?","Veinte ciudades","11"),
("¿Cómo las llamó Hiram al verlas?","Cabul, porque no le agradaron","13"),
("¿Qué ciudad reconstruyó Salomón que era de David?","El Milo y el muro de Jerusalén, y también Hazor, Meguido y Gezer","15"),
("¿Quién le había dado Gezer a Salomón?","El faraón, como dote a su hija","16"),
("¿A quiénes usó Salomón como trabajadores forzados?","A los pueblos que quedaron de los amorreos, hititas, ferezeos, heveos y jebuseos","20-21"),
("¿Hizo Salomón esclavos a los israelitas?","No; ellos eran soldados, oficiales y jefes de carros","22"),
("¿Tres veces al año, qué hacía Salomón en el templo?","Ofrecía holocaustos y ofrendas de paz","25"),
("¿Dónde tenía Salomón una flota junto con la de Hiram?","En Ezión-geber, cerca de Elat, sobre el Mar Rojo","26-27"),
])

add("1-reyes-10-reina-de-saba","1 Reyes 10 — La reina de Sabá","1 Reyes",10,[
("¿Por qué vino la reina de Sabá a Jerusalén?","Para probar a Salomón con preguntas difíciles, al oír su fama","1"),
("¿Con qué llegó la reina de Sabá?","Con un gran séquito, camellos con especias, mucho oro y piedras preciosas","2"),
("Cuando vio la sabiduría y la casa de Salomón, ¿qué le sucedió?","Se quedó sin aliento","4-5"),
("¿Qué reconoció la reina acerca del Señor?","Que el Señor había puesto a Salomón por rey para hacer juicio y justicia","9"),
("¿Cuánto oro le dio a Salomón?","Ciento veinte talentos de oro, además de especias y piedras","10"),
("¿De dónde traía la flota de Hiram oro, almug y piedras?","De Ofir","11"),
("¿Cuánto oro recibía Salomón cada año?","Seiscientos sesenta y seis talentos de oro","14"),
("¿De qué hizo Salomón un gran trono?","De marfil recubierto de oro puro","18"),
("¿Qué había en las manos de los leones junto al trono?","Seis gradas y doce leones, uno a cada lado de cada grada","19-20"),
("¿Qué se dice de la plata en Jerusalén en aquellos días?","Era tan común como las piedras","27"),
("¿De Egipto qué importaba Salomón?","Caballos y carros","28-29"),
])

add("1-reyes-11-esposas-y-adversarios","1 Reyes 11 — Esposas extranjeras y adversarios","1 Reyes",11,[
("¿A cuántas mujeres amó Salomón además de la hija del faraón?","Setecientas princesas y trescientas concubinas","3"),
("¿Qué hicieron sus esposas extranjeras con su corazón?","Lo desviaron hacia otros dioses cuando era anciano","4"),
("¿A qué dioses llegó a seguir Salomón?","A Astoret de Sidón y a Milcom de Amón","5"),
("¿Qué altos construyó para Quemós y Moloc?","Altos en el monte que está frente a Jerusalén","7"),
("¿Cuántas tribus le dijo Dios que rasgaría del hijo de Salomón?","Diez tribus; una quedaría por amor a David","11-13"),
("¿A quién levantó Dios como adversario, un edomita?","A Hadad el edomita","14"),
("¿Quién era Rezón, otro adversario de Salomón?","Hijo de Eliada, que llegó a ser rey en Damasco","23-25"),
("¿A qué oficial israelita habló el profeta Ahías?","A Jeroboam hijo de Nabat, efrateo de Zereda","26,29"),
("¿Qué hizo Ahías con el manto nuevo?","Lo rasgó en doce pedazos y dio diez a Jeroboam","30-31"),
("¿Por qué huyó Jeroboam a Egipto?","Salomón intentó matarlo","40"),
("¿Cuántos años reinó Salomón en Jerusalén y quién lo sucedió?","Cuarenta años; lo sucedió su hijo Roboam","42-43"),
])

add("1-reyes-12-division-del-reino","1 Reyes 12 — División del reino","1 Reyes",12,[
("¿Dónde se reunió todo Israel para hacer rey a Roboam?","En Siquem","1"),
("¿Qué pidió el pueblo a Roboam por medio de Jeroboam?","Que aligerara el yugo duro que Salomón les había impuesto","4"),
("¿Qué consejo le dieron los ancianos a Roboam?","Que sirviera al pueblo aquel día y les hablara con buenas palabras","7"),
("¿Qué respondió Roboam siguiendo a los jóvenes?","Que su dedo meñique era más grueso que la cintura de su padre y que aumentaría el yugo","10-14"),
("¿Qué gritó Israel al rechazar a Roboam?","«¡A tus tiendas, Israel! ¡Mira ahora por tu casa, David!»","16"),
("¿A quién envió Roboam y cómo murió ese oficial?","A Adoniram, encargado del tributo; Israel lo apedreó","18"),
("¿Por qué no peleó Roboam contra Israel, según Semaías?","Porque aquello venía del Señor","22-24"),
("¿Qué temió Jeroboam si el pueblo subía a Jerusalén a adorar?","Que el corazón del pueblo volviera a Roboam y lo mataran a él","26-27"),
("¿Qué dos becerros de oro hizo Jeroboam y dónde los puso?","Uno en Betel y otro en Dan","28-29"),
("¿A quiénes nombró sacerdotes Jeroboam, fuera de los levitas?","A gente del pueblo que no era de Leví","31"),
])

add("1-reyes-13-hombre-de-dios","1 Reyes 13 — El hombre de Dios de Judá","1 Reyes",13,[
("¿De dónde vino el hombre de Dios que gritó contra el altar de Betel?","De Judá, por palabra del Señor","1"),
("¿Qué profetizó acerca de un rey de la casa de David?","Que nacería un hijo llamado Josías, que quemaría sobre ese altar a los sacerdotes de los altos","2"),
("¿Qué señal se cumplió en el altar?","El altar se partió y la ceniza se derramó","3,5"),
("¿Qué le ocurrió a la mano de Jeroboam cuando señaló al profeta?","Se le secó y no pudo recogerla","4"),
("¿Qué le pidió Jeroboam al hombre de Dios?","Que orara para que su mano sanara; y sanó","6"),
("¿Por qué no aceptó el hombre de Dios comer en Betel?","Dios le había ordenado no comer pan ni beber agua ni volver por el mismo camino","8-9"),
("¿Quién lo persiguió y lo engañó para que comiera?","Un profeta anciano que vivía en Betel","11-19"),
("¿Cómo murió el hombre de Dios desobediente?","Un león lo mató en el camino","24"),
("¿Qué extraño detalle se vio junto al cadáver?","El león y el asno estaban parados junto al cuerpo sin comerlo","24-28"),
("Aun así, ¿qué se cumpliría según el profeta anciano?","La palabra contra el altar de Betel y contra los santuarios de los altos","32"),
])

add("1-reyes-14-abias-y-roboam","1 Reyes 14 — Abías, Jeroboam y Roboam","1 Reyes",14,[
("Cuando enfermó Abías hijo de Jeroboam, ¿a quién envió Jeroboam?","A su esposa, disfrazada, a consultar a Ahías en Silo","1-2"),
("Aunque Ahías estaba ciego por la vejez, ¿quién le avisó quién venía?","El Señor le dijo que era la mujer de Jeroboam","4-6"),
("¿Qué anuncio dio Ahías sobre el niño enfermo?","Que moriría al entrar ella en la ciudad, y solo él de la casa de Jeroboam tendría honrosa sepultura","12-13"),
("¿Qué sentencia cayó sobre la casa de Jeroboam?","El Señor la barrería como se barre el estiércol, por los ídolos","9-10"),
("¿Cuántos años reinó Jeroboam y quién lo sucedió?","Veintidós años; lo sucedió su hijo Nadab","20"),
("¿Cuántos años tenía Roboam cuando comenzó a reinar en Judá?","Cuarenta y un años; reinó diecisiete en Jerusalén","21"),
("¿Qué hizo Judá que provocó al Señor?","Se edificaron altos, estelas e imágenes de Asera, y hubo prostitución cultual","22-24"),
("¿Quién subió contra Jerusalén en el quinto año de Roboam?","Sisac, rey de Egipto","25"),
("¿Qué se llevó Sisac del templo y del palacio?","Los tesoros, incluidas las adargas de oro de Salomón","26"),
("¿De qué las reemplazó Roboam?","De adargas de bronce","27"),
])

add("1-reyes-15-asa-y-baasa","1 Reyes 15 — Abiam, Asa, Nadab y Baasa","1 Reyes",15,[
("¿Quién reinó en Judá después de Roboam y cómo se compara con David?","Abiam; su corazón no fue perfecto como el de David","1-3"),
("¿Por amor a quién sostuvo Dios una lámpara en Jerusalén?","Por amor a David","4"),
("¿Cuántos años reinó Asa en Jerusalén?","Cuarenta y un años","10"),
("¿Qué hizo Asa con su abuela Maaca?","La destituyó de reina madre porque había hecho un ídolo de Asera","13"),
("¿Llegó Asa a quitar los lugares altos?","No; pero su corazón fue íntegro con el Señor toda su vida","14"),
("¿A quién envió Asa tesoros para que rompiera alianza con Baasa?","A Ben-adad, rey de Siria, en Damasco","18-19"),
("¿Quién mató a Nadab hijo de Jeroboam y se apoderó del reino de Israel?","Baasa hijo de Ahías, de la casa de Isacar","27-28"),
("¿Por qué exterminó Baasa toda la casa de Jeroboam?","Según la palabra del Señor por Ahías de Silo","29-30"),
("¿Dónde reinó Baasa y cuántos años?","En Tirsa, veinticuatro años","33"),
("¿Hizo Baasa lo recto ante el Señor?","No; anduvo en el camino de Jeroboam y en su pecado","34"),
])

add("1-reyes-16-omri-y-acab","1 Reyes 16 — Elá, Zimri, Omri y Acab","1 Reyes",16,[
("¿Qué profeta anunció el fin de la casa de Baasa?","Jehú hijo de Hananí","1-4"),
("¿Quién, jefe de la mitad de los carros, mató a Elá en Tirsa?","Zimri, mientras Elá se embriagaba en casa de Arsa","9-10"),
("¿Cuántos días reinó Zimri?","Siete días","15"),
("Cuando Zimri vio tomada la ciudad, ¿qué hizo?","Entró en el palacio y lo incendió sobre sí; murió","18"),
("¿Quién prevaleció sobre Tibni y llegó a ser rey?","Omri","21-22"),
("¿Qué ciudad compró y edificó Omri para capital?","Samaria, el monte que compró a Semer","24"),
("¿Cómo se evalúa el pecado de Omri?","Hizo más mal que todos los que fueron antes de él","25"),
("¿Quién sucedió a Omri y con quién se casó?","Acab; se casó con Jezabel, hija de Etbaal rey de Sidón","29-31"),
("¿Qué culto estableció Acab en Samaria?","Un templo y un altar a Baal, y una imagen de Asera","32-33"),
("¿Qué sucedió cuando Hiel de Betel reconstruyó Jericó?","Perdió a su primogénito Abiram al echar los cimientos y a Segub al poner las puertas, según Josué","34"),
])

add("1-reyes-17-elias-y-la-viuda","1 Reyes 17 — Elías y la viuda de Sarepta","1 Reyes",17,[
("¿Qué anunció Elías el tisbita ante Acab?","Que no habría rocío ni lluvia sino por su palabra","1"),
("¿Dónde escondió Dios a Elías al principio y cómo lo alimentó?","Junto al arroyo de Querit; los cuervos le traían pan y carne","3-6"),
("Cuando el arroyo se secó, ¿adónde lo envió el Señor?","A Sarepta de Sidón, a una viuda","8-9"),
("¿Qué le pidió Elías a la viuda que le preparara primero?","Una pequeña torta para él, antes que para ella y su hijo","13"),
("¿Qué milagro ocurrió con la harina y el aceite?","La harina no se agotó ni el aceite de la vasija se vació","14-16"),
("Cuando murió el hijo de la viuda, ¿qué hizo Elías?","Lo llevó al aposento alto, se tendió sobre el niño tres veces y oró","19-21"),
("¿Qué sucedió con el niño?","El Señor oyó a Elías y el niño volvió a la vida","22"),
("¿Qué confesó entonces la mujer?","Que ahora sabía que Elías era hombre de Dios y que la palabra del Señor en su boca era verdad","24"),
("¿Por qué fue Elías al oriente al inicio de la sequía?","Por orden del Señor, para esconderse del arroyo de Querit","2-3"),
("¿Cómo encontró Elías a la viuda?","Recogiendo leña a la entrada de la ciudad","10"),
])

add("1-reyes-18-carmelo","1 Reyes 18 — Elías en el Carmelo","1 Reyes",18,[
("En el tercer año, ¿qué le ordenó Dios a Elías?","Que se presentara a Acab, porque enviaría lluvia","1"),
("¿Quién era Abdías y qué había hecho por los profetas?","Mayordomo de Acab; escondió cien profetas del Señor en cuevas","3-4"),
("¿Cuántos profetas de Baal y de Asera convocó Elías en el Carmelo?","Cuatrocientos cincuenta de Baal y cuatrocientos de Asera","19"),
("¿Qué reto lanzó Elías al pueblo?","Que dejaran de cojear entre dos opiniones: si el Señor es Dios, síganlo","21"),
("¿Qué hicieron los profetas de Baal desde la mañana hasta el mediodía?","Clamaron, saltaron alrededor del altar y se sajaron, sin ninguna respuesta","26-29"),
("¿Cuántas vasijas de agua mandó Elías derramar sobre su holocausto?","Doce cántaros, tres veces cuatro vasijas","33-34"),
("¿Qué cayó cuando Elías oró a la hora de la ofrenda?","Fuego del Señor que consumió el holocausto, la leña, las piedras, el polvo y lamió el agua","38"),
("¿Qué gritó el pueblo?","«¡El Señor es Dios! ¡El Señor es Dios!»","39"),
("¿Qué hizo Elías con los profetas de Baal?","Los hizo bajar al arroyo Cisón y allí los mató","40"),
("¿Qué vio el siervo a la séptima vez?","Una nubecita como la palma de la mano que subía del mar","44"),
("¿Cómo corrió Elías hasta Jezreel?","Delante del carro de Acab, con la mano del Señor sobre él","46"),
])

add("1-reyes-19-horeb-y-eliseo","1 Reyes 19 — Elías en Horeb y el llamado de Eliseo","1 Reyes",19,[
("¿Qué juró Jezabel después de lo del Carmelo?","Que al día siguiente Elías estaría como uno de los profetas muertos","2"),
("¿Adónde huyó Elías y qué pidió bajo la retama?","A Beerseba y al desierto; pidió morirse","3-4"),
("¿Quién lo tocó y le dio pan cocido y cántaro de agua?","Un ángel del Señor, dos veces","5-7"),
("¿Cuántos días caminó hasta Horeb con aquella comida?","Cuarenta días y cuarenta noches","8"),
("¿En qué no estaba el Señor, de las manifestaciones en el monte?","No estaba en el viento, ni en el terremoto, ni en el fuego, sino en un silbo suave y apacible","11-12"),
("¿A quiénes debía ungir Elías?","A Hazael como rey de Siria, a Jehú como rey de Israel y a Eliseo como profeta en su lugar","15-16"),
("¿Cuántos se había reservado Dios que no doblaron rodilla a Baal?","Siete mil en Israel","18"),
("¿Qué estaba haciendo Eliseo cuando Elías echó su manto sobre él?","Araba con doce yuntas de bueyes","19"),
("¿Qué hizo Eliseo con la yunta?","Sacrificó los bueyes, asó la carne con el yugo y la dio al pueblo, y siguió a Elías","21"),
("¿Qué queja repitió Elías en la cueva?","Que había sido celoso por el Señor y que solo quedaba él, y buscaban quitarle la vida","10,14"),
])

add("1-reyes-20-ben-adad","1 Reyes 20 — Ben-adad y Acab","1 Reyes",20,[
("¿Quién sitió Samaria con treinta y dos reyes?","Ben-adad, rey de Siria","1"),
("¿Qué exigió primero Ben-adad a Acab?","Su plata, oro, mujeres e hijos","2-3"),
("¿Qué dijo el profeta que el Señor haría con aquel ejército inmenso?","Que lo entregaría en mano de Acab para que conociera que él es el Señor","13"),
("¿Quiénes iniciaron la salida contra Siria?","Los jóvenes de los jefes de las provincias, seguidos del ejército","14-19"),
("Tras la primera derrota, ¿qué dijeron los siervos de Ben-adad?","Que el dios de Israel era dios de los montes, no de los valles","23"),
("¿Dónde ocurrió la segunda batalla al año siguiente?","En Afec","26"),
("¿Cuántos peones sirios cayeron en un día?","Cien mil de a pie","29"),
("¿Qué hizo Acab con Ben-adad cuando lo capturaron?","Lo llamó hermano, lo hizo subir al carro y concertó un pacto","32-34"),
("¿Qué sentencia recibió Acab por haber soltado a un hombre que Dios había determinado destruir?","Su vida iría por la vida de aquel y su pueblo por aquel pueblo","42"),
("¿Cómo se fue Acab a su casa?","Resentido y enojado","43"),
])

add("1-reyes-21-nabot","1 Reyes 21 — La viña de Nabot","1 Reyes",21,[
("¿Qué quería Acab de Nabot el jezreelita?","Su viña, junto al palacio, para huerto de hortalizas","1-2"),
("¿Por qué Nabot no se la vendió ni la cambió?","Era la heredad de sus padres","3"),
("¿Cómo reaccionó Acab?","Se recostó en su cama, volvió el rostro y no quiso comer","4"),
("¿Qué trama ideó Jezabel con cartas en nombre de Acab?","Acusar a Nabot de haber maldecido a Dios y al rey, con dos testigos malvados","8-10"),
("¿Cómo murió Nabot?","Lo sacaron fuera de la ciudad y lo apedrearon","13"),
("Cuando Elías lo encontró en la viña, ¿qué dijo Acab?","«¿Me has hallado, enemigo mío?»","20"),
("¿Qué anunció Elías sobre Acab y Jezabel?","Que los perros lamerían la sangre de Acab y comerían a Jezabel junto al muro de Jezreel","19,23"),
("¿Cómo se describe a Acab en comparación con los reyes anteriores?","No hubo quien se vendiera a hacer lo malo como Acab, instigado por Jezabel","25"),
("Cuando Acab se humilló con cilicio y ayuno, ¿qué dijo Dios a Elías?","Que no traería el mal en sus días, sino en los de su hijo","27-29"),
("¿Quién llevó a Acab la noticia de que Nabot estaba muerto?","Jezabel","14-15"),
])

add("1-reyes-22-miqueas-y-la-muerte-de-acab","1 Reyes 22 — Miqueas y la muerte de Acab","1 Reyes",22,[
("¿A qué rey de Judá pidió Acab que lo acompañara a recuperar Ramot de Galaad?","A Josafat","2-4"),
("¿Qué pidió Josafat antes de salir?","Que consultaran primero la palabra del Señor","5"),
("¿Cuántos profetas de Acab prometían victoria?","Unos cuatrocientos","6"),
("¿A qué profeta del Señor pidió Josafat consultar, aunque Acab lo odiaba?","A Miqueas hijo de Imlá","7-8"),
("¿Qué visión relató Miqueas sobre un espíritu en el cielo?","Un espíritu se ofreció a ser espíritu de mentira en boca de los profetas de Acab","19-23"),
("¿Qué le dijo Sedequías a Miqueas?","Lo abofeteó y preguntó por dónde se le había ido el espíritu del Señor","24"),
("¿Cómo disfrazó Acab su identidad en la batalla?","Entró disfrazado, mientras Josafat llevaba sus ropas reales","30"),
("¿Cómo murió Acab?","Un hombre disparó su arco al azar y lo hirió entre las juntas de la armadura","34"),
("¿Dónde lavaron el carro y qué cumplió aquello?","En el estanque de Samaria; los perros lamiendo su sangre cumplieron la palabra del Señor","38"),
("¿Cuántos años reinó Acab en Samaria, según se recuerda al cerrar su historia?","Veintidós años","41"),
("¿Quién sucedió a Acab en Israel y quién a Josafat en Judá según el cierre?","Ocozías en Israel; Joram en Judá se menciona en la línea de Josafat","40,50"),
])

add("2-reyes-1-ocozias","2 Reyes 1 — Ocozías y el fuego del cielo","2 Reyes",1,[
("¿Por qué se cayó Ocozías y quedó enfermo?","Se cayó por la celosía de su aposento alto en Samaria","2"),
("¿A qué dios envió a consultar Ocozías?","A Baal-zebub, dios de Ecrón","2"),
("¿Qué le preguntó el ángel del Señor a Elías que dijera?","¿No hay Dios en Israel, que van a consultar a Baal-zebub?","3"),
("¿Qué anuncio llevó Elías al rey?","Que de esa cama no se levantaría; ciertamente moriría","4,6"),
("¿Cómo describieron al hombre que les habló los mensajeros?","Un hombre velludo, con un cinturón de cuero a la cintura","8"),
("¿Qué cayó sobre los primeros dos capitanes de cincuenta?","Fuego del cielo que los consumió a ellos y a sus cincuenta","10,12"),
("¿Cómo se acercó el tercer capitán?","De rodillas, pidiendo que se valorara su vida y la de sus hombres","13-14"),
("¿Quién sucedió a Ocozías porque no tenía hijo?","Joram, su hermano","17"),
("¿En qué año de Joram de Judá murió Ocozías según el relato?","En el segundo año de Joram hijo de Josafat","17"),
("¿Por qué bajó Elías con el tercer capitán?","El ángel del Señor le dijo que no temiera y bajara con él","15"),
])

add("2-reyes-2-elias-es-llevado","2 Reyes 2 — Elías es llevado y Eliseo","2 Reyes",2,[
("¿Qué sabían los hijos de los profetas que sucedería aquel día?","Que el Señor llevaría a Elías hoy","3,5"),
("¿Qué pidió Eliseo si veía a Elías cuando fuera llevado?","Una doble porción de su espíritu","9"),
("¿Cómo fue llevado Elías al cielo?","En un torbellino, en un carro de fuego con caballos de fuego","11"),
("¿Qué tomó Eliseo del suelo?","El manto de Elías que se le había caído","13"),
("¿Qué hizo Eliseo con el manto en el Jordán?","Golpeó las aguas, se apartaron y cruzó","14"),
("¿Qué gritaron los hijos de los profetas al verlo?","Que el espíritu de Elías reposaba sobre Eliseo","15"),
("¿Qué milagro hizo Eliseo con el agua de Jericó?","Echó sal en el manantial y sanó las aguas","19-22"),
("¿Qué ocurrió cuando unos muchachos se burlaban de él cerca de Betel?","Dos osas del bosque despedazaron a cuarenta y dos de ellos","23-24"),
("¿Adónde fue Eliseo después de Betel y del Carmelo?","A Samaria","25"),
("¿Cuántas veces pidió Elías a Eliseo que se quedara atrás?","Tres veces: en Betel, Jericó y el Jordán","2-6"),
])

add("2-reyes-3-guerra-contra-moab","2 Reyes 3 — Guerra contra Moab","2 Reyes",3,[
("¿Quién era Joram hijo de Acab y qué quitó, aunque siguió el pecado de Jeroboam?","Rey de Israel; quitó la estatua de Baal que había hecho su padre","1-2"),
("¿Por qué se rebeló Mesa, rey de Moab, contra Israel?","Pagaba tributo de corderos y lana, y a la muerte de Acab se rebeló","4-5"),
("¿Qué reyes se aliaron contra Moab?","Joram de Israel, Josafat de Judá y el rey de Edom","7-9"),
("Cuando faltó agua en el desierto, ¿a quién consultaron?","A Eliseo hijo de Safat, que derramaba agua a manos de Elías","11"),
("¿Qué músico pidió Eliseo antes de profetizar?","Un tañedor; y la mano del Señor vino sobre Eliseo","15"),
("¿Qué milagro de agua anunció sin viento ni lluvia?","El valle se llenaría de estanques de agua","16-17"),
("¿Cómo interpretaron los moabitas el agua al sol de la mañana?","Como sangre, y pensaron que los reyes se habían matado entre sí","22-23"),
("Cuando Israel iba venciendo, ¿qué hizo el rey de Moab con su primogénito?","Lo ofreció en holocausto sobre la muralla","27"),
("¿Qué efecto tuvo aquel sacrificio en los israelitas?","Hubo gran indignación contra Israel y se retiraron","27"),
("¿Le habría Eliseo atendido a Joram si no fuera por Josafat?","No; dijo que si no fuera por Josafat ni lo miraría","14"),
])

add("2-reyes-4-milagros-de-eliseo","2 Reyes 4 — Milagros de Eliseo","2 Reyes",4,[
("¿Qué milagro hizo Eliseo por la viuda de un profeta endeudada?","La aceitera se llenó de aceite en muchas vasijas, y pagó la deuda","1-7"),
("¿Qué hizo la sunamita rica por Eliseo?","Le preparó un aposento pequeño con cama, mesa, silla y candelero","8-10"),
("¿Qué hijo le prometió Eliseo a la sunamita?","Un hijo, aunque su marido era anciano","14-17"),
("Cuando el niño murió, ¿adónde fue la madre?","Al Carmelo, a buscar a Eliseo","22-25"),
("¿Qué hizo Eliseo para que el niño reviviera?","Oró, se tendió sobre el niño; el niño estornudó siete veces y abrió los ojos","33-35"),
("En Guilgal, ¿qué había en la olla que hizo gritar «¡muerte en la olla!»?","Calabazas silvestres venenosas","38-40"),
("¿Cómo sanó Eliseo el guiso?","Echó harina en la olla y entonces pudieron comer","41"),
("¿Cuántos panes de cebada le trajeron y para cuántos alcanzaron?","Veinte panes de cebada para cien hombres, y sobró","42-44"),
("¿Qué dijo Giezi cuando la sunamita llegó al Carmelo?","El niño no despertaba; más tarde Eliseo lo envió con su báculo","31"),
("¿Por qué la sunamita no quería que Giezi la detuviera?","Porque su alma estaba en amargura y el Señor se lo había ocultado a Eliseo","27"),
])

add("2-reyes-5-naaman","2 Reyes 5 — Naamán","2 Reyes",5,[
("¿Quién era Naamán y qué enfermedad tenía?","Jefe del ejército de Siria, hombre valiente, pero leproso","1"),
("¿Quién le habló a la esposa de Naamán del profeta de Samaria?","Una muchacha israelita cautiva que servía a su mujer","2-3"),
("¿Qué carta llevó Naamán al rey de Israel?","Una carta de su rey pidiendo que lo sanaran de la lepra","5-6"),
("¿Qué instrucción le dio Eliseo por medio de un mensajero?","Que se lavara siete veces en el Jordán","10"),
("¿Por qué se enojó Naamán al principio?","Esperaba que Eliseo saliera, invocara el nombre del Señor y tocara su llaga; y los ríos de Damasco le parecían mejores","11-12"),
("¿Qué le dijeron sus siervos para convencerlo?","Que si le hubiera pedido algo difícil lo habría hecho; ¿cuánto más lavarse?","13"),
("¿Qué sucedió al sumergirse siete veces?","Su carne quedó como la de un niño, limpia","14"),
("¿Qué pidió llevar a su tierra para adorar al Señor?","Tierra, carga de dos mulos, porque ya no ofrecería holocausto a otros dioses","17"),
("¿Qué hizo Giezi a escondidas?","Persiguió a Naamán y le pidió talento de plata y vestidos, mintiendo","21-24"),
("¿Qué juicio cayó sobre Giezi?","La lepra de Naamán se le pegó a él y a su descendencia","27"),
])

add("2-reyes-6-el-hacha-y-dotan","2 Reyes 6 — El hacha, Dotán y el sitio","2 Reyes",6,[
("¿Qué milagro hizo Eliseo con un hacha prestada que se hundió?","Hizo flotar el hierro echando un palo al agua","5-7"),
("¿Por qué el rey de Siria se irritaba contra sus siervos?","Porque Eliseo avisaba al rey de Israel los lugares de sus emboscadas","8-12"),
("¿Dónde rodeó el ejército sirio a Eliseo?","En Dotán","13-14"),
("¿Qué vio el criado de Eliseo cuando él oró que se le abrieran los ojos?","El monte lleno de caballos y carros de fuego alrededor de Eliseo","17"),
("¿Qué pidió Eliseo respecto a los sirios?","Que fueran heridos de ceguera, y los llevó a Samaria","18-19"),
("¿Los mató el rey de Israel?","No; Eliseo mandó que les dieran de comer y beber y los enviaran","21-23"),
("Más tarde, ¿quién sitió Samaria hasta el hambre extrema?","Ben-adad, rey de Siria","24"),
("¿A qué precio se vendía una cabeza de asno durante el hambre?","Ochenta piezas de plata","25"),
("¿Qué horror le contó una mujer al rey sobre su hijo?","Que habían acordado comerse a sus hijos, y la otra escondió al suyo","28-29"),
("¿A quién culpó el rey y qué juró contra Eliseo?","Culpa al Señor; juró que la cabeza de Eliseo caería aquel día","31"),
])

add("2-reyes-7-el-sitio-se-levanta","2 Reyes 7 — Se levanta el sitio de Samaria","2 Reyes",7,[
("¿Qué anunció Eliseo para el día siguiente en la puerta de Samaria?","Que un seah de flor de harina y dos seah de cebada se venderían por un siclo","1"),
("¿Qué dijo el oficial en cuyo brazo se apoyaba el rey?","Que aunque el Señor hiciera ventanas en el cielo eso no podría ser","2"),
("¿Qué sentencia recibió ese oficial?","Lo vería con sus ojos, pero no comería de ello","2,17"),
("¿Quiénes descubrieron desierto el campamento sirio?","Cuatro leprosos a la entrada de la puerta","3-8"),
("¿Por qué habían huido los sirios?","El Señor hizo oír ruido de carros, caballos y gran ejército","6-7"),
("¿Qué temieron los leprosos si se callaban la buena noticia?","Que les alcanzara castigo; por eso fueron a avisarlo al palacio","9"),
("¿Se cumplió la palabra sobre los precios?","Sí: harina y cebada se vendieron como había dicho Eliseo","16"),
("¿Cómo murió el oficial incrédulo?","El pueblo lo atropelló en la puerta y murió","17-20"),
("¿Qué hallaron los leprosos en las tiendas?","Comida, plata, oro y vestidos","8"),
("¿Sospechó al principio el rey que era una emboscada?","Sí; pensó que los sirios se habían escondido en el campo","12"),
])

add("2-reyes-8-hazael-y-joram","2 Reyes 8 — La sunamita, Hazael y Joram","2 Reyes",8,[
("¿Por qué avisó Eliseo a la sunamita que se fuera?","Porque el Señor había llamado el hambre por siete años","1"),
("Al volver, ¿qué le restituyó el rey?","Su casa, sus tierras y las rentas desde que se fue","6"),
("¿A quién envió Ben-adad enfermo a consultar a Eliseo en Damasco?","A Hazael, con un gran presente","8-9"),
("¿Qué le dijo Eliseo a Hazael sobre el rey?","Que ciertamente moriría, aunque le dijera que sanaría; y que Hazael sería rey de Siria","10-13"),
("¿Cómo mató Hazael a Ben-adad?","Mojó una frazada en agua y se la puso sobre la cara hasta ahogarlo","15"),
("¿Cuántos años reinó Joram hijo de Josafat en Judá?","Ocho años; anduvo en el camino de los reyes de Israel, como la casa de Acab, porque su mujer era hija de Acab","16-18"),
("¿Qué ciudad edomita se rebeló contra Judá?","Edom, y también Libna","20,22"),
("¿Quién reinó en Judá después de Joram?","Ocozías, su hijo","24-25"),
("¿Con quién se alió Ocozías de Judá para pelear en Ramot de Galaad?","Con Joram de Israel contra Hazael de Siria","28"),
("¿Dónde fue a convalecer Joram de Israel de sus heridas?","En Jezreel","29"),
])

add("2-reyes-9-jehu","2 Reyes 9 — Jehú ungido","2 Reyes",9,[
("¿A quién envió Eliseo a ungir a Jehú hijo de Josafat hijo de Nimsi?","A uno de los hijos de los profetas, con el frasco de aceite","1-3"),
("¿Qué misión le dio el Señor a Jehú respecto a la casa de Acab?","Herirla, para vengar la sangre de los profetas y de los siervos del Señor derramada por Jezabel","6-7"),
("Cuando los capitanes oyeron, ¿qué hicieron?","Pusieron sus mantos bajo Jehú en las gradas y tocaron trompeta: «Jehú es rey»","13"),
("¿Cómo murió Joram de Israel?","Jehú tensó el arco y lo hirió entre los hombros; la flecha le salió por el corazón en la heredad de Nabot","24"),
("¿Qué le ocurrió a Ocozías de Judá?","Huyó, pero lo hirieron junto a Ibleam y murió en Meguido","27"),
("Cuando Jezabel se pintó los ojos y se asomó, ¿qué le gritaron?","Jehú mandó que la arrojaran; los caballos la pisotearon","30-33"),
("¿Qué hallaron cuando fueron a enterrarla?","Solo el cráneo, los pies y las palmas de las manos","35"),
("¿Qué palabra se cumplió sobre Jezabel?","Que los perros comerían su carne en la heredad de Jezreel","36-37"),
("¿Dónde estaba Joram cuando Jehú llegó?","Salió al encuentro de Jehú en la heredad de Nabot","21"),
("¿Quién iba con Joram en el carro al encuentro?","Ocozías rey de Judá","21"),
])

add("2-reyes-10-casa-de-acab-y-baal","2 Reyes 10 — Casa de Acab y Baal","2 Reyes",10,[
("¿Cuántos hijos de Acab había en Samaria?","Setenta","1"),
("¿Qué hicieron los jefes de Jezreel con las cabezas?","Las pusieron en cestas y las enviaron a Jehú a Jezreel","7"),
("¿A quiénes mató Jehú en la cisterna de la casa del esquiladero?","A cuarenta y dos parientes de Ocozías de Judá","12-14"),
("¿A quién encontró Jehú y lo llevó en su carro, celoso por el Señor?","A Jonadab hijo de Recab","15-16"),
("¿Cómo aniquiló Jehú a los siervos de Baal?","Convocó una asamblea solemne, llenó el templo y los mató, y destrozó la columna de Baal","18-27"),
("¿En qué convirtieron la casa de Baal?","En letrinas, hasta el día de hoy, dice el relato","27"),
("¿Dejó Jehú el pecado de Jeroboam?","No; no se apartó de los becerros de oro de Betel y Dan","29"),
("¿Cuántas generaciones prometió Dios que se sentarían de Jehú en el trono de Israel?","Hasta la cuarta generación","30"),
("¿Qué territorios arrebató Hazael en esos días?","Todo el territorio de Israel al oriente del Jordán, Galaad, Gad, Rubén y Manasés","32-33"),
("¿Cuántos años reinó Jehú en Samaria?","Veintiocho años","36"),
])

add("2-reyes-11-atalia-y-joas","2 Reyes 11 — Atalía y Joás","2 Reyes",11,[
("Cuando Atalía vio muerto a su hijo, ¿qué hizo?","Se levantó y destruyó toda la descendencia real","1"),
("¿Quién escondió al niño Joás y dónde?","Josaba, hermana de Ocozías, lo escondió en la casa del Señor seis años","2-3"),
("¿En qué año lo mostró Joiada el sacerdote?","En el séptimo año","4"),
("¿Dónde coronaron a Joás?","En la casa del Señor; le pusieron la diadema y el testimonio, y palmotearon: «¡Viva el rey!»","12"),
("Cuando Atalía oyó el ruido, ¿qué gritó?","«¡Traición, traición!»","14"),
("¿Dónde mandó Joiada que la mataran, para no hacerlo en la casa del Señor?","En el camino de la puerta de los caballos, junto al palacio","15-16"),
("¿Qué pacto hizo Joiada?","Pacto entre el Señor, el rey y el pueblo, de que serían pueblo del Señor","17"),
("¿Qué derribó el pueblo?","La casa de Baal, sus altares e imágenes, y mataron a Matán, sacerdote de Baal","18"),
("¿Cuántos años tenía Joás cuando comenzó a reinar?","Siete años","21"),
("¿Quiénes custodiaron al rey con las armas de David que estaban en el templo?","Los capitanes de cientos, los carros y la guardia según las instrucciones de Joiada","4-11"),
])

add("2-reyes-12-joas-y-el-templo","2 Reyes 12 — Joás repara el templo","2 Reyes",12,[
("¿Cuántos años reinó Joás en Jerusalén?","Cuarenta años","1"),
("¿Mientras quién hizo Joás lo recto ante el Señor?","Mientras le instruyó Joiada el sacerdote","2"),
("¿Se quitaron los lugares altos en su tiempo?","No; el pueblo aún sacrificaba y quemaba incienso en ellos","3"),
("¿Para qué mandó Joás recoger dinero?","Para reparar las grietas de la casa del Señor","4-5"),
("¿En qué año los sacerdotes aún no habían reparado las grietas?","En el año veintitrés del rey Joás","6"),
("¿Qué arca mandó poner Joiada junto al altar?","Un arca con un agujero en la tapa para las ofrendas","9"),
("¿A quiénes se entregaba el dinero para la obra?","A los que hacían la obra, maestros y albañiles","11-12"),
("¿Se hacía cuenta con aquellos hombres?","No, porque procedían con fidelidad","15"),
("¿Qué hizo Joás cuando Hazael amenazó Jerusalén?","Tomó las cosas sagradas y el oro del templo y del palacio y se los envió a Hazael","17-18"),
("¿Cómo murió Joás?","Sus siervos conspiraron y lo mataron en la casa de Milo, en el camino a Sila","20-21"),
])

add("2-reyes-13-joacaz-y-elisa","2 Reyes 13 — Joacaz, Joás de Israel y Eliseo","2 Reyes",13,[
("¿Cuántos años reinó Joacaz hijo de Jehú en Samaria?","Diecisiete años","1"),
("¿Por qué oprimió Hazael a Israel en esos días?","Porque Joacaz hizo lo malo y siguió el pecado de Jeroboam","2-3"),
("Cuando Joacaz oró, ¿qué dio el Señor?","Un libertador, y salieron de bajo la mano de los sirios","4-5"),
("¿Qué quedó del ejército de Joacaz?","Cincuenta jinetes, diez carros y diez mil de a pie","7"),
("¿Cuántos años reinó Joás hijo de Joacaz en Israel?","Dieciséis años","10"),
("Cuando Eliseo enfermó de la enfermedad de que murió, ¿qué hizo Joás de Israel?","Lloró sobre su rostro: «¡Padre mío, padre mío, carro de Israel y su gente de a caballo!»","14"),
("¿Cuántas veces debía Joás golpear el suelo con las flechas?","Eliseo se enojó porque solo golpeó tres veces; habría destruido a Siria si hubiera golpeado cinco o seis","18-19"),
("¿Qué milagro ocurrió con los huesos de Eliseo?","Al tocar un muerto aquellos huesos, el muerto revivió y se puso en pie","21"),
("¿A quién recobró Joás de Israel de mano de Ben-adad hijo de Hazael?","Las ciudades que Hazael había tomado; lo venció tres veces","25"),
("¿Dejó Joás de Israel el pecado de Jeroboam?","No; hizo lo malo ante los ojos del Señor","11"),
])

add("2-reyes-14-amazias-y-jeroboam","2 Reyes 14 — Amasías y Jeroboam II","2 Reyes",14,[
("¿Cuántos años tenía Amasías cuando comenzó a reinar en Judá?","Veinticinco años; reinó veintinueve en Jerusalén","2"),
("¿Qué hizo Amasías con los siervos que mataron a su padre?","Los mató, pero no a los hijos, según la ley de Moisés","5-6"),
("¿A quién venció en el Valle de la Sal?","A diez mil edomitas, y tomó Sela","7"),
("¿Qué desafío envió a Joás de Israel?","«Ven, veámonos cara a cara»","8"),
("¿Con qué fábula respondió Joás?","La del cardo del Líbano que pidió la hija del cedro, y lo pisó una fiera","9"),
("¿Qué le sucedió a Amasías en Bet-semes?","Judá fue derrotado; Joás capturó a Amasías, derribó el muro de Jerusalén y se llevó tesoros y rehenes","11-14"),
("¿Cómo murió Amasías?","Huyeron de una conspiración a Laquis, pero lo persiguieron y lo mataron allí","19"),
("¿Cuántos años reinó Jeroboam II hijo de Joás en Samaria?","Cuarenta y un años","23"),
("¿Qué libertó Jeroboam II, según la palabra de Jonás hijo de Amitai?","El territorio de Israel desde la entrada de Hamat hasta el mar del Arabá","25"),
("¿Quién sucedió a Amasías en Judá?","Azarías (Uzías), de dieciséis años","21"),
])

add("2-reyes-15-uzias-a-pecaj","2 Reyes 15 — Azarías, Zacarías y los reyes de Israel","2 Reyes",15,[
("¿Qué le ocurrió a Azarías (Uzías) aunque hizo lo recto?","El Señor lo hirió de lepra hasta el día de su muerte, y habitó en una casa aparte","5"),
("¿Quién gobernaba el palacio mientras Uzías estaba leproso?","Jotam, su hijo","5"),
("¿Cuánto reinó Zacarías hijo de Jeroboam II y cómo murió?","Seis meses; Salum hijo de Jabes conspiró y lo mató en público","8-10"),
("¿Qué palabra se cumplió con Zacarías?","Que Jehú tendría hijos en el trono hasta la cuarta generación","12"),
("¿Cuánto reinó Salum?","Un mes en Samaria; Manahem hijo de Gadi lo mató","13-14"),
("¿Qué crueldad hizo Manahem contra Tifsa?","Abrió a todas las mujeres encintas porque no le abrieron la ciudad","16"),
("¿A quién pagó Manahem mil talentos de plata para que lo confirmara?","A Pul, rey de Asiria","19-20"),
("¿Quién mató a Pekaía hijo de Manahem?","Peka hijo de Remalías, su capitán, en Samaria","25"),
("¿Quién mató a Peka y reinó en su lugar?","Oseas hijo de Ela","30"),
("¿Cuántos años reinó Jotam en Jerusalén?","Dieciséis años; hizo lo recto, pero no se quitaron los altos","32-35"),
])

add("2-reyes-16-acaz","2 Reyes 16 — Acaz de Judá","2 Reyes",16,[
("¿Cuántos años tenía Acaz cuando comenzó a reinar?","Veinte años; reinó dieciséis en Jerusalén","2"),
("¿Llegó Acaz a pasar a su hijo por fuego?","Sí, conforme a las abominaciones de las naciones","3"),
("¿Quiénes sitiaron a Acaz en Jerusalén?","Rezín de Siria y Peka de Israel, pero no pudieron tomarla","5"),
("¿A quién pidió Acaz ayuda y qué le envió?","A Tiglat-pileser de Asiria; le envió plata y oro del templo y del palacio","7-8"),
("¿Qué hizo el rey de Asiria con Damasco?","La tomó, llevó cautivos a sus moradores a Kir y mató a Rezín","9"),
("¿Qué altar vio Acaz en Damasco?","Un altar; envió a Urías el sacerdote el diseño para hacer uno igual en Jerusalén","10-11"),
("¿Qué hizo Acaz con el altar de bronce del Señor?","Lo apartó de su lugar delante de la casa y lo puso al lado del nuevo altar","14"),
("¿Qué recortes hizo en el templo por el rey de Asiria?","Quitó los paneles de las bases, el Mar de sobre los bueyes y el pasadizo cubierto del sábado","17-18"),
("¿Quién sucedió a Acaz?","Ezequías, su hijo","20"),
("¿Sacrificaba Acaz en los altos?","Sí; ofrecía sacrificios y quemaba incienso en los altos, collados y bajo todo árbol frondoso","4"),
])

add("2-reyes-17-caida-de-samaria","2 Reyes 17 — Caída de Samaria","2 Reyes",17,[
("¿Cuántos años reinó Oseas en Samaria?","Nueve años","1"),
("¿A qué rey sirvió Oseas y luego se rebeló buscando ayuda de Egipto?","A Salmanasar, rey de Asiria; envió mensajeros a So, rey de Egipto","3-4"),
("¿En qué año de Oseas tomó el rey de Asiria Samaria?","En el año nueve de Oseas; llevó a Israel cautivo a Asiria","6"),
("¿Por qué, según el narrador, cayó Israel?","Porque pecaron contra el Señor, temieron a otros dioses y anduvieron en las costumbres de las naciones","7-8"),
("¿Qué advertencia habían dado los profetas?","Que se convirtieran de sus malos caminos y guardaran los mandamientos","13"),
("¿A qué llegaron con los dos becerros y Asera?","A servir a Baal, pasar hijos e hijas por fuego y usar adivinación","16-17"),
("¿Solo se llevó el Señor a Israel, o también Judá pecaba?","También Judá no guardó los mandamientos y anduvo en las prácticas de Israel","19"),
("¿A quiénes trajo el rey de Asiria a vivir en Samaria?","Gente de Babilonia, Cuta, Ava, Hamat y Sefarvaim","24"),
("¿Por qué enviaron leones entre los nuevos habitantes?","Porque no temían al Señor","25-26"),
("¿Qué solución dio el rey de Asiria?","Enviar a uno de los sacerdotes deportados para que enseñara la ley del Dios de la tierra","27-28"),
("¿Cómo se describe la religión resultante?","Temían al Señor y a la vez servían a sus propios dioses","33"),
])

add("2-reyes-18-ezequias","2 Reyes 18 — Ezequías y Senaquerib","2 Reyes",18,[
("¿Cuántos años tenía Ezequías cuando comenzó a reinar?","Veinticinco años; reinó veintinueve en Jerusalén","2"),
("¿Qué hizo Ezequías con los altos, las estelas y la serpiente de bronce?","Los quitó; hizo pedazos la serpiente de bronce que Moisés había hecho, porque le quemaban incienso y la llamaban Nehustán","4"),
("¿En quién confió Ezequías como ningún otro rey de Judá?","En el Señor, Dios de Israel","5"),
("¿A quién venció y a quién dejó de servir?","Venció a los filisteos y se rebeló contra el rey de Asiria, no sirviéndole","7-8"),
("En el año catorce, ¿quién subió contra las ciudades fortificadas de Judá?","Senaquerib, rey de Asiria, y las tomó","13"),
("¿Qué le dio Ezequías para que se retirara?","Trescientos talentos de plata y treinta de oro, hasta quitar el oro de las puertas del templo","14-16"),
("Aun así, ¿a quién envió el rey de Asiria a Jerusalén?","Al Rabsaces, con un gran ejército, junto al acueducto del estanque superior","17"),
("¿En qué idioma pidió Eliaquim que hablara el Rabsaces?","En arameo, no en judío, para que el pueblo no entendiera","26"),
("¿Qué burla hizo el Rabsaces sobre confiar en Egipto?","Que Egipto era una caña cascada que atraviesa la mano de quien se apoya","21"),
("¿Qué pidió Ezequías al pueblo respecto a responderle?","Que no le respondieran","36"),
])

add("2-reyes-19-isaias-y-asiria","2 Reyes 19 — Isaías y la liberación","2 Reyes",19,[
("Cuando Ezequías oyó las palabras del Rabsaces, ¿qué hizo?","Rasgó sus vestidos, se cubrió de cilicio y entró en la casa del Señor","1"),
("¿A qué profeta envió mensajeros?","A Isaías hijo de Amoz","2"),
("¿Qué dijo Isaías sobre el rey de Asiria?","Que no temiera; Dios haría que oyera un rumor y se volviera a su tierra, y allí caería a espada","6-7"),
("Cuando Senaquerib amenazó de nuevo por cartas, ¿qué hizo Ezequías?","Extendió la carta ante el Señor en el templo y oró","14-19"),
("¿Qué dijo el Señor sobre el orgullo de Asiria?","Que él mismo había planeado desde antiguo traer aquello, y ahora metería su anzuelo en la nariz de Asiria","25-28"),
("¿Qué señal dio a Ezequías sobre la comida?","El primer año comerían lo que nazca silvestre; al tercero sembrarían y vendimiarían","29"),
("¿Cuántos del ejército asirio hirió el ángel del Señor?","Ciento ochenta y cinco mil; por la mañana eran todos cadáveres","35"),
("¿Adónde se volvió Senaquerib?","A Nínive","36"),
("¿Cómo murió Senaquerib?","Sus hijos Adramelec y Sarezer lo mataron a espada mientras adoraba en la casa de Nisroc, y Esar-hadón reinó","37"),
("¿Defendería Dios a Jerusalén por quién?","Por amor a sí mismo y por amor a David su siervo","34"),
])

add("2-reyes-20-enfermedad-de-ezequias","2 Reyes 20 — Enfermedad de Ezequías y Babilonia","2 Reyes",20,[
("Cuando Ezequías enfermó de muerte, ¿qué le dijo Isaías?","Que pusiera su casa en orden, porque moriría y no viviría","1"),
("¿Qué hizo Ezequías al oírlo?","Volvió su rostro a la pared y oró llorando","2-3"),
("¿Cuántos años más le añadió el Señor?","Quince años, y lo libraría del rey de Asiria","6"),
("¿Qué señal pidió y se le dio respecto a la sombra?","Que la sombra retrocediera diez gradas en el reloj de Acaz","8-11"),
("¿Con qué lo curaron de la llaga?","Con una masa de higos que pusieron sobre la llaga","7"),
("¿Quién envió mensajeros y un presente al oír que había enfermado?","Berodac-baladán, hijo de Baladán, rey de Babilonia","12"),
("¿Qué les mostró Ezequías?","Toda su casa de tesoros, la plata, el oro, las especias y todo su arsenal; no quedó nada que no les mostrara","13"),
("¿Qué anunció Isaías por aquel acto?","Que todo sería llevado a Babilonia, y que de sus hijos serían eunucos en el palacio del rey de Babilonia","17-18"),
("¿Qué obra hidráulica de Ezequías se menciona al final?","El estanque y el conducto con que metió las aguas en la ciudad","20"),
("¿Quién sucedió a Ezequías?","Manasés, su hijo","21"),
])

add("2-reyes-21-manases-y-amon","2 Reyes 21 — Manasés y Amón","2 Reyes",21,[
("¿Cuántos años tenía Manasés cuando comenzó a reinar y cuánto reinó?","Doce años de edad; reinó cincuenta y cinco años en Jerusalén","1"),
("¿Qué reconstruyó Manasés que Ezequías había destruido?","Los altos","3"),
("¿A qué altares levantó en la casa del Señor?","Altares a Baal, una imagen de Asera y altares para todo el ejército del cielo","3-5"),
("¿Llegó a pasar a su hijo por fuego?","Sí; también practicó adivinación y consultó a nigromantes","6"),
("¿Qué dijo el Señor que haría a Jerusalén por causa de Manasés?","Que la enjuagaría como se enjuaga un plato, y entregaría el resto a sus enemigos","13-14"),
("¿De qué sangre se dice que llenó Manasés a Jerusalén?","De sangre inocente, en gran manera","16"),
("¿Cuántos años tenía Amón cuando comenzó a reinar?","Veintidós años; reinó dos años","19"),
("¿Cómo murió Amón?","Sus siervos conspiraron y lo mataron en su casa","23"),
("¿Qué hizo el pueblo de la tierra entonces?","Mató a todos los conspiradores y puso a Josías su hijo por rey","24"),
("¿Anduvo Amón como su padre?","Sí; sirvió a los ídolos que su padre había servido y no se humilló","20-22"),
])

add("2-reyes-22-josias-y-el-libro","2 Reyes 22 — Josías y el libro de la ley","2 Reyes",22,[
("¿Cuántos años tenía Josías cuando comenzó a reinar?","Ocho años; reinó treinta y uno en Jerusalén","1"),
("¿Se apartó Josías a derecha o izquierda del camino de David?","No; hizo lo recto ante el Señor","2"),
("En el año dieciocho, ¿a quién envió al templo para el dinero de la obra?","A Safán el escriba, a Hilcías el sumo sacerdote","3-4"),
("¿Qué halló Hilcías en la casa del Señor?","El libro de la ley","8"),
("Cuando Josías oyó las palabras del libro, ¿qué hizo?","Rasgó sus vestidos","11"),
("¿A quién mandó consultar al Señor, hombre y pueblo y Judá?","A Hulda la profetisa, que vivía en Jerusalén en el segundo barrio","13-14"),
("¿Qué dijo Hulda que vendría sobre el lugar?","Mal, conforme a las palabras del libro, por haber abandonado al Señor","16-17"),
("¿Por qué no lo vería Josías en sus días?","Porque su corazón se había enternecido y se había humillado ante el Señor; lo recogerían en paz","18-20"),
("¿Se pedía cuenta a los que hacían la obra del templo?","No, porque procedían con fidelidad","7"),
("¿Quiénes fueron con Safán a Hulda?","Ahicam, Acbor, Safán y Asaías","12,14"),
])

add("2-reyes-23-reforma-y-muerte-de-josias","2 Reyes 23 — Reforma y muerte de Josías","2 Reyes",23,[
("¿Qué leyó Josías ante todo el pueblo en la casa del Señor?","Todas las palabras del libro del pacto hallado en el templo","2"),
("¿Qué pacto hizo el rey delante del Señor?","De andar en pos del Señor y guardar sus mandamientos con todo el corazón y el alma","3"),
("¿Qué hizo con los utensilios de Baal y de Asera en el templo?","Los sacó y los quemó fuera de Jerusalén en los campos del Cedrón, y llevó el polvo a Betel","4"),
("¿Qué hizo en Betel, cumpliendo la palabra del hombre de Dios?","Derribó el altar y el alto que hizo Jeroboam, quemó el alto y lo hizo polvo, y quemó Asera","15-16"),
("¿Qué pascua se celebró en Jerusalén?","Una pascua como no se había hecho desde los días de los jueces, en el año dieciocho de Josías","21-23"),
("¿Hubo rey como Josías que se volviera al Señor con todo su corazón, alma y fuerzas?","No lo hubo antes ni después, según este relato","25"),
("Aun así, ¿apartó el Señor el furor anunciado por Manasés?","No; no se volvió del ardor de su gran ira","26-27"),
("¿Cómo murió Josías?","El faraón Necao subió y Josías le salió al encuentro; Necao lo mató en Meguido","29"),
("¿Quién lo ungió el pueblo por rey después?","Joacaz, su hijo","30"),
("¿Qué hizo Necao con Joacaz?","Lo encadenó en Ribla y puso por rey a Eliaquim, a quien llamó Joacim, y llevó a Joacaz a Egipto","33-34"),
])

add("2-reyes-24-joacim-y-el-destierro","2 Reyes 24 — Joacim, Joaquín y el primer destierro","2 Reyes",24,[
("¿A quién sirvió Joacim tres años y luego se rebeló?","A Nabucodonosor, rey de Babilonia","1"),
("¿Por qué envió el Señor bandas de caldeos, sirios, moabitas y amonitas?","Para quitar a Judá de su presencia, por los pecados de Manasés y la sangre inocente","2-4"),
("¿Cuántos años reinó Joacim en Jerusalén?","Once años; hizo lo malo ante el Señor","5-6"),
("¿Quién reinó tres meses al sucederlo?","Joaquín, su hijo","8"),
("Cuando Nabucodonosor sitió Jerusalén, ¿qué hizo Joaquín?","Salió al rey de Babilonia, él, su madre, sus siervos y oficiales","12"),
("¿Qué se llevó Nabucodonosor del templo y del palacio?","Todos los tesoros y cortó todos los utensilios de oro que había hecho Salomón","13"),
("¿A quiénes deportó, además del rey?","A todos los jefes, valientes, artesanos y herreros: diez mil cautivos; no quedó sino la gente pobre","14"),
("¿A quién puso en lugar de Joaquín?","A Matanías, tío de Joaquín, y le cambió el nombre en Sedequías","17"),
("¿Cuántos años tenía Sedequías al comenzar a reinar?","Veintiún años; reinó once años","18"),
("¿Se rebeló Sedequías contra el rey de Babilonia?","Sí","20"),
])

add("2-reyes-25-caida-de-jerusalen","2 Reyes 25 — Caída de Jerusalén","2 Reyes",25,[
("¿En qué día sitió Nabucodonosor Jerusalén con todo su ejército?","En el año noveno de Sedequías, el día diez del mes décimo","1"),
("¿Hasta cuándo duró el hambre en la ciudad?","Hasta el año undécimo, el día nueve del mes cuarto, cuando el hambre se agravó","2-3"),
("¿Por dónde huyó Sedequías?","De noche, por el camino de la puerta entre los dos muros, rumbo al Arabá","4"),
("¿Dónde lo alcanzaron y qué le hicieron en Ribla?","En las llanuras de Jericó; mataron a sus hijos delante de él, le sacaron los ojos y lo llevaron a Babilonia encadenado","5-7"),
("¿Quién quemó la casa del Señor, el palacio y todas las casas grandes?","Nabuzaradán, capitán de la guardia, el día siete del mes quinto","8-9"),
("¿Qué hicieron con los muros de Jerusalén?","Todo el ejército de los caldeos los derribó","10"),
("¿Qué utensilios de bronce se llevaron?","Las columnas, las basas y el Mar de bronce, y todo el bronce","13-16"),
("¿A quién dejó Nabuzaradán como gobernador sobre los pobres de la tierra?","A Gedalías hijo de Ahicam","22"),
("¿Quién mató a Gedalías en Mizpa?","Ismael hijo de Netanías, de la estirpe real","25"),
("¿Qué hizo el pueblo entonces?","Se levantó y se fue a Egipto, por miedo a los caldeos","26"),
("En el año treinta y siete del destierro de Joaquín, ¿quién lo sacó de la cárcel?","Evil-merodac, rey de Babilonia, y le dio un asiento más alto que el de otros reyes","27-30"),
])


EXTRA: dict[str, list[tuple[str, str, str]]] = {
    "1-reyes-1-adolonias-y-salomon": [
        ("¿Se acostó David con Abisag?", "No la conoció", "4"),
        ("¿Qué edad y condición tenía David al inicio del relato?", "Era muy anciano y no se calentaba aunque lo cubrían de ropa", "1"),
    ],
    "1-reyes-3-sabiduria-de-salomon": [
        ("¿A quién amaba Salomón, aunque aún sacrificaba en los altos?", "Al Señor", "3"),
        ("¿Cuántos holocaustos ofrecía Salomón en Gabaón?", "Mil holocaustos sobre aquel altar", "4"),
    ],
    "1-reyes-8-dedicacion-del-templo": [
        ("¿Qué cubrían los querubines con sus alas en el lugar santísimo?", "El arca y sus varas", "7"),
        ("¿En qué mes se reunió Israel para la dedicación?", "En el mes de Etanim, que es el mes séptimo", "2"),
    ],
    "1-reyes-10-reina-de-saba": [
        ("¿De qué eran todos los vasos de beber de Salomón?", "De oro; ninguno de plata, porque en aquellos días no se le daba valor", "21"),
        ("¿Cada tres años, qué traía la flota de Tarsis?", "Oro, plata, marfil, monos y pavos reales", "22"),
    ],
    "1-reyes-12-division-del-reino": [
        ("¿A quién hizo Israel rey cuando se apartó de la casa de David?", "A Jeroboam", "20"),
        ("¿Qué mes inventó Jeroboam para su fiesta, como la de Judá?", "El mes octavo, el día quince, y ofreció sobre el altar de Betel", "32-33"),
    ],
    "1-reyes-17-elias-y-la-viuda": [
        ("¿Qué le dijo la viuda a Elías cuando le pidió agua y pan?", "Que solo le quedaba un puñado de harina y un poco de aceite, y que iría a prepararlo para ella y su hijo, y luego morirían", "12"),
        ("¿Cuánto duró la provisión milagrosa de harina y aceite?", "Hasta el día en que el Señor mandó lluvia sobre la tierra", "14"),
    ],
    "1-reyes-18-carmelo": [
        ("¿Cuánto tiempo había durado la sequía cuando Elías se presentó a Acab?", "Tres años, en el tercer año de la palabra del Señor", "1"),
        ("¿Con cuántas piedras reparó Elías el altar del Señor?", "Doce piedras, conforme a las tribus de los hijos de Jacob", "31"),
    ],
    "1-reyes-21-nabot": [
        ("¿En qué ciudad estaba la viña de Nabot?", "En Jezreel, junto al palacio de Acab", "1"),
        ("¿Qué ayuno fingido proclamó Jezabel en Jezreel?", "Un ayuno, y sentaron a Nabot a la cabeza del pueblo para acusarlo", "9-12"),
    ],
    "2-reyes-2-elias-es-llevado": [
        ("¿Qué dijeron Elías y Eliseo al cruzar el Jordán la primera vez?", "Elías golpeó las aguas con el manto, se apartaron, y pasaron en seco", "8"),
        ("¿Buscaron los hijos de los profetas a Elías después de ser llevado?", "Sí; cincuenta hombres buscaron tres días y no lo hallaron", "16-17"),
    ],
    "2-reyes-5-naaman": [
        ("¿Qué reconoció Naamán después de ser sanado?", "Que no hay Dios en toda la tierra sino en Israel", "15"),
        ("¿Qué licencia pidió Naamán respecto a Rimón?", "Que el Señor le perdonara cuando su amo se apoyara en él para inclinarse en el templo de Rimón", "18"),
    ],
    "2-reyes-9-jehu": [
        ("¿Cómo llegó Jehú a Jezreel, según el atalaya?", "El manejar es como el de Jehú hijo de Nimsi, porque maneja con furor", "20"),
        ("¿Qué gritó Jezabel al asomarse a la ventana?", "«¿Vino en paz Zimri, asesino de su señor?»", "31"),
    ],
    "2-reyes-17-caida-de-samaria": [
        ("¿A qué ciudades de Asiria llevaron a los israelitas cautivos?", "A Halah, junto al Habor, río de Gozán, y a las ciudades de los medos", "6"),
        ("¿Qué dios propio se hizo cada nación en los altos de Samaria?", "Cada pueblo el suyo: Sucot-benot, Nergal, Asima, Nibhaz, Tartac, Adramelec y Anamelec", "29-31"),
    ],
    "2-reyes-18-ezequias": [
        ("¿En qué año de Ezequías cayó Samaria?", "En el año sexto de Ezequías, que era el año nueve de Oseas", "10"),
        ("¿Quiénes salieron al Rabsaces junto a Eliaquim?", "Eliaquim hijo de Hilcías, Sebna el escriba y Joa el cronista", "18"),
    ],
    "2-reyes-22-josias-y-el-libro": [
        ("¿Quién era la madre de Josías?", "Jedida hija de Adaía, de Boscat", "1"),
        ("¿Qué les dijo Josías a los enviados después de oír el libro?", "Que consultaran al Señor por él, por el pueblo y por todo Judá acerca de las palabras de aquel libro", "13"),
    ],
    "2-reyes-23-reforma-y-muerte-de-josias": [
        ("¿Qué hizo Josías con los huesos de los sepulcros de Betel?", "Los quemó sobre el altar para contaminarlo, salvo la sepultura del hombre de Dios de Judá", "16-18"),
        ("¿Quitó Josías a los médiums y a los ídolos de Judá y Jerusalén?", "Sí, para cumplir las palabras de la ley escritas en el libro que halló Hilcías", "24"),
    ],
}


def parse_card(path: Path) -> tuple[str, str] | None:
    text = path.read_text(encoding="utf-8")
    q = ""
    a = ""
    phase = "meta"
    for line in text.splitlines():
        t = line.strip()
        if t == "#flashcard":
            continue
        if t == "?":
            phase = "answer"
            continue
        if phase == "meta" and t.startswith("#"):
            q = re.sub(r"^#+\s*", "", t).strip()
            phase = "question"
            continue
        if phase == "question" and t and t != "---" and not t.startswith("[["):
            q = f"{q} {t}".strip()
        if phase == "answer":
            if t.startswith("[[") or t == "---":
                break
            if t:
                a = f"{a} {t}".strip() if a else t
    if q and a:
        return q, a
    return None


def norm(s: str) -> str:
    s = unicodedata.normalize("NFKD", s).lower()
    s = "".join(c for c in s if not unicodedata.combining(c))
    s = re.sub(r"[^a-z0-9áéíóúñü\s]", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def tokens(s: str) -> set[str]:
    return {w for w in norm(s).split() if len(w) > 2}


def jaccard(a: set[str], b: set[str]) -> float:
    if not a or not b:
        return 0.0
    return len(a & b) / len(a | b)


def clearer(p1: Path, p2: Path, q1: str, q2: str, a1: str, a2: str) -> Path:
    # Keep the more specific question; tie-break on longer answer.
    if len(q1) != len(q2):
        return p1 if len(q1) > len(q2) else p2
    return p1 if len(a1) >= len(a2) else p2


def patch_chapters_ts(titles: dict[str, str]) -> None:
    text = CHAPTERS_TS.read_text(encoding="utf-8")
    m = re.search(r"export const CHAPTER_TITLES: Record<string, string> = \{([\s\S]*?)\n\}", text)
    if not m:
        raise SystemExit("CHAPTER_TITLES not found")
    existing = dict(re.findall(r"'([^']+)': '([^']*)'", m.group(1)))
    existing.update(titles)
    body = ",\n".join(f"  '{k}': '{v}'" for k, v in existing.items())
    new = f"export const CHAPTER_TITLES: Record<string, string> = {{\n{body},\n}}"
    text = text[: m.start()] + new + text[m.end() :]
    CHAPTERS_TS.write_text(text, encoding="utf-8")


def rebuild_index(titles: dict[str, str]) -> int:
    folders = [p for p in VAULT.iterdir() if p.is_dir()]

    def key(p: Path):
        slug = p.name
        if slug.startswith("1-reyes-"):
            n = int(re.match(r"1-reyes-(\d+)", slug).group(1))
            return (2, n, slug)
        if slug.startswith("2-reyes-"):
            n = int(re.match(r"2-reyes-(\d+)", slug).group(1))
            return (3, n, slug)
        if slug.startswith("2-samuel-"):
            n = int(re.match(r"2-samuel-(\d+)", slug).group(1))
            return (1, n, slug)
        m = re.match(r"samuel-(\d+)", slug)
        n = int(m.group(1)) if m else 99
        return (0, n, slug)

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
            parsed = parse_card(f)
            q = parsed[0] if parsed else f.stem
            short = q if len(q) <= 70 else q[:69] + "…"
            rel = f"flashcards/{folder.name}/{f.stem}"
            lines.append(f"- [[{rel}|{short}]]")
            total += 1
        lines.append("")
    text = "\n".join(lines).replace("COUNT", str(total)) + "\n"
    INDEX.write_text(text, encoding="utf-8")
    return total


def dedupe() -> list[str]:
    files: list[Path] = []
    for p in VAULT.rglob("*.md"):
        if p.name == "index.md":
            continue
        rel = str(p.relative_to(VAULT))
        if rel.startswith("2-samuel-") or rel.startswith("1-reyes-") or rel.startswith("2-reyes-"):
            files.append(p)
    parsed: list[tuple[Path, str, str, set[str], set[str]]] = []
    for p in files:
        qa = parse_card(p)
        if not qa:
            continue
        q, a = qa
        parsed.append((p, q, a, tokens(q), tokens(a)))
    drop: set[Path] = set()
    removed: list[str] = []
    for i in range(len(parsed)):
        p1, q1, a1, tq1, ta1 = parsed[i]
        if p1 in drop:
            continue
        for j in range(i + 1, len(parsed)):
            p2, q2, a2, tq2, ta2 = parsed[j]
            if p2 in drop:
                continue
            qsim = jaccard(tq1, tq2)
            asim = jaccard(ta1, ta2)
            if qsim >= 0.72 and asim >= 0.72:
                keep = clearer(p1, p2, q1, q2, a1, a2)
                loser = p2 if keep == p1 else p1
                drop.add(loser)
                removed.append(f"{loser.relative_to(VAULT)} (kept {keep.name})")
                if loser == p1:
                    break
    for p in drop:
        p.unlink()
    return removed


def main() -> None:
    by_slug = {slug: (title, book, ch, cards) for slug, title, book, ch, cards in KINGS}
    extra_n = 0
    for slug, more in EXTRA.items():
        title, book, ch, cards = by_slug[slug]
        cards.extend(more)
        extra_n += len(more)

    titles: dict[str, str] = {}
    added = 0
    for slug, title, book, ch, cards in KINGS:
        titles[slug] = title
        added += write_chapter(slug, title, book, ch, cards)

    # Merge existing 1–2 Samuel titles from chapters.ts later
    removed = dedupe()
    # After unlink, rebuild titles from remaining kings + existing
    ts = CHAPTERS_TS.read_text(encoding="utf-8")
    existing = dict(re.findall(r"'([^']+)': '([^']*)'", ts))
    existing.update(titles)
    patch_chapters_ts(existing)
    total = rebuild_index(existing)
    report = VAULT.parent / ".."  # unused
    print(f"KINGS_WRITTEN={added}")
    print(f"EXTRA_APPENDED={extra_n}")
    print(f"DUPES_REMOVED={len(removed)}")
    for r in removed:
        print(f"  DROP {r}")
    print(f"INDEX_TOTAL={total}")


if __name__ == "__main__":
    main()
