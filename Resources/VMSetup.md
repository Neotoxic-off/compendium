# VM Setup

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
