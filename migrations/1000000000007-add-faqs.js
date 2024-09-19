const dbReady = require('lib/models').ready

const aboutUs = require('lib/models').aboutUs

const aboutUsData = [
{ 'order': 0, 'question': '+ ¿QUÉ ES EL PRESUPUESTO PARTICIPATIVO DE GENERAL PUEYRREDON?', 'answer': '<p className="p-padding">El Programa ParticipaMGP PP (Presupuesto Participativo) es un espacio donde vas a poder presentar las ideas que tu barrio necesita. Luego, a través del voto, los vecinos del barrio van a poder decidir en qué utilizar parte del presupuesto del Municipio.</p>' },
{ 'order': 1, 'question': '+ ¿CÓMO SE DISTRIBUYE EL DINERO POR ZONA?', 'answer': '<p className="p-padding">La partida presupuestaria anual asignada al Programa ParticipaMGP, definida anualmente por la Secretaría de Economía y Hacienda, respetando los límites expuestos en la O-25061, se distribuye en 11 zonas considerando equidad territorial, equidad distributiva y cumplimiento fiscal.<br/>Para ésto, se le asignará a cada zona el monto que surja de las siguientes pautas:<ul><li>25% del monto total del proyecto de ParticipaMGP será distribuido en partes iguales.</li><li>25% del monto total será dividido proporcionalmente a la población de cada zona, según el último Censo Nacional de Población, Hogares y Viviendas (CNPHyV) disponible.</li><li>25% del monto total será dividido proporcionalmente a la cantidad de hogares afectados con Necesidades Básicas Insatisfechas (NBI) de cada zona, según el último Censo Nacional de Población, Hogares y Viviendas (CNPHyV) disponible.</li><li>25% del monto total será dividido proporcionalmente según el cumplimiento fiscal de cada zona en la Tasa de Servicios Urbanos (TSU), de acuerdo a listado provisto por la Agencia de Recaudación Municipal del año fiscal anterior.</li></ul></p>' },
{ 'order': 2, 'question': '+ ¿QUIÉN PUEDE PRESENTAR IDEAS?', 'answer': '<p className="p-padding">Cualquier persona mayor de 16 años (cumplidos a la fecha de votación) con domicilio en su DNI en cualquiera de las zonas en las que se divide el Partido.</p>' },
{ 'order': 3, 'question': '+ ¿CÓMO SE ELABORAN LAS IDEAS?', 'answer': '<p className="p-padding">En una serie de reuniones informativas, los vecinos y los representantes de las entidades serán capacitados por funcionarios municipales y/o grupo de consejeros seleccionados en cada zona con el fin de cargar las ideas en la plataforma digital PARTICIPA.MARDELPLATA.GOB.AR utilizando el formulario de presentación de ideas.</p>' },
{ 'order': 4, 'question': '+ ¿CÓMO SE DECIDE QUÉ PROYECTOS VAN A VOTACIÓN?', 'answer': '<p className="p-padding">Para que una idea pueda convertirse en un proyecto votable, luego del trabajo conjunto con funcionarios y/o grupo de consejeros, se pasa a una etapa de análisis legal, técnico y presupuestario. En esta instancia se termina de definir la factibilidad del proyecto y los costos estimados del mismo.</p>' },
{ 'order': 5, 'question': '+ ¿QUIÉN PUEDE VOTAR LOS PROYECTOS?', 'answer': '<p className="p-padding">Cualquier persona mayor de 16 años (cumplidos a la fecha de votación) con domicilio en su DNI en cualquiera de las zonas en las que se divide el Partido puede votar los proyectos.</p>' },
{ 'order': 6, 'question': '+ ¿PUEDO VOTAR MÁS DE UNA VEZ?', 'answer': '<p className="p-padding">Se puede votar un sola vez, con la posibilidad de seleccionar 2 (dos)  proyectos, uno en la zona asignada a tu domicilio o seleccionada en la plataforma y otro en cualquier zona.</p>' },
{ 'order': 7, 'question': '+ ¿CÓMO VOTAR?', 'answer': '<p className="p-padding">Para poder votar los proyectos, tenés que registrarte en plataforma online ParticipaMGP (participa.mardelplata.gob.ar) y ahí seleccionar tus preferidos.</p>' },
]

/**
 * Make any changes you need to make to the database here
 */
exports.up = function up (done) {
  dbReady()
    // Primero chequear si ya no hay cosas cargadas
    .then(() => {
      return new Promise((resolve, reject) => {
        aboutUs.collection.count({}, (err, count) => {
          if (err) reject(new Error(err))
          if (count) {
            console.log('Ya hay (%s) preguntas y respuestas cargadas', count)
            reject(new SaltearPromises())
          }
          resolve()
        })
      })
    })
    // Agregamos preguntas y respuestas
    .then(() => aboutUs.collection.insertMany(aboutUsData))
    // Devolvemos al Migrator (de lib/migrations)
    .then(() => {
      console.log(`-- Agregadas las preguntas y respuestas de la seccion "acerca de"`)
      done()
    })
    .catch((err) => {
      if (err instanceof SaltearPromises) {
        done()
      } else {
        console.log('-- Actualizacion de acerca de no funcionó! Error: ', err)
        done(err)
      }
    })
}

/**
 * Make any changes that UNDO the up function side effects here (if possible)
 */
exports.down = function down(done) {
  done()
}