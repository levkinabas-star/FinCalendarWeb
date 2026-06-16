// FinCalendar API — PM2 Configuration для Timeweb Cloud

module.exports = {
	apps: [
		{
			name: "fincalendar-api",
			script: "server.js",

			// Режим кластера (auto для многоядерных CPU)
			instances: "auto",
			exec_mode: "cluster",

			// Рабочая директория
			cwd: "./",

			// Переменные окружения
			env: {
				NODE_ENV: "production",
				PORT: 4000,
			},

			// Логи
			error_file: "./logs/error.log",
			out_file: "./logs/out.log",
			log_file: "./logs/combined.log",

			// Авторестарт
			autorestart: true,
			watch: false,

			// Время до рестарта при краше (мс)
			kill_timeout: 5000,

			// Максимум перезапусков
			max_restarts: 10,
			min_uptime: "10s",
		},
	],
};
