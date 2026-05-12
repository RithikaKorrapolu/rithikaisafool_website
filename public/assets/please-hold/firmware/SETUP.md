# Please Hold — Firmware Setup Guide

## What You Need
- ESP32-S3 Audio Board (Waveshare)
- Micro SD card (any size, FAT32 formatted)
- USB-C cable (data, not charge-only)
- Arduino IDE 2.x

## Step 1: Arduino IDE Setup

### Install ESP32 Board Support
1. Open Arduino IDE → **Settings** (⌘ + , on Mac)
2. In "Additional Board Manager URLs" add:
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
3. Go to **Tools → Board → Board Manager**
4. Search "esp32" and install **esp32 by Espressif Systems** (v3.x)

### Select Board Settings
Under **Tools**, set:
| Setting | Value |
|---------|-------|
| Board | ESP32S3 Dev Module |
| USB CDC On Boot | Enabled |
| Flash Size | 16MB (128Mb) |
| Partition Scheme | Huge APP (3MB No OTA/1MB SPIFFS) |
| PSRAM | OPI PSRAM |
| Upload Speed | 921600 |

## Step 2: Install Libraries

The firmware needs three libraries from the demo package. Copy these folders into your Arduino libraries directory:

**Source** (from the demo zip):
```
ESP32-S3-AUDIO-Board-Demo/Arduino/libraries/
```

**Destination** (your Arduino libraries):
- Mac: `~/Documents/Arduino/libraries/`
- Windows: `C:\Users\<you>\Documents\Arduino\libraries\`
- Linux: `~/Arduino/libraries/`

Copy these three folders:
1. `TCA9555/` — I2C GPIO expander driver
2. `es8311/` — DAC codec driver (speaker output)
3. `es7210/` — ADC codec driver (mic input)

After copying, restart Arduino IDE.

## Step 3: Prepare the SD Card

1. Format your SD card as **FAT32**
2. Insert it into the board's SD card slot
3. That's it — the firmware will create `/message.wav` automatically

## Step 4: Flash the Firmware

1. Open `PleaseHold/PleaseHold.ino` in Arduino IDE
2. Connect the board via USB-C
3. Select the correct port under **Tools → Port**
   - It should show up as a USB serial device
   - If it doesn't appear, hold the **BOOT button** while plugging in USB
4. Click **Upload** (→ button)
5. Open **Serial Monitor** (⌘ + Shift + M) at **115200 baud**

You should see:
```
╔═══════════════════════════════════════╗
║     PLEASE HOLD — Telephone Game      ║
║     HomeSick / Gentle Future           ║
╚═══════════════════════════════════════╝

[I2C] Bus initialized
[TCA9555] Buttons and PA initialized
[I2S] Initialized: 16kHz / 16-bit / Stereo
[ES8311] DAC initialized (speaker output)
[ES7210] ADC initialized (microphone input)
[SD] Card mounted: XX MB

─── Ready ───
  KEY1 (hold)  = Record a message
  KEY2 (press) = Play the message
  KEY3 (press) = Delete the message
```

## Step 5: Test It

1. **Record**: Hold KEY1, speak into the mic, release KEY1
   - Serial shows: `>>> RECORDING...` then `<<< RECORDED: X.X seconds`
2. **Play**: Press KEY2
   - Serial shows: `>>> PLAYING...` then `<<< PLAYBACK COMPLETE`
3. **Delete**: Press KEY3 to erase the message

## Troubleshooting

**Board not showing up in Arduino IDE:**
- Hold the BOOT button (GPIO0) while connecting USB, then release
- Try a different USB-C cable (some are charge-only)

**SD card not mounting:**
- Make sure it's FAT32 formatted
- Try a smaller card (< 32GB)
- Check that the card is fully seated in the slot

**No audio on playback:**
- Check serial output for error messages
- The PA (power amplifier) should auto-enable — look for `[TCA9555] Buttons and PA initialized`

**Recording is silent/noisy:**
- The ES7210 mic gain is set to 30dB — adjust `ES7210_MIC_GAIN_30DB` in the sketch
- Make sure you're speaking close to the board's microphone

## Getting Files Off the Device

For now, eject the SD card and read it on your computer. The message is at `/message.wav`.

WiFi file transfer will be added in a future update.

## Button Locations

Looking at the board with the USB-C port at the bottom:
- KEY1 (Record) = labeled on the board, top area
- KEY2 (Play) = middle button
- KEY3 (Delete) = third button
- BOOT = small button near the USB-C port

Check the board silkscreen for exact positions. The buttons are on the TCA9555 GPIO expander, accessible via the I2C bus.
