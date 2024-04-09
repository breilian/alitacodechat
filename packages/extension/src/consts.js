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

const VsCodeMessageTypes = {
  getCompletion: 'extension.getCompletion',
  getPrompts: 'extension.getPrompts',
  getDatasources: 'extension.getDatasources'
}

const UiMessageTypes = {
  error: 'ui.error',
  startLoading: 'ui.startLoading',
  stopLoading: 'ui.stopLoading',
  getPrompts: 'ui.getPrompts',
  getDatasources: 'ui.getDatasources',
  getCompletion: 'ui.getCompletion'
}

module.exports = {
  getAlitaCodeExtension,
  getAlitaService,
  VsCodeMessageTypes,
  UiMessageTypes
}