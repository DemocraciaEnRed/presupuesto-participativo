const dbReady = require('lib/models').ready

const Text = require('lib/models').Text

const textsData = [

  //home
  { "name": "home-title", "text": "DEMO DE PP DEMOCRACIA EN RED" },
  { "name": "home-subtitle", "text": "REGISTRATE" },
  { "name": "home-subtitle-text", "text": "La subida de ideas abrirá el dia xx/xx/xx." },
	{ "name": "home-video1-mp4", "text": "https://cldup.com/pQZlAEpzw0.mp4" },
	{ "name": "home-video1-webm", "text": "https://cldup.com/b5-PScfd-V.webm" },
	{ "name": "home-video2-mp4", "text": "https://cldup.com/w4RSGFJStA.mp4" },
	{ "name": "home-video2-webm", "text": "https://cldup.com/0Cy2GaQ-cR.webm" },
  { "name": "home-icono1-imagen", "text": "ext/lib/site/home-multiforum/enterate.png" },
  { "name": "home-icono1-titulo", "text": "ENTERATE" },
  { "name": "home-icono1-texto", "text": "El PP es una herramienta que te permite proponer ideas para mejorar tu colegio o facultad utilizando una parte del presupuesto institucional. Si tu propuesta cumple con el reglamento, pasará a la etapa de votación, donde podría convertirse en un proyecto financiado." },
  { "name": "home-icono2-imagen", "text": "ext/lib/site/home-multiforum/participa.png" },
  { "name": "home-icono2-titulo", "text": "¿CÓMO HAGO PARA PARTICIPAR?" },
  { "name": "home-icono2-texto", "text": "Registrate para subir tus ideas. Revisá el reglamento, elegí un eje temático, asigná un título y describí brevemente tu propuesta. Además, podés comentar y dar “me gusta” a las ideas de otros. Las propuestas viables pasarán a votación, y las más votadas serán financiadas." },
  { "name": "home-icono3-imagen", "text": "ext/lib/site/home-multiforum/seguimos.png" },
  { "name": "home-icono3-titulo", "text": "¿CÓMO SEGUIMOS?" },
  { "name": "home-icono3-texto", "text": "Al finalizar la etapa de presentación, las ideas serán evaluadas y, si son viables, se convertirán en proyectos para la votación, donde los estudiantes decidirán cuáles se implementarán." },

  { "name": "home-encuentro-title", "text": "NOVEDADES Y PRÓXIMOS ENCUENTROS" },
  { "name": "home-encuentro-subtitle", "text": "Agendate la reunión de tu barrio y presentá tus ideas." },

  //baner 1 
  { "name": "home-banner-image", "text": '/ext/lib/site/banner-invitacion/icon-votar.png' },
  { "name": "home-banner-title", "text": '¡Proximamente abrirá la etapa de subida de ideas' },
  { "name": "home-banner-text", "text": 'Te invitamos a registrarte para notificarte cuando la misma este disponible, que puedas compartir tus ideas con la comunidad. Tambien podes conocer el avance de los proyectos del 2023' },

  { "name": "home-banner-button1-text", "text": 'REGISTRATE' },
  { "name": "home-banner-button1-link", "text": "/propuestas" },
  { "name": "home-banner-button2-text", "text": 'PROYECTOS 2023' },
  { "name": "home-banner-button2-link", "text": '/votacion' },

  //ideas y proyectos
  { "name": "idea-title", "text": "Ideas y proyectos" },
  {
    "name": "idea-subtitle", "text": 'te invitamos a registrarte y ver proyectos de años pasados'
  },

  //archivo
  { "name": "archivo-title", "text": "Archivo de proyectos" },
  { "name": "archivo-subtitle", "text": "Aquí podes visualizar los proyectos de años anteriores" },

  //votacion
  { "name": "votacion-title", "text": 'VOTACIÓN DEL PRESUPUESTO PARTICIPATIVO 2024' },
  { "name": "votacion-subtitle", "text": "Gracias por participar de la votación del presupuesto participativo 2023" },
  { "name": "votacion-steps", "text": "<div style='text-align: center;'><span style='font-size: 24px;'>Pasos y reglas para la votación</span></div><div class='wrapper'><br></div><ul><li class='wrapper'>Tenés <b>2 votos disponibles</b>.</li><li class='wrapper'>El <b>primer voto es obligatorio</b> y se destina a <b>tu zona indicada al momento de registro.</b></li><li class='wrapper'>Los proyectos aparecerán automáticamente ya definidos por tu zona</li><li class='wrapper'>El <b>segundo voto es opcional</b> y se destina a votar un proyecto de <b>cualquier zona del municipio.</b></li></ul>" },

  //footer
  {
    "name": "footer-info", "text": "<div>Democracia en Red</div><div><span >Democracia en Red es una ONG latinoamericana de Buenos Aires, Argentina, para el mundo.</div><br><div><strong>Mail de contacto:</strong> <a href='mailto:speak@democraciaenred.org'>speak@democraciaenred.org</a></div>"
  }

]

/**
 * Make any changes you need to make to the database here
 */
class SaltearPromises { }
exports.up = function up (done) {
  dbReady()
    // Primero chequear si ya no hay cosas cargadas
    .then(() => {
      return new Promise((resolve, reject) => {
        Text.collection.count({}, (err, count) => {
          if (err) reject(new Error(err))
          if (count) {
            console.log('Ya hay textos de portada cargados (%s), salteando migración', count)
            reject(new SaltearPromises())
          }
          resolve()
        })
      })
    })
    // Agregamos textos
    .then(() => Text.collection.insertMany(textsData))
    // Devolvemos al Migrator (de lib/migrations)
    .then(() => {
      console.log(`-- Agregados textos de portada`)
      done()
    })
    .catch((err) => {
      if (err instanceof SaltearPromises)
        done()
      else{
        console.log('-- Actualizacion de textos de portada no funcionó! Error: ', err)
        done(err)
      }
    })
}

/**
 * Make any changes that UNDO the up function side effects here (if possible)
 */
exports.down = function down(done) {
  done();
};
