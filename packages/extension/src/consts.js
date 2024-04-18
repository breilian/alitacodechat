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
  getSelectedText: 'extension.getSelectedText',
  getChatResponse: 'extension.getChatResponse',
  getPrompts: 'extension.getPrompts',
  getDatasources: 'extension.getDatasources',
  getPromptDetail: 'extension.getPromptDetail',
  getDatasourceDetail: 'extension.getDatasourceDetail',
  getSocketConfig: 'extension.getSocketConfig',
  getModelSettings: 'extension.getModelSettings'
}

const UiMessageTypes = {
  getSelectedText: 'ui.getSelectedText',
  error: 'ui.error',
  startLoading: 'ui.startLoading',
  stopLoading: 'ui.stopLoading',
  getPrompts: 'ui.getPrompts',
  getPromptDetail: 'ui.getPromptDetail',
  getDatasourceDetail: 'ui.getDatasourceDetail',
  getDatasources: 'ui.getDatasources',
  getChatResponse: 'ui.getChatResponse',
  getSocketConfig: 'ui.getSocketConfig',
  getModelSettings: 'ui.getModelSettings'
}

module.exports = {
  getAlitaCodeExtension,
  getAlitaService,
  VsCodeMessageTypes,
  UiMessageTypes
}