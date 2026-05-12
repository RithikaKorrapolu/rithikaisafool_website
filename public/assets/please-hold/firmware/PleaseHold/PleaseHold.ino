/*
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║  PLEASE HOLD — Telephone Game Device                        ║
 * ║  ESP32-S3 Audio Board Firmware                               ║
 * ║  HomeSick / Gentle Future                                    ║
 * ╚═══════════════════════════════════════════════════════════════╝
 *
 * A phone-shaped game of telephone. Messages accumulate on threads.
 *
 * BUTTONS:
 *   K1Plus  (hold)  = Record — adds a new message to the current thread
 *   K2Set   (press) = Play   — plays the most recent message in the thread
 *   K3Minus (press) = New Thread — starts a fresh thread
 *
 * SD CARD LAYOUT:
 *   /thread_001/001.wav
 *   /thread_001/002.wav
 *   /thread_001/003.wav
 *   /thread_002/001.wav
 *   ...
 *
 * WIFI SETUP:
 *   1. Download "ESP BLE Provisioning" app (iOS App Store / Google Play)
 *   2. Power on device - it broadcasts "PleaseHold" via Bluetooth
 *   3. Open app, tap device, select your WiFi, enter password
 *   4. Device connects and syncs recordings to cloud
 *
 * TO RESET WIFI: Hold K3 button for 3 seconds during boot
 */

#include <Wire.h>
#include <SD_MMC.h>
#include <FS.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <WebServer.h>
#include <DNSServer.h>
#include <HTTPClient.h>
#include "ESP_I2S.h"
#include "TCA9555.h"
#include "es8311.h"
#include "es7210.h"

// ─────────────────────────────────────────────
//  WIFI CONFIGURATION
// ─────────────────────────────────────────────

// AP mode settings (when no WiFi configured)
const char* AP_SSID = "PleaseHold";
const char* AP_PASSWORD = "telephone";

// WiFi credentials loaded from SD card
String wifiSSID = "";
String wifiPassword = "";
bool stationMode = false;  // true = connected to external WiFi, false = AP mode

WebServer server(80);
DNSServer dnsServer;
const byte DNS_PORT = 53;

// ─────────────────────────────────────────────
//  CLOUD UPLOAD CONFIGURATION
// ─────────────────────────────────────────────

// Upload recordings to this URL (your website's API endpoint)
const char* CLOUD_UPLOAD_URL = "https://rithikaisafool.com/api/please-hold/upload";

// Set to true to enable cloud sync (requires station mode WiFi)
bool cloudSyncEnabled = true;

// ─────────────────────────────────────────────
//  PIN DEFINITIONS
// ─────────────────────────────────────────────

#define I2C_SDA_PIN       11
#define I2C_SCL_PIN       10

#define I2S_SCLK          GPIO_NUM_13
#define I2S_MCLK          GPIO_NUM_12
#define I2S_LCLK          GPIO_NUM_14
#define I2S_DOUT          GPIO_NUM_16
#define I2S_DIN           GPIO_NUM_15

#define SD_CLK_PIN        40
#define SD_CMD_PIN        42
#define SD_D0_PIN         41

#define TCA9555_ADDR      0x20
#define EXIO_PA_EN        8
#define EXIO_KEY1         9     // K1Plus  = RECORD
#define EXIO_KEY2         10    // K2Set   = PLAY
#define EXIO_KEY3         11    // K3Minus = NEW THREAD

// ─────────────────────────────────────────────
//  AUDIO CONFIGURATION
// ─────────────────────────────────────────────

#define SAMPLE_RATE       16000
#define BITS_PER_SAMPLE   16
#define NUM_CHANNELS      2
#define BYTES_PER_SAMPLE  (BITS_PER_SAMPLE / 8)
#define FRAME_SIZE        (BYTES_PER_SAMPLE * NUM_CHANNELS)

#define REC_BUF_FRAMES    1024
#define REC_BUF_BYTES     (REC_BUF_FRAMES * FRAME_SIZE)

#define MAX_RECORD_SECS   60
#define MAX_RECORD_BYTES  (MAX_RECORD_SECS * SAMPLE_RATE * FRAME_SIZE)

// ─────────────────────────────────────────────
//  STATE MACHINE
// ─────────────────────────────────────────────

enum DeviceState {
  STATE_IDLE,
  STATE_RECORDING,
  STATE_PLAYING
};

DeviceState state = STATE_IDLE;

// ─────────────────────────────────────────────
//  THREAD TRACKING
// ─────────────────────────────────────────────

int currentThread  = 0;   // e.g. 1 → /thread_001/
int currentMessage = 0;   // next message number to write

// Returns path like "/thread_001"
String threadDir(int t) {
  char buf[20];
  snprintf(buf, sizeof(buf), "/thread_%03d", t);
  return String(buf);
}

// Returns path like "/thread_001/003.wav"
String messagePath(int t, int m) {
  char buf[30];
  snprintf(buf, sizeof(buf), "/thread_%03d/%03d.wav", t, m);
  return String(buf);
}

// Scan SD card to find the highest existing thread number
int findHighestThread() {
  int highest = 0;
  File root = SD_MMC.open("/");
  if (!root) return 0;
  File entry = root.openNextFile();
  while (entry) {
    if (entry.isDirectory()) {
      String name = entry.name(); // e.g. "/thread_003"
      if (name.startsWith("/thread_")) {
        int num = name.substring(8).toInt();
        if (num > highest) highest = num;
      }
    }
    entry = root.openNextFile();
  }
  return highest;
}

