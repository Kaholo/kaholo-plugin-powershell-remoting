const winrm = require("nodejs-winrm");
const helpers = require("./helpers");

async function execCommand(action) {
  const { username } = action.params;
  const { password } = action.params;
  const port = action.params.port || 5985;
  const { host } = action.params;

  const auth = `Basic ${Buffer.from(`${username}:${password}`, "utf8").toString("base64")}`;
  const params = {
    host,
    port,
    path: "/wsman",
  };
  params.auth = auth;
  const shellId = await winrm.shell.doCreateShell(params);
  params.shellId = shellId;

  params.command = action.params.command;
  if (action.params.isPowershell) {
    params.command = helpers.generatePowershellCommand(params);
  }

  const commandId = await winrm.command.doExecuteCommand(params);

  params.commandId = commandId;
  const result = await helpers.getResult(params, action.params.isPowershell);

  await winrm.shell.doDeleteShell(params);

  return result;
}

module.exports = {
  execCommand,
};
