import React, { Component } from 'react'
import { Link } from 'react-router'
import config from 'lib/config'

export default class EncuentrosProximos extends Component {
   constructor (props) {
    super(props)

    this.state = {
      now: new Date(),
      events: false,
      availableEvents: [],
      availableEventsId: [],
      unavailableEvents: [],
      isLoading: true,
      keys: [
        'id',
        'barrio',
        'dia',
        'mes',
        'anio',
        'inicioHora',
        'inicioMinuto',
        'finHora',
        'finMinuto',
        'fechaDiaLegible',
        'fechaHoraLegible',
        'direccion',
        'descripcion',
        'cupoLleno'
      ]
    }
  }

  componentDidMount () {
    this.goTop()
    window.fetch(`https://sheets.googleapis.com/v4/spreadsheets/19XlwOqr7syWeWjY8GbLKHIbKz03G4-mW1QXPtPnSGjs/values/Encuentros?key=${config.googleSheetApiKey}`)
      .then((res) => res.json())
      .then((res) => {
        this.extractData(res)
      })
      .catch((err) => console.error(err))
  }

  goTop () {
    window.scrollTo(0,0)
  }

  extractData (data) {
    // eslint-disable-next-line prefer-const
    let output = []
    let available = []
    let availableId = []
    let unavailableEvents = []
    data.values.forEach((entry, i) => {
      if (i === 0) return
      const marker = {}
      this.state.keys.forEach((k, i) => {
        marker[k] = entry[i] !== '' ? entry[i] : null
      })
      marker.fechaInicio = new Date(`${marker.anio}-${marker.mes}-${marker.dia}T${marker.inicioHora}:${marker.inicioMinuto}:00-0300`)
      marker.fechaFin = new Date(`${marker.anio}-${marker.mes}-${marker.dia}T${marker.finHora}:${marker.finMinuto}:00-0300`)
      marker.calendarURL = `https://www.google.com/calendar/render?action=TEMPLATE&text=PP+MGP+-+Encuentro+${marker.barrio}&details=Te+invitamos+a+participar+colaborativamente+con+los+vecinos+de+${marker.barrio}+para+mejorar+nuestra+ciudad+juntos&location=${marker.direccion}&dates=${marker.fechaInicio.toISOString().replaceAll('-','').replaceAll(':','').replaceAll('.000','')}%2F${marker.fechaFin.toISOString().replaceAll('-','').replaceAll(':','').replaceAll('.000','')}`
      output.push(marker)
    })
    output.sort(function(a,b){
      // Turn your strings into dates, and then subtract them
      // to get a value that is either negative, positive, or zero.
      return new Date(a.fechaInicio) - new Date(b.fechaInicio);
    });
    output.forEach( event => {
      if(this.state.now < event.fechaFin) {
        available.push(event)
        availableId.push(event.id)
      } else {
        unavailableEvents.push(event)
      }
    })
    this.setState({ events: output, availableEvents: available, availableEventsId: availableId, unavailableEvents: unavailableEvents, isLoading: false })
  }


  render () {
    const { isLoading, availableEvents } = this.state
    const { texts } = this.props
    return (
      <div className='seccion-proximos-encuentros'>
        <div className="text-center">
          <div className="fondo-titulo" style={{backgroundColor: '#24436F', fontFamily: 'AlfabetLight'}}>
            <h3 className='subtitle'>{texts['home-encuentro-title']}</h3>
          </div>
        </div>
        <div className="container-fluid">

        <div className="row text-center">
          <div className="col-lg-12">
          <p className="">{texts['home-encuentro-subtitle']}<br/></p>
          </div>
        </div>
        <br></br>
        <div className="row">
          <div className="eventos-container">
            <div className="the-label">
              <h5><span className="glyphicon glyphicon-calendar"></span> PRÓXIMAS<br/>REUNIONES</h5>
              <Link href="/s/encuentros" tabIndex="40">
                Ver todos
              </Link>
            </div>
            {
              isLoading
              ? <div>
                  <p>Cargando...</p>
                </div>
              : (
                availableEvents.length > 0
                ? availableEvents.slice(0,3).map(event => 
                <div className="evento">
                  <div className="top">
                    <div className="poppi-left"></div>
                    <div className="poppi-right"></div>
                  </div>
                  <div className="bottom">
                    <h3>{event.barrio}</h3>
                    <h4>{event.fechaDiaLegible}<br/>{event.inicioHora}:{event.inicioMinuto} Hs</h4>
                    <p>
                    <b>{event.descripcion}</b><br/>
                    {event.direccion}<br/>{
                      event.cupoLleno == 'TRUE' && <span style={{fontWeight: 'bold', color: 'red', fontSize: '10px'}}>¡CUPO LLENO!</span>}
                    </p>
                  </div>
                </div>)
                : <p className="text-center">
                  No hay eventos disponibles
                </p>
              ) 
            }

          </div>
        </div>
        </div>
      </div>
    )
  }
}
