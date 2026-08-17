import { Cron } from "croner";
import {
  hasCurrencyRatesForToday,
  syncCurrencyRates,
} from "../currency/sync-rates";
import { checkDueDateReminders } from "./due-date-reminders";

const jobs: Cron[] = [];

export function initializeScheduler(): void {
  jobs.push(new Cron("*/5 * * * *", checkDueDateReminders));
  jobs.push(new Cron("5 0 * * *", () => void syncCurrencyRates()));
  jobs.push(
    new Cron("0 8 * * *", async () => {
      if (!(await hasCurrencyRatesForToday())) {
        await syncCurrencyRates();
      }
    }),
  );
  console.log(
    "⏰ Scheduler started (due date reminders every 5 minutes, currency rates daily)",
  );
}

export function shutdownScheduler(): void {
  for (const job of jobs) {
    job.stop();
  }
  jobs.length = 0;
}
