FROM node

WORKDIR /app

COPY . /app

RUN yarn install

EXPOSE 8989

CMD ["server"]