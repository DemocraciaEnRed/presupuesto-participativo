import React, { Component } from 'react'
import config from 'lib/config'
import forumStore from 'lib/stores/forum-store/forum-store'
import topicStore from 'lib/stores/topic-store/topic-store'
import zonaStore from 'lib/stores/zona-store'

import tagStore from 'lib/stores/tag-store/tag-store'
import Tags from 'lib/admin/admin-topics-form/tag-autocomplete/component'
import Attrs from 'lib/admin/admin-topics-form/attrs/component'
import { browserHistory } from 'react-router'
import userConnector from 'lib/site/connectors/user'
import { Link } from 'react-router'

// const PROPOSALS_FORUM_NAME = 'propuestas'

const descripciones = {
  'otras-ideas-innovadoras': "Contanos con el mayor detalle posible, tu idea innovadora de solución",
  'asfalto/mejora-asfaltica': "Cantidad de cuadras/Metros\nEs cordón cuneta? (Si/No)\nSolo cordón cuneta? (Sí/No)",
  'luminarias': "Hay que instalar nuevas luminarias o convertir la luminaria a LED?",
  'semáforos/reductores-de-velocidad': "En qué calle o intersección? (completar en el campo Dirección al final del formulario)\nCuántos hacen falta?",
  'plazas/espacios-públicos': "De qué tipo? Plaza / Playón deportivo/ Skatepark\nQue hay que mejorar o inlcuirr? (Veredas, iluminación, juegos, bancos, cestos de basura, mejorar el paisajismo, delimitar canchas, Iluminación)",
  'capacitaciones/actividades-deportivas': "Que tipo de actividad hace falta?\nDonde la realizarias (lugar y calles), cuantas veces por semana y de cuanto tiempo?",
  'bicisendas': "Que recorrido o para que calles?",
  'mejoras-de-accesibilidad': "Que cantidad de rampas?\nGrandes o pequeñas?",
  'ideas-para-organizaciones/clubes': "",
}






class FormularioPropuesta extends Component {
  constructor (props) {
    super(props)

    this.state = {
      mode: null,

      forum: null,
      topic: null,

      nombre: '',
      zona: '',
      documento: '',
      // genero: '',
      email: '',
      titulo: '',
      tag: '',
      problema: '',
      solucion: '',
      beneficios: '',
      ubicacion: '',
      telefono: '',
      requirementsAccepted: false,
      
      state: '',
      adminComment: '',
      adminCommentReference: '',
      
      availableTags: [],
      zonas: [],
    }

    this.handleInputChange = this.handleInputChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    
  }

  handleInputChange (evt) {
    evt.preventDefault()
    const { target: { value, name } } = evt
    this.setState({ [name]: value })
  }

  componentWillMount () {
    const isEdit = this.props.params.id ? true : false

    const promises = [
      // data del forum
      forumStore.findOneByName('proyectos'),
      tagStore.findAll(),
      zonaStore.findAll(),
    ]

    // si es edición traemos data del topic también
    if (isEdit)
      promises.push(topicStore.findOne(this.props.params.id))

    Promise.all(promises).then(results => {
      // topic queda en undefined si no estamos en edit
      const [forum, tags, zonas, topic] = results
      let newState = {
        forum,
        availableTags: tags,
        zonas,
        mode: isEdit ? 'edit' : 'new'
      }

      if (isEdit)
        Object.assign(newState, {
          titulo: topic.mediaTitle,
          documento: topic.attrs.documento,
          // genero: topic.attrs.genero,
          zona: topic.zona.id,
          tag: topic.tag,
          problema: topic.attrs.problema,
          solucion: topic.attrs.solucion,
          beneficios: topic.attrs.beneficios,
          telefono: topic.attrs.telefono,
          ubicacion: topic.attrs.ubicacion,
          state: topic.attrs.state,
          adminComment: topic.attrs['admin-comment'],
          adminCommentReference: topic.attrs['admin-comment-reference'],
        })
      this.setState(newState, () => {
        // updateamos campos de usuario
        // (recién dps del setState tendremos zonas cargadas)
        this.props.user.onChange(this.onUserStateChange)
        // si ya está loggeado de antes debería pasar por la función igualmente
        this.onUserStateChange()
      })
      const hash = window.location.hash;
      if (hash && document.getElementById(hash.substr(1))) {
          // Check if there is a hash and if an element with that id exists
          const element = document.getElementById(hash.substr(1));
          const headerOffset = 100;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition - headerOffset;
          window.scrollTo({
               top: offsetPosition,
               behavior: "smooth"
          });
      }
    }).catch(err =>
      console.error(err)
    )
  }

