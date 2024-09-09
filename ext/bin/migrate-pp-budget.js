#!/usr/bin/env node

const models = require('lib/models')()
const Topic = models.Topic

const changeState = (state) => {
  switch (state) {
    case 'preparacion':
      return 'attrs.project-budget-preparacion'
      break
    case 'compra':
     return 'attrs.project-budget-compra'
      break
    case 'ejecucion':
    return 'attrs.project-budget-ejecucion'
      break
    case 'finalizado':
      return 'attrs.project-budget-finalizado'
    default:
      return false  
  }
}

Topic.find({ 'attrs.anio': '2018' }).exec()
.then((topics) => {
    const newTopics = topics.map((topic) => {
      const budgetField = changeState(topic.attrs.state)
      if (budgetField != false){
        topic.set(budgetField, topic.attrs.budget)
        return topic.save()
      }
    })
  
  return Promise.all(newTopics)
})
.then((newTopics) => {
  console.log('Topics actualizados!')
  process.exit(0)
})
.catch((err) => {
    console.error(err)
    process.exit(1)
  })