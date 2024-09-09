/**
 * Module dependencies.
 */
import React from 'react'
import { render as ReactRender } from 'react-dom'
import debug from 'debug'
import t from 't-component'
import List from 'democracyos-list.js'
import moment from 'moment'
import confirm from 'democracyos-confirmation'
import ReactPaginate from 'react-paginate'
import urlBuilder from 'lib/url-builder'
import View from '../../view/view'
import topicStore from '../../stores/topic-store/topic-store'
import { getQueryVariable } from '../../utils'
import template from './template.jade'
import ExportUpdate from './export-update/component'

const log = debug('democracyos:admin-topics')

/**
 * Creates a list view of topics
 */

export default class TopicsListView extends View {

  constructor (topics, forum = null, pagination, uniqAttrs) {
    function toTitleCase (str) {
      return str.replace(
          /\w\S*/g,
          function(txt) {
              return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
          }
      );
    }
    super(template, {
      topics: topics.filter((t) => t.privileges.canEdit || t.privileges.canDelete),
      moment,
      forum,
      urlBuilder,
      uniqAttrs,
      toTitleCase
    })
    this.forum = forum
    this.pagination = pagination
  }

  switchOn () {
    this.bind('click', '.buscar-tema', this.bound('onbuscarclick'))
    this.bind('keypress', 'input[name=busqueda]', this.bound('onbuscarkeypress'))
    this.bind('click', '.btn.edit-topic', this.bound('oneditclick'))
    this.bind('click', 'button.ver-proyecto', this.bound('onverclick'))
    this.bind('change', 'select.mas-acciones', this.bound('onmasaccioneschange'))

    this.list = new List('topics-wrapper', { valueNames: ['topic-id', 'topic-title', 'topic-date', 'topic-tag'] })
    this.list.items.forEach(item => {
      let listItemEle = item.elm

      let topicId = listItemEle.getAttribute('data-topicid')
      let topicIsPublic = listItemEle.getAttribute('data-topic-ispublic')

      let btnPublish = listItemEle.querySelector('button.publish-topic')
      let btnUnpublish = listItemEle.querySelector('button.unpublish-topic')

      btnPublish.onclick = btnUnpublish.onclick = (ev => {
        let evBtn = ev.delegateTarget || ev.currentTarget
        let action = evBtn == btnPublish ? 'publish' : 'unpublish'
        evBtn.classList.add('disabled')
        this.onblishclick(btnPublish, btnUnpublish, topicId, action)
          .then(() => {
            evBtn.classList.remove('disabled')
          })
      }).bind(this)

      if (topicIsPublic) btnPublish.classList.add('hide')
      else btnUnpublish.classList.add('hide')
    })

    ReactRender((
      <ExportUpdate
        forum={this.forum} />
    ), this.el[0].querySelector('.export-update-wrapper'))

    const pages = this.pagination.count / this.pagination.limit
    const currentPage = (+getQueryVariable('page') || 1) - 1
    ReactRender((
      <ReactPaginate
        forcePage={currentPage}
        pageCount={pages}
        marginPagesDisplayed={2}
        pageRangeDisplayed={5}
        previousLabel='<'
        nextLabel='>'
        onPageChange={this.handlePageClick}
        breakLabel={<a href="">...</a>}
        breakClassName={"break-me"}
        containerClassName={"pagination"}
        subContainerClassName={"pages pagination"}
        activeClassName={"active"} />
    ), this.el[0].querySelector('.topics-pagination'))

    this.loadFiltersFromUrl()
  }

  handlePageClick (e) {
    const { origin, pathname } = window.location
    const search = getQueryVariable('search')
    const searchQuery = search ? `search=${search}&` : ''
    window.location = `${origin}${pathname}?${searchQuery}page=${(e.selected + 1)}`
  }

  ondeletetopicclick (ev) {
    ev.preventDefault()
    const el = ev.delegateTarget.parentElement
    const topicId = el.getAttribute('data-topicid')
    if(!topicId) debugger

    const _t = (s) => t(`admin-topics-form.delete-topic.confirmation.${s}`)

    const onconfirmdelete = (ok) => {
      if (!ok) return

      topicStore.destroy(topicId)
        .catch((err) => {
          log('Found error %o', err)
        })
    }

    confirm(_t('title'), _t('body'))
      .cancel(_t('cancel'))
      .ok(_t('ok'))
      .modal()
      .closable()
      .effect('slide')
      .show(onconfirmdelete)
  }

  onbuscarclick (ev){
    let query = {}

    let textInput = this.el[0].querySelector('input[name=busqueda]')
    if (textInput.value) query.search = textInput.value

    let zonaSelect = this.el[0].querySelector('select[name=zona]')
    if (zonaSelect.value) query.zona = zonaSelect.value

    let temaSelect = this.el[0].querySelector('select[name=tema]')
    if (temaSelect.value) query.tema = temaSelect.value

    let queryStr = Object.keys(query).map(k => `${k}=${encodeURIComponent(query[k])}`).join('&')
    const { origin, pathname } = window.location
    window.location = `${origin}${pathname}?${queryStr}`
  }

  onbuscarkeypress(ev){
    if (ev.keyCode == 13)
      this.onbuscarclick()
  }

  loadFiltersFromUrl(){
    let search = getQueryVariable('search')
    if (search) this.el[0].querySelector('input[name=busqueda]').value = decodeURIComponent(search)

    let zona = getQueryVariable('zona')
    if (zona) this.el[0].querySelector('select[name=zona]').value = decodeURIComponent(zona)

    let tema = getQueryVariable('tema')
    if (tema) this.el[0].querySelector('select[name=tema]').value = decodeURIComponent(tema)
  }

  onverclick(ev){
    let el = ev.delegateTarget
    let url = el.getAttribute('data-topic-url')
    let win = window.open(url, '_blank');
    win.focus();
  }

  onblishclick(btnPublish, btnUnpublish, topicId, action){
    let promise;
    let jumpItemHack = true;
    if (action == 'publish'){
      promise = topicStore.publish(topicId, jumpItemHack)
        .then(() => {
          btnPublish.classList.add('hide')
          btnUnpublish.classList.remove('hide')
        })
    }else{ // 'unpublish'
      promise = topicStore.unpublish(topicId, jumpItemHack)
        .then(() => {
          btnUnpublish.classList.add('hide')
          btnPublish.classList.remove('hide')
        })
    }
    return promise.catch((err) => {
      console.log('Found error %o', err)
    })
  }

  oneditclick(ev){
    let el = ev.delegateTarget
    let url = el.getAttribute('data-topic-edit-url')
    let win = window.open(url, '_blank');
    win.focus();
  }

  onmasaccioneschange(ev,a){
    let el = ev.delegateTarget
    let val = el.value
    let url = el.getAttribute('data-topic-edit-url')
    let win = window.open(url + '#' + val, '_blank');
    win.focus();
    el.value = ''
  }
}
