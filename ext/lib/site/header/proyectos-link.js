import React from 'react'

export default () => {
  const forumsNames = ['proyectos']
  const isActive = forumsNames.includes(window.location.pathname.replace('/', ''))
  return (
    <a
      href='/proyectos'
      className={`header-link ${window.location.pathname.includes('proyecto') ? 'active' : ''}`}
      style={{ color: isActive && '#8C1E81' }}>
      Proyectos
    </a>
    // <a
    //   href='/proyectos?stage=seguimiento'
    //   className={`header-link ${window.location.pathname.includes('proyecto') ? 'active' : ''}`}
    //   style={{ color: isActive && '#8C1E81' }}>
    //   Proyectos
    // </a>
  )
}
