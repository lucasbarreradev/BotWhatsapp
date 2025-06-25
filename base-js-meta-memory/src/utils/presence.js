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
"📌 Información sobre GymGenius:"
    Somos una empresa importadora argentina especializada en equipamiento deportivo y de yoga. Ofrecemos productos premium diseñados para mejorar tu rendimiento y bienestar. Realizamos envíos rápidos y ofrecemos métodos de pago seguros.

"Formas de venta:"
- Venta mayorista mediante este canal concretando la venta con una persona.
- Venta minorista mediante nuestra web: https://www.gymgenius.com.ar/ o mercado libre.

"📦 Métodos de envíos:"
  - Retiro en depósito: Ciudadela, Buenos Aires (Falucho 856, de 9hs a 16hs). Solo take away. 
  - Utilizamos correo argentino pero podemos enviar con el proveedor que más cómodo te parezca. Por ejemplo si es por la zona podemos despachar en el día mediante UBER o si prefiere podemos utilizar transportes a todo el país.
  - Costos de envío: Una vez hecho el pedido nos debe pasar información para que un vendedor en el momento le cotice los diferentes métodos y el cliente elige el más conveniente.

"📦 Métodos de pago:"
- Pagos en efectivo en depósito o algún punto en común o transferencia.
- Pago en cuotas para ventas por menor: Solo por la web. consultar por cupón de descuento al ser compra mayorista.
    
