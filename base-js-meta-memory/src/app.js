import { createBot, createProvider, createFlow, addKeyword } from '@builderbot/bot'
import { MemoryDB as Database } from '@builderbot/bot'
import { MetaProvider as Provider } from '@builderbot/provider-meta'
import { EVENTS } from '@builderbot/bot'
import dotenv from 'dotenv';
import formidable from 'formidable';
import xlsx from 'xlsx';
import axios from 'axios';
import { idleFlow, start, stop } from './idle-custom.js'

dotenv.config(); // Cargar las variables de entorno desde .env
const PORT = process.env.PORT ?? 3008
const INACTIVITY_TIME = 4 * 60 * 60 * 1000;
const INACTIVITY_TIME_MASIVO = 24 * 60 * 60 * 1000;

// Función para leer números desde el archivo Excel
function readNumbersFromExcel(filePath) {
    try {
        const workbook = xlsx.readFile(filePath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]]; // Primera hoja
        const data = xlsx.utils.sheet_to_json(sheet); // Convierte la hoja a formato JSON
        console.log('Datos extraídos del Excel:', data);  // Verifica que los datos se extraen correctamente

        const phoneNumbers = data.map(row => row.telefonos).filter(Boolean);  // Filtra cualquier valor nulo o vacío
        console.log('Números de teléfono extraídos:', phoneNumbers);  // Verifica que los números están siendo extraídos correctamente
        return phoneNumbers;
    } catch (error) {
        console.error('Error leyendo el archivo Excel:', error);
        throw error;  // Lanza el error para que se maneje en la parte del servidor
    }
}


// Función para enviar mensajes con plantilla
const sendMessageTemplate = async (number, templateName, language, variables = []) => {
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
    }
};

// Función para procesar el envío masivo
const sendBulkMessages = async (phoneNumbers) => {
    for (const number of phoneNumbers) {
        if (number) {
            await sendMessageTemplate(number, 'plantilla', 'es_ES');
        }
    }
};



const mensajeBienvenida = addKeyword([EVENTS.WELCOME])
    .addAction(async (ctx, { gotoFlow }) => start(ctx, gotoFlow, INACTIVITY_TIME))
    .addAnswer('Hola, gracias por comunicarte con Gymgenius. Este es un canal de respuestas 24/7. Necesitás información acerca de:')
    .addAnswer([
        '- Productos',
        '- Mayorista',
        '- Solucionar algún inconveniente',
        '- Nuestra historia',
        '- Contactarnos'
    ],
        { capture: true },
            async (ctx, { fallBack, gotoFlow }) => {
            // Detectar si es una respuesta a mensaje masivo
            const isReplyToBulkMessage = ctx.body.includes('importadores directos'); //revisar si es asi o con ==
            if (isReplyToBulkMessage) {
                // Redirigir al flujo de mensajes masivos
                return gotoFlow(flow_masivo);
        }
            // Flujo normal para clientes que inician la conversación
            const validKeywords = [
                'productos', 'producto', 'contacto', 'contactarnos', 'contactarno',
                'nuestra historia', 'historia', 'solucion', 'solucionar inconveniente',
                'solucionar algún inconveniente', 'inconveniente', 'solucionar',
                'mayorista', 'mayoristas'
            ];

            const userInput = ctx.body.toLowerCase();
            const isValid = validKeywords.some(keyword => userInput.includes(keyword));

            if (!isValid) {
                return fallBack('Por favor, ingrese una palabra válida tal cual aparece en la lista.');
            }

        });

const media = addKeyword(EVENTS.MEDIA).addAnswer('Lo siento pero no puedo revisar lo que me mandaste. Por favor escribe solo mensajes de texto para poder responder tus dudas.')

const documento = addKeyword(EVENTS.DOCUMENT)
    .addAnswer("Lo siento pero no puedo revisar el documento que me mandaste. Por favor escribe solo mensajes de texto para poder responder tus dudas.")

const localizacion = addKeyword(EVENTS.LOCATION)
    .addAnswer("Veo donde te encuentras. Por favor escribe solo mensajes de texto para poder responder tus dudas.")

const audio = addKeyword(EVENTS.VOICE_NOTE)
    .addAnswer("Por ahora no puedo escuchar lo que me estás diciendo. Por favor escribe solo mensajes de texto para poder responder tus dudas.")