// Count WAV files in a thread directory
int countMessages(int t) {
  String dir = threadDir(t);
  File d = SD_MMC.open(dir);
  if (!d || !d.isDirectory()) return 0;
  int count = 0;
  File entry = d.openNextFile();
  while (entry) {
    String name = entry.name();
    if (name.endsWith(".wav")) count++;
    entry = d.openNextFile();
  }
  return count;
}

// ─────────────────────────────────────────────
//  GLOBAL OBJECTS
// ─────────────────────────────────────────────

TCA9555 tca(TCA9555_ADDR);
I2SClass i2s;

es8311_handle_t     es8311Handle = NULL;
es7210_dev_handle_t es7210Handle = NULL;

File wavFile;
uint32_t totalDataBytes = 0;

uint8_t playBuf[REC_BUF_BYTES];

bool wifiConnected = false;

// ─────────────────────────────────────────────
//  WAV FILE HEADER (44 bytes)
// ─────────────────────────────────────────────

struct WavHeader {
  char     riffTag[4];
  uint32_t riffSize;
  char     waveTag[4];
  char     fmtTag[4];
  uint32_t fmtSize;
  uint16_t audioFormat;
  uint16_t numChannels;
  uint32_t sampleRate;
  uint32_t byteRate;
  uint16_t blockAlign;
  uint16_t bitsPerSample;
  char     dataTag[4];
  uint32_t dataSize;
} __attribute__((packed));

void writeWavHeader(File &f, uint32_t dataSize) {
  WavHeader hdr;
  memcpy(hdr.riffTag, "RIFF", 4);
  hdr.riffSize      = dataSize + 36;
  memcpy(hdr.waveTag, "WAVE", 4);
  memcpy(hdr.fmtTag, "fmt ", 4);
  hdr.fmtSize       = 16;
  hdr.audioFormat    = 1;
  hdr.numChannels    = NUM_CHANNELS;
  hdr.sampleRate     = SAMPLE_RATE;
  hdr.byteRate       = SAMPLE_RATE * NUM_CHANNELS * BYTES_PER_SAMPLE;
  hdr.blockAlign     = NUM_CHANNELS * BYTES_PER_SAMPLE;
  hdr.bitsPerSample  = BITS_PER_SAMPLE;
  memcpy(hdr.dataTag, "data", 4);
  hdr.dataSize       = dataSize;

  f.seek(0);
  f.write((uint8_t*)&hdr, sizeof(WavHeader));
}

// ─────────────────────────────────────────────
//  BUTTON READING
// ─────────────────────────────────────────────

bool isButtonPressed(uint8_t pin) {
  return (tca.read1(pin) == 0);
}

// ─────────────────────────────────────────────
//  CODEC INITIALIZATION
// ─────────────────────────────────────────────

bool initES8311() {
  es8311Handle = es8311_create(I2C_NUM_0, ES8311_ADDRRES_0);
  if (!es8311Handle) {
    Serial.println("[ES8311] Failed to create handle");
    return false;
  }

  es8311_clock_config_t clk = {
    .mclk_inverted      = false,
    .sclk_inverted      = false,
    .mclk_from_mclk_pin = true,
    .mclk_frequency     = SAMPLE_RATE * 256,
    .sample_frequency   = SAMPLE_RATE
  };

  esp_err_t err = es8311_init(es8311Handle, &clk, ES8311_RESOLUTION_16, ES8311_RESOLUTION_16);
  if (err != ESP_OK) {
    Serial.printf("[ES8311] Init failed: %d\n", err);
    return false;
  }

  es8311_voice_volume_set(es8311Handle, 80, NULL);
  es8311_microphone_config(es8311Handle, false);

  Serial.println("[ES8311] DAC initialized (speaker output)");
  return true;
}

bool initES7210() {
  es7210_i2c_config_t i2c_cfg = {
    .i2c_port = I2C_NUM_0,
    .i2c_addr = 0x40
  };

  esp_err_t err = es7210_new_codec(&i2c_cfg, &es7210Handle);
  if (err != ESP_OK) {
    Serial.printf("[ES7210] Failed to create codec: %d\n", err);
    return false;
  }

  es7210_codec_config_t codec_cfg = {
    .sample_rate_hz = SAMPLE_RATE,
    .mclk_ratio     = 256,
    .i2s_format     = ES7210_I2S_FMT_I2S,
    .bit_width      = ES7210_I2S_BITS_16B,
    .mic_bias       = ES7210_MIC_BIAS_2V87,
    .mic_gain       = ES7210_MIC_GAIN_30DB,
    .flags          = { .tdm_enable = true }
  };

  err = es7210_config_codec(es7210Handle, &codec_cfg);
  if (err != ESP_OK) {
    Serial.printf("[ES7210] Config failed: %d\n", err);
    return false;
  }

  es7210_config_volume(es7210Handle, 0);

  Serial.println("[ES7210] ADC initialized (microphone input)");
  return true;
}

// ─────────────────────────────────────────────
//  I2S INITIALIZATION
// ─────────────────────────────────────────────

