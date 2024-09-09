const config = require('lib/config')

const dbReady = require('lib/models').ready

const Text = require('lib/models').Text

const textsData = [
    //home
    { "name": "home-title", "text": "PRESUPUESTO PARTICIPATIVO DE GENERAL PUEYRREDON" },
    { "name": "home-encuentro-title", "text": "NOVEDADES Y PRÓXIMOS ENCUENTROS" },
    { "name": "home-encuentro-subtitle", "text": "Agendate la reunión de tu barrio y presentá tus ideas." },

    //baner 1 
    { "name": "home-banner-image", "text": config.votacionAbierta ?  "https://participa.mardelplata.gob.ar//ext/lib/site/banner-invitacion/icon-votar.svg" : "https://participa.mardelplata.gob.ar//ext/lib/site/banner-invitacion/icon-idea.svg" },
    { "name": "home-banner-title", "text": config.votacionAbierta ? 'Te invitamos a conocer los proyectos y a votar los que quieras que se lleven adelante' : config.propuestasAbiertas ? "Subí tu idea o mejorá con tus comentarios las de los vecinos.": config.propuestasVisibles ? "La etapa de subida de ideas ya finalizó. Ingresá para ver el listado completo" : 'La etapa de votación ya finalizó. Podrás acceder a ver los proyectos ganadores' },
    { "name": "home-banner-button1-text", "text":  (config.votacionAbierta || config.votacionVisible) ? "Catálogo de Proyectos" : "Accedé a las ideas" },
    { "name": "home-banner-button1-link", "text": "/propuestas" },
    { "name": "home-banner-button2-text", "text":  config.votacionAbierta ? 'Votá los proyectos' : 'Votos por proyectos' },
    { "name": "home-banner-button2-link", "text": config.votacionAbierta ? '/votacion': 'https://www.mardelplata.gob.ar/documentos/comunicacion/participamgpproyectosganadores.pdf' },
	
    //ideas y proyectos
    { "name": "idea-title", "text": "Ideas y proyectos" },
	  { "name": "idea-subtitle", "text": config.propuestasAbiertas ? config.propuestasTextoAbiertas : config.propuestasTextoCerradas },
    
    //archivo
    { "name": "archivo-title", "text": "Archivo de proyectos" },
    { "name": "archivo-subtitle", "text": "Aquí podes visualizar los proyectos de años anteriores" },
    
    //votacion
    { "name": "votacion-title", "text":  'VOTACIÓN DEL PRESUPUESTO PARTICIPATIVO GENERAL PUEYRREDON 2023' },
    { "name": "votacion-subtitle", "text": "Gracias por participar de la votación del presupuesto participativo 2023" },
    { "name": "votacion-steps", "text": "<div style='text-align: center;'><span style='font-size: 24px;'>Pasos y reglas para la votación</span></div><div class='wrapper'><br></div><ul><li class='wrapper'>Tenés <b>2 votos disponibles</b>.</li><li class='wrapper'>El <b>primer voto es obligatorio</b> y se destina a <b>tu zona indicada al momento de registro.</b></li><li class='wrapper'>Los proyectos aparecerán automáticamente ya definidos por tu zona</li><li class='wrapper'>El <b>segundo voto es opcional</b> y se destina a votar un proyecto de <b>cualquier zona del municipio.</b></li></ul>" },
	
    //footer
    { "name": "footer-info", "text":"<div>Subsecretaría de Modernización</div><div><span style='color: rgb(187, 187, 187);'>Av. Juan B. Justo 5665 Piso 1</span></div><div><span style='color: rgb(187, 187, 187);'>Mar Del Plata, Provincia de Buenos Aires</span></div><div><span style='color: rgb(187, 187, 187);'>Código postal: B7604AAG</span></div><div>Mail de contacto: <a href='mailto:ParticipaMGP@mardelplata.gob.ar'>ParticipaMGP@mardelplata.gob.ar</a></div>"}
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