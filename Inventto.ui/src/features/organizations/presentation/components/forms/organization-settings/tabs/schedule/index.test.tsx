import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { describe, expect, it } from 'vitest';

import { Form } from '@/shared/components/ui/form';

import type { OrganizationSettingsFormData } from '../../schema';
import { organizationSettingsFormDataFactory } from '../../schema/organization-settings-form-data.factory';

import { ScheduleTabContent } from '.';

function Wrapper({
  defaultValues
}: {
  defaultValues: OrganizationSettingsFormData;
}) {
  const form = useForm<OrganizationSettingsFormData>({ defaultValues });
  return (
    <Form {...form}>
      <ScheduleTabContent form={form} />
    </Form>
  );
}

describe('ScheduleTabContent', () => {
  const user = userEvent.setup();

  it('exibe os horários de abertura/fechamento para dias abertos', () => {
    const defaultValues = organizationSettingsFormDataFactory.build({
      schedule: {
        mon: { isOpen: true, open: '09:00', close: '18:00' },
        tue: { isOpen: true, open: '09:00', close: '18:00' },
        wed: { isOpen: true, open: '09:00', close: '18:00' },
        thu: { isOpen: true, open: '09:00', close: '18:00' },
        fri: { isOpen: true, open: '09:00', close: '18:00' },
        sat: { isOpen: false, open: '', close: '' },
        sun: { isOpen: false, open: '', close: '' }
      }
    });

    render(<Wrapper defaultValues={defaultValues} />);

    expect(screen.getByText('Segunda')).toBeInTheDocument();
    expect(screen.getAllByDisplayValue('09:00').length).toBeGreaterThan(0);
  });

  it('exibe "Fechado" para dias sem horário e oculta os inputs de horário', () => {
    const defaultValues = organizationSettingsFormDataFactory.build({
      schedule: {
        mon: { isOpen: true, open: '09:00', close: '18:00' },
        tue: { isOpen: true, open: '09:00', close: '18:00' },
        wed: { isOpen: true, open: '09:00', close: '18:00' },
        thu: { isOpen: true, open: '09:00', close: '18:00' },
        fri: { isOpen: true, open: '09:00', close: '18:00' },
        sat: { isOpen: false, open: '', close: '' },
        sun: { isOpen: false, open: '', close: '' }
      }
    });

    render(<Wrapper defaultValues={defaultValues} />);

    expect(screen.getAllByText('Fechado')).toHaveLength(2);
  });

  it('ativar o switch de um dia revela os campos de horário (ação do usuário)', async () => {
    const defaultValues = organizationSettingsFormDataFactory.build({
      schedule: {
        mon: { isOpen: true, open: '09:00', close: '18:00' },
        tue: { isOpen: true, open: '09:00', close: '18:00' },
        wed: { isOpen: true, open: '09:00', close: '18:00' },
        thu: { isOpen: true, open: '09:00', close: '18:00' },
        fri: { isOpen: true, open: '09:00', close: '18:00' },
        sat: { isOpen: false, open: '', close: '' },
        sun: { isOpen: false, open: '', close: '' }
      }
    });

    render(<Wrapper defaultValues={defaultValues} />);

    // Domingo é o último dia em WEEK_DAYS — seu switch é o último da lista.
    const switches = screen.getAllByRole('switch');
    const timeInputsBefore =
      document.querySelectorAll('input[type="time"]').length;

    await user.click(switches[switches.length - 1]);

    const timeInputsAfter =
      document.querySelectorAll('input[type="time"]').length;
    expect(timeInputsAfter).toBe(timeInputsBefore + 2);
    expect(screen.queryAllByText('Fechado')).toHaveLength(1);
  });
});
