# ZealMod

The ZealPC keyboard supports changinging it's keyboard mapping without having to reflash the QMK firmware. This is done
using a custom HID USB endpoint and should support WebUSB.

`ZealMod` is an attempt to use that API to update the keyboard layout via this concept.

## Status

This is a work in progress. The latest version can be viewed here:
[https://jameshagerman.github.io/ZealMod/](https://jameshagerman.github.io/ZealMod/)


## Manual unbind process

Because the OS binds HID devices to a kernel driver, you'll need to manually unbind it to get WebUSB to be able to bind
to the keyboard USB interface.

This is a bit of a chore. Use the output from `dmesg` to find the keyboard interface you'll need to unbind:

```
[  +3.446301] usb 1-1.1: new full-speed USB device number 44 using ehci-pci
[  +0.094161] usb 1-1.1: New USB device found, idVendor=feed, idProduct=6060
[  +0.000011] usb 1-1.1: New USB device strings: Mfr=1, Product=2, SerialNumber=3
[  +0.000006] usb 1-1.1: Product: Zeal60
[  +0.000004] usb 1-1.1: Manufacturer: ZealPC
[  +0.000005] usb 1-1.1: SerialNumber: 0
[  +0.002601] input: ZealPC Zeal60 as /devices/pci0000:00/0000:00:1a.0/usb1/1-1/1-1.1/1-1.1:1.0/0003:FEED:6060.009F/input/input139
[  +0.056319] hid-generic 0003:FEED:6060.009F: input,hidraw0: USB HID v1.11 Keyboard [ZealPC Zeal60] on usb-0000:00:1a.0-1.1/input0
[  +0.002257] input: ZealPC Zeal60 as /devices/pci0000:00/0000:00:1a.0/usb1/1-1/1-1.1/1-1.1:1.2/0003:FEED:6060.00A0/input/input140
[  +0.053062] hid-generic 0003:FEED:6060.00A0: input,hidraw1: USB HID v1.11 Device [ZealPC Zeal60] on usb-0000:00:1a.0-1.1/input2
[  +0.004068] hid-generic 0003:FEED:6060.00A1: hiddev0,hidraw2: USB HID v1.11 Device [ZealPC Zeal60] on usb-0000:00:1a.0-1.1/input1
[  +0.002094] input: ZealPC Zeal60 as /devices/pci0000:00/0000:00:1a.0/usb1/1-1/1-1.1/1-1.1:1.3/0003:FEED:6060.00A2/input/input141
[  +0.053923] hid-generic 0003:FEED:6060.00A2: input,hidraw3: USB HID v1.11 Keyboard [ZealPC Zeal60] on usb-0000:00:1a.0-1.1/input3
```

In that output, the string you care about is the `1-1.1:` part on that first `input:` line:

```
input: ZealPC Zeal60 as /devices/pci0000:00/0000:00:1a.0/usb1/1-1/1-1.1/1-1.1:1.0/0003:FEED:6060.009F/input/input139
                                                                        \    /
                                                                         this
```

That part describtes what USB bus/hub/port you have your keyboard plugged into. The part after the `:` represents the
four different USB interfaces available on the Zeal60 keyboard. You will want to unbind the `1.1` interface

```
1-1.1:1.0
1-1.1:1.1 // This is the one we care about. Interface 1.
1-1.1:1.2
1-1.1:1.3
```

To unbind that interface, you'll have to open a root shell and run a command. I don't know of another way to do this 
right now. I'll figure out a better approach if I can get far enough along on this project.

```
sudo su
echo -n 1-1.1:1.1 | tee -a /sys/bus/usb/drivers/usbhid/unbind
```

After that, the WebUSB bits should work correctly.

*Note: I have only gotten this to work under Linux. Sorry!*

