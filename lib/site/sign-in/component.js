import React, { Component } from 'react'
import { Link, browserHistory } from 'react-router'
import t from 't-component'
import bus from 'bus'
import config from 'lib/config'
import FormAsync from 'lib/site/form-async'
import userConnector from 'lib/site/connectors/user'
import BtnFacebook from './btn-facebook'

export class SignIn extends Component {
  constructor (props) {
    super(props)

    this.state = {
      loading: false,
      errors: null,
      showResend: null
    }
  }

  componentWillMount () {
    bus.emit('user-form:load', 'signin')
  }

  componentWillUnmount () {
    bus.emit('user-form:load', '')
  }

  handleSubmit = () => {
    this.setState({ loading: true })
  }

  handleSuccess = (attrs) => {
    this.setState({ loading: false, errors: null })

    this.props.user.update(attrs)

    if (this.props.location.query.ref) {
      var url = window.decodeURI(this.props.location.query.ref)
      browserHistory.push(url === '/signup' ? '/' : url)
    } else {
      browserHistory.push('/')
    }
    // por algún motivo si no refresh-amos no recarga la data del usuarix
    window.location.reload()
  }

  handleFail = (err, code) => {
    if (code && code === 'EMAIL_NOT_VALIDATED') {
      this.setState({ loading: false, errors: err, showResend: true })
    } else {
      this.setState({ loading: false, errors: err })
    }
  }

  handleSignUp = () => {
    browserHistory.push(`/signup${window.location.search}`)
  }

  checkEmail (e) {
    if (~e.target.value.indexOf('@') && !~e.target.value.indexOf(' ')) {
      e.target.setCustomValidity('')
    } else {
      e.target.setCustomValidity(t('validators.invalid.email'))
    }
  }

  render () {
    const form = (
      <FormAsync
        action='/api/signin'
        onSubmit={this.handleSubmit}
        onSuccess={this.handleSuccess}
        onFail={this.handleFail}>
        {this.state.errors && this.state.errors.length > 0 && (
          <ul className='form-errors'>
            {this.state.errors.map((error, key) => (
              <li key={key}>{error}</li>
            ))}
          </ul>
        )}
        {this.state.showResend && (
          <div className='form-group resend-validation-email'>
            <Link to='/signup/resend-validation-email'>
              {t('signup.resend-validation-email')}
            </Link>
          </div>
        )}
        <div className='form-group'>
          <label htmlFor=''>{t('signup.email')}</label>
          <input
            type='email'
            className='form-control'
            name='email'
            placeholder={t('forgot.mail.example')}
            tabIndex={100}
            maxLength='200'
            onBlur={this.checkEmail}
            required />
        </div>
        <div className='form-group'>
          <div className='forgot'>
            <Link
              to='/forgot'
              tabIndex={3}>
              {t('forgot.question')}
            </Link>
          </div>
          <label htmlFor=''>{t('password')}</label>
          <input
            type='password'
            className='form-control'
            name='password'
            placeholder={t('password')}
            tabIndex={101}
            maxLength='200'
            required />
        </div>
        {!this.state.loading && (
          <button
            className='btn btn-block'
            type='submit'>
            {t('signin.login')}
          </button>
        )}
        {this.state.loading && (
          <button
            className='loader-btn btn btn-block btn-default'
            type='button'
            tabIndex='-1'>
            <div className='loader' />
            {t('signin.login')}
          </button>
        )}
      </FormAsync>
    )

    return (
      <div>
        {/* Bootstrap 3 notification */}
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
        <div id='sign-in'>
          <div className='title-page'>
            <div className='circle'>
              <i className='icon-login' />
            </div>
          </div>
          {!config.facebookSignin
            &&
            <h1 className='ingresar-title'>{t('header.signin')}</h1>
            ||
            <FacebookForm />
          }
          { form }
          <hr />
          <div className="signup">
            <span>¿Todavía no te hiciste una cuenta?</span>
            <button type="submit" className="btn btn-block btn-outline-primary" onClick={this.handleSignUp}>
              ¡Hacé click y registrate!
            </button>
          </div>
        </div>
      </div>
    )
  }
}

export default userConnector(SignIn)

function FacebookForm () {
  return (
    <div className='facebook-auth-form'>
      <BtnFacebook />
      <hr />
      <p className='muted'>{t('signin.or-login-with-email')}</p>
    </div>
  )
}
