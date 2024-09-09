import React, { Component } from 'react'
import { Link } from 'react-router'

const states = [
  { 'name': 'estimado', 'value': 'preparacion', 'title': 'En preparación', },
  { 'name': 'a ejecutar', 'value': 'compra', 'title': 'En contratación' },
  { 'name': 'en ejecución', 'value': 'ejecucion', 'title': 'En ejecución' },
  { 'name': 'ejecutado', 'value': 'finalizado', 'title': 'Finalizado' }
]

function prettyPrice (number) {
  if (!number) return ''
  return `$${prettyDecimals(number)}`
}

function prettyDecimals (number) {
  if (typeof number === 'number') number = String(number)
  if (typeof number !== 'string') return ''
  if (number.length <= 3) return number

  number = number.split('').reverse().join('').match(/[0-9]{1,3}/g)

  return (number || [])
    .join('.')
    .split('')
    .reverse()
    .join('')
}

export default class Content extends Component {
  render () {
    function createClauses (clauses) {
      return {
        __html: clauses
          .sort(function (a, b) {
            return a.position > b.position ? 1 : -1
          })
          .map(function (clause) {
            return clause.markup
          })
          .join('')
          .replace(/<a/g, '<a rel="noopener noreferer" target="_blank"')
      }
    }
    return (
      <div className='entry-content topic-article-content skeleton-proyecto'>
        { this.props.topicState !== 'factible' && this.props.topicState !== 'no-ganador' && (
          <div className='topic-article-content proyecto-ganador'>
            <div className='box-header'>
              <div className={'topic-status status-active-' + this.props.topicState}>
                <span>Estado: <b>{states.find((st) => st.value === this.props.presupuesto).title}</b></span>
                <ul className='progress-bar'>
                  <li className='item-preparacion'></li>
                  <li className='item-compra'></li>
                  <li className='item-ejecucion'></li>
                  <li className='item-finalizado'><span>&#10004;</span></li>
                </ul>
              </div>
            </div>
            <div className='box-content'>
              <div className='topic-info'>
                <span className='topic-year'><b>AÑO:</b> {this.props.anio}</span>
                { this.props.lat && this.props.long ? (
                  <a href={`http://maps.google.com/maps?q=${this.props.lat},${this.props.long}`} target='_blank' className='topic-location'><b>{this.props.barrio}</b></a>
                ) : (
                  <span className='topic-location unavailable'><b>{this.props.barrio}</b></span>
                )}
              </div>
              <div className='box-content-item'>
                <span className='box-content-title'>Presupuesto {states.find((st) => st.value === this.props.presupuesto).name}:</span>
                <span className='box-content-info'>{prettyPrice(this.props.budget)}</span>
              </div>
              <div className='box-content-item'>
                <span className='box-content-title'>Cantidad de votos:</span>
                <span className='box-content-info'>{this.props.votos}</span>
              </div>
              <div className='box-content-social'>
                <a href={`mailto:?body=${this.props.socialLinksUrl}`} className='social-mail'></a>
                <a target='_blank' href={`http://www.facebook.com/sharer.php?u=${this.props.socialLinksUrl}`} rel='noopener noreferrer' className='social-facebook'></a>
                <a target='_blank' href={`http://twitter.com/share?text=${this.props.twitterText}&url=${this.props.socialLinksUrl}`} rel='noopener noreferrer' className='social-twitter'></a>
                {/* <a className='social-instagram'></a> */}
                <a target='_blank' href={`https://www.linkedin.com/shareArticle?url=${this.props.socialLinksUrl}`} className='social-linkedin'></a>
              </div>
            </div>
            <div className='box-footer'>
              <span className='hashtag'>#PresupuestoParticipativoVteLopez</span>
            </div>
            <Link
              to='/s/datos'
              className='ver-resu'>
                  Ver los resultados de la votación aquí
            </Link>
          </div>
        )
        }

        <div
          className='clauses'
          dangerouslySetInnerHTML={createClauses(this.props.clauses)} />
      </div>
    )
  }
}
