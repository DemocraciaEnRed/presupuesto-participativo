import React, { Component } from 'react'
import bus from 'bus'
import t from 't-component'
import urlBuilder from 'lib/url-builder'
import userConnector from 'lib/site/connectors/user'
import Header from './header/component'
import Social from './social/component'
import Cause from './cause/component'
import Comments from './comments/component'
import { Link } from 'react-router'
import VotarButton from 'ext/lib/site/home-catalogo/topic-card/votar-button/component'
import VerTodosButton from 'ext/lib/site/home-catalogo/topic-card/ver-todos-button/component'
import config from 'lib/config'
import Collapsible from 'react-collapsible'
import StepProgress from './step-progress/component'
class TopicArticle extends Component {
  constructor (props) {
    super(props)

    this.state = {
      showSidebar: false
    }
  }

  componentWillMount () {
    bus.on('sidebar:show', this.toggleSidebar)
  }

  componentDidUpdate () {
    document.body.scrollTop = 0
  }

  componentWillUnmount () {
    bus.off('sidebar:show', this.toggleSidebar)
  }

  toggleSidebar = (bool) => {
    this.setState({
      showSidebar: bool
    })
  }

  handleCreateTopic = () => {
    window.location = urlBuilder.for('admin.topics.create', {
      forum: this.props.forum.name
    })
  }

  handleBarrio = (barrio) => {
    const barrios = {
    }
    let barrioName = ''
    Object.keys(barrios).find((key) => {
      if (barrio === key) {
        barrioName = barrios[key]
      }
    })
    return barrioName
  }
// ooo" habria que agregar el estado ganador a este switch
  getEstado (name) {
    switch (name) {
      case 'pendiente':
        return 'pendiente'
        break
      case 'no-factible':
        return 'no factible'
        break
      case 'integrado':
        return 'integrada'
        break
      default:
        return 'factible'
        break
    }
  }

  twitText = () => {
    return encodeURIComponent('Sumate a pensar la Ciudad que queremos. ')
  }

