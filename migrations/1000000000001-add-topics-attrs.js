// Script traído de ext/bin/migrate-pp.js
const config = require('lib/config')
const ObjectID = require('mongoose').Types.ObjectId
const dbReady = require('lib/models').ready
const Topic = require('lib/models').Topic
const Forum = require('lib/models').Forum

const newTopicsAttrs = require('ext/lib/site/formulario-propuesta/campos.json')
const barrios = [
  'villa-martelli', 'villa-adelina', 'vicente-lopez', 'olivos',
  'munro', 'la-lucila', 'florida-oeste', 'florida-este', 'carapachay'
]

const topicDescription = (topic) => {
  if (topic.attrs.solucion === undefined) {
    return topic.attrs.problema
  } else if (topic.attrs.solucion.length > 512) {
    return topic.attrs.solucion.substring(0, 509).concat('...')
  } else {
    return topic.attrs.solucion
  }
}

const migratePPScript = () => {
  const migraProyectos = Promise.all([
      Forum.find({ 'name': { $in: barrios } }).exec(),
      Forum.find({ 'name': 'proyectos' }).exec()
    ])
    .then(([barrios, [ proyectos ]]) => {
      const barriosIds = barrios.map((b) => b.id)
      return Topic.find({ forum: { $in: barriosIds } })
        .then((topics) => {
          return {
            topics: topics,
            barrios: barrios,
            proyectos: proyectos
          }
        })
    })
    .then(({ topics, barrios, proyectos }) => {
      const changedTopics = topics.map((topic) => {
        const barrioName = barrios.find((barrio) => barrio.id === topic.forum.toString()).name
        const changeState = (state) => {
          let newState = null
          switch (state) {
            case 'pendiente':
              newState = 'factible'
              break
            case 'proyectado':
              newState = 'preparacion'
              break
            case 'perdedor':
              newState = 'no-ganador'
          }
          return newState
        }
        topic.set('attrs.barrio', barrioName)
        topic.set('forum', proyectos.id)
        topic.set('attrs.state', changeState(topic.attrs.state))
        return topic.save()
      })
      return Promise.all(changedTopics)
    })
    .then((changedTopics) => { console.log('Proyectos actualizados!') })

  const mirgaPropuestas = Promise.all([
    Forum.find({ 'name': 'proyectos' }).exec(),
    Forum.find({ 'name': 'propuestas' }).exec()
  ])
    .then(([[ proyectos ], [ propuestas ]]) => {
      return Topic.find({ 'forum': propuestas && propuestas.id })
        .then((topics) => {
          return {
            topics: topics,
            forum: proyectos
          }
        })
    })
    .then(({ topics, forum }) => {
      const savedTopics = topics.map((topic) => {
        topic.set('forum', forum.id)
        topic.set('attrs.anio', '2018')
        topic.set('attrs.budget', 0)
        topic.set('attrs.votes', 0)
        topic.set('attrs.description', topicDescription(topic))
        return topic.save()
      })
      return Promise.all(savedTopics)
    })
    .then((savedTopics) => { console.log('Propuestas actualizadas!') })

  const nuevosCampos = Forum.find({ 'name': 'proyectos' }).exec()
    .then(([ forum ]) => {
      forum.set('topicsAttrs', newTopicsAttrs)
      return forum.save()
    })
    .then((forum) => {
      console.log('Foro proyectos actualizado!')
   })

   return Promise.all([migraProyectos, mirgaPropuestas, nuevosCampos])
    /*.then((newTopics) => {
      process.exit(0)
    })
    .catch((err) => {
      console.error(err)
      process.exit(1)
    })*/
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
