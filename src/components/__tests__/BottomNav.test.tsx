import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import BottomNav from '../BottomNav';
import { AppStateProvider } from '@/context/AppState';

const renderWithProvider = (ui: React.ReactElement) => {
  return render(<AppStateProvider>{ui}</AppStateProvider>);
};

describe('BottomNav tab switching and active states', () => {
  test('renders all 5 tab buttons', () => {
    renderWithProvider(<BottomNav />);
    
    expect(screen.getByTestId('nav-vola-vola')).toBeInTheDocument();
    expect(screen.getByTestId('nav-soggiorna')).toBeInTheDocument();
    expect(screen.getByTestId('nav-drops')).toBeInTheDocument();
    expect(screen.getByTestId('nav-salvati')).toBeInTheDocument();
    expect(screen.getByTestId('nav-profilo')).toBeInTheDocument();
  });

  test('initial active tab is vola-vola', () => {
    renderWithProvider(<BottomNav />);
    
    const volaVolaBtn = screen.getByTestId('nav-vola-vola');
    expect(volaVolaBtn.querySelector('svg')).toHaveClass('text-electric-orange');
    expect(volaVolaBtn.querySelector('span')).toHaveClass('text-electric-orange');

    const soggiornaBtn = screen.getByTestId('nav-soggiorna');
    expect(soggiornaBtn.querySelector('svg')).toHaveClass('text-anthracite-grey/60');
    expect(soggiornaBtn.querySelector('span')).toHaveClass('text-anthracite-grey/70');
  });

  test('switches active state correctly on click', () => {
    renderWithProvider(<BottomNav />);

    const soggiornaBtn = screen.getByTestId('nav-soggiorna');
    const volaVolaBtn = screen.getByTestId('nav-vola-vola');

    fireEvent.click(soggiornaBtn);

    expect(soggiornaBtn.querySelector('svg')).toHaveClass('text-electric-orange');
    expect(soggiornaBtn.querySelector('span')).toHaveClass('text-electric-orange');

    expect(volaVolaBtn.querySelector('svg')).toHaveClass('text-anthracite-grey/60');
    expect(volaVolaBtn.querySelector('span')).toHaveClass('text-anthracite-grey/70');
  });
});
