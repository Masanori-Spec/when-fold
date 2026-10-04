'use strict';
const vscode = require('vscode');
function activate(context) {
  let observed = [];
  for (const command of ['demo.generic', 'demo.python', 'demo.selection']) {
    context.subscriptions.push(vscode.commands.registerCommand(command, (...args) => {
      const item = { command };
      if (args[0] !== undefined) item.args = args[0];
      observed.push(item);
    }));
  }
  return { reset() { observed = []; }, observed() { return observed.slice(); } };
}
module.exports = { activate, deactivate() {} };
