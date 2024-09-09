import React, { Component } from 'react'
import userConnector from 'lib/site/connectors/user'

class VotarButton extends Component {

  render() {
    return (
      <div
        className='votar-button-wrapper'>
          <button
            className="btn btn-primary"
            onClick={() => window.location.href = `/votacion`
            }>
              Votá los Proyectos
            </button>
      </div>
  )
  }
}

export default userConnector(VotarButton)
