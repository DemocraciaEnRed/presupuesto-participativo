import React, { Component } from 'react'
import t from 't-component'
import 'whatwg-fetch'
import urlBuilder from 'lib/url-builder'
import { limit } from '../../api-v2/validate/schemas/pagination'
import moment from 'moment'

export default class BulkDNI extends Component {
  constructor (props) {
    super(props)

    this.state = {
      result: null,
      showWarning: false,
      showSuccess: false,
      textWarning: '',
      textSuccess: ''
    }

    this.submitFile = this.submitFile.bind(this)
    this.closeNotifications = this.closeNotifications.bind(this)
    this.handleInputChange = this.handleInputChange.bind(this)
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

  submitFile () {
    // At least the file must exists
    if (document.getElementById('csvFileDNIs').files.length === 0) {
      this.setState({
        showWarning: true,
        textWarning: 'Debe elegir un archivo CSV'
      })
      return
    }

    // Read the content of the csv file and store it in a variable
    let file = document.getElementById('csvFileDNIs').files[0]
    let reader = new FileReader()
    reader.readAsText(file)
    reader.onload = (e) => {
      let csv = e.target.result
      let body = {
        csv: csv
      }
      window.fetch(`/api/v2/padron/bulk/csv`, {
        method: 'POST',
        body: JSON.stringify(body),
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })
      .then((res) => {
        if (res.status === 200 || res.status === 400) {
          return res
        }
      })
      .then((res) => res.json())
      .then((res) => {
        if(res.status === 400) {
          this.setState({
            showWarning: true,
            textWarning: res.message
          })
        }
        if(res.status === 200) {
          this.setState({
            result: res,
            showSuccess: true,
            textSuccess: res.message
          }, this.resetForm)
        }
      })
      .catch((err) => {
        this.setState({
          showWarning: true,
          textWarning: `No se a podido agregar los DNI al padron.`
        })
        console.log(err)
      })
    }
  }

  resetForm () {
    // reset input file "csvFileDNIs"
    document.getElementById('csvFileDNIs').value = ''
  }

  // object is not empty
  isEmpty (obj) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) { return false }
    }
    return true
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
    const { forum, escuelas, claustros } = this.props
    // let { proyectistas } = this.state
    return (

      <div id='buscar-dni-component'>
        <p className='h3'><i className='icon-copy' /> Agregar DNI(s) masivamente al padron</p>
        <p>Puede agregar varios DNIs al padrón.<br /><b>Tenga cuidado en usar esta función ya que las inserciones al padrón pueden ser irreversibles</b> </p>
        <p>Descargue el archivo base: <a href="/lib/admin/boot/upload-dnis.csv" download>Descargar CSV</a></p>
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
              <label htmlFor=''>Archivo CSV con DNI(s)</label>
              <input type='file' id='csvFileDNIs' className='form-control' accept='text/csv' />
            </div>
            <div className='form-group pull-right'>
            {
                this.state.isLoading ? <button type='button' className='btn btn-primary' disabled><i className="icon-spinner icon-spin"></i>Subiendo archivo...</button> 
                  : <button type='button' onClick={this.submitFile} className='btn btn-primary'>Subir archivo</button>
              }
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
