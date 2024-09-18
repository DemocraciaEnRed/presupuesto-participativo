import React, {Component} from 'react'
import { Link } from 'react-router'
import PopUp from '../Popup/component'
import forumStore from 'lib/stores/forum-store/forum-store'
import textStore from 'lib/stores/text-store'


export default class Footer  extends Component {
  constructor (props) {
   super(props)
    this.state={
      forum:null,
      texts:{}
    }
 }

 componentDidMount(){
  Promise.all([forumStore.findOneByName('proyectos'),
                textStore.findAllDict()])
                .then((results) => {
                  const [forum, textsDict] = results
                  this.setState({forum,texts:textsDict})
                 })
 }
  render(){
    const {forum, texts} = this.state
    return(
  <footer className='footer-static'>
    {forum && <PopUp forum={forum} />}
    <div className='container'>
      <div className='contacto-detalles'>
        <h3>CONTACTO</h3>
        <p dangerouslySetInnerHTML={{__html: texts['footer-info']}}></p>
      </div>
      <div className='social-icon'>
            <a aria-label='Ícono de facebook' className='social-facebook' tabIndex="102" href='https://www.facebook.com/democraciaenred' target="_blank" />
            <a aria-label='Ícono de instagram' className='social-instagram' tabIndex="103" href='https://www.instagram.com/democraciaenred' target="_blank" />
            <a aria-label='Ícono de twitter' className='social-twitter' tabIndex="104" href='https://x.com/fundacionDER' target="_blank" />
            <a aria-label='Ícono de mail' className='social-mail' tabIndex="105" href='mailto:speak@democraciaenred.org' target="_blank" />
      </div>
          {/* <div className='logos'>
        <a href="https://democraciaenred.org/" rel="noopener noreferer" target="_blank">
          <div className='logo-der'>
            <img src="/ext/lib/site/footer/logo-der.png" alt="Logo democracia en red"/>
            <span>Desarrollado por<br /><b>Democracia en red</b></span>
          </div>
        </a>
        <div className='logo'>
          <a className='logo-mgp' tabIndex="107" href='https://www.mardelplata.gob.ar/' aria-label="Link a página de Mar del Plata" rel="noopener noreferer" target="_blank" />
        </div>
      </div> */}
      <div className='terminos'>
        <Link to='/s/terminos-y-condiciones' tabIndex="108"> Términos y condiciones
        </Link>
        <a href="/reglamento" tabIndex="109" rel="noopener noreferer" target="_blank"> Reglamento
        </a>
      </div>
    </div>
  </footer>

    )
  }
}
