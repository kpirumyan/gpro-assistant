# XML-стандарт агентской системы GPRO Assistant

> Этот документ — **живой стандарт**. Результат `/discuss` сессии.  

---

## 1. Шкала Severity

### 3 уровня + жёсткие квоты (защита от rule dilution)

| Уровень | Атрибут | Квота | Критерий | Поведение при нарушении |
|---------|---------|-------|----------|------------------------|
| **Абсолютный** | `severity="ABSOLUTE"` | **≤ 3** во всей системе | Последствия **необратимы** и выходят за пределы кодовой базы (секреты, внешние системы) | Немедленный отказ. Нет исключений. Нет negotiation. |
| **Критический** | `severity="CRITICAL"` | **≤ 10** суммарно | Нарушение серьёзно, но исправимо внутри процесса | Выполнить только если `exception=` явно разрешает |
| **Обязательный** | `severity="MANDATORY"` | без ограничений | Стандартное рабочее поведение | Предупредить, если нет возможности выполнить |

> [!IMPORTANT]
> **Правило dilution:** Если всё критично — ничто не критично. Квоты не рекомендация, а жёсткое ограничение.

### Текущие ABSOLUTE правила (3 из 3 слотов заняты)

| id | Обоснование |
|----|-------------|
| `context_exclusion` | Нарушение = утечка секретов из `.agentignore`. Необратимо. |
| `no_env_workarounds` | Нарушение = компрометация credentials через shell. Необратимо. |
| *(третий слот свободен)* | Зарезервирован для будущего. Вводится только через ADR. |

> **Примечание:** `no_coding` и `no_auto_commit` — `CRITICAL`, не `ABSOLUTE`. Их нарушение — серьёзная архитектурная ошибка, но исправимая внутри процесса (не утечка секретов).

---

## 2. Словарь модальных слов (RFC 2119)

Соответствие между словами в тексте правил и уровнями severity:

| Слово | Значение | Допустимо в severity |
|-------|----------|---------------------|
| **MUST / MUST NOT** | Абсолютное требование / запрет | `ABSOLUTE`, `CRITICAL` |
| **NEVER** | Усиленный запрет | Только `ABSOLUTE` |
| **SHOULD / SHOULD NOT** | Рекомендация, исключения допустимы | `MANDATORY` |
| **MAY** | Разрешение, не обязательство | Описательный текст, не в `<rule>` |

> [!IMPORTANT]
> **SHALL / SHALL NOT** — не используем (избыточно, создаёт путаницу с MUST).  
> **ALWAYS** — не используем как усилитель (слабее MUST, создаёт неоднозначность).

### Правило: слово должно коррелировать с severity

```xml
<!-- ✅ ПРАВИЛЬНО: MUST NOT → severity="ABSOLUTE" -->
<rule id="context_exclusion" severity="ABSOLUTE">
  You MUST NEVER read files matching .agentignore patterns.
</rule>

<!-- ✅ ПРАВИЛЬНО: MUST → severity="CRITICAL" -->
<rule id="no_coding" severity="CRITICAL">
  The Orchestrator MUST NOT write application code directly.
</rule>

<!-- ✅ ПРАВИЛЬНО: нейтральный императив → severity="MANDATORY" -->
<rule id="error_handling" severity="MANDATORY">
  When a command fails: attempt up to 3 automatic fix cycles.
</rule>

<!-- ❌ НЕПРАВИЛЬНО: MUST в MANDATORY правиле → overstatement -->
<rule id="error_handling" severity="MANDATORY">
  You MUST attempt up to 3 automatic fix cycles.
</rule>
```

---

## 3. Словарь атрибутов

### Атрибуты `<rule>`

```xml
<rule
  id="snake_case_id"                              <!-- Обязателен -->
  severity="ABSOLUTE|CRITICAL|MANDATORY"          <!-- Обязателен -->
  domain="core|security|language|workflow|vcs"    <!-- Обязателен для семантической сортировки -->
  scope="orchestrator|coder|tester|reviewer|all"  <!-- Если неочевиден из контекста -->
  phase="all|plan|implement|test|review|terminal-audit"  <!-- Если применяется к конкретной фазе -->
  exception="/quick-fix|none"                     <!-- Явно разрешённые исключения -->
  enforced_by="self|orchestrator"                 <!-- Кто проверяет соблюдение -->
>
```

> **Принцип минимальных атрибутов:** не добавляй атрибут, если его значение очевидно из родительского тега.

### Атрибуты `<phase>`

```xml
<phase
  name="Plan|Post-Approval Setup|Implement|Test|Review|Terminal Audit"
  requires_approval="true|false"
  depends_on="PhaseName"
>
```

### Атрибуты `<mode>`

```xml
<mode
  command="/goal|/grill-me|/discuss|/ask|/quick-fix|/dual-arch|/debate"
  autonomous="true|false"
  produces_artifact="true|false"
  invokes_subagents="true|false"
>
```

### Атрибуты `<file-access>` (в permissions)

```xml
<file-access scope="src/**" mode="read|write|read-write" />
```

### Тег `<delegates-to>`

```xml
<delegates-to
  agent="Tester|Coder|Reviewer|Architect"
  task="write-failing-tests|implement-feature|review-code|create-plan"
  after="AgentName|none"
  max_iterations="3"
  on_exceed="escalation-protocol"
/>
```

---

## 4. Тег-словарь (Tag Vocabulary)

