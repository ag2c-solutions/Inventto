import { Component, type ReactNode } from 'react';

import { GlobalStateScreen } from '@/shared/components/common/global-state-screen';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class SystemErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <GlobalStateScreen
          icon="alert"
          title="Não foi possível carregar"
          text="Houve uma falha de rede ao montar o painel. O que já estava em tela foi preservado."
          cta="Tentar de novo"
          onAction={() => window.location.reload()}
        />
      );
    }
    return this.props.children;
  }
}
