import 'lib/boot/routes'
import router from 'lib/site/boot/router'
import AcercaDe from './pages/acerca-de'
import TyC from './pages/terminos-y-condiciones'
import Encuentros from './pages/encuentros'
import PdfViewer from '../pdfviewer/component'

router.childRoutes.unshift({
  path: 's/acerca-de',
  component: AcercaDe
})

router.childRoutes.unshift({
  path: 's/terminos-y-condiciones',
  component: TyC
})

router.childRoutes.unshift({
  path: 's/encuentros',
  component: Encuentros
})

router.childRoutes.unshift({
  path: 'reglamento',
  component: PdfViewer
})
