import { createWhatsappServer } from "./features/game/presentation/whatsapp_integration/server/whatsapp_server";
import { initFlow } from "./features/game/presentation/whatsapp_integration/flows/init_flow";

import { playInConsole } from "./features/game/presentation/console_integration/console_controls";

/* createWhatsappServer({
  initFlow: initFlow,
}); */

playInConsole();