bool initI2S() {
  i2s.setPins(I2S_SCLK, I2S_LCLK, I2S_DOUT, I2S_DIN, I2S_MCLK);
  i2s.setTimeout(1000);

  bool ok = i2s.begin(I2S_MODE_STD, SAMPLE_RATE, I2S_DATA_BIT_WIDTH_16BIT, I2S_SLOT_MODE_STEREO);
  if (!ok) {
    Serial.println("[I2S] Failed to initialize");
    return false;
  }

  Serial.println("[I2S] Initialized: 16kHz / 16-bit / Stereo");
  return true;
}

// ─────────────────────────────────────────────
//  SD CARD INITIALIZATION
// ─────────────────────────────────────────────

bool initSD() {
  SD_MMC.setPins(SD_CLK_PIN, SD_CMD_PIN, SD_D0_PIN);

  if (!SD_MMC.begin("/sdcard", true)) {
    Serial.println("[SD] Mount failed — is an SD card inserted?");
    return false;
  }

  uint64_t cardSize = SD_MMC.cardSize() / (1024 * 1024);
  Serial.printf("[SD] Card mounted: %llu MB\n", cardSize);

  // Find existing threads
  currentThread = findHighestThread();
  if (currentThread > 0) {
    currentMessage = countMessages(currentThread);
    Serial.printf("[SD] Resuming thread %d with %d messages\n", currentThread, currentMessage);
  } else {
    // Start first thread automatically
    currentThread = 1;
    currentMessage = 0;
    SD_MMC.mkdir(threadDir(currentThread).c_str());
    Serial.printf("[SD] Created first thread: %s\n", threadDir(currentThread).c_str());
  }

  return true;
}

// ─────────────────────────────────────────────
//  WIFI CONFIG FROM SD CARD
// ─────────────────────────────────────────────

bool loadWiFiConfig() {
  // Read wifi.txt from SD card
  // Format:
  //   Line 1: SSID
  //   Line 2: Password

  File configFile = SD_MMC.open("/wifi.txt", FILE_READ);
  if (!configFile) {
    Serial.println("[WiFi] No wifi.txt found — will use AP mode");
    return false;
  }

  // Read SSID (first line)
  wifiSSID = configFile.readStringUntil('\n');
  wifiSSID.trim();

  // Read password (second line)
  wifiPassword = configFile.readStringUntil('\n');
  wifiPassword.trim();

  configFile.close();

  if (wifiSSID.length() == 0) {
    Serial.println("[WiFi] wifi.txt is empty — will use AP mode");
    return false;
  }

  Serial.printf("[WiFi] Loaded config: SSID=\"%s\"\n", wifiSSID.c_str());
  return true;
}

// ─────────────────────────────────────────────
//  TCA9555 (BUTTONS + PA) INITIALIZATION
// ─────────────────────────────────────────────

bool initButtons() {
  if (!tca.begin()) {
    Serial.println("[TCA9555] Failed to initialize");
    return false;
  }

  tca.pinMode16(0x0000);

  tca.pinMode1(EXIO_KEY1, INPUT);
  tca.pinMode1(EXIO_KEY2, INPUT);
  tca.pinMode1(EXIO_KEY3, INPUT);

  tca.write1(EXIO_PA_EN, HIGH);
  delay(50);

  Serial.println("[TCA9555] Buttons and PA initialized");
  return true;
}

// ─────────────────────────────────────────────
//  WIFI + HTTP SERVER
// ─────────────────────────────────────────────

