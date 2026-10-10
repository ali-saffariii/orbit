(() => {
  'use strict';

  /* ------------------------------------------------------------------ *
   *  ORBIT — مدیریت مالی شخصی (نسخهٔ ۳.۱)
   *  تمام اطلاعات فقط در حافظهٔ محلی همین مرورگر ذخیره می‌شود.
   * ------------------------------------------------------------------ */

  const APP_VERSION = '3.1.0';
  const STORAGE_KEY = 'orbit_finance_v3';
  const BACKUP_KEY = 'orbit_finance_v3_prev';
  const CORRUPT_KEY = 'orbit_finance_v3_corrupt';
  const LEGACY_DB = 'ORBIT_PERSONAL_OS';
  const MAX_AMOUNT = 1e13;

  const EXPENSE_CATEGORIES = ['خوراک', 'رفت‌وآمد', 'خانه', 'قبوض', 'خرید', 'سلامت', 'تفریح', 'آموزش', 'قسط', 'پس‌انداز', 'بدهی', 'سایر'];
  const INCOME_CATEGORIES = ['حقوق', 'کار و پروژه', 'هدیه', 'سود و بازگشت پول', 'درآمد', 'سایر'];
  const BUDGET_CATEGORIES = EXPENSE_CATEGORIES.filter(category => category !== 'بدهی');
  const SOURCE_KINDS = ['installment', 'debt', 'debt-open', 'recurring'];
  const JALALI_MONTHS = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
  const NAVIGATION = [
    ['dashboard', 'home', 'خانه'],
    ['transactions', 'transactions', 'تراکنش‌ها'],
    ['obligations', 'clock', 'قسط و بدهی'],
    ['reports', 'chart', 'گزارش'],
    ['settings', 'settings', 'تنظیمات']
  ];
  const ICONS = {
    home: '<path d="M3 9.5 10 3l7 6.5v7a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 16.5z"/><path d="M8 18v-5h4v5"/>',
    transactions: '<path d="M6 3v14m0 0-3-3m3 3 3-3M14 17V3m0 0-3 3m3-3 3 3"/>',
    clock: '<circle cx="10" cy="10" r="7.5"/><path d="M10 6v4.5l3 2"/>',
    chart: '<path d="M3 17V9m5 8V4m5 13v-6m5 6V7"/>',
    settings: '<circle cx="10" cy="10" r="3"/><path d="M10 2v2m0 12v2M2 10h2m12 0h2M4.3 4.3l1.4 1.4m8.6 8.6 1.4 1.4m0-11.4-1.4 1.4m-8.6 8.6-1.4 1.4"/>',
    up: '<path d="M10 17V4m0 0L5.5 8.5M10 4l4.5 4.5"/>',
    down: '<path d="M10 3v13m0 0-4.5-4.5M10 16l4.5-4.5"/>',
    wallet: '<path d="M3 5.5h13A1.5 1.5 0 0 1 17.5 7v9A1.5 1.5 0 0 1 16 17.5H4A1.5 1.5 0 0 1 2.5 16V5A2.5 2.5 0 0 1 5 2.5h9"/><path d="M13 10h4.5v3H13a1.5 1.5 0 0 1 0-3z"/>',
    plus: '<path d="M10 4v12M4 10h12"/>',
    minus: '<path d="M4 10h12"/>',
    exchange: '<path d="M3 6h12m0 0-3-3m3 3-3 3M17 14H5m0 0 3 3m-3-3 3-3"/>',
    more: '<circle cx="4" cy="10" r=".8" fill="currentColor" stroke="none"/><circle cx="10" cy="10" r=".8" fill="currentColor" stroke="none"/><circle cx="16" cy="10" r=".8" fill="currentColor" stroke="none"/>',
    search: '<circle cx="9" cy="9" r="5.5"/><path d="m13 13 4 4"/>',
    close: '<path d="M4 4l12 12M16 4 4 16"/>',
    sun: '<circle cx="10" cy="10" r="3.5"/><path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.3 4.3l1.4 1.4M14.3 14.3l1.4 1.4M15.7 4.3l-1.4 1.4M5.7 14.3l-1.4 1.4"/>',
    moon: '<path d="M16.5 11.5A7 7 0 0 1 8.5 3.5a7 7 0 1 0 8 8z"/>',
    copy: '<rect x="7" y="7" width="10" height="10" rx="2"/><path d="M13 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>',
    repeat: '<path d="M4 9V8a3 3 0 0 1 3-3h9m0 0-2.5-2.5M16 5l-2.5 2.5M16 11v1a3 3 0 0 1-3 3H4m0 0 2.5 2.5M4 15l2.5-2.5"/>',
    edit: '<path d="M13.5 3.5l3 3L7 16H4v-3z"/>',
    trash: '<path d="M4 6h12M8 6V4h4v2M6 6l.7 10h6.6L14 6"/>',
    download: '<path d="M10 3v10m0 0-3.5-3.5M10 13l3.5-3.5M4 16h12"/>',
    alert: '<circle cx="10" cy="10" r="7.5"/><path d="M10 6v5M10 13.5v.5"/>'
  };

  /* ----------------------------- حالت برنامه ----------------------------- */

  const systemTheme = () => {
    try { return globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; } catch { return 'light'; }
  };

  const defaultState = () => ({
    version: 4,
    settings: { theme: systemTheme(), currency: 'تومان', startingBalance: 0, monthlyBudget: 0, lastBackup: '' },
    transactions: [],
    installments: [],
    debts: [],
    budgets: [],
    recurring: []
  });

  let state = defaultState();
  let currentPage = 'dashboard';
  let cursor = new Date();
  let transactionFilter = 'all';
  let transactionQuery = '';
  let toastTimer = 0;
  let storageReady = true;
  let revision = 0;
  let backupNagDismissed = false;
  let lastFocus = null;
  let confirmResolver = null;
  const banners = { storage: '', data: '' };

  /* ------------------------------- ابزارها ------------------------------- */

  const $ = selector => document.querySelector(selector);
  const clone = value => JSON.parse(JSON.stringify(value));
  const uid = () => globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[character]);
  const faDigits = value => String(value).replace(/\d/g, digit => '۰۱۲۳۴۵۶۷۸۹'[digit]);
  const enDigits = value => String(value ?? '').replace(/[۰-۹]/g, digit => '۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)).replace(/[٠-٩]/g, digit => '٠١٢٣٤٥٦٧٨٩'.indexOf(digit));
  const number = value => new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 0 }).format(Number(value) || 0);
  const faMoney = value => faDigits(String(Math.round(Number(value) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '٬'));
  const cleanId = value => String(value ?? '').replace(/[^\w-]/g, '').slice(0, 64);
  const cleanText = (value, max, fallback = '') => String(value ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max) || fallback;
  const icon = name => `<svg class="svg-icon" viewBox="0 0 20 20" aria-hidden="true">${ICONS[name] || ''}</svg>`;
  const pad2 = value => String(value).padStart(2, '0');
  const normalizeSearch = value => enDigits(value).replace(/ي/g, 'ی').replace(/ك/g, 'ک').replace(/[‌‍ً-ْ]/g, '').toLowerCase().trim();

  /** عدد صحیح را می‌خواند. اگر معتبر نباشد null برمی‌گرداند (صفر هم معتبر است). */
  function parseMoney(value, { signed = false } = {}) {
    let clean = enDigits(value).replace(/[,٬،\s‌]/g, '');
    let sign = 1;
    if (signed && /^[-−–‐]/.test(clean)) { sign = -1; clean = clean.slice(1); }
    if (/^\d{1,3}(?:[.٫/]\d{3})+$/.test(clean)) clean = clean.replace(/\D/g, '');
    if (!/^\d+$/.test(clean)) return null;
    const result = Number(clean);
    if (!Number.isSafeInteger(result) || result > MAX_AMOUNT) return null;
    return sign * result;
  }
  /** فقط مبلغ مثبت؛ در غیر این صورت ۰. */
  const parseAmount = value => {
    const result = parseMoney(value);
    return result && result > 0 ? result : 0;
  };

  /* ---------- عدد به حروف ---------- */

  const ONES = ['', 'یک', 'دو', 'سه', 'چهار', 'پنج', 'شش', 'هفت', 'هشت', 'نه', 'ده', 'یازده', 'دوازده', 'سیزده', 'چهارده', 'پانزده', 'شانزده', 'هفده', 'هجده', 'نوزده'];
  const TENS = ['', '', 'بیست', 'سی', 'چهل', 'پنجاه', 'شصت', 'هفتاد', 'هشتاد', 'نود'];
  const HUNDREDS = ['', 'صد', 'دویست', 'سیصد', 'چهارصد', 'پانصد', 'ششصد', 'هفتصد', 'هشتصد', 'نهصد'];
  const SCALES = ['', 'هزار', 'میلیون', 'میلیارد', 'تریلیون', 'کوادریلیون'];

  function wordsUnderThousand(value) {
    const hundreds = Math.floor(value / 100);
    const rest = value % 100;
    const parts = [];
    if (hundreds) parts.push(HUNDREDS[hundreds]);
    if (rest) {
      if (rest < 20) parts.push(ONES[rest]);
      else {
        parts.push(TENS[Math.floor(rest / 10)]);
        if (rest % 10) parts.push(ONES[rest % 10]);
      }
    }
    return parts.join(' و ');
  }

  function numberToWords(value) {
    if (!Number.isFinite(value) || value < 0) return '';
    let rest = Math.floor(value);
    if (rest === 0) return 'صفر';
    const groups = [];
    while (rest > 0) { groups.push(rest % 1000); rest = Math.floor(rest / 1000); }
    const parts = [];
    for (let index = groups.length - 1; index >= 0; index -= 1) {
      const group = groups[index];
      if (!group || index >= SCALES.length) continue;
      parts.push(index === 1 && group === 1 ? 'هزار' : `${wordsUnderThousand(group)}${SCALES[index] ? ` ${SCALES[index]}` : ''}`);
    }
    return parts.join(' و ');
  }

  /* ------------------------------ تقویم شمسی ------------------------------ */

  const jalaliFormatter = new Intl.DateTimeFormat('en-US-u-ca-persian-nu-latn', {
    year: 'numeric', month: 'numeric', day: 'numeric', timeZone: 'UTC'
  });
  const partsCache = new Map();

  function isValidISO(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const year = Number(value.slice(0, 4));
    if (year < 1900 || year > 2200) return false;
    const date = new Date(`${value}T12:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }

  function localISO(dateValue = new Date()) {
    const date = new Date(dateValue);
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
  }

  function addDaysISO(iso, days) {
    const date = new Date(`${iso}T12:00:00Z`);
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().slice(0, 10);
  }

  function jalaliParts(value = new Date()) {
    let iso = value instanceof Date ? localISO(value) : String(value).slice(0, 10);
    if (!isValidISO(iso)) iso = localISO();
    const cached = partsCache.get(iso);
    if (cached) return cached;
    const result = {};
    jalaliFormatter.formatToParts(new Date(`${iso}T12:00:00Z`)).forEach(part => {
      if (['year', 'month', 'day'].includes(part.type)) result[part.type] = Number(part.value);
    });
    const parts = { jy: result.year, jm: result.month, jd: result.day };
    if (partsCache.size > 6000) partsCache.clear();
    partsCache.set(iso, parts);
    return parts;
  }

  function jalaliToISO(year, month, day) {
    const jy = Number(year);
    const jm = Number(month);
    const jd = Number(day);
    if (!Number.isInteger(jy) || !Number.isInteger(jm) || !Number.isInteger(jd)) return '';
    if (jy < 1300 || jy > 1500 || jm < 1 || jm > 12 || jd < 1 || jd > 31) return '';
    const dayOfYear = jm <= 6 ? (jm - 1) * 31 + jd - 1 : 186 + (jm - 7) * 30 + jd - 1;
    const base = Date.UTC(jy + 621, 2, 19, 12);
    for (let shift = -1; shift <= 5; shift += 1) {
      const date = new Date(base + (dayOfYear + shift) * 86400000);
      const parts = jalaliParts(date.toISOString().slice(0, 10));
      if (parts.jy === jy && parts.jm === jm && parts.jd === jd) return date.toISOString().slice(0, 10);
    }
    return '';
  }

  function parseJalaliDate(value) {
    let clean = enDigits(value).trim();
    if (!clean) return '';
    clean = clean.replace(/[.\-٫،\\]/g, '/');
    if (/^\d{8}$/.test(clean)) clean = `${clean.slice(0, 4)}/${clean.slice(4, 6)}/${clean.slice(6)}`;
    const match = clean.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
    return match ? jalaliToISO(match[1], match[2], match[3]) : '';
  }

  function jalaliInput(iso = localISO()) {
    const parts = jalaliParts(iso);
    return faDigits(`${parts.jy}/${pad2(parts.jm)}/${pad2(parts.jd)}`);
  }

  function monthKeyOf(year, month) { return `${year}-${pad2(month)}`; }
  function jalaliMonthKey(value = cursor) {
    const parts = jalaliParts(value);
    return monthKeyOf(parts.jy, parts.jm);
  }
  function jalaliMonthLabel(value = cursor) {
    const parts = jalaliParts(value);
    return `${JALALI_MONTHS[parts.jm - 1]} ${faDigits(parts.jy)}`;
  }
  function monthKeyLabel(key) {
    const [year, month] = key.split('-').map(Number);
    return `${JALALI_MONTHS[month - 1] || ''} ${faDigits(year)}`;
  }
  function nextMonthKey(key, offset = 1) {
    const [year, month] = key.split('-').map(Number);
    const total = year * 12 + month - 1 + offset;
    return monthKeyOf(Math.floor(total / 12), total % 12 + 1);
  }

  function jalaliDateLabel(iso) {
    if (!isValidISO(iso)) return 'بدون تاریخ';
    return new Intl.DateTimeFormat('fa-IR-u-ca-persian', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })
      .format(new Date(`${iso}T12:00:00Z`));
  }

  function jalaliWeekdayLabel(iso) {
    if (!isValidISO(iso)) return '';
    return new Intl.DateTimeFormat('fa-IR-u-ca-persian', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })
      .format(new Date(`${iso}T12:00:00Z`));
  }

  function jalaliMonthLength(year, month) {
    if (month <= 6) return 31;
    if (month <= 11) return 30;
    return jalaliToISO(year, 12, 30) ? 30 : 29;
  }

  function shiftJalaliMonth(value, offset) {
    const parts = jalaliParts(value);
    const key = nextMonthKey(monthKeyOf(parts.jy, parts.jm), offset);
    const [year, month] = key.split('-').map(Number);
    const iso = jalaliToISO(year, month, 1);
    return new Date(`${iso}T12:00:00`);
  }

  /** همان روز را ماه‌ها جلو یا عقب می‌برد؛ اگر روز در ماه مقصد نبود، آخر ماه را برمی‌گرداند. */
  function changeJalaliMonth(iso, offset, preferredDay = 0) {
    const parts = jalaliParts(iso);
    const key = nextMonthKey(monthKeyOf(parts.jy, parts.jm), offset);
    const [year, month] = key.split('-').map(Number);
    const day = Math.min(preferredDay || parts.jd, jalaliMonthLength(year, month));
    return jalaliToISO(year, month, day);
  }

  function daysUntil(iso) {
    if (!isValidISO(iso)) return null;
    const target = Date.parse(`${iso}T12:00:00Z`);
    const today = Date.parse(`${localISO()}T12:00:00Z`);
    return Math.round((target - today) / 86400000);
  }

  function dueLabel(iso) {
    const days = daysUntil(iso);
    if (days === null) return 'بدون سررسید';
    if (days < 0) return `${number(-days)} روز گذشته`;
    if (days === 0) return 'امروز';
    if (days === 1) return 'فردا';
    return `${number(days)} روز دیگر`;
  }

  function relativeDay(iso) {
    const days = daysUntil(iso);
    const label = jalaliWeekdayLabel(iso);
    if (days === 0) return `امروز · ${label}`;
    if (days === -1) return `دیروز · ${label}`;
    return label;
  }

  /* ------------------------ اعتبارسنجی و پاکسازی داده ------------------------ */

  function makeIdSource() {
    const seen = new Set();
    return value => {
      let id = cleanId(value);
      if (!id || seen.has(id)) id = cleanId(uid());
      seen.add(id);
      return id;
    };
  }

  function validDate(value) {
    const text = String(value || '').slice(0, 10);
    return isValidISO(text) ? text : '';
  }

  function validAmount(value) {
    const result = Number(value);
    return Number.isFinite(result) && result > 0 && result <= MAX_AMOUNT ? result : 0;
  }

  function normalizeSource(raw, legacyId) {
    const base = raw && typeof raw === 'object' ? raw : (legacyId ? { id: legacyId } : null);
    const id = cleanId(base?.id);
    if (!id) return null;
    const source = { kind: SOURCE_KINDS.includes(base.kind) ? base.kind : '', id };
    const previous = validDate(base.prevDue);
    if (previous) source.prevDue = previous;
    return source;
  }

  function normalizeState(raw, stats = { dropped: 0 }) {
    const base = defaultState();
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return base;
    const incoming = raw.settings && typeof raw.settings === 'object' && !Array.isArray(raw.settings) ? raw.settings : {};
    const startingBalance = Number(incoming.startingBalance ?? incoming.start ?? 0);
    const monthlyBudget = Number(incoming.monthlyBudget ?? incoming.budget ?? 0);
    const settings = {
      theme: incoming.theme === 'dark' ? 'dark' : incoming.theme === 'light' ? 'light' : base.settings.theme,
      currency: cleanText(incoming.currency, 20, 'تومان'),
      startingBalance: Number.isFinite(startingBalance) ? Math.max(-MAX_AMOUNT, Math.min(MAX_AMOUNT, Math.round(startingBalance))) : 0,
      monthlyBudget: Number.isFinite(monthlyBudget) && monthlyBudget > 0 ? Math.min(MAX_AMOUNT, Math.round(monthlyBudget)) : 0,
      lastBackup: Number.isNaN(Date.parse(incoming.lastBackup)) ? '' : String(incoming.lastBackup)
    };
    const list = value => (Array.isArray(value) ? value : []);
    const drop = () => { stats.dropped += 1; return null; };

    const installmentId = makeIdSource();
    const installments = list(raw.installments).map(item => {
      if (!item || typeof item !== 'object') return drop();
      const amount = validAmount(item.amount);
      const count = Math.round(Number(item.count));
      if (!amount || !(count >= 1 && count <= 600)) return drop();
      const paidCount = Math.max(0, Math.min(count, Math.round(Number(item.paidCount)) || 0));
      const nextDueDate = validDate(item.nextDueDate);
      const savedDay = Math.round(Number(item.dueDay));
      return {
        id: installmentId(item.id), title: cleanText(item.title, 80, 'قسط'), amount, count, paidCount, nextDueDate,
        dueDay: savedDay >= 1 && savedDay <= 31 ? savedDay : (nextDueDate ? jalaliParts(nextDueDate).jd : 0),
        status: paidCount >= count ? 'done' : 'active',
        createdAt: validDate(item.createdAt) ? item.createdAt : new Date().toISOString(), updatedAt: item.updatedAt || ''
      };
    }).filter(Boolean);

    const debtId = makeIdSource();
    const debts = list(raw.debts).map(item => {
      if (!item || typeof item !== 'object') return drop();
      const total = validAmount(item.total);
      if (!total) return drop();
      const remainingRaw = Number(item.remaining ?? total);
      const remaining = Math.max(0, Math.min(total, Number.isFinite(remainingRaw) ? remainingRaw : total));
      return {
        id: debtId(item.id), direction: item.direction === 'receivable' ? 'receivable' : 'owe', title: cleanText(item.title, 80, 'بدون عنوان'),
        total, remaining, person: cleanText(item.person, 60), dueDate: validDate(item.dueDate),
        status: remaining <= 0 ? 'done' : 'active',
        createdAt: validDate(item.createdAt) ? item.createdAt : new Date().toISOString(), updatedAt: item.updatedAt || ''
      };
    }).filter(Boolean);

    const transactionId = makeIdSource();
    const transactions = list(raw.transactions).map(item => {
      if (!item || typeof item !== 'object') return drop();
      const type = item.type === 'income' ? 'income' : item.type === 'expense' ? 'expense' : '';
      const amount = validAmount(item.amount);
      const date = validDate(item.date);
      if (!type || !amount || !date) return drop();
      const source = normalizeSource(item.source, item.sourceId);
      if (source && !source.kind) {
        if (debts.some(debt => debt.id === source.id)) source.kind = 'debt';
        else if (installments.some(installment => installment.id === source.id)) source.kind = 'installment';
      }
      const neutralByKind = source?.kind === 'debt' || source?.kind === 'debt-open';
      return {
        id: transactionId(item.id), type, amount, date, title: cleanText(item.title, 80, 'بدون عنوان'),
        category: cleanText(item.category, 30, 'سایر'), note: cleanText(item.note, 200), source,
        counted: item.counted === false ? false : !neutralByKind,
        createdAt: Number.isNaN(Date.parse(item.createdAt)) ? new Date().toISOString() : item.createdAt, updatedAt: item.updatedAt || ''
      };
    }).filter(Boolean);

    const budgetId = makeIdSource();
    const budgets = list(raw.budgets).map(item => {
      if (!item || typeof item !== 'object' || !/^\d{4}-\d{2}$/.test(String(item.month))) return drop();
      const category = cleanText(item.category, 30);
      if (category === '*') return { id: budgetId(item.id), month: item.month, category: '*', amount: 0 };
      const amount = validAmount(item.amount);
      return category && amount ? { id: budgetId(item.id), month: item.month, category, amount } : drop();
    }).filter(Boolean);

    const recurringId = makeIdSource();
    const recurring = list(raw.recurring).map(item => {
      if (!item || typeof item !== 'object') return drop();
      const amount = validAmount(item.amount);
      const day = Math.round(Number(item.day));
      const type = item.type === 'income' ? 'income' : item.type === 'expense' ? 'expense' : '';
      if (!amount || !type || !(day >= 1 && day <= 31) || !/^\d{4}-\d{2}$/.test(String(item.startMonth))) return drop();
      return {
        id: recurringId(item.id), type, amount, day, title: cleanText(item.title, 80, 'بدون عنوان'),
        category: cleanText(item.category, 30, 'سایر'), startMonth: item.startMonth,
        doneMonths: list(item.doneMonths).filter(key => /^\d{4}-\d{2}$/.test(String(key))).slice(-240)
      };
    }).filter(Boolean);

    return { version: 4, settings, transactions, installments, debts, budgets, recurring };
  }

  /* ------------------------------- ذخیره‌سازی ------------------------------- */

  function renderBanners() {
    const warning = $('#storageWarning');
    if (!warning) return;
    const message = [banners.storage, banners.data].filter(Boolean).join('\n');
    warning.hidden = !message;
    warning.textContent = message;
  }

  const STORAGE_MESSAGE = 'مرورگر اجازهٔ ذخیره‌سازی نمی‌دهد. حالت خصوصی را ببند یا فضای مرورگر را خالی کن؛ تا رفع این مشکل اطلاعات جدید ماندگار نمی‌شود.';

  function saveState(nextState = state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
      storageReady = true;
      banners.storage = '';
      renderBanners();
    } catch (error) {
      storageReady = false;
      banners.storage = STORAGE_MESSAGE;
      renderBanners();
      throw error;
    }
  }

  function commit(change) {
    const draft = clone(state);
    change(draft);
    saveState(draft);
    state = draft;
    revision += 1;
  }

  function stashPrevious() {
    try { localStorage.setItem(BACKUP_KEY, JSON.stringify(state)); } catch { /* بدون نسخهٔ قبلی ادامه می‌دهیم */ }
  }

  function hasPreviousStash() {
    try { return Boolean(localStorage.getItem(BACKUP_KEY)); } catch { return false; }
  }

  function hasSavedData() {
    try { return Boolean(localStorage.getItem(STORAGE_KEY)); } catch { return false; }
  }

  function loadState() {
    let raw = null;
    try {
      raw = localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      storageReady = false;
      banners.storage = STORAGE_MESSAGE;
      console.error('ORBIT storage error', error);
      return;
    }
    if (raw) {
      try {
        const stats = { dropped: 0 };
        state = normalizeState(JSON.parse(raw), stats);
        if (stats.dropped) {
          banners.data = `${number(stats.dropped)} رکورد نامعتبر نادیده گرفته شد. نسخهٔ اصلی در حافظهٔ مرورگر نگه داشته شده است.`;
          try { localStorage.setItem(CORRUPT_KEY, raw); } catch { /* ignore */ }
        }
      } catch (error) {
        console.error('ORBIT data error', error);
        try { localStorage.setItem(CORRUPT_KEY, raw); } catch { /* ignore */ }
        state = defaultState();
        banners.data = 'اطلاعات ذخیره‌شده قابل خواندن نبود و نسخهٔ خام آن جدا نگه داشته شد. اگر فایل پشتیبان داری، از «تنظیمات» بازیابی کن.';
      }
    }
    try {
      const testKey = `${STORAGE_KEY}_test`;
      localStorage.setItem(testKey, '1');
      localStorage.removeItem(testKey);
    } catch (error) {
      storageReady = false;
      banners.storage = STORAGE_MESSAGE;
    }
  }

  async function readLegacyStore(database, storeName) {
    return new Promise(resolve => {
      if (!database.objectStoreNames.contains(storeName)) return resolve([]);
      const request = database.transaction(storeName, 'readonly').objectStore(storeName).getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    });
  }

  async function migrateLegacyData() {
    if (hasSavedData() || !('indexedDB' in globalThis)) return;
    try {
      if (indexedDB.databases) {
        const databases = await indexedDB.databases();
        if (!databases.some(item => item.name === LEGACY_DB)) return;
      }
      const database = await new Promise((resolve, reject) => {
        const request = indexedDB.open(LEGACY_DB);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      const [settingsRows, transactions, installments, debts, budgets] = await Promise.all([
        readLegacyStore(database, 'settings'), readLegacyStore(database, 'transactions'),
        readLegacyStore(database, 'installments'), readLegacyStore(database, 'debts'), readLegacyStore(database, 'budgets')
      ]);
      database.close();
      if (![transactions, installments, debts, budgets].some(rows => rows.length)) return;
      state = normalizeState({ settings: settingsRows[0] || {}, transactions, installments, debts, budgets });
      saveState();
    } catch (error) {
      console.warn('ORBIT legacy migration skipped', error);
    }
  }

  /* ------------------------- منطق مالی (توابع خالص) ------------------------- */

  const isCounted = transaction => transaction.counted !== false;

  function totals(rows) {
    return rows.reduce((result, item) => {
      if (!isCounted(item)) return result;
      const value = Number(item.amount) || 0;
      if (item.type === 'income') result.income += value;
      if (item.type === 'expense') result.expense += value;
      return result;
    }, { income: 0, expense: 0 });
  }

  function balanceOf(source = state) {
    return source.transactions.reduce((sum, item) => sum + (item.type === 'income' ? 1 : -1) * (Number(item.amount) || 0), Number(source.settings.startingBalance) || 0);
  }

  function monthTransactions(monthKey = jalaliMonthKey(), source = state) {
    return source.transactions.filter(item => jalaliMonthKey(item.date) === monthKey);
  }

  /** بودجهٔ دسته‌ها؛ اگر برای این ماه ثبت نشده باشد، از آخرین ماهِ قبلِ دارای بودجه به ارث می‌رسد. */
  function effectiveBudgets(monthKey, source = state) {
    const months = [...new Set(source.budgets.map(item => item.month))].filter(key => key <= monthKey).sort();
    const chosen = months[months.length - 1];
    if (!chosen) return { month: '', items: [] };
    return { month: chosen, items: source.budgets.filter(item => item.month === chosen && item.category !== '*') };
  }

  function resolveSource(draft, transaction) {
    const source = transaction.source;
    if (!source?.id) return null;
    if (source.kind) return source;
    if (draft.debts.some(item => item.id === source.id)) return { ...source, kind: 'debt' };
    if (draft.installments.some(item => item.id === source.id)) return { ...source, kind: 'installment' };
    return null;
  }

  function payInstallmentDraft(draft, id, { amount, date }) {
    const item = draft.installments.find(value => value.id === id);
    if (!item || Number(item.paidCount) >= Number(item.count)) throw new Error('Installment is already complete');
    const previousDue = item.nextDueDate;
    item.paidCount = Number(item.paidCount) + 1;
    item.status = item.paidCount >= Number(item.count) ? 'done' : 'active';
    if (item.status !== 'done' && item.nextDueDate) item.nextDueDate = changeJalaliMonth(item.nextDueDate, 1, item.dueDay);
    const source = { kind: 'installment', id };
    if (previousDue) source.prevDue = previousDue;
    draft.transactions.push({
      id: cleanId(uid()), type: 'expense', amount, date, counted: true, category: 'قسط', title: `قسط: ${item.title}`,
      note: `قسط ${number(item.paidCount)} از ${number(item.count)}`, source, createdAt: new Date().toISOString()
    });
  }

  function payDebtDraft(draft, id, { amount, date }) {
    const item = draft.debts.find(value => value.id === id);
    if (!item || Number(item.remaining) < amount) throw new Error('Debt balance changed');
    item.remaining = Number(item.remaining) - amount;
    item.status = item.remaining <= 0 ? 'done' : 'active';
    draft.transactions.push({
      id: cleanId(uid()), type: item.direction === 'owe' ? 'expense' : 'income', amount, date, counted: false, category: 'بدهی',
      title: `${item.direction === 'owe' ? 'پرداخت بدهی' : 'دریافت طلب'}: ${item.title}`, note: item.person || '',
      source: { kind: 'debt', id }, createdAt: new Date().toISOString()
    });
  }

  /** پیش از حذف یک تراکنشِ وصل‌شده، اثر آن را روی قسط یا بدهی برمی‌گرداند. */
  function revertSourceDraft(draft, transaction) {
    const source = resolveSource(draft, transaction);
    if (!source) return;
    if (source.kind === 'debt') {
      const debt = draft.debts.find(item => item.id === source.id);
      if (debt) {
        debt.remaining = Math.min(Number(debt.total), Number(debt.remaining) + Number(transaction.amount));
        debt.status = debt.remaining > 0 ? 'active' : 'done';
      }
    } else if (source.kind === 'installment') {
      const item = draft.installments.find(value => value.id === source.id);
      if (!item) return;
      const wasDone = Number(item.paidCount) >= Number(item.count);
      item.paidCount = Math.max(0, Number(item.paidCount) - 1);
      item.status = 'active';
      if (source.prevDue) item.nextDueDate = source.prevDue;
      else if (!wasDone && item.nextDueDate) item.nextDueDate = changeJalaliMonth(item.nextDueDate, -1, item.dueDay);
    }
  }

  function removeTransactionDraft(draft, id) {
    const transaction = draft.transactions.find(item => item.id === id);
    if (!transaction) return;
    revertSourceDraft(draft, transaction);
    draft.transactions = draft.transactions.filter(item => item.id !== id);
  }

  /** تراکنش‌های تکراری ماهانه را تا امروز می‌سازد. تعداد موارد ساخته‌شده را برمی‌گرداند. */
  function applyRecurringDraft(draft, todayISO) {
    const today = jalaliParts(todayISO);
    const currentKey = monthKeyOf(today.jy, today.jm);
    let created = 0;
    draft.recurring.forEach(rule => {
      rule.doneMonths = Array.isArray(rule.doneMonths) ? rule.doneMonths : [];
      let key = rule.startMonth;
      for (let guard = 0; guard < 120 && key <= currentKey; guard += 1, key = nextMonthKey(key)) {
        if (rule.doneMonths.includes(key)) continue;
        const [year, month] = key.split('-').map(Number);
        const day = Math.min(rule.day, jalaliMonthLength(year, month));
        if (key === currentKey && day > today.jd) continue;
        const date = jalaliToISO(year, month, day);
        if (!date) continue;
        draft.transactions.push({
          id: cleanId(uid()), type: rule.type, amount: rule.amount, date, counted: true, category: rule.category, title: rule.title,
          note: 'تکرار ماهانه', source: { kind: 'recurring', id: rule.id }, createdAt: new Date().toISOString()
        });
        rule.doneMonths.push(key);
        created += 1;
      }
    });
    return created;
  }

  function upcomingItems(source = state) {
    const result = [];
    source.installments.filter(item => item.status !== 'done' && Number(item.paidCount) < Number(item.count)).forEach(item => {
      result.push({ title: item.title, amount: item.amount, date: item.nextDueDate, detail: `قسط ${number(Number(item.paidCount) + 1)} از ${number(item.count)}`, incoming: false });
    });
    source.debts.filter(item => item.status !== 'done' && Number(item.remaining) > 0).forEach(item => {
      result.push({ title: item.title, amount: item.remaining, date: item.dueDate, detail: item.direction === 'owe' ? 'بدهی من' : 'طلب من', incoming: item.direction === 'receivable' });
    });
    return result.filter(item => item.date).sort((a, b) => a.date.localeCompare(b.date));
  }

  /* ------------------------------ اجزای رابط ------------------------------ */

  function toast(message, action) {
    const element = $('#toast');
    if (!element) return;
    element.textContent = '';
    const text = document.createElement('span');
    text.textContent = message;
    element.append(text);
    element.classList.toggle('has-action', Boolean(action));
    if (action) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = action.label;
      button.addEventListener('click', () => { element.classList.remove('show'); action.run(); });
      element.append(button);
    }
    element.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => element.classList.remove('show'), action ? 6500 : 2400);
  }

  function applyTheme() {
    document.documentElement.dataset.theme = state.settings.theme;
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) themeMeta.content = state.settings.theme === 'dark' ? '#151515' : '#e8e8e4';
    const toggle = $('#themeToggle');
    if (toggle) toggle.innerHTML = icon(state.settings.theme === 'dark' ? 'sun' : 'moon');
  }

  function pageHead(eyebrow, title, actions = '') {
    return `<div class="page-head"><div><div class="eyebrow">${escapeHtml(eyebrow)}</div><h1>${escapeHtml(title)}</h1></div><div class="actions">${actions}</div></div>`;
  }

  function empty(title, description, actionMarkup = '') {
    return `<div class="empty"><strong>${escapeHtml(title)}</strong><span>${escapeHtml(description)}</span>${actionMarkup}</div>`;
  }

  function stat(title, value, iconName, className, description) {
    return `<div class="panel stat"><div class="stat-top"><span>${escapeHtml(title)}</span><span>${icon(iconName)}</span></div><strong class="${className}">${value}</strong><span class="muted">${escapeHtml(description)}</span></div>`;
  }

  function transactionRow(transaction) {
    const expense = transaction.type === 'expense';
    const neutral = !isCounted(transaction);
    const details = [transaction.category || 'سایر', jalaliDateLabel(transaction.date), transaction.note].filter(Boolean).map(escapeHtml).join(' · ');
    return `<div class="list-item">
      <span class="item-icon">${icon(expense ? 'down' : 'up')}</span>
      <div class="grow"><div class="title">${escapeHtml(transaction.title)}</div><div class="sub">${details}${neutral ? ' · <span class="tag">بدهی و طلب</span>' : ''}</div></div>
      <div class="amount ${expense ? 'negative' : 'positive'}">${expense ? '−' : '+'}${number(transaction.amount)} <small>${escapeHtml(state.settings.currency)}</small></div>
      <button class="icon-button small" type="button" data-action="transaction-menu" data-id="${escapeHtml(transaction.id)}" aria-label="گزینه‌های تراکنش">${icon('more')}</button>
    </div>`;
  }

  function sortTransactions(rows) {
    return rows.sort((a, b) => `${b.date}${b.createdAt || ''}`.localeCompare(`${a.date}${a.createdAt || ''}`));
  }

  function renderNavigation() {
    const markup = NAVIGATION.map(([page, iconName, label]) => `<button class="nav-button ${currentPage === page ? 'active' : ''}" type="button" data-page="${page}" ${currentPage === page ? 'aria-current="page"' : ''}><span class="nav-icon">${icon(iconName)}</span><span>${label}</span></button>`).join('');
    $('#desktopNav').innerHTML = markup;
    $('#mobileNav').innerHTML = markup;
  }

  function isStandalone() {
    try { return Boolean(globalThis.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone); } catch { return false; }
  }
  function isIOS() {
    return /iphone|ipad|ipod/i.test(navigator.userAgent || '') || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  function backupNag() {
    if (backupNagDismissed || state.transactions.length < 5) return '';
    const last = state.settings.lastBackup ? Date.parse(state.settings.lastBackup) : 0;
    const age = last ? (Date.now() - last) / 86400000 : Infinity;
    if (age < 30) return '';
    return `<div class="notice"><span class="notice-icon">${icon('download')}</span><div class="grow"><strong>${last ? 'مدتی است پشتیبان نگرفته‌ای' : 'هنوز پشتیبان نگرفته‌ای'}</strong><div class="sub">اطلاعات فقط روی همین دستگاه است. یک فایل پشتیبان بگیر تا با پاک‌شدن داده‌های مرورگر یا تعویض گوشی از دست نرود.</div></div><div class="actions"><button class="button small primary" type="button" data-action="export">دریافت پشتیبان</button><button class="button small" type="button" data-action="dismiss-backup">بعداً</button></div></div>`;
  }

  function welcomeCard() {
    if (state.transactions.length || state.installments.length || state.debts.length) return '';
    return `<div class="panel welcome"><h2>از همین‌جا شروع کن</h2><ol>
      <li><span>موجودی فعلی‌ات را بنویس تا «موجودی کل» درست محاسبه شود.</span><button class="button small" type="button" data-page="settings">تنظیم موجودی شروع</button></li>
      <li><span>اولین خرج یا درآمدت را ثبت کن؛ فقط مبلغ و عنوان کافی است.</span><button class="button small primary" type="button" data-action="new-transaction" data-kind="expense">ثبت خرج</button></li>
      <li><span>قسط، وام یا قرض داری؟ سررسیدش را اضافه کن تا یادت نرود.</span><button class="button small" type="button" data-action="new-installment">قسط جدید</button></li>
    </ol></div>`;
  }

  function renderDashboard() {
    const monthKey = jalaliMonthKey();
    const rows = monthTransactions(monthKey);
    const result = totals(rows);
    const previous = totals(monthTransactions(jalaliMonthKey(shiftJalaliMonth(cursor, -1))));
    const budget = Number(state.settings.monthlyBudget || 0);
    const remainingBudget = budget - result.expense;
    const parts = jalaliParts(cursor);
    const monthLength = jalaliMonthLength(parts.jy, parts.jm);
    const todayKey = jalaliMonthKey(localISO());
    let daysLeft = 0;
    if (monthKey === todayKey) daysLeft = Math.max(1, monthLength - jalaliParts(localISO()).jd + 1);
    else if (monthKey > todayKey) daysLeft = monthLength;
    const dailyCap = budget && daysLeft ? Math.max(0, remainingBudget) / daysLeft : null;
    const recent = sortTransactions([...rows]).slice(0, 5);
    const near = upcomingItems().filter(item => daysUntil(item.date) <= 30);
    const payableTotal = near.filter(item => !item.incoming).reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const incomingTotal = near.filter(item => item.incoming).reduce((sum, item) => sum + Number(item.amount || 0), 0);
    let expenseNote = 'بدون بودجه';
    if (budget) expenseNote = `${number(Math.round(result.expense / budget * 100))}٪ از بودجه`;
    else if (previous.expense > 0) {
      const change = Math.round((result.expense - previous.expense) / previous.expense * 100);
      expenseNote = change === 0 ? 'برابر ماه قبل' : `${number(Math.abs(change))}٪ ${change > 0 ? 'بیشتر' : 'کمتر'} از ماه قبل`;
    }
    const net = result.income - result.expense;
    $('#screen').innerHTML = `
      ${pageHead('نمای کلی مالی', 'پولت کجاست؟', '<button class="button" type="button" data-action="budget">تنظیم بودجه</button>')}
      ${backupNag()}${welcomeCard()}
      <div class="panel hero">
        <div class="hero-main"><div class="label">موجودی تخمینی کل</div><div class="hero-value ${balanceOf() < 0 ? 'negative' : ''}">${number(balanceOf())} <small>${escapeHtml(state.settings.currency)}</small></div><div class="chips"><span class="chip">درآمد ماه: ${number(result.income)}</span><span class="chip">خرج ماه: ${number(result.expense)}</span></div></div>
        <div class="hero-side"><div><div class="label">مانده بودجهٔ ماه</div><strong class="${budget && remainingBudget < 0 ? 'negative' : ''}">${budget ? number(remainingBudget) : 'تنظیم نشده'}</strong></div><div><div class="label">سقف خرج روزانه</div><strong>${dailyCap === null ? '—' : number(dailyCap)}</strong></div></div>
      </div>
      <div class="grid four stats">
        ${stat('درآمد ماه', number(result.income), 'up', 'positive', state.settings.currency)}
        ${stat('خرج ماه', number(result.expense), 'down', 'negative', expenseNote)}
        ${stat('مانده ماه', number(net), 'wallet', net >= 0 ? 'positive' : 'negative', 'درآمد منهای خرج')}
        ${stat('تعهد ۳۰ روز آینده', number(payableTotal), 'clock', '', incomingTotal ? `${number(incomingTotal)} هم باید بگیری` : `${number(near.filter(item => !item.incoming).length)} مورد`)}
      </div>
      <div class="section-head"><h2>ثبت سریع</h2><span class="muted">مستقیم و بدون مرحلهٔ اضافه</span></div>
      <div class="quick-actions">
        <button class="quick-action" type="button" data-action="new-transaction" data-kind="expense"><span class="round-icon">${icon('minus')}</span><strong>ثبت خرج</strong></button>
        <button class="quick-action" type="button" data-action="new-transaction" data-kind="income"><span class="round-icon">${icon('plus')}</span><strong>ثبت درآمد</strong></button>
        <button class="quick-action" type="button" data-action="new-installment"><span class="round-icon">${icon('clock')}</span><strong>قسط جدید</strong></button>
        <button class="quick-action" type="button" data-action="new-debt"><span class="round-icon">${icon('exchange')}</span><strong>بدهی یا طلب</strong></button>
      </div>
      <div class="grid two split">
        <div class="panel"><div class="section-head tight"><h2>آخرین تراکنش‌ها</h2><button class="button small" type="button" data-page="transactions">همه</button></div>${recent.length ? `<div class="list">${recent.map(transactionRow).join('')}</div>` : empty('این ماه تراکنشی نداری', 'اولین خرج یا درآمدت را اضافه کن')}</div>
        <div class="panel"><div class="section-head tight"><h2>پرداخت‌ها و دریافت‌های نزدیک</h2><button class="button small" type="button" data-page="obligations">همه</button></div>${near.length ? `<div class="list">${near.slice(0, 5).map(item => `<div class="list-item"><span class="dot ${item.incoming ? 'in' : 'out'}"></span><div class="grow"><div class="title">${escapeHtml(item.title)}</div><div class="sub">${escapeHtml(item.detail)} · ${jalaliDateLabel(item.date)}</div></div><div class="due"><strong class="${item.incoming ? 'positive' : ''}">${number(item.amount)}</strong><div class="sub ${daysUntil(item.date) < 0 ? 'negative' : ''}">${dueLabel(item.date)}</div></div></div>`).join('')}</div>` : empty('موردی در ۳۰ روز آینده نیست', 'قسط‌ها و بدهی‌های سررسیددار اینجا دیده می‌شوند')}</div>
      </div>`;
  }

  function groupedTransactions(rows, showMonthNote) {
    if (!rows.length) {
      return empty('تراکنشی پیدا نشد', transactionQuery ? 'عبارت دیگری را جست‌وجو کن' : 'یک مورد ثبت کن یا فیلتر و ماه را تغییر بده',
        transactionQuery ? '' : '<button class="button primary small" type="button" data-action="new-transaction" data-kind="expense">ثبت تراکنش</button>');
    }
    const groups = new Map();
    rows.forEach(row => {
      if (!groups.has(row.date)) groups.set(row.date, []);
      groups.get(row.date).push(row);
    });
    return `${showMonthNote ? '<div class="sub search-note">در همهٔ ماه‌ها جست‌وجو شد</div>' : ''}${[...groups].map(([date, items]) => {
      const spent = items.filter(item => item.type === 'expense' && isCounted(item)).reduce((sum, item) => sum + Number(item.amount), 0);
      return `<section class="day-group"><div class="day-head"><span>${escapeHtml(relativeDay(date))}</span>${spent ? `<span>${number(spent)} خرج</span>` : ''}</div><div class="list">${items.map(transactionRow).join('')}</div></section>`;
    }).join('')}`;
  }

  function filteredTransactions() {
    const query = normalizeSearch(transactionQuery);
    let rows = query ? [...state.transactions] : monthTransactions();
    if (transactionFilter === 'debt') rows = rows.filter(item => !isCounted(item));
    else if (transactionFilter !== 'all') rows = rows.filter(item => item.type === transactionFilter && isCounted(item));
    if (query) {
      const digits = /^[\d٬,\s]+$/.test(enDigits(query)) ? enDigits(query).replace(/\D/g, '') : '';
      rows = rows.filter(item => normalizeSearch(`${item.title} ${item.category} ${item.note || ''}`).includes(query) || (digits && String(item.amount).includes(digits)));
    }
    return sortTransactions(rows);
  }

  function updateTransactionList() {
    const container = $('#txList');
    if (container) container.innerHTML = groupedTransactions(filteredTransactions(), Boolean(normalizeSearch(transactionQuery)));
  }

  function renderTransactions() {
    const result = totals(monthTransactions());
    const filters = [['all', 'همه'], ['expense', 'خرج‌ها'], ['income', 'درآمدها'], ['debt', 'بدهی و طلب']];
    $('#screen').innerHTML = `
      ${pageHead('ورودی و خروجی', 'تراکنش‌ها', '<button class="button" type="button" data-action="new-transaction" data-kind="income">ثبت درآمد</button><button class="button primary" type="button" data-action="new-transaction" data-kind="expense">ثبت خرج</button>')}
      <div class="panel">
        <div class="chips month-chips"><span class="chip">درآمد ${jalaliMonthLabel(cursor)}: <b class="positive">${number(result.income)}</b></span><span class="chip">خرج: <b class="negative">${number(result.expense)}</b></span></div>
        <div class="toolbar"><label class="search">${icon('search')}<input id="transactionSearch" type="search" enterkeyhint="search" value="${escapeHtml(transactionQuery)}" placeholder="جست‌وجوی عنوان، دسته یا مبلغ" autocomplete="off" aria-label="جست‌وجو"></label><div class="filters" role="group" aria-label="فیلتر">${filters.map(([value, label]) => `<button class="filter ${transactionFilter === value ? 'active' : ''}" type="button" data-action="transaction-filter" data-filter="${value}" aria-pressed="${transactionFilter === value}">${label}</button>`).join('')}</div></div>
        <div id="txList"></div>
      </div>`;
    updateTransactionList();
  }

  function installmentCard(item) {
    const count = Math.max(1, Number(item.count) || 1);
    const paid = Math.min(count, Number(item.paidCount) || 0);
    const done = item.status === 'done' || paid >= count;
    const progress = Math.round(paid / count * 100);
    const overdue = !done && item.nextDueDate && daysUntil(item.nextDueDate) < 0;
    return `<div class="panel obligation ${overdue ? 'overdue' : ''}">
      <div class="obligation-head"><span class="item-icon">${icon('clock')}</span><div class="grow"><div class="title">${escapeHtml(item.title)}</div><div class="sub">${done ? 'تسویه شده' : `قسط ${number(paid + 1)} از ${number(count)}`}</div></div><span class="badge ${overdue ? 'alert' : ''}">${done ? 'تمام‌شده' : dueLabel(item.nextDueDate)}</span></div>
      <div class="obligation-amount">${number(item.amount)} <small>${escapeHtml(state.settings.currency)}</small></div>
      <div class="progress" role="progressbar" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100"><span style="width:${progress}%"></span></div><div class="meta"><span>${number(paid)} پرداخت</span><span>${done ? '' : `سررسید ${jalaliDateLabel(item.nextDueDate)}`}</span><span>${number(progress)}٪</span></div>
      <div class="obligation-actions">${done ? '' : `<button class="button primary small" type="button" data-action="pay-installment" data-id="${escapeHtml(item.id)}">ثبت پرداخت</button>`}<button class="button small" type="button" data-action="edit-installment" data-id="${escapeHtml(item.id)}">ویرایش</button><button class="button danger small" type="button" data-action="delete-obligation" data-store="installments" data-id="${escapeHtml(item.id)}">حذف</button></div>
    </div>`;
  }

  function debtCard(item) {
    const total = Number(item.total) || 0;
    const remaining = Math.max(0, Number(item.remaining) || 0);
    const done = item.status === 'done' || remaining <= 0;
    const progress = total ? Math.round((total - remaining) / total * 100) : 100;
    const overdue = !done && item.dueDate && daysUntil(item.dueDate) < 0;
    const owe = item.direction === 'owe';
    return `<div class="panel obligation ${overdue ? 'overdue' : ''}">
      <div class="obligation-head"><span class="item-icon">${icon(owe ? 'down' : 'up')}</span><div class="grow"><div class="title">${escapeHtml(item.title)}</div><div class="sub">${owe ? 'من بدهکارم' : 'من طلبکارم'}${item.person ? ` · ${escapeHtml(item.person)}` : ''}</div></div><span class="badge ${overdue ? 'alert' : ''}">${done ? 'تسویه‌شده' : dueLabel(item.dueDate)}</span></div>
      <div class="obligation-amount ${owe ? '' : 'positive'}">${number(remaining)} <small>${escapeHtml(state.settings.currency)} مانده</small></div>
      <div class="progress" role="progressbar" aria-valuenow="${Math.max(0, Math.min(100, progress))}" aria-valuemin="0" aria-valuemax="100"><span style="width:${Math.max(0, Math.min(100, progress))}%"></span></div><div class="meta"><span>اصل: ${number(total)}</span><span>${number(progress)}٪ تسویه</span></div>
      <div class="obligation-actions">${done ? '' : `<button class="button primary small" type="button" data-action="pay-debt" data-id="${escapeHtml(item.id)}">ثبت ${owe ? 'پرداخت' : 'دریافت'}</button>`}<button class="button small" type="button" data-action="edit-debt" data-id="${escapeHtml(item.id)}">ویرایش</button><button class="button danger small" type="button" data-action="delete-obligation" data-store="debts" data-id="${escapeHtml(item.id)}">حذف</button></div>
    </div>`;
  }

  function renderObligations() {
    const installments = [...state.installments].sort((a, b) => (a.status === 'done') - (b.status === 'done') || String(a.nextDueDate || '9').localeCompare(String(b.nextDueDate || '9')));
    const debts = [...state.debts].sort((a, b) => (a.status === 'done') - (b.status === 'done') || String(a.dueDate || '9').localeCompare(String(b.dueDate || '9')));
    const owe = debts.filter(item => item.status !== 'done' && item.direction === 'owe').reduce((sum, item) => sum + Number(item.remaining), 0);
    const receivable = debts.filter(item => item.status !== 'done' && item.direction === 'receivable').reduce((sum, item) => sum + Number(item.remaining), 0);
    const installmentsLeft = installments.filter(item => item.status !== 'done').reduce((sum, item) => sum + (Number(item.count) - Number(item.paidCount)) * Number(item.amount), 0);
    const summary = installments.length || debts.length ? `<div class="grid three stats">
        ${stat('اقساط باقی‌مانده', number(installmentsLeft), 'clock', '', state.settings.currency)}
        ${stat('بدهی من', number(owe), 'down', owe ? 'negative' : '', state.settings.currency)}
        ${stat('طلب من', number(receivable), 'up', receivable ? 'positive' : '', state.settings.currency)}
      </div>` : '';
    $('#screen').innerHTML = `
      ${pageHead('تعهدات مالی', 'قسط و بدهی', '<button class="button" type="button" data-action="new-debt">بدهی یا طلب جدید</button><button class="button primary" type="button" data-action="new-installment">قسط جدید</button>')}
      ${summary}
      <div class="section-head"><h2>قسط‌ها</h2><span class="muted">${number(installments.filter(item => item.status !== 'done').length)} فعال</span></div>
      ${installments.length ? `<div class="grid three">${installments.map(installmentCard).join('')}</div>` : empty('قسطی ثبت نشده', 'قسط‌هایت را اضافه کن تا سررسیدها مشخص باشند', '<button class="button primary small" type="button" data-action="new-installment">قسط جدید</button>')}
      <div class="section-head"><h2>بدهی‌ها و طلب‌ها</h2><span class="muted">${number(debts.filter(item => item.status !== 'done').length)} باز</span></div>
      ${debts.length ? `<div class="grid three">${debts.map(debtCard).join('')}</div>` : empty('بدهی یا طلبی ثبت نشده', 'پولی که باید بدهی یا بگیری را اینجا نگه دار', '<button class="button primary small" type="button" data-action="new-debt">بدهی یا طلب جدید</button>')}`;
  }

  function renderReports() {
    const months = [];
    for (let offset = 5; offset >= 0; offset -= 1) {
      const date = shiftJalaliMonth(cursor, -offset);
      months.push({ date, key: jalaliMonthKey(date), ...totals(monthTransactions(jalaliMonthKey(date))) });
    }
    const maximum = Math.max(1, ...months.flatMap(item => [item.income, item.expense]));
    const monthKey = jalaliMonthKey();
    const rows = monthTransactions(monthKey);
    const categories = {};
    rows.filter(item => item.type === 'expense' && isCounted(item)).forEach(item => {
      const category = item.category || 'سایر';
      categories[category] = (categories[category] || 0) + Number(item.amount || 0);
    });
    const categoryRows = Object.entries(categories).sort((a, b) => b[1] - a[1]);
    const categoryMax = Math.max(1, ...categoryRows.map(item => item[1]));
    const current = totals(rows);
    const savingRate = current.income ? Math.round((current.income - current.expense) / current.income * 100) : null;
    const budgets = effectiveBudgets(monthKey);
    const spentBy = category => (categories[category] || 0);
    $('#screen').innerHTML = `
      ${pageHead('تحلیل ساده و کاربردی', 'گزارش ماه')}
      <div class="grid two">
        <div class="panel"><h2>روند شش ماهه</h2>
          <div class="bars" role="img" aria-label="نمودار درآمد و خرج شش ماه اخیر">${months.map(item => `<div class="bar-column ${item.key === monthKey ? 'current' : ''}"><span class="bar income" style="height:${Math.max(1, item.income / maximum * 100)}%"></span><span class="bar expense" style="height:${Math.max(1, item.expense / maximum * 100)}%"></span></div>`).join('')}</div>
          <div class="month-names">${months.map(item => `<span class="${item.key === monthKey ? 'current' : ''}">${JALALI_MONTHS[jalaliParts(item.date).jm - 1]}</span>`).join('')}</div>
          <div class="legend"><span><i class="dot solid"></i> درآمد</span><span><i class="dot soft"></i> خرج</span></div>
          <div class="mini-table"><div class="mini-row head"><span>ماه</span><span>درآمد</span><span>خرج</span><span>مانده</span></div>${months.slice().reverse().map(item => `<div class="mini-row ${item.key === monthKey ? 'current' : ''}"><span>${JALALI_MONTHS[jalaliParts(item.date).jm - 1]}</span><span>${number(item.income)}</span><span>${number(item.expense)}</span><span class="${item.income - item.expense < 0 ? 'negative' : 'positive'}">${number(item.income - item.expense)}</span></div>`).join('')}</div>
        </div>
        <div class="panel"><h2>خرج بر اساس دسته</h2>${categoryRows.length ? `<div class="category-list">${categoryRows.map(([category, value]) => `<div class="category-row"><span>${escapeHtml(category)}</span><div class="category-meter"><span style="width:${Math.round(value / categoryMax * 100)}%"></span></div><strong>${number(value)} <small class="muted">(${number(Math.round(value / current.expense * 100))}٪)</small></strong></div>`).join('')}</div>` : empty('هنوز داده‌ای نیست', 'چند خرج ثبت کن تا الگوی هزینه ساخته شود')}</div>
      </div>
      <div class="grid three stats">${stat('درآمد', number(current.income), 'up', 'positive', state.settings.currency)}${stat('خرج', number(current.expense), 'down', 'negative', state.settings.currency)}${stat('نرخ پس‌انداز', savingRate === null ? '—' : `${number(savingRate)}٪`, 'wallet', savingRate !== null && savingRate < 0 ? 'negative' : 'positive', 'از درآمد ماه')}</div>
      <div class="section-head"><h2>بودجهٔ دسته‌ها</h2><button class="button small" type="button" data-action="budget">ویرایش</button></div>
      ${budgets.items.length ? `${budgets.month && budgets.month !== monthKey ? `<div class="hint">سقف‌ها از ${escapeHtml(monthKeyLabel(budgets.month))} ادامه پیدا کرده‌اند. برای تغییر، «ویرایش» را بزن.</div>` : ''}<div class="grid three">${budgets.items.map(item => {
        const spent = spentBy(item.category);
        const ratio = spent / Number(item.amount || 1);
        const left = Number(item.amount) - spent;
        return `<div class="panel budget-card"><div class="budget-top"><strong>${escapeHtml(item.category)}</strong><span class="${ratio > 1 ? 'negative' : ''}">${number(Math.round(ratio * 100))}٪</span></div><div class="progress ${ratio > 1 ? 'over' : ratio >= .85 ? 'warn' : ''}"><span style="width:${Math.min(100, ratio * 100)}%"></span></div><div class="meta"><span>${number(spent)} خرج</span><span>${left >= 0 ? `${number(left)} مانده` : `${number(-left)} بیشتر از سقف`}</span></div></div>`;
      }).join('')}</div>` : empty('بودجهٔ دسته‌ای نداری', 'برای دسته‌های مهم سقف جدا تعیین کن؛ ماه‌های بعد هم ادامه پیدا می‌کند', '<button class="button primary small" type="button" data-action="budget">تعیین بودجه</button>')}`;
  }

  function settingRow(title, description, id, value, options = '') {
    return `<div class="settings-row"><div class="grow"><label for="${id}"><strong>${escapeHtml(title)}</strong></label><div class="sub">${escapeHtml(description)}</div></div><input id="${id}" ${options} value="${escapeHtml(value)}"></div>`;
  }

  function recurringRow(rule) {
    return `<div class="list-item"><span class="item-icon">${icon('repeat')}</span><div class="grow"><div class="title">${escapeHtml(rule.title)}</div><div class="sub">هر ماه، روز ${number(rule.day)} · ${rule.type === 'income' ? 'درآمد' : 'خرج'} · ${escapeHtml(rule.category)}</div></div><div class="amount ${rule.type === 'income' ? 'positive' : 'negative'}">${number(rule.amount)}</div><button class="icon-button small" type="button" data-action="edit-recurring" data-id="${escapeHtml(rule.id)}" aria-label="ویرایش">${icon('edit')}</button><button class="icon-button small" type="button" data-action="delete-recurring" data-id="${escapeHtml(rule.id)}" aria-label="حذف">${icon('trash')}</button></div>`;
  }

  function renderSettings() {
    const last = state.settings.lastBackup ? jalaliDateLabel(localISO(state.settings.lastBackup)) : 'هرگز';
    const iosHint = isIOS() && !isStandalone()
      ? '<div class="hint"><strong>روی آیفون:</strong> حافظهٔ Safari و برنامهٔ نصب‌شده از هم جداست. اول با «Add to Home Screen» برنامه را نصب کن و بعد اطلاعات را وارد کن.</div>' : '';
    $('#screen').innerHTML = `
      ${pageHead('شخصی‌سازی و پشتیبان', 'تنظیمات')}
      <div class="grid two">
        <div class="panel"><h2>تنظیمات مالی</h2>
          ${settingRow('واحد پول', 'مثلاً تومان یا ریال', 'currencySetting', state.settings.currency, 'maxlength="20" autocomplete="off"')}
          <div class="settings-row"><div class="grow"><label for="startingBalanceSetting"><strong>موجودی شروع</strong></label><div class="sub">پولی که پیش از ثبت‌ها داشتی (می‌تواند منفی باشد)</div></div><div class="field-inline"><input id="startingBalanceSetting" inputmode="text" autocomplete="off" data-money data-signed value="${state.settings.startingBalance ? (state.settings.startingBalance < 0 ? '−' : '') + faMoney(Math.abs(state.settings.startingBalance)) : ''}" placeholder="۰"><div class="money-words"></div></div></div>
          <div class="settings-row"><div class="grow"><label for="monthlyBudgetSetting"><strong>بودجهٔ ماهانه</strong></label><div class="sub">حداکثر خرج مطلوب در هر ماه</div></div><div class="field-inline"><input id="monthlyBudgetSetting" inputmode="numeric" autocomplete="off" data-money value="${state.settings.monthlyBudget ? faMoney(state.settings.monthlyBudget) : ''}" placeholder="بدون سقف"><div class="money-words"></div></div></div>
          <button class="button primary block" type="button" data-action="save-settings">ذخیرهٔ تنظیمات</button>
        </div>
        <div class="panel"><h2>پشتیبان اطلاعات</h2>
          <p class="muted lead">اطلاعات فقط روی همین مرورگر ذخیره می‌شود. پیش از پاک‌کردن داده‌های مرورگر یا تعویض گوشی، فایل پشتیبان بگیر.</p>
          ${iosHint}
          <div class="sub backup-status">آخرین پشتیبان: ${escapeHtml(last)}</div>
          <div class="actions"><button class="button primary" type="button" data-action="export">دریافت پشتیبان</button><label class="button">بازیابی از فایل<input id="importInput" hidden type="file" accept=".json,application/json"></label></div>
          ${hasPreviousStash() ? '<div class="actions stash"><button class="button small" type="button" data-action="restore-previous">بازگرداندن نسخهٔ پیش از آخرین بازیابی یا پاک‌سازی</button></div>' : ''}
        </div>
        <div class="panel"><h2>تراکنش‌های تکراری</h2>
          <p class="muted lead">اجاره، اینترنت یا حقوق را یک بار تعریف کن تا هر ماه خودکار ثبت شود.</p>
          ${state.recurring.length ? `<div class="list">${state.recurring.map(recurringRow).join('')}</div>` : ''}
          <div class="actions"><button class="button" type="button" data-action="new-recurring">${icon('plus')} تعریف مورد تکراری</button></div>
        </div>
        <div class="panel"><h2>ظاهر</h2><button class="button" type="button" data-action="theme">تغییر حالت روشن و تاریک</button><p class="sub version">نسخهٔ ${APP_VERSION}</p></div>
        <div class="panel danger-zone"><h2>پاک‌سازی</h2><p class="muted">همهٔ تراکنش‌ها، بدهی‌ها و اقساط حذف می‌شوند.</p><button class="button danger" type="button" data-action="clear-data">پاک کردن همهٔ اطلاعات</button></div>
      </div>`;
    $('#importInput')?.addEventListener('change', event => importData(event.target.files?.[0]));
    refreshInputs($('#screen'));
  }

  function render() {
    $('#monthLabel').textContent = jalaliMonthLabel(cursor);
    renderNavigation();
    applyTheme();
    const renderers = { dashboard: renderDashboard, transactions: renderTransactions, obligations: renderObligations, reports: renderReports, settings: renderSettings };
    try {
      (renderers[currentPage] || renderDashboard)();
    } catch (error) {
      console.error('ORBIT render error', error);
      $('#screen').innerHTML = '<div class="fatal">نمایش این صفحه با خطا روبه‌رو شد. صفحه را دوباره بارگذاری کن؛ اطلاعاتت دست‌نخورده است.</div>';
    }
    if (!storageReady) banners.storage = STORAGE_MESSAGE;
    renderBanners();
  }

  function navigate(page) {
    if (!NAVIGATION.some(item => item[0] === page)) return;
    currentPage = page;
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* -------------------------------- مودال -------------------------------- */

  function modalHeader(title) {
    return `<div class="modal-head"><h2 id="modalTitle">${escapeHtml(title)}</h2><button class="icon-button" type="button" data-action="close-modal" aria-label="بستن">${icon('close')}</button></div>`;
  }

  function openModal(markup) {
    if (!$('#modal').classList.contains('open')) lastFocus = document.activeElement;
    $('#modalBox').innerHTML = markup;
    $('#modalBox').setAttribute('aria-labelledby', 'modalTitle');
    $('#modal').classList.add('open');
    $('#modal').setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('modal-open');
    $('#toast')?.classList.remove('show');
    refreshInputs($('#modalBox'));
    setTimeout(() => {
      // اگر کاربر خودش همین حالا روی فیلدی ضربه زده باشد، فوکوس را از او نمی‌گیریم.
      if ($('#modalBox').contains(document.activeElement)) return;
      ($('#modalBox [data-autofocus]') || $('#modalBox .icon-button'))?.focus({ preventScroll: true });
    }, 40);
  }

  function closeModal() {
    $('#modal').classList.remove('open');
    $('#modal').setAttribute('aria-hidden', 'true');
    $('#modalBox').innerHTML = '';
    document.documentElement.classList.remove('modal-open');
    if (lastFocus?.isConnected) lastFocus.focus({ preventScroll: true });
    lastFocus = null;
  }

  function askConfirm({ title = 'تأیید', message, okLabel = 'تأیید', danger = false }) {
    return new Promise(resolve => {
      const box = $('#confirmBox');
      box.innerHTML = `<h2 id="confirmTitle">${escapeHtml(title)}</h2><p>${escapeHtml(message)}</p><div class="form-actions"><button class="button" type="button" data-confirm="no">انصراف</button><button class="button ${danger ? 'danger-solid' : 'primary'}" type="button" data-confirm="yes">${escapeHtml(okLabel)}</button></div>`;
      const dialog = $('#confirmModal');
      const finish = value => {
        dialog.classList.remove('open');
        dialog.setAttribute('aria-hidden', 'true');
        box.innerHTML = '';
        confirmResolver = null;
        resolve(value);
      };
      confirmResolver = finish;
      dialog.classList.add('open');
      dialog.setAttribute('aria-hidden', 'false');
      setTimeout(() => box.querySelector('[data-confirm="no"]')?.focus({ preventScroll: true }), 30);
    });
  }

  /* ------------------------ ورودی‌های مبلغ و تاریخ ------------------------ */

  function updateMoneyWords(input) {
    const target = input.closest('.field, .field-inline')?.querySelector('.money-words');
    if (!target) return;
    const value = parseMoney(input.value, { signed: input.hasAttribute('data-signed') });
    target.textContent = value !== null && Math.abs(value) >= 1000 ? `${value < 0 ? 'منفی ' : ''}${numberToWords(Math.abs(value))} ${state.settings.currency}` : '';
  }

  function formatMoneyField(input) {
    const signed = input.hasAttribute('data-signed');
    const raw = enDigits(input.value);
    const negative = signed && /^\s*[-−–‐]/.test(raw);
    const caret = input.selectionStart ?? raw.length;
    const digitsBefore = raw.slice(0, caret).replace(/\D/g, '').length;
    const digits = raw.replace(/\D/g, '').replace(/^0+(?=\d)/, '').slice(0, 14);
    let formatted = faDigits(digits.replace(/\B(?=(\d{3})+(?!\d))/g, '٬'));
    if (negative) formatted = `−${formatted}`;
    if (input.value !== formatted) {
      input.value = formatted;
      let position = negative ? 1 : 0;
      let seen = 0;
      if (digitsBefore > 0) {
        position = formatted.length;
        for (let index = 0; index < formatted.length; index += 1) {
          if (/[۰-۹]/.test(formatted[index])) seen += 1;
          if (seen === digitsBefore) { position = index + 1; break; }
        }
      }
      try { input.setSelectionRange(position, position); } catch { /* برخی کیبوردها اجازه نمی‌دهند */ }
    }
    updateMoneyWords(input);
  }

  function updateDatePreview(input) {
    const target = input.closest('.field')?.querySelector('.date-preview');
    if (!target) return;
    const text = input.value.trim();
    const iso = parseJalaliDate(text);
    target.classList.toggle('error', Boolean(text) && !iso);
    target.textContent = !text ? '' : iso ? jalaliWeekdayLabel(iso) : 'تاریخ معتبر نیست';
  }

  function formatDateField(input) {
    const raw = enDigits(input.value);
    const parts = raw.split(/[\/.\-٫،\\]/);
    // اگر کاربر خودش با جداکننده‌ای مثل «۱۴۰۵/۷/۵» نوشته باشد، دست‌نخورده می‌ماند؛ در غیر این صورت اسلش‌ها خودکار گذاشته می‌شوند.
    const typedByHand = parts.length > 2 && parts.slice(1, -1).some(part => part.length !== 2);
    if (typedByHand) {
      const converted = faDigits(raw);
      if (converted !== input.value) input.value = converted;
    } else {
      const digits = raw.replace(/\D/g, '').slice(0, 8);
      let formatted = digits;
      if (digits.length > 4) formatted = `${digits.slice(0, 4)}/${digits.slice(4, 6)}`;
      if (digits.length > 6) formatted += `/${digits.slice(6)}`;
      formatted = faDigits(formatted);
      if (input.value !== formatted) input.value = formatted;
    }
    updateDatePreview(input);
  }

  function refreshInputs(root) {
    root.querySelectorAll('[data-money]').forEach(updateMoneyWords);
    root.querySelectorAll('[data-date]').forEach(updateDatePreview);
  }

  function dateField(name, label, iso, { chipSet = 'past', optional = false, placeholder = '۱۴۰۵/۰۷/۱۷' } = {}) {
    const chipButton = (text, attributes) => `<button type="button" class="chip-button" data-date-chip="${name}" ${attributes}>${text}</button>`;
    let quick = '';
    if (chipSet === 'past') quick = chipButton('امروز', 'data-days="0"') + chipButton('دیروز', 'data-days="-1"');
    else if (chipSet === 'future') quick = chipButton('امروز', 'data-days="0"') + chipButton('یک هفته بعد', 'data-add-days="7"') + chipButton('یک ماه بعد', 'data-months="1"');
    return `<div class="field"><label for="f-${name}">${escapeHtml(label)}</label><input id="f-${name}" name="${name}" data-date inputmode="numeric" dir="ltr" autocomplete="off" value="${iso ? jalaliInput(iso) : ''}" placeholder="${placeholder}" ${optional ? '' : 'required'}><div class="date-preview" aria-live="polite"></div>${quick ? `<div class="date-chips">${quick}</div>` : ''}</div>`;
  }

  function moneyField(name, label, value, { autofocus = false, required = true, placeholder = '', signed = false } = {}) {
    return `<div class="field"><label for="f-${name}">${escapeHtml(label)}</label><input id="f-${name}" name="${name}" inputmode="${signed ? 'text' : 'numeric'}" autocomplete="off" data-money ${signed ? 'data-signed' : ''} ${autofocus ? 'data-autofocus' : ''} ${required ? 'required' : ''} placeholder="${escapeHtml(placeholder)}" value="${value === undefined || value === null || value === '' ? '' : faMoney(value)}"><div class="money-words" aria-live="polite"></div></div>`;
  }

  function categoryOptions(list, selected) {
    const items = list.includes(selected) || !selected ? list : [selected, ...list];
    return items.map(category => `<option ${category === selected ? 'selected' : ''}>${escapeHtml(category)}</option>`).join('');
  }

  function titleSuggestions(kind) {
    const seen = new Map();
    state.transactions.filter(item => item.type === kind && !item.source).forEach(item => {
      const entry = seen.get(item.title) || { count: 0, last: '' };
      entry.count += 1;
      if (item.date >= entry.last) entry.last = item.date;
      seen.set(item.title, entry);
    });
    return [...seen].sort((a, b) => b[1].count - a[1].count || b[1].last.localeCompare(a[1].last)).slice(0, 30).map(([title]) => title);
  }

  function bindSubmit(formId, handler) {
    const form = $(`#${formId}`);
    form?.addEventListener('submit', async event => {
      event.preventDefault();
      if (form.dataset.busy === '1') return;
      form.dataset.busy = '1';
      const submitButton = form.querySelector('[type="submit"]');
      if (submitButton) submitButton.disabled = true;
      try {
        await handler(new FormData(form));
      } catch (error) {
        console.error('ORBIT save error', error);
        toast('ذخیره انجام نشد؛ تنظیمات ذخیره‌سازی مرورگر را بررسی کن');
      } finally {
        if (form.isConnected) {
          form.dataset.busy = '0';
          if (submitButton) submitButton.disabled = false;
        }
      }
    });
  }

  function amountError(value, label = 'مبلغ') {
    if (value === null) return `${label} را فقط با عدد صحیح وارد کن (حداکثر ۱۰ تریلیون)`;
    if (value <= 0) return `${label} باید بیشتر از صفر باشد`;
    return '';
  }

  /* --------------------------------- تراکنش --------------------------------- */

  function openTransactionForm(type = 'expense', id = '', preset = null) {
    const old = id ? state.transactions.find(item => item.id === id) : null;
    const base = old || preset || {};
    const kind = base.type || type;
    const list = kind === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    const defaultCategory = kind === 'income' ? 'حقوق' : 'سایر';
    openModal(`${modalHeader(old ? 'ویرایش تراکنش' : 'ثبت تراکنش')}
      <div class="tabs" role="tablist"><button type="button" role="tab" class="${kind === 'expense' ? 'active' : ''}" aria-selected="${kind === 'expense'}" data-tx-type="expense">خرج</button><button type="button" role="tab" class="${kind === 'income' ? 'active' : ''}" aria-selected="${kind === 'income'}" data-tx-type="income">درآمد</button></div>
      <form id="transactionForm" novalidate>
        <input name="type" type="hidden" value="${kind}">
        ${moneyField('amount', `مبلغ (${state.settings.currency})`, base.amount, { autofocus: !old })}
        <div class="field"><label for="f-title">عنوان</label><input id="f-title" name="title" list="titleSuggestions" maxlength="80" autocomplete="off" value="${escapeHtml(base.title || '')}" placeholder="${kind === 'income' ? 'مثلاً حقوق' : 'مثلاً خرید سوپرمارکت'}" required><datalist id="titleSuggestions">${titleSuggestions(kind).map(title => `<option value="${escapeHtml(title)}"></option>`).join('')}</datalist></div>
        <div class="form-grid"><div class="field"><label for="f-category">دسته</label><select id="f-category" name="category">${categoryOptions(list, base.category || defaultCategory)}</select></div>${dateField('date', 'تاریخ شمسی', base.date || localISO())}</div>
        <div class="field"><label for="f-note">یادداشت اختیاری</label><input id="f-note" name="note" maxlength="200" autocomplete="off" value="${escapeHtml(base.note || '')}"></div>
        ${old ? '' : `<label class="check"><input type="checkbox" name="repeat"><span>هر ماه تکرار شود <small class="muted">(مثلاً اجاره یا اینترنت)</small></span></label>`}
        <div class="form-actions"><button class="button" type="button" data-action="close-modal">انصراف</button><button class="button primary" type="submit">ذخیره</button></div>
      </form>`);
    bindSubmit('transactionForm', form => {
      const iso = parseJalaliDate(form.get('date'));
      const value = parseMoney(form.get('amount'));
      const title = cleanText(form.get('title'), 80);
      const problem = amountError(value);
      if (problem) return toast(problem);
      if (!title) return toast('عنوان را وارد کن');
      if (!iso) return toast('تاریخ شمسی معتبر نیست؛ نمونه: ۱۴۰۵/۰۷/۱۷');
      const type = form.get('type') === 'income' ? 'income' : 'expense';
      const transaction = {
        id: old?.id || cleanId(uid()), type, amount: value, title, category: cleanText(form.get('category'), 30, 'سایر'), date: iso,
        note: cleanText(form.get('note'), 200), source: old?.source || null, counted: old ? old.counted !== false : true,
        createdAt: old?.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString()
      };
      const repeat = !old && form.get('repeat') === 'on';
      commit(draft => {
        const index = draft.transactions.findIndex(item => item.id === transaction.id);
        if (index >= 0) draft.transactions[index] = transaction;
        else draft.transactions.push(transaction);
        if (repeat) {
          const parts = jalaliParts(iso);
          const key = monthKeyOf(parts.jy, parts.jm);
          draft.recurring.push({ id: cleanId(uid()), type, amount: value, day: parts.jd, title, category: transaction.category, startMonth: nextMonthKey(key), doneMonths: [key] });
        }
      });
      closeModal(); render();
      toast(old ? 'تراکنش ویرایش شد' : repeat ? 'ذخیره شد؛ از ماه بعد خودکار ثبت می‌شود' : 'تراکنش ذخیره شد');
    });
  }

  function switchTransactionType(kind) {
    const form = $('#transactionForm');
    if (!form) return;
    form.elements.type.value = kind;
    document.querySelectorAll('#modalBox .tabs button').forEach(button => {
      const active = button.dataset.txType === kind;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
    });
    const select = form.elements.category;
    const list = kind === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    select.innerHTML = categoryOptions(list, list.includes(select.value) ? select.value : (kind === 'income' ? 'حقوق' : 'سایر'));
    delete select.dataset.touched;
    $('#titleSuggestions').innerHTML = titleSuggestions(kind).map(title => `<option value="${escapeHtml(title)}"></option>`).join('');
    form.elements.title.placeholder = kind === 'income' ? 'مثلاً حقوق' : 'مثلاً خرید سوپرمارکت';
  }

  /** با انتخاب عنوانی که قبلاً ثبت شده، دسته و مبلغ آخرین بار را پیشنهاد می‌دهد. */
  function suggestFromTitle(input) {
    const form = input.form;
    if (!form || form.id !== 'transactionForm') return;
    const kind = form.elements.type.value;
    const match = sortTransactions(state.transactions.filter(item => item.type === kind && !item.source && item.title === input.value.trim()))[0];
    if (!match) return;
    const select = form.elements.category;
    if (!select.dataset.touched) {
      if (![...select.options].some(option => option.value === match.category)) select.insertAdjacentHTML('afterbegin', `<option>${escapeHtml(match.category)}</option>`);
      select.value = match.category;
    }
    const amount = form.elements.amount;
    if (!amount.value.trim()) { amount.value = faMoney(match.amount); formatMoneyField(amount); }
  }

  function openTransactionMenu(id) {
    const transaction = state.transactions.find(item => item.id === id);
    if (!transaction) return;
    const linked = Boolean(transaction.source);
    openModal(`${modalHeader('مدیریت تراکنش')}<div class="panel flat"><strong>${escapeHtml(transaction.title)}</strong><div class="obligation-amount ${transaction.type === 'expense' ? 'negative' : 'positive'}">${transaction.type === 'expense' ? '−' : '+'}${number(transaction.amount)} <small>${escapeHtml(state.settings.currency)}</small></div><div class="sub">${jalaliDateLabel(transaction.date)} · ${escapeHtml(transaction.category || 'سایر')}</div></div>${linked ? '<div class="hint">این تراکنش به پرداخت قسط یا بدهی یا یک مورد تکراری وصل است. با حذف پرداخت، ماندهٔ همان قسط یا بدهی هم اصلاح می‌شود.</div>' : ''}<div class="form-actions wrap">${linked ? '' : `<button class="button" type="button" data-action="edit-transaction" data-id="${escapeHtml(id)}">${icon('edit')} ویرایش</button>`}<button class="button" type="button" data-action="duplicate-transaction" data-id="${escapeHtml(id)}">${icon('copy')} تکرار امروز</button><button class="button danger" type="button" data-action="delete-transaction" data-id="${escapeHtml(id)}">${icon('trash')} حذف</button></div>`);
  }

  function withUndo(message, change) {
    const snapshot = clone(state);
    commit(change);
    const token = revision;
    toast(message, {
      label: 'بازگردانی',
      run() {
        if (revision !== token) { toast('بعد از این تغییر، کار دیگری ثبت شده و بازگردانی ممکن نیست'); return; }
        try { saveState(snapshot); state = snapshot; revision += 1; render(); toast('بازگردانی شد'); } catch { toast('بازگردانی انجام نشد'); }
      }
    });
  }

  function deleteTransaction(id) {
    if (!state.transactions.some(item => item.id === id)) return;
    try { withUndo('تراکنش حذف شد', draft => removeTransactionDraft(draft, id)); } catch { toast('حذف انجام نشد'); return; }
    closeModal(); render();
  }

  /* --------------------------------- قسط --------------------------------- */

  function openInstallmentForm(id = '') {
    const old = id ? state.installments.find(item => item.id === id) : null;
    openModal(`${modalHeader(old ? 'ویرایش قسط' : 'قسط جدید')}<form id="installmentForm" novalidate>
      <div class="field"><label for="f-title">عنوان قسط</label><input id="f-title" name="title" maxlength="80" autocomplete="off" data-autofocus value="${escapeHtml(old?.title || '')}" placeholder="مثلاً وام موتور" required></div>
      <div class="form-grid">${moneyField('amount', 'مبلغ هر قسط', old?.amount)}<div class="field"><label for="f-count">تعداد کل قسط‌ها</label><input id="f-count" name="count" inputmode="numeric" autocomplete="off" value="${faDigits(old?.count || 12)}" required></div></div>
      <div class="form-grid"><div class="field"><label for="f-paid">تعداد پرداخت‌شده</label><input id="f-paid" name="paid" inputmode="numeric" autocomplete="off" value="${faDigits(old?.paidCount || 0)}"></div>${dateField('due', 'سررسید قسط بعدی', old?.nextDueDate || localISO(), { chipSet: 'future' })}</div>
      <div class="hint">با ثبت هر پرداخت، خرجِ قسط خودکار ثبت می‌شود و سررسید یک ماه شمسی جلو می‌رود.</div>
      <div class="form-actions"><button class="button" type="button" data-action="close-modal">انصراف</button><button class="button primary" type="submit">ذخیرهٔ قسط</button></div></form>`);
    bindSubmit('installmentForm', form => {
      const title = cleanText(form.get('title'), 80);
      const installmentAmount = parseMoney(form.get('amount'));
      const count = parseMoney(form.get('count'));
      const paidText = String(form.get('paid') || '').trim();
      const paid = paidText ? parseMoney(paidText) : 0;
      const due = parseJalaliDate(form.get('due'));
      if (!title) return toast('عنوان قسط را وارد کن');
      const problem = amountError(installmentAmount, 'مبلغ قسط');
      if (problem) return toast(problem);
      if (!count || count < 1 || count > 600) return toast('تعداد قسط‌ها باید بین ۱ تا ۶۰۰ باشد');
      if (paid === null || paid < 0 || paid > count) return toast('تعداد پرداخت‌شده باید بین صفر و تعداد کل باشد');
      if (!due) return toast('سررسید شمسی معتبر نیست');
      const item = { id: old?.id || cleanId(uid()), title, amount: installmentAmount, count, paidCount: paid, nextDueDate: due, dueDay: jalaliParts(due).jd, status: paid >= count ? 'done' : 'active', createdAt: old?.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() };
      commit(draft => {
        const index = draft.installments.findIndex(value => value.id === item.id);
        if (index >= 0) draft.installments[index] = item;
        else draft.installments.push(item);
      });
      closeModal(); currentPage = 'obligations'; render(); toast(old ? 'قسط ویرایش شد' : 'قسط ذخیره شد');
    });
  }

  function openInstallmentPayment(id) {
    const installment = state.installments.find(item => item.id === id);
    if (!installment) return;
    openModal(`${modalHeader('ثبت پرداخت قسط')}<form id="installmentPaymentForm" novalidate><div class="hint">${escapeHtml(installment.title)} · قسط ${number(Number(installment.paidCount) + 1)} از ${number(installment.count)}</div>${moneyField('amount', 'مبلغ پرداختی', installment.amount, { autofocus: true })}${dateField('date', 'تاریخ پرداخت (شمسی)', localISO())}<div class="form-actions"><button class="button" type="button" data-action="close-modal">انصراف</button><button class="button primary" type="submit">ثبت پرداخت</button></div></form>`);
    bindSubmit('installmentPaymentForm', form => {
      const amount = parseMoney(form.get('amount'));
      const date = parseJalaliDate(form.get('date'));
      const problem = amountError(amount, 'مبلغ پرداخت');
      if (problem) return toast(problem);
      if (!date) return toast('تاریخ پرداخت شمسی معتبر نیست');
      commit(draft => payInstallmentDraft(draft, id, { amount, date }));
      closeModal(); render(); toast('پرداخت ثبت شد و خرج آن هم اضافه شد');
    });
  }

  /* ------------------------------ بدهی و طلب ------------------------------ */

  function cashLabel(direction) {
    return direction === 'receivable' ? 'این مبلغ را همین حالا به او پرداخت کرده‌ام (از موجودی کم شود)' : 'این مبلغ را همین حالا دریافت کرده‌ام (به موجودی اضافه شود)';
  }

  function openDebtForm(id = '') {
    const old = id ? state.debts.find(item => item.id === id) : null;
    const direction = old?.direction || 'owe';
    openModal(`${modalHeader(old ? 'ویرایش بدهی یا طلب' : 'بدهی یا طلب جدید')}<form id="debtForm" novalidate>
      <div class="field"><label>نوع</label><div class="segment"><label><input type="radio" name="direction" value="owe" ${direction === 'owe' ? 'checked' : ''}><span>من بدهکارم</span></label><label><input type="radio" name="direction" value="receivable" ${direction === 'receivable' ? 'checked' : ''}><span>من طلبکارم</span></label></div></div>
      <div class="field"><label for="f-title">عنوان</label><input id="f-title" name="title" maxlength="80" autocomplete="off" data-autofocus value="${escapeHtml(old?.title || '')}" placeholder="مثلاً قرض از علی" required></div>
      <div class="form-grid">${moneyField('total', 'مبلغ کل', old?.total)}${moneyField('remaining', 'باقی‌مانده', old ? old.remaining : '', { required: false, placeholder: 'برابر مبلغ کل' })}</div>
      <div class="form-grid"><div class="field"><label for="f-person">طرف حساب</label><input id="f-person" name="person" maxlength="60" autocomplete="off" value="${escapeHtml(old?.person || '')}"></div>${dateField('due', 'سررسید شمسی (اختیاری)', old?.dueDate || '', { chipSet: 'future', optional: true, placeholder: 'مثلاً ۱۴۰۵/۰۸/۰۱' })}</div>
      ${old ? '' : `<label class="check"><input type="checkbox" name="cash" checked><span id="cashLabel">${cashLabel(direction)}</span></label>`}
      <div class="form-actions"><button class="button" type="button" data-action="close-modal">انصراف</button><button class="button primary" type="submit">ذخیره</button></div></form>`);
    bindSubmit('debtForm', form => {
      const title = cleanText(form.get('title'), 80);
      const total = parseMoney(form.get('total'));
      const remainingText = String(form.get('remaining') || '').trim();
      const remainingValue = remainingText ? parseMoney(remainingText) : total;
      const dueText = String(form.get('due') || '').trim();
      const due = dueText ? parseJalaliDate(dueText) : '';
      if (!title) return toast('عنوان را وارد کن');
      const problem = amountError(total, 'مبلغ کل');
      if (problem) return toast(problem);
      if (remainingValue === null || remainingValue < 0) return toast('باقی‌مانده را درست وارد کن (صفر هم قبول است)');
      if (dueText && !due) return toast('سررسید شمسی معتبر نیست');
      const remaining = Math.min(total, remainingValue);
      const directionValue = form.get('direction') === 'receivable' ? 'receivable' : 'owe';
      const item = { id: old?.id || cleanId(uid()), direction: directionValue, title, total, remaining, person: cleanText(form.get('person'), 60), dueDate: due, status: remaining <= 0 ? 'done' : 'active', createdAt: old?.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() };
      const recordCash = !old && form.get('cash') === 'on';
      commit(draft => {
        const index = draft.debts.findIndex(value => value.id === item.id);
        if (index >= 0) draft.debts[index] = item;
        else draft.debts.push(item);
        if (recordCash) {
          draft.transactions.push({
            id: cleanId(uid()), type: directionValue === 'owe' ? 'income' : 'expense', amount: total, date: localISO(), counted: false, category: 'بدهی',
            title: `${directionValue === 'owe' ? 'دریافت' : 'قرض دادم'}: ${title}`, note: item.person, source: { kind: 'debt-open', id: item.id }, createdAt: new Date().toISOString()
          });
        }
      });
      closeModal(); currentPage = 'obligations'; render(); toast(old ? 'مورد ویرایش شد' : recordCash ? 'ذخیره شد و در موجودی ثبت شد' : 'بدهی یا طلب ذخیره شد');
    });
  }

  function openDebtPayment(id) {
    const debt = state.debts.find(item => item.id === id);
    if (!debt) return;
    openModal(`${modalHeader(debt.direction === 'owe' ? 'ثبت پرداخت بدهی' : 'ثبت دریافت طلب')}<form id="debtPaymentForm" novalidate><div class="hint">مانده: ${number(debt.remaining)} ${escapeHtml(state.settings.currency)}</div>${moneyField('amount', 'مبلغ', debt.remaining, { autofocus: true })}${dateField('date', 'تاریخ شمسی', localISO())}<div class="form-actions"><button class="button" type="button" data-action="close-modal">انصراف</button><button class="button primary" type="submit">ثبت</button></div></form>`);
    bindSubmit('debtPaymentForm', form => {
      const amount = parseMoney(form.get('amount'));
      const date = parseJalaliDate(form.get('date'));
      const problem = amountError(amount);
      if (problem) return toast(problem);
      if (amount > Number(debt.remaining)) return toast('مبلغ نمی‌تواند از مانده بیشتر باشد');
      if (!date) return toast('تاریخ شمسی معتبر نیست');
      commit(draft => payDebtDraft(draft, id, { amount, date }));
      closeModal(); render(); toast('ثبت شد و در موجودی اعمال شد');
    });
  }

  async function deleteObligation(store, id) {
    if (!['installments', 'debts'].includes(store)) return;
    const ok = await askConfirm({ title: 'حذف شود؟', message: 'تراکنش‌های قبلیِ مربوط به آن باقی می‌مانند و فقط ارتباطشان با این مورد قطع می‌شود.', okLabel: 'حذف', danger: true });
    if (!ok) return;
    try {
      withUndo('مورد حذف شد', draft => {
        draft[store] = draft[store].filter(item => item.id !== id);
        draft.transactions.forEach(transaction => { if (transaction.source?.id === id) transaction.source = null; });
      });
    } catch { toast('حذف انجام نشد'); return; }
    render();
  }

  /* ----------------------------- بودجه و تکراری ----------------------------- */

  function openBudgetForm() {
    const monthKey = jalaliMonthKey();
    const inherited = effectiveBudgets(monthKey);
    const fields = BUDGET_CATEGORIES.map((category, index) => {
      const budget = inherited.items.find(item => item.category === category);
      return moneyField(`cat_${index}`, category, budget?.amount, { required: false, placeholder: 'بدون سقف' });
    }).join('');
    const note = inherited.month && inherited.month !== monthKey ? `سقف‌ها از ${monthKeyLabel(inherited.month)} آورده شده‌اند. با ذخیره، برای ${jalaliMonthLabel(cursor)} هم ثبت می‌شوند و در ماه‌های بعد ادامه پیدا می‌کنند.` : 'سقف دسته‌ها در ماه‌های بعد هم ادامه پیدا می‌کند، مگر دوباره تغییرشان بدهی.';
    openModal(`${modalHeader(`بودجهٔ ${jalaliMonthLabel(cursor)}`)}<form id="budgetForm" novalidate>${moneyField('total', 'سقف کل خرج ماه', state.settings.monthlyBudget || '', { required: false, autofocus: true, placeholder: 'بدون سقف' })}<div class="hint">${escapeHtml(note)}</div><div class="form-grid">${fields}</div><div class="form-actions"><button class="button" type="button" data-action="close-modal">انصراف</button><button class="button primary" type="submit">ذخیرهٔ بودجه</button></div></form>`);
    bindSubmit('budgetForm', form => {
      const totalText = String(form.get('total') || '').trim();
      const total = totalText ? parseMoney(totalText) : 0;
      if (total === null || total < 0) return toast('سقف کل را درست وارد کن');
      const entries = BUDGET_CATEGORIES.map((category, index) => {
        const text = String(form.get(`cat_${index}`) || '').trim();
        return { category, text, value: text ? parseMoney(text) : 0 };
      });
      if (entries.some(item => item.text && (item.value === null || item.value <= 0))) return toast('یکی از مبلغ‌های بودجه معتبر نیست');
      commit(draft => {
        draft.settings.monthlyBudget = total;
        draft.budgets = draft.budgets.filter(item => item.month !== monthKey);
        const filled = entries.filter(item => item.value);
        if (filled.length) filled.forEach(item => draft.budgets.push({ id: cleanId(uid()), month: monthKey, category: item.category, amount: item.value }));
        else draft.budgets.push({ id: cleanId(uid()), month: monthKey, category: '*', amount: 0 });
      });
      closeModal(); render(); toast('بودجه ذخیره شد');
    });
  }

  function openRecurringForm(id = '') {
    const old = id ? state.recurring.find(item => item.id === id) : null;
    const selected = old ? `${old.type}:${old.category}` : 'expense:خانه';
    const options = (type, list) => list.map(category => `<option value="${type}:${escapeHtml(category)}" ${selected === `${type}:${category}` ? 'selected' : ''}>${escapeHtml(category)}</option>`).join('');
    const dayOptions = Array.from({ length: 31 }, (_, index) => `<option value="${index + 1}" ${(old?.day || jalaliParts(localISO()).jd) === index + 1 ? 'selected' : ''}>${faDigits(index + 1)}</option>`).join('');
    openModal(`${modalHeader(old ? 'ویرایش مورد تکراری' : 'مورد تکراری جدید')}<form id="recurringForm" novalidate>
      <div class="field"><label for="f-title">عنوان</label><input id="f-title" name="title" maxlength="80" autocomplete="off" data-autofocus value="${escapeHtml(old?.title || '')}" placeholder="مثلاً اجارهٔ خانه" required></div>
      ${moneyField('amount', `مبلغ (${state.settings.currency})`, old?.amount)}
      <div class="form-grid"><div class="field"><label for="f-kind">نوع و دسته</label><select id="f-kind" name="kind"><optgroup label="خرج">${options('expense', EXPENSE_CATEGORIES.filter(category => category !== 'بدهی'))}</optgroup><optgroup label="درآمد">${options('income', INCOME_CATEGORIES)}</optgroup></select></div><div class="field"><label for="f-day">روزِ ماه</label><select id="f-day" name="day">${dayOptions}</select></div></div>
      <div class="hint">اگر ماهی آن روز را نداشت (مثلاً ۳۱ در مهر)، آخرین روز همان ماه ثبت می‌شود.</div>
      <div class="form-actions"><button class="button" type="button" data-action="close-modal">انصراف</button><button class="button primary" type="submit">ذخیره</button></div></form>`);
    bindSubmit('recurringForm', form => {
      const title = cleanText(form.get('title'), 80);
      const amount = parseMoney(form.get('amount'));
      const [type, ...categoryParts] = String(form.get('kind')).split(':');
      const day = Number(form.get('day'));
      const problem = amountError(amount);
      if (!title) return toast('عنوان را وارد کن');
      if (problem) return toast(problem);
      if (!['income', 'expense'].includes(type) || !(day >= 1 && day <= 31)) return toast('نوع یا روز معتبر نیست');
      const today = jalaliParts(localISO());
      const currentKey = monthKeyOf(today.jy, today.jm);
      commit(draft => {
        if (old) {
          const rule = draft.recurring.find(item => item.id === old.id);
          if (rule) Object.assign(rule, { title, amount, type, category: categoryParts.join(':'), day });
        } else {
          draft.recurring.push({ id: cleanId(uid()), title, amount, type, category: categoryParts.join(':'), day, startMonth: day >= today.jd ? currentKey : nextMonthKey(currentKey), doneMonths: [] });
        }
      });
      closeModal();
      runRecurring(true);
      render(); toast(old ? 'ذخیره شد' : 'ذخیره شد؛ هر ماه خودکار ثبت می‌شود');
    });
  }

  async function deleteRecurring(id) {
    const ok = await askConfirm({ title: 'حذف مورد تکراری', message: 'تراکنش‌هایی که قبلاً ساخته شده‌اند باقی می‌مانند؛ فقط از این به بعد ساخته نمی‌شوند.', okLabel: 'حذف', danger: true });
    if (!ok) return;
    try { commit(draft => { draft.recurring = draft.recurring.filter(item => item.id !== id); }); render(); toast('حذف شد'); } catch { toast('حذف انجام نشد'); }
  }

  function runRecurring(silent = false) {
    if (!state.recurring.length) return 0;
    const draft = clone(state);
    const created = applyRecurringDraft(draft, localISO());
    if (!created) return 0;
    try {
      saveState(draft);
      state = draft;
      revision += 1;
      if (!silent) { render(); toast(`${number(created)} تراکنش تکراری ثبت شد`); }
      return created;
    } catch (error) { console.error(error); return 0; }
  }

  /* -------------------------- تنظیمات، پشتیبان، پاک‌سازی -------------------------- */

  function saveSettings() {
    const currency = cleanText(($('#currencySetting')?.value || '').replace(/[<>"'&]/g, ''), 20, 'تومان');
    const startingText = String($('#startingBalanceSetting')?.value || '').trim();
    const budgetText = String($('#monthlyBudgetSetting')?.value || '').trim();
    const startingBalance = startingText ? parseMoney(startingText, { signed: true }) : 0;
    const monthlyBudget = budgetText ? parseMoney(budgetText) : 0;
    if (startingBalance === null) return toast('موجودی شروع معتبر نیست');
    if (monthlyBudget === null || monthlyBudget < 0) return toast('بودجهٔ ماهانه معتبر نیست');
    try {
      commit(draft => { draft.settings.currency = currency; draft.settings.startingBalance = startingBalance; draft.settings.monthlyBudget = monthlyBudget; });
      render(); toast('تنظیمات ذخیره شد');
    } catch (error) {
      console.error(error); toast('ذخیرهٔ تنظیمات انجام نشد');
    }
  }

  function markBackupDone() {
    try { commit(draft => { draft.settings.lastBackup = new Date().toISOString(); }); render(); } catch { /* مهم نیست */ }
  }

  function downloadBlob(json, name) {
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  function exportData() {
    const json = JSON.stringify({ schemaVersion: 4, appVersion: APP_VERSION, exportedAt: new Date().toISOString(), data: state }, null, 2);
    const name = `orbit-finance-${localISO()}.json`;
    try {
      const file = typeof File === 'function' ? new File([json], name, { type: 'application/json' }) : null;
      const touch = globalThis.matchMedia?.('(pointer: coarse)').matches;
      if (file && touch && navigator.canShare?.({ files: [file] })) {
        navigator.share({ files: [file], title: 'پشتیبان ORBIT' })
          .then(() => { markBackupDone(); toast('پشتیبان آماده شد'); })
          .catch(error => { if (error?.name !== 'AbortError') { downloadBlob(json, name); markBackupDone(); } });
        return;
      }
    } catch (error) { console.warn('ORBIT share unavailable', error); }
    downloadBlob(json, name);
    markBackupDone();
    toast('فایل پشتیبان آماده شد');
  }

  async function importData(file) {
    const input = $('#importInput');
    try {
      if (!file) return;
      if (file.size > 25 * 1024 * 1024) throw new Error('File too large');
      const parsed = JSON.parse(await file.text());
      const payload = parsed?.data && typeof parsed.data === 'object' ? parsed.data : parsed;
      if (!payload || typeof payload !== 'object' || !['transactions', 'debts', 'installments'].some(key => Array.isArray(payload[key]))) throw new Error('Invalid backup');
      const stats = { dropped: 0 };
      const imported = normalizeState(payload, stats);
      imported.settings.theme = state.settings.theme;
      const summary = `${number(imported.transactions.length)} تراکنش، ${number(imported.installments.length)} قسط و ${number(imported.debts.length)} بدهی/طلب${stats.dropped ? `؛ ${number(stats.dropped)} رکورد نامعتبر نادیده گرفته می‌شود` : ''}.`;
      const ok = await askConfirm({ title: 'بازیابی پشتیبان', message: `فایل شامل ${summary} اطلاعات فعلی با آن جایگزین می‌شود.`, okLabel: 'بازیابی', danger: true });
      if (!ok) return;
      stashPrevious();
      saveState(imported);
      state = imported;
      revision += 1;
      banners.data = '';
      render(); toast('اطلاعات پشتیبان بازیابی شد');
    } catch (error) {
      console.error(error); toast('فایل پشتیبان معتبر نیست');
    } finally {
      if (input) input.value = '';
    }
  }

  async function restorePrevious() {
    let previous = null;
    try { previous = normalizeState(JSON.parse(localStorage.getItem(BACKUP_KEY))); } catch { toast('نسخهٔ قبلی قابل خواندن نیست'); return; }
    const ok = await askConfirm({ title: 'بازگرداندن نسخهٔ قبلی', message: `${number(previous.transactions.length)} تراکنش و ${number(previous.installments.length + previous.debts.length)} قسط و بدهی برگردانده می‌شود و اطلاعات فعلی جایگزین می‌شود.`, okLabel: 'بازگردان' });
    if (!ok) return;
    const current = clone(state);
    try {
      saveState(previous); state = previous; revision += 1;
      try { localStorage.setItem(BACKUP_KEY, JSON.stringify(current)); } catch { /* ignore */ }
      render(); toast('نسخهٔ قبلی برگردانده شد');
    } catch { toast('بازگردانی انجام نشد'); }
  }

  async function clearAllData() {
    const ok = await askConfirm({ title: 'پاک کردن همهٔ اطلاعات', message: 'همهٔ تراکنش‌ها، اقساط، بدهی‌ها و بودجه‌ها پاک می‌شوند. اگر فایل پشتیبان نداری، قابل برگشت نیست.', okLabel: 'پاک کن', danger: true });
    if (!ok) return;
    const fresh = defaultState();
    fresh.settings.theme = state.settings.theme;
    fresh.settings.currency = state.settings.currency;
    stashPrevious();
    try {
      saveState(fresh); state = fresh; revision += 1; currentPage = 'dashboard'; render(); toast('همهٔ اطلاعات پاک شد');
    } catch (error) {
      console.error(error); toast('پاک‌سازی انجام نشد');
    }
  }

  function toggleTheme() {
    try {
      commit(draft => { draft.settings.theme = draft.settings.theme === 'dark' ? 'light' : 'dark'; });
      applyTheme(); render();
    } catch (error) {
      console.error(error); toast('تغییر تم ذخیره نشد');
    }
  }

  /* --------------------------------- رویدادها --------------------------------- */

  function handleAction(target) {
    const action = target.dataset.action;
    const id = target.dataset.id || '';
    switch (action) {
      case 'close-modal': closeModal(); break;
      case 'theme': toggleTheme(); break;
      case 'current-month': cursor = new Date(); render(); break;
      case 'previous-month': cursor = shiftJalaliMonth(cursor, -1); render(); break;
      case 'next-month': cursor = shiftJalaliMonth(cursor, 1); render(); break;
      case 'new-transaction': openTransactionForm(target.dataset.kind || 'expense'); break;
      case 'transaction-menu': openTransactionMenu(id); break;
      case 'edit-transaction': openTransactionForm('expense', id); break;
      case 'duplicate-transaction': {
        const source = state.transactions.find(item => item.id === id);
        if (source) openTransactionForm(source.type, '', { ...source, date: localISO(), source: null });
        break;
      }
      case 'delete-transaction': deleteTransaction(id); break;
      case 'transaction-filter': transactionFilter = target.dataset.filter; renderTransactions(); break;
      case 'new-installment': openInstallmentForm(); break;
      case 'edit-installment': openInstallmentForm(id); break;
      case 'pay-installment': openInstallmentPayment(id); break;
      case 'new-debt': openDebtForm(); break;
      case 'edit-debt': openDebtForm(id); break;
      case 'pay-debt': openDebtPayment(id); break;
      case 'delete-obligation': deleteObligation(target.dataset.store, id); break;
      case 'budget': openBudgetForm(); break;
      case 'new-recurring': openRecurringForm(); break;
      case 'edit-recurring': openRecurringForm(id); break;
      case 'delete-recurring': deleteRecurring(id); break;
      case 'save-settings': saveSettings(); break;
      case 'export': exportData(); break;
      case 'restore-previous': restorePrevious(); break;
      case 'dismiss-backup': backupNagDismissed = true; render(); break;
      case 'clear-data': clearAllData(); break;
      default: break;
    }
  }

  function applyDateChip(chip) {
    const input = chip.closest('.field')?.querySelector('[data-date]');
    if (!input) return;
    const today = localISO();
    const current = parseJalaliDate(input.value) || today;
    let iso = today;
    if (chip.dataset.months) iso = changeJalaliMonth(current, Number(chip.dataset.months)) || today;
    else if (chip.dataset.addDays) iso = addDaysISO(current, Number(chip.dataset.addDays));
    else iso = addDaysISO(today, Number(chip.dataset.days || 0));
    input.value = jalaliInput(iso);
    updateDatePreview(input);
  }

  function trapFocus(event) {
    const dialog = $('#confirmModal').classList.contains('open') ? $('#confirmBox') : ($('#modal').classList.contains('open') ? $('#modalBox') : null);
    if (!dialog || event.key !== 'Tab') return;
    const focusable = [...dialog.querySelectorAll('button, input:not([type="hidden"]):not([hidden]), select, textarea, [tabindex]:not([tabindex="-1"])')].filter(element => !element.disabled && element.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }

  function registerEvents() {
    document.addEventListener('click', event => {
      const confirmButton = event.target.closest('[data-confirm]');
      if (confirmButton && confirmResolver) return confirmResolver(confirmButton.dataset.confirm === 'yes');
      const chip = event.target.closest('[data-date-chip]');
      if (chip) return applyDateChip(chip);
      const typeTab = event.target.closest('[data-tx-type]');
      if (typeTab) return switchTransactionType(typeTab.dataset.txType);
      const pageButton = event.target.closest('[data-page]');
      if (pageButton) { closeModal(); return navigate(pageButton.dataset.page); }
      const actionButton = event.target.closest('[data-action]');
      if (actionButton) handleAction(actionButton);
    });
    document.addEventListener('input', event => {
      const target = event.target;
      if (target.matches?.('[data-money]')) formatMoneyField(target);
      else if (target.matches?.('[data-date]')) formatDateField(target);
      else if (target.id === 'transactionSearch') { transactionQuery = target.value; updateTransactionList(); }
    });
    document.addEventListener('change', event => {
      const target = event.target;
      if (target.name === 'title' && target.form?.id === 'transactionForm') suggestFromTitle(target);
      else if (target.name === 'category' && target.form?.id === 'transactionForm') target.dataset.touched = '1';
      else if (target.name === 'direction' && target.form?.id === 'debtForm') {
        const label = $('#cashLabel');
        if (label) label.textContent = cashLabel(target.value);
      }
    });
    $('#modal').addEventListener('click', event => { if (event.target === $('#modal')) closeModal(); });
    $('#confirmModal').addEventListener('click', event => { if (event.target === $('#confirmModal') && confirmResolver) confirmResolver(false); });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        if (confirmResolver) confirmResolver(false);
        else closeModal();
      }
      trapFocus(event);
    });
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') runRecurring(); });
  }

  async function registerServiceWorker() {
    if (!('serviceWorker' in navigator) || !(location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) return;
    try {
      const registration = await navigator.serviceWorker.register('./sw.js');
      registration.update();
    } catch (error) {
      console.warn('ORBIT service worker error', error);
    }
    navigator.storage?.persist?.().catch(() => false);
  }

  function handleLaunchAction() {
    try {
      const params = new URLSearchParams(location.search);
      const action = params.get('action');
      if (action === 'expense' || action === 'income') openTransactionForm(action);
      if (action) history.replaceState(null, '', location.pathname);
    } catch { /* ignore */ }
  }

  async function init() {
    loadState();
    await migrateLegacyData();
    applyTheme();
    registerEvents();
    const created = runRecurring(true);
    render();
    if (created) toast(`${number(created)} تراکنش تکراری ثبت شد`);
    handleLaunchAction();
    registerServiceWorker();
  }

  globalThis.ORBIT_TEST = {
    parseAmount, parseMoney, numberToWords, jalaliParts, jalaliToISO, parseJalaliDate, jalaliInput, jalaliMonthKey, jalaliMonthLength,
    changeJalaliMonth, normalizeState, isValidISO, totals, balanceOf, effectiveBudgets, payInstallmentDraft, payDebtDraft,
    removeTransactionDraft, applyRecurringDraft, upcomingItems, defaultState, nextMonthKey,
    getState: () => state, setState: next => { state = next; }
  };
  if (typeof document !== 'undefined') document.addEventListener('DOMContentLoaded', () => init().catch(error => {
    console.error('ORBIT initialization error', error);
    document.body.innerHTML = '<div class="fatal"><h1>ORBIT</h1><p>راه‌اندازی برنامه انجام نشد. صفحه را دوباره بارگذاری کن؛ اگر مشکل ادامه داشت، اطلاعاتت در حافظهٔ مرورگر دست‌نخورده است.</p></div>';
  }));
})();
