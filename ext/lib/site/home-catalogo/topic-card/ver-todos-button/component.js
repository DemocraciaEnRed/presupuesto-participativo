import React, { Component } from 'react'
import userConnector from 'lib/site/connectors/user'

class VerTodosButton extends Component {

  render() {
    return (
        <div
          className='ver-todos-button-wrapper'>
            <button
              className="btn btn-empty"
              onClick={() => window.location.href = `/propuestas`
              }>
                Ver todas las ideas
              </button>
        </div>
    )
  }
}

export default userConnector(VerTodosButton)
