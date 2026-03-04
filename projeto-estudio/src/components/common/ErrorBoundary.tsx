import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
}

/**
 * 🛡️ ESCUDO ANTI-WSOD (Point #8)
 * Impede que um erro num componente secundário derrube toda a aplicação.
 * Em vez disso, mostra uma interface de erro elegante e recuperável.
 */
class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(_: Error): State {
        return { hasError: true };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('💥 ERRO UI DETETADO:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 text-center">
                    <div className="border border-[#D4AF37]/30 p-8 rounded-2xl bg-[#0A0A0A] max-w-md shadow-2xl shadow-[#D4AF37]/5">
                        <h2 className="text-2xl font-bold text-[#D4AF37] mb-4">Algo não correu bem</h2>
                        <p className="text-gray-400 mb-6">
                            Pedimos desculpa. Ocorreu um erro inesperado na interface, mas os seus dados estão seguros.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-[#D4AF37] text-black px-8 py-3 rounded-full font-bold hover:bg-[#B8962E] transition-all transform active:scale-95 shadow-lg shadow-[#D4AF37]/20"
                        >
                            Recarregar Aplicação
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
