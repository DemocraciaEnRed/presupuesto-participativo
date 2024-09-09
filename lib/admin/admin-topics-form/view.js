import React from 'react'
import { render as ReactRender } from 'react-dom'
import closest from 'component-closest'
import confirm from 'democracyos-confirmation'
import debug from 'debug'
import o from 'component-dom'
import t from 't-component'
import page from 'page'
import moment from 'moment'
import tagsInput from 'tags-input'
import { dom as render } from 'lib/render/render'
import Richtext from 'lib/richtext/richtext'
import urlBuilder from 'lib/url-builder'
import FormView from 'lib/form-view/form-view'
import topicStore from 'lib/stores/topic-store/topic-store'
import * as serializer from './body-serializer'
import template from './template.jade'
import linkTemplate from './link.jade'
import ForumTagsSearch from './tag-autocomplete/component'
import Attrs from './attrs/component'
import tagStore from 'lib/stores/tag-store/tag-store'
import zonaStore from 'lib/stores/zona-store'

const log = debug('democracyos:admin-topics-form')
// triangle up &#9652;
// triangle down &#9662;
/**
 * Creates a password edit view
 */
let created = false

export default class TopicForm extends FormView {
  constructor (topic, forum, tags, zonas) {
    const locals = {
      form: { title: null, action: null, method: null, type: null },
      topic: topic || { clauses: [] },
      tags: tags,
      zonas: zonas,
      moment: moment,
      forum,
      urlBuilder
    }

    if (topic) {
      locals.form.type = 'edit'
      locals.form.action = '/api/v2/topics/' + topic.id
      locals.form.title = 'admin-topics-form.title.edit'
      locals.form.method = 'put'
      topic.body = serializer.toHTML(topic.clauses)
        .replace(/<a/g, '<a rel="noopener noreferer" target="_blank"')
    } else {
      locals.form.type = 'create'
      locals.form.action = '/api/v2/topics'
      locals.form.title = 'admin-topics-form.title.create'
      locals.form.method = 'post'
      locals.form.forum = forum.id
    }

    super(template, locals)

    this.topic = topic
    this.tags = tags
    this.forum = forum
    this.zonas = zonas
    this.forumAdminUrl =
      ':forum/admin'.replace(':forum', forum ? `/${forum.name}` : '')

    if (tags.length === 0) return

    if (created) {
      this.messages([t('admin-topics-form.message.onsuccess')])
      created = false
    }

    this.pubButton = this.find('a.make-public')
    this.privButton = this.find('a.make-private')
  }

  /**
   * Turn on event bindings
   */

  switchOn () {
    this.bind('click', '.add-link', this.bound('onaddlinkclick'))
    this.bind('click', '.forum-tag', this.bound('onaddforumtagclick'))
    this.bind('click', '[data-remove-link]', this.bound('onremovelinkclick'))
    this.bind('click', '.save', this.bound('onsaveclick'))
    this.bind('click', '.auto-save', this.bound('onsaveclick'))
    this.bind('click', '.make-public', this.bound('onmakepublicclick'))
    this.bind('click', '.make-private', this.bound('onmakeprivateclick'))
    this.bind('click', '.delete-topic', this.bound('ondeletetopicclick'))
    this.on('success', this.onsuccess)

    const tags = this.el[0].querySelectorAll('input[type="tags"]')
    Array.prototype.forEach.call(tags, tagsInput)

    tagStore.findAll({field: 'name'}).then(tags => {
      this.admitedTags = tags.map(t => t.name)
      ReactRender((
        <ForumTagsSearch
          tags={this.topic && this.topic.tags && this.topic.tags}
          initialTags={this.admitedTags}
          forum={this.forum.id} />
      ), this.el[0].querySelector('.tags-autocomplete'))
    })

    const zonas = this.el[0].querySelectorAll('input[type="zonas"]')
    Array.prototype.forEach.call(zonas, tagsInput)

    zonaStore.findAll({field: 'nombre'}).then(zonas => {
      this.admitedZonas = zonas.map(z => z.nombre)
    })

    if (this.forum.topicsAttrs.length > 0) {
      const attrsWrapper = this.el[0].querySelector('[data-attrs]')

      ReactRender(
        <Attrs forum={this.forum} topic={this.topic} />,
        attrsWrapper
      )
    }

    if (!this.topic){
      const stateSelect = this.find('select[name="attrs.state"]')
      stateSelect.value('proyecto')
    }

    window.scrollTo(0,0)
    setTimeout(() => {
      if (!window.location.hash)
        return

      let hashId = window.location.hash.substr(1)
      let anchorEle = document.getElementById(hashId)
      let anchorTop = anchorEle.getBoundingClientRect().top
      let headerHei = 54 + 1
      window.scrollTo({
        top: anchorTop - headerHei,
        left: 0
      })
      if (hashId == 'anchor-fecha-cierre'){
        this.el.find('[name=closingAt]').focus()
      }else{
        // focuseamos en el primer input o select que este al lado
        let sib = anchorEle.nextElementSibling
        while (sib){
          if (sib.tagName == "INPUT" || sib.tagName == "SELECT" || sib.tagName == "TEXTAREA"){
            sib.focus()
            break
          }
          sib = sib.nextElementSibling
        }
      }
    }, 1000)
  }

