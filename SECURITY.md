# Seguridad y despliegue

## Superficie de red

El servidor escucha en `127.0.0.1:4173` de forma predeterminada. En producción debe permanecer en loopback detrás de un proxy inverso como Caddy, Nginx o un proveedor serverless.

- Expón públicamente únicamente `80/tcp` para redirigir y `443/tcp` para HTTPS.
- No expongas `4173/tcp` a Internet.
- Configura TLS, HSTS y renovación automática de certificados en el proxy.
- Define `SITE_ORIGIN` con el origen HTTPS exacto.
- Usa `TRUST_PROXY=true` solamente cuando controles el proxy que establece `X-Forwarded-For`.

La aplicación no puede cerrar ni proteger otros puertos del sistema operativo. Esa configuración pertenece al firewall y a la infraestructura del servidor.

## Datos y correo

- Copia `.env.example` como `.env` y completa los valores reales.
- No subas `.env` al repositorio.
- Crea una API key de Resend limitada al dominio emisor y rótala si se expone.
- El endpoint no persiste consultas: valida, limita y reenvía el contenido a Resend.
- Para varias instancias, reemplaza el rate limit en memoria por Redis/Upstash compartido.

## Controles incluidos

- CSP y cabeceras defensivas.
- Comprobación de origen y token CSRF SameSite.
- Límite de 5 solicitudes por IP cada 15 minutos por defecto.
- Tamaño máximo de body, honeypot y tiempo mínimo de llenado.
- Validación estricta en servidor y escape HTML antes de enviar a Resend.
- Servidor estático sin listado de directorios ni acceso a archivos internos.