const productos = addKeyword(['productos', 'producto'])
    .addAction(async (ctx) => stop(ctx))
    .addAction(async (ctx, { gotoFlow }) => start(ctx, gotoFlow, INACTIVITY_TIME))
    .addAnswer([
        'Estamos felices de poder ofrecerte una variedad de productos de alta calidad a un excelente precio. Te gustaría saber acerca de:',
        '- Mat',
        '- Banda de látex',
        '- Banda de resistencia',
        '- Kit de 5 bandas',
        '- Banda TPE con manoplas',
        '- Banda de tela',
        '- Soga',
        '- Guantes',
        '- Rueda',
        '- Otra pregunta'
    ], { capture: true }, (ctx, { fallBack, gotoFlow, endFlow }) => {
        const validKeywords = [
            'mat', 'banda de latex', 'banda de látex', 'banda latex', 'banda látex', 'banda de resistencia', 'banda resistencia', 'kit de 5 bandas', 'kit', '5 bandas', 'banda tpe', 'banda tpe con manoplas', 'manopla', 'banda manoplas', 'manoplas', 'banda de tela', 'banda tela', 'tela', 'soga', 'guantes', 'guante', 'rueda', 'ruedas', 'otra pregunta'
        ];

        const userInput = ctx.body.toLowerCase();
        const isValid = validKeywords.some(keyword => userInput.includes(keyword));

        if (!isValid) {
            return fallBack('Por favor, ingrese una palabra válida tal cual aparece en la lista.');
        }
        if (userInput.toLowerCase() == 'otra pregunta') {
            return gotoFlow(mensajeBienvenida)
        }
        if (ctx?.idle) {
            return endFlow('Muchas gracias por su consulta.')
        }
    });
const mat = addKeyword('mat')
    .addAction(async (ctx) => stop(ctx))
    .addAction(async (ctx, { gotoFlow }) => start(ctx, gotoFlow, INACTIVITY_TIME))
    .addAnswer('¿Quieres llevar tu entrenamiento al siguiente nivel? Usa el código GYMGENIUS para obtener un 10% de descuento en nuestra tienda online.')

    .addAnswer(['Explorá la revolución del bienestar con nuestro Mat de 10 mm en colores rosa claro, gris y violeta. Gracias a su base acolchada, este producto te ofrece una experiencia muy confortable. Su suave tonalidad evoca la calma que tu entrenamiento necesita. Además, el material con el que está fabricado es antideslizante para asegurar tu performance. Y tiene un generoso tamaño de 183 cm x 61 cm.',
        'Este es el link donde puede ingresar para realizar la compra https://www.gymgenius.com.ar/mat'
    ])
    .addAnswer(['¿Quiere consultar sobre otro producto?',
        '- Si',
        '- No'
    ],
        { capture: true }, (ctx, { fallBack, gotoFlow,endFlow }) => {
            if (ctx.body.toLowerCase() == 'si') {
                return gotoFlow(productos)
            }
            else if (ctx.body.toLowerCase() == 'no') {
                return endFlow('Muchas gracias por su consulta.')
            }
            else {
                return fallBack('Por favor, ingrese una palabra válida')
            }
        }
    )

const bandaLatex = addKeyword(['banda de latex', 'banda de látex', 'banda latex', 'banda látex'])
    .addAction(async (ctx) => stop(ctx))
    .addAction(async (ctx, { gotoFlow }) => start(ctx, gotoFlow, INACTIVITY_TIME))
    .addAnswer('¿Quieres llevar tu entrenamiento al siguiente nivel? Usa el código GYMGENIUS para obtener un 10% de descuento en nuestra tienda online.')
    .addAnswer(['Azul: Potenciá tu entrenamiento con nuestras Bandas GymGenius. Diseñado para ofrecer versatilidad y resistencia, este producto es tu compañero ideal para alcanzar tus metas fitness.',
        'Con dimensiones compactas de 25 cm x 5 cm, se adapta a tu variedad de ejercicios. Y con su espesor de 0.5 mm se ajusta a tu nivel de intensidad brindando una resistencia inicial perfecta para tu rutina.',
        'Fabricadas con látex de alta calidad, las bandas GymGenius ofrecen durabilidad y rendimiento consistente.',
        'Este es el link donde puede ingresar para realizar la compra https://www.gymgenius.com.ar/MLA-1425351981-banda-elastica-gymgenius-intensidad-baja-azul-_JM#position=2&search_layout=stack&type=item&tracking_id=748871d6-4dc9-4f2b-b2d8-99678ac789a8'
    ])
    .addAnswer(['Rojo: Potenciá tu entrenamiento con nuestras Bandas GymGenius. Diseñado para ofrecer versatilidad y resistencia, este producto es tu compañero ideal para alcanzar tus metas fitness.',
        'Con dimensiones compactas de 25 cm x 5 cm, se adapta a tu variedad de ejercicios. Y con su espesor de 0.5 mm se ajusta a tu nivel de intensidad brindando una resistencia inicial perfecta para tu rutina.',
        'Fabricadas con látex de alta calidad, las bandas GymGenius ofrecen durabilidad y rendimiento consistente.',
        'Este es el link donde puede ingresar para realizar la compra https://www.gymgenius.com.ar/MLA-1425249461-banda-elastica-gymgenius-intensidad-alta-roja-_JM#position=1&search_layout=stack&type=item&tracking_id=502f1878-2e33-4970-b664-aa4aa6227542'
    ])
    .addAnswer(['Amarillo: Potenciá tu entrenamiento con nuestras Bandas GymGenius. Diseñado para ofrecer versatilidad y resistencia, este producto es tu compañero ideal para alcanzar tus metas fitness.',
        'Con dimensiones compactas de 25 cm x 5 cm, se adapta a tu variedad de ejercicios. Y con su espesor de 0.5 mm se ajusta a tu nivel de intensidad brindando una resistencia inicial perfecta para tu rutina.',
        'Fabricadas con látex de alta calidad, las bandas GymGenius ofrecen durabilidad y rendimiento consistente.',
        'Este es el link donde puede ingresar para realizar la compra https://www.gymgenius.com.ar/MLA-1764562578-banda-elastica-gymgenius-intensidad-media-amarilla-_JM#position=3&search_layout=stack&type=item&tracking_id=c732cd6a-a4c4-4969-94c4-8b02d8dbdd85'
    ])
    .addAnswer(['¿Quiere consultar sobre otro producto?',
        '- Si',
        '- No'
    ],
        { capture: true }, (ctx, { fallBack, gotoFlow, endFlow }) => {
            if (ctx.body.toLowerCase() == 'si') {
                return gotoFlow(productos)
            }
            else if (ctx.body.toLowerCase() == 'no') {
                return endFlow('Muchas gracias por su consulta.')
            }
            else {
                return fallBack('Por favor, ingrese una palabra válida')
            }
        }
    )

