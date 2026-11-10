# OpenCode Free Model Tester v0.1.0

[English](#english) · [Русский](#русский)

## English

A cross-platform **smoke tester** for free-named AI models available through OpenCode. Runs on Windows, macOS, and Linux.

### Downloads

- `opencode-free-model-tester-v0.1.0-windows.zip`
- `opencode-free-model-tester-v0.1.0-macos.zip`
- `opencode-free-model-tester-v0.1.0-linux.zip`
- `SHA256SUMS.txt` — archive checksums

**Requirements:** Node.js 20+, an installed OpenCode CLI, and separately configured provider access. These ZIP files contain source code and platform-specific launchers; they are **not standalone executables**.

### Features

- Preview free-named model candidates without API calls
- Explicitly confirm before sending sequential test requests
- Detect quotas, auth problems, billing issues, region restrictions, and timeouts
- Save results as CSV/JSON; flag replies whose model identity cannot be verified
- Do not require API keys to be copied into the tester

**Important:** Model names and free labels do not guarantee zero charges. Check your provider billing tier and model pricing. A short reply test is not a coding benchmark.

Documentation: [README](../blob/main/README.md) · [Install](../blob/main/docs/INSTALL.en.md) · [Specification](../blob/main/docs/SPEC.en.md)

## Русский

Кроссплатформенная утилита **для быстрой проверки доступности моделей** OpenCode с обозначением Free. Работает на Windows, macOS и Linux.

### Файлы

- `opencode-free-model-tester-v0.1.0-windows.zip`
- `opencode-free-model-tester-v0.1.0-macos.zip`
- `opencode-free-model-tester-v0.1.0-linux.zip`
- `SHA256SUMS.txt` — контрольные суммы архивов

**Требования:** Node.js 20+, установленный OpenCode CLI и самостоятельно настроенный доступ к провайдерам. Архивы содержат исходный код и запускатели под соответствующую ОС, **а не автономные EXE-программы**.

### Возможности

- Предварительный список моделей без обращения к API
- Последовательная проверка с явным подтверждением
- Распознавание ошибок квоты, авторизации, биллинга, региона и тайм-аутов
- CSV/JSON-отчёты и отметка непроверенной идентичности ответившей модели
- Не требует копировать API-ключи в тестер

**Важно:** пометка Free не гарантирует отсутствия платежей. Перед проверкой проверьте тариф и биллинг провайдера. Короткий ответ не показывает реальное качество работы с кодом.

Документация: [README на русском](../blob/main/README.ru.md) · [Установка](../blob/main/docs/INSTALL.ru.md) · [Спецификация](../blob/main/docs/SPEC.ru.md)