  /**
   * Handle `error` event with
   * logging and display
   *
   * @param {String} error
   * @api private
   */

  onsuccess (res) {
    log('Topic successfully saved')

    topicStore.parse(res.body.results.topic)
      .then((topic) => {
        if (this.topic) topicStore.unset(this.topic.id)
        topicStore.set(topic.id, topic)

        if (!this.forum.privileges.canChangeTopics) {
          return page(urlBuilder.for('site.topic', {
            forum: this.forum.name,
            id: topic.id
          }))
        }

        this.topic = topic

        created = true

        document.querySelector('#content').scrollTop = 0

        // Forcefully re-render the form
        page(urlBuilder.for('admin.topics.id', {
          forum: this.forum.name,
          id: this.topic.id
        }))
      })
      .catch((err) => { throw err })
  }

  onaddlinkclick (evt) {
    evt.preventDefault()
    return this.addLink()
  }

  addLink () {
    const links = o('.topic-links', this.el)

    const link = render(linkTemplate, {
      link: {}
    })

    links.append(o(link))
  }

  onremovelinkclick (evt) {
    const btn = evt.target
    const link = closest(btn, '[data-link]')
    link.parentNode.removeChild(link)
  }

  onsaveclick (ev) {
    ev.preventDefault()
    this.find('form input[type=submit]')[0].click()
  }

  postserialize (data = {}) {
    if (data['links[][text]']) {
      data.links = data['links[][text]'].map((text, i) => ({
        _id: data['links[][_id]'][i] || undefined,
        url: data['links[][url]'][i],
        text
      }))

      delete data['links[][_id]']
      delete data['links[][text]']
      delete data['links[][url]']
    }

    data.clauses = serializer.toArray(data.body)
    delete data.body

    if (data['action.options']) {
      data['action.options'] = data['action.options'].split(',')
    }

    if (data.tags) {
      data.tags = data.tags.split(',')
    } else {
      data.tags = []
    }

    return data
  }

  onmakepublicclick (ev) {
    ev.preventDefault()
    var view = this

    this.pubButton.addClass('disabled')

    topicStore.publish(this.topic.id)
      .then(() => {
        view.pubButton.removeClass('disabled').addClass('hide')
        view.privButton.removeClass('hide')
      })
      .catch((err) => {
        view.pubButton.removeClass('disabled')
        log('Found error %o', err)
      })
  }

  onmakeprivateclick (ev) {
    ev.preventDefault()
    var view = this

    this.privButton.addClass('disabled')

    topicStore.unpublish(this.topic.id)
      .then(() => {
        view.privButton.removeClass('disabled')
        view.privButton.addClass('hide')
        view.pubButton.removeClass('hide')
      })
      .catch((err) => {
        view.pubButton.removeClass('disabled')
        log('Found error %o', err)
      })
  }

  ondeletetopicclick (ev) {
    ev.preventDefault()

    const _t = (s) => t(`admin-topics-form.delete-topic.confirmation.${s}`)

    const onconfirmdelete = (ok) => {
      if (!ok) return

      topicStore.destroy(this.topic.id)
        .then(() => {
          if (this.forum.visibility === 'collaborative') {
            page(urlBuilder.for('site.forum', { forum: this.forum.name }))
          } else {
            page(urlBuilder.for('admin', { forum: this.forum.name }))
          }
        })
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

  onaddforumtagclick (e) {
    if (this.find('input[name="tags"]')[0].value.length === 0) {
      this.find('input[name="tags"]')[0].value = `${e.target.dataset.value}`
    } else if (!~this.find('input[name="tags"]')[0].value.indexOf(e.target.dataset.value)) {
      this.find('input[name="tags"]')[0].value += `,${e.target.dataset.value}`
    } else {
      return
    }
    let span = document.createElement('span')
    span.setAttribute('data-tag', e.target.dataset.value)
    span.textContent = e.target.dataset.value
    span.className = 'tag'
    this.find('.tags-autocomplete .tags-input').prepend(span)
  }
}
