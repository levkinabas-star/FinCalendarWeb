import { createContext, useContext, useState, type ReactNode } from "react";

interface PricingModalContextType {
	showPricing: boolean;
	openPricing: () => void;
	closePricing: () => void;
}

const PricingModalContext = createContext<PricingModalContextType | null>(null);

export function PricingModalProvider({ children }: { children: ReactNode }) {
	const [showPricing, setShowPricing] = useState(false);

	return (
		<PricingModalContext.Provider
			value={{
				showPricing,
				openPricing: () => setShowPricing(true),
				closePricing: () => setShowPricing(false),
			}}
		>
			{children}
		</PricingModalContext.Provider>
	);
}

export function usePricingModal() {
	const context = useContext(PricingModalContext);
	if (!context) {
		throw new Error("usePricingModal must be used within PricingModalProvider");
	}
	return context;
}