const bandaTpe = addKeyword(['banda tpe', 'banda tpe con manoplas', 'manopla', 'banda manoplas', 'manoplas'])
    .addAction(async (ctx) => stop(ctx))
    .addAction(async (ctx, { gotoFlow }) => start(ctx, gotoFlow, INACTIVITY_TIME))
    .addAnswer('¿Quieres llevar tu entrenamiento al siguiente nivel? Usa el código GYMGENIUS para obtener un 10% de descuento en nuestra tienda online.')
    .addAnswer(['Verde: Optimizá tu entrenamiento con nuestra Banda de Resistencia TPE GymGenius.',
        'Acompañada de dos manoplas ergonómicas de 12 cm que añaden comodidad y un agarre firme a tu rutina y con una longitud de 120 cm, este accesorio redefine tu rutina de ejercicios.',
        'Disponible en tres niveles de resistencia distintos, con 10.5 mm de espesor, te permite adaptar tu entrenamiento según tus metas y capacidades actuales. La versatilidad de la banda te brinda la posibilidad de trabajar diversos grupos musculares de manera efectiva.',
        'Descubrí el poder en tu entrenamiento con nuestra Banda de Resistencia TPE.',
        'Este es el link donde puede ingresar para realizar la compra https://www.gymgenius.com.ar/MLA-1425366039-banda-de-resistencia-tpe-manijas-ergonomicas-gymgenius-baja-_JM#position=1&search_layout=stack&type=item&tracking_id=945ddcbf-2030-469d-bc79-4ab2a4f8fedf'
    ])
    .addAnswer(['Azul: Optimizá tu entrenamiento con nuestra Banda de Resistencia TPE GymGenius.',
        'Acompañada de dos manoplas ergonómicas de 12 cm que añaden comodidad y un agarre firme a tu rutina y con una longitud de 120 cm, este accesorio redefine tu rutina de ejercicios.',
        'Disponible en tres niveles de resistencia distintos, con 10.5 mm de espesor, te permite adaptar tu entrenamiento según tus metas y capacidades actuales. La versatilidad de la banda te brinda la posibilidad de trabajar diversos grupos musculares de manera efectiva.',
        'Descubrí el poder en tu entrenamiento con nuestra Banda de Resistencia TPE.',
        'Este es el link donde puede ingresar para realizar la compra https://www.gymgenius.com.ar/MLA-1764563324-banda-de-resistencia-media-tpe-manijas-ergonomicas-gymgenius-_JM#position=2&search_layout=stack&type=item&tracking_id=0c600b64-8b84-441a-b23a-353a11a92607',
    ])
    .addAnswer(['Negro: Optimizá tu entrenamiento con nuestra Banda de Resistencia TPE GymGenius.',
        'Acompañada de dos manoplas ergonómicas de 12 cm que añaden comodidad y un agarre firme a tu rutina y con una longitud de 120 cm, este accesorio redefine tu rutina de ejercicios.',
        'Disponible en tres niveles de resistencia distintos, con 10.5 mm de espesor, te permite adaptar tu entrenamiento según tus metas y capacidades actuales. La versatilidad de la banda te brinda la posibilidad de trabajar diversos grupos musculares de manera efectiva.',
        'Descubrí el poder en tu entrenamiento con nuestra Banda de Resistencia TPE.',
        'Este es el link donde puede ingresar para realizar la compra https://www.gymgenius.com.ar/MLA-1764679822-banda-de-resistencia-alta-tpe-manijas-ergonomicas-gymgenius-_JM#position=3&search_layout=stack&type=item&tracking_id=580865bd-a00d-40fc-b0bc-5cd6551d8ecb'
    ])
    .addAnswer(['¿Quiere consultar sobre otro producto?',
        '- Si',
        '- No'
    ],
        { capture: true }, (ctx, { fallBack, gotoFlow, endFlow }) => {
            if (ctx.body.toLowerCase() == 'si') {
                return gotoFlow(productos)
            }
            else if (ctx.body.toLowerCase() == 'no') {
                return endFlow('Muchas gracias por su consulta.')
            }
            else {
                return fallBack('Por favor, ingrese una palabra válida')
            }
        }
    )

