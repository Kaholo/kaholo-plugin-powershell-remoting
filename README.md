# kaholo-plugin-powershell-remoting
PowerShell Remoting plugin for Kaholo

Please visit [Microsoft's WinRM site](http://msdn.microsoft.com/en-us/library/aa384426.aspx) for WINRM details.

## Install

On the remote host, a PowerShell prompt, using the __Run as Administrator__ option and paste in the following lines:

```
> winrm quickconfig
y
> winrm set winrm/config/service/Auth '@{Basic="true"}'
> winrm set winrm/config/service '@{AllowUnencrypted="true"}'
> winrm set winrm/config/winrs '@{MaxMemoryPerShellMB="1024"}'
```