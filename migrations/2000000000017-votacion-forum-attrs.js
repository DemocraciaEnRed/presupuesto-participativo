const dbReady = require('lib/models').ready

const models = require('lib/models')
const Forum = models.Forum

const nombreMigrationParaLog = 'votación forum attrs'

const leaveOnlyFields = [
	'state',
	'admin-comment',
	'admin-comment-referencia',
	'problema'
]

const hideFields = [
	// 'state',
	'admin-comment',
	'admin-comment-referencia'
]

const newFields = [
	{
		"name": "genero",
		"title": "Genero del postulante",
		"description": "Opcional. El genero del postulante",
		"kind": "String",
		"mandatory": false,
		"groupOrder": 0,
		"group": "",
		"order": 3,
		"width": 6,
		"icon": "",
		"min": 1,
		"max": 256
	},
	{
		"name" : "numero",
		"title" : "Número",
		"description" : "El número identificador del proyecto",
		"kind" : "Number",
		"mandatory" : true,
		"groupOrder" : 0,
		"group" : "",
		"order" : 0,
		"width" : 6,
		"icon" : "",
		"min": 1,
		"max": 1000
	},
	{
		"name" : "presupuesto",
		"title" : "Presupuesto",
		"description" : "Sin comas ni puntos",
		"kind" : "Number",
		"mandatory" : true,
		"groupOrder" : 0,
		"group" : "",
		"order" : 1,
		"width" : 6,
		"icon" : "",
		"min": 1,
		"max": 1000 * 1000 * 1000 //1 billon
	}
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
		// updatear
    .then(() => {
      return new Promise((resolve, reject) => {
	      Forum.findOne({name: 'proyectos'}, (err, forumProyecto) => {
	        if (err)
            reject(new Error(err))
					if (!forumProyecto || !forumProyecto.topicsAttrs)
            reject(new Error('No forum proyectos or no topicAttrs in it found'))

					// por algún motivo no nos deja editar un item del array
					let copyAttrs = deepCopy(forumProyecto.topicsAttrs)

					// dejamos solo los que queremos (el resto borrados)
					copyAttrs = copyAttrs.filter(attr => leaveOnlyFields.includes(attr.name))

					// insertamos nuevos campos
					copyAttrs.push(...newFields)

					copyAttrs.forEach(attr => {
						// dejamos ocultos los marcados en hideFields
						// y otras modificaciones manuales posteriores
						if (hideFields.includes(attr.name)) {
							attr.hide = true
						}
						if (attr.name.indexOf('admin-comment') == 0){
							attr.group = ''
							attr.groupOrder = 0
						}else if (attr.name == 'zona') {
							attr.width = 4
							attr.description = ''
							attr.order = 2
						}else if (attr.name == 'problema') {
							attr.title = 'Texto del proyecto'
							attr.description = 'Se admiten hasta 340 caracteres'
							attr.max = 340
						}
					})

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

    // Todo OK
    .then(() => {
      console.log(`-- Migración ${nombreMigrationParaLog} exitosa`)
      done()
    })
    // Error
    .catch((err) => {
      console.log(`-- Migración ${nombreMigrationParaLog} no funcionó! Error: ${err}`)
      done(err)
    })
}

/**
 * Make any changes that UNDO the up function side effects here (if possible)
 */
exports.down = function down(done) {
  done();
};
