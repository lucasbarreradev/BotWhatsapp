import OpenAI from "openai";

const typing = async function (ctx, provider) {
    if (provider && provider?.vendor && provider.vendor?.sendPresenceUpdate) {
        const id = ctx.key.remoteJid
        await provider.vendor.sendPresenceUpdate('composing', id)
    }
}
const recording = async function (ctx, provider) {
    if (provider && provider?.vendor && provider.vendor?.sendPresenceUpdate) {
        const id = ctx.key.remoteJid
        await provider.vendor.sendPresenceUpdate('recording', id)
    }
}

const BASE_DE_DATOS = `
📌 Información sobre GymGenius",
    "Somos una empresa importadora argentina especializada en equipamiento deportivo y de yoga. Ofrecemos productos premium diseñados para mejorar tu rendimiento y bienestar. Realizamos envíos rápidos y ofrecemos métodos de pago seguros.",

    "📦 Métodos de envíos",
    "- Retiro en depósito: Ciudadela, Buenos Aires (Falucho 856, de 9hs a 16hs). Solo take away. 
    "- Utilizamos correo argentino pero podemos enviar con el proveedor que más cómodo te parezca
    "- Medidas estándar de paquetes: 30x30x5 cm (para 10 bandas aprox.).",Se cotiza junto a la cotización del pedido
    "📦 Métodos de pago
- Pagos en efectivo en depósito o algún punto en común o transferencia.",
"- Pago en cuotas: Solo por la web. consultar por cupón de descuento al ser compra mayorista",
    
    "🛒 Productos disponibles",
Para entrenamiento y rehabilitación: 

    "- Banda de alta resistencia: Elevá tu entrenamiento con nuestra Banda GymGenius. Fabricada en látex de alta calidad. Medidas: 208 cm x 0.45 cm. Espesor: 1.3 cm. Colores: Lila, Negro, Rojo, Verde.",
    "- Bandas de látex: Potenciá tu entrenamiento con nuestras Bandas GymGenius. Diseñadas para ofrecer resistencia y versatilidad. Espesores variados. Colores: Amarillo, Azul, Rojo.",
    "- Bandas de tela: Confeccionadas en nylon y látex. Elasticidad y resistencia garantizadas. Medidas: 66 cm x 7 cm. Colores: Azul y verde.",
    "- Banda TPE de resistencia: Incluye manoplas ergonómicas (12 cm). Longitud: 120 cm. Disponible en tres niveles de resistencia. Colores: Azul, Verde, Negro.",
    "- Kit 5 bandas de látex: 5 niveles de resistencia. Medidas: 25 cm x 5 cm. Espesores: Verde (0.35mm), Azul (0.5mm), Amarillo (0.7mm), Rojo (0.9mm), Negro (1.1mm).",
    "- Rueda para ABS: Agarre ergonómico. Material: Polipropileno y caucho de alta calidad.",
    "- Soga para entrenamiento: Longitud: 277 cm. Recubierta de PVC. Manoplas ergonómicas.",
    "- Guantes para entrenar: Material: Neopreno. Tamaños: S, M, L, XL. Colores: Azul y negro.",
Guantes para mma Color negro ajustables
- Barra para dominadas con varios agarres disponibles color negro encastrable con soporte incluido
- Set de pesas y mancuernas, con 35kg en discos de 1.25,2,2.5kg para usar como barra, mancuernas individuales y pesa rusa, trae guantes de regalo. todo en una caja.
- Expander set: 5 intensidades de bandas con multiples agarres ideales para entrenar pierna por su intensidad y todo el cuerpo
- Pelota de esferodinamia material PVC de 75cm de diámetro color gris
- Soga digital cuenta saltos, Color negra. Podes usar la soga que incluye o el accesorio sin soga con peso no incluye pilas
- Barra de pilates con banda en sus extremos, ergonómica negra encastrable con bolso 
- Toalla de microfibra color gris 80x40
- Toalla de microfibra color rojo 80x40 mayor gramaje
- Pelota de esferodinamia 10kg negra sin pique	
- Tabla desplegable push up para flexxiones con bandas incluidas 
- Topes para barras olímpicas de 50mm encastrables en diferentes longitudes color rojo con doble traba	
- Máquina de box audiorritmica bluethot 

Yoga:

"- Mat NRB 10mm: Base acolchada, antideslizante. Medidas: 183 cm x 61 cm x 10 mm. colores disponibles: Gris, rosa, lila",
- Mat NRB 15mm Base acolchada, antideslizante. Medidas: 183 cm x 61 cm x 10 mm. colores disponibles: Amarillo
- Mat PVC 6mm base acolchada, texturada para mejor agarre. Medidas 173cm x 61cm x 6mm Color disponible: Fucsia
- Mat PU 5mm Línea Premium	Anti deslizante adherente al suelo con doble material.	Diseño de yoga medidas: 183cm x 66cm x 5mm Color marrón claro

    "Mayorista",
    "En el siguiente link podrás ingresar al catálogo de WP para armar un carrito con tu pedido Ver la solicitud del pedido y enviarla a un vendedor: https://wa.me/c/5493537305059", No hay mínimo de compra. El requisito es pago efectivo o por transferencia

    "Historia",
    "Somos una empresa importadora que se caracteriza en desarrollar productos premium de equipamiento deportivo y de yoga al mejor precio del mercado, te brindamos una experiencia transformadora que elevará tu rendimiento y te permitirá encontrar el equilibrio mente-cuerpo que tanto buscás. Al ser importadores directos, podemos ser competitivos con los precios y brindar la posibilidad de distribuir los productos mediante envíos rápidos y métodos de pago confiables en nuestra tienda online y venta directa. ¿Te gustaría hablar con nosotros? https://wa.me/c/5493537305059",

    "🌐 Compra online",
    "Podés ver todos nuestros productos y precios a consumidor final en nuestra tienda online: https://www.gymgenius.com.ar/"`;


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // asegurate de tener esta variable seteada
});

