import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface Props {
	isModal?: boolean;
	onClose?: () => void;
}
import {
	Crown,
	Check,
	ArrowLeft,
	Sparkles,
	Tag,
	CheckCircle,
	XCircle,
} from "lucide-react";
import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";
import { useStore } from "../store";
import { FREE_LIMITS } from "../plan";

const FREE_FEATURES_RU = [
	`До ${FREE_LIMITS.accounts} счетов`,
	`До ${FREE_LIMITS.plannedExpenses} запланированных расходов`,
	`До ${FREE_LIMITS.debts} долгов`,
	`До ${FREE_LIMITS.customCategories} новых категорий`,
	"Только экспорт в формате JSON",
];

const FREE_FEATURES_EN = [
	`Up to ${FREE_LIMITS.accounts} accounts`,
	`Up to ${FREE_LIMITS.plannedExpenses} planned expenses`,
	`Up to ${FREE_LIMITS.debts} debts`,
	`Up to ${FREE_LIMITS.customCategories} custom categories`,
	"JSON export only",
];

const PRO_FEATURES_RU = [
	"Неограниченные возможности",
	"Собственные категории без ограничений",
	"Доступ к странице Статистика",
	"Бюджеты",
	"Создание долгов без ограничений",
	"Экспорт в PDF, Excel, CSV, JSON",
];

const PRO_FEATURES_EN = [
	"Unlimited everything",
	"Custom categories without limits",
	"Statistics page access",
	"Category budgets",
	"Unlimited debt tracking",
	"Export to PDF, Excel, CSV, JSON",
];