const kit5Bandas = addKeyword(['kit de 5 bandas', 'kit', '5 bandas'])
    .addAction(async (ctx) => stop(ctx))
    .addAction(async (ctx, { gotoFlow }) => start(ctx, gotoFlow, INACTIVITY_TIME))
    .addAnswer('¿Quieres llevar tu entrenamiento al siguiente nivel? Usa el código GYMGENIUS para obtener un 10% de descuento en nuestra tienda online.')
    .addAnswer(['Transformá tu rutina de ejercicios con nuestro Kit de 5 Bandas de Entrenamiento Gym Genius. Este conjunto versátil, diseñado para desafiar y tonificar, te ofrece una gama completa de resistencias para potenciar tu entrenamiento según tus necesidades y metas.',
        'Experimentá niveles de resistencia personalizados con cinco espesores distintos según sus colores:',
        'verde - 0.35 mm',
        'azul - 0.5 mm',
        'amarilla con 0.7 mm',
        'roja - 0.9 mm',
        'negra - 1.1 mm'
    ])
    .addAnswer(['El kit viene con su propio packaging, lo que brinda practicidad al momento de transportarlas. Cada banda tiene medidas compactas de 25 cm x 5 cm, ideales para llevar con vos a donde vayas.',
        'Alcanza tus objetivos fitness de manera efectiva con GymGenius!',
        'Este es el link donde puede ingresar para realizar la compra https://www.gymgenius.com.ar/MLA-1425262435-kitset-5-bandas-premium-gymgenius-diferentes-intensidades-_JM#position=3&search_layout=stack&type=item&tracking_id=2a97af9f-0d55-4885-8e22-a4146c3fbf38'
    ])
    .addAnswer(['¿Quiere consultar sobre otro producto?',
        '- Si',
        '- No'
    ],
        { capture: true }, (ctx, { fallBack, gotoFlow, endFlow }) => {
            if (ctx.body.toLowerCase() == 'si') {
                return gotoFlow(productos)
            }
            else if (ctx.body.toLowerCase() == 'no') {
                return endFlow('Muchas gracias por su consulta.')
            }
            else {
                return fallBack('Por favor, ingrese una palabra válida')
            }
        }
    )

