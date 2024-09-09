import React, { Component } from 'react'
import { Link } from 'react-router'

export default ({ id, relatedProposals }) => (
  <div className='topic-article-content alert alert-success alert-proyecto' role='alert' style={{textAlign:'center'}}>
    Podés ver la propuesta original <Link to={`/propuestas/topic/${id}`} className='alert-link'>aquí</Link>.
    {relatedProposals &&
      <p>{`Podés ver ${relatedProposals.length > 1 ? 'las propuestas que fueron integradas' : 'la propuesta que fue integrada'} en este proyecto `}
        {relatedProposals.map((p, i) => (
          <Link to={`/propuestas/topic/${p.id}`} className='alert-link' key={i}>{i === relatedProposals.length - 1 ? 'aquí' : 'aquí, ' }</Link>
        ))}
        {'.'}
    </p>
    }
  </div>
)
