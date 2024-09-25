// Script traído de ext/bin/migrate-pp.js
const config = require('lib/config')
const ObjectID = require('mongoose').Types.ObjectId
const dbReady = require('lib/models').ready
const Topic = require('lib/models').Topic
const Forum = require('lib/models').Forum

const newTopicsAttrs = require('ext/lib/site/formulario-propuesta/campos.json')


const migratePPScript = () => {

  const nuevosCampos = Forum.find({ 'name': 'proyectos' }).exec()
    .then(([ forum ]) => {
      forum.set('topicsAttrs', newTopicsAttrs)
      return forum.save()
    })
    .then((forum) => {
      console.log('Foro proyectos actualizado!')
   })

  return Promise.all([nuevosCampos])

}


/**
 * Make any changes you need to make to the database here
 */
class SaltearPromises { }
exports.up = function up (done) {
  dbReady()
    // Primero chequear si ya no hay cosas cargadas
    .then(() => {
      return new Promise((resolve, reject) => {
        Topic.collection.count({}, (err, count) => {
          if (err) reject(new Error(err))
          if (count) {
            console.log('Ya hay topics cargados (%s), salteando migración', count)
            reject(new SaltearPromises())
          }
          resolve()
        })
      })
    })
    // Agregamos admin user a partir de variables de config/compose
    .then(migratePPScript)
    // Devolvemos al Migrator (de lib/migrations)
    .then(() => {
      console.log(`-- Agregados attrs a topics`)
      done()
    })
    .catch((err) => {
      if (err instanceof SaltearPromises)
        done()
      else{
        console.log('-- Actualizacion de attrs a topics no funcionó! Error: ', err)
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
