require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");

const app = express();

// Security middleware
app.use(
	helmet({
		contentSecurityPolicy: false,
	}),
);

app.use(
	cors({
		origin: process.env.ALLOWED_ORIGINS?.split(",") || [
			"https://appfincalendar.ru",
			"http://localhost:5173",
			"http://localhost:3000",
		],
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
		credentials: true,
	}),
);

// Logging
if (process.env.NODE_ENV !== "production") {
	app.use(morgan("dev"));
} else {
	app.use(morgan("combined"));
}

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Trust proxy
app.set("trust proxy", 1);

// ============================================
// YooKassa Configuration
// ============================================
const SHOP_ID = process.env.YOOKASSA_SHOP_ID;
const SECRET_KEY = process.env.YOOKASSA_SECRET_KEY;
const APP_URL = (process.env.APP_URL || "https://appfincalendar.ru").replace(
	/\/$/,
	"",
);

const YK_API = "https://api.yookassa.ru/v3";

const PRICES = {
	monthly: {
		value: process.env.PRICE_MONTHLY || "100.00",
		currency: "RUB",
		description:
			process.env.PRICE_MONTHLY_DESCRIPTION || "FinCalendar Pro — 1 месяц",
	},
	yearly: {
		value: process.env.PRICE_YEARLY || "1000.00",
		currency: "RUB",
		description:
			process.env.PRICE_YEARLY_DESCRIPTION || "FinCalendar Pro — 1 год",
	},
};

// In-memory store for payments
const payments = new Map();

function ykHeaders(idempotenceKey) {
	const creds = Buffer.from(`${SHOP_ID}:${SECRET_KEY}`).toString("base64");
	return {
		Authorization: `Basic ${creds}`,
		"Content-Type": "application/json",
		"Idempotence-Key": idempotenceKey || uuidv4(),
	};
}

function hasValidCredentials() {
	return SHOP_ID && SECRET_KEY && SHOP_ID !== "your_shop_id";
}

// ============================================
// Health Check
// ============================================
app.get("/health", (_req, res) => {
	res.json({ ok: true });
});

// ============================================
// Root Endpoint
// ============================================
app.get("/", (req, res) => {
	res.json({
		service: "fincalendar-api",
		version: "2.0.0",
		status: hasValidCredentials() ? "running" : "configuration_required",
		endpoints: {
			health: "/health",
			createPayment: "/api/payments/create",
			getPayment: "/api/payments/:id",
			cancelPayment: "/api/payments/:id/cancel",
			refundPayment: "/api/payments/:id/refund",
		},
	});
});

// ============================================
// POST /api/payments/create
// Create a new YooKassa payment
// ============================================
app.post("/api/payments/create", async (req, res) => {
	try {
		if (!hasValidCredentials()) {
			return res.status(500).json({
				error: "Payment credentials not configured",
				message: "YooKassa credentials are not set",
			});
		}

		const { billing } = req.body;
		const billingCycle = billing === "monthly" ? "monthly" : "yearly";
		const price = PRICES[billingCycle];

		const body = {
			amount: {
				value: price.value,
				currency: price.currency,
			},
			confirmation: {
				type: "redirect",
				return_url: `${APP_URL}/payment-return`,
			},
			capture: true,
			description: price.description,
			metadata: {
				billing: billingCycle,
			},
		};

		const response = await fetch(`${YK_API}/payments`, {
			method: "POST",
			headers: ykHeaders(),
			body: JSON.stringify(body),
		});

		const data = await response.json();

		if (!response.ok) {
			console.error("YooKassa create error:", JSON.stringify(data));
			return res.status(502).json({
				error: "Payment creation failed",
				message: data.description || "Failed to create YooKassa payment",
			});
		}

		// Store payment locally
		const payment = {
			id: data.id,
			status: data.status,
			amount: data.amount.value,
			currency: data.amount.currency,
			description: data.description,
			metadata: data.metadata,
			createdAt: data.created_at,
			confirmationUrl: data.confirmation.confirmation_url,
		};
		payments.set(data.id, payment);

		res.json({
			id: data.id,
			confirmationUrl: data.confirmation.confirmation_url,
		});
	} catch (error) {
		console.error("Error creating payment:", error);
		res.status(500).json({
			error: "Internal Server Error",
			message: "Failed to create payment",
		});
	}
});

// ============================================
// GET /api/payments/:id
// Get payment status by ID
// ============================================
app.get("/api/payments/:id", async (req, res) => {
	try {
		if (!hasValidCredentials()) {
			return res.status(500).json({
				error: "Payment credentials not configured",
			});
		}

		const { id } = req.params;

		if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
			return res.status(400).json({
				error: "Invalid payment ID format",
			});
		}

		const response = await fetch(`${YK_API}/payments/${id}`, {
			headers: ykHeaders(id),
		});

		const data = await response.json();

		if (!response.ok) {
			console.error("YooKassa status error:", JSON.stringify(data));
			return res.status(502).json({
				error: "Failed to get payment",
				message: data.description || "Failed to retrieve payment status",
			});
		}

		res.json({
			id: data.id,
			status: data.status,
			billing: data.metadata?.billing ?? "yearly",
		});
	} catch (error) {
		console.error("Error getting payment:", error);
		res.status(500).json({
			error: "Internal Server Error",
			message: "Failed to get payment status",
		});
	}
});

