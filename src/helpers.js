const js2xmlparser = require('js2xmlparser');
let winrm_soap_req = require('nodejs-winrm/src/base-request');
let winrm_http_req = require('nodejs-winrm/src/http.js');

function constructReceiveOutputRequest(_params) {
    var res = winrm_soap_req.getSoapHeaderRequest({
        'action': 'http://schemas.microsoft.com/wbem/wsman/1/windows/shell/Receive',
        'shellId': _params.shellId
    });

    res['s:Body'] = {
        'rsp:Receive': {
            'rsp:DesiredStream': {
                '@': {
                    'CommandId': _params.commandId
                },
                '#': 'stdout stderr'
            }
        }
    };
    return js2xmlparser.parse('s:Envelope', res);
}

module.exports.generatePowershellCommand = function(_params) {
    var args = [];
    args.unshift(
        'powershell.exe',
        '-NoProfile',
        '-NonInteractive',
        '-NoLogo',
        '-ExecutionPolicy', 'Bypass',
        '-InputFormat', 'Text',
        '-Command', '"& {',
        _params.command,
        '}"'
    );
    return args.join(' ');
}

module.exports.getResult = async function (_params) {
    var req = constructReceiveOutputRequest(_params);

    var result = await winrm_http_req.sendHttp(req, _params.host, _params.port, _params.path, _params.auth);

    if (result['s:Envelope']['s:Body'][0]['s:Fault']) {
        return new Error(result['s:Envelope']['s:Body'][0]['s:Fault'][0]['s:Code'][0]['s:Subcode'][0]['s:Value'][0]);
    } else {
        let cmdResult = {
            stdout : '',
            stderr : '',
            exitCode : parseInt(result['s:Envelope']['s:Body'][0]['rsp:ReceiveResponse'][0]['rsp:CommandState'][0]['rsp:ExitCode'][0])
        }
        
        if (result['s:Envelope']['s:Body'][0]['rsp:ReceiveResponse'][0]['rsp:Stream']) {
            for (let stream of result['s:Envelope']['s:Body'][0]['rsp:ReceiveResponse'][0]['rsp:Stream']) {
                if (stream['$'].Name == 'stdout' && !stream['$'].hasOwnProperty('End')) {
                    cmdResult.stdout += Buffer.from(stream['_'], 'base64').toString('ascii');
                }
                if (stream['$'].Name == 'stderr' && !stream['$'].hasOwnProperty('End')) {
                    cmdResult.stderr += Buffer.from(stream['_'], 'base64').toString('ascii');
                }
            }
        }

        if (cmdResult.exitCode === 0)
            return cmdResult;
        
        return Promise.reject(cmdResult);
    }
};