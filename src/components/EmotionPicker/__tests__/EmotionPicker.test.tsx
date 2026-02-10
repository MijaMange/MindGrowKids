import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmotionPicker } from '../EmotionPicker';

/**
 * EmotionPicker Test
 * 
 * Tests:
 * - Selecting an emotion toggles aria-pressed correctly and triggers callback/state
 */
describe('EmotionPicker', () => {
  it('toggles aria-pressed correctly when selecting an emotion and triggers callback', async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();
    const { rerender } = render(<EmotionPicker value="happy" onSelect={onSelect} />);

    // Initially, "happy" should be pressed (Glad is first)
    const happyButton = screen.getByRole('button', { name: /glad/i });
    expect(happyButton).toHaveAttribute('aria-pressed', 'true');

    // Click "Ledsen" - should trigger callback
    const sadButton = screen.getByRole('button', { name: /ledsen/i });
    await user.click(sadButton);

    // Verify callback was called with correct emotion
    expect(onSelect).toHaveBeenCalledWith('sad');
    expect(onSelect).toHaveBeenCalledTimes(1);

    // Re-render with new value to simulate state update
    rerender(<EmotionPicker value="sad" onSelect={onSelect} />);

    // Verify aria-pressed toggles correctly
    expect(sadButton).toHaveAttribute('aria-pressed', 'true');
    expect(happyButton).toHaveAttribute('aria-pressed', 'false');
  });
});
