const config = require('lib/config')
const ObjectID = require('mongoose').Types.ObjectId
const dbReady = require('lib/models').ready

const User = require('lib/models').User
const Forum = require('lib/models').Forum

const {adminMail, adminPass, forumProyectos} = config

const adminData = {
  email: adminMail,
  username: adminMail,
  firstName: 'Admin',
  lastName: '',
  password: adminPass,
  re_password: adminPass,
  locale: 'es'
}
const forumProyectosData = {
  name: forumProyectos,
  title: 'Proyectos',
  owner: null
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
        User.collection.count({}, (err, count) => {
          if (err) reject(new Error(err))
          if (count) {
            console.log('Ya hay usuarixs cargados (%s), salteando migración', count)
            reject(new SaltearPromises())
          }
          resolve()
        })
      })
    })
    // Agregamos admin user a partir de variables de config/compose
    .then(() => {
      let adminUser = new User(adminData)
      adminUser.reference = adminData.reference
      adminUser.emailValidated = true
      return new Promise((resolve, reject) => {
        User.register(adminUser, adminData.password, function (err, user) {
          if (err) {
            console.error('add admin user failed at ', err)
            reject(new Error('add admin user failed'))
          }else{
            console.log('Saved admin user %s [%s]', user.email, user._id)
            resolve(user)
          }
        })
      })
    })
    // Agregamos forum principal (proyectos)
    .then((user) => {
      forumProyectosData.owner = user._id
      return new Promise((resolve, reject) => {
        let forumProyecto = new Forum(forumProyectosData)
        forumProyecto.save(err => {
          if (err) {
            console.error('add forum proyectos failed at ', err)
            reject(new Error('add forum proyectos failed'))
          }else{
            console.log('Saved forum proyectos [%s]', forumProyecto._id)
            resolve(forumProyecto)
          }
        })
      })
    })
    // Devolvemos al Migrator (de lib/migrations)
    .then(() => {
      console.log(`-- Agregados admin user y forum proyectos`)
      done()
    })
    .catch((err) => {
      if (err instanceof SaltearPromises)
        done()
      else{
        console.log('-- Actualizacion de admin user y forum proyectos no funcionó! Error: ', err)
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
