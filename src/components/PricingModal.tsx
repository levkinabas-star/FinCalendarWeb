import { lazy, Suspense } from "react";
import { X, Crown } from "lucide-react";
import { useIsDesktop } from "../hooks/useIsDesktop";

const Pricing = lazy(() => import("../pages/Pricing"));

interface Props {
	isOpen: boolean;
	onClose: () => void;
}

export default function PricingModal({ isOpen, onClose }: Props) {
	const isDesktop = useIsDesktop();

	if (!isOpen) return null;

	return (
		<div
			className="fixed animate-fade-in"
			style={{
				inset: 0,
				zIndex: 50,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				padding: "20px",
				background: "rgba(0,0,0,0.8)",
				backdropFilter: "blur(8px)",
			}}
		>
			{/* Backdrop */}
			<div className="absolute inset-0" onClick={onClose} />

			{/* Dialog */}
			<div
				className="animate-scale-in relative"
				style={{
					width: "100%",
					maxWidth: 720,
					maxHeight: isDesktop ? "90vh" : "85vh",
					background: "linear-gradient(180deg, #0E0E1C 0%, #0A0A14 100%)",
					border: "1px solid rgba(59,130,246,0.2)",
					borderRadius: 28,
					overflow: "hidden",
					display: "flex",
					flexDirection: "column",
					boxShadow:
						"0 32px 80px rgba(0,0,0,0.7), 0 0 60px rgba(59,130,246,0.1)",
				}}
			>
				{/* Gradient Header */}
				<div
					style={{
						background:
							"linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(139,92,246,0.1) 50%, rgba(245,158,11,0.05) 100%)",
						borderBottom: "1px solid rgba(59,130,246,0.15)",
						padding: "20px 24px",
						flexShrink: 0,
					}}
				>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div
								className="w-10 h-10 rounded-2xl flex items-center justify-center"
								style={{
									background:
										"linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)",
									boxShadow: "0 4px 20px rgba(245,158,11,0.4)",
								}}
							>
								<Crown size={20} color="white" />
							</div>
							<div>
								<h2
									style={{
										fontSize: 20,
										fontWeight: 700,
										color: "#F1F5F9",
										margin: 0,
									}}
								>
									Тарифы
								</h2>
								<p style={{ fontSize: 13, color: "#94A3B8", margin: 0 }}>
									Выберите подходящий план
								</p>
							</div>
						</div>
						<button
							onClick={onClose}
							className="active-scale"
							style={{
								width: 36,
								height: 36,
								borderRadius: 12,
								background: "rgba(255,255,255,0.05)",
								border: "1px solid rgba(255,255,255,0.1)",
								cursor: "pointer",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								transition: "all 0.2s",
							}}
						>
							<X size={18} color="#94A3B8" />
						</button>
					</div>
				</div>

				{/* Content */}
				<div style={{ overflowY: "auto", flex: 1, padding: "0 8px 8px" }}>
					<Suspense
						fallback={
							<div
								className="flex items-center justify-center"
								style={{ height: "50vh" }}
							>
								<div
									className="w-10 h-10 rounded-full border-3 border-t-transparent animate-spin"
									style={{
										borderColor: "#F59E0B",
										borderTopColor: "transparent",
									}}
								/>
							</div>
						}
					>
						<Pricing isModal onClose={onClose} />
					</Suspense>
				</div>
			</div>
		</div>
	);
}
