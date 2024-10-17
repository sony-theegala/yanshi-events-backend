module.exports = {
    apps: [
      {
        name: "yanshi-events-backend",
        script: "./index.js",
        watch: true,
        node_args: "--env-file ./.env",
      },
    ],
  };