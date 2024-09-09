import React from 'react'

export default ({dni, hasVoted}) => {

    const socialLinksUrl = window.location
    const shareText = '¡Ayudanos a mejorar el Municipio de General Pueyrredon! Votá los proyectos del presupuesto participativo en'
    return (
        <div className='form-votacion'>
            {hasVoted === 'yes' ? 
                (<div className='votacion-header'>
                    <h1 className='text-center'>
                        El dni {dni} ya emitió su voto!
                    </h1>
                    <p>No se puede votar 2 veces</p>
                </div>) :
                (<div className='votacion-header'>
                    <h1 className='text-center'>
                    ¡Muchas gracias por tu voto!
                    </h1>
                    <p>Hemos recibido tus votos correctamente</p>
                </div>)
            }
            <div className='wrapper text-center'>
                Te agradecemos nuevamente por haber participado del primer Presupuesto participativo de General Pueyrredon
            </div>
    
            <div className='votacion-share text-center'>
                ¡Ayúdanos a mejorar el alcance de la votación! <br />
                Compartilo en redes
                <div className='share-links'>
                    <a target='_blank' href={`https://www.facebook.com/sharer.php?u=${socialLinksUrl}`} rel='noopener noreferrer' className='facebook-icon'></a>
                    <a target='_blank' href={`https://twitter.com/share?text=${shareText}&url=${socialLinksUrl}`} rel='noopener noreferrer' className='twitter-icon'></a>
                    <a target='_blank' href={`https://api.whatsapp.com/send?text=${shareText + " " + socialLinksUrl}`} rel='noopener noreferrer' className='wp'></a>
                </div>  
                <br />
                <p>Próximamente podrás conocer los resultados en la web del presupuesto participativo</p>
            </div>
    
    
        </div>
    )
}