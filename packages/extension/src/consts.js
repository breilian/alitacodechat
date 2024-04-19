const vscode = require('vscode');

const alitaCodeExtensionId = 'ProjectAlita.alitacode'

const getAlitaCodeExtension = () => {
  try {
    const sourceExtension = vscode.extensions.getExtension(alitaCodeExtensionId)
    return sourceExtension
  } catch (err) {
    console.log(err)
    return {}
  }
}

const getAlitaService = () => {
  return getAlitaCodeExtension().exports.alitaService
}


module.exports = {
  getAlitaCodeExtension,
  getAlitaService,
}