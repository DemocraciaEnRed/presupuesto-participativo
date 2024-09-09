const dbReady = require('lib/models').ready

const Text = require('lib/models').Text

const textsData = [
	{ "name": "home-subtitle", "text": "Muchas Gracias" },
	{ "name": "home-subtitle-text", "text": "home-subtitle-text" },
	{ "name": "home-video1-mp4", "text": "https://cldup.com/pQZlAEpzw0.mp4" },
	{ "name": "home-video1-webm", "text": "https://cldup.com/b5-PScfd-V.webm" },
	{ "name": "home-video2-mp4", "text": "https://cldup.com/w4RSGFJStA.mp4" },
	{ "name": "home-video2-webm", "text": "https://cldup.com/0Cy2GaQ-cR.webm" },
	{ "name": "home-icono1-imagen", "text": "https://i.ibb.co/Fgf5xgb/foros-vecinales-icono.png" },
	{ "name": "home-icono1-titulo", "text": "¿Qué es?" },
	{ "name": "home-icono1-texto", "text": "home-icono1-texto" },
	{ "name": "home-icono2-imagen", "text": "https://i.ibb.co/9VjQQHy/icon-propuestas.png" },
	{ "name": "home-icono2-titulo", "text": "¿Qué puedo proponer?" },
	{ "name": "home-icono2-texto", "text": "home-icono2-texto" },
	{ "name": "home-icono3-imagen", "text": "https://i.ibb.co/BttPHbc/icon-seguimiento.png" },
	{ "name": "home-icono3-titulo", "text": "¿Cómo sigo los proyectos?" },
	{ "name": "home-icono3-texto", "text": "home-icono3-texto" }
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
