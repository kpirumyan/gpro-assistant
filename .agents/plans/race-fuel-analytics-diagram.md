# Диаграмма архитектуры и процесса: Race Fuel Analytics

Ниже представлена диаграмма, визуализирующая весь план реализации фичи "Аналитика расхода топлива", включая потоки данных от интерфейса до базы данных. Зеленым цветом отмечены слои, которые уже реализованы (БД и API), желтым — те, которые находятся в работе или планируются (Бизнес-логика и UI).

```mermaid
flowchart TD
    %% UI Layer
    subgraph UI ["4. UI Layer"]
        SyncBtn[Кнопка: Синхронизировать гонки]
        Status[Индикатор загрузки/статуса]
    end

    %% Service Layer (Business Logic)
    subgraph Service ["3. Business Logic (Service Layer)"]
        SA[Server Action: Start Sync]
        RAService[race-analysis.service.ts]
        SyncLoop{Цикл по гонкам<br/>от последней назад}
        ParseData[Парсинг Снепшотов<br/>(driver, car, wear)]
        CalcFuel[Алгоритм расчета топлива]
        CalcStint[Расчет по стинтам<br/>Учет погрешностей пит-стопов]
        CalcFull[Расчет на всю гонку]
    end

    %% API Client Layer
    subgraph APIClient ["2. GPRO API Client"]
        Client[fetchRaceAnalysis(token, S, R)]
        Types[RaceAnalysisResponse Type]
    end

    %% External
    subgraph External ["GPRO Server"]
        Endpoint[/api/RaceAnalysis?SR=S,R/]
    end

    %% Database Layer
    subgraph DB ["1. Database (Drizzle ORM)"]
        RawDB[(race_analysis<br/>Сырой JSON)]
        CarDB[(race_car_snapshots)]
        DriverDB[(race_driver_snapshots)]
        FuelDB[(race_fuel_analytics)]
    end

    %% Connections
    SyncBtn -->|Клик| SA
    SA --> RAService
    RAService --> SyncLoop
    SyncLoop -->|Запрос гонки| Client
    Client --> Endpoint
    Endpoint -->|Сырой JSON| Types
    Types -->|Ответ API| RAService
    
    RAService -->|1. Сохранение сырых данных| RawDB
    RAService -->|2. Парсинг данных| ParseData
    ParseData -->|Снепшот машины| CarDB
    ParseData -->|Снепшот пилота| DriverDB
    
    RAService -->|3. Расчет топлива| CalcFuel
    CalcFuel --> CalcStint
    CalcStint -->|Запись отрезка| FuelDB
    CalcFuel --> CalcFull
    CalcFull -->|Запись всей гонки| FuelDB

    RAService -->|Следующая гонка| SyncLoop
    SyncLoop -.->|Остановка цикла<br/>(Уже в БД или 404)| SA
    SA --> Status
    
    %% Styles
    classDef completed fill:#d4edda,stroke:#28a745,stroke-width:2px,color:#000;
    classDef pending fill:#fff3cd,stroke:#ffc107,stroke-width:2px,color:#000;
    classDef external fill:#e2e3e5,stroke:#6c757d,stroke-width:2px,color:#000;
    
    class DB,APIClient completed;
    class Service,UI pending;
    class External external;
```
