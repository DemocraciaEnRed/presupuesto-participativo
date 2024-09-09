import React from 'react'
import config from 'lib/config'

import VectorMap from './vectorMap'


export default function BannerForoVecinal (props) {
  return (
    <section className='container-fluid intro-mapa'>
        <div className="row">
          <div className="col-md-12">
            <div className="fondo-titulo">
              <h2>ZONAS DE MDQ</h2>
            </div>
          </div>
        </div>
        {/* <div className="row">
          <div className="col-md-12">
            <div className='mapa-box'>
              <iframe className='mapa' src="https://www.google.com/maps/d/embed?mid=1hogkVFq7mjotcMnBSPMLnPSgI2FrHNc" frameBorder="0" allowFullScreen></iframe>            
            </div>
          </div>
        </div>           */}
        <div className="row">
          <div className="col-md-12">
            <VectorMap />
          </div>
        </div>  
        <div className="row">
          <div className="col-md-8">
            <p className="text-right">Podés <a href="https://www.google.com/maps/d/u/0/viewer?mid=1hogkVFq7mjotcMnBSPMLnPSgI2FrHNc&ll=-37.95097558036518%2C-57.65591206560899&z=10" tabIndex="50" target="_blank">ver el mapa en detalle acá</a></p>
          </div>
          <div className="col-md-4"></div>
        </div>                
    </section>
  )
}
