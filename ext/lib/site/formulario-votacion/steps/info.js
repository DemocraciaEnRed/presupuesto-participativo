import React from 'react'

export default ({texts}) => (
    <div className='form-votacion'>
        <div className='votacion-header'>
            <h1>Presupuesto Participativo General Pueyrredon 2023</h1>
        </div>
        <div className='wrapper' dangerouslySetInnerHTML={{__html: texts['votacion-steps']}}>
           
        </div>
    </div>
)