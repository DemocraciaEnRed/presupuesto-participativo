import t from 't-component'
import 'whatwg-fetch'
import Sortable from 'sortable-dnd'
import Richtext from 'lib/richtext/richtext'
import FormView from '../../form-view/form-view'
import aboutstore from 'lib/stores/about-store/about-store'
import forumStore from '../../stores/forum-store/forum-store'

import confirm from '../../modals/confirm'

import template from './template.jade'

function createElementFromHTML (htmlString) {
  let div = document.createElement('div')
  div.innerHTML = htmlString.trim()
  // Change this to div.childNodes to support multiple top-level nodes.
  return div.firstChild
}

export default class AboutUs extends FormView {
  constructor () {
    let options = {
      form: { action: `/api/v2/about` }
    }
    super(template, options)
    this.options = options

    aboutstore.findAll().then(this.loadAbout.bind(this))
    forumStore.findOneByName('proyectos').then(this.loadSettings.bind(this))
  }

  loadAbout (faqs) {
    this.panelGroup = this.find('.panel-group')
    let templatePanel = this.find('.template-panel-group')
    this.panelElement = this.find(`.template`)
    if(faqs.length > 0){


      faqs.forEach((faq, idx) => {
        const self = this
        let question = faq.question
        let answer = faq.answer

        let panel = createElementFromHTML(templatePanel.html())
        panel.classList.remove('template')
        let panelHead = panel.querySelector('.panel-heading')
        let header = panel.querySelector('.panel-title')
        let collapsePanel = panel.querySelector('.panel-collapsable')
        let body = panel.querySelector('.panel-body')
        let editIcon = panel.querySelector('.glyphicon-edit')
        let deleteIcon = panel.querySelector('.glyphicon-trash')

        panelHead.setAttribute('id', `heading${idx}`)
        header.innerHTML = question
        collapsePanel.setAttribute('id', `collapse${idx}`)
        collapsePanel.classList.add('hidden')
        body.innerHTML = answer

        editIcon.setAttribute('id', `edit-icon${idx}`)
        editIcon.addEventListener('click', () => {
          this.addItemToEdit(faq)
        })

        deleteIcon.setAttribute('id', `delete-icon${idx}`)
        deleteIcon.addEventListener('click', () => {
          this.deleteItem(faq)
        })

        panelHead.addEventListener('click', function () {
          self.showBody(this.id)
        })
        panel.classList.add('list')
        panel.setAttribute('id', faq.id)

        self.panelGroup.append(panel)
      })
      this.iconSort = this.find('.glyphicon-sort')
    }else{
      this.panelGroup.addClass('hidden')
      this.sorter.addClass('hidden')
    }
    this.panelElement.addClass('hidden')
  }

  loadSettings (forum) {
    this.forum = forum
  }

  reloadAbout (faqs) {
    this.panelElement.removeClass('hidden')
    this.panelGroup.removeClass('hidden')
    this.sorter.removeClass('hidden')
    this.panelGroup.empty()
    this.loadAbout(faqs)
  }

  editor () {
    let container = this.find('.textArea')
    this.editorWy = new Richtext(container)
    this.alert = document.querySelector('.alertText')
  }