Полный список допустимых тегов. Новые вводятся только через ADR.

| Тег | Назначение |
|-----|-----------|
| `<orchestrator>` | Блок настройки Orchestrator |
| `<persona>` | Описание роли и личности агента |
| `<rule>` | Единица правила с атрибутами |
| `<rule-ref>` | Ссылка на правило в другом файле (Single Source of Truth) |
| `<system-rules>` | Контейнер глобальных правил |
| `<role-definition>` | Описание роли субагента |
| `<permissions>` | Блок прав доступа агента |
| `<file-access>` | Правило доступа к файлам |
| `<agent-workflow>` | Описание воркфлоу |
| `<phase>` | Фаза воркфлоу |
| `<delegates-to>` | Делегирование задачи агенту |
| `<constraint>` | Ограничение (итерации, таймаут) |
| `<interaction-modes>` | Контейнер режимов взаимодействия |
| `<mode>` | Один режим взаимодействия |
| `<right-of-refusal>` | Право отказа агента (только Coder) |
| `<conditions>` | Список условий/триггеров для срабатывания `<action>` |
| `<action>` | Действие при выполнении условия |
| `<description>` | Человекочитаемое описание (Markdown внутри разрешён) |

> **Примечание по `<conditions>`:** семантически идентичен понятию "триггер", но точнее — описывает состояние/условие, а не событие.

---

## 5. Структурные принципы

### 5.1 Single Source of Truth

Каждое правило существует ровно в **одном файле**.

```xml
<!-- В workflow.md — определение живёт здесь -->
<rule id="no_auto_commit" severity="CRITICAL">...</rule>

<!-- В AGENTS.md — только ссылка -->
<rule-ref id="no_auto_commit" source=".agents/rules/workflow.md" />

<!-- ❌ ЗАПРЕЩЕНО: копия того же правила -->
<rule id="no_auto_commit" severity="CRITICAL">...</rule>
```

### 5.2 Принцип минимальных атрибутов

```xml
<!-- ✅ scope очевиден из <orchestrator> — не дублируем -->
<orchestrator>
  <rule id="no_coding" severity="CRITICAL">...</rule>
</orchestrator>

<!-- ✅ scope нужен — правило в глобальном контейнере -->
<system-rules>
  <rule id="error_handling" severity="MANDATORY" scope="all">...</rule>
</system-rules>
```

### 5.3 Именование

| Аспект | Соглашение | Пример |
|--------|-----------|--------|
| `id` | snake_case | `id="no_auto_commit"` |
| Имена тегов | kebab-case | `<system-rules>`, `<file-access>` |
| `scope` (агенты) | camelCase | `scope="orchestrator"` |
| `scope` (пути) | glob | `scope="src/**"` |
| `severity` | UPPER_CASE | `severity="ABSOLUTE"` |
| Булевы атрибуты | строчные строки | `autonomous="true"` |

---

## 6. Шаблоны файлов

### Шаблон файла роли

```xml
# [RoleName] Role

## Persona
<persona role="RoleName">
  <description>...</description>
  <attitude>...</attitude>
  <goal>...</goal>
</persona>

## Responsibilities & Permissions
<role-definition>
  <responsibilities>
    <item>...</item>
  </responsibilities>
  <permissions agent="RoleName">
    <file-access scope="src/**" mode="read-write" />
    <terminal allowed="true" commands="npm run *" />
    <delegation allowed="false" />
    <web-search allowed="false" />
  </permissions>
</role-definition>
```

### Шаблон нового правила

```xml
<rule id="rule_name" severity="MANDATORY" scope="all">
  [Нейтральный императив без MUST для MANDATORY] ...
</rule>

<rule id="rule_name" severity="CRITICAL" exception="none">
  The [Agent] MUST NOT [action]. [Обоснование].
</rule>

<rule id="rule_name" severity="ABSOLUTE">
  You MUST NEVER [action]. [Обоснование необратимости последствий].
</rule>
```

---

## 7. Квоты и ограничения

```
severity="ABSOLUTE"  ≤ 3 правил     (во всей системе суммарно)
severity="CRITICAL"  ≤ 10 правил    (суммарно по всем файлам)
severity="MANDATORY" — без ограничений

На файл роли: max 1 блок <persona> + max 1 блок <permissions>
На фазу:      max 2 тега <delegates-to>
```

---

## 8. When to Introduce a New Tag (Когда вводить новый тег)

Новый тег — только при всех трёх условиях:
1. Существующий словарь не может выразить нужную семантику
2. Тег будет использоваться в **минимум 2 разных местах** (иначе это атрибут, не тег)
3. Решение зафиксировано как ADR в `.agents/adr/`

---

## 9. Чек-лист валидации

При создании или редактировании любого файла в `.agents/`:

- [ ] Структура соответствует шаблону (раздел 6)
- [ ] Все `<rule>` имеют `id` и `severity`
- [ ] Модальные слова коррелируют с severity (раздел 2)
- [ ] Слот `ABSOLUTE` не превышен (≤ 3 в системе)
- [ ] Слот `CRITICAL` не превышен (≤ 10 в системе)  
- [ ] Нет дублирования правил (Single Source of Truth)
- [ ] Новые теги задокументированы через ADR
- [ ] Атрибуты не дублируют контекст родительского тега
- [ ] Имена тегов — kebab-case, атрибут `id` — snake_case
