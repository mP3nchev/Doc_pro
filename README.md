# DocGen WordPress Plugin

Автоматично генериране на учредителни документи за ООД с .docx шаблони.

## Инсталация

1. Качете папката `docgen` в `/wp-content/plugins/`
2. Инсталирайте зависимостите: `composer install` (в папката на плъгина)
3. Активирайте плъгина от WordPress Admin -> Plugins
4. Готово!

## Използване

### Admin панел
- Отидете на DocGen в admin менюто
- Качете .docx шаблони
- Създавайте документи

### Frontend shortcodes
- `[docgen_create]` - Форма за създаване на документи
- `[docgen_templates]` - Управление на шаблони (само за админи)

## Полета в шаблоните

### Дружество
- `{{company_name}}` - Име на дружеството
- `{{company_name_en}}` - Име на латиница
- `{{company_seat}}` - Седалище
- `{{company_address}}` - Адрес
- `{{company_activity}}` - Дейност
- `{{company_capital}}` - Капитал
- `{{share_count}}` - Брой дялове
- `{{share_value}}` - Стойност на дял
- `{{current_date}}` - Текуща дата

### Съдружници (цикъл)
\`\`\`
{{#partners}}
{{partner_index}} - Номер
{{partner_name}} - Име
{{partner_egn}} - ЕГН
{{partner_address}} - Адрес
{{partner_share}} - Дял
{{partner_percentage}} - Процент
{{partner_id_number}} - Лична карта
{{partner_id_issue_date}} - Дата издаване
{{partner_id_issue_place}} - Място издаване
{{/partners}}
\`\`\`

### Управители (цикъл)
\`\`\`
{{#managers}}
{{manager_index}} - Номер
{{manager_name}} - Име
{{manager_egn}} - ЕГН
{{manager_address}} - Адрес
{{manager_id_number}} - Лична карта
{{manager_id_issue_date}} - Дата издаване
{{manager_id_issue_place}} - Място издаване
{{/managers}}
\`\`\`

### Други
- `{{management_type_text}}` - Тип управление (заедно/поотделно)
- `{{lawyer_representative_name}}` - Упълномощител на адвоката

## Изисквания

- WordPress 5.0+
- PHP 7.4+
- Composer (за инсталация на зависимости)
- ZipArchive PHP extension
