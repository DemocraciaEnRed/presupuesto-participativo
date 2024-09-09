import React, { Component } from 'react'
import { Link, browserHistory } from 'react-router'
import config from 'lib/config'
import forumStore from 'lib/stores/forum-store/forum-store'
import textStore from 'lib/stores/text-store'
import topicStore from 'lib/stores/topic-store/topic-store'
import userConnector from 'lib/site/connectors/user'
import tagStore from 'lib/stores/tag-store/tag-store'
import zonaStore from 'lib/stores/zona-store'
import TopicCard from './topic-card/component'
import BannerListadoTopics from 'ext/lib/site/banner-listado-topics/component'
import FilterPropuestas from './filter-propuestas/component'
import Jump from 'ext/lib/site/jump-button/component'
import Footer from 'ext/lib/site/footer/component'
import Anchor from 'ext/lib/site/anchor'
// https://www.npmjs.com/package/react-select/v/2.4.4
import Select from 'react-select'; // ! VERSIÓN 2.4.4 !


const defaultValues = {
  limit: 20,
  zona: [],
  tag: [],
  // 'barrio' o 'newest' o 'popular'
  sort: '',
  tipoIdea: []
}

const filters = {
  popular: {
    text: 'Más Populares',
    sort: 'popular',
  },
  newest: {
    text: 'Más Recientes',
    sort: 'newest',
  },
}

class HomePropuestas extends Component {
  constructor () {
    super()
    this.state = {
      forum: null,
      texts:{},
      topics: null,

      zonas: [],
      zona: defaultValues.zona,
      tags: [],
      tag: defaultValues.tag,
      tiposIdea: [],
      sort: defaultValues.sort,
      tipoIdea: defaultValues.tipoIdea,

      page: null,
      noMore: null,

      selectedProyecto: null,

      archive: false,
      years: [],
      kwords: ''
    }
    

    this.handleInputChange = this.handleInputChange.bind(this)
    this.renderSortFilter = this.renderSortFilter.bind(this)
    this.handleInputSearch = this.handleInputSearch.bind(this)
  }

  componentDidMount () {
    const {archive, years} = this.props;
    window.scrollTo(0,0)
    if (this.props.location.query.tags)
      defaultValues.tag.push(this.props.location.query.tags)

    // igual que filtros de admin (lib/admin/admin/admin.js)
    Promise.all([
      zonaStore.findAll(),
      tagStore.findAll({field: 'name'}),
      forumStore.findOneByName('proyectos'),
      textStore.findAllDict(),
      topicStore.findAllProyectos()
    ]).then(results => {
      const [zonas, tags, forum, textsDict] = results
      const tagsMap = tags.map(tag => { return {value: tag.id, name: tag.name}; });
      const tag = this.props.location.query.tags ? [tagsMap.find(j => j.name == this.props.location.query.tags).value] : [];
      const tiposIdea = forum.topicsAttrs.find(a => a.name=='state').options.map(state => { return {value: state.name, name: state.title}; })
      const tipoIdea = forum.config.ideacion ? ['pendiente'] : forum.config.preVotacion || forum.config.votacion ? ['factible'] : forum.config.seguimientoNormal ? ['ganador'] : []
      this.setState({
        zonas: zonas.map(zona => { return {value: zona._id, name: zona.nombre}; }),
        tags: tagsMap,
        tag,
        tiposIdea,
        tipoIdea: archive ? ['ganador'] : tipoIdea,
        forum,
        texts:textsDict,
        years,
      }, () => this.fetchTopics())
    }).catch((err) => { throw err })
  }

