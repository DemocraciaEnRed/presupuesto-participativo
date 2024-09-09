import React from 'react'



const PopUp = (props) => {
	const { forum } = props

	const handleTypeForm = (event)=>{
		const form = document.getElementById('typeform-full')
		form.classList.toggle('closed')
		event.stopPropagation()
		event.currentTarget.classList.toggle('active')
	}

	if (forum.config.mostrarFormulariosProyectistas) {
		return (
			<div className='side-panel' >
				<iframe
      			  title="Embedded Typeform"
      			  id="typeform-full"
      			  frameBorder="0"
      			  src="https://form.typeform.com/to/cbSeR97L?typeform-medium=embed-snippet"
				  className='closed'
      			></iframe>
				<button onClick={handleTypeForm} className='popup-proyectista' > <span className='glyphicon glyphicon-comment'></span><span className='text-popup'> ¡Quiero ser proyectista! </span></button>
			</div>
		)
	}
	else if (forum.config.votacion) {
		return (
			<div className='side-panel' id='side_panel'>
				<a href="/votacion" className='popup-proyectista' >	<span className='text-popup'> ¡Quiero votar! </span></a>
			</div>
		)
	}
	else{return(null)}
}


export default PopUp