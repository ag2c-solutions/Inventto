import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { OrgAvatar } from '.';

describe('OrgAvatar', () => {
  it('exibe a inicial do nome em maiúscula', () => {
    render(<OrgAvatar name="ateliê joana" />);

    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('aplica a className recebida', () => {
    const { container } = render(
      <OrgAvatar name="Loja" className="custom-class" />
    );

    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });
});