void handleRoot() {
  String stateStr = "IDLE";
  if (state == STATE_RECORDING) stateStr = "RECORDING";
  if (state == STATE_PLAYING) stateStr = "PLAYING";

  String html = "<!DOCTYPE html><html><head>";
  html += "<meta name='viewport' content='width=device-width,initial-scale=1'>";
  html += "<meta charset='utf-8'>";
  html += "<title>Please Hold</title>";
  html += "<style>";
  html += "body{font-family:system-ui,-apple-system,sans-serif;max-width:600px;margin:40px auto;padding:20px;background:#fafafa;color:#1a1a1a;}";
  html += "h1{font-size:1.5rem;margin-bottom:0.25rem;}";
  html += "h2{font-size:1.1rem;margin-top:2rem;margin-bottom:0.5rem;padding-bottom:6px;border-bottom:1px solid #ddd;}";
  html += ".subtitle{color:#666;font-size:0.9rem;margin-bottom:1.5rem;}";
  html += ".info{background:#fff;border:1px solid #e0e0e0;border-radius:12px;padding:16px;margin-bottom:16px;}";
  html += ".info-label{font-size:0.75rem;text-transform:uppercase;letter-spacing:0.05em;color:#888;margin-bottom:4px;}";
  html += ".info-value{font-size:1.1rem;font-weight:600;}";
  html += ".thread{background:#fff;border:1px solid #e0e0e0;border-radius:12px;padding:16px;margin-bottom:12px;}";
  html += ".thread-title{font-weight:600;font-size:1rem;margin-bottom:8px;}";
  html += ".msg{padding:8px 0;border-top:1px solid #f0f0f0;}";
  html += ".msg:first-child{border-top:none;}";
  html += ".msg a{color:#1a73e8;text-decoration:none;font-weight:500;}";
  html += ".msg .meta{font-size:0.8rem;color:#888;margin-left:8px;}";
  html += "audio{width:100%;margin:8px 0;}";
  html += ".refresh{font-size:0.8rem;color:#888;margin-top:2rem;}";
  html += "</style></head><body>";

  String ip = stationMode ? WiFi.localIP().toString() : "192.168.4.1";
  String wifiStatus = stationMode ? ("Connected to " + wifiSSID) : "AP Mode (PleaseHold)";

  html += "<h1>Please Hold</h1>";
  html += "<p class='subtitle'>A telephone that holds one message at a time. All threads archived below.</p>";
  html += "<div class='info' style='margin-bottom:12px;'>";
  html += "<div class='info-label'>WiFi</div>";
  html += "<div class='info-value'>" + wifiStatus + " &mdash; " + ip + "</div>";
  html += "<a href='/wifi' style='font-size:0.85rem;color:#1a73e8;'>Change WiFi Network</a>";
  html += "</div>";

  html += "<div class='info'>";
  html += "<div class='info-label'>Status</div>";
  html += "<div class='info-value'>" + stateStr + " &mdash; Thread " + String(currentThread) + ", " + String(currentMessage) + " message" + (currentMessage != 1 ? "s" : "") + "</div>";
  html += "</div>";

  // List all threads in reverse order (newest first)
  int highestThread = findHighestThread();
  for (int t = highestThread; t >= 1; t--) {
    int msgCount = countMessages(t);
    if (msgCount == 0) continue;

    html += "<div class='thread'>";
    html += "<div class='thread-title'>Thread " + String(t);
    if (t == currentThread) html += " (active)";
    html += " &mdash; " + String(msgCount) + " message" + (msgCount != 1 ? "s" : "") + "</div>";

    for (int m = 1; m <= msgCount; m++) {
      String path = messagePath(t, m);
      if (!SD_MMC.exists(path.c_str())) continue;

      File f = SD_MMC.open(path.c_str(), FILE_READ);
      float secs = 0;
      if (f && f.size() > 44) {
        secs = (float)(f.size() - 44) / (SAMPLE_RATE * FRAME_SIZE);
      }
      if (f) f.close();

      String urlPath = path;  // SD path is also the URL path
      html += "<div class='msg'>";
      html += "<a href='" + urlPath + "' download>Message " + String(m) + "</a>";
      html += "<span class='meta'>" + String(secs, 1) + "s</span>";
      html += "<audio controls src='" + urlPath + "' preload='none'></audio>";
      html += "</div>";
    }

    html += "</div>";
  }

  html += "<p class='refresh'>Auto-refreshes every 10 seconds.</p>";
  html += "<script>setTimeout(()=>location.reload(),10000);</script>";
  html += "</body></html>";

  server.send(200, "text/html", html);
}

// Serve any WAV file from SD by path
void handleWavFile() {
  String path = server.uri();

  if (!SD_MMC.exists(path.c_str())) {
    server.send(404, "text/plain", "File not found: " + path);
    return;
  }

  File f = SD_MMC.open(path.c_str(), FILE_READ);
  if (!f) {
    server.send(500, "text/plain", "Failed to open file");
    return;
  }

  // Extract filename for download header
  String filename = path.substring(path.lastIndexOf('/') + 1);
  server.sendHeader("Content-Disposition", "inline; filename=\"" + filename + "\"");
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.streamFile(f, "audio/wav");
  f.close();
}

void handleStatus() {
  String stateStr = "idle";
  if (state == STATE_RECORDING) stateStr = "recording";
  if (state == STATE_PLAYING) stateStr = "playing";

  String ip = stationMode ? WiFi.localIP().toString() : WiFi.softAPIP().toString();
  String mode = stationMode ? "station" : "ap";
  String ssid = stationMode ? wifiSSID : String(AP_SSID);

  // Build threads array
  String threadsJson = "[";
  int highestThread = findHighestThread();
  bool firstThread = true;
  for (int t = highestThread; t >= 1; t--) {
    int msgCount = countMessages(t);
    if (msgCount == 0) continue;

    if (!firstThread) threadsJson += ",";
    firstThread = false;

    threadsJson += "{\"id\":" + String(t) + ",\"messages\":[";

    bool firstMsg = true;
    for (int m = 1; m <= msgCount; m++) {
      String path = messagePath(t, m);
      if (!SD_MMC.exists(path.c_str())) continue;

      File f = SD_MMC.open(path.c_str(), FILE_READ);
      float secs = 0;
      size_t fileSize = 0;
      if (f) {
        fileSize = f.size();
        if (fileSize > 44) {
          secs = (float)(fileSize - 44) / (SAMPLE_RATE * FRAME_SIZE);
        }
        f.close();
      }

      if (!firstMsg) threadsJson += ",";
      firstMsg = false;

      threadsJson += "{\"id\":" + String(m) + ",";
      threadsJson += "\"path\":\"" + path + "\",";
      threadsJson += "\"duration\":" + String(secs, 2) + ",";
      threadsJson += "\"size\":" + String(fileSize) + "}";
    }

    threadsJson += "]}";
  }
  threadsJson += "]";

  String json = "{";
  json += "\"state\":\"" + stateStr + "\",";
  json += "\"currentThread\":" + String(currentThread) + ",";
  json += "\"currentMessage\":" + String(currentMessage) + ",";
  json += "\"wifiMode\":\"" + mode + "\",";
  json += "\"ssid\":\"" + ssid + "\",";
  json += "\"ip\":\"" + ip + "\",";
  json += "\"threads\":" + threadsJson;
  json += "}";

  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "application/json", json);
}

