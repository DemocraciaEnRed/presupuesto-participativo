const utils = require('democracyos-notifier/lib/utils')
const template = require('./template')

const jobName = 'update-proposal'
const log = require('debug')(`democracyos:notifier:${jobName}`)

module.exports = function updateProposal(notifier) {
  const { db, agenda, mailer } = notifier

  agenda.define(jobName, { priority: 'normal' }, updateProposal)

  function updateProposal(job, done) {
    const data = job.attrs.data
    try {
      const html = template({
        topic: data.topic,
      })
      mailer.send({
        to: data.topic.authorEmail,
        subject: `${data.topic.mediaTitle}: ¡Tu propuesta ha sido actualizada!`,
        html
      })
      done()
    } catch (err) {
      log('Error: %o', err)
      done(err)
    }
  }
}
