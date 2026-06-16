import { useEffect, useRef } from "react";
import { X, Crown } from "lucide-react";
import { useIsDesktop } from "../hooks/useIsDesktop";
import Pricing from "../pages/Pricing";

interface Props {
	isOpen: boolean;
	onClose: () => void;
}

const FOCUSABLE_SELECTORS =
	'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function PricingModal({ isOpen, onClose }: Props) {
	const isDesktop = useIsDesktop();
	const dialogRef = useRef<HTMLDivElement>(null);
	const closeButtonRef = useRef<HTMLButtonElement>(null);
	const previouslyFocusedRef = useRef<HTMLElement | null>(null);

	useEffect(() => {
		if (!isOpen) return;

		const originalOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = originalOverflow;
		};
	}, [isOpen]);

	useEffect(() => {
		if (!isOpen) return;

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				e.preventDefault();
				onClose();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, onClose]);

	useEffect(() => {
		if (!isOpen) return;

		previouslyFocusedRef.current = document.activeElement as HTMLElement;
		closeButtonRef.current?.focus();

		const dialog = dialogRef.current;
		if (!dialog) return;

		const handleTabKey = (e: KeyboardEvent) => {
			if (e.key !== "Tab") return;

			const focusable = Array.from(
				dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS),
			).filter((el) => el.offsetParent !== null);

			if (focusable.length === 0) {
				e.preventDefault();
				return;
			}

			const first = focusable[0];
			const last = focusable[focusable.length - 1];

			if (e.shiftKey && document.activeElement === first) {
				e.preventDefault();
				last.focus();
			} else if (!e.shiftKey && document.activeElement === last) {
				e.preventDefault();
				first.focus();
			}
		};

		document.addEventListener("keydown", handleTabKey);
		return () => {
			document.removeEventListener("keydown", handleTabKey);
			previouslyFocusedRef.current?.focus();
		};
	}, [isOpen]);

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
				padding: isDesktop ? "20px" : "16px",
				background: "rgba(0,0,0,0.8)",
				backdropFilter: "blur(8px)",
			}}
		>
			<div
				className="absolute inset-0"
				onClick={onClose}
				aria-hidden="true"
			/>

			<div
				ref={dialogRef}
				role="dialog"
				aria-modal="true"
				aria-labelledby="pricing-modal-title"
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
									id="pricing-modal-title"
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
							type="button"
							ref={closeButtonRef}
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
							aria-label="Закрыть"
						>
							<X size={18} color="#94A3B8" />
						</button>
					</div>
				</div>

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
