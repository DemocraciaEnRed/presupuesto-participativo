const config = require('lib/config')
const utils = require('lib/utils')

const html = require('es6-string-html-template').html
// para inline-ar estilos css - https://github.com/Automattic/juice
const juice = require('juice');

const emailTemplate = require('ext/lib/notifier/responsive-html-email-template');
const buttonTemplate = require('ext/lib/notifier/responsize-email-button-template');

const baseUrl = utils.buildUrl(config)

module.exports = ({
  topic, userName
}) => emailTemplate({
  body: html`
    <p>Hola <strong>${userName}</strong>,</p>
    <p>El proyecto <strong>${topic.mediaTitle}</strong> ha sido actualizado.
    ${buttonTemplate({
      url: `${baseUrl}/proyecto/topic/${topic.id}`,
      text: 'Mirá los cambios'
    })}
    <p>¡Sigamos mejorando juntos la Municipalidad General Pueyrredon!</p>
  `
})