export default function Pricing({ isModal = false, onClose }: Props = {}) {
	const navigate = useNavigate();
	const { language, plan, proExpiry, activatePro, applyPromoCode } = useStore();
	const isRu = language === "ru";
	const isPro =
		plan === "pro" && (proExpiry === null || new Date() < new Date(proExpiry));

	const [billing, setBilling] = useState<"monthly" | "yearly">("yearly");
	const [activating, setActivating] = useState(false);
	const [done, setDone] = useState(false);
	const [payError, setPayError] = useState(false);

	const [promoInput, setPromoInput] = useState("");
	const [promoState, setPromoState] = useState<
		| { status: "idle" }
		| { status: "success"; label: string }
		| { status: "error" }
	>({ status: "idle" });

	const handlePromo = () => {
		const result = applyPromoCode(promoInput);
		if (result.ok) {
			setPromoState({
				status: "success",
				label: isRu ? result.labelRu : result.labelEn,
			});
			setPromoInput("");
			setTimeout(() => {
				if (onClose) onClose();
				else navigate("/");
			}, 1800);
		} else {
			setPromoState({ status: "error" });
		}
	};

	const monthlyPrice = isRu ? "100 ₽" : "$1.19";
	const yearlyPrice = isRu ? "1 000 ₽" : "$11.99";
	const yearlyMonthly = isRu ? "83 ₽/мес" : "$1.00/mo";

	const API_URL = import.meta.env.VITE_API_URL || "";

	const handleActivate = async () => {
		setActivating(true);
		setPayError(false);
		try {
			const res = await fetch(`${API_URL}/api/payments/create`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ billing }),
			});
			if (!res.ok) throw new Error("server error");
			const { id, confirmationUrl } = await res.json();
			localStorage.setItem("yk_pending_payment_id", id);

			if (Capacitor.isNativePlatform()) {
				await Browser.open({ url: confirmationUrl });
				Browser.addListener("browserFinished", () => {
					Browser.removeAllListeners();
					navigate("/payment-return");
				});
			} else {
				window.location.href = confirmationUrl;
			}
		} catch {
			setActivating(false);
			setPayError(true);
		}
	};

	const freeFeatures = isRu ? FREE_FEATURES_RU : FREE_FEATURES_EN;
	const proFeatures = isRu ? PRO_FEATURES_RU : PRO_FEATURES_EN;

	return (
		<div
			className={isModal ? "" : "page-enter"}
			style={{
				background: isModal ? "transparent" : "#07070F",
				minHeight: isModal ? "auto" : "100vh",
				paddingBottom: isModal ? 0 : undefined,
				paddingTop: isModal ? 0 : undefined,
			}}
		>
			{/* Hero - hide in modal */}
			{!isModal && (
				<div className="px-5 mb-6">
					<div
						className="rounded-3xl p-6 text-center"
						style={{
							background: "linear-gradient(135deg, #1a0a2e 0%, #0d1a2e 100%)",
							border: "1px solid #2D2D5A",
						}}
					>
						<div
							className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
							style={{
								background: "linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)",
							}}
						>
							<Crown size={30} color="white" />
						</div>
						<h2 className="text-2xl font-bold text-white mb-2">
							{isRu ? "Бюджет без ограничений" : "Budget Without Limits"}
						</h2>
						<p className="text-slate-400 text-sm leading-relaxed">
							{isRu
								? "Разблокируйте все функции и управляйте финансами без ограничений"
								: "Unlock all features and manage your finances without restrictions"}
						</p>
					</div>
				</div>
			)}

			{/* Billing toggle */}
			{!isPro && (
				<div className={isModal ? "px-4 mb-3" : "px-5 mb-4"}>
					<div
						className="flex rounded-2xl p-1 gap-1"
						style={{ background: "#131325" }}
					>
						{(["monthly", "yearly"] as const).map((b) => (
							<button
								key={b}
								onClick={() => setBilling(b)}
								className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all active-scale flex items-center justify-center gap-1.5"
								style={{
									background: billing === b ? "#3B82F6" : "transparent",
									color: billing === b ? "white" : "#64748B",
								}}
							>
								{b === "monthly"
									? isRu
										? "Ежемесячно"
										: "Monthly"
									: isRu
										? "Ежегодно"
										: "Yearly"}
								{b === "yearly" && (
									<span
										className="text-xs px-1.5 py-0.5 rounded-lg font-bold"
										style={{
											background: "#10B981",
											color: "white",
											fontSize: 9,
										}}
									>
										−17%
									</span>
								)}
							</button>
						))}
					</div>
				</div>
			)}

			{/* Plan cards */}
			<div
				className={
					isModal
						? "px-4 flex flex-col gap-3 mb-3"
						: "px-5 flex flex-col gap-4 mb-4"
				}
			>
				{/* Free card */}
				<div
					className="rounded-2xl p-4"
					style={{
						background: "#12122A",
						border: `1px solid ${plan === "free" ? "#3B82F6" : "#1E2A40"}`,
					}}
				>
					<div className="flex items-center justify-between mb-3">
						<div>
							<p className="text-slate-100 font-bold text-base">Free</p>
							<p className="text-slate-400 text-xs">
								{isRu ? "Навсегда бесплатно" : "Always free"}
							</p>
						</div>
						<span className="text-xl font-bold text-slate-100">0</span>
					</div>
					<div className="flex flex-col gap-1.5">
						{freeFeatures.map((f, i) => (
							<div key={i} className="flex items-center gap-2">
								<div
									className="w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0"
									style={{ background: "#1E2A40" }}
								>
									<Check size={8} color="#64748B" />
								</div>
								<span className="text-slate-400 text-xs">{f}</span>
							</div>
						))}
					</div>
					{plan === "free" && (
						<div
							className="mt-3 py-2 rounded-xl text-center text-xs font-medium text-slate-500"
							style={{ background: "#1E2A40" }}
						>
							{isRu ? "Текущий план" : "Current plan"}
						</div>
					)}
				</div>

				{/* Pro card */}
				<div
					className="rounded-2xl p-4 relative overflow-hidden"
					style={{
						background: "linear-gradient(135deg, #1a0a2e 0%, #0d1a2e 100%)",
						border: `2px solid ${isPro ? "#10B981" : "#F59E0B"}`,
					}}
				>
					{!isPro && (
						<div
							className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg"
							style={{
								background: "linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)",
							}}
						>
							<Sparkles size={10} color="white" />
							<span className="text-white text-xs font-bold">
								{isRu ? "Популярный" : "Popular"}
							</span>
						</div>
					)}
					<div className="flex items-center justify-between mb-2">
						<div>
							<p className="text-white font-bold text-base flex items-center gap-1.5">
								<Crown size={14} color="#F59E0B" /> Pro
							</p>
							<p className="text-slate-400 text-xs">
								{billing === "yearly"
									? isRu
										? `${yearlyMonthly} при оплате за год`
										: `${yearlyMonthly} billed yearly`
									: ""}
							</p>
						</div>
						<div className="text-right">
							<p className="text-xl font-bold text-white">
								{billing === "monthly" ? monthlyPrice : yearlyPrice}
							</p>
							<p className="text-slate-400 text-xs">
								{billing === "monthly"
									? isRu
										? "/мес"
										: "/mo"
									: isRu
										? "/год"
										: "/yr"}
							</p>
						</div>
					</div>

					<div className="flex flex-col gap-1.5 mb-4">
						{proFeatures.map((f, i) => (
							<div key={i} className="flex items-center gap-2">
								<div
									className="w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0"
									style={{
										background:
											"linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)",
									}}
								>
									<Check size={8} color="white" />
								</div>
								<span className="text-slate-200 text-xs">{f}</span>
							</div>
						))}
					</div>

					{isPro ? (
						<div
							className="py-2.5 rounded-xl text-center text-sm font-bold"
							style={{ background: "#10B981", color: "white" }}
						>
							✓ {isRu ? "Pro активирован" : "Pro Active"}
						</div>
					) : (
						<button
							onClick={handleActivate}
							disabled={activating}
							className="w-full py-3 rounded-xl text-sm font-bold active-scale transition-opacity"
							style={{
								background: "linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)",
								color: "white",
								opacity: activating ? 0.7 : 1,
								cursor: activating ? "not-allowed" : "pointer",
							}}
						>
							{activating
								? isRu
									? "Переходим к оплате…"
									: "Redirecting…"
								: isRu
									? `Оплатить ${billing === "monthly" ? "100 ₽/мес" : "1 000 ₽/год"}`
									: `Pay ${billing === "monthly" ? "$1.19/mo" : "$11.99/yr"}`}
						</button>
					)}
					{payError && (
						<p
							className="text-center text-xs mt-2"
							style={{ color: "#EF4444" }}
						>
							{isRu
								? "Ошибка соединения. Попробуйте ещё раз."
								: "Connection error. Please try again."}
						</p>
					)}
				</div>
			</div>

			{/* Promo code */}
			{promoState.status !== "success" && (
				<div className={isModal ? "px-4 mb-3" : "px-5 mb-4"}>
					<div
						className="rounded-2xl p-4"
						style={{ background: "#12122A", border: "1px solid #1E2A40" }}
					>
						<div className="flex items-center gap-2 mb-2">
							<Tag size={14} color="#3B82F6" />
							<p className="text-slate-200 text-sm font-medium">
								{isRu ? "Промокод" : "Promo code"}
							</p>
						</div>
						<div className="flex gap-2">
							<input
								value={promoInput}
								onChange={(e) => {
									setPromoInput(e.target.value.toUpperCase());
									setPromoState({ status: "idle" });
								}}
								onKeyDown={(e) =>
									e.key === "Enter" && promoInput.trim() && handlePromo()
								}
								placeholder={isRu ? "Введите промокод" : "Enter promo code"}
								className="flex-1 px-3 py-2 rounded-xl text-sm text-slate-100 outline-none"
								style={{
									background: "#1E1E38",
									border: `1px solid ${promoState.status === "error" ? "#EF4444" : "#2D2D5A"}`,
									letterSpacing: "0.05em",
								}}
							/>
							<button
								onClick={handlePromo}
								disabled={!promoInput.trim()}
								className="px-4 py-2 rounded-xl text-sm font-medium active-scale transition-opacity"
								style={{
									background: "#3B82F6",
									color: "white",
									opacity: promoInput.trim() ? 1 : 0.4,
								}}
							>
								{isRu ? "Применить" : "Apply"}
							</button>
						</div>
						{promoState.status === "error" && (
							<div className="flex items-center gap-1.5 mt-1.5">
								<XCircle size={12} color="#EF4444" />
								<p className="text-xs" style={{ color: "#EF4444" }}>
									{isRu ? "Неверный промокод" : "Invalid promo code"}
								</p>
							</div>
						)}
					</div>
				</div>
			)}

			{promoState.status === "success" && (
				<div className="px-5 mb-4">
					<div
						className="rounded-2xl p-4 flex items-center gap-3"
						style={{ background: "#0d2a1a", border: "1px solid #10B981" }}
					>
						<CheckCircle size={20} color="#10B981" />
						<div>
							<p className="text-sm font-bold text-emerald-400">
								{isRu ? "Промокод активирован!" : "Promo code activated!"}
							</p>
							<p className="text-xs text-slate-400">{promoState.label}</p>
						</div>
					</div>
				</div>
			)}

			{/* Footer note */}
			<p
				className={
					isModal
						? "text-center text-slate-500 text-xs px-4 py-3"
						: "text-center text-slate-500 text-xs px-8 pb-4"
				}
			>
				{isRu
					? "Оплата производится через платёжный сервис. Отменить можно в любой момент."
					: "Payment is processed securely. Cancel anytime."}
			</p>
		</div>
	);
}