const bandaResistencia = addKeyword(['banda resistencia', 'banda de resistencia'])
    .addAction(async (ctx) => stop(ctx))
    .addAction(async (ctx, { gotoFlow }) => start(ctx, gotoFlow, INACTIVITY_TIME))
    .addAnswer('¿Quieres llevar tu entrenamiento al siguiente nivel? Usa el código GYMGENIUS para obtener un 10% de descuento en nuestra tienda online.')
    .addAnswer(['Roja: Elevá tu rutina de entrenamiento con nuestra Banda de Resistencia GymGenius',
        'Diseñado en látex de alta calidad para desafiar tus límites, este producto ofrece la combinación perfecta entre versatilidad y durabilidad.',
        'Con medidas de 208 cm x 0.45 cm, es tu mejor aliada para una amplia variedad de ejercicios. Y con un espesor de 1.3 cm te proporciona la resistencia inicial ideal para tu performance.',
        '¡Alcanza tus metas hoy mismo!',
        'Este es el link donde puede ingresar para realizar la compra https://www.gymgenius.com.ar/MLA-1425327213-super-banda-gymgenius-intensidad-baja-roja-_JM#position=5&search_layout=stack&type=item&tracking_id=79a5a970-cdf2-46fc-b005-3d18417791c8'
    ])
    .addAnswer(['Negra: Elevá tu rutina de entrenamiento con nuestra Banda de Resistencia GymGenius',
        'Diseñado en látex de alta calidad para desafiar tus límites, este producto ofrece la combinación perfecta entre versatilidad y durabilidad.',
        'Con medidas de 208 cm x 0.45 cm, es tu mejor aliada para una amplia variedad de ejercicios. Y con un espesor de 2.2 cm te proporciona la resistencia inicial ideal para tu performance.',
        'Este es el link donde puede ingresar para realizar la compra https://www.gymgenius.com.ar/MLA-1425352595-super-banda-gymgenius-intensidad-media-negra-_JM#position=10&search_layout=stack&type=item&tracking_id=a92a0bd2-cda8-403a-9f73-23f58246199c'
    ])
    .addAnswer(['Lila: Elevá tu rutina de entrenamiento con nuestra Banda de Resistencia GymGenius',
        'Diseñado en látex de alta calidad para desafiar tus límites, este producto ofrece la combinación perfecta entre versatilidad y durabilidad.',
        'Con medidas de 208 cm x 0.45 cm, es tu mejor aliada para una amplia variedad de ejercicios. Y con un espesor de 3.2 cm te proporciona la resistencia inicial ideal para tu performance.',
        'Este es el link donde puede ingresar para realizar la compra https://www.gymgenius.com.ar/MLA-1764602140-super-banda-gymgenius-intensidad-alta-lila-_JM#position=15&search_layout=stack&type=item&tracking_id=87494612-49fa-4315-b2a8-eb95269efcfa'
    ])
    .addAnswer(['Verde: Elevá tu rutina de entrenamiento con nuestra Banda de Resistencia GymGenius',
        'Diseñado en látex de alta calidad para desafiar tus límites, este producto ofrece la combinación perfecta entre versatilidad y durabilidad.',
        'Con medidas de 208 cm x 0.45 cm, es tu mejor aliada para una amplia variedad de ejercicios. Y con un espesor de 4.5 cm te proporciona la resistencia inicial ideal para tu performance.',
        'Este es el link donde puede ingresar para realizar la compra https://www.gymgenius.com.ar/MLA-1764641050-super-banda-gymgenius-intensidad-muy-alta-verde-_JM#position=7&search_layout=stack&type=item&tracking_id=e3a3681a-5f09-4988-a6fb-bfda0e7c2f40'
    ])
    .addAnswer(['¿Quiere consultar sobre otro producto?',
        '- Si',
        '- No'
    ],
        { capture: true }, (ctx, { fallBack, gotoFlow, endFlow }) => {
            if (ctx.body.toLowerCase() == 'si') {
                return gotoFlow(productos)
            }
            else if (ctx.body.toLowerCase() == 'no') {
                return endFlow('Muchas gracias por su consulta.')
            }
            else {
                return fallBack('Por favor, ingrese una palabra válida')
            }
        }
    )

const bandaTela = addKeyword(['banda de tela', 'banda tela', 'tela', 'banda de telas'])
    .addAction(async (ctx) => stop(ctx))
    .addAction(async (ctx, { gotoFlow }) => start(ctx, gotoFlow, INACTIVITY_TIME))
    .addAnswer('¿Quieres llevar tu entrenamiento al siguiente nivel? Usa el código GYMGENIUS para obtener un 10% de descuento en nuestra tienda online.')
    .addAnswer(['Azul: Llevá tu entrenamiento al siguiente nivel con nuestras Bandas de Tela GymGenius. Diseñadas para potenciar tu resistencia y flexibilidad, este producto es el accesorio perfecto para tu rutina de ejercicio.',
        'Con un tamaño de 66 cm x 7 cm te ofrece el ajuste perfecto para las variaciones que tenga tu performance.',
        'Confeccionada con una mezcla de nylon y látex, garantiza óptima durabilidad y elasticidad. Además, con sus vibrantes colores, añade un toque de estilo a tu sesión de entrenamiento.',
        'Descubrí el poder de desafiar tus límites con las bandas GymGenius.',
        'Este es el link donde puede ingresar para realizar la compra https://www.gymgenius.com.ar/MLA-1425339899-banda-tela-premium-gymgenius-hip-loop-intendidad-baja-azul-_JM#position=9&search_layout=stack&type=item&tracking_id=22bdfd18-1c41-4eb0-a780-e60d2762bb68'
    ])
    .addAnswer(['Amarilla: Llevá tu entrenamiento al siguiente nivel con nuestras Bandas de Tela GymGenius. Diseñadas para potenciar tu resistencia y flexibilidad, este producto es el accesorio perfecto para tu rutina de ejercicio.',
        'Con un tamaño de 36 cm x 8 cm te ofrece el ajuste perfecto para las variaciones que tenga tu performance.',
        'Confeccionada con una mezcla de nylon y látex, garantiza óptima durabilidad y elasticidad. Además, con sus vibrantes colores, añade un toque de estilo a tu sesión de entrenamiento.',
        'Descubrí el poder de desafiar tus límites con las bandas GymGenius.',
        'Este es el link donde puede ingresar para realizar la compra https://www.gymgenius.com.ar/MLA-1764576006-banda-tela-premiumgymgenius-hiploop-intendidad-alta-amarilla-_JM#position=2&search_layout=stack&type=item&tracking_id=ae9df17f-e865-44eb-8a84-66fcc448fda7'
    ])
    .addAnswer(['¿Quiere consultar sobre otro producto?',
        '- Si',
        '- No'
    ],
        { capture: true }, (ctx, { fallBack, gotoFlow, endFlow }) => {
            if (ctx.body.toLowerCase() == 'si') {
                return gotoFlow(productos)
            }
            else if (ctx.body.toLowerCase() == 'no') {
                return endFlow('Muchas gracias por su consulta.')
            }
            else {
                return fallBack('Por favor, ingrese una palabra válida')
            }
        }
    )
