# Auto-InfoScreen
Node.js App für den FF Infoscreen mit TV-Einschalt Funktion.

## Was
Diese App startet einen Chrome-Browser und navigiert zu der bekannten FF InfoScreen-Seite (infoscreen.florian10.info). Danach check Sie alle __5 Sekunden__, ob ein Einsatz aktiv ist. Wird erkannt, dass ein Einsatz reingekommen ist, sendet die App ein Command zum Fernseher dass sich dieser einschaltet und den Screen anzeigt.

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
Im Script gibt es den Parameter __DEBUG_STDIN__. Wenn auf _true_ kann man in der Konsole (stdin) mit dem Key "K" einen Einsatz simulieren. Also:
- Programm mit `node infoscreen.js` starten
- Auf Chrome warten
- Konsole in front bringen
- TV umschalten und/oder ausschalten
- "K" auf der Tastatur drücken
- Kann bis zu 15 Sekunden dauern, dann sollte der TV an und Infoscreen drauf sein.

Achtung: Mit eingeschaltenen Parameter kann pm2 o.ä. nicht arbeiten.

## Install Guide (RPI, Linux)
Install DietPi https://dietpi.com/. In den optimierten Softwarepaketen LXDE und Chromium auswählen. Bei den normalen NodeJS.
Im Terminal im geclonten Git-Verzeichnis `npm install` ausführen. Das sollte alle Requirements für die App installieren. Austesten mit `node infoscreen.js`.

Browser mit Token sollte sich öffnen. Token im Infoscreen-Admin eintragen, Node-App neu starten.
Für automatisches Starten *pm2* verwenden: `npm install -g pm2`. Danach `pm2 startup`, `pm2 start infoscreen.js` und `pm2 save` (siehe http://pm2.keymetrics.io/docs/usage/quick-start/).

### Workarounds
Im Startup-Script von LXDE (~/.config/lxsession/LXDE/autostart) folgendes angeben:


``@xdotool mousemove 9000 9000``

``@sed -i 's/"exited_cleanly":false/"exited_cleanly":true/' ~/.config/chromium/'Local State'``

``@sed -i 's/"exited_cleanly":false/"exited_cleanly":true/; s/"exit_type":"[^"]\+"/"exit_type":"Normal"/' ~/.config/chromium/Default/Preferences``

__ACHTUNG__: Dann gibts kein Panel und keinen Desktop mehr, die Befehle dafür würden in `/etc/xdg/lxsession/<profile>/autostart` stehen, werden aber durch die lokale autostart nicht mehr ausgeführt.


