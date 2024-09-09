const utils = require('democracyos-notifier/lib/utils')
const template = require('./template')

const jobName = 'subscriber-update-proposal'
const log = require('debug')(`democracyos:notifier:${jobName}`)

module.exports = function subscriberUpdateProposal(notifier) {
  const { db, agenda, mailer } = notifier
  const users = db.get('users')

  agenda.define(jobName, { priority: 'normal' }, subscriberUpdateProposal)

  function subscriberUpdateProposal(job, done) {
    const data = job.attrs.data

    users.findOne({ "_id": data.topic.subscriber }).then((user) => {
      try {
        const html = template({
          topic: data.topic,
          userName: user.firstName//todo: add userName
        })
        mailer.send({
          to: user.email, //TODO: change for subscribers
          subject: `La propuesta "${data.topic.mediaTitle}" ha sido actualizada`,
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
