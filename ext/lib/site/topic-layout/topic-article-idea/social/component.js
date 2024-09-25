import React, { PureComponent } from 'react'
import t from 't-component'
import config from 'lib/config'

export default (props) => {
  const { topic, twitterText, socialLinksUrl } = props
  const { url, mediaTitle, participants } = topic
  const messageWp = `Sumate a pensar la Ciudad que queremos. Apoyemos esta idea para mejorar la ciudad: ${mediaTitle} ` + socialLinksUrl
  return (
    <div className='topic-article-content topic-social-vilo'>
      <div className='share-links'>
        <a target='_blank' href={`http://www.facebook.com/sharer.php?u=${socialLinksUrl}`} rel='noopener noreferrer' className='facebook-icon'></a>
        <a target='_blank' href={`http://twitter.com/share?text=${twitterText}&url=${socialLinksUrl}`} rel='noopener noreferrer' className='twitter-icon'></a>
        {
          window.innerWidth <= 630 &&
            <a href={`whatsapp://send?text=${messageWp}`} rel='noopener noreferrer' className='wp'></a>
        }
        <a onClick={copyURLToClipboard} href='#' rel='noopener noreferrer' className='linkclipboard-icon'></a>
        <span id='copied' className='copied'>Copiado!</span>
      </div>
    </div>
  )
}

class Participants extends PureComponent {
  constructor (props) {
    super(props)

    const participants = props.participants
    const count = participants.length
    const cardinality = count === 1 ? 'singular' : 'plural'

    this.state = {
      countMsg: `${count} ${t(`proposal-article.participant.${cardinality}`)}`,
      showAll: false,
      moreToShow: count > 5,
      participants: participants.splice(0, 5)
    }
  }

  handleShowAll = () => {
    this.setState({ showAll: true })
  }

  render () {
    const { countMsg, participants, showAll, moreToShow } = this.state

    const participantsToShow = showAll ? this.props.participants : participants

    return (
      <div className='participants-box'>
        <span>{countMsg}</span>
        {participantsToShow.map((participant, i) => (
          <span
            key={i}
            title={participant.displayName}
            className='participant-profile'>
            <img src={participant.avatar} className='avatar' />
          </span>
        ))}
        {moreToShow && !showAll && (
          <a
            className='view-more hellip'
            onClick={this.handleShowAll}>&hellip;</a>
        )}
      </div>
    )
  }
}


function copyURLToClipboard(event) {
  event.preventDefault()
  var textArea = document.createElement('textarea')
  var url = window.location.href

  // Si llegara a renderearse, la textarea es casi invisible
  textArea.style.position = 'fixed'
  textArea.style.top = 0
  textArea.style.left = 0
  textArea.style.width = '2px'
  textArea.style.height = '2px'
  textArea.style.padding = 0
  textArea.style.border = 'none'
  textArea.style.boxShadow = 'none'
  textArea.style.outline = 'none'
  textArea.style.background = 'transparent'

  textArea.value = url
  document.body.appendChild(textArea)
  textArea.select()

  try  {
    var copied = document.execCommand('copy')

    if (copied) {
      // renderiza la tooltip
      var tooltip = document.getElementById('copied')
      tooltip.style.display = 'inline-block'

    } else {
      console.error('Error al copiar URL.')
    }
  } catch (err) {
    console.error('No se pudo copiar la URL. Intente nuevamente.')
  }

  //elimino la textarea y la tooltip
  document.body.removeChild(textArea)
  setTimeout(function() {tooltip.style.display = 'none'}, 2000)
  
}