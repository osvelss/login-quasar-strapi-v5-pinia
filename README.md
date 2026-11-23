# Login Quasar Strapi v5 - Pinia (login-quasar-strapi-v5-credentials-include-pinia-ofetch)

Este repositorio contiene una aplicación de inicio de sesión creada con **Quasar** y Vue, integrada con **Strapi v5** como backend. **Pinia** se utiliza para gestionar el estado de autenticación y **ofetch** para comunicarse con la API. Las solicitudes incluyen credenciales para que el navegador pueda enviar cookies de sesión.

El flujo de autenticación también detecta respuestas **401**, renueva la sesión (*refresh*) y reintenta la petición original.

## Tecnologías y propósito

- **Quasar**: framework utilizado para construir la interfaz de usuario.
- **Strapi v5**: backend que proporciona la API y los servicios de autenticación.
- **Pinia**: almacén para compartir y gestionar el estado de la aplicación.
- **ofetch**: cliente HTTP usado para enviar solicitudes al backend.
- **Credenciales incluidas**: permite enviar cookies con las solicitudes, según la configuración del backend.

## Install the dependencies

```bash
pnpm install
# or: yarn/npm/bun install
```

### Start the app in development mode (HMR, error reporting, etc.)

```bash
quasar dev
```

### Format & Lint the files

```bash
pnpm run lint
# or: yarn/npm/bun run lint
```

...or just check formatting & linting:

```bash
pnpm run lint:check
# or: yarn/npm/bun run lint:check
```

### Build the app for production

```bash
quasar build
```

### Customize the configuration

See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-file).
