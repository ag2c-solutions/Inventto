import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useOtpStep } from './use-otp-step';

describe('useOtpStep', () => {
  const onSubmit = vi.fn();
  const onResend = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const renderUseOtpStep = () =>
    renderHook(() => useOtpStep({ onSubmit, onResend }));

  // ─── Estado inicial ──────────────────────────────────────────────────────────

  it('deve iniciar com code vazio e cooldown zero', () => {
    const { result } = renderUseOtpStep();

    expect(result.current.code).toBe('');
    expect(result.current.cooldown).toBe(0);
  });

  // ─── handleCodeChange ────────────────────────────────────────────────────────

  it('deve atualizar o code ao chamar handleCodeChange', () => {
    const { result } = renderUseOtpStep();

    act(() => {
      result.current.handleCodeChange('123456');
    });

    expect(result.current.code).toBe('123456');
  });

  // ─── handleSubmit ────────────────────────────────────────────────────────────

  it('deve chamar onSubmit com o code quando ele tem 6 dígitos', () => {
    const { result } = renderUseOtpStep();

    act(() => {
      result.current.handleCodeChange('654321');
    });

    act(() => {
      result.current.handleSubmit();
    });

    expect(onSubmit).toHaveBeenCalledWith('654321');
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('não deve chamar onSubmit quando o code tem menos de 6 dígitos', () => {
    const { result } = renderUseOtpStep();

    act(() => {
      result.current.handleCodeChange('123');
    });

    act(() => {
      result.current.handleSubmit();
    });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('não deve chamar onSubmit quando o code está vazio', () => {
    const { result } = renderUseOtpStep();

    act(() => {
      result.current.handleSubmit();
    });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  // ─── handleResend + cooldown ─────────────────────────────────────────────────

  it('deve chamar onResend e iniciar cooldown de 45s ao chamar handleResend', () => {
    const { result } = renderUseOtpStep();

    act(() => {
      result.current.handleResend();
    });

    expect(onResend).toHaveBeenCalledTimes(1);
    expect(result.current.cooldown).toBe(45);
  });

  it('deve decrementar o cooldown a cada segundo', () => {
    const { result } = renderUseOtpStep();

    act(() => {
      result.current.handleResend();
    });

    // Avança 3 ticks do intervalo (3s)
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.cooldown).toBe(42);
  });

  it('deve zerar o cooldown após 45 segundos', () => {
    const { result } = renderUseOtpStep();

    act(() => {
      result.current.handleResend();
    });

    act(() => {
      vi.advanceTimersByTime(45000);
    });

    expect(result.current.cooldown).toBe(0);
  });

  it('deve reiniciar o cooldown se handleResend for chamado novamente antes do fim', () => {
    const { result } = renderUseOtpStep();

    act(() => {
      result.current.handleResend();
    });

    // Avança 20 segundos (cooldown = 25)
    act(() => {
      vi.advanceTimersByTime(20000);
    });

    expect(result.current.cooldown).toBe(25);

    // Chama reenvio novamente — deve resetar para 45
    act(() => {
      result.current.handleResend();
    });

    expect(result.current.cooldown).toBe(45);
    expect(onResend).toHaveBeenCalledTimes(2);
  });

  // ─── Limpeza do timer ────────────────────────────────────────────────────────

  it('deve limpar o intervalo ao desmontar o componente', () => {
    const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval');
    const { result, unmount } = renderUseOtpStep();

    act(() => {
      result.current.handleResend();
    });

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});
