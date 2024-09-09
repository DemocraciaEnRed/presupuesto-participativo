const config = require('lib/config')
const utils = require('lib/utils')

const html = require('es6-string-html-template').html
// para inline-ar estilos css - https://github.com/Automattic/juice
const juice = require('juice');

const emailTemplate = require('ext/lib/notifier/responsive-html-email-template');
const buttonTemplate = require('ext/lib/notifier/responsize-email-button-template');

const baseUrl = utils.buildUrl(config)

module.exports = ({
  userName, resetPasswordUrl
}, {
  lang
}) => emailTemplate({
  body: html`
    <p>Hola <strong>${userName}</strong>,</p>
    <p>Recibimos una solicitud para reestablecer tu contraseña. Hacé click en el siguiente botón para terminar el proceso:</p>
    ${buttonTemplate({
      url: resetPasswordUrl,
      text: 'Reestablecer contraseña'
    })}
    <p>O copiá y pegá en tu navegador este link: <a href="${resetPasswordUrl}">${resetPasswordUrl}</a></p>
    <p><i>PD: si no solicitaste reestablecer tu contraseña podés ignorar este correo.</i></p>
  `
})