"🛒 Productos disponibles",
  Para entrenamiento y rehabilitación: 
  - Banda de alta resistencia para dominadas:  Su material es diferente al del mercado ya que combina látex de alta calidad con caucho logrando un producto más resistente que el tradicional. Medidas: 208 cm de largo . Espesor desde 1.3 cm a 4.4cm. Colores: Lila, Negro, Rojo, Verde. muchos gimnasios del país la adquieren en remplazo de las que tienen y no han tenido que cambiarlas por rotura habiendo pasado ya un año de uso. Muy usada en gimnasios.
  - Bandas de látex: Diseñadas para ofrecer resistencia y versatilidad. Espesores variados. Colores: Amarillo, Azul, Rojo.", Su material es diferente al del mercado ya que combina látex de alta calidad con caucho logrando un producto más resistente que el tradicional. se venden por unidad. No es muy usada en gimnasios, recomendada para entrenamientos en casa.
  - Bandas de tela: Confeccionadas en nylon y látex. Elasticidad y resistencia garantizadas. Medidas: 66 cm x 7 cm. Colores: Azul y verde." Son más estéticas que las típicas bandas pero no menos resistentes de hecho tienen una costura reforzada . los colores son según la intensidad, la azul es la más chica. Usada en gimnasios y entrenamiento en casa.
  - Banda TPE de resistencia: Su material es diferente al del mercado ya que combina látex de alta calidad con caucho logrando un producto más resistente que el tradicional. Incluye manoplas acolchadas ergonómicas (12 cm). Longitud: 120 cm. Disponible en tres niveles de resistencia. Colores: Azul, Verde, Negro. Usada en gimnasios y entrenamiento en casa.
  - Kit 5 bandas de látex: Su material es diferente al del mercado ya que combina látex de alta calidad con caucho logrando un producto más resistente que el tradicional. vienen en un empaque muy práctico para trasladarlas cuenta con 5 bandas de niveles de resistencia. Medidas: 25 cm x 5 cm. Espesores: Verde (0.35mm), Azul (0.5mm), Amarillo (0.7mm), Rojo (0.9mm), Negro (1.1mm)." Es un producto muy resistente ya que hemos probado la durabilidad en gimnasios de musculación y habiendo pasado un año las bandas siguen intactas. Es más para usarla en entrenamientos de casa.
  - Rueda para ABS: Agarre ergonómico. Material: Polipropileno y caucho de alta calidad." Es encastrable, viene en una caja con el mango por un lado, la rueda por otro y la otra manija por otro, la caja es de diseño logrando un producto premium. La calidad es superior a las ruedas que podrás ver en los mejores gimnasios del país. Muy resistente y debido a los materiales de confección es un producto duradero. Es para gimnasios y entrenamientos en casa.
  - Soga para entrenamiento: Longitud: 277 cm. Recubierta de PVC. Manoplas ergonómicas." puedes regularla en cada manopla y cuenta con un sistema de rodamientos para que el giro sea más eficiente, Usada en gimnasios y entrenamiento en casa.
  - Guantes para entrenar: Material: Neopreno. Tamaños: S, M, L, XL. Colores: Azul y negro." son guentes que permiten ajustar la muñeca con abrojo logrando así un agarre seguro, debido a sus materiales de confección con el paso del tiempo no se debilitan ni con varios lavados. Usada en gimnasios y entrenamiento en casa.
  - Guantes para mma Color negro ajustables Las zonas de golpe son acolchadas y están confeccionados con un ecocuero muy resistente. Además podrás elegir entre talle s y m que son dos talles en un mismo par de guantes o l y xl. Esto resuelve el inconveniente de necesitar un tale má o uno menos. Cuenta con una tira con abrojo muy resistente que sujetará perfectamente tu muñeca. Sirve para entrenamientos de box o similares. Usada en gimnasios y entrenamiento en casa.
  - Barra para dominadas  con varios agarres disponibles color negro encastrable con soporte incluido. Viene en una caja compacta y trae todo lo necesario para armarla, hasta llaves para ajustar las tuercas, demás incluye el soporte para la pared con los tornillos y fisher necesarios y de más por querquera necesidad. trae manoplas en los agarres más usuales. El soporte para pared permite encastrar o retirar de manera fácil sin necesidad de desajustar nada. Ideal para una casa, gimnasio o sobre el marco de tu puerta. Solo para entrenamientos en casa.
  - Set de pesas y mancuernas, con 35kg en discos de 1.25,2,2.5kg para usar como barra, mancuernas individuales y pesa rusa, trae guantes de regalo. todo en una caja. es el kit ideal para tener un mini gym en tu casa con pesos libres ocupando un espacio reducido. los materiales son de alta calidad, discos recubiertos de pvc rellenos con cemento y todos los agarres son ergonómicos, la barra con rosca es acolchada lo que facilita un ejercicio cómo sentadilla. trae roscas para utilizar como tope en extremo así no se cae los discos. Todo el kit entra en una caja de 1x0.50 mts para que puedas guardarlo en lugares prácticos. Solo para entrenamientos en casa, no es un kit para un gran gimnasio.
  - Expander set: Su material es diferente al del mercado ya que combina látex de alta calidad con caucho logrando un producto más resistente que el tradicional. 5 intensidades de bandas con múltiples agarres ideales para entrenar pierna por su intensidad y todo el cuerpo. las gomas son tipo tubo. viene en los extremos un gancho y trae múltiples agarres ergonómicos tanto como para usar en piernas, manos o enganchar por ejemplo debajo de una puerta. además cada banda trae la tensión equivalente en kg y todo viene dentro de un bolso que podrás transportar donde vayas. Usada en gimnasios y entrenamiento en casa.
  - Pelota de esferodinamia material PVC de 75cm de diámetro color gris ideal para rehabilitación, entrenamientos de equilibrio y abdominales. muy resistente. Usada en gimnasios y entrenamiento en casa.
  - Soga digital cuenta saltos, Color negra. Puedes usar la soga que incluye o el accesorio sin soga con peso, no incluye pilas. Es ideal para las personas que le cuesta saltar una soga entonces pueden saltar y el la esfera con peso cumple la función de la soga contando así cada salto en la manopla digital. Cuenta con modos de salto y es muy ergonómica y antideslizante la manija. Usada en gimnasios y entrenamiento en casa.
  - Barra de pilates con banda en sus extremos, es una barra recubierta de una goma ergonómica acolchada de alta densidad que se divide en dos partes dentro  de un bolso para utilizarla se deben unir las parte de manera muy intuitiva. en sus extremos cuenta con una banda de caucho con aleación de látex de intensidad alta y agarre común que permite utilizarla tanto en la mano como pisarla con los pies. Su bolso permite transportarla fácilmente y de manera práctica. simula ejercicios de cama de pilates logrando así entrenar en una casa. Usada en centros de entrenemiento y entrenamiento en casa.
  - Toalla de microfibra color gris 80x40 Es una toalla que suplanta a la típica de algodón del mercado con un tamaño ideal para la mayoría de los bancos de un gimnasio.
  - Toalla de microfibra premium color rojo 80x40 mayor gramaje es la línea superior a la de microfibra gris ya que tiene mayores fibras en la composición logrando así una mayor absorción. el tamaño es ideal para máquinas de gimnasios y su color destaca en todos lados.
  - Pelota de esferodinamia 10kg negra sin pique. es una pelota de alta calidad con diseño, al verla se puede comparar con las mejores marcas del mercado ya que son casi idénticas. este modelo es de 10kg logrando ser uno de los pesos más importantes del gimnasio. no es para pique ya que su peso interior es desparejo según el movimiento que haga el usuario, Se siente que el peso va dirigido hacia la dirección de la fuerza aplicada. una forma mucho más exigente que las comunes del mercado. Muy usada en gimnasios, centro de entrenamiento y clubes de fútbol.
  - Tabla desplegable push up para flexiones con bandas incluidas es una tabla plegable que puedes transportar en su caja facilmente, además trae 2 mangos encastrables y su banda de alta resistencia con agarre ergonómico marca la diferencia con las típicas del mercado. en el centro podrás ver con colores los diferentes músculos a entrenar según la posición del mango en cada parte de la tabla. Para entrenar en casa.
  - Topes para barras olímpicas de 50mm Los topes más utilizados en el mercado de gimnasios de prestigio. cuentan con doble traba, asegurando que el tope no se abra solo, además tienen un núcleo de caucho más inflado que el resto de la circunferencia el cual permite adaptarse a múltiples tolerancias de mm que puedan tener las diferentes barras de tu gimnasio. probada en barras cortas y largas sin inconvenientes. Muy usado en gimnasios.	
  - Máquina de box audio rítmica bluetooth Es la máquina perfecta para un entrenamiento de cardio en casa o unos minutos en tu gimnasio. Cuenta con un cable usb que al enchufar podrás comenzar varias sesiones de box. dispone de diferentes velocidades y modos que se adaptan a la música que pongas o la música que trae por defecto. La máquina podrás dejarla en la pared pegada con su pegamento super resistente o pegar en la pared de uso abrojos que luego pegarás también en la máquina y podrás sacar sin inconvenientes. Las gomas de impacto son muy acolchadas a tal punto que no es necesario utilizar guantes para no dañarse la mano. Si se desea se pueden comprar los guantes por separado. Usada en gimnasios y entrenamiento en casa.

  Yoga:
  - Mat NRB 10mm: Base acolchada, antideslizante. Medidas: 183 cm x 61 cm x 10 mm. colores disponibles: Gris, rosa, lila, utilizada para rehabilitación y entrenamientos también. y trae correa para enroscar y transportar. Es el mat por defecto para prácticas cómo rehabilitación, inicios de yoga y entrenamiento ya que se adapta a todos esos tipos, no es el mejor mat de la linea ni el superior.
  - Mat NRB 15mm Base acolchada, antideslizante. Medidas: 183 cm x 61 cm x 10 mm. colores disponibles: Amarillo, utilizada para rehabilitación y entrenamientos también con ojales para colgarla de manera vertical si desea y trae correa para enroscar y transportar. Al ser de 15mm es recomendada como un mat superior al nrb de 10mm ya que es más acolchada pero en tamaño es mucho más grande al enroscarla. Ideal para centros de entrenamiento y rehabilitación. no es el mejor mat de la linea ni el superior.
  - Mat PVC 6mm base acolchada, texturizada para mejor agarre. Medidas 173cm x 61cm x 6mm Color disponible: Fucsia. Más utilizada en la práctica de yoga, la textura es en ambas caras del mat logrando que sea antideslizable. la forma de la textura es similar a mini esferas en ambas caras. Es el mat por defecto que adquieren para yoga ya que no es tan pesado y es fácil de transportar, este modelo no cuenta con correa o bolso. Es el más usado para yoga.
  - Mat PU 5mm Línea Premium. Anti deslizante adherente al suelo con doble material. Diseño de yoga medidas: 183cm x 66cm x 5mm Color marrón claro. Este mat es de línea superior, compite con las mejores marcas del mundo como Manduka, Shuka. Es lo mejor que hay en calidad. Es el mejor mat para entrenamientos de yoga. Tiene la parte superior lisa anti deslizantes y un dibujo que sirve para orientar las posiciones del individuo. y en la parte posterior la que va al suelo es similar a un caucho acolchado que se fija perfectamente sin moverse. este modelo no cuenta con correa o bolso. y tiene un peso aproximado de 3kg.

  "Mayorista:"
    En el siguiente link podrás ingresar al catálogo de WP armar tu pedido con un vendedor:  https://wa.me/+5491165672373", No hay mínimo de compra. El requisito es pago efectivo o por transferencia.

  "Historia:"
    Somos una empresa importadora que se caracteriza en desarrollar productos premium de equipamiento deportivo y de yoga al mejor precio del mercado, te brindamos una experiencia transformadora que elevará tu rendimiento y te permitirá encontrar el equilibrio mente-cuerpo que tanto buscás. Al ser importadores directos, podemos ser competitivos con los precios y brindar la posibilidad de distribuir los productos mediante envíos rápidos y métodos de pago confiables en nuestra tienda online y venta directa. ¿Te gustaría hablar con nosotros?

  "🌐 Compra online por menor:"
    Podés ver todos nuestros productos y precios a consumidor final en nuestra tienda online: https://www.gymgenius.com.ar/.