  addItemToEdit (element) {
    let answer = document.querySelector('.ql-editor')
    this.alert.parentNode.classList.remove('hidden')
    this.alert.innerHTML = ` Estás editando la pregunta "${element.question}", si querés crear una nueva pregunta y respuesta presioná cancelar`
    this.question.value = element.question
    answer.innerHTML = element.answer
    let form = document.getElementById('editForm')
    form.setAttribute('action', `/api/v2/about/${element.id}`)
    form.setAttribute('method', 'put')

    let headerOffset = 64
    let elementPosition = form.getBoundingClientRect().top
    let offsetPosition = elementPosition + window.pageYOffset - headerOffset
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    })
  }

  saveItem () {
    const self = this
    let save = this.find('.btn-success')
    this.formEditor = this.find('form')
    this.question = document.getElementById('question')

    save.on('click', function () {
      if (!self.question.value) return
      let forumInput = document.querySelector('input[name="forum"]')
      forumInput && forumInput.parentNode.removeChild(forumInput)
      self.formEditor.append(`<input type="hidden" name="forum" value="${self.forum.id}" /> `)
    })
  }

  deleteItem (item) {
    confirm({
      text: (`¿seguro queres borrar esta pregunta?`)
    }).accepts(() => {
      fetch(`/api/v2/about/${item.id}`, {
        method: 'DELETE',
        headers: {
          'Content-type': 'application/json; charset=UTF-8'
        },
        body: JSON.stringify({ forum: this.forum.id })
      }).then(() => { aboutstore.findAll().then(this.reloadAbout.bind(this)).then(this.setDefault()) })
    })
  }

  cancelEdit () {
    const self = this
    let cancel = this.find('.btn-danger')
    cancel.on('click', () => self.setDefault())
  }

  showBody (id) {
    let idHead = id.split('heading')[1]
    let bodyToShow = document.getElementById(`collapse${idHead}`)
    let bodyToHidden = document.querySelectorAll('.panel-collapsable')
    bodyToHidden.forEach((panelBody) => {
      if (panelBody.classList.contains('hidden')) return
      if (panelBody.id.split('collapse')[1] === idHead) return
      panelBody.classList.add('hidden')
    })
    bodyToShow.classList.toggle('hidden')
  }

  setDefault () {
    let textArea = this.find('#answer')
    let forumInput = document.querySelector('input[name="forum"]')
    let question = document.getElementById('question')

    this.editorWy.editor.setText('')
    forumInput && forumInput.parentNode.removeChild(forumInput)
    this.formEditor.attr('action', this.options.form.action)
    !this.alert.parentNode.classList.contains('hidden') && this.alert.parentNode.classList.add('hidden')
    this.formEditor.attr('method', 'post')
    question.value = ''
    textArea.attr('value', '')
  }

  cancelSortable () {
    this.cancelSort.on('click', () => {
      this.list.options.disabled = true
      this.sorter.removeClass('hidden')
      this.cancelSort.addClass('hidden')
      this.saveSort.addClass('hidden')
      this.iconSort.addClass('hidden')
      aboutstore.findAll().then(this.reloadAbout.bind(this))
    })
  }

  sortSave () {
    this.saveSort.on('click', () => {
      let list = Array.from(document.querySelectorAll('.list'))
      let data = list.map((faq, idx) => {
        return {
          'id': faq.id,
          'order': idx
        }
      })
      fetch(`/api/v2/about-update-order`, {
        method: 'PUT',
        headers: {
          'Content-type': 'application/json; charset=UTF-8'
        },
        body: JSON.stringify({ forum: this.forum.id, data })
      }).then(
        this.list.options.disabled = true,
        this.sorter.removeClass('hidden'),
        this.cancelSort.addClass('hidden'),
        this.saveSort.addClass('hidden'),
        this.iconSort.addClass('hidden'),
        this.messages(['El orden se ha guardado exitósamente'], 'success')
      )
    })
  }

  createSortTable () {
    this.sorter = this.find('.createSortable')
    this.saveSort = this.find('.save-order')
    this.cancelSort = this.find('.cancel-order')
    this.sorter.on('click', () => {
      this.list.options.disabled = false
      this.sorter.addClass('hidden')
      this.cancelSort.removeClass('hidden')
      this.saveSort.removeClass('hidden')
      this.iconSort.removeClass('hidden')
      let bodyToHidden = document.querySelectorAll('.panel-collapsable')
      bodyToHidden.forEach((panelBody) => {
        panelBody.classList.add('hidden')
      })
      this.cancelSortable()
      this.sortSave()
    })
  }

  switchOn () {
    this.list = new Sortable(document.querySelector('.panel-group'), { disabled: true })
    this.createSortTable()
    this.editor()
    this.saveItem()
    this.cancelEdit()
    this.on('success', this.onsuccess.bind(this))
    this.on('error', this.onerror.bind(this))
  }

  switchOff () {
    this.off()
  }

  onsuccess () {
    this.messages(['Los textos se han guardado exitosamente'], 'success')
    aboutstore.findAll()
      .then(this.reloadAbout.bind(this))
      .then(this.setDefault())
    window.scrollTo(0, 0)

    setTimeout(() => { this.removeMessages() }, 3000)
  }

  onerror () {
    this.messages([t('common.internal-error')])
  }
}