  fetchTopics = (page) => {
    page = page || 1
    let query = {
      forumName: config.forumProyectos,
      page: page.toString(),
      limit: defaultValues.limit.toString(),

      zonas: this.state.zona,
      tags: this.state.tag,
      sort: this.state.sort,
      tipoIdea: this.state.tipoIdea,
      years: this.state.years,
      kwords: this.state.kwords
    }

    let queryString = Object.keys(query)
      .filter((k) => query[k] && query[k].length > 0)
      .map((k) => `${k}=${ Array.isArray(query[k]) ?  query[k].join(',') : query[k] }`)
      .join('&')

    return window
      .fetch(`/ext/api/topics?${queryString}`, {credentials: 'include'})
      .then((res) => res.json())
      .then((res) => {
        let topics = res.results ? res.results.topics : []
        const noMore = res.pagination ? page >= res.pagination.pageCount : true
        // pagination contiene: count, page, pageCount, limit

        // How to Randomize (shuffle) a JavaScript Array
        // https://www.w3docs.com/snippets/javascript/how-to-randomize-shuffle-a-javascript-array.html
        // function shuffleArray(array) {
        //   let curId = array.length;
        //   // There remain elements to shuffle
        //   while (0 !== curId) {
        //     // Pick a remaining element
        //     let randId = Math.floor(Math.random() * curId);
        //     curId -= 1;
        //     // Swap it with the current element.
        //     let tmp = array[curId];
        //     array[curId] = array[randId];
        //     array[randId] = tmp;
        //   }
        //   return array;
        // }
        // topics = shuffleArray(topics)

        this.setState(prevState => ({
          topics: page == 1 ? topics : prevState.topics.concat(topics),
          page: page,
          noMore: noMore,
        }))
        return topics
      })
      .catch((err) => console.error(err))
  }

  // función cuando hacés click en "Ver Más"
  paginateForward = () => {
    const page = this.state.page + 1
    this.fetchTopics(page)
  }

  changeTopics () {
    this.fetchTopics(this.state.page)
      .then((res) => {
        this.setState({ topics: res })
      })
      .catch((err) => { console.error(err) })
  }

  handleInputChange = (evt) => {
    evt.preventDefault()
    const { value, name } = evt.target
    this.setState({
      [name]: value,
      page: 1
    }, () => this.changeTopics())
  }

  handleFilter = (filter, value) => {
      // If the value is not included in the filter array, add it
      if (!this.state[filter].includes(value)) {
        this.setState({
          [filter]: [...this.state[filter], value]
        }, () => this.fetchTopics())
        // If it's already included and it's the only filter applied, apply default filters
      /* } else if (this.state[filter].length === 1) {
        this.clearFilter(filter) */
        // If it's already included erase it
      } else {
        this.setState({
          [filter]: [...this.state[filter]].filter((item) => item !== value)
        }, () => this.fetchTopics())
      }

  }

  handleDefaultFilter = (filter, value) => {
    this.setState({
      [filter]: [value]
    }, () => this.fetchTopics())
  }

  // Clear all selected items from a filter
  clearFilter = (filter) => {
    this.setState({
      [filter]: []
    }, () => this.fetchTopics())
  }

