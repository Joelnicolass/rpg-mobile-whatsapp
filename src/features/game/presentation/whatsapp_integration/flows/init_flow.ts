import {
  createBot,
  createProvider,
  createFlow,
  addKeyword,
} from "@bot-whatsapp/bot";
import axios from "axios";

export const createCharacterFlow = addKeyword(["testbot"])
  .addAnswer("🙌 Hola bienvenido a este *Chatbot*")
  .addAnswer(
    "Test de async",
    null,
    async (ctx, { flowDynamic }) => {
      const result = await axios.get(
        "https://jsonplaceholder.typicode.com/todos/1"
      );

      await flowDynamic([
        {
          body: JSON.stringify(result.data),
          media: "https://i.imgur.com/0HpzsEm.png",
        },
      ]);
    },
    []
  );

export const initFlow = addKeyword(["BOTGAME"]).addAnswer(
  ["...Ordenando las cosas"],
  null,
  async (ctx, { flowDynamic, gotoFlow }) => {
    // obtener numero de telefono y verificar si tiene personaje creado

    // si no tiene personaje creado, llevarlo a flujo de creacion de personaje
    gotoFlow(createCharacterFlow);

    // si tiene personaje creado, llevarlo al flujo principal

    await flowDynamic([
      {
        body: "",
        media: "https://i.imgur.com/0HpzsEm.png",
      },
    ]);
  }
);
