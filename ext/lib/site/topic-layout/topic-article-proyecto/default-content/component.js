import React from 'react'

export default ({ problema, solucion, beneficios }) => {
  if (!problema && !solucion && !beneficios) return null
  return (
    <div className='topic-article-content entry-content skeleton-propuesta'>
      { problema &&
        <div>
          <span className='topic-article-span'>Problema o necesidad existente</span>
          <p className='topic-article-p'>{problema} </p>
        </div>
      }
      { solucion &&
        <div>
          <span className='topic-article-span'>Propuesta para solucionar el problema</span>
          <p className='topic-article-p'>{solucion} </p>
        </div>
      }
      { beneficios &&
        <div>
          <span className='topic-article-span'>Beneficios que brindará el proyecto al barrio</span>
          <p className='topic-article-p'>{beneficios} </p>
        </div>
      }
    </div>
  )
}