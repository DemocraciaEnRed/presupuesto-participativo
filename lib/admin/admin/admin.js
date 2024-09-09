import bus from 'bus'
import React from 'react'
import { render } from 'react-dom'
import page from 'page'
import dom from 'component-dom'
import config from 'lib/config'
import urlBuilder from 'lib/url-builder'
import Sidebar from '../admin-sidebar/admin-sidebar'
import TopicsListView from '../admin-topics/view'
import TopicForm from '../admin-topics-form/view'
import TagsList from '../admin-tags/view'
import TagForm from '../admin-tags-form/view'
import AdminComments from '../admin-comments/component'
import ModerateTags from '../admin-tags-moderation/component'
import AdminPadron from '../admin-padron/component'
import AdminTopicFormAlbum from '../admin-topics-form-album/component'
import user from '../../user/user'
import { domRender } from '../../render/render'
import title from '../../title/title'
import topicStore from '../../stores/topic-store/topic-store'
import tagStore from 'lib/stores/tag-store/tag-store'
import zonaStore from 'lib/stores/zona-store'
import { loadCurrentForum } from '../../forum/forum'
import AdminPermissions from '../admin-permissions/admin-permissions'
import { findPrivateTopics,
         findTopic,
         findUniqTopicAttrs } from '../../middlewares/topic-middlewares/topic-middlewares'
import { findAllTags,
         findTag,
         clearTagStore } from '../../middlewares/tag-middlewares/tag-middlewares'
import { findAllZonas } from "../../middlewares/zona-middlewares/zona-middlewares"
import { privileges } from '../../middlewares/forum-middlewares/forum-middlewares'
import template from './admin-container.jade'
import ContenidoPortada from '../admin-contenido-portada/view'
import AdminSettings from '../admin-settings-stage/view'
import AboutUs from '../admin-about-us/view'

page(
  [
    urlBuilder.for('admin'),
    urlBuilder.for('admin.section'),
    urlBuilder.for('admin.section.wild')
  ],
  user.required,
  loadCurrentForum,
  hasAccessToForumAdmin,
  (ctx, next) => {
    const section = ctx.section = ctx.params.section
    const container = domRender(template)

    // prepare wrapper and container
    dom('#content').empty().append(container)

    // set active section on sidebar
    ctx.sidebar = new Sidebar(ctx.forum)
    ctx.sidebar.set(section)
    ctx.sidebar.appendTo(dom('.sidebar-container', container)[0])

    // Set page's title
    title()

    // if all good, then jump to section route handler
    next()
  }
)

page(urlBuilder.for('admin'), (ctx) => {
  page.redirect(urlBuilder.for('admin.topics', { forum: ctx.forum.name }))
})

page(
  urlBuilder.for('admin.topics'),
  privileges('canChangeTopics'),
  findPrivateTopics,
  (ctx, next) => {
    // copiado de filtros de foros (ext/lib/site/home-catalogo/component.js)
    Promise.all([
      zonaStore.findAll(),
      tagStore.findAll({field: 'name'}),
    ]).then(results => {
      const [zonas, tags] = results
      ctx.uniqAttrs = {
        zonas: zonas.map(zona => { return {value: zona._id, name: zona.nombre}; }),
        tags: tags.map(tag => { return {value: tag.id, name: tag.name}; })
      }
      next()
    }).catch((err) => {
      if (err.status !== 404) throw err
      log('Unable to load zonas and tags.')
    })
  },
  (ctx) => {
    let currentPath = ctx.path
    let topicsList = new TopicsListView(ctx.topics, ctx.forum, ctx.pagination, ctx.uniqAttrs)
    topicsList.replace('.admin-content')
    ctx.sidebar.set('topics')

    ctx.onTopicsUpdate = () => { page(currentPath) }
    bus.once('topic-store:update:all', ctx.onTopicsUpdate)
})

page.exit(urlBuilder.for('admin.topics'), (ctx, next) => {
  bus.off('topic-store:update:all', ctx.onTopicsUpdate)
  next()
})

page(urlBuilder.for('admin.topics.create'), privileges('canCreateTopics'), clearTagStore, findAllTags, findAllZonas, (ctx) => {
  ctx.sidebar.set('topics')
  // render new topic form
  let form = new TopicForm(null, ctx.forum, ctx.tags, ctx.zonas)
  form.replace('.admin-content')
  form.once('success', function () {
    topicStore.findAll({forum: ctx.forum.id})
  })
})

