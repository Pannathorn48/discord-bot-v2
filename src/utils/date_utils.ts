import { DiscordBotError } from "@/domain/reuse/discord_error";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

export function DateFromString(dateString: string): dayjs.Dayjs | null {
  const date = dayjs(dateString, "DD/MM/YYYY", true);
  if (!date.isValid()) {
    return null;
  }

  return date;
}

export function FormatDate(date: dayjs.Dayjs): string {
  return date.format("MM/DD/YYYY");
}

export async function CreateDate(deadlineStr: string): Promise<Date> {
  const deadlineDate = DateFromString(deadlineStr);
  if (!deadlineDate) {
    throw new DiscordBotError("Invalid date format", "Please use DD/MM/YYYY.");
  }

  if (deadlineDate.isBefore(Date.now())) {
    throw new DiscordBotError(
      "Invalid deadline",
      "The deadline must be a future date."
    );
  }
  return deadlineDate.toDate();
}