  // esta misma función está en ext/lib/site/topic-layout/component.js
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
      const topics = this.state.topics
      const index = topics.findIndex((t) => t.id === id)
      topics[index] = res
      user.fetch(true).then(() => this.setState({ topics }))
    }).catch((err) => { throw err })
  }

  handleProyectista = (id, hacerProyectista) => {
    const { user } = this.props

    if (user.state.rejected) {
      return browserHistory.push({
        pathname: '/signin',
        query: { ref: window.location.pathname }
      })
    }

    topicStore.updateProyectista(id, hacerProyectista).then((res) => {
      const topics = this.state.topics
      const index = topics.findIndex((t) => t.id === id)
      topics[index] = res
      this.setState({ topics })
    }).catch((err) => { throw err })
  }

  handleRemoveBadge = (option) => (e) => {
    // feísimo, feísimo
    if (this.state.zona.includes(option)){
      this.setState({ zona: this.state.zona.filter(i => i != option) }
      ,() => this.fetchTopics());
    }else if (this.state.tag.includes(option)){
      this.setState({ tag: this.state.tag.filter(i => i != option) }
      ,() => this.fetchTopics());
    }else if (this.state.tipoIdea.includes(option)){
      this.setState({ tipoIdea: this.state.tipoIdea.filter(i => i != option) }
      ,() => this.fetchTopics());
    }
  }

  onChangeSortFilter = (key) => {
    this.setState({ sort: key }, () => this.fetchTopics());
  }

  goTop () {
    Anchor.goTo('container')
  }

  onChangeTipoIdeaFilter = (name) => {
    this.setState({ tipoIdea: name }, () => this.fetchTopics());
  }

  renderSortFilter() {
    const {forum} = this.state 
    return (
      <div>
        {forum && <h4 className="topics-title">{
          !forum.config.seguimientoNormal ? 
          (forum.config.propuestasAbiertas ? "Lista de ideas" : "Lista de ideas y proyectos") : 
          "Lista de proyectos"
        }
        </h4>}
        <div className='topics-filters'>
          {/*this.state.forumStates &&
            <div className='topics-filter topics-state-filter'>
              <span>Mostrar ideas</span>
              {this.state.forumStates.map((state) => (
                  <button
                    key={state.name}
                    className={`btn-sort-filter ${this.state.tipoIdea === state.name ? 'active' : ''}`}
                    onClick={() => this.onChangeTipoIdeaFilter(state.name)}>
                    <span className="glyphicon glyphicon-ok" />
                    {
                      (state.name == 'pendiente' && 'Originales') ||
                      (state.name == 'sistematizada' && 'Sistematizadas') ||
                      state.title
                    }
                  </button>
                ))}
            </div>
          */}
          {this.state.topics && this.state.topics.length > 0 &&
            <div className='topics-filter topics-sort-filter'>
              <span>Ordenar por</span>
              {Object.keys(filters).map((key) => (
                  <button
                    key={key}
                    className={`btn-sort-filter ${this.state.sort === key ? 'active' : ''}`}
                    onClick={() => this.onChangeSortFilter(filters[key].sort)}>
                    <span className="glyphicon glyphicon-ok" />
                    {filters[key].text}
                  </button>
                ))}
            </div>
          }
        </div>
      </div>
    )
  }

  handleInputTextKeyDown = (event) =>{
    if(event.keyCode === 13){
      this.handleInputSearch()
    }
  }

  handleInputSearch = () => {
    const {kwords} = this.state
    this.fetchTopics();
  }

  render () {

    const { forum, topics, zonas, kwords, selectedProyecto, texts} = this.state
    const {archive} = this.props
    let filteredTopics;
    if (selectedProyecto)
      filteredTopics = topics.filter(t => t.id == selectedProyecto.value)
    
    return (
      <div className={`ext-home-ideas ${this.props.user.state.fulfilled ? 'user-logged' : ''}`}>
        <Anchor id='container'>
          {forum && <BannerListadoTopics
          btnText={(!archive && forum.config.propuestasAbiertas) ? 'Subí tu idea' : undefined}
          btnLink={(!archive && forum.config.propuestasAbiertas) ? '/formulario-idea' : undefined}
            title={
              archive ? texts['archivo-title'] : texts['idea-title']
            }
            subtitle={" "}
            />}

          <div className='container'>
            {forum && <div className="row">
              {archive ? <div className='notice'>
                      <h1>{texts['archivo-subtitle']}</h1>
                    </div> : 
                    <div className='notice'>
                      <h1>{texts['idea-subtitle']}</h1>
                    </div>
               
              }

            </div>}
          </div>


          <div className='container topics-container'>
            <FilterPropuestas
              zonas={this.state.zonas}
              zona={this.state.zona}
              tags={this.state.tags}
              tag={this.state.tag}
              tiposIdea={this.state.tiposIdea}
              tipoIdea={this.state.tipoIdea}
              openVotation={true}
              handleFilter={this.handleFilter}
              handleDefaultFilter={this.handleDefaultFilter}
              clearFilter={this.clearFilter}
              handleRemoveBadge={this.handleRemoveBadge} />

            <div className='row'>
              <div className='col-md-10 offset-md-1'>
                <div className='search-proyecto-wrapper'>
                  {/* para esto usamos react-select version 2.4.4 */}
                  <input
                    value={kwords}
                    onChange={(e) => this.setState({kwords: e.target.value})}
                    onKeyDown={this.handleInputTextKeyDown}
                    placeholder='Buscá un proyecto por nombre'
                    className='form-control search-proyecto-select'
                    />
                    
                  
                  <button onClick={this.handleInputSearch}>
                    Buscar
                  </button>
                        
                </div>

                {  this.renderSortFilter() }
                {topics && topics.length === 0 && (
                  <div className='empty-msg'>
                    <div className='alert alert-success' role='alert'>
                      No se encontraron ideas. <br/>
                      si queres ver el seguimiento de ideas de años anteriores entra a <Link href="/archivo"> Archivo </Link>
                    </div>
                  </div>
                )}
                {topics && (filteredTopics || topics).map((topic) => (
                  <TopicCard
                    key={topic.id}
                    onVote={this.handleVote}
                    onProyectista={this.handleProyectista}
                    forum={forum}
                    topic={topic}
                    zonas={zonas} />
                ))}
                {!filteredTopics && topics && !this.state.noMore && (
                  <div className='more-topics'>
                    <button onClick={this.paginateForward}>Ver Más</button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <Jump goTop={this.goTop} />
          <Footer />
        </Anchor>
      </div>
    )
  }
}

export default userConnector(HomePropuestas)
