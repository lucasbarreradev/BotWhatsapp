import { EVENTS, addKeyword } from '@builderbot/bot'

// Objeto para almacenar los temporizadores de cada usuario
const timers = {};

// Flujo para manejar la inactividad
const idleFlow = addKeyword(EVENTS.ACTION).addAction(
    async (_, { endFlow }) => {
        return endFlow("");
    }
);

// Función para iniciar el temporizador de inactividad para un usuario
const start = (ctx, gotoFlow, ms) => {
    timers[ctx.from] = setTimeout(() => {
        console.log(`User timeout: ${ctx.from}`);
        return gotoFlow(idleFlow);
    }, ms);
};

// Función para reiniciar el temporizador de inactividad para un usuario
const reset = (ctx, gotoFlow, ms) => {
    stop(ctx);
    if (timers[ctx.from]) {
        console.log(`Reset countdown for the user: ${ctx.from}`);
        clearTimeout(timers[ctx.from]);
    }
    start(ctx, gotoFlow, ms);
};

// Función para detener el temporizador de inactividad para un usuario
const stop = (ctx) => {
    if (timers[ctx.from]) {
        console.log(`Stop countdown for the user: ${ctx.from}`);
        clearTimeout(timers[ctx.from]);
    }
};

export {
    start,
    reset,
    stop,
    idleFlow,
};
