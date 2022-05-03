# audit

### Sidskanner/audit verktyg för Ngine och kunder. 
#### Skannar framförallt HTML taggar och Sidoförfrågningar.

Verktyg byggt med React/TypeScript & NodeJS/TypeScript. Servern är deployad som en AWS Lambda funktion (koden till Lambdafunktionen ligger i en S3 Bucket). Klienten är hostad som ett CDN i en AWS S3 Bucket.

## Bygg Servern för produktion
1. Öppna terminalen i server mappen, skriv ```npm run build``
2. Klar!

## Bygg Frontend för produktion
1. Öppna terminalen i client mappen, skriv ```npm run build``
2. Logga in på AWS Growth-kontot och navigera till S3 Buckets -> scanner.web
3. Välj dist/ och tryck på Actions -> Make public using ACL -> Make public
4. Klar!