const soga = addKeyword(['soga', 'sogas'])
    .addAction(async (ctx) => stop(ctx))
    .addAction(async (ctx, { gotoFlow }) => start(ctx, gotoFlow, INACTIVITY_TIME))
    .addAnswer('¿Quieres llevar tu entrenamiento al siguiente nivel? Usa el código GYMGENIUS para obtener un 10% de descuento en nuestra tienda online.')
    .addAnswer(['Potenciá tu entrenamiento con nuestra Soga GymGenius. Con manoplas ergonómicas que brindan comodidad y confianza, este producto de 277 cm recubierto de PVC redefine tu rutina de ejercicio.',
        'Ya no es solo una cuerda de ejercicio, es tu compañera de resistencia ideal.',
        'Este es el link donde puede ingresar para realizar la compra https://www.gymgenius.com.ar/MLA-1764575702-soga-de-salto-gymgenius-rodamientos-y-manijas-ergonomicas-_JM#position=1&search_layout=stack&type=item&tracking_id=47ee5f7b-0023-40b2-a6ef-c1fbc6bb5fa7'
    ])
    .addAnswer(['¿Quiere consultar sobre otro producto?',
        '- Si',
        '- No'
    ],
        { capture: true }, (ctx, { fallBack, gotoFlow, endFlow }) => {
            if (ctx.body.toLowerCase() == 'si') {
                return gotoFlow(productos)
            }
            else if (ctx.body.toLowerCase() == 'no') {
                return endFlow('Muchas gracias por su consulta.')
            }
            else {
                return fallBack('Por favor, ingrese una palabra válida')
            }
        }
    )

const guantes = addKeyword(['guante', 'guantes'])
    .addAction(async (ctx) => stop(ctx))
    .addAction(async (ctx, { gotoFlow }) => start(ctx, gotoFlow, INACTIVITY_TIME))
    .addAnswer('¿Quieres llevar tu entrenamiento al siguiente nivel? Usa el código GYMGENIUS para obtener un 10% de descuento en nuestra tienda online.')
    .addAnswer(['Potenciá tu rutina de entrenamiento con nuestro Guante GymGenius.',
        'Diseñado para ofrecer comodidad y funcionalidad, este accesorio presenta orificios estratégicamente ubicados para una mejor respiración durante tu performance.',
        'Disponible en una variedad de tamaños, desde S hasta XL, nuestro guante se adapta perfectamente a tus manos, brindándote un ajuste seguro. El neopreno garantiza durabilidad y flexibilidad, permitiendo que te concentres en tu rendimiento sin restricciones.',
        'Para realizar la compra de guantes en sus diferentes talles:'
    ])
    .addAnswer(['Talle S',
        'https://www.gymgenius.com.ar/MLA-1425352971-guante-para-entrenamiento-talle-s-_JM#position=1&search_layout=stack&type=item&tracking_id=1f13688e-5e15-41d1-ae20-09b8ce60c29a'
    ])
    .addAnswer(['Talle M',
        'https://www.gymgenius.com.ar/MLA-1764757656-guante-para-entrenamiento-talle-m-_JM#position=4&search_layout=stack&type=item&tracking_id=d8b9ba71-d5aa-4741-9395-8c657deff47d'
    ])
    .addAnswer(['Talle L',
        'https://www.gymgenius.com.ar/MLA-1764679940-guante-para-entrenamiento-talle-l-_JM#position=3&search_layout=stack&type=item&tracking_id=ee641083-4e17-4add-8fe0-da314903c367'
    ])
    .addAnswer(['Talle XL',
        'https://www.gymgenius.com.ar/MLA-1764628464-guante-para-entrenamiento-talle-xl-_JM#position=2&search_layout=stack&type=item&tracking_id=6e2913bb-6d49-4f91-847b-753ac43280ea'
    ])
    .addAnswer(['¿Quiere consultar sobre otro producto?',
        '- Si',
        '- No'
    ],
        { capture: true }, (ctx, { fallBack, gotoFlow, endFlow }) => {
            if (ctx.body.toLowerCase() == 'si') {
                return gotoFlow(productos)
            }
            else if (ctx.body.toLowerCase() == 'no') {
                return endFlow('Muchas gracias por su consulta.')
            }
            else {
                return fallBack('Por favor, ingrese una palabra válida')
            }
        }
    )

