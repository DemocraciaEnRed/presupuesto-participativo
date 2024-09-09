import React, { Component } from 'react'
import { Link } from 'react-router'
import bus from 'bus'
import config from 'lib/config'
import userConnector from 'lib/site/connectors/user'
import UserBadge from 'ext/lib/site/header/user-badge/component'
import PopupMessage from 'ext/lib/site/header/popup-message/component'
import MobileMenu from 'ext/lib/site/header/mobile-menu/component'
import AnonUser from 'ext/lib/site/header/anon-user/component'
import forumStore from 'lib/stores/forum-store/forum-store'

class Header extends Component {
  constructor (props) {
    super(props)

    this.state = {
      userForm: null,
      mobileMenu: false,
      userMenu: false,
      userPrivileges: null,
      forumConfig:null
    }

    props.user.onChange(this.onUserStateChange)
  }

  componentWillMount () {
    bus.on('user-form:load', this.onLoadUserForm)
  }

  componentWillUnmount () {
    bus.off('user-form:load', this.onLoadUserForm)
  }

  onLoadUserForm = (formName) => {
    this.setState({
      userForm: formName
    })
  }

  toggleMobileMenu = () => {
    if (this.state.userMenu) {
      this.setState({
        mobileMenu: !this.state.mobileMenu,
        userMenu: false
      })
    } else {
      this.setState({
        mobileMenu: !this.state.mobileMenu
      })
    }
  }

  toggleUserMenu = (ev, evFromDocument) => {
    if (this.state.mobileMenu) {
      this.setState({
        mobileMenu: false,
        userMenu: !this.state.userMenu
      })
    } else {
      this.setState({ userMenu: !this.state.userMenu })
    }

    // fix bug que el menú queda abierto siempre; con esto al clickear afuera se cierra
    if (!evFromDocument && !this.state.userMenu){
      let fun = this.toggleUserMenu
      let listener = () => {
        fun(null, true)
        document.removeEventListener('click', listener)
      }
      document.addEventListener('click', listener)
    }
  }

  onUserStateChange = () => {
    if (this.props.user.state.fulfilled){
      forumStore.findOneByName(config.forumProyectos).then(
        forum => this.setState({ userPrivileges: forum.privileges, forumConfig: forum.config })
      )
    }
  }

  render () {
    const styles = {
      color: config.headerFontColor,
      backgroundColor: config.headerBackgroundColor
    }
    const showAdmin = this.state.userPrivileges && this.state.userPrivileges.canChangeTopics

    const userState = this.props.user.state
    const {forumConfig} = this.state
    // MEDIA QUERY - Si es menor al breakpoint muestra un menú, si es mayor, otro
    if (window.matchMedia('(max-width: 975px)').matches) {
      return (
        <nav className='navbar navbar-fixed-top navbar-vilo' style={styles} >

          <Link 
            to={config.homeLink}
            className='navbar-brand'
            tabIndex="1"
            >
            <img
              src={config.logoMobile}
              className='d-inline-block align-top'
              alt="Logo de la Municipalidad de Mar del Plata"
              height='30'
              />
          </Link>

          <ul
            className='nav navbar-nav nav-mobile'>

            {/*userState.fulfilled && (
              <li className='nav-item'>
                <Link
                  to='/notifications'
                  className='nav-link'>
                  <span className='icon-bell' />
                </Link>
              </li>
            )*/}

            {userState.fulfilled && (
              <UserBadge
                tabIndex="82"
                menuOn={this.state.userMenu}
                toggleOnClick={this.toggleUserMenu} />
            )}

            {/* {userState.fulfilled && userState.value && !userState.value.dni && !this.state.userMenu && (
              <PopupMessage msg='¡Para votar completá tu perfil con tu DNI!' />
            )} */}

            <MobileMenu
              form={this.state.userForm}
              menuOn={this.state.mobileMenu}
              showAdmin={showAdmin}
              toggleOnClick={this.toggleMobileMenu}
              forumConfig={forumConfig} />

          </ul>
        </nav>
      )
    } else {
      return (
        <nav className='navbar navbar-fixed-top navbar-vilo' style={styles}>
          <Link
            to={config.homeLink}
            className='navbar-brand'
            aria-label="Link a página de inicio"
            tabIndex="1">
            <img
              src={config.logo}
              alt="Logo de la Municipalidad de Mar del Plata"
              className='d-inline-block align-top'
            />
          </Link>

          <ul className='nav navbar-nav'>

            <li className={`header-item ${window.location.pathname.includes('/acerca-de') ? 'active' : ''}`}>
              <Link
                to='/acerca-de'
                className='header-link'
                tabIndex="82"
                >
                  Acerca de
              </Link>
            </li>
            <li className={`header-item ${window.location.pathname.includes('/propuestas') ? 'active' : ''}`}>
              <Link
                to='/propuestas'
                className='header-link'
                tabIndex="83"
                onClick={() => window.location.href = '/propuestas'}
                >
                  Ideas y Proyectos
              </Link>
            </li>         
            <li className={`header-item ${window.location.pathname.includes('/archivo') ? 'active' : ''}`}>
              <Link
                to='/archivo'
                className='header-link'
                tabIndex="83"
                onClick={() => window.location.href = '/archivo'}
                >
                  Archivo
              </Link>
            </li>                
            { forumConfig && forumConfig.votacion && <li className={`header-item ${window.location.pathname.includes('/votacion') ? 'active' : ''}`}>
              <Link
                to='/votacion'
                className='header-link'
                tabIndex="84"
                >
                  Votá
              </Link>
            </li>
            } 
            { showAdmin &&
              <li className={`header-item ${window.location.pathname.includes('/admin') ? 'active' : ''}`}>
                <Link
                  to='/proyectos/admin/topics'
                  className='header-link'
                  tabIndex="85"
                  >
                    Admin
                </Link>
              </li>
            }
            {/*<div className={`header-item">
              <Link
                to='/s/herramientas'
                className='header-link'
                activeStyle={{ color: '#8C1E81' }}>
                  Herramientas
              </Link>
            </div>*/}

            {/*userState.fulfilled && (
              <li className='nav-item'>
                <Link
                  to='/notifications'
                  className='nav-link hidden-xs-down'>
                  <span className='icon-bell' />
                </Link>
              </li>
            )*/}

            {userState.fulfilled && (
              <UserBadge
                menuOn={this.state.userMenu}
                toggleOnClick={this.toggleUserMenu} />
            )}

            {/* {userState.fulfilled && userState.value && !userState.value.dni && !this.state.userMenu && (
              <PopupMessage msg='¡Para votar completá tu perfil con tu DNI!' />
            )} */}

            {userState.rejected && (
              <AnonUser form={this.state.userForm} />
            )}
          </ul>
        </nav>
      )
    }
  }
}

export default userConnector(Header)
