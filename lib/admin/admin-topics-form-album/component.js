import React, { Component } from 'react'
import { Link } from 'react-router'
import t from 't-component'
import urlBuilder from 'lib/url-builder'
import 'whatwg-fetch'

export default class AdminTopicFormAlbum extends Component {
  constructor (props) {
    super(props)

    this.state = {
      urlImagesToAdd: [],
      inputUrlImage: '',
      showInvalidUrlWarning: false,
      showSuccessMessage: false,
      showErrorMessage: false,
      showSuccessDeleteMessage: false,
      showErrorDeleteMessage: false,
      currentAlbum: []
    }

    this.handleInputChange = this.handleInputChange.bind(this)
  }

  componentDidMount () {
    if (this.props.topic.extra && this.props.topic.extra.album && this.props.topic.extra.album.length > 0) {
      this.setState({
        currentAlbum: this.props.topic.extra.album
      })
    }
  }

  handleInputChange (e) {
    let data = {}
    data[e.target.name] = e.target.value
    this.setState(data)
  }

  // adds a new image url to the urlImagesToAdd array
  addImageUrl (e) {
    e.preventDefault()
    let urlImagesToAdd = this.state.urlImagesToAdd
    if(!this.validateStringIsUrl(this.state.inputUrlImage)) {
      this.setState({showInvalidUrlWarning: true}, () => {
        setTimeout(() => {
          this.setState({showInvalidUrlWarning: false})
        }, 4000)
      })
      return
    }
    urlImagesToAdd.push(this.state.inputUrlImage)
    this.setState({
      urlImagesToAdd: urlImagesToAdd,
      inputUrlImage: ''
    })
  }

  validateStringIsUrl (string) {
    let url
    try {
      url = new URL(string)
    } catch (_) {
      return false
    }
    return url.protocol === 'http:' || url.protocol === 'https:'
  }

  // remove an image url from the urlImagesToAdd array
  removeImageUrl (e, index) {
    e.preventDefault()
    let urlImagesToAdd = this.state.urlImagesToAdd
    urlImagesToAdd.splice(index, 1)
    this.setState({
      urlImagesToAdd: urlImagesToAdd
    })
  }

  showSuccessMessage () {
    this.setState({ showSuccessMessage: true }, () => {
      setTimeout(() => {
        this.setState({ showSuccessMessage: false })
      }, 4000)
    })
  }

  showErrorMessage () {
    this.setState({ showErrorMessage: true }, () => {
      setTimeout(() => {
        this.setState({ showErrorMessage: false })
      }, 4000)
    })
  }

  showSuccessDeleteMessage () {
    this.setState({ showSuccessDeleteMessage: true }, () => {
      setTimeout(() => {
        this.setState({ showSuccessDeleteMessage: false })
      }, 4000)
    })
  }

  showErrorDeleteMessage () {
    this.setState({ showErrorDeleteMessage: true }, () => {
      setTimeout(() => {
        this.setState({ showErrorDeleteMessage: false })
      }, 4000)
    })
  }

  // reset form
  resetForm () {
    this.setState({
      urlImagesToAdd: [],
      inputUrlImage: ''
    })
  }

