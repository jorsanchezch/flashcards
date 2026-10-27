"""Geographic setting and character ties for every glossary place.

Each note states where the place sits, then which people belong to it and why.
`related` is what the database stores: parent regions first, then characters.
The phrase is shown as «Nombre — frase».
"""

from __future__ import annotations

PLACE_GEOGRAPHY: dict[str, dict] = {
    "abel-bet-maaca": {
        "note": (
            "Ciudad del extremo norte de Israel, al norte de Dan, en la frontera con Aram. "
            "Joab la sitió porque Seba hijo de Bicri se refugió allí tras rebelarse contra David; "
            "una mujer de la ciudad entregó la cabeza de Seba."
        ),
        "related": [
            ("dan", "queda al sur; Abel-bet-maaca está más al norte, en la frontera"),
            ("aram", "país vecino, al otro lado de la frontera norte"),
            ("israel", "en su extremo norte"),
            ("seba", "se refugió aquí al rebelarse contra David"),
            ("bicri", "padre de Seba, el rebelde buscado en la ciudad"),
            ("joab", "sitió la ciudad hasta que entregaron a Seba"),
            ("david", "Seba se había levantado contra su reino"),
        ],
    },
    "adulam": {
        "note": (
            "Cueva en las colinas de Judá, al suroeste de Belén, entre la sierra y la Sefela. "
            "David se escondió aquí huyendo de Saúl; se le unieron sus hermanos y unos cuatrocientos hombres en apuros."
        ),
        "related": [
            ("juda", "en la ladera occidental de Judá"),
            ("belen", "al suroeste del pueblo de Isaí y de David"),
            ("david", "se refugió en la cueva y reunió allí a su gente"),
            ("saul", "David huía de él cuando llegó a Adulam"),
            ("isai", "sus otros hijos bajaron a la cueva con David"),
        ],
    },
    "afec": {
        "note": (
            "Hay más de un Afec. El de Samuel está en la llanura costera, frente a Ebenezer: "
            "allí acamparon los filisteos y se llevaron el arca; Ofni y Finees murieron, y Elí cayó al saberlo. "
            "Otro Afec es el campamento desde el que Aquis despidió a David camino de Jezreel. "
            "En Reyes, Ben-adad de Siria volvió a pelear contra Acab en un Afec de la llanura del norte."
        ),
        "related": [
            ("filisteos", "acamparon aquí y derrotaron a Israel"),
            ("ebenezer", "el campamento de Israel quedaba frente a este Afec"),
            ("eli", "murió al oír que el arca se había perdido en esa batalla"),
            ("ofni", "murió en el combate que salió de Afec"),
            ("finees", "murió con Ofni cuando el arca fue tomada"),
            ("aquis", "desde otro Afec despidió a David antes de la batalla"),
            ("david", "los filisteos no lo dejaron subir con ellos desde Afec"),
            ("ben-adad", "en el Afec de Reyes peleó de nuevo contra Israel"),
            ("acab", "enfrentó a Ben-adad en ese Afec del norte"),
        ],
    },
    "amon": {
        "note": (
            "Nación al este del Jordán y de Galaad, al noreste del mar Muerto. "
            "Nahas sitió Jabes de Galaad y Saúl lo venció; más tarde David y Joab tomaron Rabá de Amón. "
            "El mismo nombre es el de un rey de Judá, hijo de Manasés y padre de Josías, que reinó en Jerusalén y no en este país."
        ),
        "related": [
            ("galaad", "Amón queda al este de esta meseta"),
            ("jordan", "al este del río"),
            ("jabes", "Nahas la sitió y Saúl la liberó"),
            ("nahas", "rey amonita que amenazó a Jabes"),
            ("saul", "venció a Nahas y salvó a Jabes"),
            ("david", "sometió Amón y tomó su capital"),
            ("joab", "mandó el ejército en la guerra contra Amón"),
            ("manases", "padre del rey Amón de Judá, distinto de esta nación"),
            ("josias", "hijo de ese rey Amón de Jerusalén"),
        ],
    },
    "anatot": {
        "note": (
            "Pueblo de sacerdotes en Benjamín, unos kilómetros al noreste de Jerusalén. "
            "Salomón confinó aquí a Abiatar por haber apoyado a Adonías. Más adelante es la patria de Jeremías."
        ),
        "related": [
            ("benjamin", "en el territorio de Benjamín"),
            ("jerusalen", "al noreste de la ciudad"),
            ("abiatar", "Salomón lo envió a sus tierras de Anatot"),
            ("salomon", "lo apartó del sacerdocio y lo confinó aquí"),
            ("adonias", "Abiatar había apoyado su intento de reinar"),
            ("david", "Abiatar había cargado el arca delante de él"),
        ],
    },
    "araba": {
        "note": (
            "La gran depresión que baja desde el mar de Galilea por el Jordán y el mar Muerto hasta el golfo de Elat, al sur. "
            "Elías y Eliseo cruzaron el Jordán, que corre por el Arabá; el camino a Edom y a Ezión-geber sigue esta hondonada."
        ),
        "related": [
            ("jordan", "el río que recorre el Arabá"),
            ("edom", "el Arabá del sur bordea la tierra de Edom"),
            ("elat", "el extremo sur de la depresión, en el mar Rojo"),
            ("elias", "cruzó el Jordán con Eliseo por esta depresión"),
            ("eliseo", "partió las aguas del Jordán al volver del Arabá"),
        ],
    },
    "aram": {
        "note": (
            "Siria, al norte y al noreste de Israel, con capital en Damasco; incluye Zoba, Bet-rehob y Gesur. "
            "David venció a Hadad-ezer. Después Ben-adad, Hazael y Rezín pelearon contra Israel y Judá desde Aram."
        ),
        "related": [
            ("damasco", "capital de Aram"),
            ("siria", "el mismo país con el otro nombre"),
            ("israel", "vecino del sur, enemigo y a veces aliado"),
            ("hadad-ezer", "rey de Zoba, en Aram, vencido por David"),
            ("david", "derrotó a los reyes arameos que ayudaban a Amón"),
            ("ben-adad", "nombre de reyes de Aram que pelearon con Israel"),
            ("hazael", "rey de Aram que hostigó a Israel"),
            ("rezin", "rey de Aram aliado de Peka contra Acaz"),
        ],
    },
    "asdod": {
        "note": (
            "Ciudad filistea de la costa, entre Gaza y el territorio de Judá, al oeste de la sierra. "
            "Llevaron el arca al templo de Dagón; el ídolo cayó roto y la ciudad sufrió tumores, así que pasaron el arca a Gat."
        ),
        "related": [
            ("filisteos", "una de sus cinco ciudades de la costa"),
            ("juda", "al oeste de la sierra de Judá"),
            ("gat", "ciudad hermana adonde enviaron el arca"),
            ("dagon", "su ídolo cayó delante del arca en Asdod"),
        ],
    },
    "asiria": {
        "note": (
            "Imperio al noreste, más allá del Éufrates, con capital en Nínive. "
            "Tiglat-pileser, Salmanasar y Senaquerib sometieron el reino del norte y amenazaron a Ezequías en Judá; "
            "deportaron a Israel hacia Halah, Habor y Gozán."
        ),
        "related": [
            ("ninive", "su capital, junto al Tigris"),
            ("eufrates", "el gran río que hay que cruzar para llegar a Asiria"),
            ("israel", "se llevó cautivo el reino del norte"),
            ("juda", "amenazó a Jerusalén en días de Ezequías"),
            ("tiglat-pileser", "intervino en Israel y se llevó gente de Damasco"),
            ("salmanasar", "sitió Samaria"),
            ("senaquerib", "sitió las ciudades de Judá y desafió a Ezequías"),
            ("ezequias", "resistió el asedio asirio confiando en el Señor"),
            ("oseas", "último rey de Israel, vencido por Asiria"),
        ],
    },
    "ava": {
        "note": (
            "Ciudad de Mesopotamia, en la órbita de Asiria, no en Canaán. "
            "Tras la caída de Samaria, Asiria trajo gente de Ava, junto con la de Cuta y Sefarvaim, para habitar el norte."
        ),
        "related": [
            ("asiria", "desde aquí trasladó colonos"),
            ("samaria", "destino de esa gente en el antiguo reino del norte"),
            ("cuta", "otra ciudad de origen de los mismos colonos"),
            ("sefarvaim", "otro grupo asentado en Samaria con los de Ava"),
            ("salmanasar", "al caer Samaria, el rey de Asiria trajo colonos de Ava"),
        ],
    },
    "baal-hazor": {
        "note": (
            "Altor en la sierra de Efraín, al norte de Jerusalén, cerca de la frontera con Benjamín. "
            "Absalón invitó allí a los hijos del rey al esquileo y ordenó matar a Amnón."
        ),
        "related": [
            ("efrain", "en la sierra de Efraín"),
            ("jerusalen", "al norte de la ciudad de David"),
            ("absalon", "organizó el esquileo y mandó matar a su hermano"),
            ("amnon", "fue asesinado en ese banquete"),
            ("david", "sus hijos estaban reunidos aquí cuando murió Amnón"),
        ],
    },
    "baal-perazim": {
        "note": (
            "Cerca de Jerusalén, en el camino de los filisteos por el valle de Refaim, al suroeste de la ciudad. "
            "David los venció aquí y llamó al lugar «el Señor irrumpió»."
        ),
        "related": [
            ("jerusalen", "en las afueras del suroeste, valle de Refaim"),
            ("juda", "en la subida hacia la sierra de Judá"),
            ("david", "venció aquí a los filisteos"),
            ("filisteos", "subían contra Jerusalén y fueron derrotados"),
        ],
    },
    "baala": {
        "note": (
            "Otro nombre de Quiriat-jearim, en la frontera de Judá con Benjamín, al oeste de Jerusalén. "
            "David sacó de aquí el arca, de casa de Abinadab; Uza murió al tocarla en el camino."
        ),
        "related": [
            ("quiriat-jearim", "es el mismo lugar con otro nombre"),
            ("juda", "en el territorio de Judá"),
            ("jerusalen", "al oeste de la ciudad, de donde David quiso subir el arca"),
            ("david", "vino a Baala a buscar el arca"),
            ("abinadab", "el arca estaba en su casa"),
            ("uza", "murió por sostener el arca al salir de aquí"),
            ("eleazar", "hijo de Abinadab, había cuidado el arca"),
        ],
    },
    "babilonia": {
        "note": (
            "Imperio al este, en la llanura del Éufrates, lejos de Judá. "
            "Nabucodonosor tomó Jerusalén, llevó cautivo a Joaquín y cegó a Sedequías. "
            "Evil-merodac sacó luego a Joaquín de la prisión en Babilonia."
        ),
        "related": [
            ("eufrates", "el río de su llanura"),
            ("jerusalen", "la ciudad que Nabucodonosor tomó y vació"),
            ("nabucodonosor", "rey que deportó a Judá"),
            ("joaquin", "estuvo preso en Babilonia"),
            ("sedequias", "fue juzgado y llevado al exilio"),
            ("evil-merodac", "lo libertó y lo sentó a la mesa del rey"),
            ("berodac-baladan", "rey de Babilonia que envió mensajeros a Ezequías"),
        ],
    },
    "bahurim": {
        "note": (
            "Pueblo de Benjamín, en la bajada del oriente de Jerusalén hacia el Jordán. "
            "Simei hijo de Gera salió de aquí y maldijo a David cuando huía de Absalón. "
            "En este pueblo también escondieron a los mensajeros que iban a avisar a David."
        ),
        "related": [
            ("benjamin", "en Benjamín"),
            ("jerusalen", "al este, en el camino que baja al Jordán"),
            ("jordan", "la bajada desde Jerusalén pasa por Bahurim"),
            ("simei", "maldijo a David desde este pueblo"),
            ("gera", "padre de Simei, de Bahurim"),
            ("david", "pasó huyendo de Absalón y oyó la maldición"),
            ("absalon", "su rebelión empujó a David por este camino"),
        ],
    },
    "beerot": {
        "note": (
            "Pueblo gabaonita en Benjamín, al norte de Jerusalén y cerca de Gabaón. "
            "De Beerot eran Recab y Baana, que asesinaron a Is-boset mientras dormía."
        ),
        "related": [
            ("gabaon", "pueblo vecino del mismo grupo gabaonita"),
            ("benjamin", "en Benjamín, al norte de Jerusalén"),
            ("jerusalen", "al norte de la ciudad"),
            ("recab", "de Beerot; mató a Is-boset"),
            ("baana", "de Beerot; mató a Is-boset con Recab"),
            ("is-boset", "lo asesinaron estos dos hombres de Beerot"),
        ],
    },
    "beerseba": {
        "note": (
            "Ciudad del extremo sur de Judá, en el Néguev. Con Dan marca el país de punta a punta: «desde Dan hasta Beerseba». "
            "Joel y Abías, hijos de Samuel, juzgaban aquí."
        ),
        "related": [
            ("juda", "en el sur de Judá"),
            ("dan", "el otro extremo, al norte, del mismo dicho"),
            ("samuel", "sus hijos juzgaban en Beerseba"),
            ("joel", "hijo mayor de Samuel, juez aquí"),
        ],
    },
    "belen": {
        "note": (
            "Pueblo de la sierra de Judá, unos kilómetros al sur de Jerusalén. "
            "Ciudad de Isaí y de David; Samuel ungió aquí a David entre sus hermanos. "
            "El sepulcro de Raquel se nombra en el camino de esta zona."
        ),
        "related": [
            ("juda", "en la sierra de Judá"),
            ("jerusalen", "al sur de la capital"),
            ("hebron", "Hebrón queda más al sur, en la misma sierra"),
            ("isai", "vivía en Belén"),
            ("david", "nació aquí y Samuel lo ungió en casa de su padre"),
            ("samuel", "vino a Belén a ungir al hijo de Isaí"),
            ("raquel", "su sepulcro se nombra cerca de Belén"),
        ],
    },
    "benjamin": {
        "note": (
            "Territorio entre Judá al sur y Efraín al norte, en la sierra alrededor de Jerusalén. "
            "Tierra de Saúl: Gabaa, Geba, Micmas, Ramá, Nob, Anatot y Bahurim están en Benjamín."
        ),
        "related": [
            ("juda", "limita al sur"),
            ("efrain", "limita al norte"),
            ("jerusalen", "en el borde sur de Benjamín, junto a Judá"),
            ("saul", "benjamita, de Gabaa"),
            ("gabaa", "su pueblo dentro de este territorio"),
            ("jonatan", "hijo de Saúl, de esta tierra"),
        ],
    },
    "bet-rehob": {
        "note": (
            "Región aramea del norte, cerca de Dan y del valle que sube hacia Hamat. "
            "Los amonitas tomaron de aquí mercenarios contra David; Joab enfrentó esa coalición."
        ),
        "related": [
            ("aram", "región aramea"),
            ("dan", "cerca del extremo norte de Israel"),
            ("hamat", "hacia la entrada de Hamat"),
            ("amon", "sus reyes contrataron tropas de Bet-rehob"),
            ("david", "era el rey contra quien se aliaron"),
            ("joab", "mandó el ejército de David en esa guerra"),
        ],
    },
    "bet-semes": {
        "note": (
            "Pueblo de Judá en la Sefela, en el límite con la llanura filistea, al oeste de Jerusalén. "
            "El arca llegó aquí en la carreta de las vacas desde Ecrón; murieron hombres por mirar dentro, "
            "y el arca siguió a Quiriat-jearim."
        ),
        "related": [
            ("juda", "en la Sefela de Judá"),
            ("jerusalen", "al oeste de la sierra"),
            ("ecron", "el arca venía de esta ciudad filistea"),
            ("quiriat-jearim", "de Bet-semes llevaron el arca a esa ciudad"),
            ("filisteos", "devolvieron el arca en la carreta hacia Bet-semes"),
        ],
    },
    "betel": {
        "note": (
            "Santuario de la sierra, en el límite de Efraín y Benjamín, al norte de Jerusalén y al sur de Silo. "
            "Jeroboam puso aquí uno de los becerros. Elías y Eliseo pasaron por Betel camino del Jordán. "
            "Hiel de Betel reedificó Jericó."
        ),
        "related": [
            ("efrain", "en la frontera de la sierra de Efraín"),
            ("benjamin", "también se cuenta en el borde de Benjamín"),
            ("silo", "Silo queda más al norte, en la misma sierra"),
            ("jeroboam", "puso aquí un becerro de oro"),
            ("elias", "pasó por Betel camino de su partida"),
            ("eliseo", "iba con Elías y volvió por este camino"),
            ("hiel", "era de Betel y reedificó Jericó a costa de sus hijos"),
        ],
    },
    "bezec": {
        "note": (
            "Lugar de reunión en la sierra al oeste del Jordán, frente al camino que baja a Galaad. "
            "Saúl contó aquí el ejército de Israel y de Judá antes de cruzar a liberar Jabes."
        ),
        "related": [
            ("jordan", "al oeste del río, antes del cruce a Galaad"),
            ("galaad", "desde Bezec se bajaba a socorrer esa región"),
            ("jabes", "la ciudad que Saúl iba a liberar"),
            ("saul", "reunió aquí a Israel antes de la batalla"),
        ],
    },
    "boscat": {
        "note": (
            "Pueblo de la Sefela de Judá, en el sur, en la zona de Laquis. "
            "De Boscat era Jedida, madre del rey Josías."
        ),
        "related": [
            ("juda", "en la Sefela del sur"),
            ("laquis", "ciudad fortificada de la misma región"),
            ("jedida", "era de Boscat"),
            ("josias", "su madre Jedida era de este pueblo"),
        ],
    },
    "cabul": {
        "note": (
            "Distrito de Galilea, en el norte, cerca de la frontera con Tiro. "
            "Salomón dio a Hiram veinte ciudades de esta región, y a Hiram no le agradaron."
        ),
        "related": [
            ("galilea", "en Galilea"),
            ("neftali", "en el norte, tierra cercana a esta tribu"),
            ("tiro", "en la frontera con la ciudad de Hiram"),
            ("salomon", "entregó estas ciudades"),
            ("hiram", "las recibió y las rechazó"),
        ],
    },
    "carmelo": {
        "note": (
            "El monte de la costa, sobre el Mediterráneo, entre el mar y el valle de Jezreel. "
            "Elías retó aquí a los profetas de Baal delante de Acab, y al pie corre el Cisón. "
            "También hay un Carmelo en el sur de Judá: de allí era Nabal, a quien David pidió ayuda."
        ),
        "related": [
            ("jezreel", "el valle que el monte cierra por el oeste"),
            ("cison", "arroyo al pie del monte"),
            ("elias", "enfrentó en el monte a los profetas de Baal"),
            ("acab", "subió al Carmelo y luego bajó a Jezreel"),
            ("eliseo", "también anduvo por este monte"),
            ("baal", "sus profetas fueron vencidos en el Carmelo"),
            ("david", "en el Carmelo de Judá trató con Nabal"),
        ],
    },
    "cedron": {
        "note": (
            "Arroyo y valle al oriente de Jerusalén, entre la ciudad y el monte de los Olivos. "
            "David lo cruzó al huir de Absalón. Asa quemó aquí la imagen de la reina madre, "
            "y Josías quemó en el Cedrón los utensilios de los ídolos."
        ),
        "related": [
            ("jerusalen", "corre al este de la ciudad"),
            ("david", "lo cruzó descalzo al huir"),
            ("absalon", "David salía de la ciudad por su rebelión"),
            ("asa", "quemó en el Cedrón el ídolo de la reina madre"),
            ("josias", "quemó aquí los utensilios de Baal y de otros cultos"),
        ],
    },
    "cison": {
        "note": (
            "Arroyo que baja del Carmelo hacia el valle de Jezreel y el mar. "
            "Elías hizo degollar junto al Cisón a los profetas de Baal, y Acab subió de allí hacia Jezreel."
        ),
        "related": [
            ("carmelo", "corre al pie del monte"),
            ("jezreel", "desagua hacia ese valle"),
            ("elias", "degolló aquí a los profetas de Baal"),
            ("acab", "subió del Cisón a Jezreel delante de la lluvia"),
        ],
    },
    "cuta": {
        "note": (
            "Ciudad de Mesopotamia, no de Canaán. Asiria trajo colonos de Cuta a Samaria después de deportar a Israel. "
            "Esa gente puso en Samaria al dios Nergal."
        ),
        "related": [
            ("asiria", "los trasladó al territorio conquistado"),
            ("samaria", "se asentaron en las ciudades del norte"),
            ("ava", "otro origen de los mismos colonos"),
            ("nergal", "dios que los de Cuta pusieron en Samaria"),
            ("salmanasar", "tras su conquista de Samaria llegaron los colonos de Cuta"),
        ],
    },
    "damasco": {
        "note": (
            "Capital de Aram, al noreste de Israel, oasis del camino hacia Hamat. "
            "Rezón se hizo rey aquí contra Salomón. Ben-adad, Hazael y Rezín reinaron en Damasco. "
            "Naamán era general de su rey; Tiglat-pileser se llevó a la gente de la ciudad a Kir."
        ),
        "related": [
            ("aram", "es la capital de Aram"),
            ("siria", "capital del mismo reino"),
            ("hamat", "Hamat queda más al norte, camino seguido"),
            ("rezon", "adversario de Salomón, rey en Damasco"),
            ("salomon", "Rezón lo hostigó desde esta ciudad"),
            ("ben-adad", "rey de Damasco en la guerra con Acab y con Asa"),
            ("hazael", "Eliseo anunció que reinaría en Damasco"),
            ("rezin", "rey de Damasco aliado de Peka contra Acaz"),
            ("naaman", "general del rey de Damasco, sanado por Eliseo"),
            ("tiglat-pileser", "tomó Damasco y deportó a su gente"),
        ],
    },
    "dan": {
        "note": (
            "Ciudad del extremo norte de Israel, al pie del Hermón, y también el nombre de la tribu. "
            "Jeroboam puso aquí el otro becerro, pareja del de Betel. "
            "«Desde Dan hasta Beerseba» recorre todo el país."
        ),
        "related": [
            ("israel", "su límite norte"),
            ("neftali", "en la región del lejano norte"),
            ("beerseba", "el límite sur del mismo dicho"),
            ("betel", "Jeroboam puso el otro becerro en el sur del reino"),
            ("jeroboam", "puso un becerro en Dan"),
        ],
    },
    "dotan": {
        "note": (
            "Ciudad del camino que baja de la sierra central hacia Jezreel, al norte de Siquem. "
            "El ejército de Siria rodeó aquí a Eliseo; su criado vio luego los carros del Señor."
        ),
        "related": [
            ("siquem", "al norte de Siquem, en el camino del valle"),
            ("jezreel", "hacia ese valle baja el camino"),
            ("siria", "su ejército cercó la ciudad"),
            ("eliseo", "estaba en Dotán cuando lo rodearon"),
        ],
    },
    "ebenezer": {
        "note": (
            "Hay dos momentos. El primer Ebenezer fue el campamento de Israel frente a Afec, en la llanura: "
            "allí se perdió el arca y murieron los hijos de Elí. "
            "Años después Samuel alzó una piedra entre Mizpa y Sen, en la sierra, y la llamó Ebenezer: «el Señor nos ha ayudado»."
        ),
        "related": [
            ("afec", "el primer campamento miraba al Afec filisteo"),
            ("mizpa", "Samuel alzó la piedra de ayuda junto a Mizpa"),
            ("samuel", "levantó la piedra después de la victoria"),
            ("filisteos", "la piedra recuerda que el Señor los venció"),
            ("eli", "sus hijos murieron en el desastre del primer Ebenezer"),
        ],
    },
    "ecron": {
        "note": (
            "Ciudad filistea del interior de la llanura, al noroeste de Judá. "
            "El arca llegó aquí y la devolvieron en una carreta hacia Bet-semes. "
            "Más tarde Ocozías de Israel consultó a Baal-zebub de Ecrón, y Elías lo reprendió."
        ),
        "related": [
            ("filisteos", "una de sus ciudades"),
            ("juda", "al noroeste de la sierra de Judá"),
            ("bet-semes", "la carreta del arca salió hacia ese pueblo de Judá"),
            ("baal-zebub", "dios de Ecrón"),
            ("ocozias", "envió a consultar a Baal-zebub"),
            ("elias", "le anunció que moriría por esa consulta"),
        ],
    },
    "edom": {
        "note": (
            "Nación al sur de Judá y del mar Muerto, en la serranía de Seir, camino del Arabá y de Elat. "
            "David puso guarniciones en Edom. Hadad edomita adversó a Salomón. Amasías tomó Sela."
        ),
        "related": [
            ("juda", "al sur de Judá"),
            ("araba", "el Arabá meridional bordea Edom"),
            ("elat", "puerto al sur, en la costa de esta región"),
            ("sela", "ciudad de Edom que Amasías tomó"),
            ("david", "puso guarniciones en Edom"),
            ("hadad", "edomita que se levantó contra Salomón"),
            ("salomon", "Hadad lo hostigó todos sus días"),
            ("amasias", "tomó Sela en una campaña contra Edom"),
        ],
    },
    "efrain": {
        "note": (
            "Tribu y sierra central, al norte de Benjamín y al sur del valle de Jezreel. "
            "Elcaná y Ana eran de Ramá, en esta sierra, y de ahí subían a Silo. "
            "El bosque llamado de Efraín, donde Joab mató a Absalón, queda en cambio al este del Jordán, cerca de Mahanaim."
        ),
        "related": [
            ("benjamin", "al sur de la sierra de Efraín"),
            ("silo", "santuario de esta sierra"),
            ("rama", "pueblo de Elcaná en la sierra de Efraín"),
            ("mahanaim", "el bosque de la muerte de Absalón queda cerca, al este del Jordán"),
            ("elcana", "era de la sierra de Efraín"),
            ("ana", "de la misma casa, subía con él a Silo"),
            ("samuel", "hijo de esa familia de la sierra"),
            ("absalon", "murió en el bosque llamado de Efraín, al este del Jordán"),
            ("joab", "lo mató en ese bosque"),
        ],
    },
    "egipto": {
        "note": (
            "Tierra al suroeste, más allá del desierto, el país del éxodo. "
            "Moisés sacó de aquí a Israel. El faraón dio Gezer a Salomón como dote. "
            "Sisac saqueó el templo en días de Roboam. Necao mató a Josías en Meguido y depuso a Joacaz."
        ),
        "related": [
            ("gezer", "el faraón la tomó y la dio a Salomón"),
            ("jerusalen", "Sisac saqueó el templo"),
            ("moises", "sacó a Israel de Egipto"),
            ("salomon", "se emparentó con el faraón"),
            ("sisac", "subió contra Jerusalén y se llevó los tesoros"),
            ("roboam", "reinaba cuando Sisac saqueó el templo"),
            ("necao", "mató a Josías y encadenó a Joacaz"),
            ("josias", "murió enfrentándolo en Meguido"),
            ("joacaz", "Necao lo depuso y lo llevó a Egipto"),
        ],
    },
    "elat": {
        "note": (
            "Puerto en el extremo sur del Arabá, en el golfo del mar Rojo, junto a Ezión-geber y al sur de Edom. "
            "Salomón armó allí su flota hacia Ofir. Josafat quiso naves en esa costa. Más tarde Edom recuperó Elat."
        ),
        "related": [
            ("ezion-geber", "puerto vecino, en la misma costa"),
            ("araba", "al sur de la gran depresión"),
            ("edom", "en el extremo sur de su región"),
            ("ofir", "destino del oro que salía de esta costa"),
            ("salomon", "tenía la flota en Ezión-geber, junto a Elat"),
            ("josafat", "quiso rehacer ese comercio por el mar"),
            ("hiram", "sus marineros iban con la flota de Salomón"),
        ],
    },
    "en-rogel": {
        "note": (
            "Fuente al sur de Jerusalén, junto a la piedra de Zohélet, cerca de donde se juntan el Cedrón y el valle de Hinom. "
            "Adonías banquetó aquí para proclamarse rey, mientras a Salomón lo ungían en Gihón."
        ),
        "related": [
            ("jerusalen", "en el límite sur de la ciudad"),
            ("zohelet", "la piedra junto a la fuente"),
            ("cedron", "cerca de ese arroyo"),
            ("gihon", "el otro manantial, donde ungían a Salomón al mismo tiempo"),
            ("adonias", "hizo aquí el banquete y se proclamó rey"),
            ("salomon", "era ungido en Gihón mientras Adonías comía aquí"),
            ("natan", "avisó a Betsabé de este banquete"),
            ("abiatar", "estaba con Adonías en En-rogel"),
            ("david", "aún vivía y no había autorizado a Adonías"),
        ],
    },
    "etanim": {
        "note": (
            "No es un lugar del mapa: es el mes séptimo, hacia septiembre. "
            "En Etanim, durante la fiesta, Salomón dedicó el templo en Jerusalén."
        ),
        "related": [
            ("jerusalen", "la dedicación fue en la ciudad del templo"),
            ("salomon", "dedicó el templo en el mes de Etanim"),
            ("templo", "la casa que se inauguró en esa fiesta"),
        ],
    },
    "ezion-geber": {
        "note": (
            "Puerto de Salomón junto a Elat, en el mar Rojo, al sur del Arabá. "
            "De aquí salía la flota hacia Ofir, con marineros de Hiram. Las naves de Josafat se rompieron en Ezión-geber."
        ),
        "related": [
            ("elat", "puerto vecino en el mismo golfo"),
            ("araba", "al sur de la depresión"),
            ("ofir", "destino del oro"),
            ("salomon", "armó aquí su flota"),
            ("hiram", "puso marineros que conocían el mar"),
            ("josafat", "sus naves naufragaron en Ezión-geber"),
        ],
    },
    "gabaa": {
        "note": (
            "Pueblo de Saúl en la sierra de Benjamín, al norte de Jerusalén. "
            "Desde Gabaa reinaba. Los mensajeros de Jabes llegaron aquí cuando Saúl volvía del campo con las vacas, "
            "y el Espíritu lo impulsó a convocar a Israel."
        ),
        "related": [
            ("benjamin", "en Benjamín"),
            ("jerusalen", "al norte de la ciudad"),
            ("guibea", "otro nombre de este mismo pueblo"),
            ("saul", "su pueblo y su corte"),
            ("cis", "su padre, benjamita de esta tierra"),
            ("jonatan", "hijo de Saúl, de Gabaa"),
            ("jabes", "sus mensajeros trajeron aquí el pedido de auxilio"),
        ],
    },
    "gabaon": {
        "note": (
            "Ciudad de Benjamín, al noroeste de Jerusalén. "
            "En su estanque se enfrentaron los hombres de Abner y de Joab, y Asael murió en la persecución. "
            "Salomón ofreció aquí sacrificios y pidió sabiduría. David entregó a los gabaonitas descendientes de Saúl, porque Saúl los había perseguido."
        ),
        "related": [
            ("benjamin", "en Benjamín"),
            ("jerusalen", "al noroeste de la ciudad"),
            ("abner", "sus hombres pelearon en el estanque"),
            ("joab", "mandó a los de David en ese duelo"),
            ("asael", "murió persiguiendo a Abner desde Gabaón"),
            ("salomon", "pidió sabiduría en el altar de Gabaón"),
            ("saul", "había perseguido a los gabaonitas"),
            ("david", "les entregó hijos de la casa de Saúl"),
        ],
    },
    "galaad": {
        "note": (
            "Meseta al este del Jordán, entre el Jaboc y el Arnón, frente a la sierra de Israel. "
            "Aquí están Jabes, Ramot y Mahanaim. Barzilai el galaadita sostuvo a David cuando huía de Absalón. "
            "Jefté es el juez que el relato recuerda de Galaad."
        ),
        "related": [
            ("jordan", "al este del río"),
            ("jabes", "ciudad de Galaad"),
            ("ramot", "Ramot de Galaad, en la frontera con Aram"),
            ("mahanaim", "ciudad donde reinó Is-boset y se refugió David"),
            ("barzilai", "galaadita que proveyó a David"),
            ("david", "huyó a Galaad cuando Absalón tomó Jerusalén"),
            ("jefte", "juez de Galaad, nombrado en la memoria del relato"),
            ("absalon", "su rebelión empujó a David al este del Jordán"),
        ],
    },
    "galilea": {
        "note": (
            "Región del norte de Israel, al oeste del mar de Galilea y al sur del Líbano. "
            "Cabul, las ciudades que Salomón dio a Hiram y que Hiram rechazó, está en Galilea."
        ),
        "related": [
            ("cabul", "el distrito que Salomón entregó"),
            ("neftali", "tribu del norte de Galilea"),
            ("libano", "la cordillera que cierra el norte"),
            ("tiro", "la ciudad fenicia al oeste"),
            ("salomon", "dio veinte ciudades de Galilea"),
            ("hiram", "no le agradaron esas ciudades"),
        ],
    },
    "gat": {
        "note": (
            "Ciudad filistea del interior, al oeste de Judá, en la Sefela. "
            "Patria de Goliat y corte de Aquis. El arca pasó por Gat. "
            "David se fingió loco ante Aquis y más tarde fue su vasallo. Itai y Obed-edom eran de Gat."
        ),
        "related": [
            ("filisteos", "una de sus ciudades"),
            ("juda", "al oeste de la sierra, en la Sefela"),
            ("asdod", "desde Asdod trajeron el arca a Gat"),
            ("goliat", "era de Gat"),
            ("aquis", "rey de Gat"),
            ("david", "huyó aquí, se fingió loco y luego sirvió a Aquis"),
            ("itai", "gateo que se quedó con David en la huida"),
            ("obed-edom", "gateo en cuya casa el arca trajo bendición"),
        ],
    },
    "geba": {
        "note": (
            "Pueblo de Benjamín, al norte de Jerusalén, frente a Micmas, al otro lado del paso. "
            "Saúl estaba en Geba. Jonatán salió de este lado y atacó la guarnición filistea del paso."
        ),
        "related": [
            ("benjamin", "en Benjamín"),
            ("micmas", "al otro lado del desfiladero"),
            ("jerusalen", "al norte de la ciudad"),
            ("saul", "estaba en Geba con el pueblo"),
            ("jonatan", "atacó la guarnición desde este paso"),
            ("filisteos", "tenían el puesto frente a Geba"),
        ],
    },
    "gebal": {
        "note": (
            "Puerto fenicio de la costa del Líbano, al norte de Sidón, fuera de Israel. "
            "Sus canteros labraron piedras con la gente de Hiram para el templo de Salomón."
        ),
        "related": [
            ("libano", "en esa costa, al norte"),
            ("sidon", "más al sur, en la misma costa fenicia"),
            ("tiro", "Hiram coordinaba la obra desde Tiro"),
            ("hiram", "aliado que envió artesanos junto con los de Gebal"),
            ("salomon", "el templo se hizo con esa piedra y esos cedros"),
            ("templo", "labraron piedras para la casa del Señor"),
        ],
    },
    "gesur": {
        "note": (
            "Reino arameo al noreste del mar de Galilea, al este del Jordán. "
            "Talmai era su rey. Su hija Maaca fue esposa de David y madre de Absalón. "
            "Absalón huyó a Gesur después de matar a Amnón y estuvo allí tres años."
        ),
        "related": [
            ("aram", "reino arameo"),
            ("jordan", "al este del río, junto al mar de Galilea"),
            ("talmai", "rey de Gesur, abuelo de Absalón"),
            ("maaca", "hija de Talmai, esposa de David"),
            ("david", "suegro político de Talmai por Maaca"),
            ("absalon", "huyó a casa de su abuelo en Gesur"),
            ("amnon", "Absalón huyó después de matarlo"),
        ],
    },
    "gezer": {
        "note": (
            "Ciudad de la Sefela, en el límite occidental de Efraín, frente a la llanura filistea. "
            "El faraón de Egipto la tomó, echó a los cananeos y se la dio a Salomón como dote de su hija. Salomón la fortificó."
        ),
        "related": [
            ("efrain", "en su frontera oeste"),
            ("egipto", "el faraón la conquistó y la entregó"),
            ("filisteos", "en el borde de su llanura"),
            ("salomon", "la recibió como dote y la reconstruyó"),
        ],
    },
    "gihon": {
        "note": (
            "Manantial al este de la ciudad de David, en Jerusalén, en el valle del Cedrón. "
            "Por orden de David, Sadoc y Natán ungieron aquí a Salomón mientras Adonías banquetaba en En-rogel."
        ),
        "related": [
            ("jerusalen", "el manantial de la ciudad de David"),
            ("cedron", "en ese valle, al oriente"),
            ("en-rogel", "la otra fuente, donde estaba Adonías"),
            ("salomon", "fue ungido rey en Gihón"),
            ("david", "ordenó la unción"),
            ("sadoc", "lo ungió"),
            ("natan", "lo acompañó y confirmó el mandato de David"),
            ("adonias", "se proclamaba al mismo tiempo en En-rogel"),
        ],
    },
    "gilgal": {
        "note": (
            "Santuario en el valle del Jordán, cerca del río y de Jericó, al este de la sierra. "
            "Samuel confirmó aquí a Saúl como rey y luego lo rechazó porque ofreció el holocausto y porque perdonó a Agag. "
            "Elías y Eliseo pasaron por Gilgal camino del Jordán."
        ),
        "related": [
            ("jordan", "cerca del cruce del río"),
            ("samuel", "unió y luego apartó a Saúl en Gilgal"),
            ("saul", "fue hecho rey aquí y desobedeció aquí"),
            ("agag", "Saúl lo perdonó, y Samuel lo ejecutó en Gilgal"),
            ("elias", "pasó por Gilgal con Eliseo"),
            ("eliseo", "iba con él hacia el Jordán"),
        ],
    },
    "gozan": {
        "note": (
            "Región del norte de Mesopotamia, en Asiria, no en Canaán. El río Habor es el río de Gozán. "
            "Salmanasar deportó aquí a las tribus del reino del norte."
        ),
        "related": [
            ("asiria", "destino del destierro, dentro del imperio"),
            ("habor", "el río de Gozán"),
            ("halah", "otro distrito del mismo destierro"),
            ("israel", "el reino del norte fue llevado a Gozán"),
            ("salmanasar", "sitió Samaria y deportó a su gente"),
        ],
    },
    "guibea": {
        "note": (
            "Otro nombre de Gabaa, el pueblo de Saúl en la sierra de Benjamín, al norte de Jerusalén. "
            "Desde aquí salió la historia de Jonatán y de la guerra con los filisteos del paso."
        ),
        "related": [
            ("gabaa", "es el mismo pueblo"),
            ("benjamin", "en Benjamín"),
            ("jerusalen", "al norte de la ciudad"),
            ("saul", "su ciudad"),
            ("jonatan", "desde esta tierra atacó a los filisteos"),
            ("filisteos", "Jonatán atacó su puesto en el paso de Geba y Micmas, en esta tierra"),
        ],
    },
    "habor": {
        "note": (
            "Río de Gozán, en el norte de Mesopotamia, dentro de Asiria. "
            "A sus orillas asentaron a los israelitas que Salmanasar deportó del reino del norte."
        ),
        "related": [
            ("gozan", "Habor es el río de esa región"),
            ("asiria", "país del destierro"),
            ("halah", "se nombra junto con Habor entre los lugares del exilio"),
            ("israel", "los llevaron a vivir junto a este río"),
            ("salmanasar", "ordenó esa deportación"),
        ],
    },
    "halah": {
        "note": (
            "Distrito de Asiria, en Mesopotamia, nombrado junto con Habor y Gozán. "
            "Parte de Israel fue deportada a Halah cuando cayó Samaria."
        ),
        "related": [
            ("asiria", "en su territorio"),
            ("habor", "lugar vecino del mismo destierro"),
            ("gozan", "el tercer nombre de ese destierro"),
            ("samaria", "desde la capital caída salió la deportación"),
            ("israel", "las tribus del norte fueron llevadas a Halah"),
            ("salmanasar", "deportó a Israel hacia Halah"),
        ],
    },
    "hamat": {
        "note": (
            "Ciudad-estado del valle del Orontes, al norte de Damasco. "
            "«Hasta la entrada de Hamat» marca el límite norte de David y de Salomón. "
            "Ribla, donde Nabucodonosor juzgó a Sedequías, está en tierra de Hamat."
        ),
        "related": [
            ("damasco", "Hamat queda más al norte"),
            ("ribla", "en tierra de Hamat"),
            ("israel", "frontera norte del dominio de David y Salomón"),
            ("david", "su frontera llegó hasta la entrada de Hamat"),
            ("salomon", "también dominó hasta esa entrada"),
            ("nabucodonosor", "acampó en Ribla de Hamat"),
            ("sedequias", "fue juzgado en Ribla, dentro de esta tierra"),
        ],
    },
    "hazor": {
        "note": (
            "Ciudad grande del norte, en Neftalí, sobre la llanura al norte del mar de Galilea. "
            "Josué la quemó en la conquista. Salomón la fortificó como ciudad de carros."
        ),
        "related": [
            ("neftali", "en la tierra de esta tribu"),
            ("galilea", "en el norte de Galilea"),
            ("salomon", "la reconstruyó y la fortificó"),
            ("josue", "la quemó cuando era cabeza de los reyes cananeos"),
        ],
    },
    "hebron": {
        "note": (
            "Ciudad de la sierra de Judá, al sur de Belén y de Jerusalén. "
            "David reinó aquí siete años sobre Judá antes de subir a Jerusalén. "
            "Joab mató a Abner en Hebrón. Absalón se proclamó rey en Hebrón."
        ),
        "related": [
            ("juda", "en la sierra de Judá"),
            ("belen", "Belén queda al norte, en la misma sierra"),
            ("jerusalen", "David pasó de Hebrón a Jerusalén"),
            ("david", "capital de sus primeros siete años"),
            ("abner", "Joab lo asesinó a la puerta de Hebrón"),
            ("joab", "mató a Abner aquí"),
            ("absalon", "se hizo proclamar rey en Hebrón"),
        ],
    },
    "heret": {
        "note": (
            "Bosque en Judá, en la ladera oeste de la sierra. "
            "El profeta Gad dijo a David que no se quedara en Moab; David dejó Adulam y se escondió en Heret mientras Saúl lo buscaba."
        ),
        "related": [
            ("juda", "en la tierra de Judá"),
            ("adulam", "David venía de la cueva"),
            ("moab", "Gad le dijo que no se quedara al otro lado, con el rey de Moab"),
            ("david", "se ocultó en este bosque"),
            ("gad", "el profeta que le mandó volver a Judá"),
            ("saul", "seguía persiguiéndolo"),
        ],
    },
    "horeb": {
        "note": (
            "El monte de Dios, en el sur, en el ámbito del Sinaí, lejos de Israel. "
            "Moisés recibió aquí la ley. Elías caminó cuarenta días desde Jezreel hasta Horeb y oyó la voz suave."
        ),
        "related": [
            ("moises", "el monte donde recibió la ley"),
            ("elias", "huyó hasta Horeb después del Carmelo"),
            ("jezabel", "su amenaza empujó a Elías fuera de Israel"),
            ("acab", "Elías venía de enfrentarlo en el Carmelo"),
        ],
    },
    "ibleam": {
        "note": (
            "Ciudad en el paso hacia el valle de Jezreel, cerca de Meguido. "
            "Jehú hirió a Ocozías de Judá en la subida de Gur, junto a Ibleam; Ocozías huyó herido hasta Meguido y allí murió."
        ),
        "related": [
            ("meguido", "ciudad vecina, donde Ocozías murió"),
            ("jezreel", "en el corredor de ese valle"),
            ("ocozias", "huyó herido por el camino de Ibleam"),
            ("jehu", "lo hirió en esa subida"),
        ],
    },
    "isacar": {
        "note": (
            "Tribu del valle de Jezreel, al norte de Efraín y al sur del mar de Galilea. No es una sola ciudad. "
            "Baasa, que mató a Nadab y reinó sobre Israel, era de Isacar."
        ),
        "related": [
            ("jezreel", "su valle"),
            ("efrain", "al sur de Isacar"),
            ("israel", "tribu del reino del norte"),
            ("baasa", "rey de Israel, de la tribu de Isacar"),
            ("nadab", "Baasa lo mató y le quitó el trono"),
        ],
    },
    "israel": {
        "note": (
            "El pueblo de las doce tribus y, después de Salomón, el reino del norte: "
            "Efraín, el valle de Jezreel, Galilea y Galaad, con capital en Samaria. Judá quedó al sur, con Jerusalén. "
            "Jeroboam fue el primer rey de ese norte."
        ),
        "related": [
            ("samaria", "capital del reino del norte"),
            ("juda", "el reino del sur, separado tras Salomón"),
            ("efrain", "corazón de la sierra del norte"),
            ("jeroboam", "primer rey del norte"),
            ("roboam", "al endurecerse, se le fue Israel"),
            ("salomon", "a su muerte se partió el reino"),
        ],
    },
    "jabes": {
        "note": (
            "Jabes de Galaad, al este del Jordán. "
            "Nahas el amonita la sitió; Saúl reunió a Israel en Bezec, cruzó de noche y la liberó. "
            "Cuando Saúl murió en Gilboa, los de Jabes bajaron a Bet-sán, rescataron su cuerpo y lo enterraron aquí."
        ),
        "related": [
            ("galaad", "en Galaad"),
            ("jordan", "al este del río"),
            ("bezec", "Saúl reunió el ejército al oeste antes de cruzar"),
            ("nahas", "rey amonita que amenazó con sacarles el ojo derecho"),
            ("saul", "la salvó; luego ellos rescataron su cuerpo"),
            ("david", "bendijo a Jabes por haber enterrado a Saúl"),
        ],
    },
    "jerusalen": {
        "note": (
            "En la sierra, en el límite de Judá y Benjamín. "
            "David la tomó a los jebuseos, la hizo su ciudad y subió el arca. "
            "Salomón edificó aquí el templo. Después de la división fue la capital de Judá."
        ),
        "related": [
            ("juda", "capital del reino del sur"),
            ("benjamin", "en su borde sur"),
            ("david", "la conquistó y la llamó ciudad de David"),
            ("salomon", "edificó el templo"),
            ("templo", "la casa del Señor está en Jerusalén"),
        ],
    },
    "jezreel": {
        "note": (
            "Ciudad y valle en el norte, entre el Carmelo y el Gilboa. "
            "Acab y Jezabel tenían aquí su palacio, y aquí estaba la viña de Nabot. "
            "Jehú ejecutó en Jezreel el juicio sobre Jezabel y la casa de Acab."
        ),
        "related": [
            ("israel", "en el reino del norte"),
            ("carmelo", "el monte que cierra el valle por el oeste"),
            ("acab", "su palacio y la viña que usurpó"),
            ("jezabel", "la echaron desde la ventana de Jezreel"),
            ("nabot", "jezreelita; su viña estaba junto al palacio"),
            ("jehu", "ejecutó aquí el juicio anunciado por Elías"),
            ("elias", "anunció que los perros lamerían la sangre de Acab en este campo"),
        ],
    },
    "jordan": {
        "note": (
            "Río que baja del Hermón, pasa por el mar de Galilea y el Arabá, y muere en el mar Muerto. "
            "Separa la sierra de Canaán de Galaad. Josué lo cruzó con Israel. "
            "Elías y Eliseo lo partieron. Naamán se lavó siete veces y quedó limpio."
        ),
        "related": [
            ("araba", "corre por esa depresión"),
            ("galaad", "la meseta al este"),
            ("josue", "Israel lo cruzó bajo su mando"),
            ("elias", "lo partió con el manto"),
            ("eliseo", "lo partió al volver y mandó a Naamán a lavarse"),
            ("naaman", "se bañó siete veces y sanó de la lepra"),
        ],
    },
    "juda": {
        "note": (
            "Reino y sierra del sur: Hebrón, Belén, Jerusalén, la Sefela de Laquis y Libna, y el Néguev hasta Beerseba. "
            "Después de la división, la casa de David reinó aquí. Jerusalén es su capital."
        ),
        "related": [
            ("jerusalen", "su capital y la ciudad del templo"),
            ("israel", "el reino del norte, separado de Judá"),
            ("hebron", "primera capital de David sobre Judá"),
            ("beerseba", "su límite sur"),
            ("david", "la casa real de Judá"),
            ("roboam", "rey de Judá cuando el norte se fue"),
        ],
    },
    "kir": {
        "note": (
            "Lugar lejano al oriente, fuera de Canaán, en la órbita a donde Asiria deportaba pueblos. "
            "Tiglat-pileser tomó Damasco, mató a Rezín y llevó a su gente a Kir."
        ),
        "related": [
            ("damasco", "sus habitantes fueron deportados a Kir"),
            ("asiria", "el imperio que los trasladó"),
            ("tiglat-pileser", "tomó Damasco y ejecutó la deportación"),
            ("rezin", "rey de Damasco, muerto en esa campaña"),
            ("acaz", "había pedido a Asiria ayuda contra Rezín"),
        ],
    },
    "laquis": {
        "note": (
            "Ciudad fortificada de la Sefela de Judá, al suroeste de Jerusalén, en el camino hacia Egipto. "
            "Senaquerib la sitió en días de Ezequías. Amasías huyó a Laquis y allí lo mataron."
        ),
        "related": [
            ("juda", "en la Sefela"),
            ("jerusalen", "al suroeste de la capital"),
            ("egipto", "en el camino que baja hacia Egipto"),
            ("senaquerib", "la sitió en su campaña contra Judá"),
            ("ezequias", "reinaba en Jerusalén durante ese asedio"),
            ("amasias", "huyó aquí después de una conjura y lo mataron"),
        ],
    },
    "levi": {
        "note": (
            "Tribu sin un territorio único: sus ciudades estaban repartidas entre las demás. "
            "Moisés y Aarón son de Leví. De aquí salen los sacerdotes y los levitas del arca en Silo y del templo en Jerusalén."
        ),
        "related": [
            ("silo", "sirvieron el arca en este santuario"),
            ("jerusalen", "el templo reunió su servicio"),
            ("moises", "de la tribu de Leví"),
            ("aaron", "de la casa sacerdotal de Leví"),
            ("levitas", "el servicio de la tribu"),
            ("samuel", "servía en Silo delante del arca"),
        ],
    },
    "libna": {
        "note": (
            "Ciudad de la Sefela de Judá, cerca de Laquis. "
            "Se rebeló contra Joram de Judá. En la campaña de Senaquerib se nombra entre las fortalezas de esa llanura."
        ),
        "related": [
            ("juda", "en Judá"),
            ("laquis", "ciudad vecina de la Sefela"),
            ("joram", "Libna se rebeló en su reinado"),
            ("senaquerib", "su ejército pasó por estas fortalezas camino de Jerusalén"),
        ],
    },
    "libano": {
        "note": (
            "Cordillera al norte de Galilea, de donde salían los cedros. "
            "Hiram de Tiro los cortó y los envió a Salomón para el templo y para su palacio."
        ),
        "related": [
            ("galilea", "la tierra de Israel al sur de la cordillera"),
            ("tiro", "Hiram controlaba ese comercio"),
            ("hiram", "envió cedros y artesanos"),
            ("salomon", "los pidió para la casa del Señor"),
            ("templo", "se construyó con madera del Líbano"),
        ],
    },
    "mahanaim": {
        "note": (
            "Ciudad de Galaad, al este del Jordán, cerca del Jaboc. "
            "Abner puso aquí a Is-boset por rey mientras David reinaba en Hebrón. "
            "David se refugió en Mahanaim al huir de Absalón, y Barzilai lo sostuvo."
        ),
        "related": [
            ("galaad", "en Galaad"),
            ("jordan", "al este del río"),
            ("hebron", "mientras Is-boset estaba aquí, David reinaba en Hebrón"),
            ("is-boset", "reinó en Mahanaim"),
            ("abner", "lo puso por rey en esta ciudad"),
            ("david", "huyó aquí de Absalón"),
            ("absalon", "perseguía a David al este del Jordán"),
            ("barzilai", "proveyó a David en Mahanaim"),
        ],
    },
    "meguido": {
        "note": (
            "Ciudad del paso entre la sierra y el valle de Jezreel. "
            "Salomón la fortificó. Ocozías de Judá murió aquí huyendo de Jehú. "
            "Josías murió en Meguido frente al faraón Necao."
        ),
        "related": [
            ("jezreel", "domina la entrada al valle"),
            ("ibleam", "Ocozías venía herido desde esa subida"),
            ("salomon", "la fortificó"),
            ("ocozias", "llegó herido y murió en Meguido"),
            ("jehu", "lo perseguía después de Jezreel"),
            ("josias", "murió en este paso"),
            ("necao", "el faraón a quien Josías salió a enfrentar"),
        ],
    },
    "micmas": {
        "note": (
            "Pueblo de Benjamín al norte de Jerusalén, frente a Geba, separado por un paso estrecho. "
            "La guarnición filistea estaba en Micmas. Jonatán y su escudero subieron el desfiladero y la derrotaron."
        ),
        "related": [
            ("geba", "al otro lado del paso, donde estaba Saúl"),
            ("benjamin", "en Benjamín"),
            ("jerusalen", "al norte de la ciudad"),
            ("jonatan", "atacó la guarnición de Micmas"),
            ("saul", "estaba en Geba mientras Jonatán subía"),
            ("filisteos", "su puesto guardaba el paso"),
        ],
    },
    "milo": {
        "note": (
            "Terraza o fortificación dentro de la ciudad de David, en Jerusalén. "
            "David la edificó al tomar la ciudad y Salomón la cerró. "
            "Los siervos de Joás lo hirieron en la casa de Milo, en el camino de Sila."
        ),
        "related": [
            ("jerusalen", "dentro de la ciudad de David"),
            ("sila", "el lugar vecino donde hirieron a Joás"),
            ("david", "edificó Milo al fortificar la ciudad"),
            ("salomon", "cerró la brecha de la ciudad de David"),
            ("joas", "lo asesinaron en la casa de Milo"),
        ],
    },
    "mizpa": {
        "note": (
            "La Mizpa de Samuel está en Benjamín, al norte de Jerusalén: "
            "allí reunió a Israel, ayunaron, y el Señor venció a los filisteos. "
            "Después del asedio de Jerusalén, Nabucodonosor puso a Gedalías en Mizpa, e Ismael lo asesinó. "
            "Otra Mizpa, la de Moab, es donde David dejó a sus padres al huir de Saúl."
        ),
        "related": [
            ("benjamin", "la Mizpa de Samuel está en Benjamín"),
            ("jerusalen", "al norte de la ciudad"),
            ("moab", "hay otra Mizpa al este del mar Muerto"),
            ("samuel", "reunió aquí al pueblo para volver al Señor"),
            ("filisteos", "fueron vencidos después de esa asamblea"),
            ("gedalias", "gobernó en Mizpa después de la caída de Jerusalén"),
            ("ismael", "lo asesinó en Mizpa"),
            ("nabucodonosor", "lo había puesto por gobernador"),
            ("david", "dejó a sus padres en Mizpa de Moab"),
            ("saul", "David huía de él cuando cruzó a Moab"),
        ],
    },
    "moab": {
        "note": (
            "Nación al este del mar Muerto, al sur de Galaad, más allá del Arnón. "
            "David dejó a sus padres en Mizpa de Moab mientras huía de Saúl, y más tarde sometió Moab. "
            "Salomón honró a Quemos, el dios de Moab. Rut, moabita, está en la familia de David."
        ),
        "related": [
            ("galaad", "al norte del Arnón"),
            ("edom", "al sur, al otro lado del Arabá"),
            ("david", "se refugió su familia aquí y luego sometió Moab"),
            ("saul", "David huía de él cuando pasó a Moab"),
            ("salomon", "edificó un altar a Quemos"),
            ("quemos", "dios de Moab"),
        ],
    },
    "naiot": {
        "note": (
            "El campamento de los profetas en Ramá, en la sierra, no una ciudad aparte. "
            "David se quedó aquí con Samuel. Los mensajeros de Saúl, y después Saúl mismo, profetizaron en Naiot y no pudieron prender a David."
        ),
        "related": [
            ("rama", "Naiot está en Ramá"),
            ("efrain", "Ramá de Samuel queda en esta sierra"),
            ("samuel", "presidía el grupo de profetas"),
            ("david", "huyó aquí y estuvo con Samuel"),
            ("saul", "llegó a prenderlo y también profetizó"),
        ],
    },
    "neftali": {
        "note": (
            "Tribu del extremo norte, alrededor del mar de Galilea y de Hazor. "
            "Salomón fortificó Hazor en esta tierra. Tiglat-pileser se llevó cautiva a Neftalí en días de Peka."
        ),
        "related": [
            ("hazor", "ciudad principal de su territorio"),
            ("galilea", "la región del norte"),
            ("dan", "el extremo norte, junto a esta tierra"),
            ("salomon", "fortificó Hazor"),
            ("tiglat-pileser", "deportó a Neftalí"),
            ("peka", "reinaba en Israel cuando Asiria se llevó el norte"),
        ],
    },
    "nob": {
        "note": (
            "Ciudad de sacerdotes en Benjamín, en la sierra, tan cerca de Jerusalén que se veía desde la ciudad. "
            "Ahimelec dio a David el pan sagrado y la espada de Goliat. Doeg lo vio. "
            "Saúl mandó matar a los sacerdotes; solo escapó Abiatar, que se unió a David."
        ),
        "related": [
            ("benjamin", "en Benjamín"),
            ("jerusalen", "a la vista de la ciudad"),
            ("david", "huyó aquí hambriento"),
            ("ahimelec", "sacerdote que le dio pan y la espada"),
            ("doeg", "estaba en Nob, lo vio y lo delató"),
            ("saul", "ordenó la matanza de los sacerdotes"),
            ("abiatar", "escapó de la matanza y huyó con David"),
            ("goliat", "su espada estaba guardada en Nob"),
        ],
    },
    "ninive": {
        "note": (
            "Capital de Asiria, a orillas del Tigris, lejos al noreste de Israel. "
            "Jonás hijo de Amitai fue enviado a Nínive. Senaquerib reinaba desde Asiria cuando amenazó a Jerusalén."
        ),
        "related": [
            ("asiria", "su capital"),
            ("jonas", "el Señor lo envió a Nínive"),
            ("amitai", "padre de Jonás"),
            ("senaquerib", "rey asirio que desafió a Ezequías"),
            ("ezequias", "el rey de Judá amenazado desde Asiria"),
        ],
    },
    "ofir": {
        "note": (
            "Tierra lejana del oro, a la que se llegaba por mar desde Ezión-geber, al sur por el mar Rojo. No está en Canaán. "
            "La flota de Salomón y de Hiram traía de Ofir oro, maderas y piedras preciosas."
        ),
        "related": [
            ("ezion-geber", "puerto de donde salía la flota"),
            ("elat", "la misma costa del mar Rojo"),
            ("salomon", "su flota traía el oro de Ofir"),
            ("hiram", "sus marineros iban en esas naves"),
        ],
    },
    "pas-damim": {
        "note": (
            "Campo de batalla en la Sefela de Judá, en la zona de Efes-damim, entre la sierra y la llanura filistea. "
            "Eleazar hijo de Dodo, uno de los tres valientes de David, peleó aquí contra los filisteos. "
            "El duelo de David y Goliat fue en ese mismo corredor."
        ),
        "related": [
            ("juda", "en la Sefela de Judá"),
            ("filisteos", "el enemigo en ese campo"),
            ("eleazar", "peleó aquí hasta que se le cansó la mano"),
            ("dodo", "padre de Eleazar"),
            ("david", "sus valientes; el campo está en la zona donde venció a Goliat"),
            ("goliat", "el duelo fue en Efes-damim, el mismo corredor"),
        ],
    },
    "perez-uza": {
        "note": (
            "Lugar del camino de Quiriat-jearim a Jerusalén, en Judá. "
            "Uza murió aquí por tocar el arca. David llamó al sitio «estallido contra Uza» y desvió el arca a casa de Obed-edom."
        ),
        "related": [
            ("quiriat-jearim", "el arca venía de esta ciudad"),
            ("jerusalen", "iban hacia la ciudad de David"),
            ("juda", "en el camino de la sierra"),
            ("uza", "murió por sostener el arca"),
            ("david", "se enfadó y tuvo miedo de seguir con el arca"),
            ("abinadab", "Uza era de la casa donde el arca había estado"),
            ("obed-edom", "el arca se quedó en su casa después de Pérez-uza"),
        ],
    },
    "querit": {
        "note": (
            "Arroyo al este del Jordán, frente a la tierra de Israel. "
            "Elías se escondió aquí de Acab durante la sequía, y los cuervos le llevaban pan y carne."
        ),
        "related": [
            ("jordan", "al este del río"),
            ("elias", "se escondió y fue sustentado en el Querit"),
            ("acab", "la sequía anunciada a Acab lo sacó de Israel"),
        ],
    },
    "quiriat-jearim": {
        "note": (
            "Ciudad de Judá, en la frontera con Benjamín, al oeste de Jerusalén. También se llama Baala. "
            "El arca estuvo aquí unos veinte años, en casa de Abinadab, y su hijo Eleazar la cuidaba, hasta que David quiso subirla."
        ),
        "related": [
            ("juda", "en Judá"),
            ("baala", "otro nombre del mismo sitio"),
            ("benjamin", "en la frontera con Benjamín"),
            ("jerusalen", "al oeste de la ciudad"),
            ("abinadab", "el arca estaba en su casa"),
            ("eleazar", "la cuidó"),
            ("david", "vino a buscarla para Jerusalén"),
            ("uza", "murió al salir el arca de esta casa"),
        ],
    },
    "ramot": {
        "note": (
            "Ramot de Galaad, al este del Jordán, en la frontera de Galaad con Aram. "
            "Acab murió peleando aquí contra los sirios; Josafat iba con él y Miqueas había anunciado la derrota. "
            "Eliseo mandó ungir aquí a Jehú."
        ),
        "related": [
            ("galaad", "en Galaad"),
            ("aram", "en la frontera con Siria"),
            ("jordan", "al este del río"),
            ("acab", "murió en la batalla de Ramot"),
            ("josafat", "fue con Acab a esa guerra"),
            ("miqueas", "profetizó que Israel quedaría sin pastor"),
            ("imla", "padre de Miqueas"),
            ("jehu", "lo ungieron rey en Ramot de Galaad"),
            ("eliseo", "envió al discípulo a ungirlo"),
        ],
    },
    "rama": {
        "note": (
            "Hay dos. Ramá de Zuf, en la sierra de Efraín, es el pueblo de Elcaná y de Samuel; Naiot estaba aquí, y Saúl profetizó al venir a buscar a David. "
            "Otra Ramá, en Benjamín, al norte de Jerusalén, es la que Baasa fortificó contra Asa; Asa la desmanteló."
        ),
        "related": [
            ("efrain", "la Ramá de Samuel está en su sierra"),
            ("benjamin", "la Ramá fronteriza de Baasa está en Benjamín"),
            ("naiot", "el campamento de profetas dentro de Ramá"),
            ("zuf", "la región de la sierra de donde era Elcaná"),
            ("elcana", "era de Ramá"),
            ("samuel", "nació de esa casa y juzgó desde Ramá"),
            ("ana", "de Ramá; subía con Elcaná a Silo"),
            ("saul", "fue a Ramá a buscar a David y profetizó"),
            ("david", "se refugió con Samuel en Ramá"),
            ("baasa", "fortificó la Ramá de Benjamín contra Judá"),
            ("asa", "desmanteló esa fortaleza"),
        ],
    },
    "ribla": {
        "note": (
            "Ciudad en tierra de Hamat, al norte, en el valle del Orontes, donde acampaban los reyes que venían del Éufrates. "
            "Necao encadenó aquí a Joacaz. Nabucodonosor juzgó aquí a Sedequías, degolló a sus hijos y lo cegó."
        ),
        "related": [
            ("hamat", "en tierra de Hamat"),
            ("necao", "encadenó a Joacaz en Ribla"),
            ("joacaz", "fue depuesto y atado aquí"),
            ("nabucodonosor", "tenía en Ribla su tribunal"),
            ("sedequias", "fue juzgado, vio morir a sus hijos y quedó ciego"),
        ],
    },
    "rimon": {
        "note": (
            "En este glosario es el dios de Damasco, en Siria, no una ciudad de Israel. "
            "Naamán pidió a Eliseo perdón por tener que inclinarse en el templo de Rimón cuando su rey se apoyara en su brazo."
        ),
        "related": [
            ("damasco", "su templo está en la capital de Siria"),
            ("siria", "dios de ese país"),
            ("naaman", "pidió esa concesión al volver sanado"),
            ("eliseo", "le dijo que fuera en paz"),
        ],
    },
    "ruben": {
        "note": (
            "Tribu al este del Jordán, en la meseta al norte de Moab y al sur de Gad. No es una ciudad. "
            "Su tierra mira al mar Muerto desde el oriente y queda al sur de Galaad."
        ),
        "related": [
            ("jordan", "al este del río"),
            ("moab", "al sur de Rubén"),
            ("galaad", "la meseta vecina, más al norte"),
            ("gad", "la tribu vecina; el mismo nombre es también el del profeta de David"),
        ],
    },
    "saba": {
        "note": (
            "Reino lejano del sur, en el comercio de especias y oro, fuera de Israel. "
            "Su reina viajó hasta Jerusalén para probar la sabiduría de Salomón."
        ),
        "related": [
            ("jerusalen", "el destino de la visita"),
            ("reina-de-saba", "vino de este reino"),
            ("salomon", "la recibió y respondió sus preguntas"),
        ],
    },
    "samaria": {
        "note": (
            "Ciudad y monte en la sierra de Efraín, al noroeste de Siquem. Capital del reino del norte. "
            "Omri compró el monte a Semer y fundó Samaria. Acab y Jezabel tuvieron aquí su corte y el templo de Baal. "
            "Salmanasar la sitió en días de Oseas y Asiria se llevó cautivo el norte."
        ),
        "related": [
            ("efrain", "en su sierra"),
            ("siquem", "al noroeste de Siquem"),
            ("israel", "capital del reino del norte"),
            ("omri", "compró el monte y fundó la ciudad"),
            ("semer", "dueño del monte que Omri compró"),
            ("acab", "reinó desde Samaria"),
            ("jezabel", "su corte y el culto de Baal estaban aquí"),
            ("oseas", "último rey; cayó con la ciudad"),
            ("salmanasar", "la sitió"),
            ("asiria", "se llevó cautivo al norte"),
        ],
    },
    "sarepta": {
        "note": (
            "Pueblo de la costa fenicia, entre Tiro y Sidón, fuera de Israel. "
            "Elías habitó aquí con una viuda durante la sequía anunciada a Acab: la harina y el aceite no faltaron, y el hijo de la viuda volvió a vivir."
        ),
        "related": [
            ("sidon", "Sarepta pertenece a Sidón"),
            ("tiro", "entre Tiro y Sidón, en la costa"),
            ("elias", "habitó con la viuda"),
            ("acab", "la sequía que Elías anunció a Acab lo llevó fuera de Israel"),
        ],
    },
    "sefarvaim": {
        "note": (
            "Ciudad de Mesopotamia, no de Canaán. Asiria trajo colonos de Sefarvaim a Samaria. "
            "Adoraban a Adramelec y a Anamelec, y pusieron esos cultos en el norte."
        ),
        "related": [
            ("asiria", "los deportó hacia la tierra conquistada"),
            ("samaria", "se asentaron en sus ciudades"),
            ("ava", "otro grupo de colonos del mismo traslado"),
            ("adramelec", "uno de sus dioses"),
            ("anamelec", "el otro dios de Sefarvaim"),
            ("salmanasar", "su conquista abrió Samaria a la gente de Sefarvaim"),
        ],
    },
    "sela": {
        "note": (
            "Ciudad de Edom, el Peñasco, al sur del mar Muerto, en la serranía de Seir. "
            "Amasías de Judá la tomó y la llamó Jocteel."
        ),
        "related": [
            ("edom", "en Edom"),
            ("juda", "Amasías salió desde Judá"),
            ("amasias", "conquistó Sela"),
        ],
    },
    "sidon": {
        "note": (
            "Ciudad fenicia de la costa del Líbano, al norte de Tiro. "
            "Etbaal era rey de Sidón; su hija Jezabel se casó con Acab. "
            "Elías fue enviado a Sarepta, que pertenece a Sidón."
        ),
        "related": [
            ("tiro", "ciudad fenicia vecina, al sur"),
            ("sarepta", "pueblo de su territorio, donde vivió Elías"),
            ("libano", "en esa costa"),
            ("etbaal", "rey de Sidón"),
            ("jezabel", "su hija"),
            ("acab", "yerno de Etbaal"),
            ("elias", "fue a Sarepta de Sidón durante la sequía"),
        ],
    },
    "sila": {
        "note": (
            "Lugar junto a Milo, dentro de Jerusalén, en la ciudad de David. "
            "Allí hirieron a Joás de Judá sus propios siervos."
        ),
        "related": [
            ("milo", "la fortificación junto a la que cae Sila"),
            ("jerusalen", "en la ciudad de David"),
            ("joas", "lo asesinaron en la casa de Milo, camino de Sila"),
        ],
    },
    "silo": {
        "note": (
            "Santuario en la sierra de Efraín, al norte de Betel. "
            "El arca estaba aquí con Elí. Ana oró en Silo y entregó a Samuel. "
            "Ofni y Finees servían el altar. El arca salió de Silo hacia la batalla, fue capturada, y no volvió."
        ),
        "related": [
            ("efrain", "en la sierra de Efraín"),
            ("betel", "Betel queda al sur, en la misma sierra"),
            ("eli", "sacerdote de Silo"),
            ("samuel", "creció sirviendo delante del Señor"),
            ("ana", "oró aquí y trajo al niño"),
            ("elcana", "subía cada año a adorar"),
            ("ofni", "hijo de Elí; corrompía el culto"),
            ("finees", "hijo de Elí; murió cuando el arca fue tomada"),
            ("arca", "salió de Silo y los filisteos la capturaron"),
        ],
    },
    "siquem": {
        "note": (
            "Ciudad de Efraín, entre el Ebal y el Gerizim, en la sierra central, al norte de Betel. "
            "Roboam vino aquí a ser rey de todo Israel. El pueblo lo rechazó, el reino se dividió "
            "y Jeroboam fortificó Siquem."
        ),
        "related": [
            ("efrain", "en Efraín"),
            ("betel", "al sur, en la misma sierra"),
            ("roboam", "aquí se le dividió el reino"),
            ("jeroboam", "lo hicieron rey del norte y fortificó Siquem"),
            ("salomon", "su hijo perdió el norte en esta asamblea"),
            ("israel", "las tribus del norte rechazaron a Roboam"),
        ],
    },
    "siria": {
        "note": (
            "El mismo país que Aram, al noreste de Israel, con capital en Damasco. "
            "David venció a sus reyes. Ben-adad y Hazael pelearon contra Israel. "
            "Naamán, general sirio, fue sanado por Eliseo. Rezín se alió con Peka contra Acaz."
        ),
        "related": [
            ("aram", "otro nombre del mismo país"),
            ("damasco", "su capital"),
            ("israel", "vecino del suroeste"),
            ("david", "venció a Hadad-ezer y a los sirios que ayudaban a Amón"),
            ("ben-adad", "rey de Siria en guerra con Acab"),
            ("hazael", "rey que oprimió a Israel"),
            ("naaman", "general sirio sanado en el Jordán"),
            ("eliseo", "lo sanó y anunció el reinado de Hazael"),
            ("rezin", "rey de Siria aliado de Peka"),
            ("acaz", "pidió ayuda a Asiria contra Rezín"),
        ],
    },
    "sucot": {
        "note": (
            "Pueblo del valle del Jordán, al este del río, cerca de Zaretán, en el borde de Galaad. "
            "Entre Sucot y Zaretán fundieron el bronce de los utensilios del templo de Salomón."
        ),
        "related": [
            ("jordan", "en el valle del río"),
            ("zaretan", "el otro punto de la fundición"),
            ("galaad", "en el borde de esa meseta"),
            ("salomon", "el bronce era para su templo"),
            ("templo", "aquí se fundieron sus enseres de bronce"),
        ],
    },
    "tabor": {
        "note": (
            "En el relato de Saúl es la encina de Tabor, en el camino de Ramá hacia Betel, no el monte del valle de Jezreel. "
            "Samuel le dijo que junto a esa encina encontraría tres hombres que subían a adorar, con pan y vino. "
            "El monte Tabor, aparte, se alza al noreste de Jezreel, en la frontera de Isacar."
        ),
        "related": [
            ("rama", "Saúl venía de dejar a Samuel"),
            ("betel", "los tres hombres subían a Betel"),
            ("jezreel", "el monte Tabor, distinto de la encina, mira a ese valle"),
            ("samuel", "dio a Saúl la señal de la encina"),
            ("saul", "recibió esa señal camino de Gabaa"),
        ],
    },
    "tarsis": {
        "note": (
            "Destino lejano de las naves, por el Mediterráneo, al oeste. No es una ciudad de Canaán: da nombre a las naves de altura. "
            "Salomón tenía naves de Tarsis con Hiram. Las que Josafat quiso enviar se rompieron en Ezión-geber."
        ),
        "related": [
            ("ezion-geber", "donde naufragó el proyecto de Josafat"),
            ("salomon", "tenía naves de Tarsis en el mar"),
            ("hiram", "se asoció con Salomón en ese comercio"),
            ("josafat", "quiso repetirlo y las naves se rompieron"),
        ],
    },
    "tecoa": {
        "note": (
            "Pueblo de la sierra de Judá, al sur de Belén, camino del desierto. "
            "Joab trajo de Tecoa a una mujer sabia para que contara a David una parábola y pidiera el regreso de Absalón."
        ),
        "related": [
            ("juda", "en la sierra de Judá"),
            ("belen", "al sur de Belén"),
            ("joab", "envió a la mujer sabia"),
            ("david", "escuchó la parábola y mandó traer a Absalón"),
            ("absalon", "el relato buscaba su regreso desde Gesur"),
        ],
    },
    "tifsa": {
        "note": (
            "Ciudad junto al Éufrates, límite noreste del dominio de Salomón, de Tifsa hasta Gaza. "
            "En Reyes, Manahem atacó una Tifsa con crueldad; puede ser esta plaza del río u otra del norte de Israel."
        ),
        "related": [
            ("eufrates", "junto al gran río, en el límite del este"),
            ("israel", "marca hasta dónde llegaba el dominio de Salomón"),
            ("salomon", "dominaba desde Tifsa"),
            ("manahem", "atacó Tifsa y no le abrían las puertas"),
        ],
    },
    "tiro": {
        "note": (
            "Ciudad fenicia de la costa del Líbano, al sur de Sidón y al norte de Israel. "
            "Hiram, su rey, fue aliado de David y de Salomón: envió cedros, artesanos y marineros para la flota de Ofir."
        ),
        "related": [
            ("sidon", "ciudad fenicia al norte"),
            ("libano", "los cedros de su interior"),
            ("ofir", "la flota conjunta salía hacia esa tierra"),
            ("hiram", "rey de Tiro"),
            ("david", "Hiram le envió madera para su palacio"),
            ("salomon", "aliado para el templo y para el mar"),
        ],
    },
    "tirsa": {
        "note": (
            "Ciudad de la sierra de Efraín, al norte de Siquem. "
            "Fue capital de Jeroboam, de Baasa y de Ela antes de Samaria. "
            "Zimri mató a Ela en casa de Arsa, en Tirsa, reinó siete días y quemó el palacio cuando Omri la sitió."
        ),
        "related": [
            ("efrain", "en la sierra de Efraín"),
            ("siquem", "al norte de Siquem"),
            ("samaria", "la capital que Omri fundó después"),
            ("jeroboam", "reinó desde Tirsa"),
            ("baasa", "también tuvo aquí su capital"),
            ("ela", "Zimri lo mató en Tirsa"),
            ("zimri", "reinó siete días y quemó la casa del rey"),
            ("arsa", "mayordomo; Ela estaba bebiendo en su casa"),
            ("omri", "sitió Tirsa y luego mudó la capital"),
        ],
    },
    "tob": {
        "note": (
            "Tierra al noreste, fuera del núcleo de Israel, en la órbita de Aram y de Galaad. "
            "Los amonitas contrataron mercenarios de Tob contra David. En ese mismo relato se nombra a la gente de Maaca, región aramea vecina, distinta de Maaca esposa de David."
        ),
        "related": [
            ("aram", "región de esa guerra"),
            ("galaad", "al noreste de la meseta"),
            ("amon", "contrataron la tropa de Tob"),
            ("david", "era el rey contra quien marcharon"),
            ("joab", "mandó el ejército de David"),
        ],
    },
    "zaretan": {
        "note": (
            "Lugar en el valle del Jordán, cerca de Sucot. "
            "Entre Sucot y Zaretán fundieron el bronce del templo de Salomón. "
            "En el cruce de Josué, las aguas se amontonaron junto a Adam, ciudad de junto a Zaretán."
        ),
        "related": [
            ("sucot", "el otro extremo de la fundición"),
            ("jordan", "en su llanura"),
            ("salomon", "el bronce era para el templo"),
            ("templo", "sus enseres se fundieron en esta llanura"),
            ("josue", "las aguas del cruce se detuvieron junto a esta zona"),
        ],
    },
    "zereda": {
        "note": (
            "Pueblo de la sierra de Efraín. "
            "Jeroboam hijo de Nabat era efrateo de Zereda. Ahías de Silo le anunció que reinaría sobre diez tribus."
        ),
        "related": [
            ("efrain", "en Efraín"),
            ("silo", "Ahías, que lo encontró en el camino, era de Silo"),
            ("jeroboam", "era de Zereda"),
            ("nabat", "su padre"),
            ("ahias", "profetizó que Dios le daría el norte"),
            ("salomon", "Jeroboam servía en sus obras cuando recibió la profecía"),
        ],
    },
    "zoba": {
        "note": (
            "Reino arameo al norte de Damasco, hacia Hamat. "
            "Hadad-ezer era su rey. Acudió en ayuda de Amón y David lo venció; Joab peleó en esa guerra."
        ),
        "related": [
            ("aram", "reino arameo"),
            ("damasco", "Zoba queda al norte de Damasco"),
            ("hamat", "hacia el norte"),
            ("hadad-ezer", "rey de Zoba"),
            ("david", "lo derrotó"),
            ("joab", "mandó la batalla contra Amón y sus aliados"),
            ("amon", "Zoba acudió en su ayuda"),
        ],
    },
    "zohelet": {
        "note": (
            "Piedra junto a la fuente de En-rogel, al sur de Jerusalén. "
            "Adonías sacrificó junto a Zohélet y convidó a sus hermanos para proclamarse rey, sin David y sin Salomón."
        ),
        "related": [
            ("en-rogel", "la fuente junto a la piedra"),
            ("jerusalen", "al sur de la ciudad"),
            ("adonias", "hizo aquí el banquete"),
            ("david", "aún reinaba y no lo había autorizado"),
            ("salomon", "no fue invitado; lo ungieron en Gihón"),
            ("natan", "denunció el banquete a Betsabé y a David"),
        ],
    },
    "eufrates": {
        "note": (
            "El gran río de Mesopotamia, al noreste de Israel. "
            "El dominio de David y de Salomón se cuenta desde el Éufrates hasta la tierra de los filisteos. "
            "Tifsa está junto al río. Babilonia ocupa su llanura sur. Hadad-ezer de Zoba fue vencido camino de este río."
        ),
        "related": [
            ("tifsa", "ciudad de ese límite"),
            ("babilonia", "en la llanura sur del río"),
            ("david", "su frontera llegó hasta el Éufrates"),
            ("salomon", "dominó desde el río hasta Gaza"),
            ("hadad-ezer", "David lo venció cuando iba a restaurar su poder junto al río"),
            ("filisteos", "el otro extremo del territorio, al oeste"),
        ],
    },
    "ezel": {
        "note": (
            "Piedra en las afueras de Gabaa, en Benjamín, donde David se escondió. "
            "Jonatán disparó las flechas más allá de la piedra: era la señal de que Saúl quería matar a David. Allí se despidieron."
        ),
        "related": [
            ("gabaa", "en las afueras del pueblo de Saúl"),
            ("benjamin", "en Benjamín"),
            ("david", "se escondió detrás de la piedra"),
            ("jonatan", "la señal de las flechas y la despedida"),
            ("saul", "la señal avisaba de que había decidido matar a David"),
        ],
    },
}


def apply_place_geography(entries: list[dict]) -> None:
    ids = {e["id"] for e in entries if e.get("id")}
    places = [e for e in entries if e.get("kind") == "lugar"]
    missing = [e["id"] for e in places if e["id"] not in PLACE_GEOGRAPHY]
    extra = sorted(set(PLACE_GEOGRAPHY) - {e["id"] for e in places})
    if missing or extra:
        raise SystemExit(
            "place geography out of sync with glossary places: "
            f"missing={missing} extra={extra}"
        )
    unknown: list[str] = []
    for pid, geo in PLACE_GEOGRAPHY.items():
        for oid, _rel in geo["related"]:
            if oid not in ids:
                unknown.append(f"{pid}->{oid}")
    if unknown:
        raise SystemExit(f"place geography links unknown ids: {unknown}")

    for entry in entries:
        geo = PLACE_GEOGRAPHY.get(entry["id"])
        if not geo:
            continue
        entry["note"] = geo["note"]
        seen: set[str] = set()
        related = []
        for oid, rel in geo["related"]:
            if oid == entry["id"] or oid in seen or oid not in ids:
                continue
            seen.add(oid)
            related.append({"id": oid, "rel": rel})
        entry["related"] = related
