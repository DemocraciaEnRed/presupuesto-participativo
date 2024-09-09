import React, { Component } from 'react'
import t from 't-component'
import { Link, browserHistory } from 'react-router'
import userConnector from 'lib/site/connectors/user'

export class Subscribe extends Component {
  state = {
    showResults: false,
    showLoginMessage: false,
    results: null
  }

  componentWillMount () {
    this.setStateFromProps(this.props)
  }

  componentWillReceiveProps (props) {
    this.setStateFromProps(props)
  }

  setStateFromProps (props) {
    const { topic, user } = props
    
    let userAttrs = user.state.fulfilled && (user.state.value || {})
    let userSuscribed = false
    if(userAttrs && topic.attrs.subscribers){
      let userSuscribers = topic.attrs.subscribers.split(',')
      userSuscribed = userSuscribers.find(user => user === userAttrs.id);
    } else {
      userSuscribed = false
    }
 
    return this.setState({
      showLoginMessage: false,
      showResults: topic.closed, 
      subscribed: !!userSuscribed,
      subscribersCount: topic.attrs.subscribers ? topic.attrs.subscribers.split(',').length : 0
    })
  }

  handleSubscribe = (e) => {
    if (this.state.showResults) return

    if (!this.props.user.state.fulfilled) {
      return browserHistory.push({
        pathname: '/signin',
        query: { ref: window.location.pathname }
      })
    }
    // WIP
      const subscribeURL =`/api/v2/topics/${this.props.topic.id}/subscribe` // TO DO CONFIRM URL
      window.fetch(subscribeURL, {
        credentials: 'include',
        method: 'POST',
      }).then((res) => res.json())
      .then(res => {
        if(res.message === 'Suscribed') {
        this.setState({
          subscribed: !this.state.subscribed,
          subscribersCount: this.state.subscribersCount + 1
        })
      }
      else {
        this.setState({
          subscribed: !this.state.subscribed,
          subscribersCount: this.state.subscribersCount - 1
        })
      }
      }).catch((err) => { throw err })
  }

  render () {
    const { user, topic } = this.props

    if (user.state.pending) return null

    const { subscribed, showResults, subscribersCount } = this.state
    if (user.state.fulfilled && !topic.privileges.canVote) return null
    return (
      <div className='topics-subscribe-proyecto'>
        {subscribed && (
          <button
            className='btn btn-primary'
            onClick={this.handleSubscribe}>
            Desuscribirse
          </button>
        )}
        {!showResults && !subscribed && (
          <button
            disabled={!topic.privileges.canVote}
            className='btn btn-primary'
            onClick={this.handleSubscribe}>
            Suscribirse
          </button>
        )}
        
        <div className='subscribers-total'>
          {subscribersCount}
          &nbsp;
          <span className='icon-bell' />
        </div>
        
        {user.state.fulfilled && !topic.privileges.canVote && (
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

export default userConnector(Subscribe)
