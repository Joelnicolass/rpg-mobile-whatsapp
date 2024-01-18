import MockAdapter from "@bot-whatsapp/database/mock";

import {
  createBot,
  createProvider,
  createFlow,
  addKeyword,
} from "@bot-whatsapp/bot";

import QRPortalWeb from "@bot-whatsapp/portal";
import BaileysProvider from "@bot-whatsapp/provider/baileys";

export const createWhatsappServer = async ({ initFlow }) => {
  const adapterDB = new MockAdapter();
  const adapterFlow = createFlow([initFlow]);
  const adapterProvider = createProvider(BaileysProvider);

  createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  });

  QRPortalWeb();
};
