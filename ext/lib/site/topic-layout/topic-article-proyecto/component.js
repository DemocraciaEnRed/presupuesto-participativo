import React, { Component } from 'react'
import {Link} from 'react-router'
import bus from 'bus'
import t from 't-component'
import urlBuilder from 'lib/url-builder'
import userConnector from 'lib/site/connectors/user'
import Header from './header/component'
import Content from './content/component'
import Footer from './footer/component'
import Social from './social/component'
import Vote from './vote/component'
import Poll from './poll/component'
import Cause from './cause/component'
import Comments from './comments/component'
import AdminActions from './admin-actions/component'
import Proyectos from 'ext/lib/site/proyectos/component'
import DefaultContent from './default-content/component'
import RelatedProposals from './related-proposals/component'
import Subscribe from './subscribe/component'

class TopicArticle extends Component {
  constructor (props) {
    super(props)

    this.state = {
      showSidebar: false,
      relatedProposals: null
    }
  }

  componentWillMount () {
    bus.on('sidebar:show', this.toggleSidebar)
  }

  componentDidMount () {
    window.fetch(`/ext/api/topics?forumName=proyectos&related=${this.props.topic.id}&state=integrado`, {
      credentials: 'include'
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.results.topics.length > 0) {
          this.setState({
            relatedProposals: res.results.topics
          })
        }
      })
      .catch((err) => console.error(err))
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

  getEstado (name) {
    switch (name) {
      case 'no-ganador':
        return 'no ganador'
        break
      case 'preparacion':
        return 'en preparación'
        break
      case 'compra':
        return 'en contratación'
        break
      case 'ejecucion':
        return 'en ejecución'
        break
      case 'finalizado':
        return 'finalizado'
        break
      default:
        return 'factible'
        break
    }
  }

  getBudget = (state) => {
    switch (state) {
      case 'preparacion':
        return 'project-budget-preparacion'
        break
      case 'compra':
        return 'project-budget-compra'
        break
      case 'ejecucion':
        return 'project-budget-ejecucion'
        break
      case 'finalizado':
        return 'project-budget-finalizado'
      default:
        return false
    }
  }
  handleCreateTopic = () => {
    window.location = urlBuilder.for('admin.topics.create', {
      forum: this.props.forum.name
    })
  }

  twitText = () => {
    switch (this.props.topic.attrs.state) {
      case 'pendiente':
      return encodeURIComponent('Apoyemos este proyecto para mejorar la Municipalidad General Pueyrredon. ')
      case 'perdedor':
      return encodeURIComponent(this.props.topic.mediaTitle)
      case 'proyectado':
      return encodeURIComponent('Este proyecto se va a realizar gracias a la participación ciudadana de la Municipalidad General Pueyrredon. ')
      default:
      return ''
    }
  }

  render () {
    const {
      topic,
      forum,
      user
    } = this.props

    const userAttrs = user.state.fulfilled && (user.state.value || {})
    const canCreateTopics = userAttrs.privileges &&
      userAttrs.privileges.canManage &&
      forum &&
      forum.privileges &&
      forum.privileges.canChangeTopics

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

    return (
      <div className='topic-article-wrapper'>
        {
          this.state.showSidebar &&
            <div onClick={hideSidebar} className='topic-overlay' />
        }
        <div className='cover' style={{ backgroundImage: `url(${topic.coverUrl ? topic.coverUrl : 'ext/lib/site/VialCosteroVteLopezImgBanner.jpg'})` }}></div>
        <Header
          closingAt={topic.closingAt}
          closed={topic.closed}
          author={topic.attrs.nombre ? topic.attrs.nombre : topic.author}
          authorUrl={topic.authorUrl}
          relatedAuthors={this.state.relatedProposals && this.state.relatedProposals.map((p) => p.attrs.nombre)}
          tags={topic.tags}
          forumName={forum.name}
          mediaTitle={topic.mediaTitle} />
          <div className='container-project-admin-actions'>
        <AdminActions forum={forum} topic={topic} />
          </div>
        {topic.clauses && topic.clauses.length > 0 ?
          <Content twitterText={twitterText} socialLinksUrl={socialLinksUrl} lat={topic.attrs.lat} long={topic.attrs.long} barrio={topic.attrs.barrio} anio={topic.attrs.anio} clauses={topic.clauses} presupuesto={topic.attrs.state} topicState={topic.attrs.state} budget={topic.attrs[this.getBudget(topic.attrs.state)]} votos={topic.attrs.votos}/> :
          <DefaultContent
            problema={topic.attrs.problema}
            solucion={topic.attrs.solucion}
            beneficios={topic.attrs.beneficios}
          />
        }
        { topic.attrs.album && topic.attrs.album.length > 0 && (
            <div className='topic-album-wrapper'>
              <div className='topic-album'>
                <h4>Álbum de imágenes</h4>
                  {
                      topic.attrs.album.split(/\n/).map((url) => <a href={url} target='_blank'><img src={url}/></a>)
                  }
              </div>
            </div>
          )}
        {
          topic.links && (
            <Footer
              source={topic.source}
              links={topic.links}
              socialUrl={topic.url}
              title={topic.mediaTitle} />
          )
        }
        {topic.attrs.state !== 'pendiente' && topic.attrs.state !== 'no-factible' && (topic.attrs.anio === '2019' || topic.attrs.anio === '2020') &&
          <RelatedProposals id={topic.id} relatedProposals={this.state.relatedProposals}/>
        }
         <Subscribe
            topic={topic}/>
        <Social
          topic={topic}
          twitterText={twitterText}
          socialLinksUrl={socialLinksUrl} />
        <div className='topic-tags topic-article-content' style={{textAlign: 'center'}}>
          {
            this.props.topic.tags && this.props.topic.tags.map((tag, i) => <a href={`${window.location.origin}${urlBuilder.for('site.forum', { forum: this.props.forum.name })}?tag=${tag}`} key={i}>#{tag}</a>)
          }
        </div>
        {
          !user.state.pending && <Comments forum={forum} topic={topic} />
        }
        <Proyectos />
      </div>
    )
  }
}

export default userConnector(TopicArticle)

function hideSidebar () {
  bus.emit('sidebar:show', false)
}
