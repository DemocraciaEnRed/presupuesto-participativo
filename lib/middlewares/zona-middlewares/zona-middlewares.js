import debug from 'debug'
import zonaStore from '../../stores/zona-store'

const log = debug('democracyos:zona-middlewares')

export function findAllZonas (ctx, next) {
  zonaStore
    .findAll()
    .then((zonas) => {
      ctx.zonas = zonas
      next()
    })
    .catch((err) => {
      if (err.status !== 404) throw err
      const message = 'Unable to load zonas'
      return log(message, err)
    })
}