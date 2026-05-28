# Оптимизация контекста агента (Migration to XML)

Эта задача направлена на повышение эффективности работы агента за счет перевода критически важных инструкций, чек-листов и бизнес-правил в формат XML. Это поможет механизму внимания LLM точнее вычленять жесткие ограничения и не путать их с обычным текстом. Кроме того, в `AGENTS.md` будет добавлен индекс всех файлов с абсолютными ссылками для быстрого доступа.

> [!IMPORTANT]
> **Documentation Updates**
> Эта задача напрямую изменяет конфигурационные файлы агента (`AGENTS.md`, `.agents/skills/*.md`, `ARCHITECTURE.md`). Будет изменена структура представления правил (перевод в XML), но сама суть правил останется прежней.

## Процесс проверки (User Review Required)

Пожалуйста, ознакомьтесь с предложенными изменениями. Я планирую модифицировать системные файлы, которые управляют моим поведением. Одобряете ли вы этот план?

## Proposed Changes

### Окружение агента (Agent Context)

#### [MODIFY] [AGENTS.md](../../../AGENTS.md)
- Перевод раздела **Workflow** в теги `<agent_workflow>` и `<phase>`.
- Перевод раздела **Interaction mode** в теги `<interaction_modes>` и `<mode>`.
- Обновление таблицы **Skills** и добавление относительных ссылок на все файлы скиллов и `ARCHITECTURE.md`, чтобы агент никогда не терял к ним доступ.

#### [MODIFY] [code-review-checklist.md](../../skills/code-review-checklist.md)
- Перевод раздела **Pre-commit checklist** в структурированный XML `<code_review_checklist>` с этапами `<stage>` и проверками `<check>`. Это снизит вероятность пропуска пунктов перед коммитом.

#### [MODIFY] [nextjs-rules.md](../../skills/nextjs-rules.md)
- Оборачивание "Strict No-Workarounds Policy" и "Client Components & useEffect (CRITICAL RULE)" в теги `<critical_constraints>`.

#### [MODIFY] [testing-rules.md](../../skills/testing-rules.md)
- Перевод маркированного списка **Rules** в тег `<testing_rules>` с отдельными элементами `<rule>`, включая правило "Single Source of Truth for Mocks".

### Архитектура

#### [MODIFY] [ARCHITECTURE.md](../../ARCHITECTURE.md)
- Перевод раздела **Key patterns** в тег `<architecture_patterns>` для более четкого обозначения паттернов проектирования.

## Verification Plan

### Manual Verification
- Убедиться, что после изменений все ссылки в `AGENTS.md` кликабельны в редакторе (VS Code).
- Проверить, что формат XML написан синтаксически верно и органично вписывается в Markdown-документы.
