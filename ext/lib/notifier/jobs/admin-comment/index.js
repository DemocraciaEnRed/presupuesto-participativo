const t = require('t-component')
const log = require('debug')('democracyos:notifier:admin-comment')
const utils = require('democracyos-notifier/lib/utils')
const template = require('./template')

const jobName = 'admin-comment'

module.exports = function forgotPassword (notifier) {
  const { db, agenda, mailer } = notifier
  const users = db.get('users')

  agenda.define(jobName, { priority: 'high' }, (job, done) => {
    const data = job.attrs.data

    users.findOne({ _id: data.to }).then((user) => {
      if (!user)
        throw new Error(`User not found for id "${data.to}"`)

      const html = template({
        userName: user.firstName,
        topicTitle: data.topicTitle,
        adminComment: data.adminComment,
        topicUrl: data.topicUrl
      }, {
        lang: user.locale
      })

      log('Sending mail to %o', utils.emailAddress(user))
      return mailer.send({
        to: utils.emailAddress(user),
        subject: 'Recibiste un comentario del equipo de presupuesto participativo MGP!',
        html
      })
    }).then(() => { done() }).catch(err => {
      log('Error: %o', err)
      done(err)
    })
  })
}
