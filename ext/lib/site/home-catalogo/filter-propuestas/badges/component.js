import React, { Component } from 'react'

export default class Badges extends Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  render() {
    const { options, handleRemove } = this.props
    return (
      <div>
        <h1>Filtros aplicados</h1>
        <div className='badges-wrapper'>
          {options.map((option) =>
            <div className='badges-item' key={option.value}>
              {option.name}&nbsp;
              <span className='badge-cross' onClick={handleRemove(option.value)}>
                x
              </span>
            </div>
          )}
        </div>
      </div>
    )
  }
}
