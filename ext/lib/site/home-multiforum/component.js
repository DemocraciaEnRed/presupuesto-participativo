import React, { Component } from 'react'

import config from 'lib/config'
import Anchor from 'ext/lib/site/anchor'
import BannerForoVecinal from 'ext/lib/site/banner-foro-vecinal/component'
import BannerMapaVectores from 'ext/lib/site/banner-mapa-vectores/component'
import ThumbsVoto from 'ext/lib/site/thumbs-voto/component'
// import Barrios from 'ext/lib/site/barrios/component'
// import Proyectos from 'ext/lib/site/proyectos/component'
// import ProyectosFactibles from 'ext/lib/site/proyectosFactibles/component'
// import ProyectosGanadores from 'ext/lib/site/proyectosGanadores/component'
import Jump from 'ext/lib/site/jump-button/component'
import Footer from 'ext/lib/site/footer/component'
import EncuentrosProximos from 'ext/lib/site/encuentrosProximos/component'
import BannerInvitacion from 'ext/lib/site/banner-invitacion/component'
// import forumStore from 'lib/stores/forum-store/forum-store'
// import topicStore from 'lib/stores/topic-store/topic-store'
import forumStore from 'lib/stores/forum-store/forum-store'
import textStore from 'lib/stores/text-store'
import TypeformButton from './typeform'

export default class HomeMultiforumOverride extends Component {
  constructor (props) {
    super(props)

    this.state = {
      texts: {},
      forum: null
    }
  }

  componentWillMount () {
    const promises=[forumStore.findOneByName('proyectos'),textStore.findAllDict()]

    Promise.all(promises).then((results) => {
      const [forum,textsDict] = results
      this.setState({
        texts: textsDict,
        forum
      })
    }).catch((err) => {
      this.state = {
        texts: {}
      }
    })
  }

  componentDidMount () {
    this.goTop()
  }

  goTop () {
    Anchor.goTo('container')
  }

  render () {
    const {forum} = this.state
    return (
      <div className='ext-home-multiforum'>
        <Anchor id='container'>
          <BannerForoVecinal title={this.state.texts['home-title']} texts={this.state.texts} />
          {forum && <ThumbsVoto texts={this.state.texts} forum={this.state.forum} />}
          {forum && <BannerInvitacion texts={this.state.texts}/>}
          {/* <BannerMapaVectores />
          <EncuentrosProximos  texts={this.state.texts}/> */}
          <Jump goTop={this.goTop} />
          <Footer />
        </Anchor>
      </div>
    )
  }
}
