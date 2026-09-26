const config = require('../../config');
const GroqProvider = require('./GroqProvider');

let instance = null;

function getAIProvider() {
  if (instance) return instance;

  console.log('[AI Service] Initialized with centralized GroqProvider (' + config.groqModel + ')');
  instance = new GroqProvider();
  return instance;
}

module.exports = {
  getAIProvider
};
