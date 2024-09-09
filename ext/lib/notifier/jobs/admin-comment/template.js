const config = require('lib/config')
const utils = require('lib/utils')

const html = require('es6-string-html-template').html
// para inline-ar estilos css - https://github.com/Automattic/juice
const juice = require('juice');

const emailTemplate = require('ext/lib/notifier/responsive-html-email-template');
const buttonTemplate = require('ext/lib/notifier/responsize-email-button-template');

const baseUrl = utils.buildUrl(config)

module.exports = ({
  userName, topicTitle, adminComment, topicUrl
}, {
  lang
}) => emailTemplate({
  body: html`
    <p>Hola <strong>${userName}</strong>,</p>
    <p>Tu idea <strong>${topicTitle}</strong> recibió el siguiente comentario del equipo de presupuesto participativo MGP:
     <div style='padding:15px;border-radius: 5px;'><i>${adminComment}</i></div>
     <br />
     ${buttonTemplate({
       url: topicUrl,
       text: 'Ver comentario'
     })}
  `
})
