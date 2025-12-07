# aw-backend – Attention Wallet Demo Backend

Dieses Repository stellt das einfache Demo-Backend für die Attention-Wallet-Scooby-Missionen bereit.

## Endpunkte

- `POST /api/v1/sessions/init`  
  Erstellt eine neue Session und liefert `{ sessionId }` zurück.

- `POST /api/v1/sessions/event`  
  Erwartet `{ sessionId, eventName, payload }` und hängt das Event an die Session an.

- `POST /api/v1/sessions/complete`  
  Erwartet `{ sessionId }`, berechnet einen einfachen Attention-Score und liefert z.B.
  ```json
  {
    "sessionId": "...",
    "attentionScore": 82,
    "attentionLabel": "HIGH",
    "country": "UNKNOWN"
  }
  ```

## Railway Deploy

1. Neues GitHub-Repository **aw-backend** anlegen und diese Dateien pushen.
2. In Railway einen neuen Service erstellen: "Deploy from GitHub" → Repo `aw-backend` wählen.
3. Unter **Settings → Deploy → Start Command** sicherstellen:
   ```bash
   node server.js
   ```
4. Nach erfolgreichem Deploy ist das Backend unter der Railway-URL erreichbar, z.B.
   `https://aw-backend-production.up.railway.app`.

5. Im Frontend muss `API_BASE` genau auf diese URL zeigen.