const rueda = addKeyword(['rueda', 'ruedas'])
    .addAction(async (ctx) => stop(ctx))
    .addAction(async (ctx, { gotoFlow }) => start(ctx, gotoFlow, INACTIVITY_TIME))
    .addAnswer('¿Quieres llevar tu entrenamiento al siguiente nivel? Usa el código GYMGENIUS para obtener un 10% de descuento en nuestra tienda online.')
    .addAnswer(['Potenciá tu rutina de abdominales con nuestra Rueda de Ejercicios GymGenius.',
        'Fabricada con polipropileno y caucho de alta calidad, esta rueda es tu compañera perfecta para esculpir un núcleo fuerte y definido. Mediante su agarre ergonómico, este producto ofrece comodidad y estabilidad mientras te desafías a vos mismo en cada repetición. La combinación de materiales duraderos garantiza una resistencia excepcional y un rendimiento consistente durante tu entrenamiento.',
        'Además, nuestra rueda viene con un packaging innovador que te permite desarmar fácilmente para guardarla y llevarla con vos a donde quieras.',
        'Descubrí la libertad de ejercitarte en cualquier lugar y redefinir tu entrenamiento de abs con GymGenius.'
    ])
    .addAnswer(['Este es el link donde puede realizar la compra del producto https://www.gymgenius.com.ar/MLA-1423796895-rueda-para-abdominales-abs-gymgenius-negra-calidad-premium-_JM#position=1&search_layout=stack&type=item&tracking_id=1a99f87e-d326-4348-9f75-f1ea8cfaeadd'
    ])
    .addAnswer(['¿Quiere consultar sobre otro producto?',
        '- Si',
        '- No'
    ],
        { capture: true }, (ctx, { fallBack, gotoFlow, endFlow }) => {
            if (ctx.body.toLowerCase() == 'si') {
                return gotoFlow(productos)
            }
            else if (ctx.body.toLowerCase() == 'no') {
                return endFlow('Muchas gracias por su consulta.')
            }
            else {
                return fallBack('Por favor, ingrese una palabra válida')
            }
        }
    )

const contactarnos = addKeyword(['contacto', 'contactarnos', 'contactarno'])
    .addAction(async (ctx) => stop(ctx))
    .addAction(async (ctx, { gotoFlow }) => start(ctx, gotoFlow, INACTIVITY_TIME))
    .addAnswer('Ser una marca líder en equipamiento deportivo y de yoga, ofreciendo productos de alta calidad, innovadores y accesibles para facilitar rutinas en el hogar, contribuyendo de esta manera al bienestar físico y mental de nuestros clientes. ¿Te gustaría hablar con nosotros? https://wa.link/yvvvrt')
    .addAnswer(['¿Quiere realizar otra consulta?',
        '- Si',
        '- No'
    ],
        { capture: true }, (ctx, { fallBack, gotoFlow, endFlow }) => {
            if (ctx.body.toLowerCase() == 'si') {
                return gotoFlow(mensajeBienvenida)
            }
            else if (ctx.body.toLowerCase() == 'no') {
                return endFlow('Muchas gracias por su consulta.')
            }
            else {
                return fallBack('Por favor, ingrese una palabra válida')
            }
        }
    )

const nuestraHistoria = addKeyword(['nuestra historia', 'historia'])
    .addAction(async (ctx) => stop(ctx))
    .addAction(async (ctx, { gotoFlow }) => start(ctx, gotoFlow, INACTIVITY_TIME))
    .addAnswer('Somos una marca que se caracteriza en vender una selección premium de equipamiento deportivo y de yoga al mejor precio del mercado, te brindamos una experiencia transformadora que elevará tu rendimiento y te permitirá encontrar el equilibrio mente-cuerpo que tanto buscás. Al ser importadores directos, podemos ser competitivos con los precios y brindar la posibilidad de distribuir los productos mediante envíos rápidos y métodos de pago confiables en nuestra tienda online y venta física. ¿Te gustaría hablar con nosotros? https://wa.link/yvvvrt')
    .addAnswer(['¿Quiere realizar otra consulta?',
        '- Si',
        '- No'
    ],
        { capture: true }, (ctx, { fallBack, gotoFlow, endFlow }) => {
            if (ctx.body.toLowerCase() == 'si') {
                return gotoFlow(mensajeBienvenida)
            }
            else if (ctx.body.toLowerCase() == 'no') {
                return endFlow('Muchas gracias por su consulta.')
            }
            else {
                return fallBack('Por favor, ingrese una palabra válida')
            }
        }
    )

