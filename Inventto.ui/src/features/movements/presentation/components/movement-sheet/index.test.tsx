import { act } from '@testing-library/react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useMovementSheetStore } from '../../stores/movement-sheet-store';

import { MovementSheet } from '.';

vi.mock('../movement-form', () => ({
  MovementForm: ({ preselectProductId }: { preselectProductId?: string }) => (
    <div data-testid="mock-movement-form">{preselectProductId}</div>
  )
}));

describe('MovementSheet', () => {
  beforeEach(() => {
    act(() => {
      useMovementSheetStore.getState().close();
    });
  });

  it('should not render the form when the sheet is closed', () => {
    render(<MovementSheet />);

    expect(screen.queryByTestId('mock-movement-form')).not.toBeInTheDocument();
  });

  it('should render the form with the preselected product when open', () => {
    act(() => {
      useMovementSheetStore.getState().open('prod-1');
    });

    render(<MovementSheet />);

    expect(screen.getByTestId('mock-movement-form')).toHaveTextContent(
      'prod-1'
    );
  });

  it('should close the sheet when the dialog requests it to close', () => {
    act(() => {
      useMovementSheetStore.getState().open('prod-1');
    });

    render(<MovementSheet />);

    act(() => {
      useMovementSheetStore.getState().close();
    });

    expect(screen.queryByTestId('mock-movement-form')).not.toBeInTheDocument();
  });
});
