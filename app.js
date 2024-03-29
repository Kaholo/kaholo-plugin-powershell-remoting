const winrm = require("nodejs-winrm");
const helpers = require("./helpers");

async function execCommand(action) {
  const { username } = action.params;
  const { password } = action.params;
  const port = action.params.actionPort || action.params.port || 5985;
  const host = action.params.actionHost || action.params.host || "127.0.0.1";

  const encodedCredentials = Buffer.from(`${username}:${password}`, "utf8").toString("base64");
  const params = {
    host,
    port,
    path: "/wsman",
    auth: `Basic ${encodedCredentials}`,
  };

  params.shellId = await winrm.shell.doCreateShell(params);
  params.command = action.params.command;

  if (action.params.isPowershell) {
    params.command = helpers.generatePowershellCommand(params);
  }

  params.commandId = await winrm.command.doExecuteCommand(params);
  const result = await helpers.getResult(params, action.params.isPowershell);
  await winrm.shell.doDeleteShell(params);
  return result;
}

module.exports = {
  execCommand,
};
