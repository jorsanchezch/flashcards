import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const flashcardsDir = path.join(__dirname, '..', 'obsidian-vault', 'flashcards')

/** @type {Record<string, string>} */
const ANSWERS = {
  'samuel-1-2-ana-samuel-y-eli/cuando-elcana-repartia-las-porciones-del.md':
    'A Ana, aunque la amaba, le daba una porción selecta. (1 Samuel 1:4-5, NTV)',
  'samuel-1-2-ana-samuel-y-eli/cuantos-hijos-e-hijas-tuvo-ana-despues-de-samuel.md':
    'Tres hijos y dos hijas. (1 Samuel 2:21, NTV)',
  'samuel-1-2-ana-samuel-y-eli/de-que-lugar-procedia-elcana-cuando-se-presenta.md':
    'De Ramá, en la región de Zuf, en la zona montañosa de Efraín. (1 Samuel 1:1, NTV)',
  'samuel-1-2-ana-samuel-y-eli/despues-de-presentar-a-samuel-al-senor-que.md':
    'Su oración de alabanza. (1 Samuel 2:1-10, NTV)',
  'samuel-1-2-ana-samuel-y-eli/despues-de-que-ana-desteto-al-nino-que-llevo.md':
    'Un toro de tres años, una canasta de harina y un poco de vino. (1 Samuel 1:24, NTV)',
  'samuel-1-2-ana-samuel-y-eli/durante-las-visitas-anuales-a-silo-que-dos.md':
    'Ofni y Finees. (1 Samuel 1:3, NTV)',
  'samuel-1-2-ana-samuel-y-eli/mientras-ana-oraba-en-silo-que-detalle-hizo-que.md':
    'Movía los labios, pero no se oía ningún sonido. (1 Samuel 1:12-13, NTV)',
  'samuel-1-2-ana-samuel-y-eli/mientras-samuel-permanecia-en-silo-que-hacia-el.md':
    'Servía al Señor como ayudante del sacerdote Elí. (1 Samuel 2:11, NTV)',
  'samuel-1-2-ana-samuel-y-eli/por-que-ana-llamo-samuel-al-nino-que-dios-le.md':
    'Porque dijo: «Se lo pedí al Señor». (1 Samuel 1:20, NTV)',
  'samuel-1-2-ana-samuel-y-eli/que-bendicion-recibio-elcana-de-eli-despues-de.md':
    'Que el Señor les diera otros hijos en lugar del que ella entregó al Señor. (1 Samuel 2:20, NTV)',
  'samuel-1-2-ana-samuel-y-eli/que-conducta-tenian-los-hijos-de-eli-respecto-a.md':
    'Tomaban carne de los sacrificios por la fuerza, antes de quemarse la grasa. (1 Samuel 2:12-17, NTV)',
  'samuel-1-2-ana-samuel-y-eli/que-hacia-ana-cada-ano-despues-de-ser-provocada.md':
    'Lloraba y ni siquiera quería comer. (1 Samuel 1:7, NTV)',
  'samuel-1-2-ana-samuel-y-eli/que-mensaje-recibe-eli-de-un-hombre-de-dios.md':
    'Que sus dos hijos, Ofni y Finees, morirían el mismo día y que Dios juzgaría su familia. (1 Samuel 2:27-34, NTV)',
  'samuel-1-2-ana-samuel-y-eli/que-pecado-adicional-de-los-hijos-de-eli.md':
    'Seducían a las jóvenes que ayudaban a la entrada del tabernáculo. (1 Samuel 2:22, NTV)',
  'samuel-1-2-ana-samuel-y-eli/que-prenda-pequena-preparaba-su-madre-para.md':
    'Un pequeño abrigo. (1 Samuel 2:19, NTV)',
  'samuel-1-2-ana-samuel-y-eli/que-prometio-ana-hacer-con-el-hijo-que-estaba.md':
    'Devolverlo al Señor toda su vida; nunca se le cortaría el cabello. (1 Samuel 1:11, NTV)',
  'samuel-11-saul-libera-jabes/cuando-el-rey-enemigo-llego-contra-jabes-de.md':
    'Sacarles el ojo derecho a cada uno para deshonrar a todo Israel. (1 Samuel 11:2, NTV)',
  'samuel-11-saul-libera-jabes/cuando-los-mensajeros-llegaron-a-gabaa-y.md':
    'Todos se echaron a llorar. (1 Samuel 11:4, NTV)',
  'samuel-11-saul-libera-jabes/cuantos-hombres-fueron-reunidos-para-la-batalla.md':
    'Trescientos mil de Israel y treinta mil de Judá. (1 Samuel 11:8, NTV)',
  'samuel-11-saul-libera-jabes/por-que-los-habitantes-de-jabes-pidieron-siete.md':
    'Para enviar mensajeros por todo Israel y, si nadie los rescataba, aceptar las condiciones. (1 Samuel 11:3, NTV)',
  'samuel-11-saul-libera-jabes/que-estaba-haciendo-el-rey-cuando-regreso-del.md':
    'Araba un campo con sus bueyes. (1 Samuel 11:5, NTV)',
  'samuel-11-saul-libera-jabes/que-hicieron-los-israelitas-al-dia-siguiente.md':
    'Los masacró; el ejército amonita quedó tan disperso que no había dos juntos. (1 Samuel 11:11, NTV)',
  'samuel-11-saul-libera-jabes/que-hizo-saul-con-los-bueyes-que-habia-tomado.md':
    'Los cortó en pedazos y envió mensajeros por todo Israel con esa advertencia. (1 Samuel 11:7, NTV)',
  'samuel-11-saul-libera-jabes/que-ocurrio-con-saul-cuando-escucho-las.md':
    'El Espíritu de Dios vino con poder sobre él y se enojó mucho. (1 Samuel 11:6, NTV)',
  'samuel-12-samuel-se-despide/al-recordar-la-historia-de-israel-que-profeta.md':
    'Aarón. (1 Samuel 12:6, NTV)',
  'samuel-12-samuel-se-despide/aunque-israel-habia-hecho-lo-malo-al-pedir-rey.md':
    'Orar por ellos y seguir enseñándoles lo que es bueno y correcto. (1 Samuel 12:23, NTV)',
  'samuel-12-samuel-se-despide/cuando-israel-olvido-al-senor-y-comenzo-a.md':
    'A Sísara, a los filisteos y al rey de Moab, entre otros. (1 Samuel 12:9-10, NTV)',
  'samuel-12-samuel-se-despide/cuando-israel-pidio-un-rey-por-miedo-a-nahas.md':
    'El Señor su Dios. (1 Samuel 12:12, NTV)',
  'samuel-12-samuel-se-despide/cuando-samuel-hablo-ante-todo-israel-despues-de.md':
    'Si les había robado un buey o un burro, estafado, oprimido o aceptado soborno. (1 Samuel 12:3, NTV)',
  'samuel-12-samuel-se-despide/despues-de-ver-los-truenos-y-la-lluvia-que.md':
    'Que habían añadido el pecado de pedir un rey. (1 Samuel 12:19, NTV)',
  'samuel-12-samuel-se-despide/que-respondio-el-pueblo-cuando-samuel-les.md':
    'Que nunca los había engañado ni oprimido ni aceptado soborno. (1 Samuel 12:4, NTV)',
  'samuel-12-samuel-se-despide/que-senal-hizo-samuel-para-demostrar-al-pueblo.md':
    'Clamó al Señor, y ese mismo día envió truenos y lluvia. (1 Samuel 12:18, NTV)',
  'samuel-3-4-llamado-y-arca/a-la-manana-siguiente-que-hizo-samuel-con.md':
    'Tenía miedo de contarle a Elí lo que el Señor le había dicho. (1 Samuel 3:15, NTV)',
  'samuel-3-4-llamado-y-arca/a-quien-penso-samuel-que-lo-estaba-llamando.md':
    'A Elí. (1 Samuel 3:4-6, NTV)',
  'samuel-3-4-llamado-y-arca/como-consiguio-eli-que-samuel-finalmente-le.md':
    'Le pidió que no le ocultara nada y que el Señor lo castigara si omitía algo. (1 Samuel 3:17, NTV)',
  'samuel-3-4-llamado-y-arca/cuando-israel-salio-a-pelear-contra-los.md':
    'Israel acampaba cerca de Ebenezer y los filisteos en Afec. (1 Samuel 4:1, NTV)',
  'samuel-3-4-llamado-y-arca/cuantos-hombres-de-israel-murieron-en-la.md':
    'Aproximadamente cuatro mil. (1 Samuel 4:2, NTV)',
  'samuel-3-4-llamado-y-arca/cuantos-soldados-israelitas-murieron-en-la.md':
    'Treinta mil soldados israelitas. (1 Samuel 4:10, NTV)',
  'samuel-3-4-llamado-y-arca/despues-de-comprender-que-era-dios-quien.md':
    'Que respondiera: «Habla, Señor, que tu siervo escucha». (1 Samuel 3:9, NTV)',
  'samuel-3-4-llamado-y-arca/despues-de-la-primera-derrota-que-decidieron.md':
    'Traer de Silo el arca del pacto del Señor. (1 Samuel 4:3-4, NTV)',
  'samuel-3-4-llamado-y-arca/donde-estaba-samuel-cuando-escucho-por-primera.md':
    'Dormía en el tabernáculo cerca del arca de Dios. (1 Samuel 3:3, NTV)',
  'samuel-3-4-llamado-y-arca/que-caracteristica-tenia-la-comunicacion-de.md':
    'Los mensajes del Señor eran muy escasos y las visiones poco comunes. (1 Samuel 3:1, NTV)',
  'samuel-3-4-llamado-y-arca/que-dos-hijos-de-eli-acompanaron-el-arca-al.md':
    'Ofni y Finees. (1 Samuel 4:4, NTV)',
  'samuel-3-4-llamado-y-arca/que-hizo-que-todo-israel-reconociera-que-samuel.md':
    'El Señor estaba con él y todo lo que decía se cumplía. (1 Samuel 3:19-20, NTV)',
  'samuel-3-4-llamado-y-arca/que-mensaje-recibio-samuel-aquella-noche-acerca.md':
    'Juicio contra la familia de Elí, porque sus hijos blasfemaban a Dios y él no los disciplinó. (1 Samuel 3:11-14, NTV)',
  'samuel-3-4-llamado-y-arca/que-nombre-recibio-el-hijo-recien-nacido-de-la.md':
    'Icabod («¿dónde está la gloria?»), porque la gloria de Israel se había ido. (1 Samuel 4:21-22, NTV)',
  'samuel-3-4-llamado-y-arca/que-ocurrio-con-eli-cuando-escucho-las-noticias.md':
    'Cayó de espaldas, se quebró la nuca y murió. (1 Samuel 4:18, NTV)',
  'samuel-3-4-llamado-y-arca/que-sucedio-con-el-arca-despues-de-la-derrota.md':
    'Los filisteos la capturaron. (1 Samuel 4:11, NTV)',
  'samuel-5-7-arca-y-regreso/a-quienes-consultaron-los-filisteos-para-saber.md':
    'A sus sacerdotes y adivinos. (1 Samuel 6:2, NTV)',
  'samuel-5-7-arca-y-regreso/a-que-ciudad-llevaron-el-arca-despues-de-que.md':
    'Gat. (1 Samuel 5:8, NTV)',
  'samuel-5-7-arca-y-regreso/cual-fue-la-tercera-ciudad-mencionada-a-la-que.md':
    'Ecrón. (1 Samuel 5:10, NTV)',
  'samuel-5-7-arca-y-regreso/cuando-samuel-llamo-al-pueblo-a-volver-al-senor.md':
    'Los dioses ajenos y las imágenes de Astoret. (1 Samuel 7:3-4, NTV)',
  'samuel-5-7-arca-y-regreso/cuando-volvieron-a-colocar-a-dagon-en-su-sitio.md':
    'Dagón había caído otra vez boca abajo; tenía rotas la cabeza y las manos, y solo quedó el tronco. (1 Samuel 5:4, NTV)',
  'samuel-5-7-arca-y-regreso/cuantas-figuras-de-tumores-de-oro-y-cuantas.md':
    'Cinco tumores de oro y cinco ratas de oro. (1 Samuel 6:4-5, NTV)',
  'samuel-5-7-arca-y-regreso/cuanto-tiempo-permanecio-el-arca-en-quiriat.md':
    'Veinte años. (1 Samuel 7:2, NTV)',
  'samuel-5-7-arca-y-regreso/cuanto-tiempo-permanecio-el-arca-en-territorio.md':
    'Siete meses. (1 Samuel 6:1, NTV)',
  'samuel-5-7-arca-y-regreso/despues-de-capturar-el-arca-a-que-ciudad.md':
    'Asdod. (1 Samuel 5:1, NTV)',
  'samuel-5-7-arca-y-regreso/despues-de-recuperar-el-arca-donde-la-llevaron.md':
    'A Quiriat-jearim, a la casa de Abinadab; comisionaron a su hijo Eleazar para cuidarla. (1 Samuel 7:1, NTV)',
  'samuel-5-7-arca-y-regreso/donde-colocaron-el-arca-cuando-la-llevaron-a.md':
    'Junto a una estatua de Dagón, en su templo. (1 Samuel 5:2, NTV)',
  'samuel-5-7-arca-y-regreso/donde-reunio-samuel-al-pueblo-para-ayunar-y.md':
    'En Mizpa. (1 Samuel 7:5-6, NTV)',
  'samuel-5-7-arca-y-regreso/que-animales-pusieron-para-tirar-de-la-carreta.md':
    'Dos vacas que acaban de tener cría; encerraron los becerros en un corral. (1 Samuel 6:7, NTV)',
  'samuel-5-7-arca-y-regreso/que-ciudad-alcanzo-el-arca-despues-de-salir-del.md':
    'Bet-semes. (1 Samuel 6:12-13, NTV)',
  'samuel-5-7-arca-y-regreso/que-encontraron-los-filisteos-cuando-se.md':
    'Dagón estaba caído boca abajo delante del arca del Señor. (1 Samuel 5:3, NTV)',
  'samuel-5-7-arca-y-regreso/que-enfermedad-o-afliccion-comenzo-a-afectar-a.md':
    'Plaga de tumores. (1 Samuel 5:6, NTV)',
  'samuel-5-7-arca-y-regreso/que-hizo-samuel-mientras-los-israelitas-estaban.md':
    'Ofreció un cordero como ofrenda quemada entera y rogó al Señor por Israel. (1 Samuel 7:9, NTV)',
  'samuel-5-7-arca-y-regreso/que-nombre-le-dio-samuel-a-aquella-piedra-y-que.md':
    'Ebenezer («la piedra de ayuda»): «¡Hasta aquí el Señor nos ha ayudado!». (1 Samuel 7:12, NTV)',
  'samuel-5-7-arca-y-regreso/que-objeto-coloco-samuel-entre-mizpa-y-sen-como.md':
    'Una piedra grande. (1 Samuel 7:12, NTV)',
  'samuel-5-7-arca-y-regreso/que-ocurrio-con-algunos-habitantes-de-bet-semes.md':
    'El Señor mató a setenta hombres porque miraron dentro del arca. (1 Samuel 6:19, NTV)',
  'samuel-5-7-arca-y-regreso/que-ocurrio-cuando-los-filisteos-subieron.md':
    'Truenos desde el cielo, confusión entre los filisteos, e Israel los derrotó. (1 Samuel 7:10-11, NTV)',
  'samuel-5-7-arca-y-regreso/que-ocurrio-en-gat-cuando-llego-el-arca.md':
    'Gran pánico y plaga de tumores. (1 Samuel 5:9, NTV)',
  'samuel-5-7-arca-y-regreso/que-tipo-de-ofrenda-debian-enviar-junto-con-el.md':
    'Ofrenda por la culpa. (1 Samuel 6:3-5, NTV)',
  'samuel-5-7-arca-y-regreso/que-tipo-de-transporte-prepararon-para-devolver.md':
    'Una carreta nueva. (1 Samuel 6:7, NTV)',
  'samuel-8-10-israel-pide-rey/como-se-llamaba-el-padre-del-hombre-que.md':
    'Cis. (1 Samuel 9:1, NTV)',
  'samuel-8-10-israel-pide-rey/cuando-llevaban-tiempo-sin-encontrar-los.md':
    'Temía que su padre estuviera más preocupado por ellos que por los burros. (1 Samuel 9:5, NTV)',
  'samuel-8-10-israel-pide-rey/cuando-samuel-envejecio-que-hizo-con-sus-hijos.md':
    'Los nombró jueces de Israel. (1 Samuel 8:1-2, NTV)',
  'samuel-8-10-israel-pide-rey/cuando-samuel-oro-por-causa-de-la-peticion-del.md':
    'Estaban rechazando al Señor para que ya no fuera su rey. (1 Samuel 8:7, NTV)',
  'samuel-8-10-israel-pide-rey/cuando-samuel-reunio-al-pueblo-para-presentar.md':
    'Tribu de Benjamín, familia de Matri, y Saúl hijo de Cis; estaba escondido entre el equipaje. (1 Samuel 10:20-22, NTV)',
  'samuel-8-10-israel-pide-rey/despues-de-escuchar-la-peticion-por-segunda-vez.md':
    'Que les diera un rey. (1 Samuel 8:21-22, NTV)',
  'samuel-8-10-israel-pide-rey/despues-de-salir-de-samuel-que-encontraria-saul.md':
    'Dos hombres que le dirían que los burros fueron encontrados y que su padre estaba preocupado por él. (1 Samuel 10:2, NTV)',
  'samuel-8-10-israel-pide-rey/donde-encontraria-saul-a-tres-hombres-que.md':
    'En el roble de Tabor, camino a Betel. (1 Samuel 10:3, NTV)',
  'samuel-8-10-israel-pide-rey/donde-se-reunieron-los-ancianos-de-israel-para.md':
    'En Ramá. (1 Samuel 8:4, NTV)',
  'samuel-8-10-israel-pide-rey/en-que-ciudad-ejercian-como-jueces-los-hijos-de.md':
    'Beerseba. (1 Samuel 8:2, NTV)',
  'samuel-8-10-israel-pide-rey/mientras-subian-por-la-cuesta-de-la-ciudad-a.md':
    'Unas jóvenes que salían a sacar agua. (1 Samuel 9:11, NTV)',
  'samuel-8-10-israel-pide-rey/que-animales-se-habian-perdido-y-provocaron-que.md':
    'Los burros de su padre. (1 Samuel 9:3, NTV)',
  'samuel-8-10-israel-pide-rey/que-caracteristica-fisica-distinguia.md':
    'Tan alto que los demás apenas le llegaban a los hombros. (1 Samuel 9:2, NTV)',
  'samuel-8-10-israel-pide-rey/que-dos-funciones-militares-y-politicas-dijeron.md':
    'Que el rey los juzgara y fuera su líder en las batallas. (1 Samuel 8:20, NTV)',
  'samuel-8-10-israel-pide-rey/que-hizo-samuel-sobre-saul-al-momento-de.md':
    'Derramó aceite sobre su cabeza y lo besó. (1 Samuel 10:1, NTV)',
  'samuel-8-10-israel-pide-rey/que-informacion-les-dieron-las-jovenes-sobre-el.md':
    'Que el vidente acababa de llegar para un sacrificio en el lugar de adoración y que debían apresurarse a encontrarlo antes de comer. (1 Samuel 9:12-13, NTV)',
  'samuel-8-10-israel-pide-rey/que-le-habia-revelado-dios-a-samuel-el-dia.md':
    'Que al día siguiente enviaría un hombre de Benjamín para ungirlo como líder de su pueblo. (1 Samuel 9:15-16, NTV)',
  'samuel-8-10-israel-pide-rey/que-le-ocurriria-a-saul-cuando-se-encontrara.md':
    'El Espíritu del Señor vendría poderosamente sobre él y profetizaría; sería transformado en otra persona. (1 Samuel 10:6, NTV)',
  'samuel-8-10-israel-pide-rey/que-llevaban-los-tres-hombres-que-saul.md':
    'Tres cabritos, tres panes y un odre de vino. (1 Samuel 10:3, NTV)',
  'samuel-8-10-israel-pide-rey/que-objeto-de-plata-llevaba-el-criado-cuando.md':
    'Una pequeña pieza de plata (un cuarto de siclo). (1 Samuel 9:8, NTV)',
  'samuel-8-10-israel-pide-rey/que-ocurriria-cuando-saul-llegara-a-gabaa-de.md':
    'Un grupo de profetas con arpa, pandereta, flauta y lira, profetizando. (1 Samuel 10:5, NTV)',
  'samuel-8-10-israel-pide-rey/que-querian-tener-los-israelitas-para-ser-como.md':
    'Un rey que los juzgara como las demás naciones. (1 Samuel 8:5, NTV)',
  'samuel-8-10-israel-pide-rey/que-recibiria-saul-de-aquellos-hombres.md':
    'Dos panes. (1 Samuel 10:4, NTV)',
  'samuel-8-10-israel-pide-rey/que-tres-practicas-de-los-hijos-de-samuel.md':
    'Codiciaban el dinero; aceptaban sobornos y pervertían la justicia. (1 Samuel 8:3, NTV)',
}

function patchFile(relPath, answer) {
  const filePath = path.join(flashcardsDir, relPath)
  return readFile(filePath, 'utf8').then((text) => {
    const next = text.replace(/\?\n[^\n]+\n\n---/, `?\n${answer}\n\n---`)
    if (next === text) {
      throw new Error(`No answer block updated: ${relPath}`)
    }
    return writeFile(filePath, next)
  })
}

async function main() {
  const keys = Object.keys(ANSWERS)
  if (keys.length !== 96) {
    throw new Error(`Expected 96 answers, got ${keys.length}`)
  }
  for (const rel of keys) {
    await patchFile(rel, ANSWERS[rel])
  }
  console.log(`Updated ${keys.length} flashcards with NTV answers.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
