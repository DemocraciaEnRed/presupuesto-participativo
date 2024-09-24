![Header](./docs/der-logo.png)

# Presupuestos Participativos

![Node Version](<https://img.shields.io/badge/node-v8(!)-red>)
![Documentation](https://img.shields.io/badge/docs-available-brightgreen)
![License](https://img.shields.io/github/license/DemocraciaEnRed/presupuesto-participativo)
![Docker](https://img.shields.io/badge/docker-ready-blue)
![Version](https://img.shields.io/github/v/release/DemocraciaEnRed/presupuesto-participativo)

Herramienta digital de participación ciudadana para gobiernos e instituciones, que permite a los usuarios comentar, votar, jerarquizar, optar entre opciones, o establecer grados de valoración entre temas públicos.

## ⚒️ Guía de instalación y ejecución

Hay 2 maneras de preparar el entorno para desarrollo. A través de Docker, o configurando el entorno de Node

### Docker

> #### ⚠️ Prerequisito
>
> Este entorno virtual requiere de tener [Docker](https://docs.docker.com/) instalado

#### Instalación

Abrí una terminal del sistema en el directorio raiz del proyecto y construí la imagen de docker

```bash
$ docker compose build
```

#### Ejecución

Abrí una terminal del sistema en el directorio raiz del proyecto y ejecutá la imagen en un contenedor

```bash
$ docker compose up
```

### Entorno de Node

> #### ⚠️ Prerequisitos
>
> Este entorno virtual requiere de:
>
> - [Node.js v8.0.0](https://nodejs.org/en/blog/release/v8.0.0/). Lamentablemente el software unicamente funciona bien hasta esta versión de Node
> - [Node Version Manager (NVM)](https://github.com/creationix/nvm): Script de bash simple para administrar múltiples versiones activas de node.js

#### Instalación

Abrí una terminal del sistema en el directorio raiz del proyecto, utilizá nvm para indicar que vas a usar node v8 e instalá las dependencias del proyecto y ejecutá la plataforma

```bash
$ nvm use v8
$ npm install
```

#### Ejecución

Abrí una terminal del sistema en el directorio raiz del proyecto y ejecutá el archiv `run-dev.sh`

```bash
$ ./run-dev.sh
```

## 👷‍♀️ Cómo colaborar

Las contribuciones siempre son bienvenidas. Si te interesa contribuir a este proyecto y no estás seguro de por dónde empezar, preparamos esta [guía de colaboración](https://github.com/DemocraciaEnRed/.github/blob/main/docs/CONTRIBUTING.md).

## 📖 Documentación

Consulta la [documentación y estado del software](./docs) para obtener información detallada sobre el proyecto, estructura de archivos, y otros aspectos importantes.

## ⚖️ Licencia

El software se encuentra licensiado bajo [GPL-v3](./LICENSE). Creemos en la importancia del código abierto para la transformación social y fomentamos que la comunidad aporte de manera activa.

---

⌨️ con ❤️ por [DER](https://github.com/DemocraciaEnRed/)
