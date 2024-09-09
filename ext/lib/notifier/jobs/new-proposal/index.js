const utils = require('democracyos-notifier/lib/utils')
const template = require('./template')

const jobName = 'new-proposal'
const subject = 'Nueva propuesta en Presupuesto Participativo'
const log = require('debug')(`democracyos:notifier:${jobName}`)

module.exports = function newProposal(notifier) {
  const { db, agenda, mailer } = notifier
  const topics = db.get('topics')

  agenda.define(jobName, { priority: 'normal' }, newProposalJob)
  // agenda.define('signup', { priority: 'high' }, newProposalJob)
  // agenda.define('resend-validation', { priority: 'high' }, newProposalJob)

  function newProposalJob(job, done) {
    const data = job.attrs.data
    try {
      const html = template({
        topic: data.topic,
      })
      mailer.send({
        to: process.env.NOTIFICATIONS_MAILER_EMAIL,
        subject,
        html
      })
      done()
    } catch (err) {
      log('Error: %o', err)
      done(err)
    }
    // topics.findOne({ mediaTitle: data.topic.mediaTitle }).then((topic) => {
    //   if (!topic) throw new Error(`Topic not found with mediaTitle "${data.topic.mediaTitle}"`)

    //   const html = template({
    //     topicName: data.topic.mediaTitle,
    //   })

    //   return mailer.send({
    //     to: 'guillermocroppi@gmail.com',
    //     subject,
    //     html
    //   })
    // }).then(() => { done() }).catch(done)

}

}
