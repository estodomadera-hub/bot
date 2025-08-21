// src/core/iaResponder
const OpenAI = require('openai');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

async function iaResponder(mensaje) {
    try {
        const completion = await openai.chat.completions.create({
            model: OPENAI_MODEL,
            messages: [
                {
                    role: "system",
                    content: "Eres un asistente virtual amable y servicial para una tienda de muebles y productos de madera. Tu objetivo es responder preguntas generales de los clientes y guiarlos hacia las opciones disponibles (catálogo, promociones, ubicación, etc.) si es necesario. No tienes información sobre ventas o precios específicos, para eso debes sugerir hablar con un representante de la tienda. Tu respuesta debe ser concisa y útil, y no debe ser una respuesta a lo que dice el cliente, si no una respuesta que lo guie.",
                },
                {
                    role: "user",
                    content: mensaje,
                },
            ],
        });

        return completion.choices[0].message.content;

    } catch (error) {
        console.error('Error al llamar a la API de OpenAI:', error);
        return null;
    }
}

module.exports = iaResponder;