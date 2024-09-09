/* global fetch */
import t from 't-component'
import 'whatwg-fetch'
import FormView from '../../form-view/form-view'
import textStore from '../../stores/text-store'
import template from './template.jade'
import request from '../../request/request'
import debug from 'debug'
import Richtext from 'lib/richtext/richtext'


const log = debug('democracyos:admin-contenido-portada')


export default class ContenidoPortadaView extends FormView {
  constructor (zonas) {
    const locals = {
      zonas: zonas,
    }
    super(template, locals)
    textStore.findAll().then(this.loadTexts.bind(this)).then(this.editor.bind(this))
  }

  loadTexts (texts) {
    this.texts = texts
    if (!texts || !texts.length){
      ;
    }else{
      texts.forEach((text) => {
        let el = this.find(`.form-control[data-name='${text.name}']`)
        if (el){
          // ponemos de "name" los ids de los textos
          el.attr('name', text._id)
          el.value(text.text || '')
        }
      })
    }
  }

  textId(textName){
    if (this.texts)
      this.texts.forEach((text) => {
        if(text.name == textName)
          return text._id
      })
  }

  editor() {
    let container = this.find('.textArea');
    container.forEach(el=>{
      const areaText = this.find(`[data-name='${el.dataset.name}']`)
      this.editorWy = new Richtext(areaText);
    })
  }

  showHiden() {
    this.find('.titleShow').on('click', function () {
      document
        .querySelectorAll('.showHiden')
        .forEach(
          (el) =>{
            if(el !== this.nextSibling){
              if(!el.classList.contains('hiden')) {
                el.classList.add('hiden')
                el.parentNode.children[0].children[0].classList.remove('activeAngle')
                el.parentNode.children[0].classList.remove('active')
                el.parentNode.classList.remove('active')
              }
            }

          }
        );

      this.nextSibling.classList.toggle('hiden');
      this.children[0].classList.toggle('activeAngle');
      this.classList.toggle('active')
      this.parentElement.classList.toggle('active')
    });
  }

  switchOn () {
    this.on('success', this.onsuccess.bind(this))
    this.on('error', this.onerror.bind(this))
    this.showHiden()
  }

  switchOff () {
    this.off()
  }

  onsuccess () {
    this.messages(['Los textos se han guardado exitósamente'], 'success')
    textStore.findAll(true).then(this.loadTexts.bind(this))
    window.scrollTo(0,0);
  }

  onerror () {
    this.messages([t('common.internal-error')])
  }
}
