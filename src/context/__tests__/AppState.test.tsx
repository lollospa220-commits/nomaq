import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AppStateProvider, useAppState, TabId } from '../AppState';

const TestComponent = () => {
  const { activeTab, setActiveTab } = useAppState();
  return (
    <div>
      <span data-testid="active-tab">{activeTab}</span>
      <button data-testid="btn-soggiorna" onClick={() => setActiveTab('soggiorna')}>
        Soggiorna
      </button>
      <button data-testid="btn-drops" onClick={() => setActiveTab('drops')}>
        Drops
      </button>
    </div>
  );
};

describe('AppState Provider and Hook', () => {
  test('initial state and state updates work correctly', () => {
    render(
      <AppStateProvider>
        <TestComponent />
      </AppStateProvider>
    );

    const activeTabSpan = screen.getByTestId('active-tab');
    expect(activeTabSpan).toHaveTextContent('vola-vola');

    const btnSoggiorna = screen.getByTestId('btn-soggiorna');
    fireEvent.click(btnSoggiorna);
    expect(activeTabSpan).toHaveTextContent('soggiorna');

    const btnDrops = screen.getByTestId('btn-drops');
    fireEvent.click(btnDrops);
    expect(activeTabSpan).toHaveTextContent('drops');
  });

  test('throws error when useAppState is used outside provider', () => {
    // Suppress console.error output for the intentional throw in this test
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<TestComponent />)).toThrow(
      'useAppState must be used within an AppStateProvider'
    );

    consoleErrorSpy.mockRestore();
  });
});
