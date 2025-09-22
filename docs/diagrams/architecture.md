# 🏗️ System Architecture: MusicFlow

## 📊 Architecture Overview

```mermaid
graph TB
    subgraph "👤 Пользователь"
        U[Меломан/Коллекционер]
    end

    %% ---------- Frontend ----------
    subgraph "🌐 Frontend (React + TypeScript)"
        U --> |HTTPS| RA[React App<br/>MusicFlow Interface]
        RA --> |REST API| GW[API Gateway]
    end

    %% ---------- Backend Services ----------
    subgraph "⚙️ Backend (Node.js + Express)"
        GW --> |/api/tracks| TC[Tracks Controller]
        GW --> |/api/artists| AC[Artists Controller]
        GW --> |/api/albums| ALC[Albums Controller]
        GW --> |/api/playlists| PC[Playlists Controller]
        GW --> |/api/import| IC[Import Controller]
        GW --> |/api/stats| SC[Stats Controller]
        
        TC --> TS[Track Service]
        AC --> AS[Artist Service]
        ALC --> ALS[Album Service]
        PC --> PS[Playlist Service]
        IC --> IS[Import Service]
        SC --> SS[Stats Service]
        
        IS --> ID3[ID3 Metadata Parser]
        TS --> WA[Web Audio Analyzer]
    end

    %% ---------- Data Access ----------
    subgraph "🗃️ Доступ к данным"
        TS --> TR[(Tracks Repository)]
        AS --> AR[(Artists Repository)]
        ALS --> ALR[(Albums Repository)]
        PS --> PR[(Playlists Repository)]
        SS --> SR[(Stats Repository)]
        
        TR --> DB[(PostgreSQL<br/>Music Database)]
        AR --> DB
        ALR --> DB
        PR --> DB
        SR --> DB
    end

    %% ---------- Storage ----------
    subgraph "💾 Хранилище данных"
        DB --> |metadata| PGSQL[(PostgreSQL Storage)]
        IS --> |audio files| S3[(S3 Storage<br/>Audio Files)]
        IC --> |import logs| FS[(File System<br/>Logs)]
    end

    %% ---------- Search ----------
    subgraph "🔍 Поисковая система"
        TS --> ES[Elasticsearch]
        ES --> |indexing| EST[(Search Index)]
    end

    %% ---------- Cache ----------
    subgraph "⚡ Кэширование"
        TS --> RED[Redis Cache]
        RED --> |cached metadata| RC[(Redis Storage)]
    end

    classDef frontend fill:#8B5CF6,stroke:#fff,color:#fff
    classDef backend fill:#6366F1,stroke:#fff,color:#fff
    classDef db fill:#1E1B4B,stroke:#fff,color:#fff
    classDef storage fill:#3730A3,stroke:#fff,color:#fff
    classDef search fill:#7E22CE,stroke:#fff,color:#fff
    classDef cache fill:#A855F7,stroke:#fff,color:#000

    class RA frontend
    class GW,TC,AC,ALC,PC,IC,SC,TS,AS,ALS,PS,IS,SS,ID3,WA backend
    class DB,TR,AR,ALR,PR,SR,PGSQL db
    class S3,FS storage
    class ES,EST search
    class RED,RC cache
