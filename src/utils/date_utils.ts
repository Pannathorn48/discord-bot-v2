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
