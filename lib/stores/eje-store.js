import Store from './store/store'

class EjeStore extends Store {
  name () {
    return 'eje'
  }

  findAllSuffix () {
    return ''
  }
}

export default new EjeStore()
