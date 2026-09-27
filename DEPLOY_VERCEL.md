# Despliegue en Vercel

El proyecto está preparado como sitio estático con funciones serverless en `api/csrf.js` y `api/contact.js` para proteger el formulario y enviar las consultas mediante Resend.

## 1. Preparar Resend

1. Crea una cuenta en Resend.
2. Agrega y verifica tu dominio de envío siguiendo los registros DNS indicados por Resend.
3. Crea una API key con permiso para enviar correos.
4. El remitente debe pertenecer al dominio verificado, por ejemplo: `ÉLITE Event's Iquitos <contacto@tudominio.com>`.

## 2. Importar el repositorio

1. En Vercel selecciona **Add New → Project**.
2. Importa `Silent343/wedding-landing-page` desde GitHub.
3. Usa **Other** como Framework Preset.
4. Mantén la raíz del proyecto como `./`.
5. No configures Build Command ni Output Directory: Vercel servirá los archivos estáticos desde la raíz y detectará la función dentro de `api/`.

## 3. Variables de entorno

En **Project Settings → Environment Variables**, agrega estas variables para Production y Preview:

| Variable | Ejemplo | Obligatoria |
| --- | --- | --- |
| `RESEND_API_KEY` | `re_xxxxxxxxx` | Sí |
| `CONTACT_FROM` | `ÉLITE Event's Iquitos <contacto@tudominio.com>` | Sí |
| `CONTACT_TO` | `Andrea.torres.salas@outlook.com` | Sí |
| `RATE_LIMIT_SECRET` | una cadena aleatoria de al menos 32 caracteres | Recomendada |
| `CSRF_SECRET` | otra cadena aleatoria de al menos 32 caracteres | Recomendada |
| `ALLOWED_ORIGINS` | `https://tudominio.com,https://www.tudominio.com` | Opcional |

Nunca agregues la API key al repositorio, a `main.js` ni a un archivo HTML.

## 4. Desplegar y verificar

1. Ejecuta el primer deploy.
2. Abre la URL generada por Vercel y envía una consulta de prueba.
3. Comprueba que el correo llegue a `CONTACT_TO` y que Resend muestre el envío como entregado.
4. Revisa **Vercel → Logs → Functions** si el formulario devuelve un error.
5. Cada cambio en las variables de entorno requiere un nuevo deploy para aplicarse.

## Seguridad del formulario

Las funciones emiten y validan un token CSRF firmado, verifican el origen, el tipo y tamaño de la solicitud, todos los campos, el consentimiento y el honeypot; escapan el contenido incluido en el correo, aplican un límite de cinco solicitudes cada diez minutos por instancia y nunca exponen la API key al navegador.

El límite incluido reduce abuso básico. Para un límite global entre todas las instancias serverless, configura además una regla de rate limiting para `/api/contact` en Vercel Firewall o conecta un almacén persistente compatible.
