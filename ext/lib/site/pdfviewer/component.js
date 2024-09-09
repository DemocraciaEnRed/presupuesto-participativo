import React, { Component } from 'react'
import PDF from 'react-pdf-js'

class Loader extends Component {
  render () {
    return (
      <div className='spinner-container'>
        <div className='spinner-circle'>
          <div className='spinner-circle1 spinner-child' />
          <div className='spinner-circle2 spinner-child' />
          <div className='spinner-circle3 spinner-child' />
          <div className='spinner-circle4 spinner-child' />
          <div className='spinner-circle5 spinner-child' />
          <div className='spinner-circle6 spinner-child' />
          <div className='spinner-circle7 spinner-child' />
          <div className='spinner-circle8 spinner-child' />
          <div className='spinner-circle9 spinner-child' />
          <div className='spinner-circle10 spinner-child' />
          <div className='spinner-circle11 spinner-child' />
          <div className='spinner-circle12 spinner-child' />
        </div>
      </div>
    )
  }
}

export default class PdfViewer extends Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: false,
      page: false,
      pages: false,
      file: "https://celeste.blob.core.windows.net/clients-assets/pp-mgp/pdf/presupuesto-participativo-mgp-2022.pdf"
    }
  }

  componentWillReceiveProps () {
    this.setState({
      loading: true
    })
  }

  onDocumentComplete = (pages) => {
    this.setState({
      loading: false,
      page: 1,
      pages
    })
  }

  onPageComplete = (page) => {
    this.setState({ page })
  }

  handlePrevious = () => {
    this.setState({ page: this.state.page - 1 })
  }

  handleNext = () => {
    this.setState({ page: this.state.page + 1 })
  }


  render () {
    return (
      <div className='pdf-container'>
        {this.state.loading &&
          <div className='loader-container'>
            <Loader />
          </div>
        }
        <PDF
          fullWidth
          file={this.state.file}
          onDocumentComplete={this.onDocumentComplete}
          onPageComplete={this.onPageComplete}
          page={this.state.page}
          loading={<Loader />}
        />
        {this.state.pages &&
          <nav className='pagination'>
            <div className='pagination-container'>
              <button onClick={this.handlePrevious}
                disabled={this.state.page === 1}
                className='btn-pagination'>
                <span className='icon-arrow-left' />
              </button>
              <span className='page-counter'>
                Página {this.state.page} / {this.state.pages}
              </span>
              <button
                onClick={this.handleNext}
                disabled={this.state.page === this.state.pages}
                className='btn-pagination'>
                <span className='icon-arrow-right' />
              </button>
              <a
                href={this.state.file}
                target="_blank"
                className='btn-pagination'>
                <span className='icon-save' />
              </a>              
            </div>
          </nav>
        }
      </div>
    )
  }
}
