import React, { Component } from 'react'


function createClauses({ attrs, clauses }) {
  let div = document.createElement('div')
  let content
  if (!attrs) {
    content = clauses
      .sort(function (a, b) {
        return a.position > b.position ? 1 : -1
      })
      .map(function (clause) {
        return clause.markup
      })
      .join('')
  } else {
    const text = attrs['proyecto-contenido']
    content = `${text}`
  }
  div.innerHTML = content
  let returnText = div.textContent.replace(/\r?\n|\r/g, '')
  return returnText.length > 200 ? returnText.slice(0, 190) + '...' : returnText
}

function capitalizeFirstLetter(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

class VotoTopicCard extends Component { 


    displayMobile() {
      const { topic, handler, selected, setState, handleShowTopicDialog } = this.props
      return (
        <div className={`voto-topic-card ${topic.id === selected ? 'active' : ""}`}>
          <div className="row">
            <div className="col-xs-9">
              <div className="voto-topic-card-info">
                <h1>
                  {topic.mediaTitle.length > 70 ? topic.mediaTitle.slice(0,50) + "..." : topic.mediaTitle}
                </h1>
                {topic.attrs && <p>{createClauses(topic)} <u onClick={() => handleShowTopicDialog(topic)}>VER MAS</u></p>}
                <div className='voto-topic-card-tags'>
                  {topic.zona && <span className='voto-tag-wrapper tag-zona' >{capitalizeFirstLetter(topic.zona.nombre)}</span>}                
                  {topic.attrs && topic.attrs['presupuesto-total'] && <span className='voto-tag-wrapper tag-presupuesto'>Presupuesto: ${topic.attrs['presupuesto-total'].toLocaleString()}</span>}
                  {topic.tags.length > 0 && <span className='voto-tag-wrapper'>{capitalizeFirstLetter(topic.tags[0])}</span>}
                </div>                
              </div>
            </div>
            {handler && setState && <div className="col-xs-3">
              <div className="voto-topic-card-checkbox">
                <input type="checkbox" name={handler} id={topic.id} value={topic.id} onChange={setState} checked={topic.id === selected && true} className='select-topic' />
              </div>
            </div>}
          </div>
        </div>
      )
    }

    displayDesktop() {
      const { topic, handler, selected, setState, handleShowTopicDialog } = this.props
      return (
        <div className={`voto-topic-card ${topic.id === selected ? 'active' : ""}`}>
          <div className="row">
            <div className="col-md-8">
              <div className="voto-topic-card-info">
                <h1>
                  {topic.mediaTitle.length > 70 ? topic.mediaTitle.slice(0,50) + "..." : topic.mediaTitle}
                </h1>
                {topic.attrs && <p>{createClauses(topic)} <u onClick={() => handleShowTopicDialog(topic)}>VER MAS</u></p>}
                <div className='voto-topic-card-tags'>
                  {topic.zona && <span className='voto-tag-wrapper tag-zona' >{capitalizeFirstLetter(topic.zona.nombre)}</span>}                
                  {topic.tag && <span className='voto-tag-wrapper' >{capitalizeFirstLetter(topic.tag.name)}</span>}
                </div>                
              </div>
            </div>
            {topic.attrs && topic.attrs['presupuesto-total'] && <div className="col-md-2 text-center">
              <div className='voto-topic-card-presupuesto'>
                <h1>Presupuesto</h1>
                <p className='superbold'>${topic.attrs['presupuesto-total'].toLocaleString()}</p>
              </div>
            </div>}
            {handler && setState && <div className="col-md-2">
              <div className="voto-topic-card-checkbox">
                <input type="checkbox" name={handler} id={topic.id} value={topic.id} onChange={setState} checked={topic.id === selected && true} className='select-topic' />
              </div>
            </div>}
          </div>
        </div>
      )
    }    

    render() {
      return (window.matchMedia('(max-width: 768px)').matches ? this.displayMobile() : this.displayDesktop())
  }
}


export default VotoTopicCard
