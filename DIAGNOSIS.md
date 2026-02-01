# Diagnos: React Error #310 - Inconsistent Hook Calls

## Problembeskrivning

**Fel:** `Minified React error #310` uppstår när användaren navigerar till skyddade routes (t.ex. `/dashboard`, `/hub`) utan att vara inloggad.

**Felmeddelande:**
```
Error: Minified React error #310; visit https://reactjs.org/docs/error-decoder.html?invariant=310
```

**När det händer:**
- När användaren navigerar från landing page (`/`) till `/dashboard` eller `/hub` utan att vara inloggad
- När användaren klickar på "Starta" på landing page och ska gå in till appen
- Felet uppstår OMEDELBART när route matchas, innan redirect till login hinner ske

## Teknisk bakgrund

React Error #310 uppstår när:
- Antalet hooks varierar mellan renderingar
- Hooks körs i olika ordningar
- En komponent mountas/unmountas medan hooks fortfarande körs

## Nuvarande kodstruktur

### 1. Route-struktur (src/App.tsx)
```tsx
<Route element={<AuthGuard />}>
  <Route element={<GameLayoutWrapper />}>
    <Route path="dashboard" element={<DashboardPage />} />
    // ... andra routes
  </Route>
</Route>
```

### 2. AuthGuard (src/components/AuthGuard/AuthGuard.tsx)
- Route guard som kollar auth-status
- Redirectar till `/` om `status !== 'authed' || !user`
- Visar loader medan `status === 'loading'`
- Returnerar `<Outlet />` när autentiserad

### 3. GameLayoutWrapper (src/components/GameLayoutWrapper/GameLayoutWrapper.tsx)
- Wrapper som kollar auth INNAN `GameLayout` renderas
- Returnerar `null` om `status !== 'authed' || !user`
- Renderar `<GameLayout><Outlet /></GameLayout>` när autentiserad

### 4. GameLayout (src/layout/GameLayout.tsx)
- Huvudlayout-komponent med många hooks:
  - `useAuth()` - 3 hooks (user, logout, status)
  - `useAvatarStore()` - Zustand store
  - `useLocation()` - React Router
  - `useNavigate()` - React Router
  - `useState()` - settingsOpen
  - `useMemo()` - prefersReducedMotion
  - `useEffect()` - load avatar
- **KRITISKT:** Alla hooks körs FÖRE early return
- Early return `null` om `status !== 'authed' || !user` (EFTER alla hooks)

### 5. AuthContext (src/auth/AuthContext.tsx)
- Använder `useState` för `user` och `status`
- Status: `'loading' | 'authed' | 'guest'`
- Kallar `/api/auth/me` en gång vid mount
- Sätter `status='guest'` vid 401

## Vad som har provats (och inte fungerat)

### Försök 1: ProtectedRoute komponent
- Skapade `ProtectedRoute` som wrapper
- Problem: `GameLayout` renderades ändå under en kort stund

### Försök 2: AuthWrapper komponent
- Skapade `AuthWrapper` som kollade auth innan children
- Problem: React Router renderade ändå `GameLayout` parallellt

### Försök 3: AuthGuard som route element
- Använde `AuthGuard` som route element med `<Outlet />`
- Problem: `GameLayout` renderades ändå innan redirect hann ske

### Försök 4: GameLayoutWrapper som extra säkerhetslager
- Skapade `GameLayoutWrapper` som kollade auth INNAN `GameLayout`
- Problem: Fortfarande samma fel

### Försök 5: Early return i GameLayout (efter hooks)
- Lade till early return i `GameLayout` EFTER alla hooks
- Problem: Fortfarande samma fel

### Försök 6: Integrerad login på landing page
- Flyttade login-formulär till landing page
- Problem: Fortfarande samma fel när man navigerar till `/dashboard`

## Root cause analys

**Problemet verkar vara:**
1. React Router renderar komponenter **parallellt** när routes matchas
2. `GameLayout` renderas **innan** `AuthGuard` hinner redirecta
3. När `GameLayout` renderas, körs alla dess hooks
4. När `AuthGuard` sedan redirectar, unmountas `GameLayout` medan hooks fortfarande körs
5. Detta orsakar React error #310 (inconsistent hook calls)

**Timing-problem:**
```
1. Användare navigerar till /dashboard
2. React Router matchar route → renderar AuthGuard + GameLayoutWrapper + GameLayout PARALLELLT
3. GameLayout kör alla hooks (useAuth, useAvatarStore, useLocation, etc.)
4. AuthGuard kollar auth → status='guest' → redirectar till /
5. GameLayout unmountas medan hooks fortfarande körs → ERROR #310
```

## Nuvarande skyddslager (som inte fungerar)

1. **AuthGuard** - Route guard som redirectar om inte autentiserad
2. **GameLayoutWrapper** - Wrapper som returnerar null om inte autentiserad
3. **GameLayout** - Early return null om inte autentiserad (efter hooks)

**Alla tre skyddslager misslyckas** eftersom React Router renderar komponenter parallellt.

## Önskad lösning

En lösning som:
1. **Förhindrar** att `GameLayout` renderas alls när användaren inte är autentiserad
2. **Förhindrar** att hooks i `GameLayout` körs när användaren inte är autentiserad
3. **Fungerar** med React Router's route-matching och rendering
4. **Behåller** alla hooks i `GameLayout` i samma ordning (för att undvika error #310)

## Möjliga lösningar att testa

1. **React Router loader/action pattern** - Använda loaders för att kolla auth innan route renderas
2. **Suspense boundaries** - Använda Suspense för att förhindra rendering tills auth är klar
3. **Conditional route rendering** - Endast registrera routes när användaren är autentiserad
4. **useLayoutEffect** - Använda useLayoutEffect istället för useEffect för synkron auth-koll
5. **Route-level auth check** - Flytta auth-koll till route-definitionen istället för komponenter

## Ytterligare information

- **React Router version:** v6+ (med future flags)
- **React version:** 18+
- **TypeScript:** Ja
- **State management:** Zustand (useAvatarStore)
- **Auth:** Cookie-based (credentials: 'include')

## Testscenario

1. Starta appen
2. Gå till landing page (`/`)
3. Klicka på "Starta" eller navigera direkt till `/dashboard`
4. **FEL:** React error #310 uppstår omedelbart
5. **Förväntat:** Redirect till `/` (landing page med login) utan fel


