const config = require('lib/config')
const utils = require('lib/utils')
const urlBuilder = require('lib/url-builder')

const html = require('es6-string-html-template').html
// para inline-ar estilos css - https://github.com/Automattic/juice
const juice = require('juice');

const emailTemplate = require('ext/lib/notifier/responsive-html-email-template');
const buttonTemplate = require('ext/lib/notifier/responsize-email-button-template');

const baseUrl = utils.buildUrl(config)

module.exports = ({
  topic,
}) => {
  let topicRelativeUrl = urlBuilder.for('site.topic', { forum: config.forumProyectos, id: topic.id })
  return emailTemplate({
    body: html`
      <p>Hay una nueva idea sobre <strong>${topic.mediaTitle}</strong> en el presupuesto participativo de la Municipalidad General Pueyrredon.</p>
      <br />
      <h1>${topic.mediaTitle}</h1>
      <p>
      Nombre y apellido: ${topic.nombre}<br>
      Documento: ${topic.documento}<br>
      Teléfono: ${topic.telefono}<br>
      Email: ${topic.email}<br>
      </p>
      <h2>Barrio</h2>
      <p>${topic.barrio}</p>
      <h2>Tags</h2>
      <p>${topic.tags.join(', ')}</p>
      <h2>Problema</h2>
      <p>${topic.problema}</p>
      <h2>Solución</h2>
      <p>${topic.solucion}</p>
      <h2>Beneficios</h2>
      <p>${topic.beneficios}</p>
      <br />
      ${buttonTemplate({
        url: baseUrl + topicRelativeUrl,
        text: 'Ver propuesta'
      })}
      <p>Muchas gracias.</p>
    `
  })
}
