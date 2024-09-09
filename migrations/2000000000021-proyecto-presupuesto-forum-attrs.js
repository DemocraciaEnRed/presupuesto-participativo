const dbReady = require('lib/models').ready

const models = require('lib/models')
const Forum = models.Forum

const nombreMigrationParaLog = 'Proyecto y Presupuesto forum attrs'

const newFields = [
	{
		"name": "proyecto-visibilidad",
		"title": "Visibilidad de proyecto",
		"description": "Solo hacer visible aquellas ideas que avancen a etapa de proyecto o sean factibles",
		"kind": "Enum",
		"mandatory": false,
		"groupOrder": 1,
		"group": "2. Proyecto",
		"order": 0,
		"width": 12,
		"icon": "",
		"options" : [
			{
				"name" : "oculto",
				"title" : "Oculto"
			},
			{
				"name" : "visible",
				"title" : "Visible"
			}			
		]		
	},
	{
		"name": "proyecto-titulo",
		"title": "Titulo del Proyecto",
		"description": "Se admiten hasta 340 caracteres",
		"kind": "String",
		"mandatory": false,
		"groupOrder": 1,
		"group": "2. Proyecto",
		"order": 1,
		"width": 12,
		"icon": "",
		"min": 0,
		"max": 340,	
	},
	{
		"name": "proyecto-contenido",
		"title": "Contenido del Proyecto",
		"description": "Se admiten hasta 5000 caracteres",
		"kind": "LongString",
		"mandatory": false,
		"groupOrder": 1,
		"group": "2. Proyecto",
		"order": 2,
		"width": 12,
		"icon": "",
		"min" : 0,
		"max" : 5000,
	},
	{
		"name": "proyecto-estado",
		"title": "Estado",
		"description": "Agregar una descripción del estado del proyecto",
		"kind": "Enum",
		"mandatory": false,
		"groupOrder": 1,
		"group": "2. Proyecto",
		"order": 3,
		"width": 12,
		"icon": "stop.png",
		"options" : [
			{
				"name" : "no-ganador",
				"title" : "No ganador"
			},
			{
				"name" : "ganador",
				"title" : "Ganador"
			}
		]		
	},
	{
		"name": "presupuesto-estado",
		"title": "Estado",
		"description": "Agregar una descripción del estado del presupuesto",
		"kind": "Enum",
		"mandatory": false,
		"groupOrder": 2,
		"group": "3. Presupuesto",
		"order": 0,
		"width": 12,
		"icon": "stop.png",
		"options" : [
			{
				"name" : "preparacion",
				"title" : "En Preparación"
			},
			{
				"name" : "compra",
				"title" : "En Contratación"
			},
			{
				"name" : "ejecucion",
				"title" : "En Ejecución"
			},
			{
				"name" : "finalizado",
				"title" : "Finalizado"
			}
		]		
	},		
	{
		"name" : "presupuesto-preparacion",
		"title" : "Preparación",
		"description" : "Sin comas ni puntos",
		"kind" : "Number",
		"mandatory" : false,
		"groupOrder" : 2,
		"group" : "3. Presupuesto",
		"order" : 2,
		"width" : 6,
		"icon" : "",
		"min": 1,
		"max": 1000 * 1000 * 1000 //1 billon
	},
	{
		"name" : "presupuesto-compra",
		"title" : "Compra",
		"description" : "Sin comas ni puntos",
		"kind" : "Number",
		"mandatory" : false,
		"groupOrder" : 2,
		"group" : "3. Presupuesto",
		"order" : 3,
		"width" : 6,
		"icon" : "",
		"min": 1,
		"max": 1000 * 1000 * 1000 //1 billon
	},
	{
		"name" : "presupuesto-ejecucion",
		"title" : "Ejecución",
		"description" : "Sin comas ni puntos",
		"kind" : "Number",
		"mandatory" : false,
		"groupOrder" : 2,
		"group" : "3. Presupuesto",
		"order" : 4,
		"width" : 6,
		"icon" : "",
		"min": 1,
		"max": 1000 * 1000 * 1000 //1 billon
	},
	{
		"name" : "presupuesto-finalizado",
		"title" : "Finalizado",
		"description" : "Sin comas ni puntos",
		"kind" : "Number",
		"mandatory" : false,
		"groupOrder" : 2,
		"group" : "3. Presupuesto",
		"order" : 5,
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

					let copyAttrs = deepCopy(forumProyecto.topicsAttrs)

					copyAttrs.forEach(attr => {
						// Modificaciones manuales
						if (attr.name.indexOf('presupuesto') == 0){
							attr.name = 'presupuesto-total'
							attr.title = 'Presupuesto Total'
							attr.group = '3. Presupuesto'
							attr.groupOrder = 2
							attr.order = 1
							attr.width = 12
						}else if (attr.name == 'state') {
							attr.width = 6
							attr.hide = false
							attr.description = 'Agregar una descripción del estado de la idea'
							attr.options = [
								{
									"name" : "pendiente",
									"title" : "Pendiente"
								},
								{
									"name" : "no-factible",
									"title" : "No factible"
								},
								{
									"name": "integrado",
									"title": "Integrada"
								},								
								{
									"name" : "factible",
									"title" : "Factible"
								},
								{
									"name" : "ganador",
									"title" : "Ganadora"
								},								
							]
						}else if (attr.name == 'admin-comment') {
							attr.hide = false
							attr.title = 'Comentario del Moderador'
							attr.descripion = "Escribir aquí un comentario en el caso que se cambie el estado a \"Factible\" o \"No factible\""
						}else if (attr.name == 'admin-comment-referencia') {
							attr.hide = false
						}else if (attr.name == 'genero') {
							attr.hide = true
						}else if (attr.name == 'numero') {
							attr.title = "Número identificador de la idea"
						}else if (attr.name == 'problema') {
							attr.title = 'Texto de la idea'
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
