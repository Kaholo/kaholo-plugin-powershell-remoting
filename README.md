# Kaholo Powershell Remoting plugin
This plugin extends Kaholo's capabilities to include making remote commands to Windows machines using WinRM or PowerShell.

[Windows Remote Management](https://learn.microsoft.com/en-us/windows/win32/winrm/portal) (WinRM) is the Microsoft implementation of the WS-Management protocol, which is a standard Simple Object Access Protocol (SOAP)-based, firewall-friendly protocol that allows interoperation between hardware and operating systems from different vendors.

PowerShell is a cross-platform task automation solution made up of a command-line shell, a scripting language, and a configuration management framework.

## Prerequisites
Remote Windows hosts must have WinRM configured in order to be reachable by the Kaholo plugin. Please refer to [the Microsoft Documentation](https://learn.microsoft.com/en-us/windows/win32/winrm/installation-and-configuration-for-windows-remote-management) for configuring WinRM.

Powershell may also have additional requirements. Please refer to [the Microsoft Documentation](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_remote_requirements) for configuring remote PowerShell.

## Plugin Settings

To access plugin settings and accounts in Kaholo, go to Settings | Plugins and click on the name of the plugin, which is a blue hyperlink. In this case "PowerShell Remoting". There find two tabs, one for "Settings" and another for "Accounts".

### Settings

There are no settings for this plugin so the Settings tab will be disabled

### Accounts

Kaholo Accounts are a collection of parameters, often including vaulted secrets, that act together as a set to provide configuration and authentication for the plugin. The name of the account is arbitrary and setting an account to be the default one causes new pipeline actions of the type PowerShell Remoting to come pre-configured to use that account, as a convenience only.

In the case of PowerShell Remoting, accounts include the following parameters:

#### Hostname (Optional)
The hostname or IP address of the Windows machine where the command will be run. This parameter is optional because an account may apply to a wide variety of different hosts and specifying a host at the account level may not be required.

#### Port (Optional)
The port on which WinRM or PowerShell connections may be accepted. If left empty the default value of 5985 is assumed.

#### Username
The username of the user running the remote shell. This may be a local Windows account such as "Administrator" or a Windows Domain account such as "CONTOSO\thwilson".

#### Password
The password for the configured username, stored in Kaholo Vault so it will not appear in UI, error messages, or log files.

## Method: Execute Remote Command
This same method may be used for both WinRM and PowerShell commands. There is a Boolean parameter that when selected runs the command using PowerShell.

### Parameter: Hostname
This parameter is the hostname or IP address of the Windows machine where the command will be run. It must of course be accessible over the network on the configured port (or 5985 if not configured) from the Kaholo Agent where the pipeline runs. If the hostname is configured in the Kaholo Account it may be left empty at the Action level. If configured differently in both places the action-level configuration takes precedence over the account-level one. If configured in neither place 127.0.0.1 is assumed.

### Parameter: Port
Provide the port address if some alternative port is in use. If not specified, the port specified in the Account will be used, and if that is not specified either, 5985 (Microsoft default) will be used.

### Parameter: Command
The command(s) to execute in WinRM or using PowerShell executable. To execute multiple commands separate them with `;`.

### Parameter: Use PowerShell Exe
If enabled, the command will be run using PowerShell command `powershell.exe -NoProfile -NonInteractive -NoLogo -ExecutionPolicy Bypass -InputFormat Text -Command & {` *Command* `}`.
