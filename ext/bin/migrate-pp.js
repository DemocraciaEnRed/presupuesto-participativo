#!/usr/bin/env node

const models = require('lib/models')()
const Forum = models.Forum
const newTopicsAttrs = require('../lib/site/formulario-propuesta/campos.json')




const nuevosCampos = Forum.find({ 'name': 'proyectos' }).exec()
  .then(([ forum ]) => {
    forum.set('topicsAttrs', newTopicsAttrs)
    return forum.save()
  })
  .then((forum) => {
    console.log('Foro proyectos actualizado!')
 })

Promise.all([nuevosCampos])
  .then((newTopics) => {
    process.exit(0)
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
