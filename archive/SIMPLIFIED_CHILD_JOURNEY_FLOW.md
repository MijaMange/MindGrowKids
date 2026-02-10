# Simplified Child Emotion Journey Flow

**Date:** 2025-01-27  
**Goal:** Create a simpler, safer, purpose-driven emotional check-in ritual for children (5–12)  
**Changes:** Reduced from 3 steps → 2 steps, removed evaluation language

---

## Flow Overview

### Before (3 Steps):
1. **Emotion Selection** → "Vilken känsla bor i dig just nu?"
2. **Confirmation** → "Är det rätt känsla?" (redundant, evaluative)
3. **Optional Expression** → "Vill du berätta mer?" (felt like a test)

### After (2 Steps):
1. **Single Mandatory Check-in** → "Hur känns det idag?"
2. **Optional Expression** → "Vill du visa något?" (three equal choices)

---

## Step-by-Step Flow

### Step 1: Single Mandatory Check-in

**Title:** "Hur känns det idag?"

**Purpose:**
- Simple, direct question (not abstract)
- Creates a daily emotional check-in ritual
- No evaluation or correctness implied

**User Experience:**
- Child sees 6 colorful emotion cards
- Selects one emotion
- Immediate neutral reassurance: "Okej 💚" (appears below selection)
- "Fortsätt" button enables when emotion is selected

**Copy Changes:**
- **Before:** "Vilken känsla bor i dig just nu?" (abstract, poetic)
- **After:** "Hur känns det idag?" (simple, direct, daily ritual)

**Helper Text:**
- **Before:** "Det finns inga rätt eller fel svar. Välj den känsla som känns mest rätt just nu." (defensive, evaluative)
- **After:** "Välj den känsla som känns rätt just nu." (simple, direct)

**Reassurance:**
- **Before:** "Okej 💚 Det är okej att känna så." (longer, implies need for reassurance)
- **After:** "Okej 💚" (short, neutral, immediate)

**Why This Works:**
- ✅ **Clear purpose:** Daily emotional check-in
- ✅ **No evaluation:** Just selection, no "right" or "wrong"
- ✅ **Immediate feedback:** Reassurance appears instantly
- ✅ **Simple language:** Age-appropriate (5–12)

---

### Step 2: Optional Expression

**Title:** "Vill du visa något?"

**Purpose:**
- Optional creative expression
- Three equal choices (no hierarchy)
- "Done" is a valid choice, not a skip

**User Experience:**
- Child sees InputArea (drawing canvas + text area)
- Three equal buttons:
  - **"Tillbaka"** (back to step 1)
  - **"Klart"** (submit without drawing/writing - valid choice)
  - **"Skicka"** (submit with drawing/writing - only enabled if child has drawn/written)

**Copy Changes:**
- **Before:** "Vill du berätta mer? (Det är okej att hoppa över)" (implies skipping is bad)
- **After:** "Vill du visa något?" (neutral, open)

**Helper Text:**
- **Before:** "Det är helt okej att hoppa över detta steg om du inte vill skriva eller rita något." (defensive, implies skipping)
- **After:** "Du kan rita, skriva, eller bara vara klar." (three equal options, no hierarchy)

**Button Changes:**
- **Before:** "Hoppa över" (implies skipping something important)
- **After:** "Klart" (valid choice, equal to other options)

**Why This Works:**
- ✅ **Three equal choices:** Draw, Write, or Done (no hierarchy)
- ✅ **"Done" is valid:** Not a skip, just a choice
- ✅ **No pressure:** Child doesn't feel like they're "skipping" something
- ✅ **Clear options:** Visual + text makes choices obvious

---

### Final State: Thank You Message

**Title:** "Tack! 💚"

**Purpose:**
- Short, consistent thank-you
- No interpretation unless child wrote/drew something

**User Experience:**
- If child only selected emotion (no drawing/writing):
  - Message: "Tack för att du delade med dig! 💚"
  - No AI interpretation
- If child wrote or drew something:
  - Message: AI-generated reply (from `/api/listen`)
  - Personalized response based on emotion + text/drawing

**Copy Changes:**
- **Before:** "Tack för att du delade med dig! 🌱" (longer, plant emoji)
- **After:** "Tack! 💚" (short, heart emoji)

**Why This Works:**
- ✅ **Respects child's choice:** If they chose "Klart" without drawing/writing, no interpretation
- ✅ **Only interprets when invited:** AI reply only if child wrote/drew something
- ✅ **Short and clear:** Simple thank-you, not overwhelming

---

## Technical Changes

### Step Type
```typescript
// Before
type Step = 1 | 2 | 3;

// After
type Step = 1 | 2;
```

### Progress Indicator
```typescript
// Before
{[1, 2, 3].map((n) => ...)}

// After
{[1, 2].map((n) => ...)}
```

### Submit Logic
```typescript
// Only get AI reply if child wrote or drew something
let text = 'Tack för att du delade med dig! 💚';
if (note || drawingUrl) {
  // Call /api/listen for AI interpretation
  const resp = await fetch('/api/listen', ...);
  text = data?.reply || text;
}
```

