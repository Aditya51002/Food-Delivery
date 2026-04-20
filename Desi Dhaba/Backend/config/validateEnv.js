const validateEnv = () => {
  const required = [
    "JWT_SECRET",
    "REFRESH_TOKEN_SECRET",
    "MONGO_URI",
    "RAZORPAY_KEY_ID",
    "RAZORPAY_KEY_SECRET",
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(
      `\n❌  Missing required environment variable(s):\n` +
        missing.map((k) => `   • ${k}`).join("\n") +
        `\n\nAdd them to your .env file and restart the server.\n`
    );
    process.exit(1);
  }
};

module.exports = validateEnv;
