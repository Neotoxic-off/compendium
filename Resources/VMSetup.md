# VM Setup
**VM provider used is VirtualBox**

## Windows
- Choose and remember your username

### Bypass account
- Disable network adaptor
- Press Shift + F10

```PS1
net.exe user "<USERNAME>" /add 
net.exe localgroup "Administrators" "<USERNAME>" /add 
cd OOBE
msoobe.exe && shutdown.exe -r 
```

### Fix Copy paste & drag and drop
- Devices > Insert Gest Additions CD Image...
- Open file explorer
- Go on `VirtualBox Guest Additions`
- Run `VBoxWindowsAdditions`
- Follow the setup and reboot
