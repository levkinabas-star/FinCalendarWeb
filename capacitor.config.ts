import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
	appId: "com.budgettracker.app",
	appName: "FinCalendar",
	webDir: "dist",
	android: {
		buildOptions: {
			keystorePath: undefined,
			keystoreAlias: undefined,
		},
	},
	plugins: {
		LocalNotifications: {
			smallIcon: "ic_stat_icon_config_sample",
			iconColor: "#488AFF",
			sound: "beep.wav",
		},
	},
};

export default config;
