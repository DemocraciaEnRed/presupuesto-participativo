import urlBuilder from '../url-builder'
import request from '../request/request'
import Store from './store/store'

class TextStore extends Store {
  name () {
    return 'text'
  }

  findAll(forceUpdate){
    if (!forceUpdate && this.texts) return new Promise((resolve, reject) => { resolve(this.texts) })

    let url = this.url('')
    if (this._fetches.get(url)) return this._fetches.get(url)

    let fetch = this._fetch(url)

    fetch.then((texts) => {
      this.texts = texts
      this.textsDict = {}
      this.texts.forEach(function(text){
        this.textsDict[text.name] = text.text
      }.bind(this))
    }).catch((err) => {
      this.texts = undefined
      this.textsDict = undefined
      this.log('Found error', err)
    })

    return fetch
  }

  findAllDict(forceUpdate){
    if (!forceUpdate && this.textsDict)
      return new Promise((resolve, reject) => { resolve(this.textsDict) })
    else
      return this.findAll().then(() => { return this.textsDict })
  }

  /*findOneByName (name) {
    if (this.texts){
      return new Promise((resolve, reject) => {
        this.texts.forEach(function(text){
          if (text.name == name) resolve(text.text)
        })
        resolve(undefined)
      })
    } else {
      return this.findAll().then(() => {
        this.texts.forEach(function(text){
          return text.text
        })
        return undefined
      })
    }
  }*/
}

export default new TextStore()