page(urlBuilder.for('admin.topics.id'), privileges('canCreateTopics'), clearTagStore, findAllTags, findAllZonas, findTopic, (ctx) => {
  // force section for edit
  // as part of list
  ctx.sidebar.set('topics')
  let form = new TopicForm(ctx.topic, ctx.forum, ctx.tags, ctx.zonas)
  form.replace('.admin-content')
  form.on('success', function () {
    topicStore.clear()
  })
})

page(urlBuilder.for('admin.tags'), privileges('canEdit'), clearTagStore, findAllTags, (ctx) => {
  const tagsList = new TagsList({
    forum: ctx.forum,
    tags: ctx.tags
  })

  tagsList.replace('.admin-content')
  ctx.sidebar.set('tags')
})

page(urlBuilder.for('admin.tags.create'), privileges('canEdit'), (ctx) => {
  let form = new TagForm()
  form.replace('.admin-content')
  ctx.sidebar.set('tags')
})

page(urlBuilder.for('admin.tags.id'), privileges('canEdit'), findTag, (ctx) => {
  // force section for edit
  // as part of list
  ctx.sidebar.set('tags')

  // render topic form for edition
  let form = new TagForm(ctx.tag)
  form.replace('.admin-content')
})

page(urlBuilder.for('admin.permissions'), privileges('canEdit'), (ctx) => {
  const content = document.querySelector('.admin-content')

  ctx.view = new AdminPermissions({
    container: content,
    forum: ctx.forum
  })

  ctx.sidebar.set('permissions')
})

if (config.usersWhitelist) {
  require('../admin-whitelists/admin-whitelists')
  require('../admin-whitelists-form/admin-whitelists-form')
}

page(urlBuilder.for('admin.comments'), (ctx) => {
  ctx.sidebar.set('comments')
  render(<AdminComments forum={ctx.forum} />, document.querySelector('.admin-content'))
})

page(urlBuilder.for('admin.tags-moderation'), (ctx) => {
  ctx.sidebar.set('tags-moderation')
  render(<ModerateTags forum={ctx.forum} />, document.querySelector('.admin-content'))
})

function hasAccessToForumAdmin (ctx, next) {
  if (ctx.forum && (ctx.forum.privileges.canChangeTopics || ctx.forum.privileges.canCreateTopics)) return next()
  page.redirect('/')
}

page(
  urlBuilder.for('admin.padron'),
  (ctx, next) => {
    // copiado de filtros de foros (ext/lib/site/home-propuestas/component.js)
    Promise.all([
      zonaStore.findAll(),
    ]).then(results => {
      const [zonas] = results
      ctx.uniqAttrs = {
        zonas: zonas.map((zona) => { return { value: zona._id, name: zona.nombre }}),
      }
      next()
    }).catch((err) => {
      if (err.status !== 404) throw err
      log('Unable to load zonas.')
    })
  },
  (ctx) => {
    ctx.sidebar.set('padron')
    render(<AdminPadron forum={ctx.forum} zonas={ctx.uniqAttrs.zonas} />, document.querySelector('.admin-content'))
})

page(
  urlBuilder.for('admin.contenido-portada'),
  (ctx, next) => {
    // copiado de filtros de foros (ext/lib/site/home-catalogo/component.js)
    Promise.all([
      zonaStore.findAll(),
    ]).then(results => {
      const [zonas] = results
      ctx.uniqAttrs = {
        zonas: zonas.map(zona => { return { value: zona._id, name: zona.nombre }; }),
      }
      next()
    }).catch((err) => {
      if (err.status !== 404) throw err
      log('Unable to load zonas.')
    })
  },
  (ctx) => {
    const contenidoPortada = new ContenidoPortada(ctx.uniqAttrs.zonas)
    contenidoPortada.replace('.admin-content')
    ctx.sidebar.set('contenido-portada')
  })
  
page(
  urlBuilder.for('admin.settings-stage'),
  (ctx) => {
    const settingsStage = new AdminSettings(ctx.forum)
    settingsStage.replace('.admin-content')
    ctx.sidebar.set('settings-stage')
  }
)

page(urlBuilder.for('admin.topics.id.album'),
  privileges('canCreateTopics'),
  findTopic,
  (ctx) => {
    ctx.sidebar.set('topics')
    render(<AdminTopicFormAlbum forum={ctx.forum} topic={ctx.topic} />, document.querySelector('.admin-content'))
})

page(
  urlBuilder.for('admin.about-us'),
  (ctx) => {
    const settingsStage = new AboutUs(ctx.forum)
    settingsStage.replace('.admin-content')
    ctx.sidebar.set('about-us')
  }
)
