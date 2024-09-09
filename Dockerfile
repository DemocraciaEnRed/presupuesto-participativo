FROM node:8

MAINTAINER Francisco Pensa <francisco@democracyos.io>

RUN npm config set python python2.7

WORKDIR /usr/src

COPY ["package.json", "."]
COPY ["package-lock.json", "."]

ENV NODE_ENV=production \
    NODE_PATH=/usr/src

#para debuggear:
#RUN npm install --verbose
#RUN npm install --quiet
RUN npm ci --quiet

RUN mkdir ext
COPY ["ext/package.json", "ext"]

RUN mkdir bin
COPY ["bin/dos-ext-install", "bin"]

# Para windows habilitar esto:
#RUN sudo apt-get install dos2unix
#RUN sed 's/\r//g' -i bin/dos-ext-install

RUN bin/dos-ext-install --quiet

COPY [".", "/usr/src/"]

COPY ./dos-override/lib/api-v2/topics/csv.js /usr/src/lib/api-v2/topics/csv.js

ENV LOCALE=es \
  ENFORCE_LOCALE=true \
  AVAILABLE_LOCALES=es,en \
  JWT_SECRET= \
  MODERATOR_ENABLED=true \
  MULTI_FORUM=true \
  RESTRICT_FORUM_CREATION=true \
  FORUM_PROYECTOS=proyectos \
  FAVICON=/ext/lib/boot/favicon.ico \
  LOGO=/ext/lib/boot/logo.png \
  LOGO_MOBILE=/ext/lib/boot/logo.png \
  NOTIFICATIONS_MAILER_EMAIL=ParticipaMGP@mardelplata.gob.ar \
  NOTIFICATIONS_MAILER_NAME='Presupuesto Participativo de la Municipalidad General Pueyrredon' \
  ORGANIZATION_EMAIL=ParticipaMGP@mardelplata.gob.ar \
  ORGANIZATION_NAME='Presupuesto Participativo' \
  SOCIALSHARE_SITE_NAME='Presupuesto Participativo de la Municipalidad General Pueyrredon' \
  SOCIALSHARE_SITE_DESCRIPTION='Plataforma de participación ciudadana de de la Municipalidad General Pueyrredon.' \
  SOCIALSHARE_IMAGE=https://cldup.com/xjWy914AyG.jpg \
  SOCIALSHARE_DOMAIN=ParticipaMGP@mardelplata.gob.ar \
  SOCIALSHARE_TWITTER_USERNAME=@munimardelplata \
  TWEET_TEXT={topic.mediaTitle} \
  HEADER_BACKGROUND_COLOR=#ffffff \
  HEADER_FONT_COLOR=#4a4949

RUN npm run build -- --minify

EXPOSE 3000

CMD ["node", "."]