  onUserStateChange = () => {
    if (this.props.user.state.fulfilled){
      let user = this.props.user.state.value
      this.setState({
        // zona: user.zona._id,
        email: user.email,
        documento: user.dni,
        nombre: user.firstName + ' ' + user.lastName,
        zona: user.zona.id
      })
    }
  }

  handleSubmit (e) {
    e.preventDefault()
    const formData = {
      forum: this.state.forum.id,
      mediaTitle: this.state.titulo,
      tag: this.state.tag.id,
      'attrs.documento': this.state.documento,
      'attrs.telefono': this.state.telefono,
      // 'attrs.genero': this.state.genero,
      'attrs.problema': this.state.problema,
      'attrs.solucion': this.state.solucion,
      'attrs.beneficios': this.state.beneficios,
      'attrs.ubicacion': this.state.ubicacion,
      zona: this.state.zona,
    }
    if (this.state.forum.privileges && this.state.forum.privileges.canChangeTopics && this.state.mode === 'edit') {
      formData['attrs.admin-comment'] = this.state.adminComment
      formData['attrs.admin-comment-referencia'] = this.state.adminCommentReference
      formData['attrs.state'] = this.state.state
    }
    console.log(formData);

    if (this.state.mode === 'new') {
      this.crearPropuesta(formData)
    } else {
      this.editarPropuesta(formData)
    }
  }

