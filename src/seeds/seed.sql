-- Seed данни за Tenders Radar MVP
-- Изпълнете този скрипт в Supabase SQL Editor след миграцията

-- 1. Две примерни фирми (трябва да имат auth.users записи)
-- За тестове можете да добавите потребители през Supabase Auth и да използвате техните user_id

-- Пример 1: Строителна фирма
INSERT INTO clients (user_id, company_name, contact_name, delivery_channel, delivery_target, keywords, regions, min_budget_bgn, client_notes, plan_status, frequency)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'ЕООД "Строител 2025"', 'Иван Петров', 'email', 'ivan@stroitel2025.bg',
   '{"строителство", "реконструкция", "CPV 45210000", "CPV 45400000"}',
   '{"София", "Пловдив"}', 50000,
   'Малка фирма, ограничен капацитет, само град София и околност',
   'active_paid', 'twice_weekly');

-- Пример 2: IT / офис доставки
INSERT INTO clients (user_id, company_name, contact_name, delivery_channel, delivery_target, keywords, regions, min_budget_bgn, client_notes, plan_status, frequency)
VALUES
  ('00000000-0000-0000-0000-000000000002', 'ОфисДистрибюшън ЕООД', 'Мария Георгиева', 'email', 'maria@officedist.bg',
   '{"канцелариски материали", "компютри", "CPV 30200000", "CPV 22800000"}',
   '{"София", "Варна", "Бургас"}', 10000,
   'Само офисни разходи, без големи капацитален проекти',
   'lead_trial', 'weekly');

-- 2. Примери за поръчки
INSERT INTO tenders (external_ref_id, source_url, title, contracting_authority, region, estimated_value_bgn, submission_deadline, raw_extracted_text, content_hash)
VALUES
  ('TENDER-2025-001', 'https://example.bg/tender/001',
   'Строителство на начална школа в София',
   'Община София', 'София', 1500000,
   '2025-12-15T14:00:00+02:00',
   'Объявление за публична поръчка за строителство на основна школа...',
   'hash-001'),

  ('TENDER-2025-002', 'https://example.bg/tender/002',
   'Доставка на канцелариски материали за училище',
   'Регионална дирекция образование', 'Пловдив', 45000,
   '2025-11-30T10:00:00+02:00',
   'Доставка на канцелариски артикули, хартия, черниля...',
   'hash-002'),

  ('TENDER-2025-003', 'https://example.bg/tender/003',
   'Асистанс за IT инфраструктура на община',
   'Община Бургас', 'Бургас', 280000,
   '2025-12-05T12:00:00+02:00',
   'Услуги за поддържане на сървъри и компютърна мрежа...',
   'hash-003'),

  ('TENDER-2025-004', 'https://example.bg/tender/004',
   'Ремонт на автомобилни пътища в област',
   'Областна управление София', 'София', 850000,
   '2025-11-20T16:00:00+02:00',
   'Капитален ремонт на регионални пътища...',
   'hash-004');
-- 3. AI анализи за клиент 1 (Строителна фирма)
INSERT INTO matches_analysis (client_id, tender_id, relevance_score, verdict, summary_json, is_included_in_report, analyzed_at)
SELECT
  c.id,
  t.id,
  88,
  'Струва се да се прегледа подробно — совпада с ключови думи за строителство и региона София.',
  '{"summary_5_bullets": ["Строителство на начална школа в София, обем 1.5 млн лв.", "Изпълнение в София, крайни срок 15 декември 2025", "Прогнозна стойност 1 500 000 лв. без ДДС, плащане след приемане", "Критерий: най-ниска цена", "Изискван опит с 2 similar договора последните 5 години"]',
   '"key_dates": {"submission_deadline": "15.12.2025 14:00", "questions_deadline": "01.12.2025", "execution_duration": "12 месеца"}',
   '"budget": {"estimated_value_bgn_no_vat": "1500000", "guarantee_participation": "2%", "guarantee_performance": "5%"}',
   '"requirements_for_sme": {"specific_experience": "2 similar договора над 500 000 лв. последните 5 години", "financial_requirements": "Минимен оборот 1 млн лв.", "team_and_equipment": "Строителен лиценз, ключов експерт", "subcontractors_allowed": "Да"}',
   '"red_flags_and_risks": ["Висока гаранция за изпълнение 5%", "Кратък срок за подготовка на оферта"]',
   '"next_action_checklist": ["Провери дали имаш валиден строителен лиценз", "Изчисли гаранционния депозит"]}',
  false,
  now()
FROM clients c, tenders t
WHERE c.company_name = 'ЕООД "Строител 2025"' AND t.external_ref_id = 'TENDER-2025-001';