void handleNotFound() {
  String path = server.uri();

  // If it looks like a WAV file path, try to serve it
  if (path.endsWith(".wav")) {
    handleWavFile();
    return;
  }

  server.send(404, "text/plain", "Not found");
}

// ─────────────────────────────────────────────
//  WEB-BASED WIFI SETUP (BACKUP - COMMENTED OUT)
//  Uncomment if BLE provisioning doesn't work
// ─────────────────────────────────────────────

/*
// Captive portal redirect - sends user to WiFi setup page
void handleCaptivePortal() {
  String redirectUrl = "http://" + WiFi.softAPIP().toString() + "/wifi";
  server.sendHeader("Location", redirectUrl, true);
  server.send(302, "text/plain", "");
}

void handleAppleDetect() { handleCaptivePortal(); }
void handleGenerate204() { handleCaptivePortal(); }
void handleWindowsDetect() { handleCaptivePortal(); }

void startAPMode() {
  Serial.printf("[WiFi] Starting Access Point \"PleaseHold\"...\n");
  WiFi.mode(WIFI_AP);
  WiFi.softAP("PleaseHold", "telephone");
  delay(100);
  Serial.println("[WiFi] AP started!");
  Serial.printf("[WiFi] URL: http://192.168.4.1\n");
}

void handleWiFiSetup() {
  int n = WiFi.scanNetworks();
  String networks = "";
  for (int i = 0; i < n; i++) {
    String ssid = WiFi.SSID(i);
    if (ssid.length() == 0) continue;
    int rssi = WiFi.RSSI(i);
    bool secure = WiFi.encryptionType(i) != WIFI_AUTH_OPEN;
    String bars = rssi > -60 ? "3" : (rssi > -75 ? "2" : "1");
    networks += "<div class='net' onclick='sel(this)' data-ssid='" + ssid + "' data-sec='" + (secure ? "1" : "0") + "'>";
    networks += "<span>" + ssid + "</span></div>";
  }
  String html = "<!DOCTYPE html><html><head><meta name='viewport' content='width=device-width'>";
  html += "<style>body{font-family:sans-serif;background:#222;color:#fff;padding:20px}.net{padding:12px;border:1px solid #444;margin:4px 0;cursor:pointer}.net:hover{background:#333}input{width:100%;padding:10px;margin:8px 0}button{width:100%;padding:12px;background:#0a84ff;color:#fff;border:none}</style></head><body>";
  html += "<h2>WiFi Setup</h2>" + networks;
  html += "<form action='/wifi-save' method='POST'><input name='ssid' id='ssid' placeholder='Network'><input name='pass' type='password' placeholder='Password'><button>Connect</button></form>";
  html += "<script>function sel(el){document.getElementById('ssid').value=el.dataset.ssid}</script></body></html>";
  server.send(200, "text/html", html);
}

void handleWiFiSave() {
  String ssid = server.arg("ssid");
  String pass = server.arg("pass");
  if (ssid.length() == 0) { server.send(400, "text/plain", "SSID required"); return; }
  File f = SD_MMC.open("/wifi.txt", FILE_WRITE);
  if (f) { f.println(ssid); f.println(pass); f.close(); }
  server.send(200, "text/html", "<h1>Connecting...</h1><p>Device will restart.</p>");
  delay(1000);
  ESP.restart();
}

// To use web-based setup instead of BLE, in initWiFi() replace:
//   startBLEProvisioning();
// with:
//   startAPMode();
//   server.on("/wifi", handleWiFiSetup);
//   server.on("/wifi-save", HTTP_POST, handleWiFiSave);
*/

// Start AP mode for WiFi setup
void startAPMode() {
  Serial.printf("[WiFi] Starting Access Point \"%s\"...\n", AP_SSID);

  WiFi.mode(WIFI_AP);
  WiFi.softAP(AP_SSID, AP_PASSWORD);
  delay(100);

  // Start DNS server for captive portal
  dnsServer.start(DNS_PORT, "*", WiFi.softAPIP());

  stationMode = false;
  wifiConnected = true;

  Serial.println("[WiFi] AP started!");
  Serial.printf("[WiFi] Network: \"%s\"  Password: \"%s\"\n", AP_SSID, AP_PASSWORD);
  Serial.printf("[WiFi] Setup URL: http://192.168.4.1/wifi\n");
}

bool connectToWiFi() {
  if (wifiSSID.length() == 0) return false;

  Serial.printf("[WiFi] Connecting to \"%s\"...\n", wifiSSID.c_str());

  WiFi.mode(WIFI_STA);
  WiFi.begin(wifiSSID.c_str(), wifiPassword.c_str());

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    stationMode = true;
    wifiConnected = true;
    Serial.println();
    Serial.printf("[WiFi] Connected! IP: %s\n", WiFi.localIP().toString().c_str());
    return true;
  }

  Serial.println();
  Serial.println("[WiFi] Connection failed - starting AP mode");
  return false;
}

