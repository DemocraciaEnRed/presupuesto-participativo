const dbReady = require('lib/models').ready

const Forum = require('lib/models').Forum

const newFields = [
	{ "name": "order", "defaultValue": 0},
	{ "name": "group", "defaultValue": 'Grupo 1' },
	{ "name": "groupOrder", "defaultValue": 0 },
	{ "name": "width", "defaultValue": 6 },
	{ "name": "icon" }
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
    .then(() => {
      return new Promise((resolve, reject) => {
				Forum.findOne({name: 'proyectos'}, (err, forumProyecto) => {

          if (err) reject(new Error(err))
					if (!forumProyecto || !forumProyecto.topicsAttrs) reject(new Error('No forum proyectos or no topicAttrs in it found'))

					forumProyecto.topicsAttrs.forEach((topicAttr, i) => {
						let updTopicAttr = deepCopy(topicAttr)
						newFields.forEach((field) => {
							updTopicAttr[field.name] = field.defaultValue || null
						})
						updTopicAttr["order"] = i

						//console.log(updTopicAttr)
						forumProyecto.topicsAttrs[i] = updTopicAttr
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
      console.log(`-- Agregados extended forum topic attrs`)
      done()
    })
    .catch((err) => {
      if (err instanceof SaltearPromises)
        done()
      else{
        console.log('-- Actualizacion de extended forum topic attrs no funcionó! Error: ', err)
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