function yaSaludo(history) {
  return history.some(h => {
    return h.role === "assistant" && /hola|buenos días|buenas tardes/i.test(h.parts.map(p => p.text).join(" "));
  });
}

/**
 * Esta función debe ser llamada cuando se ejecute el flujo de la palabra clave.
 * Usa OpenAI para traducir el mensaje al italiano.
 */
async function toAskOpenAI(message, history) {

    const saludoPrevio = yaSaludo(history);
  const messages = [
    {
      role: "system",
      content: `Quiero que actúes como el mejor vendedor del mundo para ofrecer nuestros productos por venta mayorista con la finalidad que nos conozcan y en el caso que el cliente quiera comprar derívalos al WhatsApp mayorista donde una persona recibirá su pedido. No hagas mensajes muy extensos Solo en el caso que esté interesado para eso debes tener una buena comunicación amigable brindando información constantemente de la empresa donde veas que pueda sumar para determinar la decisión de compra.

Trata al usuario con un tono familiar y utiliza jergas Argentinas típicas siempre con respeto. Además reconoce los modos de habla del usuario y adáptate a ellos para ofrecer una respuesta más eficiente. Aclárale que sos un bot con IA cuando necesites y que la compra de los productos la realiza mediante WhatsApp con una persona oficial de la empresa y ofrécele la posibilidad de comunicarte con ese vendedor mediante el link de WhatsApp proporcionado que es este https://wa.me/c/5493537305059. Antes de enviar el link ten una conversación amigable e informativa para conocer el cliente y brindarle toda la info que se pueda de Gymgenius

Ten cuidado, no hagas la conversión final, siempre deriva al vendedor y aclara que la venta es mayorista y los requisitos serían pago efectivo o transferencia.

Utiliza la información de la BASE_DE_DATOS y para los productos actualizados utiliza la información de esta página https://www.gymgenius.com.ar/

${saludoPrevio ? "No saludes, ya saludaste antes." : "Podés saludar."}

${BASE_DE_DATOS}

🗣️ DIRECTRICES PARA RESPONDER:
- Usa el nombre del cliente para personalizar: Ej. "Lucas te recomiendo..."
- Responde en estilo conversacional y breve (menos de 150 caracteres).
- Usa emojis para hacer el mensaje más atractivo.
- No repitas todo el archivo adjunto, solo lo relevante para la consulta.
- No ofrezcas productos que no estén listados.
- No promociones otros sitios o proveedores.`
    },
    ...history.map(h => ({
      role: h.role,
      content: h.parts.map(p => p.text).join(" "),
    })),
    {
      role: "user",
      content: message,
    }
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages,
    temperature: 2,
    top_p: 0.95,
    max_tokens: 1000
  });

  const italian = response.choices[0].message.content;
  console.log(`>>>>>>>>>> ${italian}`);
  return italian;
}



export { typing, recording, toAskOpenAI }