// Importing modules
import { config } from "dotenv";
import z from "zod";
import envConstants from "../constants/env.constants.js";

// loading environment variables
config();

// defining the schema for environment variables
const envSchema = z.object({
    PORT: z.coerce.number().default(envConstants.PORT),
    NODE_ENV: z.enum(["development", "production", "test"]).default(envConstants.NODE_ENV),
    MONGO_URI: z.string().default(envConstants.MONGO_URI),
    CORS_ORIGIN: z.string().default(envConstants.CORS_ORIGIN),
    ACCESS_TOKEN_SECRET: z.string().default(envConstants.ACCESS_TOKEN_SECRET),
    REFRESH_TOKEN_SECRET: z.string().default(envConstants.REFRESH_TOKEN_SECRET),
    BREVO_API_KEY: z.string().default(envConstants.BREVO_API_KEY),
    SENDING_USER: z.string().default(envConstants.SENDING_USER),
    SEND_MAIL: z.preprocess((val) => {
        if (typeof val === "string") return val.toLowerCase() === "true";
        return val;
    }, z.boolean()).default(envConstants.SEND_MAIL),
    GOOGLE_CLIENT_ID: z.string().default(envConstants.GOOGLE_CLIENT_ID),
    GOOGLE_CLIENT_SECRET: z.string().default(envConstants.GOOGLE_CLIENT_SECRET),
    GOOGLE_REDIRECT_URI: z.string().url().default(envConstants.GOOGLE_REDIRECT_URI),
    FRONTEND_URL: z.string().default(envConstants.FRONTEND_URL),
    // ImageKit media storage (all empty = store uploads on local disk)
    IMAGEKIT_PUBLIC_KEY: z.string().default(envConstants.IMAGEKIT_PUBLIC_KEY),
    IMAGEKIT_PRIVATE_KEY: z.string().default(envConstants.IMAGEKIT_PRIVATE_KEY),
    IMAGEKIT_URL_ENDPOINT: z.string().default(envConstants.IMAGEKIT_URL_ENDPOINT),
    IMAGEKIT_FOLDER: z.string().default(envConstants.IMAGEKIT_FOLDER),
    // admin panel login (empty disables it)
    ADMIN_EMAIL: z.string().default(envConstants.ADMIN_EMAIL),
    ADMIN_PASSWORD: z.string().default(envConstants.ADMIN_PASSWORD),
});

// parsing and validating environment variables
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    console.error("Invalid environment variables:", parsedEnv.error.format());
    process.exit(1);
}

// getting the validated environment variables
const env = parsedEnv.data;

export default env;