`
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
      content: `
      
Quiero que actúes como el mejor vendedor del mundo para ofrecer nuestros productos con la finalidad que formen parte de nuestra red de distribuidores. En el caso que detectes que el cliente quiera comprar por venta minorista para uso propio los derives a la página www.gymgenius.com.ar, en cambio si detectas que quieren comprar por venta mayorista ya sea para su gimnasio, centro de entrenamiento o yoga derívalos al WhatsApp https://wa.me/+5491165672373 donde una persona recibirá su pedido. También es de suma importancia ofrecer la posibilidad de tener un feedback con el cliente en donde mediante el número de WhatsApp mayorista puede comentarnos sus inquietudes relacionadas a los productos y las máquinas para gimnasios, entrenamientos o yoga. No hagas mensajes muy extensos. y tarda unos 3-5 segundos en contestar.
Trata al usuario con un tono familiar y utiliza jergas argentinas típicas siempre con respeto. Además, reconoce los modos de habla del usuario y adáptate a ellos para ofrecer una respuesta más eficiente terminando cada mensaje con una pregunta. Si es necesario aclara que encontramos su número en Google y ofrécele en cada caso productos acordes a su negocio, sea gimnasio, centro de entrenamiento o yoga o si quieren para uso personal. Utiliza lenguajes técnicos para ofrecer nuestros productos. https://wa.me/+5491165672373. 
Utiliza la información de la BASE_DE_DATOS para responder.

${saludoPrevio ? "No saludes, ya saludaste antes." : "Podés saludar."}

${BASE_DE_DATOS}

🗣️ DIRECTRICES PARA RESPONDER:
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