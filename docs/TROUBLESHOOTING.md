# Felsökning - Inloggningsproblem i produktion

## Problem: "Ogiltigt svar från servern" vid inloggning

### Steg 1: Kontrollera att backend körs

1. Öppna: `https://mindgrowkids.online/api/health`
2. Förväntat svar: `{"ok":true,"env":"production",...}`
3. Om det inte fungerar: Backend körs inte eller är inte tillgänglig

### Steg 2: Kontrollera CORS

1. Öppna Developer Tools (F12) → Network
2. Försök logga in
3. Kolla request till `/api/auth/child-login`:
   - **Status**: Vad är statuskoden?
   - **Response**: Vad står det i response body?
   - **CORS headers**: Finns det `Access-Control-Allow-Origin` header?

**Om CORS-fel:**
- Kontrollera att `ALLOWED_ORIGINS` i backend `.env` innehåller `https://mindgrowkids.online`
- Se backend logs för CORS-meddelanden

### Steg 3: Kontrollera API URL

1. Öppna `/diag` i produktionen
2. Kolla vad `API_BASE` visar
3. Om det är fel:
   - Sätt `VITE_API_URL` i `.env` (i projektroten)
   - Bygg om: `npm run build`
   - Deploya igen

### Steg 4: Testa direkt API-anrop

1. Öppna `/diag` i produktionen
2. Klicka på "Testa Child Login"
3. Kolla resultatet:
   - **Status code**: Vad är det?
   - **Response**: Vad står det?
   - **Error**: Om det finns, vad säger den?

### Steg 5: Kontrollera backend logs

På servern, kolla backend-konsolen för:
- `[CORS]` meddelanden - visar vilka origins som tillåts/blockeras
- `[AUTH]` meddelanden - visar login-försök
- `[POST /auth/child-login]` - visar om request når backend

### Vanliga problem och lösningar

#### Problem: CORS-fel
**Symptom**: Network-fliken visar CORS-fel
**Lösning**: 
```bash
# I backend .env
ALLOWED_ORIGINS=https://mindgrowkids.online,https://www.mindgrowkids.online
```

#### Problem: 404 Not Found
**Symptom**: Status 404 på `/api/auth/child-login`
**Lösning**: 
- Backend körs inte
- Backend körs på fel port
- Routes är inte registrerade korrekt

#### Problem: 500 Internal Server Error
**Symptom**: Status 500 på `/api/auth/child-login`
**Lösning**:
- Kolla backend logs för felmeddelande
- Kontrollera att `JWT_SECRET` är satt
- Kontrollera att MongoDB är tillgänglig (eller fil-DB fungerar)

#### Problem: Tom response eller "Ogiltigt svar från servern"
**Symptom**: Response body är tom eller inte JSON
**Lösning**:
- Backend kraschar innan den hinner svara
- Kolla backend logs för stack trace
- Kontrollera att alla dependencies är installerade

### Debug-kommandon

#### Testa API direkt (från terminal):
```bash
# Testa health endpoint
curl https://mindgrowkids.online/api/health

# Testa child-login
curl -X POST https://mindgrowkids.online/api/auth/child-login \
  -H "Content-Type: application/json" \
  -H "Origin: https://mindgrowkids.online" \
  -d '{"name":"Test","classCode":"1234"}' \
  -v
```

#### Kolla backend logs:
```bash
# Om backend körs via PM2
pm2 logs

# Om backend körs direkt
# Kolla terminalen där backend körs
```

### Checklista

- [ ] Backend körs och svarar på `/api/health`
- [ ] `ALLOWED_ORIGINS` innehåller frontend-domänen
- [ ] `JWT_SECRET` är satt i backend `.env`
- [ ] MongoDB är tillgänglig (eller fil-DB fungerar)
- [ ] Frontend är byggd med korrekt `VITE_API_URL` (eller använder `window.location.origin`)
- [ ] HTTPS används (för cookies i produktion)
- [ ] Backend logs visar att request når backend
- [ ] CORS-headers finns i response




