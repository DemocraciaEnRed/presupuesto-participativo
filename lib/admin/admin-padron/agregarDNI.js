import React, { Component } from 'react'
import t from 't-component'
import 'whatwg-fetch'
import urlBuilder from 'lib/url-builder'
import { limit } from '../../api-v2/validate/schemas/pagination'
import moment from 'moment'

export default class AgregarDNI extends Component {
  constructor (props) {
    super(props)

    this.state = {
      inputDNI: '',
      result: null,
      showWarning: false,
      showSuccess: false,
      textWarning: '',
      textSuccess: ''
    }

    this.agregarDni = this.agregarDni.bind(this);
    this.closeNotifications = this.closeNotifications.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  componentDidMount () {
        
  }

  handleInputChange (e) {
    let data = {}
    data[e.target.name] = e.target.value
    this.setState(data)
  }

  closeWarnings () {
    this.setState({
      showWarning: false
    })
  }

  agregarDni (e) {
    e.preventDefault();
    let dni = this.state.inputDNI
    this.closeNotifications()
    // it should not be empty
    if (dni.length === 0) {
      this.setState({
        showWarning: true,
        textWarning: 'El DNI no puede estar vacio'
      })
      return
    }
    let aux = this.state.inputDNI
    let body = {
      dni: this.state.inputDNI,
    }
    console.log(body)
    window.fetch(`/api/padron/new`, {
      method: 'POST',
      body: JSON.stringify(body),
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    .then((res) => {
      if (res.status === 200) {
        return res
      }
    })
    .then((res) => res.json())
    .then((res) => {
      this.setState({
        result: res,
        showSuccess: true,
        textSuccess: `¡Se agrego el DNI ${aux} al padron!`
      }, this.resetForm )
    })
    .catch((err) => {
      this.setState({
        showWarning: true,
        textWarning: `No se a podido agregar a la persona con DNI ${aux} ¿Tal vez ya está en el padron?`
      })
      console.log(err)
    })
  }

  resetForm () {
    // set everything in lista to false
    document.getElementById('buscarInputDNI').value = ''
    this.setState({
      inputDNI: ''
    })
  }

  // object is not empty
  isEmpty (obj) {
    for(var key in obj) {
      if(obj.hasOwnProperty(key))
        return false;
    }
    return true;
  }

  closeNotifications () {
    this.setState({
      showWarning: false,
      showSuccess: false,
      textWarning: '',
      textSuccess: ''
    })
  }

  render () {
    const { forum, zonas } = this.props
    // let { proyectistas } = this.state
    return (
      
      <div id="buscar-dni-component">
        <p className='h3'><i className="icon-plus"></i> Agregar nuevo DNI al padron</p>
        <p>Agregue un nuevo DNI al padron. Esto permite que una persona se pueda registrar en la plataforma.</p>
        <p>Importante:</p>
        <ul>
          <li>No se permiten duplicados en el padron. Por favor evite errores.</li>
          <li>No es necesario agregarlos si realizan voto presencial con cuenta admin, al entrar el voto, se chequea si está en el padron. De no estar, se lo agrega.</li>
        </ul>
        <div className='panel panel-default'>
          <div className='panel-body'>
              {
                this.state.showWarning &&
                <div className='alert alert-warning alert-dismissible' role='alert'>
                  <button type='button' onClick={this.closeNotifications} className='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button>
                  { this.state.textWarning }
                </div>
              }
              <div className='form-group'>
                <label htmlFor=''>DNI a agregar</label>
                <input type='text' className='form-control' id="buscarInputDNI" name="inputDNI" onChange={this.handleInputChange}  placeholder='DNI' />
              </div>
              <div className='form-group pull-right'>
                <button type='button' onClick={this.agregarDni} className='btn btn-primary'>Agregar</button>
              </div>
          </div>
        </div>
        {
          this.state.showSuccess &&
          <div className='alert alert-success alert-dismissible' role='alert'>
            <button type='button' onClick={this.closeNotifications} className='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button>
            { this.state.textSuccess }
          </div>
        }
      </div>
    )
  }
}