INSERT INTO matches_analysis (client_id, tender_id, relevance_score, verdict, summary_json, is_included_in_report, analyzed_at)
SELECT
  c.id,
  t.id,
  45,
  'Няма强 съвпадение — регионалния ремонт не е приоритет за този профил.',
  '{"summary_5_bullets": ["Ремонт на автомобилни пътища в област София, 850 000 лв.", "Местност: София, крайни срок 20 ноември 2025", "Прогнозна стойност 850 000 лв. без ДДС", "Критерий: оптимално съотношение качество/цена", "Изискван опит с пътечен ремонт"]',
   '"key_dates": {"submission_deadline": "20.11.2025 16:00", "questions_deadline": "10.11.2025", "execution_duration": "6 месеца"}',
   '"budget": {"estimated_value_bgn_no_vat": "850000", "guarantee_participation": "1%", "guarantee_performance": "3%"}',
   '"requirements_for_sme": {"specific_experience": "3 пътечни договора последните 3 години", "financial_requirements": "Оборот над 500 000 лв.", "team_and_equipment": "Тежка техника, 대로строителен лиценз", "subcontractors_allowed": "Да"}',
   '"red_flags_and_risks": ["Тежка техника изисква 추가 разходи", "Отложено плащане без аванс"]',
   '"next_action_checklist": ["Оценете капацитета за тежка техника", "Проверете плащаните условия"]}',
  false,
  now()
FROM clients c, tenders t
WHERE c.company_name = 'ЕООД "Строител 2025"' AND t.external_ref_id = 'TENDER-2025-004';
-- 4. AI анализи за клиент 2 (ОфисДистрибюшън)
INSERT INTO matches_analysis (client_id, tender_id, relevance_score, verdict, summary_json, is_included_in_report, analyzed_at)
SELECT
  c.id,
  t.id,
  72,
  'Добро съвпадение за канцелариски материали, но проверяйте региона.',
  '{"summary_5_bullets": ["Доставка на канцелариски материали за училище, 45 000 лв.", "Изпълнение в Пловдив, крайни срок 30 ноември 2025", "Прогнозна стойност 45 000 лв. без ДДС, аванс 20%", "Критерий: най-ниска цена", "Изискван опит с доставки за учебни заведения"]',
   '"key_dates": {"submission_deadline": "30.11.2025 10:00", "questions_deadline": "20.11.2025", "execution_duration": "3 месеца"}',
   '"budget": {"estimated_value_bgn_no_vat": "45000", "guarantee_participation": "500 лв.", "guarantee_performance": "10%"}',
   '"requirements_for_sme": {"specific_experience": "1 договор за шкодни поставки", "financial_requirements": "Оборот над 30 000 лв.", "team_and_equipment": "Доставчителска кола, складово пространство", "subcontractors_allowed": "Не"}',
   '"red_flags_and_risks": ["Регион Пловдив — може да е извън вашия основен капацитет"]',
   '"next_action_checklist": ["Потвърдете дали доставяте в Пловдив", "Подгответе търговска оферта"]}',
  false,
  now()
FROM clients c, tenders t
WHERE c.company_name = 'ОфисДистрибюшън ЕООД' AND t.external_ref_id = 'TENDER-2025-002';

INSERT INTO matches_analysis (client_id, tender_id, relevance_score, verdict, summary_json, is_included_in_report, analyzed_at)
SELECT
  c.id,
  t.id,
  91,
  'Отлично съвпадение — IT услуги за община, висок рейтинг на съвпадение.',
  '{"summary_5_bullets": ["Асистанс за IT инфраструктура на община Бургас, 280 000 лв.", "Местност: Бургас, крайни срок 5 декември 2025", "Прогнозна стойност 280 000 лв. без ДДС, плащане месечно", "Критерий: оптимално съотношение качество/цена", "Изискван опит с държавни институции"]',
   '"key_dates": {"submission_deadline": "05.12.2025 12:00", "questions_deadline": "25.11.2025", "execution_duration": "1 година"}',
   '"budget": {"estimated_value_bgn_no_vat": "280000", "guarantee_participation": "3%", "guarantee_performance": "5%"}',
   '"requirements_for_sme": {"specific_experience": "2 държавни IT договора последните 3 години", "financial_requirements": "Оборот над 200 000 лв.", "team_and_equipment": "Сертифицирани инженерни, мрежова техника", "subcontractors_allowed": "Да"}',
   '"red_flags_and_risks": ["Дългосрочен договор — 1 година"]',
   '"next_action_checklist": ["Съберете екип от сертифицирани специалисти", "Проверкете мрежовата техника"]}',
  false,
  now()
FROM clients c, tenders t
WHERE c.company_name = 'ОфисДистрибюшън ЕООД' AND t.external_ref_id = 'TENDER-2025-003';