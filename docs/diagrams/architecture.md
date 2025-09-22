# 🏗️ System Architecture: TaxForex

## 📊 Architecture Overview

```mermaid
graph TB
    subgraph "👤 Пользователь (ИП)"
        U[Индивидуальный предприниматель]
    end

    %% ---------- Frontend ----------
    subgraph "🌐 Frontend (React + TypeScript)"
        U --> |HTTPS| RA[React App<br/>Интерфейс TaxForex]
        RA --> |REST API| GW[API Gateway]
    end

    %% ---------- Backend Services ----------
    subgraph "⚙️ Backend (Node.js + Express)"
        GW --> |/api/operations| OC[Operations Controller<br/>Управление операциями]
        GW --> |/api/rates| RC[Rates Controller<br/>Курсы валют]
        GW --> |/api/reports| REPC[Reports Controller<br/>Отчеты]
        GW --> |/api/export| EXPC[Export Controller<br/>Экспорт данных]
        
        OC --> OS[Operations Service]
        RC --> RS[Rates Service]
        REPC --> REPS[Reports Service]
        EXPC --> EXPS[Export Service]
        
        RS --> CBR[ЦБ РФ API<br/>курсы валют]
    end

    %% ---------- Data Access ----------
    subgraph "🗃️ Доступ к данным"
        OS --> OR[(Operations Repository)]
        REPS --> RR[(Reports Repository)]
        
        OR --> DB[(PostgreSQL<br/>Основная БД)]
        RR --> DB
    end

    %% ---------- Storage ----------
    subgraph "💾 Хранилище данных"
        DB --> |постоянное хранение| PSQL[(Диск PostgreSQL)]
        EXPS --> |экспорт файлов| FS[Файловое хранилище<br/>PDF/CSV]
    end

    %% ---------- External Services ----------
    subgraph "📡 Внешние сервисы"
        CBR --> |JSON API| CBR_API[api.cbr.ru<br/>Курсы валют ЦБ РФ]
    end

    %% ---------- Security ----------
    subgraph "🔐 Безопасность"
        GW --> VAL[Валидация данных]
        GW --> AUTH[Аутентификация]
        AUTH --> JWT[JWT Tokens]
    end

    %% ---------- Monitoring ----------
    subgraph "📊 Мониторинг"
        GW --> LOG[Логирование]
        LOG --> ELK[ELK Stack]
        GW --> MON[Метрики]
        MON --> PROM[Prometheus]
    end

    %% ---------- Deployment ----------
    subgraph "🐳 Деплой и инфраструктура"
        RA --> |build| S3[Amazon S3 / Cloud Storage<br/>Статические файлы]
        GW --> |container| DOCK[Docker Container<br/>Backend]
        DB --> |container| DB_DOCK[Docker Container<br/>PostgreSQL]
        DOCK --> K8S[Kubernetes Cluster]
        DB_DOCK --> K8S
    end

    %% ---------- Стили ----------
    classDef frontend fill:#61dafb,stroke:#282c34,color:#000
    classDef backend fill:#6db33f,stroke:#fff,color:#000
    classDef db fill:#336791,stroke:#fff,color:#fff
    classDef external fill:#f9d71c,stroke:#000,color:#000
    classDef security fill:#ff6b6b,stroke:#fff,color:#000
    classDef monitoring fill:#9b59b6,stroke:#fff,color:#fff
    classDef deployment fill:#239aef,stroke:#fff,color:#fff

    class RA frontend
    class GW,OC,RC,REPC,EXPC,OS,RS,REPS,EXPS backend
    class DB,OR,RR,PSQL,FS db
    class CBR,CBR_API external
    class VAL,AUTH,JWT security
    class LOG,ELK,MON,PROM monitoring
    class S3,DOCK,DB_DOCK,K8S deployment