// ============================================
// POST /api/payments/:id/cancel
// Cancel a pending payment
// ============================================
app.post("/api/payments/:id/cancel", async (req, res) => {
	try {
		if (!hasValidCredentials()) {
			return res
				.status(500)
				.json({ error: "Payment credentials not configured" });
		}

		const { id } = req.params;

		const response = await fetch(`${YK_API}/payments/${id}/cancel`, {
			method: "POST",
			headers: ykHeaders(id),
		});

		const data = await response.json();

		if (!response.ok) {
			return res.status(502).json({
				error: "Cancel failed",
				message: data.description || "Failed to cancel payment",
			});
		}

		// Update local store
		const payment = payments.get(id);
		if (payment) {
			payment.status = data.status;
			payments.set(id, payment);
		}

		res.json({
			success: true,
			payment: {
				id: data.id,
				status: data.status,
			},
		});
	} catch (error) {
		console.error("Error cancelling payment:", error);
		res.status(500).json({
			error: "Internal Server Error",
			message: "Failed to cancel payment",
		});
	}
});

// ============================================
// POST /api/payments/:id/refund
// Refund a completed payment
// ============================================
app.post("/api/payments/:id/refund", async (req, res) => {
	try {
		if (!hasValidCredentials()) {
			return res
				.status(500)
				.json({ error: "Payment credentials not configured" });
		}

		const { id } = req.params;
		const { amount, reason } = req.body;

		// Get original payment
		const paymentResponse = await fetch(`${YK_API}/payments/${id}`, {
			headers: ykHeaders(id),
		});
		const paymentData = await paymentResponse.json();

		if (!paymentResponse.ok) {
			return res.status(502).json({
				error: "Failed to get payment",
				message: paymentData.description,
			});
		}

		const refundAmount = amount || paymentData.amount.value;

		// Create refund
		const refundBody = {
			amount: {
				value: refundAmount,
				currency: paymentData.amount.currency,
			},
		};

		if (reason) {
			refundBody.description = reason;
		}

		const response = await fetch(`${YK_API}/refunds`, {
			method: "POST",
			headers: ykHeaders(),
			body: JSON.stringify(refundBody),
		});

		const data = await response.json();

		if (!response.ok) {
			return res.status(502).json({
				error: "Refund failed",
				message: data.description || "Failed to process refund",
			});
		}

		res.json({
			success: true,
			refund: {
				id: data.id,
				paymentId: id,
				amount: data.amount.value,
				status: data.status,
				reason: data.description,
			},
		});
	} catch (error) {
		console.error("Error processing refund:", error);
		res.status(500).json({
			error: "Internal Server Error",
			message: "Failed to process refund",
		});
	}
});

// ============================================
// POST /api/webhook (YooKassa Webhook)
// ============================================
app.post("/api/webhook", (req, res) => {
	const { event, object } = req.body || {};

	// Verify webhook signature if secret is set
	const webhookSecret = process.env.YOOKASSA_WEBHOOK_SECRET;
	if (webhookSecret && req.headers["yookassa-signature"]) {
		const signature = req.headers["yookassa-signature"];
		const expectedSignature = crypto
			.createHmac("sha256", webhookSecret)
			.update(JSON.stringify(req.body))
			.digest("hex");

		if (signature !== expectedSignature) {
			console.error("Invalid webhook signature");
			return res.status(403).json({ error: "Invalid signature" });
		}
	}

	console.log("Webhook:", event, object?.id, object?.status);

	// Process webhook events
	if (object?.id) {
		const payment = payments.get(object.id);
		if (payment) {
			payment.status = object.status;
			payments.set(object.id, payment);
		}
	}

	res.sendStatus(200);
});

// ============================================
// 404 Handler
// ============================================
app.use((req, res) => {
	res.status(404).json({
		error: "Not Found",
		message: `Route ${req.method} ${req.path} not found`,
	});
});

// ============================================
// Error Handler
// ============================================
app.use((err, req, res, next) => {
	console.error("Error:", err);
	res.status(err.status || 500).json({
		error: err.name || "Internal Server Error",
		message:
			process.env.NODE_ENV === "production"
				? "An error occurred processing your request"
				: err.message,
	});
});

// ============================================
// Start Server
// ============================================
const PORT = Number(process.env.PORT) || 4000;

app.listen(PORT, "0.0.0.0", () => {
	console.log("=".repeat(50));
	console.log(`FinCalendar API running on port ${PORT}`);
	console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
	console.log(`Return URL: ${APP_URL}/payment-return`);
	console.log("=".repeat(50));

	if (!hasValidCredentials()) {
		console.warn("⚠️  WARNING: YooKassa credentials not configured!");
		console.warn("   Set the following environment variables:");
		console.warn("   - YOOKASSA_SHOP_ID");
		console.warn("   - YOOKASSA_SECRET_KEY");
	} else {
		console.log(`✓ YooKassa configured (Shop ID: ${SHOP_ID})`);
	}
});

module.exports = app;
