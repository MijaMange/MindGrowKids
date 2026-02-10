# Rive Guide Setup Instructions

## Installation

```bash
npm install @rive-app/react-canvas
```

## File Placement

1. The directory should already exist:
   ```
   public/rive/
   ```

2. Place your Rive file here:
   ```
   public/rive/jungle-guide.riv
   ```

   The file will be served at `/rive/jungle-guide.riv` at runtime.

## Creating the Rive Animation

### Design Guidelines

- **Size**: Keep the artboard small (160-240px recommended)
- **Style**: Calm, friendly, jungle-themed (e.g., a small plant buddy, leaf spirit, or gentle forest creature)
- **Motion**: Subtle, slow movements - no loud or distracting animations
- **Ethical**: No scoring, no pressure, no excitement triggers

### Recommended Animation States

1. **Idle**: Gentle breathing or subtle swaying
2. **Hover**: Friendly reaction (smile, wave, gentle growth)
3. **Confirm**: Short celebration (sparkle, leaf sway, gentle bounce) - should be ~300-500ms

### Setting Up State Machine (Recommended)

1. Open your `.riv` file in Rive Editor
2. Create a **State Machine** (name it anything, e.g., "State Machine 1")
3. Add an **Input** to the state machine:
   - **Type**: Boolean or Number
   - **Name**: `reactSignal` (must match `INPUT_NAME` in `RiveGuide.tsx`)
4. Create states:
   - **Idle**: Default state (looping)
   - **Hover**: Triggered when input is `true`
   - **Confirm**: Short animation that returns to idle

### Alternative: Named Animations

If you prefer not to use a state machine, you can use named animations:

1. Create animations with these exact names:
   - `idle` (looping)
   - `hover` (one-shot or looping)
   - `confirm` (one-shot)

2. Update `RiveGuide.tsx`:
   - Set `STATE_MACHINE_NAME` to empty string or null
   - The component will automatically fall back to named animations

## Finding State Machine and Input Names

If you're unsure of the names:

1. Open your `.riv` file in Rive Editor
2. Look at the **State Machines** panel (left sidebar)
3. The state machine name is shown there
4. Click on the state machine to see its inputs
5. The input name is shown in the inputs list

## Updating Component Configuration

After exporting your `.riv` file, update `src/components/RiveGuide/RiveGuide.tsx`:

```typescript
const STATE_MACHINE_NAME = 'State Machine 1'; // Your state machine name
const INPUT_NAME = 'reactSignal'; // Your input name
```

## Testing

1. Start the dev server: `npm run dev`
2. Navigate to the landing page (`/`)
3. Hover over the "Start" button - the Rive guide should react
4. Click "Start" - the guide should show a confirmation animation
5. Check the browser console for any warnings about missing state machines/animations

## Troubleshooting

### Rive file not loading
- Check that the file path is correct: `src/assets/rive/jungle-guide.riv`
- Ensure the file is included in your build (Vite should handle this automatically)
- Check browser console for 404 errors

### State machine not found
- Verify the state machine name matches `STATE_MACHINE_NAME`
- Check that the state machine has an input named `reactSignal`
- The component will fall back to named animations if available

### No animations playing
- Ensure `prefers-reduced-motion` is not enabled
- Check that animations are set to autoplay or are triggered correctly
- Verify the Rive file exported correctly from Rive Editor

### Performance issues
- Keep the artboard size small (≤240px)
- Limit the number of animated layers
- Use simple shapes and paths rather than complex graphics

