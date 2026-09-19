# ÉLITE Event's Iquitos

Landing de bodas y eventos con portafolio filtrable, formulario protegido y envío transaccional preparado para Resend.

## Desarrollo local

Requiere Node.js 20.12 o superior.

```bash
npm install
npm run dev
```

La aplicación queda disponible únicamente en `http://127.0.0.1:4173`.

## Configurar Resend

1. Copia `.env.example` como `.env`.
2. Verifica el dominio remitente en Resend.
3. Define `RESEND_API_KEY`, `RESEND_FROM` y `CONTACT_TO`.
4. Cambia `SITE_ORIGIN` por el dominio HTTPS final.
5. Ejecuta `npm start` detrás de un proxy inverso HTTPS.

La API key nunca debe aparecer en `index.html`, `main.js` ni en ningún archivo dentro de `assets`.

## Verificaciones

```bash
npm run check
npm audit
```

Para regenerar las imágenes WebP:

```bash
npm run optimize:images
```

Consulta [SECURITY.md](./SECURITY.md) antes de publicar.
