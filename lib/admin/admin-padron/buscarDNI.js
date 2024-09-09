import React, { Component } from 'react'
import t from 't-component'
import 'whatwg-fetch'
import urlBuilder from 'lib/url-builder'
import { limit } from '../../api-v2/validate/schemas/pagination'
import moment from 'moment'

export default class BuscarDNI extends Component {
  constructor (props) {
    super(props)

    this.state = {
      inputDNI: '',
      result: null,
      selectedZone: '',
      showWarning: false,
      showSuccess: false,
      textWarning: '',
      textSuccess: '',
      showWarningCambiarZona: false,
      textWarningCambiarZona: false,
      showSuccessCambiarZona: '',
      textSuccessCambiarZona: ''
    }

    this.buscarDni = this.buscarDni.bind(this);
    this.closeNotifications = this.closeNotifications.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.cambiarZona = this.cambiarZona.bind(this);
    this.closeNotificationsCambiarZona = this.closeNotificationsCambiarZona.bind(this);
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

  buscarDni (e) {
    e.preventDefault();
    let dni = this.state.inputDNI
    this.closeNotifications()
    // it should not be empty
    if (dni.length === 0) {
      this.setState({
        showWarning: true,
        textWarning: 'El DNI no puede estar vacio',
        showWarningCambiarZona: false,
        textWarningCambiarZona: false,
        showSuccessCambiarZona: '',
        textSuccessCambiarZona: ''
      })
      return
    }
    let aux = this.state.inputDNI
    window.fetch(`/api/padron/search/dni?dni=${this.state.inputDNI}&forum=proyectos`, {
      method: 'GET',
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
      if (this.isEmpty(res)){
        this.setState({
          result: null,
          showWarning: true,
          selectedZone: '',
          textWarning: `No se encontro ningun usuario con el DNI ${aux}`,
          showWarningCambiarZona: false,
          textWarningCambiarZona: false,
          showSuccessCambiarZona: '',
          textSuccessCambiarZona: ''
        })
        return
      }
      this.setState({
        result: res,
        showSuccess: true,
        selectedZone: '',
        textSuccess: `Se encontró en el padron el DNI ${aux}`,
        showWarningCambiarZona: false,
        textWarningCambiarZona: false,
        showSuccessCambiarZona: '',
        textSuccessCambiarZona: ''
      })
    })
    .catch((err) => {
      console.log(err)
    })
  }

  cambiarZona () {
    if (this.state.selectedZone === '') {
      this.setState({
        showWarningCambiarZona: true,
        textWarningCambiarZona: 'Debe seleccionar una zona'
      })
      return
    }
    let user = this.state.result
    let data = {
      dni: user.dni,
      zona: this.state.selectedZone
    }
    window.fetch(`/api/padron/change-zone`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then((res) => {
      if (res.status === 200) {
        return res
      }
    }
    )
    .then((res) => res.json())
    .then((res) => {
      if (res.error) {
        this.setState({
          showWarningCambiarZona: true,
          textWarningCambiarZona: res.error
        })
        return
      }
      let auxResult = this.state.result
      auxResult.user.zona = this.state.selectedZone
      this.setState({
        showSuccessCambiarZona: true,
        textSuccessCambiarZona: `Se cambio la zona del usuario ${user.dni} a ${this.getZona(this.state.selectedZone)}`,
        selectedZone: '',
        result: auxResult
      })
    })
    .catch((err) => {
      console.log(err)
      this.setState({
        showWarningCambiarZona: true,
        textWarningCambiarZona: 'Ocurrió un error al cambiar de zona al usuario'
      })
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

  showUserData (user) {
    return (
      <div className="">
        <table className="table table-bordered">
          <tbody>
            <tr>
              <th>Nombre</th>
              <td>{user.lastName}, {user.firstName}</td>
            </tr>
            <tr>
              <th>DNI</th>
              <td>{user.dni}</td>
            </tr>
            <tr>
              <th>Email</th>
              <td>{user.email}</td>
            </tr>
            <tr>
              <th>Valido Email</th>
              <td>{user.emailValidated ? 'SI' : 'NO'}</td>
            </tr>
            <tr>
              <th>Zona</th>
              <td>{this.getZona(user.zona)}</td>
            </tr>
            <tr>
              <th>Fecha creacion</th>
              <td>{moment(user.createdAt).format('YYYY-MM-DD HH:mm')}</td>
            </tr>
            <tr>
              <th>ID</th>
              <td><small>{user._id}</small></td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }

  getZona (idZona) {
    let zona = this.props.zonas.find((zona) => {
      return zona.value === idZona
    })
    if (zona) {
      return zona.name
    }
    return ''
  }

  closeNotifications () {
    this.setState({
      showWarning: false,
      showSuccess: false,
      textWarning: '',
      textSuccess: ''
    })
  }
  closeNotificationsCambiarZona () {
    this.setState({
      showWarningCambiarZona: false,
      showSuccessCambiarZona: false,
      textWarningCambiarZona: '',
      textSuccessCambiarZona: ''
    })
  }

  render () {
    const { forum, zonas } = this.props
    // let { proyectistas } = this.state
    return (
      <div id="buscar-dni-component">
        <p className='h3'><i className="icon-search"></i> Busqueda por DNI</p>
        <p>Puede buscar si el DNI está en el padrón, y si existe un usuario ya registrado con ese DNI, sus datos aparecerán.</p>
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
              <label htmlFor=''>DNI a buscar</label>
              <input type='text' name="inputDNI" onChange={this.handleInputChange} className='form-control' id='' placeholder='DNI' />
            </div>
            <div className='form-group pull-right'>
              <button type='button' onClick={this.buscarDni} className='btn btn-primary'>Buscar</button>
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
        {
          this.state.showSuccess && this.state.result.voted && 
          <div className='alert alert-success alert-dismissible' role='alert'>
            <i className="glyphicon glyphicon-ok"></i> El DNI ha votado en el presupuesto participativo
          </div>
        }
        {
          this.state.showSuccess && !this.state.result.voted &&
          <div className='alert alert-warning alert-dismissible' role='alert'>
            <i className="glyphicon glyphicon-info-sign"></i> El DNI no ha votado en el presupuesto participativo
          </div>
        }
        { this.state.result && (
          <div>
            <div className="row">
              { this.state.result.user ? 
                (
                <div className="col-md-6">
                  <p className='h4'><b>Usuario</b></p>
                  <div className=''>
                    {this.showUserData(this.state.result.user)}
                  </div>
                </div>
                ) : (
                  <div className="col-md-6">
                    <p className='h4'><b>Usuario</b></p>
                    <div className=''>
                      No existe un usuario registrado con este DNI
                    </div>
                  </div>
                )
              }
              {
                this.state.result.user &&
                  <div className="col-md-6">
                    <p className='h4'><b>¿Cambiar zona?</b></p>
                    {
                      this.state.result.user && !this.state.result.user.zona && <p>El usuario no tiene una zona asignada... (Error?)</p>
                    }
                    {
                      this.state.showSuccess && this.state.result.voted && this.state.result.topics.length > 0 &&
                      <div className='alert alert-danger alert-dismissible' role='alert'>
                        <b>IMPORTANTE</b>: El usuario publicó proyectos con su zona original y ya votó. <b>¡Cambiar de zona no cambia la zona del proyecto!</b>
                      </div>
                    }
                    {
                      this.state.showSuccess && this.state.result.voted &&
                      <div className='alert alert-warning alert-dismissible' role='alert'>
                        El usuario ya votó para la zona que ya tiene asignada. Cambiarlo de zona no deberia ser recomendado, ya que su voto está asociado a la zona que tiene asignada ya.
                      </div>
                    }
                    <div className='panel panel-default'>
                      <div className='panel-body'>
                        {
                          this.state.showWarningCambiarZona &&
                          <div className='alert alert-warning alert-dismissible' role='alert'>
                            <button type='button' onClick={this.closeNotificationsCambiarZona} className='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button>
                            { this.state.textWarningCambiarZona }
                          </div>
                        }
                        {
                          this.state.showSuccessCambiarZona &&
                          <div className='alert alert-success alert-dismissible' role='alert'>
                            <button type='button' onClick={this.closeNotificationsCambiarZona} className='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button>
                            { this.state.textSuccessCambiarZona }
                          </div>
                        }
                        <div className='form-group'>
                          <label htmlFor=''>Nueva zona</label>
                          <select name="selectedZone" onChange={this.handleInputChange} className='form-control' id=''>
                            <option value=''>Seleccione una zona</option>
                            {
                              zonas.map((zona) => {
                                return <option key={zona.value} value={zona.value}>{zona.name}</option>
                              })
                            }
                          </select>
                        </div>
                        <div className='form-group pull-right'>
                          <button type='button' onClick={this.cambiarZona} className='btn btn-primary'>Cambiar</button>
                        </div>
                      </div>
                    </div>
                  </div>
              }
            </div>
            <div className="row">
              <div className="col-lg-12">
              { this.state.result.user && (
                <div>
                  <p className='h4'><b>Proyectos del usuario</b></p>
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Fecha</th>
                        <th>Zona</th>
                      </tr>
                    </thead>
                    <tbody>
                      {
                        this.state.result.topics.map((topic) => {
                          return (
                            <tr key={topic.id}>
                              <td>{topic.mediaTitle}</td>
                              <td>{moment(topic.createdAt).format('YYYY-MM-DD HH:mm')}</td>
                              <td>{(topic.zona && topic.zona.nombre) || '???'}</td>
                            </tr>
                          )
                        })
                      }
                      {
                        this.state.result.topics.length === 0 &&
                        <tr>
                          <td colSpan='3'>No hay proyectos del usuario</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                  </div>
                )
              }
              </div>
            </div>
          </div>
          )
        }
      </div>
    )
    }
  }