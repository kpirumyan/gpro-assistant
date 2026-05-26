# Race Fuel Analytics Task List

## 1. База данных (Drizzle ORM)
- [x] Добавить таблицу `race_analysis` в `src/lib/db/schema.ts` (Сырые данные гонок).
- [x] Добавить таблицу `race_car_snapshots` в `src/lib/db/schema.ts` (Состояние машины).
- [x] Добавить таблицу `race_driver_snapshots` в `src/lib/db/schema.ts` (Состояние пилота).
- [x] Добавить таблицу `race_fuel_analytics` в `src/lib/db/schema.ts` (Вычисленные метрики топлива).
- [x] Создать и применить миграцию базы данных (`npm run db:generate` и `npm run db:migrate`).
- [x] Тестирование изменений (проверка типов, lint).
- [x] Review (code review checklist).
- [x] Commit изменений базы данных.

## 2. GPRO API Клиент
- [x] Добавить тип `RaceAnalysisResponse` в `src/lib/gpro/types.ts`.
- [x] Реализовать функцию `fetchRaceAnalysis(token, season, race)` в `src/lib/gpro/client.ts`.
- [x] Тестирование изменений.
- [x] Review.
- [x] Commit изменений API клиента.

## 3. Бизнес-логика (Сервисный слой)
- [x] Создать `src/lib/services/race-analysis.service.ts`.
- [x] Реализовать логику синхронизации гонок (`syncRaceHistory`).
- [x] Реализовать логику парсинга снепшотов пилота и болида.
- [x] Реализовать алгоритм расчета расхода топлива (с учетом погрешностей пит-стопов и точного финишного остатка).
- [x] Реализовать сохранение рассчитанной аналитики в БД.
- [x] Написать unit-тесты для алгоритмов расчета (`race-analysis.service.test.ts`).
- [x] Тестирование (запуск написанных тестов).
- [x] Review.
- [x] Commit бизнес-логики.

## 4. UI Слой
- [x] Создать Server Action для запуска синхронизации.
- [x] Добавить кнопку "Синхронизировать гонки" в UI (например, на странице настроек или новой вкладке).
- [x] Добавить индикацию загрузки/статуса синхронизации.
- [x] Тестирование (ручная проверка работы кнопки и UI).
- [x] Review.
- [x] Commit UI изменений.
