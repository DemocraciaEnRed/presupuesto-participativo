import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import Badges from './badges/component'

export default class FilterPropuestas extends Component {
  constructor (props) {
    super(props)

    this.state = {
      activeDropdown: null,
      clearedFilters: []
    }
  }

  componentWillMount () {
    document.addEventListener('click', this.handleClick, false)
  }

  componentWillUnmount () {
    document.removeEventListener('click', this.handleClick, false)
  }

  // Close dropdown if clicked outside
  handleClick = (e) => {
    if ((!ReactDOM.findDOMNode(this).contains(e.target) || e.target.id === 'filter') && this.state.activeDropdown !== null) {
      this.setState({
        activeDropdown: null
      })
    }
  }

  handleDropdown = (id) => (e) => {
    // Show or hide the options div
    e.preventDefault()
    this.setState({
      activeDropdown: this.state.activeDropdown === id ? null : id
    })
  }

  // Send filter to parent component
  // onClick en una opción; filter=state/barrio/etc.
  handleFilter = (filter) => (e) => {
    // key de la opción
    const value = e.target.value
    const isCleared = this.state.clearedFilters.includes(filter)
    if (isCleared) {
      this.setState({
        clearedFilters: this.state.clearedFilters.filter((it) => it !== filter)
      }, this.props.handleDefaultFilter(filter, value))
    } else if (this.props[filter].length === 1 && this.props[filter].includes(value)) {
      this.setState({
        clearedFilters: this.state.clearedFilters.concat(filter)
      }, this.props.handleFilter(filter, value))
    } else {
      this.setState({
        clearedFilters: this.state.clearedFilters.filter((it) => it !== filter)
      }, this.props.handleFilter(filter, value))
    }
  }

  // Clear all selected items from a filter
  clearFilter = (filter) => (e) => {
    this.props.clearFilter(filter)
    this.setState({ activeDropdown: null })
    if (!this.state.clearedFilters.includes(filter)){
      this.setState({
        clearedFilters: this.state.clearedFilters.concat(filter)
      })
    }
  }

  render () {
    //console.log('Render filters')

    const {
      zona, zonas,
      tags, tag,
      tiposIdea, tipoIdea,
      handleRemoveBadge
    } = this.props

    let allActiveOpts = []
    // explicando un poco las operaciones que siguen:
    // - los "..." expanden el array que devuelve el map, sino pushearía un
    //   array adentro de un array, y no sus elementos
    // - el .map(.find().name) hace la conversión de keys a values
    //   p.ej. barrio contiene keys, y para mostrar su formato para humanos hay
    //   que buscar la key dentro de barrios
    if (zona.length)
      allActiveOpts.push(
        ...zona.sort().map(i => ({ value: i, name: zonas.find(j => j.value==i).name }))
      )
    if (tag.length && tags.length)
      allActiveOpts.push(
        ...tag.sort().map(i => ({ value: i, name: tags.find(j => j.value==i).name }))
      )
    if (tipoIdea.length && tiposIdea.length)
      allActiveOpts.push(
        ...tipoIdea.sort().map(i => ({ value: i, name: tiposIdea.find(j => j.value==i).name }))
      )

    return (
      <nav id='filter-propuestas'>
        <div className='filters-nav center'>
          <FilterBox
            name='zona'
            title='Zona'
            allOptions={zonas.sort(function(a, b) {
              const y = a.name.split("Zona ")[1]
              const z = b.name.split("Zona ")[1]
              return y-z;
            })}
            activeOptions={zona}
            tabIndex="110"
            activeDropdown={this.state.activeDropdown}
            clearedFilters={this.state.clearedFilters}
            handleDropdown={this.handleDropdown}
            handleFilter={this.handleFilter}
            clearFilter={this.clearFilter}
            />
          <FilterBox
            name='tag'
            title='Tema'
            allOptions={tags}
            activeOptions={tag}

            activeDropdown={this.state.activeDropdown}
            clearedFilters={this.state.clearedFilters}
            handleDropdown={this.handleDropdown}
            handleFilter={this.handleFilter}
            clearFilter={this.clearFilter}
            />
          <FilterBox
            name='tipoIdea'
            title='Tipo de idea'
            allOptions={tiposIdea.map(tipo => {
              let newName = "Ideas " + tipo.name + "s"
              if (tipo.value === "factible") {
                newName += " - a votar "  
              }
              const newOpt = {
                value: tipo.value,
                name: newName 
              }
              return newOpt
            })}
            activeOptions={tipoIdea}

            activeDropdown={this.state.activeDropdown}
            clearedFilters={this.state.clearedFilters}
            handleDropdown={this.handleDropdown}
            handleFilter={this.handleFilter}
            clearFilter={this.clearFilter}
            />

        </div>

        {allActiveOpts.length != 0 &&
          <Badges options={allActiveOpts} handleRemove={handleRemoveBadge} />
        }

      </nav>
    )
  }
}

class FilterBox extends Component {
  constructor (props) {
    super(props)
  }

  render () {
    const {
      name, title, allOptions, activeOptions,
      activeDropdown, clearedFilters,
      handleDropdown, handleFilter, clearFilter
    } = this.props

    const hasSelection = !clearedFilters.includes(name)

    return (
      <div className={`button-container ${ name }`} 
        aria-controls="custom-select"
        aria-expanded={activeDropdown === name}>

        <button className='dropdown-button' onClick={ handleDropdown(name) }>
          <div>
            <span className={`button-label ${ (activeOptions.length > 0 && hasSelection) ? 'active' : '' }`}>
              { title }
            </span>
            { activeOptions.length > 0 && (
              <span className='badge'>
                { activeOptions.length }
              </span>
            ) }
          </div>
          <span className='caret-down'>▾</span>
        </button>

        { activeDropdown === name &&
          <div className='dropdown-options'>
            <div className='options-container'>
              { allOptions.map((obj) => (
                <label className='option-label' key={ obj.value }>
                  <input
                    role="checkbox"
                    type='checkbox'
                    value={ obj.value }
                    onChange={ handleFilter(name) }
                    checked={ hasSelection && activeOptions.includes(obj.value) } />
                  <span className='checkbox-label'>{ obj.name }</span>
                </label>
              )) }
            </div>
            <button className='clear-filters' onClick={ clearFilter(name) }>
              <span>Ver todos</span>
            </button>
          </div>
        }

      </div>
    )
  }
}
