import React from 'react'

const DatosPorForo = ({ forum }) => (
  <section className='seccion-datos-por-foro'>
    <div className='div-presupuesto'>
      <h3>{`Presupuesto asignado: ${forum.extra['presupuesto-total']}`}</h3>
    </div>
    <div className='div-boleta'>
      <a target='_blank' href={`${forum.extra.boleta}`}>
        <div className='icon-boleta' />
        DESCARGAR BOLETA
      </a>
    </div>
  </section>
)

export default DatosPorForo
