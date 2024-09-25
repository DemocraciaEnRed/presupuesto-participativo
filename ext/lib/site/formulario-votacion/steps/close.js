import React from 'react'
import { Link } from 'react-router'

export default () => (
    <div className='form-votacion'>
        <div className='votacion-header'>
      <h1 className='text-center'>Presupuesto Participativo</h1>
            <p>Gracias por participar de la votacion del presupuesto participativo 2023</p>
        </div>
        <div className='wrapper text-center'>
          <alert className='alert alert-info cronograma'>
        <Link style={{ display: 'inline' }} to='/acerca-de?scroll=cronograma'>
              La etapa de votacion ya ha sido cerrada. ¡Muchas gracias por participar!
            </Link>
          </alert>
        </div>
    </div>
)