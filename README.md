# Starship Landing Lab

En liten fungerande Three.js-prototyp av en autopilot som landar ett rymdskepp.

Idé: [Starship Landing Lab på GameHavn](https://gamehavn.com/ideas/starship-landing-lab), av Jochen.
Idé-ID / wishId: `5106bea1-6603-4ead-93b8-06f4fae4c19b`.

## Kör lokalt

Kräver Node.js 20.19+ eller 22.12+ och npm.

```sh
npm ci
npm run dev
```

Öppna adressen som Vite skriver ut. Webbläsaren behöver WebGL.

```sh
npm test
npm run build
npm run preview
```

GitHub-repot innehåller källkod. Det är inte en publicerad spelbar webbversion.

## Spela

- Justera **Bromsrespons**, **Lutningskontroll** och **Driftkorrigering** (0–2).
- Välj lugnt väder eller konstant sidvind och starta flygtestet.
- Pausa, fortsätt, växla kamera eller kör med 4× hastighet.
- Läs flygdata, landningsresultat och tips, ändra inställningarna och flyg igen.
- **Balanserad** återställer fungerande inställningar. **För lite broms** visar en hård landning.
- **↺** återställer flygningen men behåller dina inställningar. De tre senaste försöken visas under flygdata tills sidan laddas om.
- **Exportera CSV** sparar aktuell flygnings höjd, fallhastighet, sidoavstånd och lutning.

Mjuk landning kräver högst 3 m/s vertikal fart, 2 m/s sidofart, 8° lutning och högst 6 m från plattans mitt. Samma start används varje gång: 120 m höjd, 35 m sidoavstånd, −12 m/s fallhastighet och −2 m/s sidofart.

## Omfattning och begränsningar

3D-rendering med Three.js och en förenklad deterministisk 2D-rigid-body-modell. Fysiken går i fasta steg på 1/120 sekund. Autopiloten beräknar vertikalt motorpådrag samt önskad lutning från positions- och hastighetsfel. Reglagen kan ändras under flygning.

Detta är ett experiment, ingen verklig flygmodell: konstant gravitation och massa, förenklat bränsle, ingen aerodynamik, gimbalmodell, fullständig 3D-dynamik, terrängkollision eller kontaktfysik för landningsben. Markkontakt bedöms vid skeppets nominella fotpunkt. Ingen server, inloggning, betalning eller lagring av användardata. Tester avbryts efter 100 simulerade sekunder eller om skeppet lämnar testområdet.

## Verifiering

`npm test` testar mjuk landning, för lite broms, utebliven driftkorrigering, determinism/återställning, stopp efter avslut samt ändliga värden vid extrema inställningar. Produktionsbygget har verifierats med `npm run build`. Webbläsartest omfattar faktisk 3D-rendering, lyckad och misslyckad landning, flygdata, pausa/fortsätt, återställning, kameraväxling och CSV-export.

## Resurser och krediter

Alla skepps-, terräng- och plattmodeller skapas direkt i koden; inga externa bilder, modeller eller ljud används. Three.js (MIT) och Vite (MIT) installeras via npm; se respektive pakets licens. Typografin DM Sans och Space Grotesk laddas från Google Fonts (SIL Open Font License); systemtypsnitt används om fonttjänsten inte kan nås. Ursprunglig spelidé: Jochen via GameHavn. Denna implementation är en separat PoC.
