# 🧠 Translation System

Sistema de tradução de textos baseado em microsserviços com comunicação assíncrona via **RabbitMQ**, utilizando **Node.js**, **Express**, **SQLite** e **Google Gemini** para realizar traduções automáticas.

---

## 📦 Estrutura do Projeto

```bash
translation-system/
├── docker-compose.yml
├── translation-api/           # Serviço de API REST
│   ├── index.js               # Inicialização da API
│   ├── controllers/           # Lógica das rotas
│   ├── db/                    # Banco de dados SQLite
│   └── ...
├── translation-worker/        # Serviço Worker que consome a fila
│   ├── index.js
│   ├── services/
│   │   ├── queueService.js
│   │   └── geminiService.js
│   ├── db/database.js
└── README.md

🚀 Tecnologias Utilizadas
Node.js

Express.js

SQLite (via better-sqlite3)

RabbitMQ

Google Gemini API

Docker & Docker Compose

⚙️ Como Executar

✅ Pré-requisitos

Docker + Docker Compose instalados

Chave da API Gemini (Google AI Studio)

.env configurado no diretório translation-worker/

📂 Configuração do .env
Crie um arquivo .env dentro de translation-worker/ com o seguinte conteúdo:

GEMINI_API_KEY=sua_chave_aqui

▶️ Executar o Projeto

No diretório raiz (translation-system/), execute:

docker-compose up --build

Aguarde a inicialização e acesse a API via:

http://localhost:3000


📨 Como Funciona?
O cliente faz uma requisição POST /translate com um texto e idioma de destino.

A API salva o pedido no banco (status: pending) e envia para a fila translation_queue no RabbitMQ.

O Worker escuta a fila, traduz o texto via Gemini API e atualiza o status no banco.

O cliente pode consultar o status com GET /translate/:requestId.

🔀 Exemplo de Uso

POST /translate
Content-Type: application/json

{
  "text": "Hello world",
  "targetLanguage": "pt"
}

Resposta:


{ "requestId": "123e4567-e89b-12d3-a456-426614174000" }

Consultar Status

GET /translate/123e4567-e89b-12d3-a456-426614174000


🐳 RabbitMQ Dashboard

Gerencie a fila acessando:


http://localhost:15672
Usuário: guest

Senha: guest

🧑‍💻 Autor
Desenvolvido por Victor Hugo das Neves de Jesus
GitHub