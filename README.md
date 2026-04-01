# 🤖 Chatbot de WhatsApp con IA

## 📑 Descripción
Chatbot desarrollado en Node.js que automatiza la atención de clientes a través de WhatsApp utilizando la API de Meta.

El sistema integra inteligencia artificial mediante OpenAI para generar respuestas dinámicas, manteniendo contexto en la conversación y adaptándose a la intención del usuario.

## ⚙️ Funcionalidades
- 🤖 Respuestas automáticas con IA (OpenAI)
- 💬 Gestión de conversaciones con contexto
- 📊 Envío masivo de mensajes desde archivo Excel
- 🏷 Uso de plantillas de WhatsApp Business
- 🚫 Control de números inválidos o no entregables
- 🔄 Automatización de respuestas según tipo de cliente (mayorista/minorista)
- 🌐 Endpoints HTTP para integración externa
- 🔐 Manejo seguro de credenciales con variables de entorno

## 🛠 Tecnologías
- Node.js
- BuilderBot
- API de WhatsApp (Meta)
- OpenAI API
- Axios
- XLSX
- Formidable
- dotenv

## 📦 Requisitos
- Node.js 18+
- Cuenta en Meta for Developers (WhatsApp API)
- API Key de OpenAI

## 🔑 Variables de entorno (.env)

Crear un archivo `.env` con:
- JWT_TOKEN=
- NUMBER_ID=
- VERIFY_TOKEN=
- OPENAI_API_KEY=
- PORT= 3008

## 🚀 Ejecución
1. Instalar dependencias:
```bash
npm install
```
2. Ejecutar el proyecto
```bash
node index.js
```

## 📊 Envío masivo de mensajes
El sistema permite subir un archivo Excel con contactos que contenga:
- Teléfonos
- Empresa
- Ciudad

Luego procesa el archivo y envía mensajes automáticamente utilizando plantillas configuradas.

## 🌐 Endpoints disponibles
- POST /v1/messages → Envío de mensajes manuales
- POST /v1/register → Registro de usuarios
- POST /v1/blacklist → Gestión de blacklist
- POST /uploadExcel → Carga de Excel para envío masivo

## 🧠 Inteligencia Artificial

El chatbot utiliza OpenAI para:

- Interpretar mensajes del usuario
- Generar respuestas contextuales
- Adaptar el lenguaje según el cliente
- Detectar intención (mayorista o minorista)

## ⚠️ Notas
- No compartir credenciales en el repositorio
- Configurar correctamente los tokens de Meta
- Respetar límites de envío de WhatsApp

## Autor ✒️
**Lucas Barrera**
* [LinkedIn](https://www.linkedin.com/in/lucas-barrera-dev)
