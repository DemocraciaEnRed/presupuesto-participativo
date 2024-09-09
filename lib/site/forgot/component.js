import React, { Component } from 'react'
import t from 't-component'
import FormAsync from 'lib/site/form-async'

export default class Forgot extends Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: false,
      errors: null,
      email: '',
      success: false
    }
    this.onSuccess = this.onSuccess.bind(this)
    this.onFail = this.onFail.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
  }

  componentWillMount () {
    this.setState({ success: false })
  }

  onSubmit (data) {
    this.setState({ loading: true })
  }

  onSuccess (res) {
    this.setState({
      loading: false,
      success: true,
      errors: null
    })
  }

  onFail (err) {
    this.setState({ loading: false, errors: err })
  }

  render () {
    return (
      <div>
        <div className="container">
          <div className="row">
            <div className='panel panel-danger' role='alert' style={{fontSize: '12px', marginTop: '10px'}}>
              <div className="panel-heading">
                <h3 className="panel-title">📢 Importante</h3>
              </div>
              <div className="panel-body">
                <p>Debido a la <u>alta demanda</u> en registros y recuperaciones de contraseña, <b>las cuentas de correo de Microsoft (hotmail.com/live.com/outlook.com) han tenido problemas</b> en recibir correo. Esto se debe a un factor externo fuera de nuestro control. Si han tenido problemas en recuperar contraseña o en registrarse utilizando, le pedimos que vuelvan a intentarlo. </p>
                <p>📣 Los correos de otros proveedores como Gmail, Yahoo, etc. <u>no se ven afectados</u>. ✅</p>
                <p>👉 <b>Si ya te registraste</b>: Hemos validado todas las cuentas que no han podido recibir su correo para confirmar su registro. Por favor, intente iniciar sesión.</p>
                <p>👉 <b>Si aun no te registraste</b>: Vas a poder registrarte normalmente y comenzar a participar, te pedimos que una vez que termines de registrate, inicies sesión.</p>
                <p>👉 <b>Si te olvidaste tu contraseña y no logras recibir el correo</b>: Por favor te pedimos que esperes unas horas y vuelvas a intentarlo. De no poder lograrlo, enviános un email a it@democracyos.io</p>
              </div>
            </div>
          </div>
        </div>
        <div className='center-container'>
          <div id='forgot-form'>
            <div className='title-page'>
              <div className='circle'>
                <i className='icon-envelope' />
              </div>
              <h1>{t('forgot.question')}</h1>
            </div>
            <p className={!this.state.success ? 'explanation-message' : 'hide'}>
              {t('forgot.explanation')}.
            </p>
            <p className={this.state.success ? 'success-message' : 'hide'}>
              {t('forgot.mail.sent')}.
            </p>
            <p className={this.state.success ? '' : 'hide'}>
              Si no te llega el correo electrónico asegurate de mirar tu casilla de <strong>correo no deseado</strong>.
            </p>
            <p className={this.state.success ? '' : 'hide'}>
              Si no lo recibiste podés contactarte con <a href="mailto:it@democracyos.io">it@democracyos.io</a>.
            </p>
            <FormAsync
              action='/api/forgot'
              hidden={this.state.success}
              onSuccess={this.onSuccess.bind(this)}
              onFail={this.onFail.bind(this)}
              onSubmit={this.onSubmit.bind(this)}>
              <ul
                className={this.state.errors ? 'form-errors' : 'hide'}>
                {
                  this.state.errors && this.state.errors
                    .map((error, key) => (<li key={key}>{error}</li>))
                }
              </ul>
              <div className='form-group'>
                <label htmlFor='forgot-email'>{t('signup.email')}</label>
                <input
                  type='email'
                  className='form-control'
                  name='email'
                  maxLength='200'
                  tabIndex={1}
                  placeholder={t('forgot.mail.example')}
                  required />
              </div>
              <div className='form-group'>
                <button
                  className={!this.state.loading ? 'btn btn-primary btn-block' : 'hide'}
                  type='submit'
                  tabIndex={3}>
                  {t('forgot.reset')}
                </button>
                <button
                  className={this.state.loading ? 'loader-btn btn btn-block btn-default' : 'hide'}>
                  <div className='loader' />
                  {t('forgot.reset')}
                </button>
              </div>
            </FormAsync>
          </div>
        </div>
      </div>
    )
  }
}
