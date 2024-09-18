import React from 'react'
import { Link } from 'react-router'
import config from 'lib/config'

export default function ThumbsVoto(props) {
  let
    styleIcono1 = { backgroundImage: `url(${props.texts['home-icono1-imagen']})` },
    styleIcono2 = { backgroundImage: `url(${props.texts['home-icono2-imagen']})` },
    styleIcono3 = { backgroundImage: `url(${props.texts['home-icono3-imagen']})` };

  let subtitle = props.texts['home-subtitle']

  const urlRegex = /(https?:\/\/)([a-zA-Z]+(?:\.[a-zA-Z]+){2,})/
  let subtitleUrl = null
  try {
    if (subtitle && urlRegex.test(subtitle)){
      let groups = urlRegex.exec(subtitle)
      subtitleUrl = groups[0]
      let subtitleUrlName = groups[2]
      // escapeamos por si trae cosas raras
      subtitle = subtitle.replace(/</g, '&lt;').replace(/>/g, '&gt;')
      subtitle = subtitle.replace(subtitleUrl, `<a href="${subtitleUrl}">${subtitleUrlName}</a>`)
    }
  } catch (e) {}

  return (
    <section className="thumbs info-landing">
      <div className="container-fluid">
        <div className="row cont fondo-rosa">
          <div className="subtitulo">
            { subtitleUrl ?
              <h2 dangerouslySetInnerHTML={{__html: subtitle}} />
              :
              <h2>
                <a tabIndex="20" href={props.forum.config.propuestasAbiertas ? '/formulario-idea' : props.forum.config.votacion ? '/votacion': '/propuestas'}>{ subtitle }</a>
              </h2>
            }
            <h3>{ props.texts['home-subtitle-text'] }</h3>
            <div className="btn-container">
            </div>
          </div>
        </div>
        <div className="row cont">
            <div className="intro-ideas">
              <h2>
              <strong>¿Cómo participar?</strong>
              </h2>
            </div>
        </div>    

        <div className="row cont">
          <div className="col-md-4">
            <div className='fondo-rosa rounded-xl p-1'>
            <div
              className="que-son img-responsive"
              style={styleIcono1}>
            </div>
            <h2
              className="text-center mgp">
              { props.texts['home-icono1-titulo']}
            </h2>
            <p className="que-son-cont" dangerouslySetInnerHTML={{__html: props.texts['home-icono1-texto']}} />

            </div>
          </div>

          <div className="col-md-4">
            <div className='fondo-rosa rounded-xl p-2'>
            <div
              className="que-propongo img-responsive"
              style={styleIcono2}>
            </div>
            <h2 className="text-center mgp">{props.texts['home-icono2-titulo']}</h2>
            <p className="que-propongo-cont" dangerouslySetInnerHTML={{__html: props.texts['home-icono2-texto']}} />

            </div>

          </div>

          <div className="col-md-4">
            <div className='fondo-rosa rounded-xl p-2'>

            <div
              className="como-sigo img-responsive"
              style={styleIcono3}>
            </div>
            <h2 className="text-center mgp">
              { props.texts['home-icono3-titulo']}
            </h2>
            <p className="donde-voto-cont" dangerouslySetInnerHTML={{__html: props.texts['home-icono3-texto']}} />
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}
