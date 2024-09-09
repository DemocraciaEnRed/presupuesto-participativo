const dbReady = require('lib/models').ready

const models = require('lib/models')
const Forum = models.Forum

const nombreMigrationParaLog = 'Se agregan campos: telefono, solucion, beneficios, barrio, ubicacion al forum para expandir las nuevas ideas'


const newFields = [
	{
		"name" : "telefono",
		"title" : "Teléfono celular",
		"description" : "Únicamente será para contactarse por dudas o avances sobre la idea.",
		"kind" : "String",
		"mandatory" : false,
		"groupOrder" : 0,
		"group" : "",
		"order" : 33,
		"width" : 6,
		"icon" : "",
		"min": 0,
		"max": 340,	
	},
	{
		"name" : "barrio",
		"title" : "Barrio",
		"description" : "Escribe el barrio",
		"kind" : "String",
		"mandatory" : false,
		"groupOrder" : 0,
		"group" : "",
		"order" : 34,
		"width" : 6,
		"icon" : "",
		"min": 0,
		"max": 340,	
	},
	{
		"name" : "ubicacion",
		"title" : "Ubicación",
		"description" : "Calle y número en caso de que el proyecto tenga ubicación concreta",
		"kind" : "String",
		"mandatory" : false,
		"groupOrder" : 0,
		"group" : "",
		"order" : 35,
		"width" : 12,
		"icon" : "",
		"min": 0,
		"max": 340,	
	},	
	{
		"name" : "solucion",
		"title" : "Propuesta de Solución",
		"description" : "Tenga en cuenta que solo se veran los primeros 400 caracteres en la portada",
		"kind" : "LongString",
		"mandatory" : true,
		"groupOrder" : 0,
		"group" : "",
		"order" : 36,
		"width" : 12,
		"icon" : "",
		"min": 0,
		"max": 8000 // 1 billon
	},	
	{
		"name" : "beneficios",
		"title" : "Beneficios para el barrio",
		"description" : "¿Como ayuda este proyecto al barrio? ¿Quiénes se benefician?",
		"kind" : "LongString",
		"mandatory" : false,
		"groupOrder" : 0,
		"group" : "",
		"order" : 37,
		"width" : 12,
		"icon" : "",
		"min": 0,
		"max": 8000 // 1 billon
	},		
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

					let copyAttrs = deepCopy(forumProyecto.topicsAttrs)

					copyAttrs.forEach(attr => {
						// Modificaciones manuales
						if (attr.name == 'problema') {
							attr.title = 'Problema o necesidad existente'
							attr.description = "¿Qué problemas querés resolver? ¿a quiénes afecta? ¿Cómo?"
						}
					})

					// insertamos nuevos campos
					copyAttrs.push(...newFields)


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
