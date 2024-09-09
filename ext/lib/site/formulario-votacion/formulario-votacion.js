import 'lib/boot/routes'
import router from 'lib/site/boot/router'
import CrearVoto from './component'

router.childRoutes.unshift({
  path: 'votacion',
  component: CrearVoto
})

router.childRoutes.unshift({
  path: 'votacion/:id',
  component: CrearVoto
})
