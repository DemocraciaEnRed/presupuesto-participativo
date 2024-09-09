const dbReady = require('lib/models').ready

const Forum = require('lib/models').Forum

const groups = [
	{ name: '', order: 0},
	{ name: 'Presupuestos', order: 1},
	{ name: 'Datos del autor', order: 2},
	{ name: 'Información de la propuesta', order: 3}
]

const presentadoField = {
	"name" : "presentado",
	"title" : "Presentado por",
	"kind" : "Enum",
	"groupNum" : 0,
	"mandatory" : false,
	"order" : 1,
	"width" : 6,
	"icon" : "",
	"options" : [
		{
			"name" : "persona",
			"title" : "Persona",
			"_id" : "5e3c5c944324aca40d6727b6"
		},
		{
			"name" : "institucion",
			"title" : "Institución",
			"_id" : "5e3c5c944324aca40d6727b5"
		}
	]
}

const benefisiarioField = {
	"name" : "beneficiario",
	"title" : "Beneficiarios principales",
	"kind" : "String",
	"groupNum" : 0,
	"mandatory" : false,
	"order" : 1,
	"width" : 6,
	"icon" : ""
}

const newFields = [presentadoField, benefisiarioField]

const deepCopy = obj => {
	return JSON.parse(JSON.stringify(obj))
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
        Forum.collection.count({'topicsAttrs.name': presentadoField.name}, (err, count) => {
          if (err) reject(new Error(err))
          if (count) {
            console.log('Ya están cargados los nuevos campos, salteando migración')
            reject(new SaltearPromises())
          }
          resolve()
        })
      })
    })
    .then(() => {
      return new Promise((resolve, reject) => {
	      Forum.findOne({name: 'proyectos'}, (err, forumProyecto) => {
	        if (err) reject(new Error(err))
					if (!forumProyecto || !forumProyecto.topicsAttrs) reject(new Error('No forum proyectos or no topicAttrs in it found'))

					newFields.forEach(field => {
						let group = groups[field.groupNum || 0]

						field.group = group.name
						field.groupOrder = group.order
						delete field.groupNum

						forumProyecto.topicsAttrs.push(field)
					})

					forumProyecto.markModified('topicsAttrs')

					Forum.collection.save(forumProyecto, (err) => {
						if (err) reject(new Error(err))
						resolve()
					})
	      })
			})
		})
    // Devolvemos al Migrator (de lib/migrations)
    .then(() => {
      console.log(`-- Actualizados nuevos campos en forum topic attrs`)
      done()
    })
    .catch((err) => {
      if (err instanceof SaltearPromises)
        done()
      else{
        console.log('-- Actualizacion nuevos campos en forum topic attrs no funcionó! Error: ', err)
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
