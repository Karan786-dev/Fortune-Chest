const cron = require("node-cron");
const { add_plans_reward_in_users_accounts } = require("./functions");

// This task will run every day at 7 AM Indian time
cron.schedule("30 1 * * *", async () => {
  add_plans_reward_in_users_accounts();
});

// This loop schedules the task for each day of the week at 7 AM Indian time
const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
for (let i = 0; i < daysOfWeek.length; i++) {
  const dayOfWeek = daysOfWeek[i];
  cron.schedule(`0 7 * * ${i}`, async () => {
    add_plans_reward_in_users_accounts(dayOfWeek.toLowerCase());
  });
}