# Erfragte Berechtigungen

Für eine allgemeine Erklärung von Add-on-Berechtigungen siehe [diesen Support-Artikel]https://support.mozilla.org/de/kb/berechtigungsdialoge-der-firefox-erweiterungen).

## Berechtigungen bei Installation

| Interne ID                  | Berechtigung                               | Erklärung                                                                                                                                                                                                                                                                                                                                                                                       |
|:----------------------------|:-------------------------------------------|:------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `http://*/*`, `https://*/*` | Auf Ihre Daten für alle Websites zugreifen | Benötigt um Zugriff auf jede Webseite eines Servers zu bekommen, die eine Mastodon-Instanz ist. Da jeder Server eine Mastodon-Instanz sein kann, benötigt dies Zugriff auf jede [HTTP](https://de.wikipedia.org/wiki/Hypertext_Transfer_Protocol)- und [HTTPS](https://de.wikipedia.org/wiki/Hypertext_Transfer_Protocol_Secure)-[URL](https://de.wikipedia.org/wiki/Uniform_Resource_Locator). |

## Versteckte Berechtigungen

Zusätzlich verlangt dieses Add-on folgende Berechtigungen, welche in Firefox aber nicht abgefragt werden, da sie keine tiefgreifenden Berechtigungen sind.

| Interne ID   | Berechtigung                 | Erklärung                                                                                                                                                   |
|:-------------|:-----------------------------|:------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `webRequest` | Zugriff auf Webanfragen      | Benötigt um [URLs](https://de.wikipedia.org/wiki/Uniform_Resource_Locator) auf den Server, bei dem du deinen Mastodon-Account gespeichert hast, umzuleiten. |
| `storage`    | Zugriff auf lokalen Speicher | Benötigt um Einstellungen abzuspeichern                                                                                                                     |
