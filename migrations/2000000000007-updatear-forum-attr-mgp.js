const dbReady = require('lib/models').ready

const Forum = require('lib/models').Forum

const nombreMigrationParaLog = 'updatear forum attr mgp'

const groups = [
	{ name: '', order: 0},
	{ name: 'Datos del autor', order: 1},
]

const newFields = [
	{
		"name" : "genero",
		"title" : "Género",
		"kind" : "String",
		"mandatory" : true,
		"groupNum" : 1,
		"order" : 0,
		"width" : 6,
		"icon" : ""
	},
	{
		"name" : "problema",
		"title" : "Idea",
		"kind" : "LongString",
		"mandatory" : true,
		"groupNum" : 0,
		"icon" : "",
		"width" : 12,
		"order" : 32,
		"max" : 5000,
		"min" : 0
	}
]

const deleteFields = [
	'anio',
	'project-budget-preparacion',
	'project-budget-compra',
	'project-budget-ejecucion',
	'project-budget-finalizado',
	'nombre',
	'domicilio',
	'telefono',
	'email',
	// el form usa mediaTitle
	'titulo',
	'título',
	'barrio',
	'solucion',
	'beneficios',
	'description',
	'votos',
	'presentado',
	'beneficiario',
	// borramos estos también por si estaban mal cargados
	'problema',
	'genero'
]

const hideFields = [
	'state',
	'admin-comment',
	'admin-comment-referencia'
]

const deepCopy = obj => {
	return JSON.parse(JSON.stringify(obj))
}

/**
 * Make any changes you need to make to the database here
 */
class SaltearPromises { }
exports.up = function up (done) {
  dbReady()
		// - Mejor no chequear y borrar por si está mal cargado
    // Primero chequear si ya no hay cosas cargadas
    /*.then(() => {
      return new Promise((resolve, reject) => {
        Forum.collection.count({'topicsAttrs.name': generoField.name}, (err, count) => {
          if (err) reject(new Error(err))
          if (count) {
            console.log('Ya están cargados los nuevos campos, salteando migración')
            reject(new SaltearPromises())
          }
          resolve()
        })
      })
    })*/

		// updatear
    .then(() => {
      return new Promise((resolve, reject) => {
	      Forum.findOne({name: 'proyectos'}, (err, forumProyecto) => {
	        if (err) reject(new Error(err))
					if (!forumProyecto || !forumProyecto.topicsAttrs) reject(new Error('No forum proyectos or no topicAttrs in it found'))

					// borramos viejos
					// agarramos los indices a eliminar
					let deleteIs = forumProyecto.topicsAttrs
						.map((attr,i) => attr && deleteFields.includes(attr.name) && i)
						.filter(val => val !== false)

					// los eliminamos de atrás hacia adelante así no se mueven los índices
					deleteIs.reverse().forEach(i => forumProyecto.topicsAttrs.splice(i,1))

					// nuevos fields
					newFields.forEach(field => {
						let group = groups[field.groupNum || 0]
						field.group = group.name
						field.groupOrder = group.order
						delete field.groupNum

						forumProyecto.topicsAttrs.push(field)
					})

					// por algún motivo no nos deja editar un item del array
					const copyAttrs = deepCopy(forumProyecto.topicsAttrs)
					let hideIs = copyAttrs
						.map((attr,i) => attr && hideFields.includes(attr.name) && i)
						.filter(val => val !== false)
					for (let i=0; i<copyAttrs.length; i++)
						copyAttrs[i].hide = hideIs.includes(i)
						
					// borramos todo y volvemos a generar
					forumProyecto.topicsAttrs.splice(0)
					forumProyecto.topicsAttrs.push(...copyAttrs)

					forumProyecto.markModified('topicsAttrs')

					Forum.collection.save(forumProyecto, (err) => {
						if (err) reject(new Error(err))
						resolve()
					})
	      })
			})
		})
    // Todo OK (devolvemos al Migrator (de lib/migrations))
    .then(() => {
      console.log(`-- Migración ${nombreMigrationParaLog} exitosa`)
      done()
    })
    // Error
    .catch((err) => {
      if (err instanceof SaltearPromises)
        done()
      else{
	      console.log(`-- Migración ${nombreMigrationParaLog} no funcionó! Error: ${err}`)
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