### Mode Handling
```typescript
// Before
const mode = drawingUrl ? 'draw' : 'text';

// After
const mode = drawingUrl ? 'draw' : (note ? 'text' : 'none');
```

---

## Design Principles

### 1. Purpose-Driven
- **Step 1:** Daily emotional check-in (mandatory)
- **Step 2:** Optional creative expression (optional)

### 2. No Evaluation
- Removed all language about "right" or "wrong"
- Removed confirmation step (felt like a test)
- Removed "skip" language (implies skipping is bad)

### 3. Equal Choices
- Three equal options in Step 2: Draw / Write / Done
- "Done" is not a skip - it's a valid choice
- No hierarchy or pressure

### 4. Respectful
- Only interpret if child invites it (by writing/drawing)
- Short, consistent thank-you
- No pressure to express more

---

## Why Each Step Exists

### Step 1: "Hur känns det idag?"
**Purpose:** Daily emotional check-in ritual

**Why it's mandatory:**
- Creates a consistent daily practice
- Helps children develop emotional awareness
- Provides data for tracking over time

**Why it works:**
- Simple, direct question
- No evaluation or correctness
- Immediate neutral reassurance
- Clear visual feedback

### Step 2: "Vill du visa något?"
**Purpose:** Optional creative expression

**Why it's optional:**
- Not all children want to express more
- "Done" is a valid choice
- Reduces cognitive load

**Why it works:**
- Three equal choices (no hierarchy)
- No pressure to "skip"
- Clear visual options
- Respects child's choice

---

## Copy Comparison

### Header Guide Text

| Step | Before | After |
|------|--------|-------|
| 1 | "Vilken känsla bor i dig just nu?" | "Hur känns det idag?" |
| 2 | "Är det rätt känsla?" | "Vill du visa något?" |
| 3 | "Vill du rita eller skriva något? (Det är okej att hoppa över)" | (removed) |

### Step Titles

| Step | Before | After |
|------|--------|-------|
| 1 | "Vilken känsla bor i dig just nu?" | "Hur känns det idag?" |
| 2 | "Är det rätt känsla?" | "Vill du visa något?" |
| 3 | "Vill du berätta mer?" | (removed) |

### Helper Text

| Step | Before | After |
|------|--------|-------|
| 1 | "Det finns inga rätt eller fel svar. Välj den känsla som känns mest rätt just nu." | "Välj den känsla som känns rätt just nu." |
| 2 | "Du har valt [emotion]. Är det rätt, eller vill du välja en annan?" | (removed) |
| 3 | "Det är helt okej att hoppa över detta steg om du inte vill skriva eller rita något." | "Du kan rita, skriva, eller bara vara klar." |

### Buttons

| Context | Before | After |
|---------|--------|-------|
| Step 1 → 2 | "Fortsätt" | "Fortsätt" (unchanged) |
| Step 2 → 3 | "Fortsätt" | (removed) |
| Step 3 skip | "Hoppa över" | "Klart" (in Step 2) |
| Step 3 submit | "Klart" | "Skicka" (in Step 2) |
| Final | "Klart! ✨" | "Klart" |

### Reassurance

| Context | Before | After |
|---------|--------|-------|
| Emotion selected | "Okej 💚 Det är okej att känna så." | "Okej 💚" |

### Thank You

| Context | Before | After |
|---------|--------|-------|
| Final message | "Tack för att du delade med dig! 🌱" | "Tack! 💚" |
| Error fallback | "Tack för att du berättade." | "Tack för att du delade med dig! 💚" |

---

## Accessibility

✅ **All accessibility features maintained:**
- `aria-pressed` on emotion buttons
- `aria-current="step"` on progress dots
- Keyboard navigation
- Focus styles
- Reduced motion support

---

## Testing Checklist

- [ ] Step 1: Emotion selection works
- [ ] Step 1: "Okej 💚" appears immediately when emotion selected
- [ ] Step 1: "Fortsätt" button enables when emotion selected
- [ ] Step 2: InputArea shows drawing + text options
- [ ] Step 2: Three buttons: "Tillbaka", "Klart", "Skicka"
- [ ] Step 2: "Klart" button submits without drawing/writing
- [ ] Step 2: "Skicka" button only enabled if child has drawn/written
- [ ] Final: Thank-you message appears
- [ ] Final: AI reply only if child wrote/drew something
- [ ] Final: Simple "Tack! 💚" if child only selected emotion
- [ ] Progress indicator shows 2 steps (not 3)
- [ ] All copy removed evaluation language
- [ ] All copy is simple and child-friendly

---

## Summary

The new flow is **simpler, safer, and purpose-driven**:

1. **Reduced steps:** 3 → 2 (removed redundant confirmation)
2. **Clear purpose:** Daily check-in (Step 1) + optional expression (Step 2)
3. **No evaluation:** Removed all "right/wrong" language
4. **Equal choices:** Draw / Write / Done (no hierarchy)
5. **Respectful:** Only interprets if child invites it (by writing/drawing)
6. **Simple language:** Age-appropriate, direct, not abstract

The flow now feels like a **gentle daily ritual** rather than a test or evaluation.
