import "dotenv/config";
import { createBot, createProvider, createFlow, addKeyword } from '@builderbot/bot'
import { MemoryDB as Database } from '@builderbot/bot'
import { MetaProvider as Provider } from '@builderbot/provider-meta'
import { EVENTS } from '@builderbot/bot'
import formidable from 'formidable';
import xlsx from 'xlsx';
import axios from 'axios';
import { idleFlow } from './idle-custom.js'
import cors from 'cors';
import { toAskOpenAI } from "./utils/presence.js"

const PORT = process.env.PORT ?? 3008
//const INACTIVITY_TIME = 4 * 60 * 60 * 1000;


// Función para leer números desde el archivo Excel
function readNumbersFromExcel(filePath) {
    try {
        const workbook = xlsx.readFile(filePath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(sheet);

        console.log('Datos extraídos del Excel:', data);

        const contacts = data
            .filter(row => row.telefonos && row.empresa && row.ciudad)
            .map(row => ({
                number: row.telefonos.toString(), // Asegura que sea string
                empresa: row.empresa.trim(),
                ciudad: row.ciudad.trim()
            }));

        console.log('Contactos extraídos:', contacts);
        return contacts;
    } catch (error) {
        console.error('Error leyendo el archivo Excel:', error);
        throw error;
    }
}

const excludedNumbers = new Set(); // Lista para almacenar números fallidos
// Función para enviar mensajes con plantilla
const sendMessageTemplate = async (number, templateName, language, variables = []) => {
    if (excludedNumbers.has(number)) {
        console.log(`Número ${number} está excluido. No se intentará enviar.`);
        return;
    }
    const url = 'https://graph.facebook.com/v21.0/382952714890782/messages';
    const token = process.env.JWT_TOKEN;
    const data = {
        messaging_product: 'whatsapp',
        to: number,
        type: 'template',
        template: {
            name: templateName,
            language: { code: language },
            components: variables.length > 0 ? [
                {
                    type: 'body',
                    parameters: variables.map(variable => ({ type: 'text', text: variable }))
                
            }] : []
        }
    };

    try {
        const response = await axios.post(url, data, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        console.log(`Mensaje enviado a ${number} exitosamente:`, response.data);
    } catch (error) {
        console.error(`Error enviando mensaje a ${number}:`, error.response?.data || error.message);

        if (error.response?.data?.error?.message.includes("Undeliverable")) {
            console.log(`Número ${number} marcado como excluido debido a mensajes no entregables.`);
            excludedNumbers.add(number); // Agregar a la lista de excluidos
        }
    }
};

const templateConfig = {
  plantilla_distribuidor: (contact) => [contact.empresa, contact.ciudad],
  minorista:      (contact) => [contact.empresa],
  yoga:       (contact) => [contact.empresa],
};

//Funcion para procesar el envio masivo
const sendBulkMessages = async (phoneNumbers, templateName) => {
  const getTemplateVariables = templateConfig[templateName];

  if (!getTemplateVariables) {
    console.error(`Plantilla no configurada: ${templateName}`);
    return;
  }

  for (const contact of phoneNumbers) {
    try {
      const variables = getTemplateVariables(contact);
      await sendMessageTemplate(
        contact.number,
        templateName,
        'es_ES',
        variables
      );
    } catch (error) {
      console.error(`Error inesperado al procesar el número ${contact.number}:`, error);
    }
  }
};

const conversationHistories = {};


const mensajeBienvenida = addKeyword(EVENTS.WELCOME)
  .addAction(async (ctx, { flowDynamic }) => {
    const userId = ctx.from;

    // Inicializamos si no hay historial
    if (!conversationHistories[userId]) {
      conversationHistories[userId] = [];
    }

    if (conversationHistories[userId].length > 20) {
  conversationHistories[userId].shift(); // eliminás el más viejo
}


    // Añadir el nuevo mensaje del usuario al historial
    conversationHistories[userId].push({
      role: "user",
      parts: [{ text: ctx.body }]
    });

    // Llamamos a OpenAI
    const response = await toAskOpenAI(ctx.body, conversationHistories[userId]);

    // Guardamos la respuesta también
    conversationHistories[userId].push({
      role: "assistant",
      parts: [{ text: response }]
    });

    await flowDynamic(response);
  });


const media = addKeyword(EVENTS.MEDIA).addAnswer('Lo siento pero no puedo revisar lo que me mandaste. Por favor escribe solo mensajes de texto para poder responder tus dudas.')

const documento = addKeyword(EVENTS.DOCUMENT)
    .addAnswer("Lo siento pero no puedo revisar el documento que me mandaste. Por favor escribe solo mensajes de texto para poder responder tus dudas.")

const localizacion = addKeyword(EVENTS.LOCATION)
    .addAnswer("Veo donde te encuentras. Por favor escribe solo mensajes de texto para poder responder tus dudas.")

const audio = addKeyword(EVENTS.VOICE_NOTE)
    .addAnswer("Por ahora no puedo escuchar lo que me estás diciendo. Por favor escribe solo mensajes de texto para poder responder tus dudas.")


/*const flow_masivo = addKeyword(['si', 'sí'])
    .addAction(async (ctx) => stop(ctx))
    .addAction(async (ctx, { gotoFlow }) => start(ctx, gotoFlow, INACTIVITY_TIME))
    .addAnswer('Gracias por tu interés. En este link encontrarás la lista de precio de nuestros productos disponibles: https://docs.google.com/spreadsheets/d/1bsasUjRq3l5zn9-wA0Sz2E-42F0jAkx1hd7-bv0ad48/edit?usp=sharing')
    .addAnswer(['¿Te gustaría realizar tu pedido a un vendedor?',
        'Respondé: PEDIDO para brindarte asesoramiento.'
    ],
        { capture: true }, (ctx, { fallBack, endFlow }) => {
            console.log("key", process.env.OPENAI_API_KEY)
            if (ctx.body.toLowerCase() == 'pedido') {
                return endFlow('En el siguiente link podrás ingresar al catálogo de WP para armar un carrito con tu pedido Ver la solicitud del pedido y enviarla a un vendedor: https://wa.me/c/5493537311506')
            }
            else if (ctx.body.toLowerCase() == 'no') {
                return endFlow('Nos gustaría resolver tus dudas mediante una comunicación personalizada con un vendedor. En el siguiente link abrirás un chat directo con un vendedor: https://wa.link/duuzm8')
            }
            else return fallBack('Por favor, ingrese una palabra válida')
        }
    );
  */  

const main = async () => {
    const adapterFlow = createFlow([mensajeBienvenida, media, documento, localizacion, audio, idleFlow])
    const adapterProvider = createProvider(Provider, {
        jwtToken: process.env.JWT_TOKEN,
        numberId: process.env.NUMBER_ID,
        verifyToken: process.env.VERIFY_TOKEN,
        version: 'v21.0'
    })
    const adapterDB = new Database()

    const { handleCtx, httpServer } = await createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    adapterProvider.server.post(
        '/v1/messages',
        handleCtx(async (bot, req, res) => {
            const { number, message, urlMedia } = req.body
            await bot.sendMessage(number, message, { media: urlMedia ?? null })
            return res.end('sended')
        })
    )

    adapterProvider.server.post(
        '/v1/register',
        handleCtx(async (bot, req, res) => {
            const { number, name } = req.body
            await bot.dispatch('REGISTER_FLOW', { from: number, name })
            return res.end('trigger')
        })
    )

    adapterProvider.server.post(
        '/v1/samples',
        handleCtx(async (bot, req, res) => {
            const { number, name } = req.body
            await bot.dispatch('SAMPLES', { from: number, name })
            return res.end('trigger')
        })
    )

    adapterProvider.server.post(
        '/v1/blacklist',
        handleCtx(async (bot, req, res) => {
            const { number, intent } = req.body
            if (intent === 'remove') bot.blacklist.remove(number)
            if (intent === 'add') bot.blacklist.add(number)

            res.writeHead(200, { 'Content-Type': 'application/json' })
            return res.end(JSON.stringify({ status: 'ok', number, intent }))
        })
    )

    adapterProvider.server.use(cors({ origin: 'http://127.0.0.1:5500' }));

    adapterProvider.server.post('/uploadExcel', async (req, res) => {
    const form = formidable();

    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.error('Error procesando la subida:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, message: 'Error procesando la subida' }));
        }

        const filePath = files.excelFile ? files.excelFile[0]?.filepath : null;
        const templateName = fields.template?.[0];

        if (!filePath) {
            console.error('No se ha recibido el archivo');
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, message: 'No se ha recibido el archivo' }));
        }

        if (!templateName) {
            console.error('No se ha recibido el nombre de la plantilla');
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, message: 'Falta el nombre de la plantilla' }));
        }

        console.log('Archivo recibido:', filePath);
        console.log('Plantilla seleccionada:', templateName);

        try {
            const phoneNumbers = readNumbersFromExcel(filePath); // Tu función para leer contactos
            await sendBulkMessages(phoneNumbers, templateName);  // Ahora incluye la plantilla
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'Archivo procesado y mensajes enviados' }));
        } catch (error) {
            console.error('Error procesando archivo:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Error procesando el archivo' }));
        }
    });
});

    
    httpServer(+PORT)
}

main()
