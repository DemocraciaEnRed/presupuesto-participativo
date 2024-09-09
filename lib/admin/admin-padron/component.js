import React, { Component } from 'react'
import t from 't-component'
import 'whatwg-fetch'
import urlBuilder from 'lib/url-builder'
import { limit } from '../../api-v2/validate/schemas/pagination'
import BuscarDNI from './buscarDNI'
import AgregarDNI from './agregarDNI'
import BulkDNI from './bulkDNI'
import moment from 'moment'

export default class AdminPadron extends Component {
  constructor (props) {
    super(props)

    this.state = {}
  }

  componentDidMount () {
    console.log(this.props.zonas)
  }

  render () {
    const { forum, zonas } = this.props
    return (
      <div>
        <h2>Padrón</h2>
        <hr />
        <p className='h3'><i className="icon-book"></i>  Descargar listado Padrón</p>
        <div className='clearfix'>
          <div className='pull-left'>
            <p>Descarge el padrón y los usuarios vinculados en una planilla</p>
          </div>
          <div className='pull-right'>
            <a href='/api/v2/padron/all/csv'
              download
              className='btn btn-primary'>
              Descargar CSV
            </a>
          </div>
        </div>
        <hr />
        <p className='h3'><i className="icon-book"></i>  Descargar proyectos y cant. votos</p>
        <div className='clearfix'>
          <div className='pull-left'>
            <p>Descarge el listado de proyectos y la cantidad de votos</p>
          </div>
          <div className='pull-right'>
            <a href='/api/v2/vote/byTopic/csv'
              download
              className='btn btn-primary'>
              Descargar CSV
            </a>
          </div>
        </div>
        <hr />
        <BuscarDNI forum={forum} zonas={zonas} />
        <hr />
        <AgregarDNI forum={forum} zonas={zonas} />
        {/* <hr /> */}
        {/* <BulkDNI forum={forum} zonas={zonas} /> */}
      </div>
    )
  }
}