  // submit array of new images to the API
  submitNewUrlImages (e) {
    e.preventDefault()
    let body = {
      album: this.state.urlImagesToAdd
    }
    console.log(body)
    window.fetch(`/api/v2/topics/${this.props.topic.id}/album`, {
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
      } else {
        throw new Error(res.statusText || res.status)
      }
    })
    .then((res) => res.json())
    .then((res) => {
      console.log(res)
      this.showSuccessMessage()
      this.setState({ currentAlbum: res.album })
      this.resetForm()
    })
    .catch((err) => {
      this.showErrorDeleteMessage()
      console.log(err)
    })
  }
  
  // submit delete image request to the API
  deleteImage (e, index) {
    e.preventDefault()
    let body = {
      indexToDelete: index
    }
    window.fetch(`/api/v2/topics/${this.props.topic.id}/album`, {
      method: 'DELETE',
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
      } else {
        throw new Error(res.statusText || res.status)
      }
    })
    .then((res) => res.json())
    .then((res) => {
      console.log(res)
      this.showSuccessDeleteMessage()
      this.setState({ currentAlbum: res.album })
    })
    .catch((err) => {
      this.showErrorMessage()
      console.log(err)
    })
  }

  render () {
    const { topic } = this.props
    return (
      <div>
        <br />
        <div className="clearfix">
          <div className="pull-left">
            <a href={urlBuilder.for('admin.topics.id', { id: topic.id, forum: this.props.forum.name })} className=''>
              ⬅️ Volver a editar la idea
            </a>
          </div>
          <div className="pull-right">
            <a href={`/propuestas/topic/${this.props.topic.id}`} className=''>
              Ver la idea en el sitio público ➡️
            </a>
          </div>
        </div>
        <h2>Album de imagenes</h2>
        <p className="h4"><u>Proyecto</u><br></br><b><i>{topic.mediaTitle}</i></b></p>
        <br></br>
        <div className='panel panel-default'>
          <div className='panel-heading'>
            <h3 className='panel-title'>Agregar URL imagenes</h3>
          </div>
          <div className='panel-body'>
            {/* Show a notification saying its not a valid URL */}
            {this.state.showInvalidUrlWarning && (
              <div className='alert alert-danger'>
                <strong>URL invalida</strong>
              </div>
              )
            }
            {/* Show a success notification */}
            {this.state.showSuccessMessage && (
              <div className='alert alert-success'>
                <strong>Imagenes agregadas</strong>
              </div>
              )
            }
            {/* Show a notification that something went wrong and to retry */}
            {this.state.showErrorMessage && (
              <div className='alert alert-danger'>
                <strong>Algo salio mal, intente de nuevo</strong>
              </div>
              )
            }

            <form onSubmit={this.addImageUrl.bind(this)}>
              <div className='form-group'>
                <label htmlFor='newImageUrl'>URL de nueva imagen</label>
                <input type='text' name='inputUrlImage' id="newImageUrl" className='form-control' ref='newImageUrl' placeholder='Ingrese aquí una URL valida de la imagen' onChange={this.handleInputChange} value={this.state.inputUrlImage} />
              </div>
              <div className='text-right'>
                <button type='submit' className='btn btn-primary' disabled={this.state.inputUrlImage === ''}>+ Agregar</button>
              </div>
            </form>
            <hr></hr>
            <p className='h4'>Previsualizar imagenes</p>
            {
              this.state.urlImagesToAdd.length === 0 && (
                <div className='alert alert-info'>
                  <strong>No ha agregado imagenes</strong>
                </div>
              )
            }
            {
              this.state.urlImagesToAdd.map((url, index) => {
                return (
                  <div className='col-md-3' key={index}>
                    <div className='thumbnail'>
                      <button type='button' className='close' aria-label='Close' onClick={(e) => this.removeImageUrl(e, index)}><span aria-hidden='true'>&times;</span></button>
                      <a href={url} target='_blank'>
                        <img src={url} alt='' />
                      </a>
                    </div>
                  </div>
                )
              })
            }
            <div>
              {/* Submit new images button */}
              <div className='text-right'>
                <button type='button' onClick={(e) => this.submitNewUrlImages(e)} className='btn btn-primary btn-block' disabled={this.state.urlImagesToAdd.length === 0}>Guardar nuevas imagenes</button>
              </div>
            </div>  
          </div>
        </div>
            <p className='h3'>Album de imágenes </p>
            <p>Explore las imagenes que el proyecto cuenta. Haciendo click en la imagen se abrirá en una nueva pestaña. Para eliminar una imagen haga click en el botón de eliminar.</p>
            {/* Show a success notification */}
            {this.state.showSuccessDeleteMessage && (
              <div className='alert alert-success'>
                <strong>Imagene eliminada</strong>
              </div>
              )
            }
            {/* Show a notification that something went wrong and to retry */}
            {this.state.showErrorDeleteMessage && (
              <div className='alert alert-danger'>
                <strong>Algo salio mal, intente de nuevo</strong>
              </div>
              )
            }

          <div className='row'>
              {
                this.state.currentAlbum.map((url, index) => {
                  return (
                    <div className='col-md-4 col-sm-3 col-xs-6' key={index}>
                      <div className='thumbnail-album-form'>
                        <button type='button' className='close button-remove-from-album' aria-label='Close' onClick={(e) => this.deleteImage(e, index)}><span aria-hidden='true'>&times;</span></button>
                        <a href={url} target='_blank'>
                          <div style={{backgroundImage: `url(${url})`}} className='image-album-form'></div>
                        </a>
                      </div>
                    </div>
                  )
                })
              }
              {
                this.state.currentAlbum.length === 0 && (
                  <div className='alert alert-info'>
                    <strong>No hay imagenes en el album</strong>
                  </div>
                )
              }
          </div>
        </div>
    )
  }
}
