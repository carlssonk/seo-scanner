# audit

### Sidskanner/audit verktyg för Ngine och kunder. 
#### Skannar framförallt HTML taggar och Sidoförfrågningar.

Verktyg byggt med React/TypeScript & NodeJS/TypeScript. Servern är deployad som en AWS Lambda funktion (koden till Lambdafunktionen ligger i en S3 Bucket). Klienten är hostad som ett CDN i en AWS S3 Bucket.

## Bygg Servern för produktion
1. Öppna terminalen i server mappen, skriv ```npm run build``
2. Gå in i dist mappen och gör en zip av alla filer som finns med. OBS: säg till att inte själva dist mappen kommer med i den zippade versionen.
3. Logga in i din AWS S3 Bucket och ersätt "scanner.server" med den nya zip filen

## Bygg Klienten för produktion
1. Öppna terminalen i client mappen, skriv ```npm run build``
2. ...
