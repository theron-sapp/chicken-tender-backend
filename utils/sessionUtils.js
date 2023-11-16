//  ChickenTender-Backend/utils/sessionUtils.js

import { randomBytes } from "crypto";

export function generateSessionCode() {
  // This will generate a random 6-byte hexadecimal string. You can increase the byte size for a longer code.
  return randomBytes(4).toString("hex");
}
