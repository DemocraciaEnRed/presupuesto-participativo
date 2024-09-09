import React, { Component } from 'react'
import { browserHistory } from 'react-router'
import bus from 'bus'
import config from 'lib/config'
import forumStore from 'lib/stores/forum-store/forum-store'
import topicStore from 'lib/stores/topic-store/topic-store'
import userConnector from 'lib/site/connectors/user'
import topicConnector from 'lib/site/connectors/topic'
//import TopicArticleProyecto from './topic-article-proyecto/component'
import TopicArticleIdea from './topic-article-idea/component'
import Jump from 'ext/lib/site/jump-button/component'
import Anchor from 'ext/lib/site/anchor'
import Footer from 'ext/lib/site/footer/component'

export class TopicLayout extends Component {
  constructor (props) {

    if(props.params.forum == "proyectos")
      window.location.href = window.location.href.replace("/proyectos/", "/propuestas/")

    super(props)

    this.state = {
      forum: null,
      name: null
    }
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.topic) Anchor.goTo('container')
    if (nextProps.params.forum !== this.state.name) {
      this.setState({
        name: nextProps.params.forum
      })
    }
  }

  componentDidMount () {
    let name = this.props.params.forum

    if (!name && !config.multiForum) {
      name = config.defaultForum
    }

    forumStore.findOneByName('proyectos')
      .then((forum) => {
        this.setState({
          forum: forum,
          name: name
        })
      })
      .catch((err) => {
        if (err.status === 404) {
          window.location = '/404'
          return
        }

        throw err
      })
  }

  goTop () {
    Anchor.goTo('container')
  }

  // esta misma función está en ext/lib/site/home-catalogo/component.js
  handleVote = (id, isVoted) => {
    const { user } = this.props

    if (user.state.rejected) {
      return browserHistory.push({
        pathname: '/signin',
        query: { ref: window.location.pathname }
      })
    }

    //topicStore.vote(id, !isVoted ? 'apoyo-idea' : 'no-apoyo-idea').then((res) => {
    topicStore.vote(id, 'voto').then((res) => {
      location.reload()
    }).catch((err) => { throw err })
  }

  render () {
    if (config.visibility === 'hidden' && this.props.user.state.rejected) {
      browserHistory.push('/signin')
      return null
    }

    const { topic } = this.props
    const { forum, name } = this.state
    if (!topic || !forum) return null
    return (
      <div className={`ext-topic-container ${this.props.user.state.fulfilled ? 'user-logged' : ''}`}>
        <Anchor id='container'>
          <div id='topic-wrapper'>
            { <TopicArticleIdea topic={topic} forum={forum} onVote={this.handleVote} />
              /*name === 'propuestas'
                ? <TopicArticleIdea topic={topic} forum={forum}/>
                : <TopicArticleProyecto topic={topic} forum={forum} />*/
            }
          </div>
          <Jump goTop={this.goTop} />
          <Footer />
        </Anchor>
      </div>
    )
  }
}

export default userConnector(topicConnector(TopicLayout))
