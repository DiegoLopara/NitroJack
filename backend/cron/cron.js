import cron from "cron";
import https from "https";

const URL = "https://nitrojack-final.onrender.com";

const job = new cron.CronJob("*/14 * * * *", function () {
  https
    .get(URL, (res) => {
      if (res.statusCode === 200) {
        console.log("GET request enviada correctamente");
      } else {
        console.log("GET request error de envio", res.statusCode);
      }
    })
    .on("error", (e) => {
      console.error("Error while al enviar request", e);
    });
});

export default job;
