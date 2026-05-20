# 🏥 Hospital Management System

Sistema completo de gestão hospitalar com frontend React e backend Java Spring Boot. Projetado para atender clínicas e hospitais de pequeno a médio porte com módulos de agendamento, prontuário eletrônico, prescrições, controle de leitos e faturamento.

---

## 📋 Índice

- [Arquitetura](#-arquitetura)
- [Modelagem de Dados (ERD)](#-modelagem-de-dados-erd)
- [Fluxo de Agendamento](#-fluxo-de-agendamento)
- [Stack Tecnológica](#-stack-tecnológica)
- [Segurança e RBAC](#-segurança-e-rbac)
- [Endpoints da API](#-endpoints-da-api)
- [Quick Start](#-quick-start)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Compliance](#-compliance)
- [CI/CD](#-cicd)
- [Licença](#-licença)

---

## 🏗️ Arquitetura

```mermaid
graph TB
    subgraph Frontend
        REACT[React 18 + TypeScript]
        MUI[Material-UI 5]
        RTC[react-big-calendar]
        AXIOS[Axios HTTP Client]
    end

    subgraph Backend
        API[Spring Boot REST API]
        SEC[Spring Security + JWT]
        JPA[JPA / Hibernate]
        QRTZ[Quartz Scheduler]
        PDF[iText PDF Generator]
    end

    subgraph Database
        PG[(PostgreSQL 16)]
    end

    subgraph Infra
        DKR[Docker Compose]
        NGINX[Nginx Reverse Proxy]
    end

    USER[Usuário] -->|Browser| NGINX
    NGINX -->|/api/*| API
    NGINX -->|/*| REACT
    REACT --> AXIOS --> API
    API --> SEC
    API --> JPA --> PG
    API --> PDF
    QRTZ -->|emails| SMTP
```

### Diagrama de Containers (Docker)

```mermaid
graph LR
    subgraph Docker Network
        PG[postgres:16-alpine<br/>5432] -->|healthcheck| PG_HC[Healthy]
        API[hospital-backend<br/>8080] -->|JDBC| PG
        WEB[hospital-frontend<br/>80/3000] -->|HTTP| API
    end

    style PG fill:#336791,color:#fff
    style API fill:#6DB33F,color:#fff
    style WEB fill:#61DAFB,color:#000
```

---

## 📊 Modelagem de Dados (ERD)

```mermaid
erDiagram
    User ||--o{ Appointment : "doctor"
    Patient ||--o{ Appointment : ""
    Patient ||--o{ MedicalRecord : ""
    Patient ||--o{ Prescription : ""
    Patient ||--o{ Invoice : ""
    Patient ||--o{ Bed : "occupies"
    MedicalRecord ||--o{ Attachment : ""
    Prescription ||--o{ PrescriptionItem : ""
    Invoice ||--o{ InvoiceItem : ""

    User {
        bigint id PK
        varchar email UK
        varchar password
        varchar name
        varchar phone
        varchar cpf UK
        enum role "ADMIN | DOCTOR | PATIENT | NURSE"
        varchar specialty
        varchar crm UK
        boolean active
        timestamp created_at
        timestamp updated_at
    }

    Patient {
        bigint id PK
        varchar name
        varchar cpf
        varchar email
        varchar phone
        varchar address
        date birth_date
        varchar gender
        varchar blood_type
        text allergies
        text medical_conditions
        varchar insurance_provider
        varchar insurance_number
        boolean active
        timestamp created_at
        timestamp updated_at
    }

    Appointment {
        bigint id PK
        bigint patient_id FK
        bigint doctor_id FK
        timestamp date_time
        timestamp end_date_time
        enum status "SCHEDULED | CONFIRMED | IN_PROGRESS | COMPLETED | CANCELLED | NO_SHOW"
        text notes
        varchar reason
        timestamp created_at
        timestamp updated_at
    }

    MedicalRecord {
        bigint id PK
        bigint patient_id FK
        bigint doctor_id FK
        text symptoms
        text diagnosis
        text treatment
        text notes
        timestamp record_date
        timestamp created_at
        timestamp updated_at
    }

    Prescription {
        bigint id PK
        bigint patient_id FK
        bigint doctor_id FK
        date issue_date
        date valid_until
        text notes
        timestamp created_at
    }

    PrescriptionItem {
        bigint id PK
        bigint prescription_id FK
        varchar medication_name
        varchar dosage
        varchar frequency
        varchar duration
        text instructions
    }

    Invoice {
        bigint id PK
        varchar invoice_number UK
        bigint patient_id FK
        timestamp issue_date
        timestamp due_date
        timestamp payment_date
        decimal total_amount
        decimal paid_amount
        decimal discount
        enum status "PENDING | PAID | PARTIALLY_PAID | OVERDUE | CANCELLED | REFUNDED"
        enum payment_method "CREDIT_CARD | DEBIT_CARD | CASH | INSURANCE | PIX | BANK_TRANSFER"
        text notes
        timestamp created_at
        timestamp updated_at
    }

    InvoiceItem {
        bigint id PK
        bigint invoice_id FK
        varchar description
        int quantity
        decimal unit_price
        decimal total_price
    }

    Bed {
        bigint id PK
        varchar bed_number
        varchar ward
        varchar room
        enum status "AVAILABLE | OCCUPIED | RESERVED | MAINTENANCE | CLEANING"
        bigint patient_id FK
        timestamp occupied_at
        timestamp created_at
    }

    Attachment {
        bigint id PK
        bigint medical_record_id FK
        varchar file_name
        varchar file_type
        bigint file_size
        text file_path
        varchar category
    }
```

---

## 🔄 Fluxo de Agendamento

```mermaid
sequenceDiagram
    actor P as Paciente
    actor R as Recepção
    actor D as Médico
    participant S as Sistema
    participant DB as PostgreSQL
    participant Q as Quartz Scheduler
    participant M as Mail Service

    P->>R: Solicita agendamento
    R->>S: POST /appointments
    S->>DB: Verifica disponibilidade
    DB-->>S: Slots disponíveis
    S->>DB: Cria appointment (SCHEDULED)
    DB-->>S: Appointment criado
    S-->>R: Confirmação

    loop Todos os dias 08:00
        Q->>DB: Busca consultas próximas (24h)
        DB-->>Q: Consultas encontradas
        Q->>M: Envia lembrete ao paciente
    end

    D->>S: GET /appointments
    S-->>D: Lista consultas do dia
    D->>S: Confirma consulta (CONFIRMED)
    D->>S: Inicia consulta (IN_PROGRESS)
    
    alt Cria prontuário
        D->>S: POST /medical-records
        S->>DB: Salva diagnóstico
    end

    alt Prescreve medicação
        D->>S: POST /prescriptions
        S->>DB: Salva receita
        D->>S: GET /prescriptions/{id}/pdf
        S-->>D: Download PDF
    end

    D->>S: Finaliza consulta (COMPLETED)
    S->>DB: Gera fatura (PENDING)
```

---

## 🛠️ Stack Tecnológica

### Frontend

| Tecnologia | Versão | Finalidade |
|------------|--------|------------|
| React | 18.2 | Framework SPA |
| TypeScript | 4.9 | Tipagem estática |
| Material-UI | 5.15 | Design System |
| react-big-calendar | 1.11 | Calendário de consultas |
| Axios | 1.6 | HTTP Client |
| react-router-dom | 6.22 | Roteamento |
| react-toastify | 10.0 | Notificações |
| date-fns | 3.6 | Manipulação de datas |

### Backend

| Tecnologia | Versão | Finalidade |
|------------|--------|------------|
| Java | 17 | Runtime |
| Spring Boot | 3.2.4 | Framework |
| Spring Security | 6.2 | Autenticação/autorização |
| JPA / Hibernate | 6.4 | ORM |
| PostgreSQL | 16 | Banco de dados |
| JWT (jjwt) | 0.12.5 | Tokens |
| iText | 8.0.4 | Geração de PDF |
| Quartz Scheduler | 2.3 | Tarefas agendadas |
| Swagger/OpenAPI | 2.5 | Documentação |
| Lombok | 1.18 | Redução de boilerplate |

### Infraestrutura

| Tecnologia | Finalidade |
|------------|------------|
| Docker | Containerização |
| Docker Compose | Orquestração |
| Nginx | Servidor web / proxy reverso |
| GitHub Actions | CI/CD |

---

## 🔒 Segurança e RBAC

### Modelo de Autorização (RBAC)

| Funcionalidade | ADMIN | DOCTOR | NURSE | PATIENT |
|----------------|:-----:|:------:|:-----:|:-------:|
| Gerenciar Usuários | ✅ | ❌ | ❌ | ❌ |
| CRUD Pacientes | ✅ | ✅ | ✅ | ❌ |
| Agendamentos | ✅ | ✅ | ✅ | 👁️ |
| Prontuários | ✅ | ✅ | ✅ | ❌ |
| Prescrições | ✅ | ✅ | ❌ | ❌ |
| Leitos | ✅ | ✅ | ✅ | ❌ |
| Faturamento | ✅ | ❌ | ❌ | 👁️ |
| Relatórios | ✅ | ❌ | ❌ | ❌ |

👁️ = Visualização apenas

### Fluxo de Autenticação

```mermaid
sequenceDiagram
    actor U as Usuário
    participant C as Cliente (React)
    participant API as API Server
    participant DB as Database

    U->>C: Login (email + senha)
    C->>API: POST /auth/login
    API->>DB: Busca usuário
    DB-->>API: User + hash password
    API->>API: Verifica senha (BCrypt)
    API->>API: Gera JWT (access + refresh)
    API-->>C: { accessToken, refreshToken, role }
    C->>C: Armazena tokens (localStorage)

    Note over C,API: Próximas requisições
    C->>API: GET /patients (Bearer token)
    API->>API: Valida JWT
    API->>API: Verifica ROLE
    API-->>C: Dados protegidos

    Note over C,API: Refresh automático
    C->>API: POST /auth/refresh-token
    API-->>C: Novo accessToken
```

### Camadas de Segurança

- **Senhas**: Hash com BCrypt (Spring Security)
- **JWT**: HMAC-SHA384 com chave de 256 bits
- **Tokens**: Access token (24h) + Refresh token (7d)
- **Transporte**: TLS/SSL via Nginx (produção)
- **CORS**: Configurado para múltiplas origens
- **CSRF**: Desabilitado (API stateless com JWT)
- **Validação**: Bean Validation em todas as entradas

---

## 📡 Endpoints da API

### Autenticação
```http
POST /auth/login              # Login
POST /auth/register            # Registro
POST /auth/refresh-token       # Refresh JWT
```

### Pacientes
```http
GET    /patients?page=0&size=10          # Listar (paginado)
POST   /patients                          # Cadastrar
GET    /patients/{id}                     # Detalhes
PUT    /patients/{id}                     # Atualizar
DELETE /patients/{id}                     # Desativar
```

### Consultas
```http
POST   /appointments                                    # Agendar
GET    /appointments?patientId=1&page=0                # Listar por paciente
GET    /appointments?doctorId=1&page=0                 # Listar por médico
PUT    /appointments/{id}                               # Remarcar
DELETE /appointments/{id}                               # Cancelar
GET    /appointments/available-slots?doctorId=1&date=2026-05-21  # Horários
```

### Prontuário
```http
POST   /medical-records                          # Criar registro
GET    /medical-records/patient/{id}             # Histórico do paciente
PUT    /medical-records/{id}                     # Atualizar
POST   /medical-records/{id}/attachments         # Anexar exame
```

### Prescrições
```http
POST   /prescriptions                        # Criar receita
GET    /prescriptions/patient/{id}           # Receitas do paciente
GET    /prescriptions/{id}/pdf               # Download PDF
```

### Leitos
```http
GET    /beds                        # Listar todos
POST   /beds                        # Cadastrar leito
POST   /beds/{id}/occupy           # Ocupar leito
POST   /beds/{id}/release          # Liberar leito
PUT    /beds/{id}/status           # Atualizar status
GET    /beds/stats                 # Estatísticas
```

### Faturamento
```http
POST   /invoices                        # Criar fatura
GET    /invoices/patient/{id}           # Faturas do paciente
GET    /invoices/{id}                   # Detalhes
POST   /invoices/{id}/pay              # Pagamento
POST   /invoices/{id}/cancel           # Cancelar
```

> Documentação interativa disponível em `http://localhost:8080/swagger-ui.html`

---

## 🚀 Quick Start

### Pré-requisitos

- Docker Engine 24+
- Docker Compose v2+

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/hospital-management-system.git
cd hospital-system

# Inicie todos os serviços
docker-compose up -d --build

# Acompanhe os logs
docker-compose logs -f
```

### Acesso

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API | http://localhost:8080 |
| Swagger UI | http://localhost:8080/swagger-ui.html |
| Banco (PostgreSQL) | localhost:5432 / hospital / hospital123 |

### Criando dados iniciais

```bash
# Registrar admin
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hospital.com","password":"admin123","name":"Admin","role":"ADMIN"}'

# Registrar médico
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"doctor@hospital.com","password":"doctor123","name":"Dr. House","role":"DOCTOR","crm":"12345","specialty":"Cardiology"}'

# Registrar paciente
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"patient@test.com","password":"patient123","name":"John Doe","role":"PATIENT"}'

# Login e obtenção do token
TOKEN=$(curl -s -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hospital.com","password":"admin123"}' | jq -r '.accessToken')

# Criar paciente
curl -X POST http://localhost:8080/patients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Maria Silva","cpf":"123.456.789-00","gender":"Female","bloodType":"A+"}'
```

---

## 📁 Estrutura do Projeto

```
hospital-system/
├── .github/
│   └── workflows/
│       ├── maven-build.yml       # Build e testes
│       ├── deploy.yml            # Deploy Railway
│       └── code-quality.yml      # SonarQube
│
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/hospital/
│   │   │   │   ├── config/          # Security, OpenAPI
│   │   │   │   ├── controller/      # REST Controllers
│   │   │   │   ├── dto/             # Request/Response DTOs
│   │   │   │   ├── entity/          # JPA Entities
│   │   │   │   ├── exception/       # Exception Handler
│   │   │   │   ├── repository/      # Spring Data JPA
│   │   │   │   ├── scheduler/       # Quartz Jobs
│   │   │   │   ├── security/        # JWT Provider, Filter
│   │   │   │   └── service/         # Business Logic
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   │       └── java/com/hospital/
│   │           └── HospitalApplicationTests.java
│   ├── Dockerfile
│   ├── .dockerignore
│   └── pom.xml
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout.tsx            # Sidebar + AppBar
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx        # Auth State
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx         # Login/Register
│   │   │   ├── DashboardPage.tsx     # Stats cards
│   │   │   ├── PatientsPage.tsx      # CRUD pacientes
│   │   │   ├── AppointmentsPage.tsx   # Calendário
│   │   │   ├── MedicalRecordsPage.tsx # Prontuário
│   │   │   ├── PrescriptionsPage.tsx  # Receitas
│   │   │   ├── BedsPage.tsx          # Leitos
│   │   │   └── InvoicesPage.tsx      # Faturamento
│   │   ├── services/
│   │   │   ├── api.ts                # Axios config + interceptors
│   │   │   ├── authService.ts
│   │   │   ├── patientService.ts
│   │   │   ├── appointmentService.ts
│   │   │   ├── medicalRecordService.ts
│   │   │   ├── prescriptionService.ts
│   │   │   ├── bedService.ts
│   │   │   └── invoiceService.ts
│   │   ├── utils/
│   │   └── App.tsx                   # Rotas
│   ├── Dockerfile
│   ├── nginx.conf
   ├── .dockerignore
│   ├── package.json
│   └── tsconfig.json
│
├── docker-compose.yml
└── README.md
```

---

## ✅ Compliance

### LGPD (Lei Geral de Proteção de Dados - Lei 13.709/2018)

- **Art. 6º - Princípios**: Finalidade, adequação, necessidade, livre acesso, qualidade, transparência, segurança, prevenção, não discriminação, responsabilização
- **Art. 7º - Hipóteses**: Consentimento do titular para coleta e processamento
- **Art. 18º - Direitos**: Confirmação, acesso, correção, anonimização, bloqueio, eliminação, portabilidade
- **Art. 46º - Segurança**: Medidas técnicas (criptografia, hash) e administrativas
- **Art. 49º - Notificação**: Comunicação à ANPD em caso de incidentes

### HIPAA (Health Insurance Portability and Accountability Act)

- **Privacy Rule**: Controle de acesso a PHI (Protected Health Information)
- **Security Rule**: Salvaguardas administrativas, físicas e técnicas
- **Breach Notification Rule**: Notificação obrigatória em 60 dias
- **Omnibus Rule**: Extensão a business associates

### Implementação no Sistema

| Requisito | Implementação |
|-----------|---------------|
| Criptografia em repouso | Dados sensíveis criptografados no banco |
| Controle de acesso | RBAC com JWT tokens |
| Trilha de auditoria | Logs de acesso (SLF4J/Logback) |
| TLS em trânsito | HTTPS via Nginx (produção) |
| Consentimento | Registro de consentimento do paciente |
| Deleção de dados | Soft delete (active=false) |
| Sessão segura | Token expiration + refresh automático |

---

## 🔄 CI/CD

### GitHub Actions

```mermaid
graph LR
    A[Push/Pull Request] --> B{Maven Build}
    B --> C[Compile]
    B --> D[Tests]
    B --> E[Package JAR]
    C --> F[SonarQube]
    D --> F
    F --> G{Quality Gate}
    G -->|Pass| H[Deploy Railway]
```

### Workflows

- **maven-build.yml**: Executa em push/PR para `main` e `develop`. Compila, testa e gera artifact JAR.
- **deploy.yml**: Deploy automático no Railway após merge na `main`.
- **code-quality.yml**: Análise SonarQube com cobertura de testes e code smells.

---

## 📄 Licença

[MIT](LICENSE)
