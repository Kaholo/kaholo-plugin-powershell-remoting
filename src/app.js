var winrm = require('nodejs-winrm');
var helpers = require('./helpers');

async function execCommand(action, settings) {
    const username = action.params.username;
    const password = action.params.password;
    const port = action.params.port || 5985;
    const host = action.params.host;

    var auth = 'Basic ' + Buffer.from(username + ':' + password, 'utf8').toString('base64');
    var params = {
        host: host,
        port: port,
        path: '/wsman',
    };
    params['auth'] = auth;
    var shellId = await winrm.shell.doCreateShell(params);
    params['shellId'] = shellId;

    params['command'] = action.params.command;
    
    var commandId = await winrm.command.doExecuteCommand(params);

    params['commandId'] = commandId;
    var result = await helpers.getResult(params);

    await winrm.shell.doDeleteShell(params);

    return result;
}

module.exports = {
    execCommand: execCommand
};