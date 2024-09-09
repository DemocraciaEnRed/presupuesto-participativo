import React, { Component } from 'react'
import { Link } from 'react-router'
import t from 't-component'

export default class PopupMessage extends Component {
  constructor (props) {
    super(props)

    this.state = {
    }
  }

  render () {
    const { msg } = this.props
    return (
      <div className='popup-wrapper'>
        <div className="arrow-up"></div>
        {msg}
      </div>
    )
  }
}
