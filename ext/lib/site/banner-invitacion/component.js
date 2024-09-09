import React from 'react'
import config from 'lib/config'
import {Link} from 'react-router'


export default (props) =>  {
    const {texts} = props
    return(
    <div className="banner-ideas">
        {texts['home-banner-image'] && 
        <img src={texts['home-banner-image']} alt="Ideas"/>
        }
        <p>{texts['home-banner-title']}</p>
        
        {texts['home-banner-button1-text'] && <a href={texts['home-banner-button1-link']} target="_blank" tabIndex="31" className="boton-foro">
            {texts['home-banner-button1-text']}
        </a>}
        {texts['home-banner-button2-text'] && <a href={texts['home-banner-button2-link']} target="_blank" tabIndex="32" className="boton-votacion">{texts['home-banner-button2-text']}</a>} 
    </div>
)
}