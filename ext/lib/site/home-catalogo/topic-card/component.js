import React, { Component } from 'react'
import { Link, browserHistory } from 'react-router'
import moment from 'moment'
import userConnector from 'lib/site/connectors/user'
// import { config } from 'democracyos-notifier'
import config from 'lib/config'

const getSeguimientoStateLabel = (state) => {
  switch (state) {
    case 'preparacion':
      return 'Preparación'
      break
    case 'compra':
      return 'Contratación'
      break
    case 'ejecucion':
      return 'Ejecución'
      break
    case 'finalizado':
      return 'Finalizado'
      break
  }
}

export class TopicCard extends Component {
  handleWrapperClick = (e) => {
    // https://stackoverflow.com/questions/22119673/find-the-closest-ancestor-element-that-has-a-specific-class
    function findAncestor (el, cls) {
      while ((el = el.parentElement) && !el.classList.contains(cls));
      return el;
    }

    let targTag = e.target && e.target.tagName

    const isSeguirButton = findAncestor(e.target, 'cause-wrapper')
    const isProyectistaButton = findAncestor(e.target, 'proyectista-wrapper')
    const isVotarButton = findAncestor(e.target, 'votar-button-wrapper')
    if (!isSeguirButton && !isProyectistaButton && !isVotarButton)
      window.open(`${window.location.href}/topic/${this.props.topic.id}`, '_blank');
  }
  render() {
    const { topic, onVote, onProyectista, user, forum } = this.props

    const isStaff = !user.state.rejected && user.state.value.staff
    // ooo" ta step progress
    var tagProgress = topic.attrs['presupuesto-estado']
    try {
      tagProgress = tagProgress.replace("cion","ción")

    } catch (error) {
    }

    // "ooo
    // tipo de propuesta
    const isSistematizada = topic && topic.attrs && topic.attrs.state == 'sistematizada'
    const isIdeaProyecto = topic && topic.attrs && topic.attrs.state == 'idea-proyecto'
    const isProyecto = topic && topic.attrs && topic.attrs.state == 'proyecto'

    const isProyectista = !user.state.rejected && topic.proyectistas && topic.proyectistas.length > 0 && topic.proyectistas.includes(user.state.value.id)

    const likesCssClass = topic.voted ? 'voted' : (
      topic.privileges && topic.privileges.canVote && !isStaff ? 'not-voted' : 'cant-vote'
    )
    const likesCountDiv = (
      <div className='participants'>
        <span className='icon-like' />
        &nbsp;
        {topic.action.count}
      </div>
    )
    
    const subscribeCssClass = 'not-subscribed'
    const subscribesCountDiv = (
      <div className='participants'>
        <span className='icon-arrow-right' />
      </div>
    )
    function unTilder(pal){
      try {
        console.log('untilder',pal)
        pal = pal.replace("ción","cion")
        return pal
  
      } catch (error) {
      }
    }
    function capitalizeFirstLetter(str) {
      if (!str) return ''
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }
    // console.log(topic)
    return (
      <div className='ext-topic-card ideas-topic-card' onClick={this.handleWrapperClick}>
        <div className={`idea-${topic && topic.attrs && topic.attrs.state}`}>
          <div className='topic-card-info'>
            <div className='topic-card-attrs'>
              {topic.eje &&
                <span className='badge badge-default'>{topic.eje.nombre}</span>
              }
              {/*<span className={`estado ${topic.attrs.state}`}>{estados(topic.attrs.state)}</span>*/}
            </div>

            {!isProyecto && (isSistematizada || isIdeaProyecto ?
              <div className='topic-creation'>
                <span>Creado por: <span className='topic-card-author'>PP</span></span>
              </div>
              :
              <div className='topic-creation'>
                <span>Creado por: <span className='topic-card-author'>{topic.owner.firstName}</span></span>
                {topic.zona &&
                  <span className='topic-card-zona'>({topic.zona.nombre})</span>
                }
                {!topic.zona && topic.attrs && topic.attrs.zona && topic.attrs.zona != 'ninguna' &&
                <span className='topic-card-zona'>
                  ({this.props.zonas.length > 0 && this.props.zonas.find(f => f.value == topic.attrs.zona).name})
                </span>
                }
                <span
                  className={`date ${(topic.attrs.state !== 'pendiente') && 'space'}`}>
                  {moment(topic.createdAt).format('D-M-YYYY')}
                </span>
              </div>
            )}

            <h1 className={`topic-card-title ${isProyecto && 'mt-5'}`}>
              {isProyecto && topic.attrs &&
                <span className='topic-number'>#{topic.attrs.numero}</span>
              }
              {topic.mediaTitle}
            </h1>
            <p className='topic-card-description'>
              {createClauses(topic)}
            </p>
            {isProyecto && topic.attrs &&
              <div className='topic-card-presupuesto'>
                Monto estimado: ${topic.attrs['presupuesto-total'].toLocaleString()}
              </div>
            }
          </div>

          <div className='topic-card-footer'>
            <div className='topic-card-tags'>
              <span className="glyphicon glyphicon-tag"></span>
              { topic.tag && <span className='tag-wrapper' >{topic.tag.name}</span>} 
              {
                topic && topic.attrs && topic.attrs.state &&
                <span
                  className={`tag-wrapper tag-status-${topic.attrs.state}`} >
                  {capitalizeFirstLetter(topic.attrs.state)}
                </span>
                                  
              } 
              {
                topic && topic.attrs && topic.attrs.state && topic.attrs.state === 'ganador' && topic.attrs['presupuesto-estado'] &&
                <span
                  className={`tag-wrapper tag-status-${topic.attrs['presupuesto-estado']}`} >
                  {getSeguimientoStateLabel(topic.attrs['presupuesto-estado'])}
                </span>
                                  
              } 
            </div>

            <div className='buttons-wrapper'>
                  <div
                    className='proyectista-wrapper'>
                    {/* !isProyecto && forum.config.votacion && config.habilitarApoyo &&
                    <button
                      className={`btn ${isProyectista ? '' : 'not-voted' }` }
                      onClick={() => onProyectista(topic.id, !isProyectista)}
                      disabled={isProyectista}>
                    {isProyectista ? 'Te gusta' : 'Me gusta'}&nbsp;&nbsp;<span className='icon-like' /> {topic.proyectistas.length}
                    </button> */} 
                    <Link className='btn comment' to={`${window.location.href}/topic/${topic.id}`}>Ver más</Link>
                  </div>
            </div>

          </div>

        </div>
      </div>
    )
  }
}

function createClauses({ attrs, clauses }) {
  let div = document.createElement('div')
  let content
  if (!attrs) {
    content = clauses
      .sort(function (a, b) {
        return a.position > b.position ? 1 : -1
      })
      .map(function (clause) {
        return clause.markup
      })
      .join('')
  } else {
    if (attrs['proyecto-contenido']) {
      content = `${attrs['proyecto-contenido']}`
    } else if (attrs['solucion']){
      const { solucion } = attrs
      content = `${solucion}`
    } else {
      const { problema } = attrs
      content = `${problema}`
    }
  }
  div.innerHTML = content
  let returnText = div.textContent.replace(/\r?\n|\r/g, '')
  return returnText.length > 400 ? returnText.slice(0, 400) + '...' : returnText
}

export default userConnector(TopicCard)
