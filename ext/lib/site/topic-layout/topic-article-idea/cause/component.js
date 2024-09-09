import React, { Component } from 'react'
import t from 't-component'
import { Link, browserHistory } from 'react-router'
import topicStore from 'lib/stores/topic-store/topic-store'
import userConnector from 'lib/site/connectors/user'
import config from 'lib/config'

export class Cause extends Component {
  state = {
    topicClosed: false,
    showLoginMessage: false,
    results: null,
    forceProyectista: false,
    supported: null
  }

  componentWillMount () {
    this.setStateFromProps(this.props)
  }

  componentWillReceiveProps (props) {
    this.setStateFromProps(props)
  }

  setStateFromProps (props) {
    const { topic } = props

    return this.setState({
      showLoginMessage: false,
      topicClosed: topic.closed,
      supported: !!topic.voted
    })
  }

  handleSupport = (e) => {
    if (this.state.topicClosed) return

    if (!this.props.user.state.fulfilled) {
      return browserHistory.push({
        pathname: '/signin',
        query: { ref: window.location.pathname }
      })
    }

    topicStore.vote(this.props.topic.id, !this.state.supported ? 'apoyo-idea' : 'no-apoyo-idea')
      .catch((err) => { throw err })
  }

  handleProyectista = (id, hacerProyectista) => {
    const { user } = this.props

    if (user.state.rejected) {
      return browserHistory.push({
        pathname: '/signin',
        query: { ref: window.location.pathname }
      })
    }

    topicStore.updateProyectista(id, hacerProyectista).then((res) =>
      this.setState({ forceProyectista: true })
    ).catch((err) => { throw err })
  }

  render () {
    const { user, topic } = this.props
    const isSistematizada = topic && topic.attrs && topic.attrs.state == 'sistematizada'
    const isIdeaProyecto = topic && topic.attrs && topic.attrs.state == 'idea-proyecto'
    const isProyectista = !user.state.rejected && user.state.value && (this.state.forceProyectista || topic.proyectistas && topic.proyectistas.length > 0 && topic.proyectistas.includes(user.state.value.id))

    if (user.state.pending) return null

    const { supported, topicClosed } = this.state
    if (user.state.fulfilled && topic.privileges && !topic.privileges.canVote) return null
    return (
      <div className='topics-cause-propuesta'>
        {/*isSistematizada || isIdeaProyecto  ?
          /*<div
            className='proyectista-wrapper'>
            <button
              className={`btn btn-primary btn-${isProyectista ? 'empty' : 'filled'}`}
              onClick={() => this.handleProyectista(topic.id, !isProyectista)}
              disabled={isProyectista}>
              {isProyectista ? '¡Ya sos proyectista!' : '¡Quiero ser proyectista!'}
            </button>
          </div>
        :
          <div className='btn btn-primary' disabled={true}>
            Seguidores:&nbsp;
            {topic.action.count}&nbsp;
            <span className='icon-like' />
          </div>
        */}
        {config.habilitarApoyo &&
          <div
          className='proyectista-wrapper text-center'>
        <button
          className={`btn btn-primary btn-${isProyectista ? 'empty' : 'filled'}`}
          onClick={(() => this.handleProyectista(topic.id, !isProyectista))}
          disabled={isProyectista}>
          {isProyectista ? '¡Gracias! ¡Registramos tu "Me gusta"!' : 'Me gusta'}&nbsp;&nbsp;({topic.proyectistas.length})&nbsp;&nbsp;<span className='icon-like' />
        </button>
        {/* {
              !this.state.isFromEscuelaReactive && <p><span>Solo miembros de la escuela pueden enviar un "Me Gusta"</span></p>
            } */}
        </div>
        }
        {/*supported && (
          <button
            className='btn btn-primary'
            onClick={this.handleSupport}
            disabled={topicClosed}>
            Ya seguís
          </button>
        )}
        {!topicClosed && !supported && (
          <button
            disabled={!topic.privileges.canVote}
            className='btn btn-primary'
            onClick={this.handleSupport}>
            Seguir
          </button>
        )*/}
        <div className='likes-total'>
        </div>
        {user.state.fulfilled  && topic.privileges && !topic.privileges.canVote && (
          <p className='text-mute overlay-vote'>
            <span className='icon-lock' />
            <span className='text'>

            </span>
          </p>
        )}
      </div>
    )
  }
}

export default userConnector(Cause)

const LoginMessage = () => (
  <div className='alert alert-info' role='alert'>
    <span className='icon-heart' />{' '}
    {t('proposal-options.must-be-signed-in')}.{' '}
    <Link
      to={{
        pathname: '/signin',
        query: { ref: window.location.pathname }
      }}>
      {t('signin.login')}
    </Link>
    {' '}{t('common.or')}{' '}
    <Link
      to={{
        pathname: '/signup',
        query: { ref: window.location.pathname }
      }}>
      {t('signin.signup')}
    </Link>
  </div>
)
