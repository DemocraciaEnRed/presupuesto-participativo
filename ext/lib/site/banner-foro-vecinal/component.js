import React from 'react'
import config from 'lib/config'

export default function BannerForoVecinal (props) {
  let { adminTexts } = config.store
  return (
    <section className='container-fluid banner-fv'>
      <div ></div>
      <div className='banner'>
      { window.innerWidth >= 630 && (
        Math.random(1) > 0.5 ? (
          <video playsInline autoPlay muted loop>
            <source src={ adminTexts && adminTexts['home-video1-mp4'] }  type='video/mp4' />
            <source src={ adminTexts && adminTexts['home-video1-webm'] } type='video/webm' />
          </video>
        ) : (
          <video playsInline autoPlay muted loop>
            <source src={ adminTexts && adminTexts['home-video2-mp4'] } type='video/mp4' />
            <source src={ adminTexts && adminTexts['home-video2-webm'] } type='video/webm' />
          </video>
        )
      )}

      </div>
      <div className='contenedor'>
        <div className='fondo-titulo'>
          <h1 tabIndex="10">{props.title}</h1>
        </div>
      </div>
    </section>
  )
}

BannerForoVecinal.defaultProps = {
  title: 'Presupuesto participativo'
}
