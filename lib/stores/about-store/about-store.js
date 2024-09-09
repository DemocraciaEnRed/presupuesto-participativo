import encode from 'mout/queryString/encode'

import Store from '../store/store'

class AboutStore extends Store {
  name () {
    return 'about-us'
  }

  url (id, params = {}) {
    if (typeof id === 'object') {
      params = id
      id = ''
    }

    id = id ? '/' + id : ''

    return `/api/v2/about${id}${encode(params)}`
  }

  findAll (forceUpdate) {
    let url = this.url('') + '-all'
    if (this._fetches.get(url)) return this._fetches.get(url)
    let fetch = this._fetch(url)

    fetch.then((faqs) => {
      this.faqs = faqs
    }).catch((err) => {
      this.faqs = undefined
      this.faqsDict = undefined
      this.log('Found error', err)
    })

    return fetch
  }

  findAllDict (forceUpdate) {
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

export default new AboutStore()