# Auto-InfoScreen
FF Infoscreen mit TV-Einschalt Funktion (Node.js App).

## Was
Diese App startet einen Chrome-Browser und navigiert zu der bekannten FF InfoScreen-Seite (infoscreen.florian10.info). Danach check Sie alle __5 Sekunden__, ob ein Einsatz aktiv ist. Wird erkannt, dass ein Einsatz reingekommen ist, sendet die App ein Command zum Fernseher, sodass sich dieser einschaltet und den Screen anzeigt.

Besonders für Feuerwehrhäuser geeignet, welche nicht die ganze Zeit den Bildschirm/TV eingeschaltet haben wollen.

## Anforderungen
 - Ein Monitor mit HDMI CEC Unterstützung (haben die meisten TVs, Bildschirme eher selten)
 - RPI/PC/... mit HDMI CEC Ausgang (RPI haben alle CEC Unterstützung, Laptops selten)
 - OS mit NodeJS (Linux recommended)
 
## Bekannte Probleme/Workarounds
 - Mauszeiger im Weg
 - Chrome mit "Restore Bubble"
 
Workarounds OS-spezifisch. Für Linux siehe Install Guide weiter unten.

## Testen
Wird, während der Browser offen ist, auf __e__ gedrückt, wird ein Einsatz simuliert.

Also:
- Programm mit z.B. `node infoscreen.js` starten
- Auf Chrome warten
- TV umschalten und/oder ausschalten
- "e" auf der Tastatur drücken
- Kann bis zu 15 Sekunden dauern, dann sollte der TV an und Infoscreen drauf sein.

## Install Guide (RPI, Linux)
Install DietPi https://dietpi.com/. In den optimierten Softwarepaketen LXDE und Chromium auswählen. Bei den normalen NodeJS.
Im Terminal im geclonten Git-Verzeichnis `npm install` ausführen. Das sollte alle Requirements für die App installieren. Austesten mit `node infoscreen.js`.

Browser mit Token sollte sich öffnen. Token im Infoscreen-Admin eintragen, Node-App neu starten.
Für automatisches Starten *pm2* verwenden: `npm install -g pm2`. Danach `pm2 startup`, `pm2 start infoscreen.js` und `pm2 save` (siehe http://pm2.keymetrics.io/docs/usage/quick-start/).

### Workarounds
Im Startup-Script von LXDE folgendes angeben:

```
root@DietPi:~# cat /etc/xdg/lxsession/LXDE/autostart
@lxpanel --profile LXDE
@pcmanfm --desktop --profile LXDE
@xscreensaver -no-splash

@clean_chrome
@xdotool mousemove 9000 9000
@pm2 start /root/tmp/Auto-InfoScreen/infoscreen.js &
@pm2 start /root/tmp/NodePinger/nodepinger.js &

```

Und eine clean_chrome-Datei anlegen (in /bin) mit:  
`#!/bin/bash`  
`sed -i 's/"exited_cleanly":false/"exited_cleanly":true/' ~/.config/chromium/'Local State'`  
`sed -i 's/"exited_cleanly":false/"exited_cleanly":true/; s/"exit_type":"[^"]\+"/"exit_type":"Normal"/' ~/.config/chromium/Default/Preferences`

Screensave ausschalten mit inhalt in `~/.xsessionrc`:  
```
xset s off
xset -dpms
```
