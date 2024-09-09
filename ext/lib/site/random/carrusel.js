import React, { Component } from 'react'
import forumStore from 'lib/stores/forum-store/forum-store'
import topicStore from 'lib/stores/topic-store/topic-store'
import TopicCard from './topic-card/component'


class HomeConsultas extends Component {
  constructor (props) {
    super(props)

    this.state = {
      proyectos: null
    }
  }

  componentDidMount = () => {
    forumStore.findOneByName('consultas')
      .then((forum) => Promise.all([
        forum,
        topicStore.findAll({ forum: forum.id })
      ]))
      .then(([forum, proyectos]) => {

        }

        this.setState({
          proyectos
        })

      })
      .catch((err) => { throw err })
  }


  fetchTopics = () => {
    topicStore.findAll({ forum: this.state.forum.id })
      .then((topics) => {
        this.setState({
          topics: filter(this.state.filter, topics)
        })
      })
      .catch((err) => { throw err })
  }

  handleFilterChange = (key) => {
    topicStore.findAll({ forum: this.state.forum.id })
      .then((topics) => {
        this.setState({
          filter: key,
          topics: filter(key, topics)
        })
      })
      .catch((err) => { throw err })
  }

  render () {
    const { forum, topics } = this.state

    return (
      <div className='ext-home-consultas'>
        <Cover
          background='/ext/lib/site/boot/consultas.jpg'
          logo='/ext/lib/site/home-multiforum/consultas-icono.png'
          title='Consultas'
          description='Queremos conocer tu opinión sobre diferentes temas. Elegí la mejor opción para la ciudad.' />
        <div className='container'>

          // {topics && topics.length === 0 && (
          //   <div className='empty-msg'>
          //     <div className='alert alert-success' role='alert'>
          //       {filters[this.state.filter].emptyMsg}
          //     </div>
          //   </div>
          // )}
        </div>
        {topics && topics.length > 0 && (
          <div className='topics-section'>
            <div className='topics-container'>
              {topics.map((topic) => {
                return <TopicCard key={topic.id} forum={forum} topic={topic} />
              })}
            </div>
          </div>
        )}
      </div>
    )
  }
}

)

export default HomeConsultas
