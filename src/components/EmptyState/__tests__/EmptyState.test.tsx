import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmptyState } from '../EmptyState';

/**
 * EmptyState Test
 * 
 * Tests:
 * - Renders title and description
 * - Action button calls handler when clicked
 */
describe('EmptyState', () => {
  it('renders title and description and action button calls handler', async () => {
    const user = userEvent.setup();
    const onAction = jest.fn();
    
    render(
      <EmptyState
        title="Test Title"
        description="Test description text"
        actionLabel="Click Me"
        onAction={onAction}
      />
    );

    // Verify title and description render
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test description text')).toBeInTheDocument();

    // Verify action button renders and calls handler
    const button = screen.getByRole('button', { name: 'Click Me' });
    expect(button).toBeInTheDocument();
    
    await user.click(button);
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
