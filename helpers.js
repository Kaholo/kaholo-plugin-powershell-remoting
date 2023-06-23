const js2xmlparser = require("js2xmlparser");
const winrmSoapReq = require("nodejs-winrm/src/base-request");
const winrmHttpReq = require("nodejs-winrm/src/http");

function constructReceiveOutputRequest(_params) {
  const res = winrmSoapReq.getSoapHeaderRequest({
    action: "http://schemas.microsoft.com/wbem/wsman/1/windows/shell/Receive",
    shellId: _params.shellId,
  });

  res["s:Body"] = {
    "rsp:Receive": {
      "rsp:DesiredStream": {
        "@": {
          CommandId: _params.commandId,
        },
        "#": "stdout stderr",
      },
    },
  };
  return js2xmlparser.parse("s:Envelope", res);
}

function generatePowershellCommand(_params) {
  const args = [];
  args.unshift(
    "powershell.exe",
    "-NoProfile",
    "-NonInteractive",
    "-NoLogo",
    "-ExecutionPolicy",
    "Bypass",
    "-InputFormat",
    "Text",
    "-Command",
    "\"& {",
    _params.command,
    "}\"",
  );
  return args.join(" ");
}

async function getResult(_params) {
  const req = constructReceiveOutputRequest(_params);

  const result = await (
    winrmHttpReq.sendHttp(req, _params.host, _params.port, _params.path, _params.auth)
  );

  if (result["s:Envelope"]["s:Body"][0]["s:Fault"]) {
    return new Error(result["s:Envelope"]["s:Body"][0]["s:Fault"][0]["s:Code"][0]["s:Subcode"][0]["s:Value"][0]);
  }
  const cmdResult = {
    stdout: "",
    stderr: "",
    exitCode: parseInt(
      result["s:Envelope"]["s:Body"][0]["rsp:ReceiveResponse"][0]["rsp:CommandState"][0]["rsp:ExitCode"][0],
      10,
    ),
  };

  if (result["s:Envelope"]["s:Body"][0]["rsp:ReceiveResponse"][0]["rsp:Stream"]) {
    result["s:Envelope"]["s:Body"][0]["rsp:ReceiveResponse"][0]["rsp:Stream"].forEach((stream) => {
      if (stream.$.Name === "stdout" && !Reflect.has(stream.$, "End")) {
        cmdResult.stdout += Buffer.from(stream._, "base64").toString("ascii");
      }
      if (stream.$.Name === "stderr" && !Reflect.has(stream.$, "End")) {
        cmdResult.stderr += Buffer.from(stream._, "base64").toString("ascii");
      }
    });
  }

  if (cmdResult.exitCode === 0) {
    return cmdResult;
  }

  return Promise.reject(cmdResult);
}

module.exports = {
  getResult,
  generatePowershellCommand,
};