const solucionarInconveniente = addKeyword(['solucion', 'solucionar inconveniente', 'solucionar algun inconveniente', 'inconveniente', 'solucionar'])
    .addAction(async (ctx) => stop(ctx))
    .addAction(async (ctx, { gotoFlow }) => start(ctx, gotoFlow, INACTIVITY_TIME))
    .addAnswer('GymGenius ofrece garantía en todos sus productos, cubriendo cualquier defecto de fabricación o mal funcionamiento al momento de recibir tu pedido. En este caso podés devolverlo dentro de los 15 días posteriores a la recepción, siempre que el producto esté en perfectas condiciones y con su embalaje original. En esas condiciones te reembolsaremos el importe íntegro de tu compra. ¿Te gustaría hablar con nosotros? https://wa.link/yvvvrt')
    .addAnswer(['¿Quiere realizar otra consulta?',
        '- Si',
        '- No'
    ],
        { capture: true }, (ctx, { fallBack, gotoFlow, endFlow }) => {
            if (ctx.body.toLowerCase() == 'si') {
                return gotoFlow(mensajeBienvenida)
            }
            else if (ctx.body.toLowerCase() == 'no') {
                return endFlow('Muchas gracias por su consulta.')
            }
            else {
                return fallBack('Por favor, ingrese una palabra válida')
            }
        }
    )

const mayorista = addKeyword(['mayorista', 'mayoristas'])
    .addAction(async (ctx) => stop(ctx))
    .addAction(async (ctx, { gotoFlow }) => start(ctx, gotoFlow, INACTIVITY_TIME))
    .addAnswer('En el siguiente link podrás ingresar al catálogo de WP para armar un carrito con tu pedido Ver la solicitud del pedido y enviarla a un vendedor: https://wa.me/c/5493537311506')
    .addAnswer(['¿Quiere realizar otra consulta?',
        '- Si',
        '- No'
    ],
        { capture: true }, (ctx, { fallBack, gotoFlow, endFlow }) => {
            if (ctx.body.toLowerCase() == 'si') {
                return gotoFlow(mensajeBienvenida)
            }
            else if (ctx.body.toLowerCase() == 'no') {
                return endFlow('Muchas gracias por su consulta.')
            }
            else {
                return fallBack('Por favor, ingrese una palabra válida')
            }
        }
    )

const flow_masivo = addKeyword(['si', 'sí'])
    .addAction(async (ctx) => stop(ctx))
    .addAction(async (ctx, { gotoFlow }) => start(ctx, gotoFlow, INACTIVITY_TIME_MASIVO))
    .addAnswer('Gracias por tu interés. En este link encontrarás la lista de precio de nuestros productos disponibles: https://docs.google.com/spreadsheets/d/1bsasUjRq3l5zn9-wA0Sz2E-42F0jAkx1hd7-bv0ad48/edit?usp=sharing')
    .addAnswer(['¿Te gustaría realizar tu pedido a un vendedor?',
        'Respondé: PEDIDO para brindarte asesoramiento.'
    ],
        { capture: true }, (ctx, { fallBack, endFlow }) => {
            if (ctx.body.toLowerCase() == 'pedido') {
                return endFlow('En el siguiente link podrás ingresar al catálogo de WP para armar un carrito con tu pedido Ver la solicitud del pedido y enviarla a un vendedor: https://wa.me/c/5493537311506')
            }
            else if (ctx.body.toLowerCase() == 'no') {
                return endFlow('Nos gustaría resolver tus dudas mediante una comunicación personalizada con un vendedor. En el siguiente link abrirás un chat directo con un vendedor: https://wa.link/duuzm8')
            }
            else return fallBack('Por favor, ingrese una palabra válida')
        }
    );
    

const main = async () => {
    const adapterFlow = createFlow([mensajeBienvenida, productos, contactarnos, nuestraHistoria, solucionarInconveniente, mat, bandaLatex, bandaTpe, kit5Bandas, bandaResistencia, bandaTela, soga, guantes, rueda, media, documento, localizacion, audio, flow_masivo, mayorista, idleFlow])
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

    adapterProvider.server.post('/uploadExcel', async (req, res) => {
        const form = formidable();
    
        form.parse(req, (err, fields, files) => {
            if (err) {
                console.error('Error procesando la subida:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: false, message: 'Error procesando la subida' }));
            }
        
            console.log('Archivos recibidos:', files);  // Esto debería mostrar todos los archivos recibidos
            const filePath = files.excelFile ? files.excelFile[0]?.filepath : null;  // Asegúrate de acceder a la propiedad correcta
            
            if (!filePath) {
                console.error('No se ha recibido el archivo');
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: false, message: 'No se ha recibido el archivo' }));
            }
            
            console.log('Archivo recibido con éxito, ruta:', filePath);
        
            // Proceder con la lectura del archivo
            try {
                const phoneNumbers = readNumbersFromExcel(filePath);  // Lógica para leer números del archivo
                sendBulkMessages(phoneNumbers)  // Enviar mensajes en masa
                    .then(() => {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true, message: 'Archivo procesado y mensajes enviados' }));
                    })
                    .catch((error) => {
                        console.error('Error enviando mensajes:', error);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, message: 'Error enviando mensajes' }));
                    });
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