// WiFi setup page handler
void handleWiFiSetup() {
  int n = WiFi.scanNetworks();
  String networks = "";
  for (int i = 0; i < n; i++) {
    String ssid = WiFi.SSID(i);
    if (ssid.length() == 0) continue;
    int rssi = WiFi.RSSI(i);
    bool secure = WiFi.encryptionType(i) != WIFI_AUTH_OPEN;
    String signal = rssi > -50 ? "Excellent" : (rssi > -70 ? "Good" : "Weak");
    networks += "<div class='net' onclick=\"sel('" + ssid + "')\">" + ssid;
    if (secure) networks += " [secured]";
    networks += " <small>(" + signal + ")</small></div>";
  }

  String html = "<!DOCTYPE html><html><head>";
  html += "<meta name='viewport' content='width=device-width,initial-scale=1'>";
  html += "<title>Please Hold - WiFi Setup</title>";
  html += "<style>";
  html += "body{font-family:system-ui;background:#1a1a1a;color:#fff;padding:20px;max-width:400px;margin:0 auto}";
  html += "h1{font-size:1.5em;margin-bottom:0.5em}";
  html += ".net{padding:12px;background:#333;margin:8px 0;border-radius:8px;cursor:pointer}";
  html += ".net:hover{background:#444}";
  html += "input{width:100%;padding:12px;margin:8px 0;border:none;border-radius:8px;background:#333;color:#fff;font-size:16px;box-sizing:border-box}";
  html += "button{width:100%;padding:14px;background:#0a84ff;color:#fff;border:none;border-radius:8px;font-size:16px;cursor:pointer;margin-top:12px}";
  html += "button:hover{background:#0070e0}";
  html += "small{color:#888}";
  html += "</style></head><body>";
  html += "<h1>Please Hold</h1>";
  html += "<p>Select your WiFi network:</p>";
  html += networks;
  html += "<form action='/wifi-save' method='POST'>";
  html += "<input type='text' name='ssid' id='ssid' placeholder='Network name' required>";
  html += "<input type='password' name='pass' placeholder='Password'>";
  html += "<button type='submit'>Connect</button>";
  html += "</form>";
  html += "<script>function sel(s){document.getElementById('ssid').value=s}</script>";
  html += "</body></html>";

  server.send(200, "text/html", html);
}

// Save WiFi credentials and restart
void handleWiFiSave() {
  String ssid = server.arg("ssid");
  String pass = server.arg("pass");

  if (ssid.length() == 0) {
    server.send(400, "text/plain", "Network name required");
    return;
  }

  // Save to SD card
  File f = SD_MMC.open("/wifi.txt", FILE_WRITE);
  if (f) {
    f.println(ssid);
    f.println(pass);
    f.close();
    Serial.printf("[WiFi] Saved: %s\n", ssid.c_str());
  }

  String html = "<!DOCTYPE html><html><head>";
  html += "<meta name='viewport' content='width=device-width,initial-scale=1'>";
  html += "<title>Connecting...</title>";
  html += "<style>body{font-family:system-ui;background:#1a1a1a;color:#fff;padding:40px;text-align:center}</style>";
  html += "</head><body>";
  html += "<h1>Connecting...</h1>";
  html += "<p>Device will restart and connect to:<br><strong>" + ssid + "</strong></p>";
  html += "</body></html>";

  server.send(200, "text/html", html);
  delay(1000);
  ESP.restart();
}

// Captive portal redirect
void handleCaptiveRedirect() {
  server.sendHeader("Location", "http://192.168.4.1/wifi", true);
  server.send(302, "text/plain", "");
}

void initWiFi() {
  // Try to load saved WiFi config from SD card
  loadWiFiConfig();

  // Try station mode if we have credentials
  if (wifiSSID.length() > 0 && connectToWiFi()) {
    // Connected to external WiFi
  } else {
    // No credentials or connection failed - start AP mode for setup
    startAPMode();
  }

  // Set up web server routes
  server.on("/", handleRoot);
  server.on("/status", handleStatus);
  server.on("/wifi", handleWiFiSetup);
  server.on("/wifi-save", HTTP_POST, handleWiFiSave);

  // Captive portal redirects
  server.on("/hotspot-detect.html", handleCaptiveRedirect);
  server.on("/generate_204", handleCaptiveRedirect);
  server.on("/connecttest.txt", handleCaptiveRedirect);
  server.on("/fwlink", handleCaptiveRedirect);

  server.onNotFound(handleNotFound);
  server.begin();

  Serial.println("[WiFi] HTTP server started on port 80");
}

// ─────────────────────────────────────────────
//  RECORDING
// ─────────────────────────────────────────────

void startRecording() {
  currentMessage++;
  String path = messagePath(currentThread, currentMessage);

  Serial.printf("\n>>> RECORDING to %s — speak into the mic...\n", path.c_str());

  wavFile = SD_MMC.open(path.c_str(), FILE_WRITE);
  if (!wavFile) {
    Serial.println("[REC] Failed to create WAV file!");
    currentMessage--;  // Roll back
    return;
  }

  totalDataBytes = 0;
  writeWavHeader(wavFile, 0);

  state = STATE_RECORDING;
}

void recordLoop() {
  uint8_t buf[REC_BUF_BYTES];
  size_t bytesRead = i2s.readBytes((char*)buf, REC_BUF_BYTES);

  if (bytesRead > 0 && totalDataBytes < MAX_RECORD_BYTES) {
    wavFile.write(buf, bytesRead);
    totalDataBytes += bytesRead;

    static uint32_t lastDot = 0;
    if (millis() - lastDot > 500) {
      Serial.printf(".");
      lastDot = millis();
    }
  }

  if (totalDataBytes >= MAX_RECORD_BYTES) {
    Serial.println("\n[REC] Max recording time reached (60s)");
    stopRecording();
  }
}

