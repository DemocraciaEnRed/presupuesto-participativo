import React, {Component} from 'react'
import Footer from   'ext/lib/site/footer/component'
import Jump from 'ext/lib/site/jump-button/component'
import Anchor from 'ext/lib/site/anchor'
import {Link} from 'react-router'
import config from 'lib/config'


export default class Page extends Component {
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
    const { events, isLoading, availableEvents, availableEventsId, unavailableEvents } = this.state
    return (
      <div>
        <section className="banner-static">
          <div className="banner"></div>
          <div className='contenedor'>
            <div className='fondo-titulo'>
              <h1>Encuentros</h1>
            </div>
          </div>
        </section>
        <div id='container' className="events-page">
          <div className='ext-herramientas'>
            <div className="text-center">
              <h3 className="color-black">Calendario</h3>
              <p>Agendate la reunión de tu barrio y presentá tus ideas.</p>
            </div>
            <br/> 
             <div className="text-center">
              <h3 className="">Próximos encuentros</h3>
              {
                isLoading 
                ? <p>Cargando...</p> 
                : <div>
                  {
                    availableEvents.map( event => <div className="event-container">
                      <div className="event-description">
                        <h5 className="title">{event.fechaDiaLegible} - {event.barrio}</h5>
                        <p className="where"><b>{event.fechaHoraLegible} - Dirección: {event.direccion}</b></p>
                        <p>{event.descripcion}</p>
                      </div> 
                      <div className="event-actions">
                        {/* { event.cupoLleno == 'FALSE' ? 
                          <a href="https://forms.gle/XAzf28UUFYj4T7tS8" className="btn btn-primary btn-inscripcion" target="_blank" >Inscribite!</a>
                          : <div className="btn btn-danger btn-inscripcion" disabled>¡CUPO LLENO!</div>
                        } */}
                        { event.cupoLleno == 'FALSE' ? 
                          <a href={event.calendarURL} className="btn btn-default btn-sm" target="_blank" disabled={event.cupoLleno == 'FALSE' ? false : true} ><span className="glyphicon glyphicon-calendar"></span> <span className="glyphicon glyphicon-plus"></span> Google Calendar</a>
                          : <div className="btn btn-default btn-sm" disabled><span className="glyphicon glyphicon-calendar"></span> <span className="glyphicon glyphicon-plus"></span> Google Calendar</div>
                        }
                      </div>
                      </div> )
                  }
                  <br/>
                <hr />
                  <br/>
                <h3>Encuentros pasados</h3>
                {
                    unavailableEvents.map( event => <div className="event-container disabled">
                      <div className="event-description">
                        <h5 className="title">{event.fechaDiaLegible} - {event.barrio}</h5>
                        <p className="where"><b>{event.fechaHoraLegible} - Dirección: {event.direccion}</b></p>
                      </div> 
                      </div> )
                  }
                </div>
              }
            </div> 
          </div>
        </div>
        <Jump goTop={this.goTop} />
        <Footer />
      </div>
    )
  }
}
