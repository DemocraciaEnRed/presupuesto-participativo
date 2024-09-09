const { spawn } = require('child_process')
const settings = require('./settings')

// Clone the process.env object and extend it
const env = Object.assign({}, process.env)

if (settings.verbose && !env.DEBUG) {
  env.DEBUG = 'democracyos*'
}

env.NODE_PATH = '.'

module.exports = function () {
  let args = []

  if (env.NODE_DEBUGGER) {
    console.log('Activando node debugger. Visitar la url del debugger en chrome/chromium para continuar con la ejecución del programa.')
    args.push('--inspect-brk')
  }

  args.push('index.js')

  return spawn('node', args, { stdio: [0, 1, 2], env: env })
}