// Upload a WAV file to cloud storage
bool uploadToCloud(String filePath, int threadId, int messageId, float duration) {
  if (!cloudSyncEnabled || !stationMode) {
    Serial.println("[CLOUD] Sync disabled or not in station mode, skipping");
    return false;
  }

  Serial.printf("[CLOUD] Uploading %s to cloud...\n", filePath.c_str());

  // Open file
  File uploadFile = SD_MMC.open(filePath.c_str(), FILE_READ);
  if (!uploadFile) {
    Serial.println("[CLOUD] Failed to open file");
    return false;
  }

  size_t fileSize = uploadFile.size();
  Serial.printf("[CLOUD] File size: %d bytes\n", fileSize);

  // Check file size (max ~400KB for memory upload)
  if (fileSize > 400000) {
    Serial.println("[CLOUD] File too large, skipping upload");
    uploadFile.close();
    return false;
  }

  // Read file into memory
  uint8_t* fileData = (uint8_t*)malloc(fileSize);
  if (!fileData) {
    Serial.println("[CLOUD] Failed to allocate memory");
    uploadFile.close();
    return false;
  }
  uploadFile.read(fileData, fileSize);
  uploadFile.close();

  // Build multipart form data
  String boundary = "----PleaseHold";
  String formStart = "--" + boundary + "\r\n";
  formStart += "Content-Disposition: form-data; name=\"threadId\"\r\n\r\n" + String(threadId) + "\r\n";
  formStart += "--" + boundary + "\r\n";
  formStart += "Content-Disposition: form-data; name=\"messageId\"\r\n\r\n" + String(messageId) + "\r\n";
  formStart += "--" + boundary + "\r\n";
  formStart += "Content-Disposition: form-data; name=\"duration\"\r\n\r\n" + String(duration, 2) + "\r\n";
  formStart += "--" + boundary + "\r\n";
  formStart += "Content-Disposition: form-data; name=\"file\"; filename=\"recording.wav\"\r\n";
  formStart += "Content-Type: audio/wav\r\n\r\n";
  String formEnd = "\r\n--" + boundary + "--\r\n";

  // Allocate payload buffer
  size_t totalLen = formStart.length() + fileSize + formEnd.length();
  uint8_t* payload = (uint8_t*)malloc(totalLen);
  if (!payload) {
    Serial.println("[CLOUD] Failed to allocate payload");
    free(fileData);
    return false;
  }

  // Build payload
  memcpy(payload, formStart.c_str(), formStart.length());
  memcpy(payload + formStart.length(), fileData, fileSize);
  memcpy(payload + formStart.length() + fileSize, formEnd.c_str(), formEnd.length());
  free(fileData);

  // Send HTTP POST (HTTPS with certificate bypass for testing)
  WiFiClientSecure client;
  client.setInsecure();  // Skip certificate verification

  HTTPClient http;
  http.begin(client, CLOUD_UPLOAD_URL);
  http.setTimeout(60000);
  http.addHeader("Content-Type", "multipart/form-data; boundary=" + boundary);

  Serial.printf("[CLOUD] Sending %d bytes to %s\n", totalLen, CLOUD_UPLOAD_URL);
  int code = http.POST(payload, totalLen);
  free(payload);

  if (code == 200) {
    String response = http.getString();
    Serial.printf("[CLOUD] Success! %s\n", response.c_str());
    http.end();
    return true;
  } else {
    Serial.printf("[CLOUD] Failed with code: %d\n", code);
    if (code > 0) {
      String response = http.getString();
      Serial.printf("[CLOUD] Response: %s\n", response.c_str());
    }
    http.end();
    return false;
  }
}

void stopRecording() {
  writeWavHeader(wavFile, totalDataBytes);
  wavFile.close();

  float seconds = (float)totalDataBytes / (SAMPLE_RATE * FRAME_SIZE);
  Serial.printf("\n<<< RECORDED: %.1f seconds — Thread %d, Message %d\n", seconds, currentThread, currentMessage);

  // Upload to cloud in background
  String path = messagePath(currentThread, currentMessage);
  uploadToCloud(path, currentThread, currentMessage, seconds);

  state = STATE_IDLE;
}

// ─────────────────────────────────────────────
//  PLAYBACK — plays the LATEST message in the current thread
// ─────────────────────────────────────────────

void startPlayback() {
  if (currentMessage < 1) {
    Serial.println("[PLAY] No messages in this thread!");
    return;
  }

  // Play the most recent message
  String path = messagePath(currentThread, currentMessage);

  if (!SD_MMC.exists(path.c_str())) {
    Serial.printf("[PLAY] File not found: %s\n", path.c_str());
    return;
  }

  wavFile = SD_MMC.open(path.c_str(), FILE_READ);
  if (!wavFile) {
    Serial.println("[PLAY] Failed to open WAV file!");
    return;
  }

  wavFile.seek(44);

  float seconds = (float)(wavFile.size() - 44) / (SAMPLE_RATE * FRAME_SIZE);
  Serial.printf("\n>>> PLAYING: Thread %d, Message %d (%.1fs)...\n", currentThread, currentMessage, seconds);

  state = STATE_PLAYING;
}

