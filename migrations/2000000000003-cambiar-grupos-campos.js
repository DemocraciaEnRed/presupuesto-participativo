const dbReady = require('lib/models').ready

const Forum = require('lib/models').Forum

const defaultsData = [
	{ "name": "group", "defaultValue": '' },
	{ "name": "groupOrder", "defaultValue": 0 },
	{ "name": "width", "defaultValue": 6 },
	{ "name": "icon" }
]
const defaultsDataKeyd = {}
defaultsData.forEach(attr => defaultsDataKeyd[attr.name] = attr)

const attrsData = [
	{name: 'lat', order: 5 },
	{name: 'long', order: 6 },
	{name: 'subscribers', order: 7, width: 12 },
	{name: 'album', order: 8, width: 12 }
]
const attrsDataKeyd = {}
attrsData.forEach(attr => attrsDataKeyd[attr.name] = attr)

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
							// nuevo
							let newAttrData = attrsDataKeyd[topicAttr.name]
							if (!newAttrData) return
							// copia
							let updTopicAttr = deepCopy(topicAttr)

							updTopicAttr.order = newAttrData.order
							updTopicAttr.width = newAttrData.width || defaultsDataKeyd.width
							updTopicAttr.group = newAttrData.group || defaultsDataKeyd.group
							updTopicAttr.groupOrder = newAttrData.groupOrder || defaultsDataKeyd.groupOrder

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
      console.log(`-- Agregados cambiar grupos campos`)
      done()
    })
    .catch((err) => {
      if (err instanceof SaltearPromises)
        done()
      else{
        console.log('-- Actualizacion de cambiar grupos campos no funcionó! Error: ', err)
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
