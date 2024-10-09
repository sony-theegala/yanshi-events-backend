module.exports = {
    apps: [
      {
        name: "yanshi-events-backend",
        script: "./index.js",
        watch: true,
        env: {
          PORT: process.env.PORT,
          DATABASE_URL: process.env.DATABASE_URL,
        },
      },
    ],
  };