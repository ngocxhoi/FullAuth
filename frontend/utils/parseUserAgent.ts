import * as UAParser from "ua-parser-js";
import { format, formatDistanceToNowStrict, isPast } from "date-fns";

export default function (userAgent: string | null, date: string | Date) {
  const parser = new UAParser.UAParser(userAgent as string);
  const result = parser.getResult();

  const deviceType = result.device.type || "Desktop";
  const browser = result.browser.name || "Web";
  const os = `${result.os.name} ${result.os.version}`;

  const icon =
    deviceType === "mobile" ? "mdi:cellphone" : "mdi:desktop-classic";

  const formattedAt = isPast(new Date(date))
    ? `${formatDistanceToNowStrict(new Date(date))} ago`
    : format(new Date(date), "d MMM, yyyy");

  return {
    deviceType,
    browser,
    os,
    timeAgo: formattedAt,
    icon,
  };
}