  crearPropuesta = (formData) => {
    window.fetch(`/api/v2/topics`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify(formData),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then((res) => res.json())
    .then((res) => {
      if (res.status === 200) {
        window.location.href = `/propuestas/topic/${res.results.topic.id}`
      }
    })
    .catch((err) => {
      console.log(err)
    })
  }

  editarPropuesta (formData) {
    window.fetch(`/api/v2/topics/${this.props.params.id}`, {
      method: 'PUT',
      credentials: 'include',
      body: JSON.stringify(formData),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then((res) => {
      if (res.status === 200) {
        window.location.href = `/propuestas/topic/${this.props.params.id}`
      }
    })
    .catch((err) => {
      console.log(err)
    })
  }

  toggleTag = (tag) => (e) => {
    // If is inside state.tags, remove from there
    const currentTag = this.state.tag
    this.setState((state) => {
      if (currentTag === '') {
        return {tag}
      } else if (currentTag.id === tag.id){
        return { tag: ''}
      }
    })
  }

  hasErrors = () => {
    if (this.state.nombre === '') return true
    if (this.state.documento === '') return true
    // if (this.state.genero === '') return true
    if (this.state.email === '') return true
    if (this.state.titulo === '') return true
    if (this.state.telefono === '') return true
    if (this.state.problema === '') return true
    if (this.state.tag === '' ) return true
    if (this.state.solucion === '') return true
    if (this.state.beneficios === '') return true
    if (this.state.zona === '') return true
    return false;

  }

  hasErrorsField = (field) => {
    const val = this.state[field]
    if(val === '' || (val && val.length == 0)) return true
    return false;
  }

  handleCheckboxInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  componentWillUpdate (props, state) {
    if (this.props.user.state.rejected) {
      browserHistory.push('/signin?ref=/formulario-idea')
    }
  }

  render () {
    const { forum, zonas, requirementsAccepted } = this.state

    if (!forum) return null
    if(forum.config.propuestasAbiertas || (this.state.forum.privileges && this.state.forum.privileges.canChangeTopics)) {
    return (
      <div className='form-propuesta'>
        <div className='propuesta-header'>
          <h1 className='text-center'>Formulario para enviar ideas</h1>
        </div>
        <p className='subtitle'>¡Compartinos tus ideas para mejorar nuestra comunidad!</p>
        {/* FORMULARIO GOES BEHIND THIS */}
        <form className='wrapper' onSubmit={this.handleSubmit}>
          <div className="bar-section">
            <p className="section-title">Tus datos</p>
            <p className="section-subtitle">Todos estos datos son confidenciales</p>
          </div>
          <input type='hidden' name='forum' value={forum.id} />
          <div className='form-group'>
            <label className='required' htmlFor='nombre'>
              Nombre y apellido
            </label>
            <input
              className='form-control'
              required
              type='text'
              max='128'
              name='nombre'
              value={this.state['nombre']}
              placeholder=""
              onChange={this.handleInputChange}
              disabled={true} />
          </div>
          <div className='form-group'>
            <label className='required' htmlFor='documento'>
              DNI
            </label>
            <input
              className='form-control'
              required
              type='text'
              max='50'
              name='documento'
              placeholder=""
              value={this.state['documento']}
              onChange={this.handleInputChange}
              disabled={true}/>
          </div>

          <div className='form-group'>
            <label htmlFor='zona'>
              Zona
            </label>

            <select
              className='form-control'
              name='zona'
              value={this.state['zona']}
              onChange={this.handleInputChange}
              style={{ 'height': '50px' }}
              disabled={true}
            >
              <option value=''>Pertenece a la zona...</option>
              {zonas.length > 0 && zonas.map(zona =>
                <option key={zona._id} value={zona._id}>
                  {zona.nombre}
                </option>
              )}
            </select>

          </div>
          <div className='form-group'>
            <label className='required' htmlFor='email'>
              Email
            </label>
            <input
              className='form-control'
              required
              type='text'
              max='128'
              name='email'
              placeholder=""
              value={this.state['email']}
              onChange={this.handleInputChange}
              disabled={true} />
          </div>

          <div className="bar-section acerca-propuesta">
              <p className="section-title">Acerca de la idea</p>
          </div>
          <div className="bar-section acerca-requisitos">
              <p className='section-title'>Requisitos para que las propuestas sean factibles</p>
          </div>

          <div className="bullet-requisitos">
            <ul>
              <li>Inversión en espacios públicos, actividades de bien público (talleres, capacitaciones, etc) y compra de bienes muebles para entidades sin fines de lucro.</li>
              <li>Superar el análisis de factibilidad legal, técnica, económica y de impacto social.</li>
              <li>Para entidades sin fines de lucro: contemplar un convenio con el municipio como contraprestación.</li>
              <li>No superar el monto presupuestario asignado a la zona donde se ubica la propuesta.</li>
            </ul>
              
          </div>
          <div className="bar-section acerca-requisitos">
              <p className='section-title'>No serán factibles:</p>
          </div>

          <div className="bullet-requisitos">
            <ul>
              <li>Propuestas que impliquen un gasto corriente recurrente (recursos humanos que incrementen la planta municipal).</li>
              <li>Afectar a proyectos ya existentes o en curso.</li>
              <li>Subsidios en beneficio directo de quien lo proponga.</li>
              <li>Inversiones en inmuebles pertenecientes a instituciones y/o entidades sin fines de lucro.</li>
              <li>Para entidades sin fines de lucro: proyectos que superen el monto establecido para el procedimiento de “Concurso de Precios” del art. 151° de la Ley Orgánica de las Municipalidades y modificatorias.</li>
              <li>Proyectos que no se encuentren dentro del ámbito de competencia del municipio o contradigan la normativa vigente.</li>
            </ul>
          </div>          

          <div className="row ideas-no-factibles">
            <div className="col-sm-6 ">
              <div className="idea-no-factible">
                <img src="/ext/lib/site/formulario-propuesta/no-factible.png" alt="Ícono propuesta no factible"/>
                <p>Cloacas y red de agua para mi barrio</p>
              </div>
            </div>
            <div className="col-sm-6 ">
              <div className="idea-no-factible">
                <img src="/ext/lib/site/formulario-propuesta/no-factible.png" alt="Ícono propuesta no factible"/>
                <p>Asfaltar todas las calles de </p>
              </div>
            </div>
            <div className="col-sm-6 ">
              <div className="idea-no-factible">
                <img src="/ext/lib/site/formulario-propuesta/no-factible.png" alt="Ícono propuesta no factible"/>
                <p>Mejora en la escuela provincial nro.x</p>
              </div>
            </div>
            <div className="col-sm-6 ">
              <div className="idea-no-factible">
                <img src="/ext/lib/site/formulario-propuesta/no-factible.png" alt="Ícono propuesta no factible"/>
                <p>Más personal en los centros municipales </p>
              </div>
            </div>            
          </div>
            
          <div className="row ideas-factibles">
            <div className="col-sm-6 ">
              <div className="idea-factible">
                <img src="/ext/lib/site/formulario-propuesta/factible.png" alt="Ícono propuesta no factible"/>
                <p>Colocar un semáforo en la esquina de calle A y calle B</p>
              </div>
            </div>
            <div className="col-sm-6 ">
              <div className="idea-factible">
                <img src="/ext/lib/site/formulario-propuesta/factible.png" alt="Ícono propuesta no factible"/>
                <p>Equipamiento para la entidad X</p>
              </div>
            </div>
            <div className="col-sm-6 ">
              <div className="idea-factible">
                <img src="/ext/lib/site/formulario-propuesta/factible.png" alt="Ícono propuesta no factible"/>
                <p>Juegos en la plaza X</p>
              </div>
            </div>
            <div className="col-sm-6 ">
              <div className="idea-factible">
                <img src="/ext/lib/site/formulario-propuesta/factible.png" alt="Ícono propuesta no factible"/>
                <p>Construir Skatepark / Parkour / Playón Deportivo</p>
              </div>
            </div>            
          </div>
                        
          <hr />
          
          <p className='aceptar-tyc'>Para comenzar a completar el formulario, debe aceptar los términos y condiciones</p>


          { !requirementsAccepted && <div className="bar-section">
            <button type="button" className='btn-requirements-accepted' onClick={() => {this.setState({requirementsAccepted: !requirementsAccepted})}}>
              Mi idea cumple con todo
            </button>
          </div>
          }
          

          

          { requirementsAccepted && <section>
          
          <div className="bar-section acerca-requisitos mt-6">
            <p className='section-title'>Contanos sobre tu idea</p>
          </div>


          <div className='form-group mt-5'>
            <label className='required' htmlFor='titulo'>
              * Título de la idea
            </label>
            <p className="help-text">Elegí un título</p>
            <input
              className='form-control'
              required
              type='text'
              max='128'
              name='titulo'
              value={this.state['titulo']}
              onChange={this.handleInputChange} />
          </div>       

          <div className='form-group'>
            <label className='required' htmlFor='telefono'>
              * Número de teléfono
            </label>
            <p className="help-text">Únicamente será para contactarte por dudas o avances sobre tu idea.</p>
            <input
              className='form-control'
              required
              type='text'
              max='128'
              name='telefono'
              value={this.state['telefono']}
              onChange={this.handleInputChange} />
          </div>         

          <div className='form-group'>
            <label className='required' htmlFor='problema'>
              * Problema o necesidad existente
            </label>
            <p className='help-text'>¿Qué problemas querés resolver? ¿a quiénes afecta? ¿Cómo?</p>
            {/*<p className='help-text'><strong>Recordá ingresar solo una idea por formulario</strong></p>*/}
            <textarea
              className='form-control'
              required
              rows='7'
              max='5000'
              name='problema'
              value={this.state['problema']}
              onChange={this.handleInputChange}>
            </textarea>
          </div>      

          <div className='tags-autocomplete'>
            <label className='required'>
              * Tipo de proyecto
            </label>
            <p className='help-text'>Tipologias para Espacio publico</p>
            {
              this.state.mode === 'edit' && this.state.availableTags && <div>
                <ul className="tags">
                {
                  this.state.availableTags.filter(tag => tag.hash !== "ideas-para-organizaciones/clubes").map((tag) => {
                    return (
                      <li key={tag.id}><span onClick={this.toggleTag(tag)} value={tag.id} className={this.state.tag.id === tag.id ? 'tag active' : 'tag'}>{tag.name}</span></li>
                    )
                  })
                }
                </ul>
                <p className='help-text'>Tipologías para Organizaciónes de base / Clubes / Etc</p>
                <ul className="tags">
                {
                  this.state.availableTags.filter(tag => tag.hash === "ideas-para-organizaciones/clubes").map((tag) => {
                    return (
                      <li key={tag.id}><span onClick={this.toggleTag(tag)} value={tag.id} className={this.state.tag.id === tag.id ? 'tag active' : 'tag'}>{tag.name}</span></li>
                    )
                  })
                }
                </ul>
              </div>
            }
            {
              this.state.mode === 'new' && <div>
                <ul className="tags">
                {
                  this.state.availableTags.filter(tag => tag.hash !== "ideas-para-organizaciones/clubes").map((tag) => {
                    return (
                      <li key={tag.id}><span onClick={this.toggleTag(tag)} value={tag.id} className={this.state.tag.id === tag.id ? 'tag active' : 'tag'}>{tag.name}</span></li>
                    )
                  })
                }
                </ul>
                <p className='help-text'>Tipologías para Organizaciónes de base / Clubes / Etc</p>
                <ul className="tags">
                {
                  this.state.availableTags.filter(tag => tag.hash === "ideas-para-organizaciones/clubes").map((tag) => {
                    return (
                      <li key={tag.id}><span onClick={this.toggleTag(tag)} value={tag.id} className={this.state.tag.id === tag.id ? 'tag active' : 'tag'}>{tag.name}</span></li>
                    )
                  })
                }
                </ul>                
              </div>
            }
          </div>
          
          {this.state.tag && this.state.tag.hash === "ideas-para-organizaciones/clubes" && <div className="disclaimer-orgas mb-3">
          Las <b>ideas dirigidas a mejorar o equipar organizaciones serán evaluadas internamente</b> en primera instancia, y luego de aprobadas podrán avanzar a siguientes etapas. <br />
          <b>NO serán factibles aquellas ideas que impliquen entregar equipamiento o construcción/refacción del inmueble.</b>
          </div>}

          <div className='form-group'>
            <label className='required' htmlFor='solucion'>
              * La propuesta de solución / tu idea
            </label>
            {this.state.tag && descripciones[this.state.tag.hash].split(/\n/).map((p, i)=> <p className='help-text'>{p}</p>)}
            <textarea
              className='form-control'
              required
              rows='7'
              max='5000'
              name='solucion'
              value={this.state['solucion']}
              onChange={this.handleInputChange}>
            </textarea>
          </div>


          <div className='form-group'>
            <label className='required' htmlFor='beneficios'>
              * Beneficios que brindará el proyecto al barrio
            </label>
            <p className='help-text'>¿Como ayuda este proyecto al barrio? ¿Quiénes se benefician?</p>
            <textarea
              className='form-control'
              required
              rows='7'
              max='5000'
              name='beneficios'
              value={this.state['beneficios']}
              onChange={this.handleInputChange}>
            </textarea>
          </div> 

          <div className="parte-ubicacion mt-5">
            <p className='section-title'>Ubicación</p>
          </div>
          <hr />


          <div className='form-group'>
            <label htmlFor='ubicacion'>
              ¿Cuál es la dirección (calle y altura)? (opcional)
            </label>
            <input
              className='form-control'
              type='text'
              max='128'
              name='ubicacion'
              value={this.state['ubicacion']}
              onChange={this.handleInputChange} />
          </div>



          {this.state.forum.privileges && this.state.forum.privileges.canChangeTopics && this.state.mode === 'edit' && (
            <div className='form-group'>
              <label htmlFor='state'>Estado</label>
              <span className='help-text requerido'>Agregar una descripción del estado del proyecto</span>
              <select
                className='form-control special-height'
                name='state'
                value={this.state['state']}
                onChange={this.handleInputChange}>
                <option value='pendiente'>Pendiente</option>
                <option value='factible'>Factible</option>
                <option value='no-factible'>No factible</option>
                <option value='integrado'>Integrada</option>
              </select>
            </div>
          )}
          {this.state.forum.privileges && this.state.forum.privileges.canChangeTopics && this.state.mode === 'edit' && (
            <div className='form-group'>
              <label htmlFor='adminComment'>Comentario del moderador:</label>
              <span className='help-text requerido'>Escribir aquí un comentario en el caso que se cambie el estado a "factible", "rechazado" o "integrado"</span>
              <textarea
                className='form-control'
                rows='6'
                max='5000'
                name='adminComment'
                value={this.state['adminComment']}
                onChange={this.handleInputChange}>
              </textarea>
            </div>
          )}
          {this.state.forum.privileges && this.state.forum.privileges.canChangeTopics && this.state.mode === 'edit' && (
            <div className='form-group'>
              <label htmlFor='adminCommentReference'>Link a la propuesta definitiva:</label>
              <span className='help-text requerido'>Escribir aquí el link al proyecto vinculado, en caso que se cambie el estado a "integrado"</span>
              <input
                type='text'
                className='form-control'
                name='adminCommentReference'
                value={this.state['adminCommentReference']}
                onChange={this.handleInputChange} />
            </div>
          )}
          {
             this.hasErrors() &&
             <div className="error-box mt-6">
             <ul>
                    {this.hasErrorsField('nombre') && <li className="error-li">El campo "Nombre y apellido" no puede quedar vacío</li> }
                    {this.hasErrorsField('documento') && <li className="error-li">El campo "DNI" no puede quedar vacío</li> }
                    {/* {this.hasErrorsField('genero') && <li className="error-li">El campo "Género" no puede quedar vacío</li> } */}
                    {this.hasErrorsField('email') && <li className="error-li">El campo "Email" no puede quedar vacío</li> }
                    {this.hasErrorsField('titulo') && <li className="error-li">El campo "Título" no puede quedar vacío</li> }
                    {this.hasErrorsField('telefono') && <li className="error-li">El campo "Teléfono" no puede quedar vacío</li> }
                    {this.hasErrorsField('problema') && <li className="error-li">El campo "Problema" no puede quedar vacío</li> }
                    {this.hasErrorsField('tag') && <li className="error-li">El campo "Tipo" no puede quedar vacío</li> }
                    {this.hasErrorsField('solucion') && <li className="error-li">El campo "Tu idea" no puede quedar vacío</li> }
                    {this.hasErrorsField('beneficios') && <li className="error-li">El campo "Beneficios" no puede quedar vacío</li>}
                    {this.hasErrorsField('zona') && <li className="error-li">El campo "Zona" no puede quedar vacío</li> }
             </ul>
             </div>
          }
          <div className='submit-div'>
            { !this.hasErrors() &&
              <button type='submit' className='submit-btn'>
                {this.state.mode === 'new' ? 'Enviar idea' : 'Guardar idea'}
              </button>
            }
          </div>
          <p className="more-info add-color">¡Luego de mandarla, podés volver a editarla!</p>
          </section>}

          
        </form>
      </div>
    )

    } return (
      <div className='form-propuesta'>
        <div className='propuesta-header'>
          <h1 className='text-center'>PRESUPUESTO PARTICIPATIVO</h1>
          {/* <p>¡Acá vas a poder subir tu propuesta para el presupuesto participativo!</p> */}
          <p>¡Gracias a todos y todas por participar!</p>
        </div>
        {/* ALERT PARA FIN DE ETAPA */}
        <alert className='alert alert-info cronograma'>
          <Link style={{ display: 'inline' }} to='/acerca-de?scroll=cronograma'>
            La etapa de envío de propuestas ya ha sido cerrada. ¡Muchas gracias por participar!
          </Link>
        </alert>
     </div>
    )
  }
}

export default userConnector(FormularioPropuesta)
