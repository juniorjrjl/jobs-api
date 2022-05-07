# API desenvolvida no curso Black do OneBitCode

Api de vagas de emprego

![technology Node](https://img.shields.io/badge/techonolgy-Node-success)
![technology Postgres](https://img.shields.io/badge/techonolgy-Postgres-blue)
![techonolgy Express](https://img.shields.io/badge/techonolgy-Express-brightgreen)

## Getting Started

## Pré-requisitos

- Docker
- Docker-compose

## Executando a aplicação

rode o seguinte comando no terminal:

```
docker-compose up
```

## Criação do banco e inserindo dados iniciais

para criar as tabelas execute as migrations rodando o seguinte comando:

```
docker-compose run --rm app npx sequelize-cli db:migrate
```

para popular o banco com os dados iniciais execute o seguinte comando:

```
docker-compose run --rm app  npx sequelize-cli db:seed:all
```