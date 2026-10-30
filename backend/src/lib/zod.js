import { z } from "zod";

// Sxemalarda aniq xabar yozilmagan joylarda ham (masalan `z.boolean()`,
// `z.enum()`) mijozga inglizcha emas, o'zbekcha xato matni qaytsin.
z.config(z.locales.uz());