void playbackLoop() {
  if (!wavFile.available()) {
    stopPlayback();
    return;
  }

  size_t bytesRead = wavFile.read(playBuf, REC_BUF_BYTES);
  if (bytesRead > 0) {
    i2s.write(playBuf, bytesRead);

    static uint32_t lastDot = 0;
    if (millis() - lastDot > 500) {
      Serial.printf(".");
      lastDot = millis();
    }
  }
}

void stopPlayback() {
  wavFile.close();
  Serial.println("\n<<< PLAYBACK COMPLETE");
  state = STATE_IDLE;
}

// ─────────────────────────────────────────────
//  NEW THREAD
// ─────────────────────────────────────────────

void startNewThread() {
  currentThread++;
  currentMessage = 0;

  String dir = threadDir(currentThread);
  SD_MMC.mkdir(dir.c_str());

  Serial.printf("\n=== NEW THREAD %d === (%s)\n", currentThread, dir.c_str());
}

// ─────────────────────────────────────────────
//  SETUP
// ─────────────────────────────────────────────

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println();
  Serial.println("╔═══════════════════════════════════════╗");
  Serial.println("║     PLEASE HOLD — Telephone Game      ║");
  Serial.println("║     HomeSick / Gentle Future           ║");
  Serial.println("╚═══════════════════════════════════════╝");
  Serial.println();

  Serial.println("[DEBUG] Starting I2C...");
  Wire.begin(I2C_SDA_PIN, I2C_SCL_PIN);
  Serial.println("[I2C] Bus initialized");

  Serial.println("[DEBUG] Starting buttons...");
  initButtons();

  // Check if K3 is held during boot - reset WiFi config
  bool resetWiFi = false;
  if (tca.read1(EXIO_KEY3) == LOW) {
    Serial.println("[RESET] K3 held - hold for 3 seconds to reset WiFi...");
    delay(3000);
    if (tca.read1(EXIO_KEY3) == LOW) {
      Serial.println("[RESET] WiFi reset confirmed!");
      resetWiFi = true;
    }
  }

  Serial.println("[DEBUG] Starting I2S...");
  initI2S();
  Serial.println("[DEBUG] Starting ES8311...");
  initES8311();
  Serial.println("[DEBUG] Starting ES7210...");
  initES7210();
  Serial.println("[DEBUG] Starting SD...");
  initSD();

  // Delete wifi.txt if reset requested
  if (resetWiFi && SD_MMC.exists("/wifi.txt")) {
    SD_MMC.remove("/wifi.txt");
    Serial.println("[RESET] wifi.txt deleted - will use AP mode");
  }

  Serial.println("[DEBUG] Starting WiFi...");
  initWiFi();

  Serial.println();
  Serial.println("─── Ready ───");
  Serial.printf("  Thread %d active (%d messages)\n", currentThread, currentMessage);
  Serial.println("  K1Plus  (hold)  = Record a new message");
  Serial.println("  K2Set   (press) = Play latest message");
  Serial.println("  K3Minus (press) = Start new thread");
  if (wifiConnected) {
    String ip = stationMode ? WiFi.localIP().toString() : WiFi.softAPIP().toString();
    Serial.printf("  Browser: http://%s\n", ip.c_str());
  }
  Serial.println();
}

// ─────────────────────────────────────────────
//  MAIN LOOP — STATE MACHINE
// ─────────────────────────────────────────────

uint32_t lastButtonCheck = 0;
const uint32_t DEBOUNCE_MS = 50;
bool lastKey2State = false;

void loop() {
  uint32_t now = millis();

  if (wifiConnected) {
    server.handleClient();
    // Process DNS for captive portal (AP mode only)
    if (!stationMode) {
      dnsServer.processNextRequest();
    }
  }

  switch (state) {

    case STATE_IDLE:
      if (now - lastButtonCheck >= DEBOUNCE_MS) {
        lastButtonCheck = now;

        // K1Plus held = start recording
        if (isButtonPressed(EXIO_KEY1)) {
          delay(50);
          if (isButtonPressed(EXIO_KEY1)) {
            startRecording();
          }
        }

        // K2Set pressed (rising edge) = play latest message
        bool key2Now = isButtonPressed(EXIO_KEY2);
        if (key2Now && !lastKey2State) {
          startPlayback();
        }
        lastKey2State = key2Now;

        // K3Minus pressed = new thread
        if (isButtonPressed(EXIO_KEY3)) {
          delay(50);
          if (isButtonPressed(EXIO_KEY3)) {
            startNewThread();
            while (isButtonPressed(EXIO_KEY3)) { delay(50); }
          }
        }
      }
      break;

    case STATE_RECORDING:
      recordLoop();

      if (!isButtonPressed(EXIO_KEY1)) {
        delay(50);
        if (!isButtonPressed(EXIO_KEY1)) {
          stopRecording();
        }
      }
      break;

    case STATE_PLAYING:
      playbackLoop();

      if (now - lastButtonCheck >= DEBOUNCE_MS) {
        lastButtonCheck = now;
        bool key2Now = isButtonPressed(EXIO_KEY2);
        if (key2Now && !lastKey2State) {
          stopPlayback();
        }
        lastKey2State = key2Now;
      }
      break;
  }
}
