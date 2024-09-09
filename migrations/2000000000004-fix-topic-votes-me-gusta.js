const dbReady = require('lib/models').ready

const models = require('lib/models')
const Topic = models.Topic
const Vote = models.Vote

/**
 * Make any changes you need to make to the database here
 */
class SaltearPromises { }
exports.up = function up (done) {
  dbReady()
    .then(() => Topic.find({'action.method': ''}))
		.then(topics =>
			topics.map(topic =>
				Vote.count({topic: topic.id, value : "apoyo-idea"}).then(count => {
					topic.action.count = count
					//console.log(topic.id, count)
					topic.save()
				})
			)
		)
    .then(promises => Promise.all(promises))
    // Devolvemos al Migrator (de lib/migrations)
    .then(() => {
      console.log(`-- Actualizados fix topic votes`)
      done()
    })
    .catch((err) => {
      if (err instanceof SaltearPromises)
        done()
      else{
        console.log('-- Actualizacion fix topic votes no funcionó! Error: ', err)
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