  render () {
    const {
      topic,
      forum,
      user,
      onVote
    } = this.props

    const userAttrs = user.state.fulfilled && (user.state.value || {})
    const canCreateTopics = userAttrs.privileges &&
      userAttrs.privileges.canManage &&
      forum &&
      forum.privileges &&
      forum.privileges.canChangeTopics
    const isProyecto = topic && topic.attrs && ['factible', 'ganador'].indexOf(topic.attrs.state) > -1
    const ideasIntegradas = topic && topic.integradas
    const isIntegrada = topic && topic.attrs && topic.attrs.state === 'integrado'
    const section = window.location.href.includes("propuestas") ? "propuestas" : "archivo"
    const referenciaIntegradoraUrl = topic && topic.attrs && topic.attrs['admin-comment-referencia'] && window.location.origin + `/${section}/topic/` + topic.attrs['admin-comment-referencia']

    if (!topic) {
      return (
        <div className='no-topics'>
          <p>{t('homepage.no-topics')}</p>
          {
            canCreateTopics && (
              <button
                className='btn btn-primary'
                onClick={this.handleCreateTopic} >
                {t('homepage.create-debate')}
              </button>
            )
          }
        </div>
      )
    }

    const socialLinksUrl = window.location.origin + topic.url
    const twitterText = this.twitText()

    const editUrl = userAttrs.staff ?
      urlBuilder.for('admin.topics.id', {forum: forum.name, id: topic.id})
    :
      `/formulario-idea/${topic.id}#acerca-propuesta`
    ;

    // ooo" delete me after test
    // console.log("Content of Topic>>>\n", topic)
    // console.log("Content of attrs>>>\n", topic.attrs['presupuesto-estado'])

    const buttons = <div className='topic-actions topic-article-content'>
    { forum.config.votacion ? 
    <VotarButton /> : 
    !isProyecto && <Cause
    topic={topic}
    canVoteAndComment={forum.privileges.canVoteAndComment} /> }
    &nbsp;
    <VerTodosButton />
  </div>

    return (
      <div className='topic-article-wrapper'>
        {
          this.state.showSidebar &&
            <div onClick={hideSidebar} className='topic-overlay' />
        }
        
        <Header
          closingAt={topic.closingAt}
          closed={topic.closed}
          author={null}
          authorUrl={null}
          tags={topic.tags}
          forumName={forum.name}
          mediaTitle={topic.mediaTitle}
          numero={topic.attrs && topic.attrs.numero} />
        

        <div className='topic-article-content entry-content skeleton-propuesta'>

          <div className='topic-article-status-container'>
            {
              (forum.privileges && forum.privileges.canChangeTopics)
                ? (
                  <div className='topic-article-content topic-admin-actions'>
                    <Link href={editUrl}>
                      <a className='btn btn-default'>
                        <i className='icon-pencil' />
                        &nbsp;
                        Editar proyecto
                      </a>
                    </Link>
                  </div>
                )
                : (topic.privileges && topic.privileges.canEdit) &&

                  (
                    <div className='topic-article-content topic-admin-actions'>
                      <a
                        href={editUrl}
                        className='btn btn-default'>
                        <i className='icon-pencil' />
                          &nbsp;
                        Editar proyecto
                      </a>
                    </div>
                  )

            }
          </div>


          <div className="seccion-contenido">
            {/* ooo" stepProgress */}
            {/* <Collapsible 
                  open={true} 
                  triggerClassName='topic-article-proyecto' 
                  triggerOpenedClassName='topic-article-proyecto' 
                  trigger={`Proyecto final`}>
                </Collapsible> */}
          {/* <Collapsible
            trigger="Seguimiento"> */}
            {/* ooo" hay que chequear si es ganador sin ono debe mostrarse */}
            {/* {console.log(topic.attrs)} */}
  {       topic.attrs.state == 'ganador' &&
            <div id='content-all-progress'>
              <StepProgress 
                  completeState={topic.attrs}
                />
              </div>}
          {/* </Collapsible> */}

            <div>
              {
                topic.attrs['proyecto-contenido'] &&
                <Collapsible 
                  open={true} 
                  triggerClassName='topic-article-proyecto' 
                  triggerOpenedClassName='topic-article-proyecto' 
                  trigger={`Proyecto final`}>
                  <div className='topic-article-author'><span>Autor/es/as:</span> {topic.owner.fullName}</div>
                  {topic.attrs['presupuesto-total'] && <div>Presupuesto asignado: <span>${topic.attrs['presupuesto-total'].toLocaleString()}</span></div>}
                  <div className='topic-article-zona'><span>{topic.zona.nombre}</span></div>

                  {topic.attrs['proyecto-contenido'].replace(/https?:\/\/[a-zA-Z0-9./]+/g, '<a href="$&" rel="noopener noreferer" target="_blank">$&</a>')}
                </Collapsible>
              }        

              {isProyecto && buttons}

              <Collapsible 
                open={true} 
                triggerClassName='topic-article-idea' 
                triggerOpenedClassName='topic-article-idea' 
                trigger={`Idea Original`}>

                {topic.attrs['solucion'] ? 
                <div>
                  <div className="row">
                      <div className="col-md-6">
                        {topic.zona.nombre}
                      </div>
                      <div className="col-md-6">
                        <strong>Autor/as/es:</strong> {topic.owner.fullName}
                      </div>
                    <hr />
                    <div className="col-md-12">
                      <strong>Problema:</strong>
                      <p>{topic.attrs['problema'].replace(/https?:\/\/[a-zA-Z0-9./]+/g)}</p>
                    </div>
                    <div className="col-md-12">
                      <strong>Solución:</strong>
                      <p>{topic.attrs['solucion'].replace(/https?:\/\/[a-zA-Z0-9./]+/g)}</p>
                    </div>
                    <div className="col-md-12">
                      <strong>Beneficios:</strong>
                      <p>{topic.attrs['beneficios'].replace(/https?:\/\/[a-zA-Z0-9./]+/g)}</p>
                    </div>
                  </div>
                </div> : 
                topic.attrs['problema'].replace(/https?:\/\/[a-zA-Z0-9./]+/g)}



                {isIntegrada && referenciaIntegradoraUrl && 
                  <div className='topic-article-integrado'>
                    <u className='titulo'>Podés ver el proyecto final integrador</u>
                    <Link to={referenciaIntegradoraUrl} target="_blank">
                    <a className='btn link'>aquí</a>  
                    </Link>
                  
                  </div>
                }
                {isProyecto && ideasIntegradas.length > 0 && 
                  <div className='topic-article-integrado'>
                    <u className='titulo'>Ideas integradas</u> <br />
                    {ideasIntegradas.map((idea) => <Link to={idea.id} target="_blank">
                      <a className='btn link'>{idea.mediaTitle}</a>  
                    </Link>
                    )}
                  </div>
                }                            
              </Collapsible>

              {!isProyecto && buttons}

              {
                topic.attrs['admin-comment'] &&
                <Collapsible 
                  open={true} 
                  triggerClassName='topic-article-comentario' 
                  triggerOpenedClassName='topic-article-comentario' 
                  trigger={`Comentarios del moderador`}>
                  {topic.attrs['admin-comment'].replace(/https?:\/\/[a-zA-Z0-9./]+/g)}                
                  <p className='font-weight-bold'>Equipo de Coordinación y Gestión PPMGP</p>
                </Collapsible>            
              }

            </div>
          </div>
        </div>
        <Social
          topic={topic}
          twitterText={twitterText}
          socialLinksUrl={socialLinksUrl} />
        <div className='topic-tags topic-article-content'>
          {
            this.props.topic.tag && <span className='topic-article-tag'>{ this.props.topic.tag.name } </span>
          }
        </div>

        { (topic.privileges && !topic.privileges.canEdit && user.state.value && topic.owner.id === user.state.value.id) &&
            (
              <p className='alert alert-info alert-propuesta'>
                El estado de ésta propuesta fue cambiado a {this.getEstado(topic.attrs.state)}, por lo tanto ya no puede ser editada por su autor/a.
              </p>
            )
        }

        {
          topic.extra && topic.extra.album && topic.extra.album.length > 0 && <div className="topic-article-content">
          <div className='topic-article-album'>
            <h3>Album de imágenes</h3>
            {
              forum.privileges && forum.privileges.canChangeTopics && (
                <div style={{marginBottom: '10px'}}>
                  <a href={urlBuilder.for('admin.topics.id.album', { id: topic.id, forum: forum.name })} className=''>
                    ✏️ Agregar o editar imagenes
                  </a>
                </div>
              )
            }
            <div className="row">
              {
              topic.extra && topic.extra.album && topic.extra.album.length > 0 && topic.extra.album.map((image, i) => (
                  <div className='col-md-4 col-sm-3 col-xs-6' key={i}>
                    <a href={image} target="_blank">
                      <div className='topic-article-album-image' style={{backgroundImage: `url(${image})`}} />
                    </a>
                  </div>
                // <div className="gallery-item" key={i}>
                //   <a href={image.url} target="_blank">
                //     <img src={image.thumbnailUrl} className="gallery-image" />
                //   </a>
                // </div>
                ))
              }
              {
                (!topic.extra || (topic.extra && !topic.extra.album) || (topic.extra && !topic.extra.album && topic.extra.album.length === 0)) && 
                <div className='col-md-12 col-xs-12 col-sm-12 '>
                  No hay imágenes en este album
                </div>
              }
            </div>
          </div>
        </div>
        }
        

        {
          !user.state.pending && !isProyecto && <Comments forum={forum} topic={topic} />
        }
      </div>
    )
  }
}

export default userConnector(TopicArticle)

function hideSidebar () {
  bus.emit('sidebar:show', false)
}
