const utils = require('democracyos-notifier/lib/utils')
const template = require('./template')

const jobName = 'subscriber-update-project'
const log = require('debug')(`democracyos:notifier:${jobName}`)

module.exports = function subscriberUpdateProject(notifier) {
  const { db, agenda, mailer } = notifier
  const users = db.get('users')

  agenda.define(jobName, { priority: 'normal' }, subscriberUpdateProject)

  function subscriberUpdateProject(job, done) {
    const data = job.attrs.data

    users.findOne({ "_id": data.topic.subscriber }).then((user) => {
      try {
        const html = template({
          topic: data.topic,
          userName: user.firstName//todo: add userName
        })
        mailer.send({
          to: user.email, //TODO: change for subscribers
          subject: `El proyecto "${data.topic.mediaTitle}" ha sido actualizado`,
          html
        })
      } catch (err) {
        console.error(err)
      }
    }).then(() => {
      done()
    }).catch(err => {
      log('Error: %o', err)
      done(err)
    })
  }
}
