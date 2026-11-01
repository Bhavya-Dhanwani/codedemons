import createApp from "./src/app.js";
import connectDB from "./src/shared/config/db.config.js";
import env from "./src/shared/config/env.config.js";
import logger from "./src/shared/config/logger.config.js";
import { startReminders } from "./src/shared/utils/crm.util.js";
import { seedProjects } from "./src/shared/utils/seedProjects.util.js";

async function startServer() {
	const app = createApp();

	await connectDB();

	// an empty projects collection gets the sample projects; existing ones are left alone
	await seedProjects().catch((e) => logger.error(e, "Seeding projects failed"));

	// payment and signature reminders to clients
	if (env.NODE_ENV !== "test") startReminders();

	app.listen(env.PORT || 5000, () => {
		logger.info(`Server is running on port ${env.PORT || 5000}`);
	});
}

startServer();
