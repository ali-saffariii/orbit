(() => {
  'use strict';

  /* ------------------------------------------------------------------ *
   *  ORBIT — مدیریت مالی شخصی (نسخهٔ ۳.۴)
   *  تمام اطلاعات فقط در حافظهٔ محلی همین مرورگر ذخیره می‌شود.
   * ------------------------------------------------------------------ */

  const APP_VERSION = '3.8.4';
  const STORAGE_KEY = 'orbit_finance_v3';
  const BACKUP_KEY = 'orbit_finance_v3_prev';
  const CORRUPT_KEY = 'orbit_finance_v3_corrupt';
  const LEGACY_DB = 'ORBIT_PERSONAL_OS';
  const MAX_AMOUNT = 1e13;

  const EXPENSE_CATEGORIES = ['خوراک', 'رفت‌وآمد', 'خانه', 'قبوض', 'خرید', 'سلامت', 'تفریح', 'آموزش', 'قسط', 'پس‌انداز', 'بدهی', 'سایر'];
  const INCOME_CATEGORIES = ['حقوق', 'کار و پروژه', 'هدیه', 'سود و بازگشت پول', 'درآمد', 'سایر'];
  const BUDGET_CATEGORIES = EXPENSE_CATEGORIES.filter(category => category !== 'بدهی');
  const SOURCE_KINDS = ['installment', 'debt', 'debt-open', 'recurring'];
  const ICONS = {
    home: '<path d="M3 9.5 10 3l7 6.5v7a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 16.5z"/><path d="M8 18v-5h4v5"/>',
    transactions: '<path d="M6 3v14m0 0-3-3m3 3 3-3M14 17V3m0 0-3 3m3-3 3 3"/>',
    target: '<circle cx="10" cy="10" r="7.5"/><circle cx="10" cy="10" r="3.5"/><path d="M10 10l5-5"/>',
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
    alert: '<circle cx="10" cy="10" r="7.5"/><path d="M10 6v5M10 13.5v.5"/>',
    note: '<path d="M5 3h7l3.5 3.5V17H5z"/><path d="M12 3v4h3.5M8 10.5h5M8 13.5h5"/>',
    list: '<path d="M7 5h10M7 10h10M7 15h10M3.5 5h.01M3.5 10h.01M3.5 15h.01"/>',
    calendar: '<rect x="3" y="4" width="14" height="13" rx="2"/><path d="M3 8.5h14M7 2.5v3M13 2.5v3"/>',
    check: '<path d="M4 10.5l4 4 8-9"/>',
    pin: '<path d="M7 3h6l-.8 5 2.3 3H5.5l2.3-3zM10 11v6"/>',
    chevron: '<path d="M7 4l6 6-6 6"/>',
    backspace: '<path d="M7 4h9a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 16 16H7l-5-6z"/><path d="M10 7.5l4 5M14 7.5l-4 5"/>',
    calculator: '<rect x="4" y="2.5" width="12" height="15" rx="2"/><path d="M7 6h6M7.5 10h.01M10 10h.01M12.5 10h.01M7.5 13h.01M10 13h.01M12.5 13h.01"/>',
    globe: '<circle cx="10" cy="10" r="7.5"/><path d="M2.5 10h15M10 2.5c2.4 2.2 3.4 4.7 3.4 7.5s-1 5.3-3.4 7.5c-2.4-2.2-3.4-4.7-3.4-7.5s1-5.3 3.4-7.5z"/>',
    mic: '<rect x="7" y="2" width="6" height="11" rx="3"/><path d="M4 9a6 6 0 0 0 12 0M10 15v3M7 18h6"/>'
  };

  /* ----------------------------- حالت برنامه ----------------------------- */

  const systemTheme = () => {
    try { return globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; } catch { return 'light'; }
  };

  const defaultState = () => ({
    version: 5,
    settings: { theme: systemTheme(), crt: 'full', language: 'fa', currency: 'تومان', startingBalance: 0, monthlyBudget: 0, lastBackup: '' },
    transactions: [],
    installments: [],
    debts: [],
    goals: [],
    budgets: [],
    recurring: [],
    notes: []
  });

  let state = defaultState();
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

  const $ = selector => (typeof document === 'undefined' ? null : document.querySelector(selector));
  const clone = value => JSON.parse(JSON.stringify(value));
  const uid = () => globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[character]);
  let LANG = 'fa';
  const isEn = () => LANG === 'en';
  const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
  const toPersianDigits = value => String(value).replace(/\d/g, digit => PERSIAN_DIGITS[digit]);
  /** ارقام را به شکل زبان فعلی درمی‌آورد (فارسی یا لاتین). */
  const localDigits = value => (isEn() ? String(value) : toPersianDigits(value));
  const enDigits = value => String(value ?? '').replace(/[۰-۹]/g, digit => '۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)).replace(/[٠-٩]/g, digit => '٠١٢٣٤٥٦٧٨٩'.indexOf(digit));
  const numberFormats = {};
  const number = value => (numberFormats[LANG] ||= new Intl.NumberFormat(isEn() ? 'en-US' : 'fa-IR', { maximumFractionDigits: 0 })).format(Number(value) || 0);
  const groupSeparator = () => (isEn() ? ',' : '٬');
  const pctSign = () => (isEn() ? '%' : '٪');
  const localMoney = value => localDigits(String(Math.round(Number(value) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, groupSeparator()));
  /** برای متن‌هایی که داخل داده ذخیره می‌شوند: همیشه فارسی، تا هنگام نمایش به زبان فعلی برگردانده شوند. */
  const storedNumber = value => toPersianDigits(Math.round(Number(value) || 0));
  const cleanId = value => String(value ?? '').replace(/[^\w-]/g, '').slice(0, 64);
  const cleanText = (value, max, fallback = '') => String(value ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max) || fallback;
  const cleanMultiline = (value, max) => String(value ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, ' ').replace(/\r\n?/g, '\n').trim().slice(0, max);
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

  /* ---------- زبان ---------- */

  /** ترجمه: کلید همان متن فارسی است. {name} با vars جایگزین می‌شود و مقدار می‌تواند تابع باشد (برای مفرد/جمع). */
  function t(key, vars) {
    const entry = isEn() ? EN[key] : undefined;
    let text = entry === undefined ? key : entry;
    if (typeof text === 'function') text = text(vars || {});
    return vars ? String(text).replace(/\{(\w+)\}/g, (match, name) => (name in vars ? vars[name] : match)) : String(text);
  }
  /** علامت «متن ذخیره‌شده فارسی»؛ مترجم خودکار به آن دست نمی‌زند. */
  const fa = text => text;
  const plural = (count, one, other) => (Number(count) === 1 ? one : other);
  const CURRENCY_EN = { 'تومان': 'Toman', 'ریال': 'Rial', 'دلار': 'USD', 'یورو': 'EUR', 'پوند': 'GBP' };
  /** واحد پول به زبان فعلی. */
  const currencyKey = text => {
    const hit = Object.entries(CURRENCY_EN).find(([, name]) => name.toLowerCase() === String(text).trim().toLowerCase());
    return hit ? hit[0] : text;
  };
  const cur = () => (isEn() ? (CURRENCY_EN[state.settings.currency] || state.settings.currency) : state.settings.currency);
  const catName = category => (isEn() ? (CATEGORY_EN[category] ?? category) : category);
  const STORED_EN = [
    [/^قسط: (.*)$/s, (m, x) => `Installment: ${x}`],
    [/^پرداخت بدهی: (.*)$/s, (m, x) => `Debt payment: ${x}`],
    [/^دریافت طلب: (.*)$/s, (m, x) => `Receivable collected: ${x}`],
    [/^دریافت: (.*)$/s, (m, x) => `Received: ${x}`],
    [/^قرض دادم: (.*)$/s, (m, x) => `Lent: ${x}`],
    [/^قسط ([۰-۹\d]+) از ([۰-۹\d]+)$/, (m, a, b) => `Installment ${enDigits(a)} of ${enDigits(b)}`],
    [/^تکرار ماهانه$/, () => 'Monthly repeat'],
    [/^بدون عنوان$/, () => 'Untitled']
  ];
  /** متن‌های ساخته‌شده توسط خود برنامه (و نام دسته‌ها) را در حالت انگلیسی ترجمه می‌کند؛ متن کاربر دست‌نخورده می‌ماند. */
  function displayText(text) {
    if (!isEn() || !text) return text;
    if (CATEGORY_EN[text]) return CATEGORY_EN[text];
    for (const [pattern, build] of STORED_EN) {
      const match = String(text).match(pattern);
      if (match) return build(...match);
    }
    return text;
  }

  /* ---------- دیکشنری انگلیسی (کلید = متن فارسی) ---------- */

  const CATEGORY_EN = {
    'خوراک': 'Food', 'رفت‌وآمد': 'Transport', 'خانه': 'Home', 'قبوض': 'Bills', 'خرید': 'Shopping', 'سلامت': 'Health', 'تفریح': 'Leisure',
    'آموزش': 'Education', 'قسط': 'Installments', 'پس‌انداز': 'Savings', 'بدهی': 'Debt', 'سایر': 'Other', 'حقوق': 'Salary',
    'کار و پروژه': 'Work and projects', 'هدیه': 'Gifts', 'سود و بازگشت پول': 'Interest and refunds', 'درآمد': 'Income'
  };

  const EN = {
    "افکت مانیتور قدیمی (CRT)": "Old CRT monitor effect",
    "خاموش": "Off",
    "ملایم": "Soft",
    "شدید": "Full",
    "خط‌های اسکن، درخشش فسفری، حاشیهٔ تاریک و لرزش نور. در حالت «ملایم» بدون حرکت است.": "Scanlines, phosphor glow, dark edges and light flicker. “Soft” has no motion.",
    "هدف": "Goal",
    "هدف پس‌انداز": "Savings goal",
    "هدف‌ها": "Goals",
    "هدف‌های پس‌انداز": "Savings goals",
    "هدف جدید": "New goal",
    "ثبت هدف": "Save goal",
    "عنوان هدف": "Goal title",
    "مثلاً سفر یا خرید لپ‌تاپ": "e.g. Trip or new laptop",
    "مبلغ هدف ({v1})": "Target amount ({v1})",
    "مبلغ هدف": "Target amount",
    "تا حالا چقدر پس‌انداز کرده‌ای؟": "How much have you saved so far?",
    "مهلت رسیدن به هدف (اختیاری)": "Deadline (optional)",
    "هر بار پس‌انداز کردی، روی «افزودن مبلغ» بزن. این مبلغ از موجودی کل کم نمی‌شود؛ هدف‌ها جدا حساب می‌شوند.": "Each time you save, tap “Add amount”. It is not deducted from your total balance; goals are tracked separately.",
    "مبلغی که کنار گذاشتی": "Amount you set aside",
    "به هدف رسیدی": "Goal reached",
    "تا {v1}": "By {v1}",
    "بدون مهلت": "No deadline",
    "کامل": "Done",
    "از {v1} {v2}": "of {v1} {v2}",
    "ماهی {v1} {v2}": "{v1} {v2} / month",
    "{v1} مانده": "{v1} left",
    "افزودن مبلغ": "Add amount",
    "پس‌انداز شده": "Saved",
    "مجموع هدف‌ها": "Total of goals",
    "مانده تا هدف": "Left to go",
    "هدفی ثبت نشده": "No goals yet",
    "برای چیزی که می‌خواهی پس‌انداز کنی یک هدف بساز": "Create a goal for something you want to save for",
    "مبلغ پس‌انداز را درست وارد کن (صفر هم قبول است)": "Enter the saved amount correctly (zero is fine)",
    "تاریخ معتبر نیست": "Invalid date",
    "هدف ویرایش شد": "Goal updated",
    "هدف ثبت شد": "Goal saved",
    "هدف حذف شد": "Goal deleted",
    "تبریک؛ هدف کامل شد": "Congratulations, goal complete",
    "به هدف اضافه شد": "Added to goal",
    "تاریخ میلادی": "Gregorian date",
    "تاریخ شمسی": "Persian date",
    "نوع": "Type",
    "دسته": "Category",
    "عنوان": "Title",
    "توضیح": "Note",
    "در موجودی حساب شد": "Counted in balance",
    "بله": "Yes",
    "خیر": "No",
    "تراکنشی برای خروجی نیست": "No transactions to export",
    "فایل CSV آماده شد": "CSV file ready",
    "تراکنش‌های ORBIT": "ORBIT transactions",
    "خروجی برای اکسل (CSV)": "Export for Excel (CSV)",
    "CSV همین ماه": "This month CSV",
    "CSV همهٔ تراکنش‌ها": "All transactions CSV",
    "نسخه‌های خودکار": "Automatic copies",
    "برنامه خودش هر روز یک نسخه در همین مرورگر نگه می‌دارد (هفت روز اخیر). این جای فایل پشتیبان را نمی‌گیرد؛ اگر داده‌های مرورگر پاک شود، این‌ها هم پاک می‌شوند.": "The app keeps one copy per day in this browser (last 7 days). It does not replace a backup file; if browser data is cleared, these are cleared too.",
    "ذخیرهٔ خودکار در این مرورگر در دسترس نیست.": "Automatic copies are not available in this browser.",
    "هنوز نسخهٔ خودکاری ساخته نشده؛ بعد از ثبت اولین اطلاعات ساخته می‌شود.": "No automatic copy yet; one is created after you enter some data.",
    "بازیابی": "Restore",
    "نسخه پیدا نشد": "Copy not found",
    "بازیابی نسخهٔ خودکار": "Restore automatic copy",
    "نسخهٔ {v1} ({v2}) جایگزین اطلاعات فعلی می‌شود.": "The copy from {v1} ({v2}) will replace your current data.",
    "اطلاعات بازیابی شد": "Data restored",
    "بازیابی انجام نشد": "Restore failed",
    "نسخهٔ خودکار پیدا شد": "Automatic copy found",
    "اطلاعات اصلی خالی است ولی یک نسخهٔ خودکار از {v1} هست ({v2}). بازیابی شود؟": "Your data is empty but there is an automatic copy from {v1} ({v2}). Restore it?",
    "{v1} تراکنش، {v2} قسط، {v3} بدهی/طلب": "{v1} transactions, {v2} installments, {v3} debts/receivables",
    "مقایسهٔ ماه‌ها": "Month comparison",
    "مقایسه با ماه قبل": "Compare with last month",
    "این ماه": "This month",
    "ماه قبل": "Last month",
    "بدون تغییر": "No change",
    "جدید": "New",
    "این ماه نسبت به ماه قبل": "This month vs last month",
    "خرج دسته‌ها": "Spending by category",
    "روی هر دسته بزن تا روند شش‌ماههٔ آن را ببینی.": "Tap a category to see its six-month trend.",
    "برای این ماه و ماه قبل خرجی ثبت نشده": "No spending recorded for this or last month",
    "روند {v1} در شش ماه": "{v1}: six-month trend",
    "میانگین شش ماه: {v1} {v2}": "Six-month average: {v1} {v2}",
    'بدون تاریخ': 'No date', 'بدون سررسید': 'No due date', 'رسید': 'Receipt', 'رسید ماه': 'Month receipt', 'رسید سررسید ماه': 'Month due receipt',
    '{n} روز گذشته': ({ n, c }) => `${n} ${c === 1 ? 'day' : 'days'} overdue`,
    '{n} روز دیگر': ({ n, c }) => `in ${n} ${c === 1 ? 'day' : 'days'}`,
    'امروز': 'Today', 'فردا': 'Tomorrow', 'دیروز': 'Yesterday', 'پریروز': '2 days ago',
    'قسط {a} از {b}': 'Installment {a} of {b}', 'بدهی من': 'I owe', 'طلب من': 'Owed to me',
    'خرج': 'Expense', 'درآمد': 'Income', 'قسط': 'Installment', 'بدهی و طلب': 'Debts', 'یادداشت': 'Note', 'بدهی یا طلب': 'debt or loan',
    'خانه': 'Home', 'افزودن': 'Add', 'فهرست': 'List', 'تنظیمات': 'Settings',
    'تراکنش‌ها': 'Transactions', 'قسط و بدهی': 'Installments and debts', 'یادداشت‌ها': 'Notes',
    'شب بخیر': 'Good night', 'صبح بخیر': 'Good morning', 'ظهر بخیر': 'Good afternoon', 'عصر بخیر': 'Good evening',
    'ماه قبل': 'Previous month', 'ماه بعد': 'Next month', 'همین ماه': 'This month',
    'روز {v1} از {v2}': 'Day {v1} of {v2}', 'آخرین روز ماه': 'Last day of the month', '{v1} روز مانده': '{v1} days left',
    'ماه گذشته': 'Past month', 'ماه آینده': 'Coming month',
    'میانگین خرج روزانه: {v1} {v2}': 'Average daily spending: {v1} {v2}', 'هنوز خرجی در این ماه ثبت نشده': 'No spending recorded this month yet',
    'خرج روزانه': 'Daily spending',
    'هر نقطه یک روز است؛ نقطهٔ بزرگ‌تر یعنی خرج بیشتر. نقطهٔ نارنجی امروز است.': 'Each dot is a day; a bigger dot means more spending. The orange dot is today.',
    'سال {v1}': 'Year {v1}', 'روز مانده': 'days left', 'روی نام هر ماه بزن تا همان ماه را ببینی.': 'Tap a month name to open that month.',
    'ویرایش': 'Edit', 'تکرار امروز': 'Repeat today', 'حذف': 'Delete',
    'این مورد به قسط، بدهی یا تکرار ماهانه وصل است؛ با حذفش، ماندهٔ همان مورد اصلاح می‌شود.': 'This entry is linked to an installment, debt or monthly repeat; deleting it also restores that item.',
    'انجام شد': 'Done', 'برداشتن سنجاق': 'Unpin', 'سنجاق': 'Pin',
    'مبلغ دریافتی': 'Amount received', 'مبلغ پرداختی': 'Amount paid', 'تاریخ': 'Date', 'انصراف': 'Cancel', 'ثبت': 'Save',
    'مدتی است پشتیبان نگرفته‌ای': 'It has been a while since your last backup', 'هنوز پشتیبان نگرفته‌ای': 'You have not made a backup yet',
    'اطلاعات فقط روی همین دستگاه است. یک فایل پشتیبان بگیر تا گم نشود.': 'Your data lives only on this device. Save a backup file so it cannot get lost.',
    'دریافت پشتیبان': 'Download backup', 'بعداً': 'Later',
    'از همین‌جا شروع کن': 'Start here',
    'موجودی فعلی‌ات را بنویس تا «موجودی کل» درست محاسبه شود.': 'Enter your current balance so the total balance is correct.',
    'تنظیم موجودی شروع': 'Set starting balance',
    'اولین خرج یا درآمدت را ثبت کن؛ فقط مبلغ و دسته کافی است.': 'Add your first expense or income; an amount and a category are enough.',
    'ثبت خرج': 'Add expense',
    'قسط، وام یا قرض داری؟ سررسیدش را اضافه کن تا یادت نرود.': 'Have an installment, loan or debt? Add its due date so you do not forget.',
    'قسط جدید': 'New installment', 'دریافت': 'Collect', 'پرداخت': 'Pay',
    '{v1}: درآمد {v2}، خرج {v3}': '{v1}: income {v2}, spending {v3}',
    'بدون بودجه': 'No budget set', '{v1}٪ از بودجه': '{v1}% of budget', 'برابر ماه قبل': 'Same as last month',
    '{v1}٪ بیشتر از ماه قبل': '{v1}% more than last month', '{v1}٪ کمتر از ماه قبل': '{v1}% less than last month',
    'موجودی تخمینی کل': 'Estimated total balance', 'درآمد {v1}: {v2}': 'Income {v1}: {v2}', 'خرج: {v1}': 'Spent: {v1}',
    'بودجهٔ ماه': 'Monthly budget', '{v1} مانده': '{v1} left', '{v1} بیشتر از سقف': '{v1} over the limit', '{v1} از {v2}': '{v1} of {v2}',
    'روزانه {v1}': '{v1} per day', 'تعیین بودجهٔ ماهانه': 'Set monthly budget',
    'پرداخت‌ها و دریافت‌های نزدیک': 'Upcoming payments and collections', 'همه': 'All',
    'درآمد ماه': 'Income this month', 'خرج ماه': 'Spent this month', 'مانده ماه': 'Net this month', 'درآمد منهای خرج': 'Income minus spending',
    'نرخ پس‌انداز {v1}٪': 'Savings rate {v1}%', 'تعهد ۳۰ روز آینده': 'Due in 30 days', '{v1} هم باید بگیری': 'plus {v1} to collect',
    '{v1} مورد': ({ v1, c }) => `${v1} ${c === 1 ? 'item' : 'items'}`,
    'روند شش ماهه': 'Six-month trend', '· روی هر ماه بزن': '· tap a month',
    'خرج بر اساس دسته': 'Spending by category', 'روی هر دسته بزن تا تراکنش‌هایش را ببینی.': 'Tap a category to see its transactions.',
    'هنوز داده‌ای نیست': 'No data yet', 'چند خرج ثبت کن تا الگوی هزینه ساخته شود': 'Add a few expenses to see your spending pattern',
    'آخرین تراکنش‌های {v1}': 'Latest transactions · {v1}', 'این ماه تراکنشی نداری': 'No transactions this month',
    'اولین خرج یا درآمدت را اضافه کن': 'Add your first expense or income',
    'دسته': 'Category', 'مبلغ ({v1})': 'Amount ({v1})', 'عنوان': 'Title', '(اختیاری؛ خالی بماند، نام دسته ثبت می‌شود)': '(optional; if empty the category name is used)',
    'مثلاً حقوق مهر': 'e.g. October salary', 'مثلاً خرید سوپرمارکت': 'e.g. Groceries', 'پرتکرار:': 'Frequent:', '(اختیاری)': '(optional)',
    'هر ماه تکرار شود': 'Repeat every month', '(مثلاً اجاره، اینترنت یا حقوق)': '(e.g. rent, internet or salary)',
    'ذخیرهٔ تغییرات': 'Save changes', 'ثبت درآمد': 'Add income',
    'عنوان قسط': 'Installment title', 'مثلاً وام موتور': 'e.g. Motorbike loan', 'مبلغ هر قسط ({v1})': 'Amount per installment ({v1})',
    'تعداد کل قسط‌ها': 'Total installments', 'تا حالا چند قسط پرداخت شده؟': 'How many are already paid?', 'سررسید قسط بعدی': 'Next due date',
    'با ثبت هر پرداخت، خرجِ قسط خودکار ثبت می‌شود و سررسید یک ماه شمسی جلو می‌رود.': 'Each payment you record adds the matching expense and moves the due date forward one month.',
    'ثبت قسط': 'Add installment',
    'این مبلغ را همین حالا به او پرداخت کرده‌ام (از موجودی کم شود)': 'I paid this amount just now (subtract from balance)',
    'این مبلغ را همین حالا دریافت کرده‌ام (به موجودی اضافه شود)': 'I received this amount just now (add to balance)',
    'نوع': 'Type', 'من بدهکارم': 'I owe', 'من طلبکارم': 'I am owed', 'مثلاً قرض از علی': 'e.g. Loan from Sam',
    'مبلغ کل ({v1})': 'Total amount ({v1})', 'باقی‌مانده': 'Remaining', 'برابر مبلغ کل': 'Same as total', 'طرف حساب': 'Person',
    'سررسید (اختیاری)': 'Due date (optional)', 'مثلاً {v1}': 'e.g. {v1}', 'مثلاً: قبض برق را تا آخر هفته بپرداز': 'e.g. Pay the electricity bill by Friday',
    'یادآوری در تاریخ (اختیاری)': 'Remind me on (optional)', 'سنجاق شود': 'Pin it', '(در صفحهٔ خانه بالا بماند)': '(keep it on top of Home)',
    'ثبت یادداشت': 'Save note', 'این مورد پیدا نشد': 'Entry not found', 'نوع ثبت': 'Entry type', 'ثبت سریع': 'Quick add', 'ویرایش {v1}': 'Edit {v1}',
    'آخرین ثبت‌ها': 'Latest entries', 'مبلغ': 'Amount',
    '{label} را فقط با عدد صحیح وارد کن (حداکثر ۱۰ تریلیون)': '{label}: enter a whole number only (max 10 trillion)',
    '{label} باید بیشتر از صفر باشد': '{label} must be greater than zero',
    'بازگردانی': 'Undo', 'بعد از این تغییر، کار دیگری ثبت شده و بازگردانی ممکن نیست': 'Something else was saved after this; undo is no longer possible',
    'بازگردانی شد': 'Undone', 'بازگردانی انجام نشد': 'Could not undo',
    'تاریخ معتبر نیست؛ نمونه: {v1}': 'Invalid date; example: {v1}', 'تغییرات ذخیره شد': 'Changes saved',
    '{v1} ثبت شد{v2}': '{v1} added{v2}', '؛ از ماه بعد خودکار ثبت می‌شود': '; it will repeat automatically from next month',
    'عنوان قسط را وارد کن': 'Enter the installment title', 'مبلغ قسط': 'Installment amount',
    'تعداد قسط‌ها باید بین ۱ تا ۶۰۰ باشد': 'The number of installments must be between 1 and 600',
    'تعداد پرداخت‌شده باید بین صفر و تعداد کل باشد': 'Paid installments must be between zero and the total',
    'سررسید شمسی معتبر نیست': 'Invalid due date', 'قسط ویرایش شد': 'Installment updated', 'قسط ثبت شد': 'Installment added',
    'عنوان را وارد کن': 'Enter a title', 'مبلغ کل': 'Total amount', 'باقی‌مانده را درست وارد کن (صفر هم قبول است)': 'Enter a valid remaining amount (zero is fine)',
    'مورد ویرایش شد': 'Entry updated', 'ثبت شد و در موجودی اعمال شد': 'Saved and applied to your balance', 'بدهی یا طلب ثبت شد': 'Debt saved',
    'متن یادداشت را بنویس': 'Write the note text', 'تاریخ یادآوری معتبر نیست': 'Invalid reminder date', 'یادداشت ذخیره شد': 'Note saved',
    'یادداشت ثبت شد': 'Note added', 'تاریخ شمسی معتبر نیست': 'Invalid date', 'مبلغ نمی‌تواند از مانده بیشتر باشد': 'Amount cannot exceed the remaining balance',
    'پرداخت ثبت شد و خرج آن هم اضافه شد': 'Payment saved and its expense added', 'موجودی شروع معتبر نیست': 'Invalid starting balance',
    'بودجهٔ ماهانه معتبر نیست': 'Invalid monthly budget', 'تنظیمات ذخیره شد': 'Settings saved', 'یکی از مبلغ‌های بودجه معتبر نیست': 'One of the budget amounts is invalid',
    'بودجه ذخیره شد': 'Budget saved', 'نوع یا روز معتبر نیست': 'Invalid type or day', 'ذخیره شد': 'Saved', 'ذخیره شد؛ هر ماه خودکار ثبت می‌شود': 'Saved; it will be added every month',
    'تراکنشی پیدا نشد': 'No transactions found', 'عبارت دیگری را جست‌وجو کن': 'Try a different search', 'یک مورد ثبت کن یا فیلتر و ماه را تغییر بده': 'Add an entry, or change the filter or month',
    'ثبت تراکنش': 'Add transaction', 'در همهٔ ماه‌ها جست‌وجو شد': 'Searched across all months', '{v1} خرج': '{v1} spent',
    'خرج‌ها': 'Expenses', 'درآمدها': 'Income', 'درآمد:': 'Income:', 'خرج:': 'Spent:', 'جست‌وجوی عنوان، دسته یا مبلغ': 'Search title, category or amount',
    'جست‌وجو': 'Search', 'فیلتر': 'Filter', 'دسته: {v1}': 'Category: {v1}', 'تسویه شده': 'Settled', 'قسط {v1} از {v2}': 'Installment {v1} of {v2}',
    'تمام‌شده': 'Completed', '{v1} پرداخت': '{v1} paid', 'سررسید {v1}': 'Due {v1}', 'ثبت پرداخت': 'Record payment', 'تسویه‌شده': 'Settled',
    'اصل: {v1}': 'Principal: {v1}', '{v1}٪ تسویه': '{v1}% settled', 'ثبت دریافت': 'Record collection',
    'اقساط باقی‌مانده': 'Installments left', 'قسط‌ها': 'Installments', 'قسطی ثبت نشده': 'No installments yet',
    'قسط‌هایت را اضافه کن تا سررسیدها مشخص باشند': 'Add your installments to track due dates', 'بدهی‌ها و طلب‌ها': 'Debts and loans',
    'بدهی یا طلب جدید': 'New debt or loan', 'بدهی یا طلبی ثبت نشده': 'No debts or loans yet',
    'پولی که باید بدهی یا بگیری را اینجا نگه دار': 'Keep track of money you owe or are owed here', '· {v1} باز': '· {v1} open',
    'یادداشت جدید': 'New note', 'یادداشتی نداری': 'No notes yet', 'کارهای مالی‌ات را بنویس: پرداخت قبض، پیگیری طلب، ...': 'Write down money tasks: pay a bill, follow up a loan, ...',
    'انجام‌شده‌ها ({v1})': 'Done ({v1})', 'همهٔ ثبت‌ها': 'All entries', 'بخش‌های فهرست': 'List sections',
    'مثلاً اجارهٔ خانه': 'e.g. House rent', 'نوع و دسته': 'Type and category', 'روزِ ماه': 'Day of month',
    'اگر ماهی آن روز را نداشت (مثلاً ۳۱ در مهر)، آخرین روز همان ماه ثبت می‌شود.': 'If a month lacks that day (e.g. the 31st in April), the last day of that month is used.',
    'ذخیره': 'Save', 'هر ماه، روز {v1} · {v2} · {v3}': 'Monthly, day {v1} · {v2} · {v3}', 'هرگز': 'Never', 'روی آیفون:': 'On iPhone:',
    'حافظهٔ Safari و برنامهٔ نصب‌شده از هم جداست. اول با «Add to Home Screen» برنامه را نصب کن و بعد اطلاعات را وارد کن.': 'Safari and the installed app have separate storage. Install the app with Add to Home Screen first, then enter your data.',
    'بدون سقف': 'No limit', 'سقف‌ها از {v1} آورده شده‌اند؛ با ذخیره، از {v2} هم ثبت می‌شوند.': 'Limits are carried over from {v1}; saving will also set them for {v2}.',
    'سقف دسته‌ها در ماه‌های بعد هم ادامه پیدا می‌کند، مگر دوباره تغییرشان بدهی.': 'Category limits carry on into later months unless you change them again.',
    'واحد پول': 'Currency', 'موجودی شروع': 'Starting balance', '(می‌تواند منفی باشد)': '(can be negative)', 'سقف کل خرج ماهانه': 'Total monthly spending limit',
    'ذخیرهٔ تنظیمات': 'Save settings', 'ذخیرهٔ بودجهٔ دسته‌ها': 'Save category budgets',
    'اجاره، اینترنت یا حقوق را یک بار تعریف کن تا هر ماه خودکار ثبت شود.': 'Define rent, internet or salary once and it is added automatically every month.',
    'تعریف مورد تکراری': 'Add a repeating item',
    'اطلاعات فقط روی همین مرورگر ذخیره می‌شود. پیش از پاک‌کردن داده‌های مرورگر یا تعویض گوشی، فایل پشتیبان بگیر.': 'Your data is stored only in this browser. Save a backup before clearing browser data or changing phones.',
    'آخرین پشتیبان: {v1}': 'Last backup: {v1}', 'بازیابی از فایل': 'Restore from file',
    'بازگرداندن نسخهٔ پیش از آخرین بازیابی یا پاک‌سازی': 'Bring back the version before the last restore or wipe',
    'زبان و تقویم': 'Language and calendar', 'تغییر حالت روشن و تاریک': 'Switch light / dark theme', 'ORBIT نسخهٔ {APP_VERSION}': 'ORBIT version {APP_VERSION}',
    'همهٔ تراکنش‌ها، اقساط، بدهی‌ها و یادداشت‌ها حذف می‌شوند.': 'All transactions, installments, debts and notes will be deleted.',
    'پاک کردن همهٔ اطلاعات': 'Erase all data', 'شخصی‌سازی و پشتیبان': 'Preferences and backup', 'تنظیمات مالی': 'Money settings',
    'واحد پول، موجودی شروع، بودجه': 'Currency, starting balance, budget', 'بودجهٔ دسته‌ها': 'Category budgets', 'تراکنش‌های تکراری': 'Repeating items',
    'پشتیبان و بازیابی': 'Backup and restore', 'ظاهر': 'Appearance', 'پاک‌سازی': 'Erase', 'منفی ': 'minus ', 'تاریخ معتبر نیست': 'Not a valid date',
    'یک هفته بعد': 'In a week', 'یک ماه بعد': 'In a month', 'تأیید': 'Confirm',
    'تراکنش حذف شد': 'Transaction deleted', 'حذف انجام نشد': 'Could not delete', 'حذف شود؟': 'Delete it?',
    'تراکنش‌های قبلیِ مربوط به آن باقی می‌مانند و فقط ارتباطشان با این مورد قطع می‌شود.': 'Earlier transactions stay; they just lose their link to this item.',
    'مورد حذف شد': 'Item deleted', 'ذخیره انجام نشد': 'Could not save', 'حذف مورد تکراری': 'Delete repeating item',
    'تراکنش‌هایی که قبلاً ساخته شده‌اند باقی می‌مانند؛ فقط از این به بعد ساخته نمی‌شوند.': 'Transactions already created stay; none will be created from now on.',
    'حذف شد': 'Deleted', '{v1} تراکنش تکراری ثبت شد': ({ v1, c }) => `${v1} repeating ${c === 1 ? 'transaction' : 'transactions'} added`,
    'پشتیبان ORBIT': 'ORBIT backup', 'پشتیبان آماده شد': 'Backup ready', 'فایل پشتیبان آماده شد': 'Backup file ready',
    '{v1} تراکنش، {v2} قسط، {v3} بدهی/طلب و {v4} یادداشت{v5}.': '{v1} transactions, {v2} installments, {v3} debts/loans and {v4} notes{v5}.',
    '؛ {v1} رکورد نامعتبر نادیده گرفته می‌شود': '; {v1} invalid records will be skipped',
    'بازیابی پشتیبان': 'Restore backup', 'فایل شامل {summary} اطلاعات فعلی با آن جایگزین می‌شود.': 'The file contains {summary} Your current data will be replaced.',
    'بازیابی': 'Restore', 'اطلاعات پشتیبان بازیابی شد': 'Backup restored', 'فایل پشتیبان معتبر نیست': 'Not a valid backup file',
    'نسخهٔ قبلی قابل خواندن نیست': 'The previous version cannot be read', 'بازگرداندن نسخهٔ قبلی': 'Bring back previous version',
    '{v1} تراکنش و {v2} قسط و بدهی برگردانده می‌شود و اطلاعات فعلی جایگزین می‌شود.': '{v1} transactions and {v2} installments and debts will come back; your current data will be replaced.',
    'بازگردان': 'Bring back', 'نسخهٔ قبلی برگردانده شد': 'Previous version restored',
    'همهٔ تراکنش‌ها، اقساط، بدهی‌ها، بودجه‌ها و یادداشت‌ها پاک می‌شوند. اگر فایل پشتیبان نداری، قابل برگشت نیست.': 'All transactions, installments, debts, budgets and notes will be erased. Without a backup file this cannot be undone.',
    'پاک کن': 'Erase', 'همهٔ اطلاعات پاک شد': 'All data erased', 'پاک‌سازی انجام نشد': 'Could not erase', 'تغییر تم ذخیره نشد': 'Could not save the theme',
    'ORBIT — مدیریت مالی شخصی': 'ORBIT — Personal Finance',
    'مدیریت شخصی درآمد، خرج، بودجه، قسط و بدهی با تقویم شمسی': 'Personal income, spending, budget, installments and debts, with the Gregorian calendar',
    'تغییر زبان به انگلیسی': 'Switch to English', 'تغییر زبان به فارسی': 'Switch to Persian',
    'زبان انگلیسی و تقویم میلادی فعال شد': 'English and the Gregorian calendar are on', 'زبان فارسی و تقویم شمسی فعال شد': 'Persian and the Solar Hijri calendar are on',
    'نمایش این صفحه با خطا روبه‌رو شد. صفحه را دوباره بارگذاری کن؛ اطلاعاتت دست‌نخورده است.': 'This page failed to display. Reload it; your data is untouched.',
    '{label}: {v2} {v3} خرج': '{label}: {v2} {v3} spent', '{label}: خرجی ثبت نشده': '{label}: no spending recorded', 'یادداشت حذف شد': 'Note deleted',
    'ذخیره انجام نشد؛ تنظیمات ذخیره‌سازی مرورگر را بررسی کن': 'Could not save; check the browser storage settings',
    'راه‌اندازی برنامه انجام نشد. صفحه را دوباره بارگذاری کن؛ اگر مشکل ادامه داشت، اطلاعاتت در حافظهٔ مرورگر دست‌نخورده است.': 'The app failed to start. Reload the page; if it keeps failing, your data is still untouched in browser storage.',
    // ماشین‌حساب
    'همیشه با ارقام و قالب انگلیسی': 'Always in English number format: 1,234.5', 'ماشین‌حساب': 'Calculator',
    'پاک‌کردن حافظه': 'Memory clear', 'فراخوانی حافظه': 'Memory recall', 'کم‌کردن از حافظه': 'Subtract from memory', 'افزودن به حافظه': 'Add to memory',
    'پرانتز باز': 'Open parenthesis', 'پرانتز بسته': 'Close parenthesis', 'پاک‌کردن همه': 'All clear', 'حذف آخرین': 'Backspace', 'درصد': 'Percent',
    'تقسیم': 'Divide', 'ضرب': 'Multiply', 'تفریق': 'Subtract', 'جمع': 'Add', 'تغییر علامت': 'Change sign', 'ممیز': 'Decimal point', 'مساوی': 'Equals',
    'نوار نتایج': 'Tape', 'پاک‌کردن نوار': 'Clear tape',
    'نتیجه‌ها مثل رسید کاغذی اینجا ردیف می‌شوند. روی هر خط بزن تا دوباره استفاده شود.': 'Results line up here like a paper receipt. Tap a line to reuse it.',
    'کپی نتیجه': 'Copy result', 'کپی شد': 'Copied', 'کپی انجام نشد': 'Could not copy', 'ثبت به‌عنوان خرج': 'Use as expense', 'ثبت به‌عنوان درآمد': 'Use as income',
    'برای ثبت، نتیجه باید بیشتر از صفر باشد': 'The value must be greater than zero to save it',
    'تقسیم بر صفر ممکن نیست': 'Cannot divide by zero', 'عدد از ۱۲ رقم بیشتر شد': 'The number is longer than 12 digits', 'عبارت کامل نیست': 'The expression is incomplete',
    'صفحه‌کلید هم کار می‌کند: عددها، + − * / %، Enter، Backspace و Esc.': 'Your keyboard works too: digits, + - * / %, Enter, Backspace and Esc.',
    // نوار کناری و بنرها
    'مدیریت مالی شخصی': 'Personal finance', 'داده‌ها فقط روی همین دستگاه می‌مانند.': 'Your data stays on this device only.', 'از «تنظیمات» پشتیبان بگیر.': 'Back up from Settings.',
    'منوی اصلی': 'Main menu',
    'مرورگر اجازهٔ ذخیره‌سازی نمی‌دهد. حالت خصوصی را ببند یا فضای مرورگر را خالی کن؛ تا رفع این مشکل اطلاعات جدید ماندگار نمی‌شود.': 'The browser does not allow storage. Close private mode or free up browser space; until then new data will not be kept.',
    '{n} رکورد نامعتبر نادیده گرفته شد. نسخهٔ اصلی در حافظهٔ مرورگر نگه داشته شده است.': ({ n }) => `${n} invalid record(s) skipped. The original copy is kept in browser storage.`,
    'اطلاعات ذخیره‌شده قابل خواندن نبود و نسخهٔ خام آن جدا نگه داشته شد. اگر فایل پشتیبان داری، از «تنظیمات» بازیابی کن.': 'Saved data could not be read and the raw copy was set aside. If you have a backup file, restore it from Settings.',
    'ضبط ویس': 'Record voice', 'پایان ضبط': 'Stop recording', 'ضبط دوباره': 'Record again', 'صدای ضبط‌شدهٔ فعلی جایگزین شود؟': 'Replace the current recording?',
    'تبدیل گفتار به متن': 'Speech to text', 'برای تبدیل جداگانه، دکمهٔ تبدیل گفتار به متن را بزن': 'Tap Speech to text to dictate separately',
    'تست میکروفون': 'Test microphone', 'اول ضبط یا تبدیل را پایان بده، سپس میکروفون را تست کن': 'Stop recording or transcription before testing the microphone',
    'میکروفون فعال است. حالا ضبط یا تبدیل گفتار را بزن.': 'Microphone is ready. Start recording or transcription.',
    'پایان تبدیل': 'Stop transcription', 'تبدیل متوقف شد؛ متن را بررسی کن': 'Transcription stopped; review the text',
    'در حال تبدیل گفتار… برای پایان دکمه را بزن': 'Transcribing… tap Stop to finish',
    'در حال شنیدن گفتار فارسی… برای پایان دکمه را بزن': 'Listening to Persian speech… tap Stop to finish',
    'اول تبدیل گفتار را پایان بده': 'Stop transcription before saving',
    'در حال تبدیل گفتار…': 'Transcribing…', 'در حال شنیدن گفتار فارسی…': 'Listening to Persian speech…', 'متن آماده است؛ آن را بررسی کن': 'Text is ready; check it before saving',
    'اول ضبط ویس را تمام کن، سپس تبدیل گفتار را بزن': 'Stop recording first, then tap Speech to text',
    'این مرورگر تشخیص گفتار را پشتیبانی نمی‌کند': 'This browser does not support speech recognition',
    'تشخیص گفتار شروع نشد؛ اجازهٔ میکروفون را بررسی کن': 'Speech recognition did not start; check microphone access',
    'فایل صوتی به یادداشت وصل است': 'Audio is attached to this note', 'گفتار فارسی در کادر بالا نوشته می‌شود': 'Persian speech appears in the text field above',
    'در حال ضبط و تبدیل گفتار…': 'Recording and transcribing…', 'در حال بارگذاری صدا…': 'Loading audio…', 'فایل صوتی روی این دستگاه پیدا نشد': 'Audio file was not found on this device',
    'رسید یادداشت': 'Note receipt', 'رسید ویس و متن': 'Voice and text receipt', 'متن تبدیل‌شده از گفتار': 'Transcribed text', 'متن یادداشت': 'Note text',
    'صدای اصلی': 'Original recording', 'شماره رسید': 'Receipt number', 'دانلود رسید': 'Download receipt', 'دریافت فایل صوتی': 'Download audio',
    'فایل صوتی همراه این رسید جداگانه دریافت می‌شود': 'Download the audio file separately with this receipt', 'صدای یادداشت': 'Note audio',
    'صدا آمادهٔ ذخیره است؛ متن را بررسی کن و یادداشت را ثبت کن': 'Audio is ready. Check the text and save the note.',
    'اول ضبط را تمام کن': 'Stop recording before saving', 'این مرورگر ضبط صدا را پشتیبانی نمی‌کند': 'This browser does not support audio recording',
    'دسترسی میکروفون بسته است': 'Microphone access is blocked', 'میکروفون در دسترس نیست': 'Microphone is unavailable',
    'ضبط صدا فعال است؛ متن را دستی بنویس': 'Audio recording is active; type the text manually',
    'تبدیل گفتار به اینترنت نیاز دارد': 'Speech recognition needs internet', 'تبدیل گفتار انجام نشد؛ صدا همچنان ضبط می‌شود': 'Speech recognition failed; audio recording continues'
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

  const EN_ONES = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const EN_TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  const EN_SCALES = ['', 'thousand', 'million', 'billion', 'trillion'];

  function enUnderThousand(value) {
    const parts = [];
    const hundreds = Math.floor(value / 100);
    const rest = value % 100;
    if (hundreds) parts.push(`${EN_ONES[hundreds]} hundred`);
    if (rest) parts.push(rest < 20 ? EN_ONES[rest] : `${EN_TENS[Math.floor(rest / 10)]}${rest % 10 ? `-${EN_ONES[rest % 10]}` : ''}`);
    return parts.join(' ');
  }

  function numberToWordsEn(value) {
    if (!Number.isFinite(value) || value < 0) return '';
    let rest = Math.floor(value);
    if (rest === 0) return 'zero';
    const groups = [];
    while (rest > 0) { groups.push(rest % 1000); rest = Math.floor(rest / 1000); }
    const parts = [];
    for (let index = groups.length - 1; index >= 0; index -= 1) {
      if (groups[index] && index < EN_SCALES.length) parts.push(`${enUnderThousand(groups[index])}${EN_SCALES[index] ? ` ${EN_SCALES[index]}` : ''}`);
    }
    return parts.join(' ');
  }

  function numberToWords(value) {
    return isEn() ? numberToWordsEn(value) : numberToWordsFa(value);
  }

  function numberToWordsFa(value) {
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

  /* --------------------- تقویم (شمسی برای فارسی، میلادی برای انگلیسی) --------------------- */

  const MONTHS = {
    fa: ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'],
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  };
  const monthNames = () => MONTHS[LANG];
  const persianFormatter = new Intl.DateTimeFormat('en-US-u-ca-persian-nu-latn', {
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

  /* شمسی */
  function persianParts(iso) {
    const cached = partsCache.get(iso);
    if (cached) return cached;
    const result = {};
    persianFormatter.formatToParts(new Date(`${iso}T12:00:00Z`)).forEach(part => {
      if (['year', 'month', 'day'].includes(part.type)) result[part.type] = Number(part.value);
    });
    const parts = { jy: result.year, jm: result.month, jd: result.day };
    if (partsCache.size > 6000) partsCache.clear();
    partsCache.set(iso, parts);
    return parts;
  }

  function persianToISO(jy, jm, jd) {
    if (jy < 1300 || jy > 1500 || jm < 1 || jm > 12 || jd < 1 || jd > 31) return '';
    const dayOfYear = jm <= 6 ? (jm - 1) * 31 + jd - 1 : 186 + (jm - 7) * 30 + jd - 1;
    const base = Date.UTC(jy + 621, 2, 19, 12);
    for (let shift = -1; shift <= 5; shift += 1) {
      const date = new Date(base + (dayOfYear + shift) * 86400000);
      const parts = persianParts(date.toISOString().slice(0, 10));
      if (parts.jy === jy && parts.jm === jm && parts.jd === jd) return date.toISOString().slice(0, 10);
    }
    return '';
  }

  function persianLength(year, month) {
    if (month <= 6) return 31;
    if (month <= 11) return 30;
    return persianToISO(year, 12, 30) ? 30 : 29;
  }

  /* میلادی (همان نام‌های jy/jm/jd برای هر دو تقویم به‌کار می‌رود) */
  function gregorianParts(iso) {
    return { jy: Number(iso.slice(0, 4)), jm: Number(iso.slice(5, 7)), jd: Number(iso.slice(8, 10)) };
  }

  function gregorianToISO(year, month, day) {
    if (year < 1900 || year > 2200 || month < 1 || month > 12 || day < 1 || day > 31) return '';
    const iso = `${year}-${pad2(month)}-${pad2(day)}`;
    return isValidISO(iso) ? iso : '';
  }

  const gregorianLength = (year, month) => new Date(Date.UTC(year, month, 0)).getUTCDate();

  const CALENDARS = {
    fa: { parts: persianParts, toISO: persianToISO, length: persianLength },
    en: { parts: gregorianParts, toISO: gregorianToISO, length: gregorianLength }
  };
  const calendarOf = lang => CALENDARS[lang] || CALENDARS.fa;

  function jalaliParts(value = new Date()) {
    let iso = value instanceof Date ? localISO(value) : String(value).slice(0, 10);
    if (!isValidISO(iso)) iso = localISO();
    return calendarOf(LANG).parts(iso);
  }

  function jalaliToISO(year, month, day) {
    const jy = Number(year);
    const jm = Number(month);
    const jd = Number(day);
    if (!Number.isInteger(jy) || !Number.isInteger(jm) || !Number.isInteger(jd)) return '';
    return calendarOf(LANG).toISO(jy, jm, jd);
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
    return localDigits(`${parts.jy}/${pad2(parts.jm)}/${pad2(parts.jd)}`);
  }

  function monthKeyOf(year, month) { return `${year}-${pad2(month)}`; }
  function jalaliMonthKey(value = cursor) {
    const parts = jalaliParts(value);
    return monthKeyOf(parts.jy, parts.jm);
  }
  function jalaliMonthLabel(value = cursor) {
    const parts = jalaliParts(value);
    return `${monthNames()[parts.jm - 1]} ${localDigits(parts.jy)}`;
  }
  function monthKeyLabel(key) {
    const [year, month] = key.split('-').map(Number);
    return `${monthNames()[month - 1] || ''} ${localDigits(year)}`;
  }
  function nextMonthKey(key, offset = 1) {
    const [year, month] = key.split('-').map(Number);
    const total = year * 12 + month - 1 + offset;
    return monthKeyOf(Math.floor(total / 12), total % 12 + 1);
  }

  function jalaliDateLabel(iso) {
    if (!isValidISO(iso)) return t('بدون تاریخ');
    return new Intl.DateTimeFormat(isEn() ? 'en-US' : 'fa-IR-u-ca-persian', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })
      .format(new Date(`${iso}T12:00:00Z`));
  }

  function jalaliWeekdayLabel(iso, withYear = false) {
    if (!isValidISO(iso)) return '';
    return new Intl.DateTimeFormat(isEn() ? 'en-US' : 'fa-IR-u-ca-persian', { weekday: 'long', day: 'numeric', month: 'long', ...(withYear ? { year: 'numeric' } : {}), timeZone: 'UTC' })
      .format(new Date(`${iso}T12:00:00Z`));
  }

  function jalaliMonthLength(year, month) {
    return calendarOf(LANG).length(year, month);
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
    if (days === null) return t('بدون سررسید');
    if (days < 0) return t('{n} روز گذشته', { n: number(-days), c: -days });
    if (days === 0) return t('امروز');
    if (days === 1) return t('فردا');
    return t('{n} روز دیگر', { n: number(days), c: days });
  }

  function relativeDay(iso) {
    const days = daysUntil(iso);
    const label = jalaliWeekdayLabel(iso);
    if (days === 0) return `${t('امروز')} · ${label}`;
    if (days === -1) return `${t('دیروز')} · ${label}`;
    return label;
  }

  /** با تغییر زبان، دادهٔ وابسته به تقویم (بودجه، تکرار ماهانه، روز سررسید قسط) را به تقویم تازه برمی‌گرداند. */
  function migrateCalendarDraft(draft, from, to) {
    if (from === to) return draft;
    const fromCal = calendarOf(from);
    const toCal = calendarOf(to);
    const monthIn = iso => { const parts = toCal.parts(iso); return monthKeyOf(parts.jy, parts.jm); };
    const convertKey = key => {
      const [year, month] = String(key).split('-').map(Number);
      // با روز ۱۵ ماه تبدیل می‌کنیم تا ماهِ «غالب» انتخاب شود و رفت‌وبرگشت زبان داده را جابه‌جا نکند.
      const iso = fromCal.toISO(year, month, 15);
      return iso ? monthIn(iso) : key;
    };
    draft.budgets.forEach(item => { item.month = convertKey(item.month); });
    draft.installments.forEach(item => { if (item.nextDueDate) item.dueDay = toCal.parts(item.nextDueDate).jd; });
    draft.recurring.forEach(rule => {
      rule.startMonth = convertKey(rule.startMonth);
      const months = new Set((rule.doneMonths || []).map(convertKey));
      draft.transactions.forEach(item => { if (item.source?.kind === 'recurring' && item.source.id === rule.id) months.add(monthIn(item.date)); });
      rule.doneMonths = [...months].sort();
    });
    draft.settings.language = to;
    return draft;
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
      crt: ['off', 'soft', 'full'].includes(incoming.crt) ? incoming.crt : 'full',
      language: incoming.language === 'en' ? 'en' : 'fa',
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

    const noteId = makeIdSource();
    const notes = list(raw.notes).map(item => {
      if (!item || typeof item !== 'object') return drop();
      const text = cleanMultiline(item.text, 20000);
      if (!text) return drop();
      return {
        id: noteId(item.id), text, date: validDate(item.date), done: item.done === true, pinned: item.pinned === true,
        createdAt: Number.isNaN(Date.parse(item.createdAt)) ? new Date().toISOString() : item.createdAt, updatedAt: item.updatedAt || '', voice: item.voice === true
      };
    }).filter(Boolean);

    const goalId = makeIdSource();
    const goals = list(raw.goals).map(item => {
      if (!item || typeof item !== 'object') return drop();
      const target = validAmount(item.target);
      if (!target) return drop();
      const savedRaw = Number(item.saved);
      return {
        id: goalId(item.id), title: cleanText(item.title, 80, 'هدف'), target,
        saved: Number.isFinite(savedRaw) ? Math.max(0, Math.min(MAX_AMOUNT, Math.round(savedRaw))) : 0, dueDate: validDate(item.dueDate),
        createdAt: Number.isNaN(Date.parse(item.createdAt)) ? new Date().toISOString() : item.createdAt, updatedAt: item.updatedAt || ''
      };
    }).filter(Boolean);

    return { version: 5, settings, transactions, installments, debts, goals, budgets, recurring, notes };
  }

  /* ------------------------------- ذخیره‌سازی ------------------------------- */

  function bannerText(value) {
    if (!value) return '';
    return typeof value === 'object' ? t(value.key, { n: number(value.n) }) : t(value);
  }

  function renderBanners() {
    const warning = $('#storageWarning');
    if (!warning) return;
    const message = [banners.storage, banners.data].map(bannerText).filter(Boolean).join('\n');
    warning.hidden = !message;
    warning.textContent = message;
  }

  const STORAGE_MESSAGE = 'مرورگر اجازهٔ ذخیره‌سازی نمی‌دهد. حالت خصوصی را ببند یا فضای مرورگر را خالی کن؛ تا رفع این مشکل اطلاعات جدید ماندگار نمی‌شود.';

  function saveState(nextState = state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
      mirrorSchedule(nextState);
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
        const parsed = JSON.parse(raw);
        LANG = parsed?.settings?.language === 'en' ? 'en' : 'fa';
        state = normalizeState(parsed, stats);
        if (stats.dropped) {
          banners.data = { key: '{n} رکورد نامعتبر نادیده گرفته شد. نسخهٔ اصلی در حافظهٔ مرورگر نگه داشته شده است.', n: stats.dropped };
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
      note: `قسط ${storedNumber(item.paidCount)} از ${storedNumber(item.count)}`, source, createdAt: new Date().toISOString()
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
      result.push({ kind: 'installment', id: item.id, title: item.title, amount: item.amount, date: item.nextDueDate, detail: t('قسط {a} از {b}', { a: number(Number(item.paidCount) + 1), b: number(item.count) }), incoming: false });
    });
    source.debts.filter(item => item.status !== 'done' && Number(item.remaining) > 0).forEach(item => {
      result.push({ kind: 'debt', id: item.id, title: item.title, amount: item.remaining, date: item.dueDate, detail: item.direction === 'owe' ? t('بدهی من') : t('طلب من'), incoming: item.direction === 'receivable' });
    });
    return result.filter(item => item.date).sort((a, b) => a.date.localeCompare(b.date));
  }

  /* ------------------------------ رابط کاربری ------------------------------ */

  const esc = escapeHtml;
  const ADD_KINDS = [
    ['expense', 'خرج', 'down'], ['income', 'درآمد', 'up'], ['installment', 'قسط', 'clock'],
    ['debt', 'بدهی و طلب', 'exchange'], ['goal', 'هدف', 'target'], ['note', 'یادداشت', 'note']
  ];
  const KIND_TITLE = { expense: 'خرج', income: 'درآمد', installment: 'قسط', debt: 'بدهی یا طلب', goal: 'هدف پس‌انداز', note: 'یادداشت' };
  const NAV = [
    ['home', '/', 'home', 'خانه'],
    ['add', '/add', 'plus', 'افزودن'],
    ['list', '/list', 'list', 'فهرست'],
    ['calc', '/calc', 'calculator', 'ماشین‌حساب'],
    ['settings', '/settings', 'settings', 'تنظیمات']
  ];
  const LIST_TABS = [['transactions', 'تراکنش‌ها'], ['obligations', 'قسط و بدهی'], ['goals', 'هدف‌ها'], ['notes', 'یادداشت‌ها']];
  const ui = { cmpCat: '', expanded: '', paying: '', category: '', recurring: '', lastKind: 'expense', preset: null, open: new Set(['finance']) };
  const drafts = {};
  let route = { page: 'home', parts: [] };
  let lastDay = localISO();

  /* ---------- مسیریابی (hash) ---------- */

  function parseRoute() {
    const raw = String(location.hash || '').replace(/^#/, '').split('?')[0];
    const parts = raw.split('/').filter(Boolean).map(part => { try { return decodeURIComponent(part); } catch { return part; } });
    const page = ['add', 'list', 'calc', 'settings', 'receipt', 'note-receipt', 'compare'].includes(parts[0]) ? parts[0] : 'home';
    return { page, parts: parts[0] === page ? parts.slice(1) : [] };
  }

  function go(path) {
    if (location.hash === `#${path}`) render();
    else location.hash = path;
  }

  /* ---------- اجزای کوچک ---------- */

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
    document.documentElement.dataset.crt = ['off', 'soft', 'full'].includes(state.settings.crt) ? state.settings.crt : 'full';
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) themeMeta.content = state.settings.theme === 'dark' ? '#060705' : '#9db38a';
    const toggle = $('#themeToggle');
    if (toggle) toggle.innerHTML = icon(state.settings.theme === 'dark' ? 'sun' : 'moon');
  }

  function pageHead(eyebrow, title, actions = '') {
    return `<div class="page-head"><div><div class="eyebrow">${esc(eyebrow)}</div><h1>${esc(title)}</h1></div>${actions ? `<div class="actions">${actions}</div>` : ''}</div>`;
  }

  function empty(title, description, actionMarkup = '') {
    return `<div class="empty"><strong>${esc(title)}</strong><span>${esc(description)}</span>${actionMarkup}</div>`;
  }

  /** کاشی آماری: عدد روی یک پنجرهٔ LCD کوچک (سبز: عادی/درآمد، کهربایی: خرج، قرمز: منفی). */
  function stat(title, value, iconName, className, description) {
    const tone = className === 'negative' ? 'amber' : '';
    return `<div class="panel stat"><div class="stat-top"><span>${esc(title)}</span><span>${icon(iconName)}</span></div><div class="lcd mini ${tone}"><span class="sr-only">${number(value)}</span>${segMoney(value, { pad: 6, cls: 'seg-stat' })}</div><span class="muted">${esc(description)}</span></div>`;
  }

  function sortTransactions(rows) {
    return rows.sort((a, b) => `${b.date}${b.createdAt || ''}`.localeCompare(`${a.date}${a.createdAt || ''}`));
  }

  function todayInfo() {
    const iso = localISO();
    const date = new Date(`${iso}T12:00:00Z`);
    return {
      iso,
      weekday: new Intl.DateTimeFormat(isEn() ? 'en-US' : 'fa-IR-u-ca-persian', { weekday: 'long', timeZone: 'UTC' }).format(date),
      jalali: jalaliDateLabel(iso),
      // خط دوم: تقویم دیگر (در فارسی میلادی، در انگلیسی شمسی)
      gregorian: new Intl.DateTimeFormat(isEn() ? 'en-US-u-ca-persian' : 'fa-IR-u-ca-gregory', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date)
    };
  }

  function greeting() {
    const hour = new Date().getHours();
    if (hour < 5) return t('شب بخیر');
    if (hour < 12) return t('صبح بخیر');
    if (hour < 17) return t('ظهر بخیر');
    if (hour < 20) return t('عصر بخیر');
    return t('شب بخیر');
  }

  function monthSwitcher() {
    const current = jalaliMonthKey(cursor) === jalaliMonthKey(localISO());
    return `<div class="month-switcher"><button class="icon-button small" type="button" data-action="previous-month" aria-label="${t('ماه قبل')}"><span class="chevron previous"></span></button><strong>${esc(jalaliMonthLabel(cursor))}</strong><button class="icon-button small" type="button" data-action="next-month" aria-label="${t('ماه بعد')}"><span class="chevron next"></span></button>${current ? '' : `<button class="button small" type="button" data-action="current-month">${t('همین ماه')}</button>`}</div>`;
  }

  /* ---------- نمایشگر LCD هفت‌قسمتی (گرافیک است، فونت نیست) ---------- */

  const SEG_MAP = { 0: 'abcdef', 1: 'bc', 2: 'abdeg', 3: 'abcdg', 4: 'bcfg', 5: 'acdfg', 6: 'acdefg', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg', '-': 'g', E: 'adefg', r: 'eg', o: 'cdeg' };
  const SEG_SHAPES = (() => {
    const t = 9;
    const hz = (x1, x2, y) => `${x1},${y + t / 2} ${x1 + t / 2},${y} ${x2 - t / 2},${y} ${x2},${y + t / 2} ${x2 - t / 2},${y + t} ${x1 + t / 2},${y + t}`;
    const vt = (x, y1, y2) => `${x + t / 2},${y1} ${x + t},${y1 + t / 2} ${x + t},${y2 - t / 2} ${x + t / 2},${y2} ${x},${y2 - t / 2} ${x},${y1 + t / 2}`;
    return { a: hz(4, 52, 1), g: hz(4, 52, 45.5), d: hz(4, 52, 90), f: vt(1, 7, 47), b: vt(46, 7, 47), e: vt(1, 53, 93), c: vt(46, 53, 93) };
  })();

  function segRender(tokens, cls = '') {
    let x = 0;
    let body = '';
    tokens.forEach(token => {
      if (token.k === 'd') {
        const on = SEG_MAP[token.v] || '';
        body += `<g transform="translate(${x} 0)">${Object.entries(SEG_SHAPES).map(([key, points]) => `<polygon points="${points}" class="${on.includes(key) ? 'on' : 'off'}"/>`).join('')}</g>`;
        x += 66;
      } else if (token.k === 'dot') {
        body += `<circle cx="${x + 7}" cy="95" r="5.5" class="${token.lit ? 'on' : 'off'}"/>${token.comma ? `<polygon points="${x + 10},97 ${x + 4},107 ${x + 1.5},105.5 ${x + 5},96" class="${token.lit ? 'on' : 'off'}"/>` : ''}`;
        x += 22;
      } else if (token.k === 'colon') {
        body += `<circle cx="${x + 7}" cy="32" r="5.5" class="on"/><circle cx="${x + 7}" cy="68" r="5.5" class="on"/>`;
        x += 24;
      }
    });
    return `<svg class="lcd-svg ${cls}" viewBox="0 0 ${Math.max(20, x - 10)} 108" preserveAspectRatio="xMaxYMid meet" aria-hidden="true" focusable="false">${body}</svg>`;
  }

  function segMoney(value, { pad = 9, cls = '' } = {}) {
    const amount = Math.min(Math.abs(Math.round(Number(value) || 0)), 99999999999999);
    const negative = Number(value) < 0;
    const digits = String(amount).split('');
    const count = Math.max(pad, digits.length + (negative ? 1 : 0));
    const cells = Array(count - digits.length).fill(null).concat(digits);
    if (negative) cells[count - digits.length - 1] = '-';
    const tokens = [];
    cells.forEach((cell, index) => {
      if (index > 0 && (count - index) % 3 === 0) tokens.push({ k: 'dot', comma: true, lit: cell !== null && cell !== '-' && cells[index - 1] !== null && cells[index - 1] !== '-' });
      tokens.push({ k: 'd', v: cell });
    });
    return segRender(tokens, `${cls} ${negative ? 'neg' : ''}`);
  }

  /** نمایش متن عددی (مثل «-1234.5» یا «Error») روی LCD؛ هزارگان با کاما، اعشار با نقطه. */
  function segNumber(text, { pad = 12, cls = '' } = {}) {
    const isDigit = cell => cell !== null && cell !== '-' && cell !== undefined;
    if (!/^-?[\d.]+$/.test(text)) {
      const letters = String(text).split('');
      const cells = Array(Math.max(0, pad - letters.length)).fill(null).concat(letters);
      return segRender(cells.map(v => ({ k: 'd', v })), `${cls} err`);
    }
    const negative = text[0] === '-';
    const body = negative ? text.slice(1) : text;
    const dot = body.indexOf('.');
    const whole = dot < 0 ? body : body.slice(0, dot);
    const fraction = dot < 0 ? '' : body.slice(dot + 1);
    const capacity = Math.max(pad - fraction.length, whole.length + (negative ? 1 : 0), 1);
    const cells = Array(capacity - whole.length).fill(null).concat(whole.split(''));
    if (negative) cells[capacity - whole.length - 1] = '-';
    const tokens = [];
    cells.forEach((cell, index) => {
      if (index > 0 && (capacity - index) % 3 === 0) tokens.push({ k: 'dot', comma: true, lit: isDigit(cell) && isDigit(cells[index - 1]) });
      tokens.push({ k: 'd', v: cell });
    });
    if (dot >= 0) tokens.push({ k: 'dot', lit: true });
    fraction.split('').forEach(v => { if (v) tokens.push({ k: 'd', v }); });
    return segRender(tokens, `${cls} ${negative ? 'neg' : ''}`);
  }

  function segDate(iso, cls = '') {
    const parts = jalaliParts(iso);
    const two = value => String(value).padStart(2, '0').split('');
    const tokens = [];
    String(parts.jy).split('').forEach(v => tokens.push({ k: 'd', v }));
    tokens.push({ k: 'dot', lit: true });
    two(parts.jm).forEach(v => tokens.push({ k: 'd', v }));
    tokens.push({ k: 'dot', lit: true });
    two(parts.jd).forEach(v => tokens.push({ k: 'd', v }));
    return segRender(tokens, cls);
  }

  function updateLcd(input) {
    const target = input.closest('.field')?.querySelector('.lcd-live');
    if (!target) return;
    const value = parseMoney(input.value);
    target.innerHTML = segMoney(value && value > 0 ? value : 0, { pad: 9 });
  }

  /* ---------- خط‌کش ماه، تقویم نقطه‌ای ماه و سال ---------- */

  const weekdayLetters = () => (isEn() ? ['M', 'T', 'W', 'T', 'F', 'S', 'S'] : ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']);
  /** فارسی: هفته از شنبه شروع می‌شود؛ انگلیسی: از دوشنبه. */
  const weekOffset = iso => (new Date(`${iso}T12:00:00Z`).getUTCDay() + (isEn() ? 6 : 1)) % 7;
  const monthShort = index => (isEn() ? MONTHS.en[index].slice(0, 3) : MONTHS.fa[index]);

  function monthRuler(parts, monthLength, todayIso) {
    const monthKey = monthKeyOf(parts.jy, parts.jm);
    const todayKey = jalaliMonthKey(todayIso);
    const todayDay = monthKey === todayKey ? jalaliParts(todayIso).jd : monthKey < todayKey ? monthLength + 1 : 0;
    const ticks = Array.from({ length: monthLength }, (_, index) => {
      const day = index + 1;
      const kind = day === todayDay ? 'today' : day < todayDay ? 'past' : 'future';
      return `<i class="tick ${kind} ${day % 5 === 0 ? 'major' : ''}"></i>`;
    }).join('');
    const label = jalaliMonthLabel(jalaliToISO(parts.jy, parts.jm, 1));
    let left = label;
    let right = '';
    if (monthKey === todayKey) {
      left = t('روز {v1} از {v2}', { v1: number(todayDay), v2: number(monthLength) });
      right = todayDay >= monthLength ? t('آخرین روز ماه') : t('{v1} روز مانده', { v1: number(monthLength - todayDay) });
    } else right = monthKey < todayKey ? t('ماه گذشته') : t('ماه آینده');
    return `<div class="ruler" role="img" aria-label="${esc(`${left}${isEn() ? ', ' : '، '}${right}`)}"><div class="ticks">${ticks}</div><div class="ruler-cap"><span>${esc(left)}</span><span>${esc(right)}</span></div></div>`;
  }

  function dotMonth(rows, parts, monthLength, todayIso) {
    const perDay = Array(monthLength).fill(0);
    rows.filter(item => item.type === 'expense' && isCounted(item)).forEach(item => { perDay[jalaliParts(item.date).jd - 1] += Number(item.amount); });
    const maximum = Math.max(1, ...perDay);
    const total = perDay.reduce((sum, value) => sum + value, 0);
    const monthKey = monthKeyOf(parts.jy, parts.jm);
    const todayKey = jalaliMonthKey(todayIso);
    const elapsed = monthKey === todayKey ? jalaliParts(todayIso).jd : monthKey < todayKey ? monthLength : 0;
    const average = elapsed ? total / elapsed : 0;
    const gaps = Array.from({ length: weekOffset(jalaliToISO(parts.jy, parts.jm, 1)) }, () => '<span class="dd-gap"></span>').join('');
    const days = perDay.map((value, index) => {
      const iso = jalaliToISO(parts.jy, parts.jm, index + 1);
      const label = isEn() ? `${monthNames()[parts.jm - 1]} ${index + 1}` : `${localDigits(index + 1)} ${monthNames()[parts.jm - 1]}`;
      const size = value ? 0.38 + 0.62 * (value / maximum) : 0.2;
      return `<button class="day-dot ${iso === todayIso ? 'today' : ''} ${iso > todayIso ? 'future' : ''} ${value ? '' : 'zero'}" type="button" data-action="day-info" data-label="${esc(label)}" data-amount="${value}" style="--s:${size.toFixed(2)}" aria-label="${esc(label)}: ${number(value)} ${esc(cur())}"><i></i></button>`;
    }).join('');
    const readout = elapsed ? t('میانگین خرج روزانه: {v1} {v2}', { v1: number(average), v2: esc(cur()) }) : t('هنوز خرجی در این ماه ثبت نشده');
    return `<div class="dot-week" aria-hidden="true">${weekdayLetters().map(letter => `<span>${letter}</span>`).join('')}</div><div class="dot-month" role="group" aria-label="${t('خرج روزانه')}">${gaps}${days}</div><div class="readout" id="dayReadout" data-default="${esc(readout)}" aria-live="polite">${readout}</div><div class="hint-line sub">${t('هر نقطه یک روز است؛ نقطهٔ بزرگ‌تر یعنی خرج بیشتر. نقطهٔ نارنجی امروز است.')}</div>`;
  }

  function yearGrid(todayIso) {
    const today = jalaliParts(todayIso);
    let elapsed = 0;
    let total = 0;
    const months = monthNames().map((name, index) => {
      const month = index + 1;
      const length = jalaliMonthLength(today.jy, month);
      const first = jalaliToISO(today.jy, month, 1);
      const dots = Array.from({ length: length }, (_, dayIndex) => {
        const day = dayIndex + 1;
        const kind = month < today.jm || (month === today.jm && day < today.jd) ? 'past' : month === today.jm && day === today.jd ? 'today' : 'future';
        total += 1;
        if (kind !== 'future') elapsed += 1;
        return `<i class="yd ${kind}"></i>`;
      }).join('');
      const gaps = Array.from({ length: weekOffset(first) }, () => '<i class="yd gap"></i>').join('');
      return `<div class="ym"><button class="ym-name ${month === today.jm ? 'current' : ''}" type="button" data-action="goto-month" data-date="${first}">${monthShort(index)}</button><div class="ym-dots">${gaps}${dots}</div></div>`;
    }).join('');
    const left = total - elapsed;
    return `<div class="panel section year"><div class="section-head tight"><h2>${t('سال {v1}', { v1: esc(localDigits(today.jy)) })}</h2><span class="year-left"><b>${number(left)}</b> ${t('روز مانده')} <span class="muted">· ${number(Math.round(elapsed / total * 100))}${pctSign()}</span></span></div><div class="year-grid">${months}</div><div class="hint-line sub">${t('روی نام هر ماه بزن تا همان ماه را ببینی.')}</div></div>`;
  }

  /* ---------- ردیف‌ها ---------- */

  function transactionRow(transaction) {
    const expense = transaction.type === 'expense';
    const open = ui.expanded === transaction.id;
    const linked = Boolean(transaction.source);
    const id = esc(transaction.id);
    const details = [catName(transaction.category || 'سایر'), jalaliDateLabel(transaction.date), displayText(transaction.note)].filter(Boolean).map(esc).join(' · ');
    return `<div class="row ${open ? 'open' : ''}">
      <button class="row-main" type="button" data-action="toggle-row" data-id="${id}" aria-expanded="${open}">
        <span class="item-icon">${icon(expense ? 'down' : 'up')}</span>
        <span class="grow"><span class="title">${esc(displayText(transaction.title))}</span><span class="sub">${details}${isCounted(transaction) ? '' : ` · <span class="tag">${t('بدهی و طلب')}</span>`}</span></span>
        <span class="amount ${expense ? 'negative' : 'positive'}">${expense ? '−' : '+'}${number(transaction.amount)} <small>${esc(cur())}</small></span>
      </button>
      ${open ? `<div class="row-actions">${linked ? '' : `<a class="button small" href="#/add/${transaction.type}/${id}">${icon('edit')} ${t('ویرایش')}</a>`}<button class="button small" type="button" data-action="duplicate-transaction" data-id="${id}">${icon('copy')} ${t('تکرار امروز')}</button><button class="button small danger" type="button" data-action="delete-transaction" data-id="${id}">${icon('trash')} ${t('حذف')}</button>${linked ? `<span class="sub full">${t('این مورد به قسط، بدهی یا تکرار ماهانه وصل است؛ با حذفش، ماندهٔ همان مورد اصلاح می‌شود.')}</span>` : ''}</div>` : ''}
    </div>`;
  }

  function noteSort(a, b) {
    return (a.done - b.done) || (b.pinned - a.pinned) || String(a.date || '9').localeCompare(String(b.date || '9')) || String(b.createdAt).localeCompare(String(a.createdAt));
  }

  function noteRow(note) {
    const open = ui.expanded === note.id;
    const id = esc(note.id);
    const days = note.date ? daysUntil(note.date) : null;
    const overdue = !note.done && days !== null && days < 0;
    return `<div class="row note ${note.done ? 'done' : ''} ${open ? 'open' : ''}">
      <div class="row-main">
        <button class="check-btn ${note.done ? 'on' : ''}" type="button" data-action="toggle-note" data-id="${id}" role="checkbox" aria-checked="${note.done}" aria-label="${t('انجام شد')}">${note.done ? icon('check') : ''}</button>
        <button class="note-body" type="button" data-action="toggle-row" data-id="${id}" aria-expanded="${open}">
          <span class="note-text">${esc(note.text)}</span>
          ${note.date || note.pinned ? `<span class="sub">${note.pinned ? `${icon('pin')} ` : ''}${note.date ? `<span class="${overdue ? 'negative' : ''}">${esc(jalaliDateLabel(note.date))} · ${esc(note.done ? t('انجام شد') : dueLabel(note.date))}</span>` : ''}</span>` : ''}
        </button>
      </div>
      ${open ? `<div class="row-actions"><a class="button small" href="#/add/note/${id}">${icon('edit')} ${t('ویرایش')}</a><a class="button small" href="#/note-receipt/${id}">${icon('download')} ${t('رسید یادداشت')}</a><button class="button small" type="button" data-action="pin-note" data-id="${id}">${icon('pin')} ${note.pinned ? t('برداشتن سنجاق') : t('سنجاق')}</button><button class="button small danger" type="button" data-action="delete-note" data-id="${id}">${icon('trash')} ${t('حذف')}</button></div>` : ''}
    </div>`;
  }

  /* ---------- پرداخت درون‌خطی ---------- */

  const payKey = (kind, id) => `${kind}:${id}`;

  function payForm(kind, item) {
    const amount = kind === 'installment' ? item.amount : item.remaining;
    return `<form class="pay-box" data-form="pay" data-kind="${kind}" data-id="${esc(item.id)}" novalidate>
      <div class="form-grid">${moneyField('amount', kind === 'debt' && item.direction === 'receivable' ? t('مبلغ دریافتی') : t('مبلغ پرداختی'), amount, { autofocus: true })}${dateField('date', t('تاریخ'), localISO())}</div>
      <div class="form-actions"><button class="button" type="button" data-action="close-pay">${t('انصراف')}</button><button class="button primary" type="submit">${t('ثبت')}</button></div>
    </form>`;
  }

  /* ---------- مسیر خانه ---------- */

  function isStandalone() {
    try { return Boolean(globalThis.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone); } catch { return false; }
  }
  function isIOS() {
    return /iphone|ipad|ipod/i.test(navigator.userAgent || '') || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  function backupNag() {
    if (backupNagDismissed || state.transactions.length < 5) return '';
    const last = state.settings.lastBackup ? Date.parse(state.settings.lastBackup) : 0;
    if (last && (Date.now() - last) / 86400000 < 30) return '';
    return `<div class="notice"><span class="notice-icon">${icon('download')}</span><div class="grow"><strong>${last ? t('مدتی است پشتیبان نگرفته‌ای') : t('هنوز پشتیبان نگرفته‌ای')}</strong><div class="sub">${t('اطلاعات فقط روی همین دستگاه است. یک فایل پشتیبان بگیر تا گم نشود.')}</div></div><div class="actions"><button class="button small primary" type="button" data-action="export">${t('دریافت پشتیبان')}</button><button class="button small" type="button" data-action="dismiss-backup">${t('بعداً')}</button></div></div>`;
  }

  function welcomeCard() {
    if (state.transactions.length || state.installments.length || state.debts.length || state.notes.length) return '';
    return `<div class="panel welcome"><h2>${t('از همین‌جا شروع کن')}</h2><ol>
      <li><span>${t('موجودی فعلی‌ات را بنویس تا «موجودی کل» درست محاسبه شود.')}</span><a class="button small" href="#/settings">${t('تنظیم موجودی شروع')}</a></li>
      <li><span>${t('اولین خرج یا درآمدت را ثبت کن؛ فقط مبلغ و دسته کافی است.')}</span><a class="button small primary" href="#/add/expense">${t('ثبت خرج')}</a></li>
      <li><span>${t('قسط، وام یا قرض داری؟ سررسیدش را اضافه کن تا یادت نرود.')}</span><a class="button small" href="#/add/installment">${t('قسط جدید')}</a></li>
    </ol></div>`;
  }

  function upcomingRows(items) {
    return items.map(item => {
      const key = payKey(item.kind, item.id);
      const source = item.kind === 'installment' ? state.installments.find(value => value.id === item.id) : state.debts.find(value => value.id === item.id);
      return `<div class="row ${ui.paying === key ? 'open' : ''}">
        <div class="row-main"><span class="dot ${item.incoming ? 'in' : 'out'}"></span><span class="grow"><span class="title">${esc(displayText(item.title))}</span><span class="sub">${esc(item.detail)} · ${esc(jalaliDateLabel(item.date))}</span></span>
        <span class="due"><strong class="${item.incoming ? 'positive' : ''}">${number(item.amount)}</strong><span class="sub ${daysUntil(item.date) < 0 ? 'negative' : ''}">${esc(dueLabel(item.date))}</span></span>
        <button class="button small ${ui.paying === key ? '' : 'primary'}" type="button" data-action="open-pay" data-kind="${item.kind}" data-id="${esc(item.id)}">${item.incoming ? t('دریافت') : t('پرداخت')}</button></div>
        ${ui.paying === key && source ? payForm(item.kind, source) : ''}
      </div>`;
    }).join('');
  }

  /* ---------- نمودارهای آنالوگ: ولت‌متر عقربه‌ای و ستون‌های LED ---------- */

  /** نوار LED: cells خانه، lit تا نسبت ratio روشن؛ tone = 'g' (سبز) یا 'level' (سبز→کهربایی→قرمز). */
  function ledBar(ratio, cells = 16, tone = 'g') {
    const lit = ratio > 0 ? Math.max(1, Math.min(cells, Math.round(ratio * cells))) : 0;
    return Array.from({ length: cells }, (_, index) => {
      const position = (index + 1) / cells;
      const color = tone === 'level' ? (position > 0.9 ? 'r' : position > 0.7 ? 'a' : 'g') : tone;
      return `<i class="${color}${index < lit ? ' on' : ''}"></i>`;
    }).join('');
  }

  function progressBar(ratio, { cells = 20, state = '' } = {}) {
    const percent = Math.max(0, Math.min(100, Math.round(ratio * 100)));
    return `<div class="progress led ${state}" role="progressbar" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100">${ledBar(ratio, cells, state === 'over' ? 'r' : state === 'warn' ? 'a' : 'g')}</div>`;
  }

  /** ولت‌متر قدیمی با عقربه؛ مقیاس ۰ تا ۱۱۵٪ و ناحیهٔ قرمز بالای ۹۰٪. */
  function gauge(ratio) {
    const maximum = 115;
    const clamped = Math.max(0, Math.min(ratio * 100, maximum));
    const angle = -90 + clamped / maximum * 180;
    const point = (value, radius) => {
      const theta = Math.PI - value / maximum * Math.PI;
      return [100 + radius * Math.cos(theta), 100 - radius * Math.sin(theta)];
    };
    const arc = (from, to, radius) => {
      const [x1, y1] = point(from, radius);
      const [x2, y2] = point(to, radius);
      return `M${x1.toFixed(2)} ${y1.toFixed(2)}A${radius} ${radius} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
    };
    const ticks = Array.from({ length: 24 }, (_, index) => {
      const value = index * 5;
      const major = value % 25 === 0;
      const [x1, y1] = point(value, major ? 62 : 68);
      const [x2, y2] = point(value, 76);
      return `<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" class="${major ? 'major' : ''}"/>`;
    }).join('');
    const labels = [0, 50, 100].map(value => {
      const [x, y] = point(value, 50);
      return `<text x="${x.toFixed(1)}" y="${(y + 3).toFixed(1)}" text-anchor="middle">${localDigits(value)}</text>`;
    }).join('');
    return `<svg class="gauge" viewBox="0 0 200 112" role="img" aria-label="${esc(t('{v1}٪ از بودجه', { v1: number(Math.round(ratio * 100)) }))}">
      <path class="gauge-face" d="M8 104A92 92 0 0 1 192 104Z"/>
      <path class="zone g" d="${arc(0, 70, 84)}"/><path class="zone a" d="${arc(70, 90, 84)}"/><path class="zone r" d="${arc(90, maximum, 84)}"/>
      <g class="gauge-ticks">${ticks}</g><g class="gauge-labels">${labels}</g>
      <g class="needle" style="--angle:${angle.toFixed(1)}deg"><line x1="100" y1="100" x2="100" y2="30"/><line class="tail" x1="100" y1="100" x2="100" y2="112"/></g>
      <circle class="hub" cx="100" cy="100" r="7"/>
    </svg>`;
  }

  /** ستون‌های LED شش‌ماهه (درآمد سبز، خرج کهربایی) روی صفحهٔ سیاه. */
  function monthBars(months, monthKey) {
    const maximum = Math.max(1, ...months.flatMap(item => [item.income, item.expense]));
    const column = (value, color) => `<span class="vu-col ${color}">${Array.from({ length: 10 }, (_, index) => `<i class="${index < (value > 0 ? Math.max(1, Math.round(value / maximum * 10)) : 0) ? 'on' : ''}"></i>`).join('')}</span>`;
    return `<div class="lcd vu"><div class="vu-cols">${months.map(item => `<button class="vu-month ${item.key === monthKey ? 'current' : ''}" type="button" data-action="goto-month" data-date="${item.first}" aria-label="${t('{v1}: درآمد {v2}، خرج {v3}', { v1: esc(monthNames()[item.jm - 1]), v2: number(item.income), v3: number(item.expense) })}" aria-pressed="${item.key === monthKey}">${column(item.income, 'income')}${column(item.expense, 'expense')}</button>`).join('')}</div>
      <div class="month-names">${months.map(item => `<span class="${item.key === monthKey ? 'current' : ''}">${monthShort(item.jm - 1)}</span>`).join('')}</div></div>`;
  }

  function renderHome() {
    const info = todayInfo();
    const monthKey = jalaliMonthKey();
    const todayKey = jalaliMonthKey(info.iso);
    const rows = monthTransactions(monthKey);
    const result = totals(rows);
    const previous = totals(monthTransactions(jalaliMonthKey(shiftJalaliMonth(cursor, -1))));
    const budget = Number(state.settings.monthlyBudget || 0);
    const remainingBudget = budget - result.expense;
    const parts = jalaliParts(cursor);
    const monthLength = jalaliMonthLength(parts.jy, parts.jm);
    let daysLeft = 0;
    if (monthKey === todayKey) daysLeft = Math.max(1, monthLength - jalaliParts(info.iso).jd + 1);
    else if (monthKey > todayKey) daysLeft = monthLength;
    const dailyCap = budget && daysLeft ? Math.max(0, remainingBudget) / daysLeft : null;
    const budgetRatio = budget ? result.expense / budget : 0;
    const recent = sortTransactions([...rows]).slice(0, 5);
    const near = upcomingItems().filter(item => daysUntil(item.date) <= 30);
    const payable = near.filter(item => !item.incoming);
    const incomingTotal = near.filter(item => item.incoming).reduce((sum, item) => sum + Number(item.amount || 0), 0);
    let expenseNote = t('بدون بودجه');
    if (budget) expenseNote = t('{v1}٪ از بودجه', { v1: number(Math.round(budgetRatio * 100)) });
    else if (previous.expense > 0) {
      const change = Math.round((result.expense - previous.expense) / previous.expense * 100);
      expenseNote = change === 0 ? t('برابر ماه قبل') : t(change > 0 ? '{v1}٪ بیشتر از ماه قبل' : '{v1}٪ کمتر از ماه قبل', { v1: number(Math.abs(change)) });
    }
    const net = result.income - result.expense;
    const months = [];
    for (let offset = 5; offset >= 0; offset -= 1) {
      const date = shiftJalaliMonth(cursor, -offset);
      const p = jalaliParts(date);
      months.push({ key: monthKeyOf(p.jy, p.jm), jm: p.jm, first: jalaliToISO(p.jy, p.jm, 1), ...totals(monthTransactions(monthKeyOf(p.jy, p.jm))) });
    }
    const categories = {};
    rows.filter(item => item.type === 'expense' && isCounted(item)).forEach(item => { const c = item.category || 'سایر'; categories[c] = (categories[c] || 0) + Number(item.amount || 0); });
    const categoryRows = Object.entries(categories).sort((a, b) => b[1] - a[1]);
    const categoryMax = Math.max(1, ...categoryRows.map(item => item[1]));
    const savingRate = result.income ? Math.round(net / result.income * 100) : null;
    const notes = state.notes.filter(note => !note.done).sort(noteSort).slice(0, 3);
    const activeGoals = state.goals.filter(item => !goalInfo(item).done).sort((a, b) => String(a.dueDate || '9').localeCompare(String(b.dueDate || '9'))).slice(0, 3);
    const balance = balanceOf();
    const quick = [['expense', t('خرج'), 'minus'], ['income', t('درآمد'), 'plus'], ['installment', t('قسط'), 'clock'], ['debt', t('بدهی و طلب'), 'exchange'], ['note', t('یادداشت'), 'note']];
    $('#screen').innerHTML = `
      <div class="hello">
        <div><div class="eyebrow">${esc(greeting())}</div><h1>${esc(info.weekday)}${isEn() ? ',' : '،'} ${esc(info.jalali)}</h1><div class="sub">${esc(info.gregorian)}</div></div>
        ${monthSwitcher()}
      </div>
      ${backupNag()}${welcomeCard()}
      <div class="panel hero">
        <div class="hero-main"><div class="lcd"><div class="lcd-cap"><span>${t('موجودی تخمینی کل')}</span><span>${esc(cur())}</span></div><span class="hero-value sr-only">${number(balance)} ${esc(cur())}</span>${segMoney(balance, { pad: 9, cls: 'seg-hero' })}</div><div class="chips"><span class="chip">${t('درآمد {v1}: {v2}', { v1: esc(jalaliMonthLabel(cursor)), v2: number(result.income) })}</span><span class="chip">${t('خرج: {v1}', { v1: number(result.expense) })}</span></div>${monthRuler(parts, monthLength, info.iso)}</div>
        <div class="hero-side">${budget ? `<a class="budget-meter" href="#/settings/budget">${gauge(budgetRatio)}<div class="meta"><span>${t('بودجهٔ ماه')}</span><span class="${remainingBudget < 0 ? 'negative' : ''}">${remainingBudget >= 0 ? t('{v1} مانده', { v1: number(remainingBudget) }) : t('{v1} بیشتر از سقف', { v1: number(-remainingBudget) })}</span></div>${progressBar(Math.min(1, budgetRatio), { cells: 24, state: budgetRatio > 1 ? 'over' : budgetRatio >= .85 ? 'warn' : '' })}<div class="meta"><span>${t('{v1} از {v2}', { v1: number(result.expense), v2: number(budget) })}</span><span>${dailyCap === null ? '' : t('روزانه {v1}', { v1: number(dailyCap) })}</span></div></a>` : `<a class="button small" href="#/settings/budget">${t('تعیین بودجهٔ ماهانه')}</a>`}</div>
      </div>
      <div class="quick-actions">${quick.map(([kind, label, iconName]) => `<a class="quick-action" href="#/add/${kind}"><span class="round-icon">${icon(iconName)}</span><strong>${label}</strong></a>`).join('')}<a class="quick-action" href="#/receipt"><span class="round-icon">${icon('download')}</span><strong>${t('رسید')}</strong></a></div>
      ${near.length ? `<div class="panel section"><div class="section-head tight"><h2>${t('پرداخت‌ها و دریافت‌های نزدیک')}</h2><div class="actions"><a class="button small" href="#/receipt">${icon('download')} ${t('رسید')}</a><a class="button small" href="#/list/obligations">${t('همه')}</a></div></div><div class="list">${upcomingRows(near.slice(0, 5))}</div></div>` : ''}
      ${activeGoals.length ? `<div class="panel section"><div class="section-head tight"><h2>${t('هدف‌های پس‌انداز')}</h2><a class="button small" href="#/list/goals">${t('همه')}</a></div><div class="category-list">${activeGoals.map(goalRow).join('')}</div></div>` : ''}
      <div class="grid four stats">
        ${stat(t('درآمد ماه'), result.income, 'up', 'positive', cur())}
        ${stat(t('خرج ماه'), result.expense, 'down', 'negative', expenseNote)}
        ${stat(t('مانده ماه'), net, 'wallet', net >= 0 ? 'positive' : 'negative', savingRate === null ? t('درآمد منهای خرج') : t('نرخ پس‌انداز {v1}٪', { v1: number(savingRate) }))}
        ${stat(t('تعهد ۳۰ روز آینده'), payable.reduce((sum, item) => sum + Number(item.amount || 0), 0), 'clock', '', incomingTotal ? t('{v1} هم باید بگیری', { v1: number(incomingTotal) }) : t('{v1} مورد', { v1: number(payable.length), c: payable.length }))}
      </div>
      <div class="grid two split">
        <div class="panel"><h2>${t('روند شش ماهه')} <small class="muted">${t('· روی هر ماه بزن')}</small></h2>${monthBars(months, monthKey)}<div class="legend"><span><i class="dot solid"></i> ${t('درآمد')}</span><span><i class="dot soft"></i> ${t('خرج')}</span></div></div>
        <div class="panel"><h2>${t('خرج روزانه')} <small class="muted">· ${esc(jalaliMonthLabel(cursor))}</small></h2>${dotMonth(rows, parts, monthLength, info.iso)}</div>
      </div>
      <div class="panel section"><div class="section-head tight"><h2>${t('خرج بر اساس دسته')}</h2><a class="button small" href="#/compare">${t('مقایسه با ماه قبل')}</a></div>${categoryRows.length ? `<div class="category-list">${categoryRows.map(([category, value]) => `<button class="category-row" type="button" data-action="filter-category" data-category="${esc(category)}"><span>${esc(catName(category))}</span><span class="category-meter" aria-hidden="true">${ledBar(value / categoryMax, 16, 'g')}</span><strong>${number(value)} <small class="muted">(${number(Math.round(value / result.expense * 100))}${pctSign()})</small></strong></button>`).join('')}</div><div class="sub hint-line">${t('روی هر دسته بزن تا تراکنش‌هایش را ببینی.')}</div>` : empty(t('هنوز داده‌ای نیست'), t('چند خرج ثبت کن تا الگوی هزینه ساخته شود'))}</div>
      ${yearGrid(info.iso)}
      ${notes.length ? `<div class="panel section"><div class="section-head tight"><h2>${t('یادداشت‌ها')}</h2><a class="button small" href="#/list/notes">${t('همه')}</a></div><div class="list">${notes.map(noteRow).join('')}</div></div>` : ''}
      <div class="panel section"><div class="section-head tight"><h2>${t('آخرین تراکنش‌های {v1}', { v1: esc(jalaliMonthLabel(cursor)) })}</h2><a class="button small" href="#/list/transactions">${t('همه')}</a></div>${recent.length ? `<div class="list">${recent.map(transactionRow).join('')}</div>` : empty(t('این ماه تراکنشی نداری'), t('اولین خرج یا درآمدت را اضافه کن'), `<a class="button primary small" href="#/add/expense">${t('ثبت خرج')}</a>`)}</div>`;
    refreshInputs($('#screen'));
  }

  /* ---------- مسیر افزودن ---------- */

  function categoryChips(list, selected) {
    const items = list.includes(selected) || !selected ? list : [selected, ...list];
    return `<div class="chip-grid" role="radiogroup" aria-label="${t('دسته')}">${items.map(category => `<button type="button" class="cat-chip ${category === selected ? 'active' : ''}" role="radio" aria-checked="${category === selected}" data-action="pick-category" data-category="${esc(category)}">${esc(catName(category))}</button>`).join('')}</div>`;
  }

  function submitBar(label, editing, backHref = '#/list') {
    return `<div class="form-actions sticky">${editing ? `<a class="button" href="${backHref}">${t('انصراف')}</a>` : ''}<button class="button primary" type="submit">${esc(label)}</button></div>`;
  }

  function transactionForm(kind, old, preset) {
    const base = old || preset || {};
    const list = kind === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    const category = base.category || (kind === 'income' ? 'حقوق' : 'سایر');
    const frequent = old ? [] : titleSuggestions(kind).slice(0, 6);
    return `<form id="addForm" data-form="transaction" data-kind="${kind}" ${old ? `data-id="${esc(old.id)}"` : ''} novalidate>
      ${moneyField('amount', t('مبلغ ({v1})', { v1: cur() }), base.amount, { autofocus: !old, big: true })}
      <div class="field"><label>${t('دسته')}</label>${categoryChips(list, category)}<input type="hidden" name="category" value="${esc(category)}"></div>
      <div class="field"><label for="f-title">${t('عنوان')} <span class="muted">${t('(اختیاری؛ خالی بماند، نام دسته ثبت می‌شود)')}</span></label><input id="f-title" name="title" list="titleSuggestions" maxlength="80" autocomplete="off" value="${esc(base.title || '')}" placeholder="${kind === 'income' ? t('مثلاً حقوق مهر') : t('مثلاً خرید سوپرمارکت')}"><datalist id="titleSuggestions">${titleSuggestions(kind).map(title => `<option value="${esc(title)}"></option>`).join('')}</datalist>${frequent.length ? `<div class="date-chips quick-titles"><span class="muted">${t('پرتکرار:')}</span>${frequent.map(title => `<button type="button" class="chip-button" data-action="quick-fill" data-title="${esc(title)}">${esc(title)}</button>`).join('')}</div>` : ''}</div>
      ${dateField('date', t('تاریخ'), base.date || localISO())}
      <div class="field"><label for="f-note">${t('یادداشت')} <span class="muted">${t('(اختیاری)')}</span></label><input id="f-note" name="note" maxlength="200" autocomplete="off" value="${esc(base.note || '')}"></div>
      ${old ? '' : `<label class="check"><input type="checkbox" name="repeat"><span>${t('هر ماه تکرار شود')} <small class="muted">${t('(مثلاً اجاره، اینترنت یا حقوق)')}</small></span></label>`}
      ${submitBar(old ? t('ذخیرهٔ تغییرات') : kind === 'income' ? t('ثبت درآمد') : t('ثبت خرج'), Boolean(old))}
    </form>`;
  }

  function installmentForm(old) {
    return `<form id="addForm" data-form="installment" data-kind="installment" ${old ? `data-id="${esc(old.id)}"` : ''} novalidate>
      <div class="field"><label for="f-title">${t('عنوان قسط')}</label><input id="f-title" name="title" maxlength="80" autocomplete="off" data-autofocus value="${esc(old?.title || '')}" placeholder="${t('مثلاً وام موتور')}" required></div>
      <div class="form-grid">${moneyField('amount', t('مبلغ هر قسط ({v1})', { v1: cur() }), old?.amount, { big: true })}<div class="field"><label for="f-count">${t('تعداد کل قسط‌ها')}</label><input id="f-count" name="count" inputmode="numeric" autocomplete="off" value="${localDigits(old?.count || 12)}" required></div></div>
      <div class="form-grid"><div class="field"><label for="f-paid">${t('تا حالا چند قسط پرداخت شده؟')}</label><input id="f-paid" name="paid" inputmode="numeric" autocomplete="off" value="${localDigits(old?.paidCount || 0)}"></div>${dateField('due', t('سررسید قسط بعدی'), old?.nextDueDate || localISO(), { chipSet: 'future' })}</div>
      <div class="hint">${t('با ثبت هر پرداخت، خرجِ قسط خودکار ثبت می‌شود و سررسید یک ماه شمسی جلو می‌رود.')}</div>
      ${submitBar(old ? t('ذخیرهٔ تغییرات') : t('ثبت قسط'), Boolean(old), '#/list/obligations')}
    </form>`;
  }

  function cashLabel(direction) {
    return direction === 'receivable' ? t('این مبلغ را همین حالا به او پرداخت کرده‌ام (از موجودی کم شود)') : t('این مبلغ را همین حالا دریافت کرده‌ام (به موجودی اضافه شود)');
  }

  function debtForm(old) {
    const direction = old?.direction || 'owe';
    return `<form id="addForm" data-form="debt" data-kind="debt" ${old ? `data-id="${esc(old.id)}"` : ''} novalidate>
      <div class="field"><label>${t('نوع')}</label><div class="segment"><label><input type="radio" name="direction" value="owe" ${direction === 'owe' ? 'checked' : ''}><span>${t('من بدهکارم')}</span></label><label><input type="radio" name="direction" value="receivable" ${direction === 'receivable' ? 'checked' : ''}><span>${t('من طلبکارم')}</span></label></div></div>
      <div class="field"><label for="f-title">${t('عنوان')}</label><input id="f-title" name="title" maxlength="80" autocomplete="off" data-autofocus value="${esc(old?.title || '')}" placeholder="${t('مثلاً قرض از علی')}" required></div>
      <div class="form-grid">${moneyField('total', t('مبلغ کل ({v1})', { v1: cur() }), old?.total, { big: true })}${moneyField('remaining', t('باقی‌مانده'), old ? old.remaining : '', { required: false, placeholder: t('برابر مبلغ کل') })}</div>
      <div class="form-grid"><div class="field"><label for="f-person">${t('طرف حساب')}</label><input id="f-person" name="person" maxlength="60" autocomplete="off" value="${esc(old?.person || '')}"></div>${dateField('due', t('سررسید (اختیاری)'), old?.dueDate || '', { chipSet: 'future', optional: true, placeholder: t('مثلاً {v1}', { v1: jalaliInput(localISO()) }) })}</div>
      ${old ? '' : `<label class="check"><input type="checkbox" name="cash" checked><span id="cashLabel">${cashLabel(direction)}</span></label>`}
      ${submitBar(old ? t('ذخیرهٔ تغییرات') : t('ثبت'), Boolean(old), '#/list/obligations')}
    </form>`;
  }

  function noteForm(old) {
    return `<form id="addForm" data-form="note" data-kind="note" ${old ? `data-id="${esc(old.id)}"` : ''} novalidate>
      <div class="field"><label for="f-text">${t('یادداشت')}</label><textarea id="f-text" name="text" rows="5" maxlength="20000" data-autofocus required placeholder="${t('مثلاً: قبض برق را تا آخر هفته بپرداز')}">${esc(old?.text || '')}</textarea></div>
      <div class="voice-panel"><div class="voice-controls"><button class="button voice-button" type="button" data-action="note-record">${icon('mic')} ${t('ضبط ویس')}</button><button class="button" type="button" data-action="note-transcribe">${icon('note')} ${t('تبدیل گفتار به متن')}</button><button class="button small" type="button" data-action="mic-test">${icon('mic')} ${t('تست میکروفون')}</button></div><span id="voiceStatus" role="status" aria-live="polite">${old?.voice ? t('فایل صوتی به یادداشت وصل است') : t('برای تبدیل جداگانه، دکمهٔ تبدیل گفتار به متن را بزن')}</span><div id="micHelp" class="mic-help" role="alert" hidden></div><audio id="voiceDraftPlayer" controls hidden></audio></div>
      ${dateField('date', t('یادآوری در تاریخ (اختیاری)'), old?.date || '', { chipSet: 'future', optional: true, placeholder: t('مثلاً {v1}', { v1: jalaliInput(localISO()) }) })}
      <label class="check"><input type="checkbox" name="pinned" ${old?.pinned ? 'checked' : ''}><span>${t('سنجاق شود')} <small class="muted">${t('(در صفحهٔ خانه بالا بماند)')}</small></span></label>
      ${submitBar(old ? t('ذخیرهٔ تغییرات') : t('ثبت یادداشت'), Boolean(old), '#/list/notes')}
    </form>`;
  }

  /* گفتار فارسی Voice v49 + نگهداری فایل خام برای رسید یادداشت. */
  const SpeechEngine = window.SpeechRecognition || window.webkitSpeechRecognition;
  const VOICE_ERRORS = { 'not-allowed': 'دسترسی میکروفون بسته است', 'service-not-allowed': 'دسترسی تشخیص گفتار بسته است', 'audio-capture': 'تشخیص گفتار به میکروفون وصل نشد؛ دوباره تلاش می‌کنم', network: 'تبدیل گفتار به اینترنت نیاز دارد', 'no-speech': 'گفتاری شنیده نشد', 'language-not-supported': 'تشخیص فارسی در این مرورگر پشتیبانی نمی‌شود' };
  const voiceDraft = { recorder: null, recognition: null, stream: null, blob: null, speechTimer: 0, speechPromise: null, speechResolve: null, url: '', stopping: false, base: '', committed: '', retries: 0, textActive: false, textBase: '', textCommitted: '' };
  let voicePlayerUrl = '';
  function voiceDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('orbit-note-audio', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('clips');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  async function voiceStore(mode, action) {
    const db = await voiceDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('clips', mode);
      const request = action(transaction.objectStore('clips'));
      transaction.oncomplete = () => { const result = request.result; db.close(); resolve(result); };
      transaction.onerror = transaction.onabort = () => { db.close(); reject(transaction.error); };
    });
  }
  const voicePut = (id, blob) => voiceStore('readwrite', store => store.put(blob, id));
  const voiceGet = id => voiceStore('readonly', store => store.get(id));
  const voiceDelete = id => voiceStore('readwrite', store => store.delete(id));
  const voiceClear = () => voiceStore('readwrite', store => store.clear());
  function voiceReset() {
    clearTimeout(voiceDraft.speechTimer);
    voiceDraft.stopping = true;
    voiceDraft.textActive = false;
    voiceDraft.speechResolve?.();
    if (voiceDraft.recorder?.state === 'recording') voiceDraft.recorder.stop();
    try { voiceDraft.recognition?.abort(); } catch { /* ignore */ }
    voiceDraft.stream?.getTracks().forEach(track => track.stop());
    if (voiceDraft.url) URL.revokeObjectURL(voiceDraft.url);
    Object.assign(voiceDraft, { recorder: null, recognition: null, stream: null, blob: null, speechTimer: 0, speechPromise: null, speechResolve: null, url: '', stopping: false, base: '', committed: '', retries: 0, textActive: false, textBase: '', textCommitted: '' });
  }
  function voiceStatus(message) { const node = $('#voiceStatus'); if (node) node.textContent = t(message); }
  let voiceMicTesting = false;
  function voiceMicProblem(error) {
    const name = error?.name || 'UnknownError';
    const secure = window.isSecureContext || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    const ios = /iPhone|iPad|iPod/.test(navigator.userAgent || '');
    const problem = !secure ? 'این صفحه باید با HTTPS باز شود تا میکروفون کار کند.'
      : name === 'service-not-allowed' ? 'مرورگر اجازهٔ استفاده از سرویس تشخیص گفتار را نمی‌دهد؛ تست میکروفون را جداگانه انجام بده.'
      : ['NotAllowedError', 'PermissionDeniedError', 'SecurityError', 'not-allowed'].includes(name) ? 'اجازهٔ میکروفون برای این برنامه بسته است.'
      : ['NotFoundError', 'DevicesNotFoundError'].includes(name) ? 'میکروفونی روی دستگاه پیدا نشد.'
      : ['NotReadableError', 'TrackStartError', 'AbortError', 'audio-capture'].includes(name) ? 'میکروفون در اختیار برنامهٔ دیگری است یا مرورگر نمی‌تواند آن را باز کند.'
      : 'درخواست میکروفون انجام نشد.';
    const guide = ios
      ? 'در آیفون: Settings → Safari (یا Apps → Safari) → Microphone را روی Ask یا Allow بگذار. در خود Safari نیز تنظیمات همین سایت → Microphone را Allow کن. اگر وب‌اپ را روی صفحهٔ اصلی نصب کرده‌ای، Settings → Privacy & Security → Microphone را هم بررسی کن.'
      : 'در مرورگر، روی آیکون کنار آدرس سایت بزن و Microphone را Allow کن. اگر میکروفون در برنامهٔ دیگری باز است، آن را ببند و دوباره تست کن.';
    voiceStatus(problem);
    const help = $('#micHelp');
    if (help) { help.hidden = false; help.textContent = `${problem} ${guide} [${name}]`; }
    console.warn('ORBIT microphone:', name, error?.message || '');
  }
  async function voiceMicTest() {
    if (voiceDraft.recorder?.state === 'recording' || voiceDraft.textActive || voiceDraft.recognition) return voiceStatus('اول ضبط یا تبدیل را پایان بده، سپس میکروفون را تست کن');
    if (voiceMicTesting) return;
    const help = $('#micHelp');
    if (help) help.hidden = true;
    if (!window.isSecureContext && !['localhost', '127.0.0.1'].includes(location.hostname)) return voiceMicProblem({ name: 'InsecureContext' });
    if (!navigator.mediaDevices?.getUserMedia) return voiceMicProblem({ name: 'UnsupportedBrowser' });
    voiceMicTesting = true;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const track = stream.getAudioTracks()[0];
      const live = track?.readyState === 'live';
      stream.getTracks().forEach(item => item.stop());
      if (!live) return voiceMicProblem({ name: 'NotReadableError' });
      voiceStatus('میکروفون فعال است. حالا ضبط یا تبدیل گفتار را بزن.');
    } catch (error) { voiceMicProblem(error); }
    finally { voiceMicTesting = false; }
  }
  function voiceStop() {
    clearTimeout(voiceDraft.speechTimer);
    voiceDraft.stopping = true;
    try { voiceDraft.recognition?.stop(); } catch { /* ignore */ }
    if (voiceDraft.recorder?.state === 'recording') voiceDraft.recorder.stop();
  }
  function voiceStartSpeech(recorder) {
    if (!SpeechEngine || voiceDraft.recorder !== recorder || voiceDraft.stopping || recorder.state !== 'recording') return;
    const recognition = new SpeechEngine();
    recognition.lang = 'fa-IR'; recognition.interimResults = true; recognition.continuous = true; recognition.maxAlternatives = 1;
    voiceDraft.speechPromise = new Promise(resolve => { voiceDraft.speechResolve = resolve; });
    let segment = '', error = '';
    const field = $('#f-text');
    recognition.onresult = event => {
      if (voiceDraft.recorder !== recorder) return;
      segment = '';
      for (let i = 0; i < event.results.length; i++) segment += event.results[i][0].transcript;
      if (field && segment.trim()) {
        field.value = [voiceDraft.base, voiceDraft.committed, segment.trim()].filter(Boolean).join('\n').slice(0, 20000);
        captureDraft(field);
        voiceDraft.retries = 0;
      }
    };
    recognition.onerror = event => {
      if (voiceDraft.recorder !== recorder || voiceDraft.stopping) return;
      error = event.error || 'error';
      if (['not-allowed', 'service-not-allowed', 'audio-capture'].includes(error)) voiceMicProblem({ name: error });
      else voiceStatus(VOICE_ERRORS[error] || 'تبدیل گفتار انجام نشد؛ صدا همچنان ضبط می‌شود');
    };
    recognition.onend = () => {
      if (voiceDraft.recorder !== recorder || voiceDraft.recognition !== recognition) return;
      if (segment.trim()) voiceDraft.committed = [voiceDraft.committed, segment.trim()].filter(Boolean).join('\n');
      voiceDraft.speechResolve?.(); voiceDraft.speechResolve = null;
      voiceDraft.recognition = null;
      if (voiceDraft.stopping || recorder.state !== 'recording') return;
      if (['not-allowed', 'service-not-allowed', 'language-not-supported'].includes(error)) return;
      const delay = error && error !== 'no-speech' ? Math.min(5000, 800 * 2 ** Math.min(++voiceDraft.retries, 3)) : 300;
      voiceDraft.speechTimer = setTimeout(() => voiceStartSpeech(recorder), delay);
    };
    voiceDraft.recognition = recognition;
    try { recognition.start(voiceDraft.stream?.getAudioTracks?.()[0]); }
    catch (cause) {
      voiceDraft.speechResolve?.(); voiceDraft.speechResolve = null;
      voiceDraft.recognition = null;
      voiceDraft.speechTimer = setTimeout(() => voiceStartSpeech(recorder), Math.min(5000, 800 * 2 ** Math.min(++voiceDraft.retries, 3)));
    }
  }
  function voiceTextButton(active) {
    const button = $('[data-action="note-transcribe"]');
    if (button) { button.innerHTML = `${icon('note')} ${t(active ? 'پایان تبدیل' : 'تبدیل گفتار به متن')}`; button.classList.toggle('recording', active); }
  }
  function voiceStopText() {
    voiceDraft.textActive = false;
    clearTimeout(voiceDraft.speechTimer);
    try { voiceDraft.recognition?.stop(); } catch { /* ignore */ }
    voiceTextButton(false);
    voiceStatus('تبدیل متوقف شد؛ متن را بررسی کن');
  }
  function voiceStartTextSegment() {
    if (!voiceDraft.textActive || !SpeechEngine) return;
    const recognition = new SpeechEngine();
    recognition.lang = 'fa-IR'; recognition.interimResults = true; recognition.continuous = true; recognition.maxAlternatives = 1;
    const field = $('#f-text'); let segment = '', error = '';
    voiceDraft.speechPromise = new Promise(resolve => { voiceDraft.speechResolve = resolve; });
    voiceDraft.recognition = recognition;
    recognition.onresult = event => {
      if (voiceDraft.recognition !== recognition) return;
      segment = '';
      for (let i = 0; i < event.results.length; i++) segment += event.results[i][0].transcript;
      if (field && segment.trim()) {
        field.value = [voiceDraft.textBase, voiceDraft.textCommitted, segment.trim()].filter(Boolean).join('\n').slice(0, 20000);
        captureDraft(field); voiceDraft.retries = 0;
        voiceStatus('در حال تبدیل گفتار… برای پایان دکمه را بزن');
      }
    };
    recognition.onerror = event => {
      if (voiceDraft.recognition !== recognition || !voiceDraft.textActive) return;
      error = event.error || 'error';
      if (['not-allowed', 'service-not-allowed', 'audio-capture'].includes(error)) voiceMicProblem({ name: error });
      else voiceStatus(VOICE_ERRORS[error] || 'اتصال تشخیص گفتار قطع شد؛ دوباره تلاش می‌کنم');
    };
    recognition.onend = () => {
      if (voiceDraft.recognition !== recognition) return;
      if (segment.trim()) voiceDraft.textCommitted = [voiceDraft.textCommitted, segment.trim()].filter(Boolean).join('\n');
      voiceDraft.recognition = null; voiceDraft.speechResolve?.(); voiceDraft.speechResolve = null;
      if (!voiceDraft.textActive) return;
      if (['not-allowed', 'service-not-allowed', 'language-not-supported'].includes(error)) { voiceDraft.textActive = false; voiceTextButton(false); return; }
      const delay = error && error !== 'no-speech' ? Math.min(5000, 800 * 2 ** Math.min(++voiceDraft.retries, 3)) : 300;
      voiceDraft.speechTimer = setTimeout(voiceStartTextSegment, delay);
    };
    try { recognition.start(); voiceStatus('در حال شنیدن گفتار فارسی… برای پایان دکمه را بزن'); }
    catch {
      voiceDraft.recognition = null; voiceDraft.speechResolve?.(); voiceDraft.speechResolve = null;
      voiceStatus('تشخیص گفتار شروع نشد؛ دوباره تلاش می‌کنم');
      voiceDraft.speechTimer = setTimeout(voiceStartTextSegment, Math.min(5000, 800 * 2 ** Math.min(++voiceDraft.retries, 3)));
    }
  }
  function voiceTranscribeOnly() {
    if (voiceDraft.textActive) return voiceStopText();
    if (!SpeechEngine) return voiceStatus('این مرورگر تشخیص گفتار را پشتیبانی نمی‌کند');
    if (voiceDraft.recorder?.state === 'recording') return voiceStatus('اول ضبط ویس را تمام کن، سپس تبدیل گفتار را بزن');
    if (voiceDraft.recognition) return voiceStatus('در حال تکمیل تشخیص قبلی… دوباره بزن');
    voiceDraft.textActive = true;
    voiceDraft.textBase = $('#f-text')?.value.trim() || '';
    voiceDraft.textCommitted = ''; voiceDraft.retries = 0;
    voiceTextButton(true);
    voiceStartTextSegment();
  }
  async function voiceToggle() {
    if (voiceDraft.recorder?.state === 'recording') return voiceStop();
    if (voiceDraft.textActive) voiceStopText();
    if (!navigator.mediaDevices?.getUserMedia) return voiceMicProblem({ name: window.isSecureContext ? 'UnsupportedBrowser' : 'InsecureContext' });
    if (!window.MediaRecorder) return toast(t('این مرورگر ضبط صدا را پشتیبانی نمی‌کند'));
    if (voiceDraft.blob && !await askConfirm({ title: t('ضبط دوباره'), message: t('صدای ضبط‌شدهٔ فعلی جایگزین شود؟'), okLabel: t('ضبط دوباره') })) return;
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!$('#addForm[data-kind="note"]')) { stream.getTracks().forEach(track => track.stop()); return; }
      voiceReset();
      const recorder = new MediaRecorder(stream);
      const chunks = [];
      voiceDraft.stream = stream; voiceDraft.recorder = recorder;
      voiceDraft.base = $('#f-text')?.value.trim() || '';
      recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
      recorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
        voiceDraft.stream = null;
        if (voiceDraft.recorder !== recorder) return;
        const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
        if (!blob.size) return voiceStatus('فایل صوتی ضبط نشد');
        voiceDraft.blob = blob;
        voiceDraft.url = URL.createObjectURL(blob);
        const player = $('#voiceDraftPlayer');
        if (player) { player.src = voiceDraft.url; player.hidden = false; }
        const button = $('[data-action="note-record"]');
        if (button) { button.innerHTML = `${icon('mic')} ${t('ضبط دوباره')}`; button.classList.remove('recording'); }
        voiceStatus('صدا آماده است؛ اگر متن ظاهر نشد، دکمهٔ تبدیل گفتار به متن را بزن');
      };
      recorder.start();
      const button = $('[data-action="note-record"]');
      if (button) { button.innerHTML = `${icon('mic')} ${t('پایان ضبط')}`; button.classList.add('recording'); }
      voiceStatus('در حال ضبط و تبدیل گفتار…');
      if (SpeechEngine) voiceStartSpeech(recorder);
      else voiceStatus('ضبط صدا فعال است؛ متن را دستی بنویس');
      const help = $('#micHelp');
      if (help) help.hidden = true;
    } catch (error) { stream?.getTracks().forEach(track => track.stop()); voiceMicProblem(error); }
  }
  async function voiceLoadPlayer(id, selector) {
    try {
      const blob = await voiceGet(id);
      const player = $(selector);
      if (!player || !blob || !route.parts.includes(id)) return;
      if (voicePlayerUrl) URL.revokeObjectURL(voicePlayerUrl);
      voicePlayerUrl = URL.createObjectURL(blob);
      player.src = voicePlayerUrl; player.hidden = false;
    } catch { voiceStatus('خواندن فایل صوتی انجام نشد'); }
  }

  function findForKind(kind, id) {
    if (kind === 'expense' || kind === 'income') { const item = state.transactions.find(value => value.id === id); return item && item.type === kind ? item : null; }
    const store = { installment: state.installments, debt: state.debts, goal: state.goals, note: state.notes }[kind];
    return store?.find(value => value.id === id) || null;
  }

  function renderAdd() {
    const kind = ADD_KINDS.some(item => item[0] === route.parts[0]) ? route.parts[0] : ui.lastKind;
    const id = route.parts[1] || '';
    const old = id ? findForKind(kind, id) : null;
    if (id && !old) { toast(t('این مورد پیدا نشد')); location.hash = '/list'; return; }
    ui.lastKind = kind;
    const preset = !old && ui.preset?.kind === kind ? ui.preset.data : null;
    if (preset) delete drafts[kind];
    ui.preset = null;
    const picker = old ? '' : `<nav class="kind-picker" aria-label="${t('نوع ثبت')}">${ADD_KINDS.map(([value, label, iconName]) => `<a class="kind ${value === kind ? 'active' : ''}" href="#/add/${value}" ${value === kind ? 'aria-current="page"' : ''}>${icon(iconName)}<span>${t(label)}</span></a>`).join('')}</nav>`;
    const form = { expense: () => transactionForm('expense', old, preset), income: () => transactionForm('income', old, preset), installment: () => installmentForm(old), debt: () => debtForm(old), goal: () => goalForm(old), note: () => noteForm(old) }[kind]();
    const recent = old ? '' : recentEntries();
    $('#screen').innerHTML = `${pageHead(old ? t('ویرایش') : t('ثبت سریع'), old ? t('ویرایش {v1}', { v1: t(KIND_TITLE[kind]) }) : t('افزودن'))}${picker}<div class="panel add-panel">${form}</div>${recent}`;
    const formElement = $('#addForm');
    if (!old && !preset) restoreDraft(formElement, kind);
    refreshInputs($('#screen'));
    if (kind === 'note' && voiceDraft.textActive) voiceTextButton(true);
    if (kind === 'note' && old?.voice) voiceLoadPlayer(old.id, '#voiceDraftPlayer');
    if (!document.activeElement || document.activeElement === document.body || !document.activeElement.closest('#screen, #confirmModal')) $('#screen [data-autofocus]')?.focus({ preventScroll: true });
  }

  function recentEntries() {
    const rows = [...state.transactions].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))).slice(0, 4);
    if (!rows.length) return '';
    return `<div class="panel section"><div class="section-head tight"><h2>${t('آخرین ثبت‌ها')}</h2><a class="button small" href="#/list/transactions">${t('همه')}</a></div><div class="list">${rows.map(transactionRow).join('')}</div></div>`;
  }

  function captureDraft(target) {
    const form = target.form;
    if (!form || form.id !== 'addForm' || form.dataset.id || !target.name) return;
    (drafts[form.dataset.kind] ||= {})[target.name] = target.type === 'checkbox' ? target.checked : target.value;
  }

  function restoreDraft(form, kind) {
    const draft = drafts[kind];
    if (!form || !draft) return;
    Object.entries(draft).forEach(([name, value]) => {
      const element = form.elements[name];
      if (!element) return;
      if (element.type === 'checkbox') element.checked = Boolean(value);
      else element.value = value;
    });
    const chosen = form.elements.category?.value;
    form.querySelectorAll('.cat-chip').forEach(chip => {
      const active = chip.dataset.category === chosen;
      chip.classList.toggle('active', active);
      chip.setAttribute('aria-checked', String(active));
    });
    const label = $('#cashLabel');
    if (label && form.elements.direction) label.textContent = cashLabel(form.elements.direction.value);
  }

  function titleSuggestions(kind) {
    const seen = new Map();
    state.transactions.filter(item => item.type === kind && !item.source && item.title).forEach(item => {
      const entry = seen.get(displayText(item.title)) || { count: 0, last: '' };
      entry.count += 1;
      if (item.date >= entry.last) entry.last = item.date;
      seen.set(displayText(item.title), entry);
    });
    return [...seen].sort((a, b) => b[1].count - a[1].count || b[1].last.localeCompare(a[1].last)).slice(0, 30).map(([title]) => title);
  }

  /** با انتخاب عنوانی که قبلاً ثبت شده، دسته و مبلغ آخرین بار را پیشنهاد می‌دهد. */
  function suggestFromTitle(input) {
    const form = input.form;
    if (!form || form.id !== 'addForm' || form.dataset.form !== 'transaction') return;
    const kind = form.dataset.kind;
    const match = sortTransactions(state.transactions.filter(item => item.type === kind && !item.source && (item.title === input.value.trim() || displayText(item.title) === input.value.trim())))[0];
    if (!match) return;
    if (!form.dataset.categoryTouched) setCategory(form, match.category);
    const amount = form.elements.amount;
    if (!amount.value.trim()) { amount.value = localMoney(match.amount); formatMoneyField(amount); captureDraft(amount); }
  }

  function setCategory(form, category) {
    const hidden = form.elements.category;
    const chips = [...form.querySelectorAll('.cat-chip')];
    if (!chips.some(chip => chip.dataset.category === category)) {
      form.querySelector('.chip-grid')?.insertAdjacentHTML('afterbegin', `<button type="button" class="cat-chip" role="radio" aria-checked="false" data-action="pick-category" data-category="${esc(category)}">${esc(catName(category))}</button>`);
    }
    hidden.value = category;
    form.querySelectorAll('.cat-chip').forEach(chip => {
      const active = chip.dataset.category === category;
      chip.classList.toggle('active', active);
      chip.setAttribute('aria-checked', String(active));
    });
    captureDraft(hidden);
  }

  /* ---------- فرم‌ها: ثبت ---------- */

  function amountError(value, label = t('مبلغ')) {
    if (value === null) return t('{label} را فقط با عدد صحیح وارد کن (حداکثر ۱۰ تریلیون)', { label });
    if (value <= 0) return t('{label} باید بیشتر از صفر باشد', { label });
    return '';
  }

  function withUndo(message, change) {
    const snapshot = clone(state);
    commit(change);
    const token = revision;
    toast(message, {
      label: t('بازگردانی'),
      run() {
        if (revision !== token) { toast(t('بعد از این تغییر، کار دیگری ثبت شده و بازگردانی ممکن نیست')); return; }
        try { saveState(snapshot); state = snapshot; revision += 1; render(); toast(t('بازگردانی شد')); } catch { toast(t('بازگردانی انجام نشد')); }
      }
    });
  }

  function finishAdd(kind, old, message, listPath) {
    delete drafts[kind];
    if (old) { location.hash = listPath; toast(message); return; }
    render();
    toast(message);
    setTimeout(() => $('#screen [data-autofocus]')?.focus({ preventScroll: true }), 30);
  }

  const FORM_HANDLERS = {
    transaction(form, data) {
      const kind = form.dataset.kind;
      const old = form.dataset.id ? state.transactions.find(item => item.id === form.dataset.id) : null;
      const value = parseMoney(data.get('amount'));
      const iso = parseJalaliDate(data.get('date'));
      const category = cleanText(data.get('category'), 30, kind === 'income' ? 'حقوق' : 'سایر');
      const title = cleanText(data.get('title'), 80) || category;
      const problem = amountError(value);
      if (problem) return toast(problem);
      if (!iso) return toast(t('تاریخ معتبر نیست؛ نمونه: {v1}', { v1: jalaliInput(localISO()) }));
      const transaction = {
        id: old?.id || cleanId(uid()), type: kind, amount: value, title, category, date: iso, note: cleanText(data.get('note'), 200),
        source: old?.source || null, counted: old ? old.counted !== false : true, createdAt: old?.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString()
      };
      const repeat = !old && data.get('repeat') === 'on';
      const message = old ? t('تغییرات ذخیره شد') : t('{v1} ثبت شد{v2}', { v1: kind === 'income' ? t('درآمد') : t('خرج'), v2: repeat ? t('؛ از ماه بعد خودکار ثبت می‌شود') : '' });
      const change = draft => {
        const index = draft.transactions.findIndex(item => item.id === transaction.id);
        if (index >= 0) draft.transactions[index] = transaction; else draft.transactions.push(transaction);
        if (repeat) {
          const parts = jalaliParts(iso);
          const key = monthKeyOf(parts.jy, parts.jm);
          draft.recurring.push({ id: cleanId(uid()), type: kind, amount: value, day: parts.jd, title, category, startMonth: nextMonthKey(key), doneMonths: [key] });
        }
      };
      if (old) commit(change); else withUndo(message, change);
      delete drafts[kind];
      if (old) { location.hash = '/list'; toast(message); } else { render(); $('#screen [data-autofocus]')?.focus({ preventScroll: true }); }
    },

    installment(form, data) {
      const old = form.dataset.id ? state.installments.find(item => item.id === form.dataset.id) : null;
      const title = cleanText(data.get('title'), 80);
      const amount = parseMoney(data.get('amount'));
      const count = parseMoney(data.get('count'));
      const paidText = String(data.get('paid') || '').trim();
      const paid = paidText ? parseMoney(paidText) : 0;
      const due = parseJalaliDate(data.get('due'));
      if (!title) return toast(t('عنوان قسط را وارد کن'));
      const problem = amountError(amount, t('مبلغ قسط'));
      if (problem) return toast(problem);
      if (!count || count < 1 || count > 600) return toast(t('تعداد قسط‌ها باید بین ۱ تا ۶۰۰ باشد'));
      if (paid === null || paid < 0 || paid > count) return toast(t('تعداد پرداخت‌شده باید بین صفر و تعداد کل باشد'));
      if (!due) return toast(t('سررسید شمسی معتبر نیست'));
      const item = { id: old?.id || cleanId(uid()), title, amount, count, paidCount: paid, nextDueDate: due, dueDay: jalaliParts(due).jd, status: paid >= count ? 'done' : 'active', createdAt: old?.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() };
      commit(draft => { const index = draft.installments.findIndex(value => value.id === item.id); if (index >= 0) draft.installments[index] = item; else draft.installments.push(item); });
      delete drafts.installment;
      location.hash = '/list/obligations';
      toast(old ? t('قسط ویرایش شد') : t('قسط ثبت شد'));
    },

    debt(form, data) {
      const old = form.dataset.id ? state.debts.find(item => item.id === form.dataset.id) : null;
      const title = cleanText(data.get('title'), 80);
      const total = parseMoney(data.get('total'));
      const remainingText = String(data.get('remaining') || '').trim();
      const remainingValue = remainingText ? parseMoney(remainingText) : total;
      const dueText = String(data.get('due') || '').trim();
      const due = dueText ? parseJalaliDate(dueText) : '';
      if (!title) return toast(t('عنوان را وارد کن'));
      const problem = amountError(total, t('مبلغ کل'));
      if (problem) return toast(problem);
      if (remainingValue === null || remainingValue < 0) return toast(t('باقی‌مانده را درست وارد کن (صفر هم قبول است)'));
      if (dueText && !due) return toast(t('سررسید شمسی معتبر نیست'));
      const remaining = Math.min(total, remainingValue);
      const direction = data.get('direction') === 'receivable' ? 'receivable' : 'owe';
      const item = { id: old?.id || cleanId(uid()), direction, title, total, remaining, person: cleanText(data.get('person'), 60), dueDate: due, status: remaining <= 0 ? 'done' : 'active', createdAt: old?.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() };
      const recordCash = !old && data.get('cash') === 'on';
      commit(draft => {
        const index = draft.debts.findIndex(value => value.id === item.id);
        if (index >= 0) draft.debts[index] = item; else draft.debts.push(item);
        if (recordCash) {
          draft.transactions.push({
            id: cleanId(uid()), type: direction === 'owe' ? 'income' : 'expense', amount: total, date: localISO(), counted: false, category: fa('بدهی'),
            title: fa(`${direction === 'owe' ? 'دریافت' : 'قرض دادم'}: ${title}`), note: item.person, source: { kind: 'debt-open', id: item.id }, createdAt: new Date().toISOString()
          });
        }
      });
      delete drafts.debt;
      location.hash = '/list/obligations';
      toast(old ? t('مورد ویرایش شد') : recordCash ? t('ثبت شد و در موجودی اعمال شد') : t('بدهی یا طلب ثبت شد'));
    },

    async note(form, data) {
      if (voiceDraft.recorder?.state === 'recording') return toast(t('اول ضبط را تمام کن'));
      if (voiceDraft.textActive) return toast(t('اول تبدیل گفتار را پایان بده'));
      if (voiceDraft.recognition && voiceDraft.speechPromise) await Promise.race([voiceDraft.speechPromise, new Promise(resolve => setTimeout(resolve, 1500))]);
      data.set('text', form.elements.text.value);
      const old = form.dataset.id ? state.notes.find(item => item.id === form.dataset.id) : null;
      const text = cleanMultiline(data.get('text'), 20000);
      const dateText = String(data.get('date') || '').trim();
      const date = dateText ? parseJalaliDate(dateText) : '';
      if (!text) return toast(t('متن یادداشت را بنویس'));
      if (dateText && !date) return toast(t('تاریخ یادآوری معتبر نیست'));
      const note = { id: old?.id || cleanId(uid()), text, date, done: old?.done || false, pinned: data.get('pinned') === 'on', voice: Boolean(voiceDraft.blob || old?.voice), createdAt: old?.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() };
      if (voiceDraft.blob) await voicePut(note.id, voiceDraft.blob);
      commit(draft => { const index = draft.notes.findIndex(value => value.id === note.id); if (index >= 0) draft.notes[index] = note; else draft.notes.push(note); });
      voiceReset();
      delete drafts.note;
      location.hash = `/note-receipt/${note.id}`;
      toast(old ? t('یادداشت ذخیره شد') : t('یادداشت ثبت شد'));
    },

    pay(form, data) {
      const kind = form.dataset.kind;
      const id = form.dataset.id;
      const amount = parseMoney(data.get('amount'));
      const date = parseJalaliDate(data.get('date'));
      const problem = amountError(amount, t('مبلغ'));
      if (problem) return toast(problem);
      if (!date) return toast(t('تاریخ شمسی معتبر نیست'));
      if (kind === 'debt') {
        const debt = state.debts.find(item => item.id === id);
        if (debt && amount > Number(debt.remaining)) return toast(t('مبلغ نمی‌تواند از مانده بیشتر باشد'));
        commit(draft => payDebtDraft(draft, id, { amount, date }));
      } else {
        commit(draft => payInstallmentDraft(draft, id, { amount, date }));
      }
      ui.paying = '';
      render();
      toast(kind === 'debt' ? t('ثبت شد و در موجودی اعمال شد') : t('پرداخت ثبت شد و خرج آن هم اضافه شد'));
    },

    settings(form, data) {
      const typedCurrency = cleanText(String(data.get('currency') || '').replace(/[<>"'&]/g, ''), 20, 'تومان');
      const currency = isEn() ? currencyKey(typedCurrency) : typedCurrency;
      const startText = String(data.get('startingBalance') || '').trim();
      const budgetText = String(data.get('monthlyBudget') || '').trim();
      const startingBalance = startText ? parseMoney(startText, { signed: true }) : 0;
      const monthlyBudget = budgetText ? parseMoney(budgetText) : 0;
      if (startingBalance === null) return toast(t('موجودی شروع معتبر نیست'));
      if (monthlyBudget === null || monthlyBudget < 0) return toast(t('بودجهٔ ماهانه معتبر نیست'));
      commit(draft => { draft.settings.currency = currency; draft.settings.startingBalance = startingBalance; draft.settings.monthlyBudget = monthlyBudget; });
      render();
      toast(t('تنظیمات ذخیره شد'));
    },

    budget(form, data) {
      const monthKey = jalaliMonthKey(localISO());
      const entries = BUDGET_CATEGORIES.map((category, index) => {
        const text = String(data.get(`cat_${index}`) || '').trim();
        return { category, text, value: text ? parseMoney(text) : 0 };
      });
      if (entries.some(item => item.text && (item.value === null || item.value <= 0))) return toast(t('یکی از مبلغ‌های بودجه معتبر نیست'));
      commit(draft => {
        draft.budgets = draft.budgets.filter(item => item.month !== monthKey);
        const filled = entries.filter(item => item.value);
        if (filled.length) filled.forEach(item => draft.budgets.push({ id: cleanId(uid()), month: monthKey, category: item.category, amount: item.value }));
        else draft.budgets.push({ id: cleanId(uid()), month: monthKey, category: '*', amount: 0 });
      });
      render();
      toast(t('بودجه ذخیره شد'));
    },

    goal(form, data) {
      const old = form.dataset.id ? state.goals.find(item => item.id === form.dataset.id) : null;
      const title = cleanText(data.get('title'), 80);
      const target = parseMoney(data.get('target'));
      const savedText = String(data.get('saved') || '').trim();
      const saved = savedText ? parseMoney(savedText) : 0;
      const dueText = String(data.get('due') || '').trim();
      const due = dueText ? parseJalaliDate(dueText) : '';
      if (!title) return toast(t('عنوان را وارد کن'));
      const problem = amountError(target, t('مبلغ هدف'));
      if (problem) return toast(problem);
      if (saved === null || saved < 0) return toast(t('مبلغ پس‌انداز را درست وارد کن (صفر هم قبول است)'));
      if (dueText && !due) return toast(t('تاریخ معتبر نیست'));
      const item = { id: old?.id || cleanId(uid()), title, target, saved: Math.min(MAX_AMOUNT, saved), dueDate: due, createdAt: old?.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() };
      commit(draft => { const index = draft.goals.findIndex(value => value.id === item.id); if (index >= 0) draft.goals[index] = item; else draft.goals.push(item); });
      delete drafts.goal;
      location.hash = '/list/goals';
      toast(old ? t('هدف ویرایش شد') : t('هدف ثبت شد'));
    },

    'goal-pay'(form, data) {
      const item = state.goals.find(value => value.id === form.dataset.id);
      const amount = parseMoney(data.get('amount'));
      if (!item) return toast(t('این مورد پیدا نشد'));
      const problem = amountError(amount);
      if (problem) return toast(problem);
      commit(draft => { const goal = draft.goals.find(value => value.id === item.id); if (goal) { goal.saved = Math.min(MAX_AMOUNT, (Number(goal.saved) || 0) + amount); goal.updatedAt = new Date().toISOString(); } });
      ui.paying = '';
      render();
      toast(goalInfo(state.goals.find(value => value.id === item.id) || item).done ? t('تبریک؛ هدف کامل شد') : t('به هدف اضافه شد'));
    },

    recurring(form, data) {
      const old = form.dataset.id ? state.recurring.find(item => item.id === form.dataset.id) : null;
      const title = cleanText(data.get('title'), 80);
      const amount = parseMoney(data.get('amount'));
      const [type, ...categoryParts] = String(data.get('kind')).split(':');
      const day = Number(data.get('day'));
      const problem = amountError(amount);
      if (!title) return toast(t('عنوان را وارد کن'));
      if (problem) return toast(problem);
      if (!['income', 'expense'].includes(type) || !(day >= 1 && day <= 31)) return toast(t('نوع یا روز معتبر نیست'));
      const category = categoryParts.join(':');
      const today = jalaliParts(localISO());
      const currentKey = monthKeyOf(today.jy, today.jm);
      commit(draft => {
        if (old) {
          const rule = draft.recurring.find(item => item.id === old.id);
          if (rule) Object.assign(rule, { title, amount, type, category, day });
        } else {
          draft.recurring.push({ id: cleanId(uid()), title, amount, type, category, day, startMonth: day >= today.jd ? currentKey : nextMonthKey(currentKey), doneMonths: [] });
        }
      });
      ui.recurring = '';
      runRecurring(true);
      render();
      toast(old ? t('ذخیره شد') : t('ذخیره شد؛ هر ماه خودکار ثبت می‌شود'));
    }
  };

  /* ---------- هدف پس‌انداز ---------- */

  function goalInfo(item) {
    const target = Math.max(1, Number(item.target) || 1), saved = Math.max(0, Number(item.saved) || 0);
    const left = Math.max(0, target - saved), done = left <= 0;
    const days = item.dueDate ? daysUntil(item.dueDate) : null;
    const late = !done && days !== null && days < 0;
    const months = days === null || days < 0 ? 0 : Math.max(1, Math.ceil(days / 30));
    return { target, saved, left, done, days, late, ratio: Math.min(1, saved / target), perMonth: months && !done ? Math.ceil(left / months) : 0 };
  }

  function goalForm(old) {
    return `<form id="addForm" data-form="goal" data-kind="goal" ${old ? `data-id="${esc(old.id)}"` : ''} novalidate>
      <div class="field"><label for="f-title">${t('عنوان هدف')}</label><input id="f-title" name="title" maxlength="80" autocomplete="off" data-autofocus value="${esc(old?.title || '')}" placeholder="${t('مثلاً سفر یا خرید لپ‌تاپ')}" required></div>
      <div class="form-grid">${moneyField('target', t('مبلغ هدف ({v1})', { v1: cur() }), old?.target, { big: true })}${moneyField('saved', t('تا حالا چقدر پس‌انداز کرده‌ای؟'), old?.saved || '', { required: false, placeholder: localDigits(0) })}</div>
      ${dateField('due', t('مهلت رسیدن به هدف (اختیاری)'), old?.dueDate || '', { chipSet: 'future', optional: true, placeholder: t('مثلاً {v1}', { v1: jalaliInput(localISO()) }) })}
      <div class="hint">${t('هر بار پس‌انداز کردی، روی «افزودن مبلغ» بزن. این مبلغ از موجودی کل کم نمی‌شود؛ هدف‌ها جدا حساب می‌شوند.')}</div>
      ${submitBar(old ? t('ذخیرهٔ تغییرات') : t('ثبت هدف'), Boolean(old), '#/list/goals')}
    </form>`;
  }

  function goalPayForm(item) {
    return `<form class="pay-box" data-form="goal-pay" data-id="${esc(item.id)}" novalidate>
      <div class="form-grid">${moneyField('amount', t('مبلغی که کنار گذاشتی'), goalInfo(item).perMonth || '', { autofocus: true })}</div>
      <div class="form-actions"><button class="button" type="button" data-action="close-pay">${t('انصراف')}</button><button class="button primary" type="submit">${t('ثبت')}</button></div>
    </form>`;
  }

  function goalCard(item) {
    const g = goalInfo(item), id = esc(item.id);
    const sub = g.done ? t('به هدف رسیدی') : item.dueDate ? t('تا {v1}', { v1: esc(jalaliDateLabel(item.dueDate)) }) : t('بدون مهلت');
    const badge = g.done ? t('کامل') : item.dueDate ? esc(dueLabel(item.dueDate)) : '';
    return `<div class="panel obligation ${g.late ? 'overdue' : ''}">
      <div class="obligation-head"><span class="item-icon">${icon('target')}</span><div class="grow"><div class="title">${esc(displayText(item.title))}</div><div class="sub">${sub}</div></div>${badge ? `<span class="badge ${g.late ? 'alert' : ''}">${badge}</span>` : ''}</div>
      <div class="obligation-amount">${number(g.saved)} <small>${t('از {v1} {v2}', { v1: number(g.target), v2: esc(cur()) })}</small></div>
      ${progressBar(g.ratio, { state: g.late ? 'over' : '' })}<div class="meta"><span>${number(Math.round(g.ratio * 100))}${pctSign()}</span><span>${g.done ? '' : g.perMonth ? t('ماهی {v1} {v2}', { v1: number(g.perMonth), v2: esc(cur()) }) : t('{v1} مانده', { v1: number(g.left) })}</span><span>${g.done ? '' : t('{v1} مانده', { v1: number(g.left) })}</span></div>
      <div class="obligation-actions">${g.done ? '' : `<button class="button primary small" type="button" data-action="open-pay" data-kind="goal" data-id="${id}">${t('افزودن مبلغ')}</button>`}<a class="button small" href="#/add/goal/${id}">${t('ویرایش')}</a><button class="button danger small" type="button" data-action="delete-goal" data-id="${id}">${t('حذف')}</button></div>
      ${ui.paying === payKey('goal', item.id) ? goalPayForm(item) : ''}
    </div>`;
  }

  function goalsTab() {
    const list = [...state.goals].sort((a, b) => (goalInfo(a).done - goalInfo(b).done) || String(a.dueDate || '9').localeCompare(String(b.dueDate || '9')));
    const sum = key => state.goals.reduce((total, item) => total + (key === 'left' ? goalInfo(item).left : Number(item[key]) || 0), 0);
    const summary = list.length ? `<div class="grid three stats">${stat(t('پس‌انداز شده'), sum('saved'), 'wallet', 'positive', cur())}${stat(t('مجموع هدف‌ها'), sum('target'), 'target', '', cur())}${stat(t('مانده تا هدف'), sum('left'), 'clock', '', cur())}</div>` : '';
    return `${summary}<div class="section-head"><h2>${t('هدف‌های پس‌انداز')}</h2><a class="button small" href="#/add/goal">${t('هدف جدید')}</a></div>
      ${list.length ? `<div class="grid three">${list.map(goalCard).join('')}</div>` : empty(t('هدفی ثبت نشده'), t('برای چیزی که می‌خواهی پس‌انداز کنی یک هدف بساز'), `<a class="button primary" href="#/add/goal">${t('هدف جدید')}</a>`)}`;
  }

  function goalRow(item) {
    const g = goalInfo(item);
    return `<a class="category-row goal-row" href="#/list/goals"><span>${esc(displayText(item.title))}</span><span class="category-meter" aria-hidden="true">${ledBar(g.ratio, 16, g.late ? 'r' : 'g')}</span><strong>${number(Math.round(g.ratio * 100))}${pctSign()}</strong></a>`;
  }

  async function deleteGoal(id) {
    if (!state.goals.some(item => item.id === id)) return;
    try { withUndo(t('هدف حذف شد'), draft => { draft.goals = draft.goals.filter(item => item.id !== id); }); } catch { toast(t('حذف انجام نشد')); return; }
    ui.paying = '';
    render();
  }

  /* ---------- مسیر فهرست ---------- */

  function filteredTransactions() {
    const query = normalizeSearch(transactionQuery);
    let rows = query ? [...state.transactions] : monthTransactions();
    if (transactionFilter === 'debt') rows = rows.filter(item => !isCounted(item));
    else if (transactionFilter !== 'all') rows = rows.filter(item => item.type === transactionFilter && isCounted(item));
    if (ui.category) rows = rows.filter(item => (item.category || 'سایر') === ui.category);
    if (query) {
      const digits = /^[\d٬,\s]+$/.test(enDigits(query)) ? enDigits(query).replace(/\D/g, '') : '';
      rows = rows.filter(item => normalizeSearch(`${item.title} ${displayText(item.title)} ${item.category} ${catName(item.category)} ${item.note || ''} ${displayText(item.note || '')}`).includes(query) || (digits && String(item.amount).includes(digits)));
    }
    return sortTransactions(rows);
  }

  function groupedTransactions(rows, searching) {
    if (!rows.length) {
      return empty(t('تراکنشی پیدا نشد'), searching ? t('عبارت دیگری را جست‌وجو کن') : t('یک مورد ثبت کن یا فیلتر و ماه را تغییر بده'), searching ? '' : `<a class="button primary small" href="#/add/expense">${t('ثبت تراکنش')}</a>`);
    }
    const groups = new Map();
    rows.forEach(row => { if (!groups.has(row.date)) groups.set(row.date, []); groups.get(row.date).push(row); });
    return `${searching ? `<div class="sub search-note">${t('در همهٔ ماه‌ها جست‌وجو شد')}</div>` : ''}${[...groups].map(([date, items]) => {
      const spent = items.filter(item => item.type === 'expense' && isCounted(item)).reduce((sum, item) => sum + Number(item.amount), 0);
      return `<section class="day-group"><div class="day-head"><span>${esc(relativeDay(date))}</span>${spent ? `<span>${t('{v1} خرج', { v1: number(spent) })}</span>` : ''}</div><div class="list">${items.map(transactionRow).join('')}</div></section>`;
    }).join('')}`;
  }

  function updateTransactionList() {
    const container = $('#txList');
    if (container) container.innerHTML = groupedTransactions(filteredTransactions(), Boolean(normalizeSearch(transactionQuery)));
  }

  function transactionsTab() {
    const result = totals(monthTransactions());
    const filters = [['all', t('همه')], ['expense', t('خرج‌ها')], ['income', t('درآمدها')], ['debt', t('بدهی و طلب')]];
    return `<div class="panel">
      <div class="tab-top">${monthSwitcher()}<div class="chips"><span class="chip">${t('درآمد:')} <b class="positive">${number(result.income)}</b></span><span class="chip">${t('خرج:')} <b class="negative">${number(result.expense)}</b></span></div></div>
      <div class="toolbar"><label class="search">${icon('search')}<input id="transactionSearch" type="search" enterkeyhint="search" value="${esc(transactionQuery)}" placeholder="${t('جست‌وجوی عنوان، دسته یا مبلغ')}" autocomplete="off" aria-label="${t('جست‌وجو')}"></label><div class="filters" role="group" aria-label="${t('فیلتر')}">${filters.map(([value, label]) => `<button class="filter ${transactionFilter === value ? 'active' : ''}" type="button" data-action="transaction-filter" data-filter="${value}" aria-pressed="${transactionFilter === value}">${label}</button>`).join('')}</div></div>
      ${ui.category ? `<div class="chips active-filter"><button class="chip removable" type="button" data-action="clear-category">${t('دسته: {v1}', { v1: esc(catName(ui.category)) })} ${icon('close')}</button></div>` : ''}
      <div id="txList"></div>
    </div>`;
  }

  function installmentCard(item) {
    const count = Math.max(1, Number(item.count) || 1);
    const paid = Math.min(count, Number(item.paidCount) || 0);
    const done = item.status === 'done' || paid >= count;
    const progress = Math.round(paid / count * 100);
    const overdue = !done && item.nextDueDate && daysUntil(item.nextDueDate) < 0;
    const id = esc(item.id);
    return `<div class="panel obligation ${overdue ? 'overdue' : ''}">
      <div class="obligation-head"><span class="item-icon">${icon('clock')}</span><div class="grow"><div class="title">${esc(displayText(item.title))}</div><div class="sub">${done ? t('تسویه شده') : t('قسط {v1} از {v2}', { v1: number(paid + 1), v2: number(count) })}</div></div><span class="badge ${overdue ? 'alert' : ''}">${done ? t('تمام‌شده') : esc(dueLabel(item.nextDueDate))}</span></div>
      <div class="obligation-amount">${number(item.amount)} <small>${esc(cur())}</small></div>
      ${progressBar(progress / 100)}<div class="meta"><span>${t('{v1} پرداخت', { v1: number(paid) })}</span><span>${done ? '' : t('سررسید {v1}', { v1: esc(jalaliDateLabel(item.nextDueDate)) })}</span><span>${number(progress)}${pctSign()}</span></div>
      <div class="obligation-actions">${done ? '' : `<button class="button primary small" type="button" data-action="open-pay" data-kind="installment" data-id="${id}">${t('ثبت پرداخت')}</button>`}<a class="button small" href="#/add/installment/${id}">${t('ویرایش')}</a><button class="button danger small" type="button" data-action="delete-obligation" data-store="installments" data-id="${id}">${t('حذف')}</button></div>
      ${ui.paying === payKey('installment', item.id) ? payForm('installment', item) : ''}
    </div>`;
  }

  function debtCard(item) {
    const total = Number(item.total) || 0;
    const remaining = Math.max(0, Number(item.remaining) || 0);
    const done = item.status === 'done' || remaining <= 0;
    const progress = Math.max(0, Math.min(100, total ? Math.round((total - remaining) / total * 100) : 100));
    const overdue = !done && item.dueDate && daysUntil(item.dueDate) < 0;
    const owe = item.direction === 'owe';
    const id = esc(item.id);
    return `<div class="panel obligation ${overdue ? 'overdue' : ''}">
      <div class="obligation-head"><span class="item-icon">${icon(owe ? 'down' : 'up')}</span><div class="grow"><div class="title">${esc(displayText(item.title))}</div><div class="sub">${owe ? t('من بدهکارم') : t('من طلبکارم')}${item.person ? ` · ${esc(item.person)}` : ''}</div></div><span class="badge ${overdue ? 'alert' : ''}">${done ? t('تسویه‌شده') : esc(dueLabel(item.dueDate))}</span></div>
      <div class="obligation-amount ${owe ? '' : 'positive'}">${number(remaining)} <small>${t('{v1} مانده', { v1: esc(cur()) })}</small></div>
      ${progressBar(progress / 100)}<div class="meta"><span>${t('اصل: {v1}', { v1: number(total) })}</span><span>${t('{v1}٪ تسویه', { v1: number(progress) })}</span></div>
      <div class="obligation-actions">${done ? '' : `<button class="button primary small" type="button" data-action="open-pay" data-kind="debt" data-id="${id}">${(owe ? t('ثبت پرداخت') : t('ثبت دریافت'))}</button>`}<a class="button small" href="#/add/debt/${id}">${t('ویرایش')}</a><button class="button danger small" type="button" data-action="delete-obligation" data-store="debts" data-id="${id}">${t('حذف')}</button></div>
      ${ui.paying === payKey('debt', item.id) ? payForm('debt', item) : ''}
    </div>`;
  }

  function obligationsTab() {
    const installments = [...state.installments].sort((a, b) => (a.status === 'done') - (b.status === 'done') || String(a.nextDueDate || '9').localeCompare(String(b.nextDueDate || '9')));
    const debts = [...state.debts].sort((a, b) => (a.status === 'done') - (b.status === 'done') || String(a.dueDate || '9').localeCompare(String(b.dueDate || '9')));
    const owe = debts.filter(item => item.status !== 'done' && item.direction === 'owe').reduce((sum, item) => sum + Number(item.remaining), 0);
    const receivable = debts.filter(item => item.status !== 'done' && item.direction === 'receivable').reduce((sum, item) => sum + Number(item.remaining), 0);
    const left = installments.filter(item => item.status !== 'done').reduce((sum, item) => sum + (Number(item.count) - Number(item.paidCount)) * Number(item.amount), 0);
    const summary = installments.length || debts.length ? `<div class="grid three stats">${stat(t('اقساط باقی‌مانده'), left, 'clock', '', cur())}${stat(t('بدهی من'), owe, 'down', owe ? 'negative' : '', cur())}${stat(t('طلب من'), receivable, 'up', receivable ? 'positive' : '', cur())}</div>` : '';
    const receiptLink = '';
    return `${summary}${receiptLink}
      <div class="section-head"><h2>${t('قسط‌ها')}</h2><div class="actions"><a class="button small" href="#/receipt">${icon('download')} ${t('رسید ماه')}</a><a class="button small" href="#/add/installment">${t('قسط جدید')}</a></div></div>
      ${installments.length ? `<div class="grid three">${installments.map(installmentCard).join('')}</div>` : empty(t('قسطی ثبت نشده'), t('قسط‌هایت را اضافه کن تا سررسیدها مشخص باشند'), `<a class="button primary small" href="#/add/installment">${t('قسط جدید')}</a>`)}
      <div class="section-head"><h2>${t('بدهی‌ها و طلب‌ها')}</h2><a class="button small" href="#/add/debt">${t('بدهی یا طلب جدید')}</a></div>
      ${debts.length ? `<div class="grid three">${debts.map(debtCard).join('')}</div>` : empty(t('بدهی یا طلبی ثبت نشده'), t('پولی که باید بدهی یا بگیری را اینجا نگه دار'), `<a class="button primary small" href="#/add/debt">${t('بدهی یا طلب جدید')}</a>`)}`;
  }

  function notesTab() {
    const notes = [...state.notes].sort(noteSort);
    const open = notes.filter(note => !note.done);
    const done = notes.filter(note => note.done);
    return `<div class="panel">
      <div class="section-head tight"><h2>${t('یادداشت‌ها')} <small class="muted">${t('· {v1} باز', { v1: number(open.length) })}</small></h2><a class="button small primary" href="#/add/note">${t('یادداشت جدید')}</a></div>
      ${open.length ? `<div class="list">${open.map(noteRow).join('')}</div>` : empty(t('یادداشتی نداری'), t('کارهای مالی‌ات را بنویس: پرداخت قبض، پیگیری طلب، ...'), `<a class="button primary small" href="#/add/note">${t('یادداشت جدید')}</a>`)}
      ${done.length ? `<details class="done-notes"><summary>${t('انجام‌شده‌ها ({v1})', { v1: number(done.length) })}</summary><div class="list">${done.map(noteRow).join('')}</div></details>` : ''}
    </div>`;
  }

  function renderList() {
    const tab = LIST_TABS.some(item => item[0] === route.parts[0]) ? route.parts[0] : 'transactions';
    const counts = { goals: state.goals.filter(item => !goalInfo(item).done).length, transactions: monthTransactions().length, obligations: state.installments.filter(item => item.status !== 'done').length + state.debts.filter(item => item.status !== 'done').length, notes: state.notes.filter(note => !note.done).length };
    $('#screen').innerHTML = `${pageHead(t('همهٔ ثبت‌ها'), t('فهرست'))}
      <nav class="seg-tabs" aria-label="${t('بخش‌های فهرست')}">${LIST_TABS.map(([value, label]) => `<a class="seg ${value === tab ? 'active' : ''}" href="#/list/${value}" ${value === tab ? 'aria-current="page"' : ''}>${t(label)}${counts[value] ? ` <span class="count">${number(counts[value])}</span>` : ''}</a>`).join('')}</nav>
      ${tab === 'transactions' ? transactionsTab() : tab === 'obligations' ? obligationsTab() : tab === 'goals' ? goalsTab() : notesTab()}`;
    if (tab === 'transactions') updateTransactionList();
    refreshInputs($('#screen'));
  }

  /* ---------- مسیر تنظیمات ---------- */

  function fold(key, title, body, hint = '') {
    return `<details class="panel fold" id="fold-${key}" data-fold="${key}" ${ui.open.has(key) ? 'open' : ''}><summary><span>${esc(title)}</span>${hint ? `<small class="muted">${esc(hint)}</small>` : ''}</summary><div class="fold-body">${body}</div></details>`;
  }

  function recurringForm(old) {
    const selected = old ? `${old.type}:${old.category}` : fa('expense:خانه');
    const options = (type, list) => list.map(category => `<option value="${type}:${esc(category)}" ${selected === `${type}:${category}` ? 'selected' : ''}>${esc(catName(category))}</option>`).join('');
    const dayOptions = Array.from({ length: 31 }, (_, index) => `<option value="${index + 1}" ${(old?.day || jalaliParts(localISO()).jd) === index + 1 ? 'selected' : ''}>${localDigits(index + 1)}</option>`).join('');
    return `<form class="inline-form" data-form="recurring" ${old ? `data-id="${esc(old.id)}"` : ''} novalidate>
      <div class="field"><label for="f-rtitle">${t('عنوان')}</label><input id="f-rtitle" name="title" maxlength="80" autocomplete="off" data-autofocus value="${esc(old?.title || '')}" placeholder="${t('مثلاً اجارهٔ خانه')}" required></div>
      ${moneyField('amount', t('مبلغ ({v1})', { v1: cur() }), old?.amount)}
      <div class="form-grid"><div class="field"><label for="f-kind">${t('نوع و دسته')}</label><select id="f-kind" name="kind"><optgroup label="${t('خرج')}">${options('expense', EXPENSE_CATEGORIES.filter(category => category !== 'بدهی'))}</optgroup><optgroup label="${t('درآمد')}">${options('income', INCOME_CATEGORIES)}</optgroup></select></div><div class="field"><label for="f-day">${t('روزِ ماه')}</label><select id="f-day" name="day">${dayOptions}</select></div></div>
      <div class="hint">${t('اگر ماهی آن روز را نداشت (مثلاً ۳۱ در مهر)، آخرین روز همان ماه ثبت می‌شود.')}</div>
      <div class="form-actions"><button class="button" type="button" data-action="recurring-close">${t('انصراف')}</button><button class="button primary" type="submit">${t('ذخیره')}</button></div></form>`;
  }

  function recurringRow(rule) {
    return `<div class="row"><div class="row-main"><span class="item-icon">${icon('repeat')}</span><span class="grow"><span class="title">${esc(displayText(rule.title))}</span><span class="sub">${t('هر ماه، روز {v1} · {v2} · {v3}', { v1: number(rule.day), v2: rule.type === 'income' ? t('درآمد') : t('خرج'), v3: esc(catName(rule.category)) })}</span></span><span class="amount ${rule.type === 'income' ? 'positive' : 'negative'}">${number(rule.amount)}</span><button class="icon-button small" type="button" data-action="recurring-edit" data-id="${esc(rule.id)}" aria-label="${t('ویرایش')}">${icon('edit')}</button><button class="icon-button small" type="button" data-action="recurring-delete" data-id="${esc(rule.id)}" aria-label="${t('حذف')}">${icon('trash')}</button></div></div>`;
  }

  function renderSettings() {
    const section = route.parts[0];
    if (section) ui.open.add(section);
    const last = state.settings.lastBackup ? jalaliDateLabel(localISO(state.settings.lastBackup)) : t('هرگز');
    const iosHint = isIOS() && !isStandalone() ? `<div class="hint"><strong>${t('روی آیفون:')}</strong> ${t('حافظهٔ Safari و برنامهٔ نصب‌شده از هم جداست. اول با «Add to Home Screen» برنامه را نصب کن و بعد اطلاعات را وارد کن.')}</div>` : '';
    const monthKey = jalaliMonthKey(localISO());
    const inherited = effectiveBudgets(monthKey);
    const budgetFields = BUDGET_CATEGORIES.map((category, index) => moneyField(`cat_${index}`, catName(category), inherited.items.find(item => item.category === category)?.amount, { required: false, placeholder: t('بدون سقف') })).join('');
    const budgetNote = inherited.month && inherited.month !== monthKey ? t('سقف‌ها از {v1} آورده شده‌اند؛ با ذخیره، از {v2} هم ثبت می‌شوند.', { v1: monthKeyLabel(inherited.month), v2: monthKeyLabel(monthKey) }) : t('سقف دسته‌ها در ماه‌های بعد هم ادامه پیدا می‌کند، مگر دوباره تغییرشان بدهی.');
    const finance = `<form data-form="settings" novalidate>
        <div class="field"><label for="f-currency">${t('واحد پول')}</label><input id="f-currency" name="currency" maxlength="20" autocomplete="off" value="${esc(cur())}"></div>
        <div class="field"><label for="f-startingBalance">${t('موجودی شروع')} <span class="muted">${t('(می‌تواند منفی باشد)')}</span></label><input id="f-startingBalance" name="startingBalance" inputmode="text" autocomplete="off" data-money data-signed value="${state.settings.startingBalance ? `${state.settings.startingBalance < 0 ? '−' : ''}${localMoney(Math.abs(state.settings.startingBalance))}` : ''}" placeholder="${localDigits('0')}"><div class="money-words"></div></div>
        ${moneyField('monthlyBudget', t('سقف کل خرج ماهانه'), state.settings.monthlyBudget || '', { required: false, placeholder: t('بدون سقف') })}
        <button class="button primary block" type="submit">${t('ذخیرهٔ تنظیمات')}</button></form>`;
    const budget = `<form data-form="budget" novalidate><div class="hint">${esc(budgetNote)}</div><div class="form-grid">${budgetFields}</div><button class="button primary block" type="submit">${t('ذخیرهٔ بودجهٔ دسته‌ها')}</button></form>`;
    const recurring = `${state.recurring.length ? `<div class="list">${state.recurring.map(rule => (ui.recurring === rule.id ? recurringForm(rule) : recurringRow(rule))).join('')}</div>` : `<p class="muted lead">${t('اجاره، اینترنت یا حقوق را یک بار تعریف کن تا هر ماه خودکار ثبت شود.')}</p>`}${ui.recurring === 'new' ? recurringForm(null) : '<div class="actions"><button class="button" type="button" data-action="recurring-new">' + icon('plus') + ` ${t('تعریف مورد تکراری')}</button></div>`}`;
    const backup = `<p class="muted lead">${t('اطلاعات فقط روی همین مرورگر ذخیره می‌شود. پیش از پاک‌کردن داده‌های مرورگر یا تعویض گوشی، فایل پشتیبان بگیر.')}</p>${iosHint}<div class="sub backup-status">${t('آخرین پشتیبان: {v1}', { v1: esc(last) })}</div><div class="actions"><button class="button primary" type="button" data-action="export">${t('دریافت پشتیبان')}</button><label class="button">${t('بازیابی از فایل')}<input id="importInput" hidden type="file" accept=".json,application/json"></label></div><h3 class="sub-title">${t('خروجی برای اکسل (CSV)')}</h3><div class="actions"><button class="button" type="button" data-action="export-csv" data-scope="month">${t('CSV همین ماه')}</button><button class="button" type="button" data-action="export-csv" data-scope="all">${t('CSV همهٔ تراکنش‌ها')}</button></div><h3 class="sub-title">${t('نسخه‌های خودکار')}</h3><p class="muted lead">${t('برنامه خودش هر روز یک نسخه در همین مرورگر نگه می‌دارد (هفت روز اخیر). این جای فایل پشتیبان را نمی‌گیرد؛ اگر داده‌های مرورگر پاک شود، این‌ها هم پاک می‌شوند.')}</p><div id="autoCopies"></div>${hasPreviousStash() ? `<div class="actions stash"><button class="button small" type="button" data-action="restore-previous">${t('بازگرداندن نسخهٔ پیش از آخرین بازیابی یا پاک‌سازی')}</button></div>` : ''}`;
    const crtMode = ['off', 'soft', 'full'].includes(state.settings.crt) ? state.settings.crt : 'full';
    const crtButtons = [['off', 'خاموش'], ['soft', 'ملایم'], ['full', 'شدید']].map(([value, text]) => `<button type="button" class="seg-btn ${crtMode === value ? 'on' : ''}" data-action="set-crt" data-crt="${value}" aria-pressed="${crtMode === value}">${t(text)}</button>`).join('');
    const appearance = `<div class="field"><label>${t('افکت مانیتور قدیمی (CRT)')}</label><div class="segment crt-segment">${crtButtons}</div><div class="sub">${t('خط‌های اسکن، درخشش فسفری، حاشیهٔ تاریک و لرزش نور. در حالت «ملایم» بدون حرکت است.')}</div></div><div class="field"><label>${t('زبان و تقویم')}</label><div class="segment lang-segment"><button type="button" class="seg-btn ${isEn() ? '' : 'on'}" data-action="set-lang" data-lang="fa" aria-pressed="${!isEn()}">فارسی · شمسی</button><button type="button" class="seg-btn ${isEn() ? 'on' : ''}" data-action="set-lang" data-lang="en" aria-pressed="${isEn()}">English · Gregorian</button></div></div><button class="button" type="button" data-action="theme">${t('تغییر حالت روشن و تاریک')}</button><p class="sub version">${t('ORBIT نسخهٔ {APP_VERSION}', { APP_VERSION })}</p>`;
    const danger = `<p class="muted">${t('همهٔ تراکنش‌ها، اقساط، بدهی‌ها و یادداشت‌ها حذف می‌شوند.')}</p><button class="button danger" type="button" data-action="clear-data">${t('پاک کردن همهٔ اطلاعات')}</button>`;
    $('#screen').innerHTML = `${pageHead(t('شخصی‌سازی و پشتیبان'), t('تنظیمات'))}<div class="folds">${fold('finance', t('تنظیمات مالی'), finance, t('واحد پول، موجودی شروع، بودجه'))}${fold('budget', t('بودجهٔ دسته‌ها'), budget, jalaliMonthLabel(localISO()))}${fold('recurring', t('تراکنش‌های تکراری'), recurring, state.recurring.length ? t('{v1} مورد', { v1: number(state.recurring.length) }) : '')}${fold('backup', t('پشتیبان و بازیابی'), backup)}${fold('look', t('ظاهر'), appearance)}${fold('danger', t('پاک‌سازی'), danger)}</div>`;
    $('#importInput')?.addEventListener('change', event => importData(event.target.files?.[0]));
    refreshInputs($('#screen'));
    fillAutoCopies();
    if (section) setTimeout(() => $(`#fold-${section}`)?.scrollIntoView({ block: 'start' }), 30);
  }

  /* ---------- ماشین‌حساب (همیشه با قالب انگلیسی: چپ‌به‌راست، ارقام لاتین، ممیز «.») ---------- */

  const CALC_OPS = '+−×÷';
  const CALC_ERRORS = { div0: 'تقسیم بر صفر ممکن نیست', overflow: 'عدد از ۱۲ رقم بیشتر شد', syntax: 'عبارت کامل نیست' };
  const calc = { expr: '', result: 0, done: false, last: '', error: '', memory: 0, tape: [] };

  /** عبارتِ + − × ÷ % ( ) را بدون eval حساب می‌کند؛ خطا را با throw برمی‌گرداند. */
  function calcEvaluate(input) {
    const text = String(input).replace(/\s+/g, '');
    let position = 0;
    const peek = () => text[position];
    const fail = code => { throw new Error(code); };
    function parsePrimary() {
      if (peek() === '(') {
        position += 1;
        const node = parseExpression();
        if (peek() !== ')') fail('syntax');
        position += 1;
        return node;
      }
      const match = /^(\d+\.?\d*|\.\d+)/.exec(text.slice(position));
      if (!match) fail('syntax');
      position += match[0].length;
      return { value: Number(match[0]) };
    }
    function parsePostfix() {
      let node = parsePrimary();
      while (peek() === '%') { position += 1; node = { op: '%', arg: node }; }
      return node;
    }
    function parseUnary() {
      if (peek() === '−') { position += 1; return { op: 'neg', arg: parseUnary() }; }
      if (peek() === '+') { position += 1; return parseUnary(); }
      return parsePostfix();
    }
    function parseTerm() {
      let node = parseUnary();
      while (peek() === '×' || peek() === '÷') { const op = text[position]; position += 1; node = { op, left: node, right: parseUnary() }; }
      return node;
    }
    function parseExpression() {
      let node = parseTerm();
      while (peek() === '+' || peek() === '−') { const op = text[position]; position += 1; node = { op, left: node, right: parseTerm() }; }
      return node;
    }
    function evaluate(node) {
      if ('value' in node) return node.value;
      switch (node.op) {
        case 'neg': return -evaluate(node.arg);
        case '%': return evaluate(node.arg) / 100;
        case '+': case '−': {
          const left = evaluate(node.left);
          // 200 + 10% یعنی ۲۰۰ به‌علاوهٔ ۱۰٪ خودِ ۲۰۰
          const right = node.right.op === '%' ? left * evaluate(node.right.arg) / 100 : evaluate(node.right);
          return node.op === '+' ? left + right : left - right;
        }
        case '×': return evaluate(node.left) * evaluate(node.right);
        default: {
          const divisor = evaluate(node.right);
          if (divisor === 0) fail('div0');
          return evaluate(node.left) / divisor;
        }
      }
    }
    const tree = parseExpression();
    if (position !== text.length) fail('syntax');
    const value = evaluate(tree);
    if (!Number.isFinite(value)) fail('overflow');
    return value;
  }

  /** حداکثر ۱۲ رقم؛ بیش از آن null (سرریز). */
  function calcFormat(value) {
    if (!Number.isFinite(value)) return null;
    let rounded = Number(value.toPrecision(12));
    if (rounded === 0) rounded = 0;
    const absolute = Math.abs(rounded);
    if (absolute >= 1e12) return null;
    const integerDigits = absolute < 1 ? 1 : String(Math.floor(absolute)).length;
    let text = rounded.toFixed(Math.max(0, 12 - integerDigits));
    if (text.includes('.')) text = text.replace(/0+$/, '').replace(/\.$/, '');
    return text === '-0' ? '0' : text;
  }

  /** ۱۲۳۴.۵ ← 1,234.5 (همیشه کاما برای هزارگان و نقطه برای اعشار). */
  function calcGroup(text) {
    const negative = text.startsWith('-');
    const [whole, fraction] = (negative ? text.slice(1) : text).split('.');
    return `${negative ? '-' : ''}${whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}${fraction !== undefined ? `.${fraction}` : ''}`;
  }

  const calcPretty = expression => String(expression).replace(/([\d)%.])([+−×÷])/g, '$1 $2 ');
  const calcTrailing = expression => (/(\d+\.?\d*|\.\d+|\d*\.)$/.exec(expression) || [''])[0];

  /** عملگر و پرانتز باز آخر عبارت را برمی‌دارد و پرانتزهای باز را می‌بندد. */
  function calcSanitize(expression) {
    let text = expression;
    while (text && (CALC_OPS.includes(text.slice(-1)) || text.slice(-1) === '(')) text = text.slice(0, -1);
    const open = (text.match(/\(/g) || []).length - (text.match(/\)/g) || []).length;
    return text + ')'.repeat(Math.max(0, open));
  }

  function calcDisplay() {
    if (calc.error) return { text: 'Error' };
    if (calc.done) return { text: calcFormat(calc.result) || '0' };
    const tail = calcTrailing(calc.expr);
    if (tail) {
      const before = calc.expr.slice(0, calc.expr.length - tail.length);
      return { text: `${/(^|[+−×÷(])−$/.test(before) ? '-' : ''}${tail}` };
    }
    const clean = calcSanitize(calc.expr);
    if (clean) {
      try { const shown = calcFormat(calcEvaluate(clean)); if (shown !== null) return { text: shown }; } catch { /* هنوز کامل نیست */ }
    }
    return { text: '0' };
  }

  function calcClear() { Object.assign(calc, { expr: '', result: 0, done: false, last: '', error: '' }); }

  function calcBegin() { if (calc.done) { calc.expr = ''; calc.done = false; } }

  function calcContinue() {
    if (!calc.done) return;
    calc.expr = (calcFormat(calc.result) || '0').replace('-', '−');
    calc.done = false;
  }

  function calcDigit(digit) {
    calcBegin();
    if (/[)%]$/.test(calc.expr)) calc.expr += '×';
    const tail = calcTrailing(calc.expr);
    if (tail === '0') calc.expr = calc.expr.slice(0, -1) + digit;
    else if (tail.replace('.', '').length < 12) calc.expr += digit;
  }

  function calcPoint() {
    calcBegin();
    if (/[)%]$/.test(calc.expr)) calc.expr += '×';
    const tail = calcTrailing(calc.expr);
    if (tail.includes('.')) return;
    calc.expr += tail === '' ? '0.' : '.';
  }

  function calcOperator(op) {
    calcContinue();
    if (calc.expr === '') { calc.expr = op === '−' ? '−' : `0${op}`; return; }
    const last = calc.expr.slice(-1);
    if (last === '(') { if (op === '−') calc.expr += '−'; return; }
    if (CALC_OPS.includes(last)) {
      if (op === '−' && '×÷'.includes(last)) { calc.expr += '−'; return; }
      const stripped = calc.expr.replace(/[+−×÷]+$/, '');
      calc.expr = `${stripped === '' ? '0' : stripped}${op}`;
      return;
    }
    calc.expr += op;
  }

  function calcPercent() {
    calcContinue();
    if (/[\d.)%]$/.test(calc.expr)) calc.expr += '%';
  }

  function calcParen(kind) {
    if (kind === '(') {
      calcBegin();
      if (/[\d.)%]$/.test(calc.expr)) calc.expr += '×';
      calc.expr += '(';
      return;
    }
    calcContinue();
    const depth = (calc.expr.match(/\(/g) || []).length - (calc.expr.match(/\)/g) || []).length;
    if (depth > 0 && /[\d.)%]$/.test(calc.expr)) calc.expr += ')';
  }

  function calcNegate() {
    if (calc.done) { calc.result = calc.result === 0 ? 0 : -calc.result; return; }
    const tail = calcTrailing(calc.expr);
    if (!tail) return;
    const before = calc.expr.slice(0, calc.expr.length - tail.length);
    if (/(^|[+−×÷(])−$/.test(before)) calc.expr = before.slice(0, -1) + tail;
    else if (before === '' || /[+−×÷(]$/.test(before)) calc.expr = `${before}−${tail}`;
  }

  function calcEquals() {
    if (calc.done) return;
    const clean = calcSanitize(calc.expr);
    if (!clean) return;
    try {
      const shown = calcFormat(calcEvaluate(clean));
      if (shown === null) throw new Error('overflow');
      calc.tape.push({ expr: calcPretty(clean), result: shown });
      if (calc.tape.length > 40) calc.tape.shift();
      Object.assign(calc, { result: Number(shown), last: clean, done: true });
    } catch (error) {
      calc.error = CALC_ERRORS[error.message] ? error.message : 'syntax';
    }
  }

  function calcMemoryRecall() {
    calcBegin();
    const tail = calcTrailing(calc.expr);
    if (tail) calc.expr = calc.expr.slice(0, calc.expr.length - tail.length);
    else if (/[)%]$/.test(calc.expr)) calc.expr += '×';
    calc.expr += (calcFormat(calc.memory) || '0').replace('-', '−');
  }

  function calcMemoryAdd(sign) {
    const shown = Number(calcDisplay().text);
    if (Number.isFinite(shown)) calc.memory = Number(calcFormat(calc.memory + sign * shown)) || 0;
  }

  function calcPress(key) {
    if (calc.error && key !== 'AC') calcClear();
    if (/^\d$/.test(key)) calcDigit(key);
    else if (key === '.') calcPoint();
    else if (CALC_OPS.includes(key)) calcOperator(key);
    else if (key === '%') calcPercent();
    else if (key === '(' || key === ')') calcParen(key);
    else if (key === '±') calcNegate();
    else if (key === '=') calcEquals();
    else if (key === 'AC') calcClear();
    else if (key === 'DEL') { if (calc.done) calcClear(); else calc.expr = calc.expr.slice(0, -1); }
    else if (key === 'MC') calc.memory = 0;
    else if (key === 'MR') calcMemoryRecall();
    else if (key === 'M+') calcMemoryAdd(1);
    else if (key === 'M−') calcMemoryAdd(-1);
    updateCalcView();
  }

  function tapeMarkup() {
    if (!calc.tape.length) return `<p class="tape-empty">${t('نتیجه‌ها مثل رسید کاغذی اینجا ردیف می‌شوند. روی هر خط بزن تا دوباره استفاده شود.')}</p>`;
    return [...calc.tape].map((line, index) => ({ line, index })).reverse().map(({ line, index }) => `<button type="button" class="tape-line" data-calc-tape="${index}"><span class="tape-expr">${esc(line.expr)}</span><span class="tape-res">= ${esc(calcGroup(line.result))}</span></button>`).join('');
  }

  function updateCalcView() {
    const lcd = $('#calcLcd');
    if (!lcd) return;
    const view = calcDisplay();
    lcd.innerHTML = segNumber(view.text, { pad: 12, cls: 'seg-calc' });
    $('#calcValue').textContent = calcGroup(view.text);
    $('#calcExpr').textContent = calc.done ? `${calcPretty(calc.last)} =` : calcPretty(calc.expr);
    $('#calcMemory').classList.toggle('on', calc.memory !== 0);
    $('#calcError').classList.toggle('on', Boolean(calc.error));
    $('#calcMsg').textContent = calc.error ? t(CALC_ERRORS[calc.error]) : '';
    $('#calcTape').innerHTML = tapeMarkup();
  }

  function calcToAdd(kind) {
    const value = Number(calcDisplay().text);
    const amount = Math.round(Math.abs(value));
    if (!(value > 0) || amount < 1 || amount > MAX_AMOUNT) { toast(t('برای ثبت، نتیجه باید بیشتر از صفر باشد')); return; }
    ui.preset = { kind, data: { amount } };
    go(`/add/${kind}`);
  }

  async function calcCopy() {
    const text = calcDisplay().text;
    try { await navigator.clipboard.writeText(text); toast(t('کپی شد')); } catch { toast(t('کپی انجام نشد')); }
  }

  function calcReuse(index) {
    const line = calc.tape[index];
    if (!line) return;
    calcBegin();
    const tail = calcTrailing(calc.expr);
    if (tail) calc.expr = calc.expr.slice(0, calc.expr.length - tail.length);
    else if (/[)%]$/.test(calc.expr)) calc.expr += '×';
    calc.expr += line.result.replace('-', '−');
    updateCalcView();
  }

  const CALC_KEYMAP = {
    '+': '+', '-': '−', '−': '−', '*': '×', x: '×', X: '×', '×': '×', '/': '÷', '÷': '÷', '%': '%', '(': '(', ')': ')',
    '.': '.', ',': '.', '٫': '.', '،': '.', '=': '=', Enter: '=', Backspace: 'DEL', Delete: 'AC', Escape: 'AC', c: 'AC', C: 'AC'
  };

  /** کلیدهای صفحه‌کلید را وقتی روی صفحهٔ ماشین‌حساب هستیم به کلیدهای ماشین می‌رساند. */
  function calcKeyboard(event) {
    if (route.page !== 'calc' || event.ctrlKey || event.metaKey || event.altKey || event.isComposing) return;
    if ($('#confirmModal').classList.contains('open')) return;
    if (/^(INPUT|TEXTAREA|SELECT|BUTTON|A|SUMMARY)$/.test(event.target?.tagName || '')) return;
    const digit = enDigits(event.key);
    const key = /^\d$/.test(digit) ? digit : CALC_KEYMAP[event.key];
    if (!key) return;
    event.preventDefault();
    const button = document.querySelector(`[data-calc="${key}"]`);
    if (button) { button.classList.add('hit'); setTimeout(() => button.classList.remove('hit'), 130); }
    calcPress(key);
  }

  function renderCalc() {
    const label = text => esc(t(text));
    const small = [['MC', 'پاک‌کردن حافظه'], ['MR', 'فراخوانی حافظه'], ['M−', 'کم‌کردن از حافظه'], ['M+', 'افزودن به حافظه'], ['(', 'پرانتز باز'], [')', 'پرانتز بسته']];
    const main = [
      ['AC', 'AC', 'danger', 'پاک‌کردن همه'], ['DEL', icon('backspace'), 'fn', 'حذف آخرین'], ['%', '%', 'fn', 'درصد'], ['÷', '÷', 'op', 'تقسیم'],
      ['7', '7'], ['8', '8'], ['9', '9'], ['×', '×', 'op', 'ضرب'],
      ['4', '4'], ['5', '5'], ['6', '6'], ['−', '−', 'op', 'تفریق'],
      ['1', '1'], ['2', '2'], ['3', '3'], ['+', '+', 'op', 'جمع'],
      ['±', '±', 'fn', 'تغییر علامت'], ['0', '0'], ['.', '.', '', 'ممیز'], ['=', '=', 'eq', 'مساوی']
    ];
    $('#screen').innerHTML = `${pageHead(t('همیشه با ارقام و قالب انگلیسی'), t('ماشین‌حساب'))}
      <div class="calc-layout">
        <div class="calc-device" dir="ltr" lang="en">
          <div class="calc-brand"><span class="calc-logo">ORBIT</span><span class="calc-solar" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span class="calc-model">CALC-12</span></div>
          <div class="lcd calc-lcd">
            <div class="lcd-cap calc-cap"><span class="ann" id="calcMemory">M</span><span class="ann err" id="calcError">ERR</span><span class="calc-expr" id="calcExpr"></span></div>
            <div id="calcLcd"></div>
            <span class="sr-only" id="calcValue" aria-live="polite"></span>
            <div class="calc-msg" id="calcMsg" dir="auto"></div>
          </div>
          <div class="keys-small">${small.map(([value, aria]) => `<button type="button" class="key mini" data-calc="${value}" aria-label="${label(aria)}">${value}</button>`).join('')}</div>
          <div class="keys-main">${main.map(([value, content, cls = '', aria]) => `<button type="button" class="key ${cls}" data-calc="${value}" aria-label="${aria ? label(aria) : value}">${content}</button>`).join('')}</div>
        </div>
        <div class="calc-side">
          <div class="panel tape-panel">
            <div class="section-head tight"><h2>${t('نوار نتایج')}</h2><button class="button small" type="button" data-action="calc-tape-clear">${t('پاک‌کردن نوار')}</button></div>
            <div class="tape" id="calcTape"></div>
          </div>
          <div class="panel calc-actions">
            <div class="actions">
              <button class="button" type="button" data-action="calc-copy">${icon('copy')} ${t('کپی نتیجه')}</button>
              <button class="button primary" type="button" data-action="calc-expense">${icon('down')} ${t('ثبت به‌عنوان خرج')}</button>
              <button class="button primary" type="button" data-action="calc-income">${icon('up')} ${t('ثبت به‌عنوان درآمد')}</button>
            </div>
            <p class="sub hint-line">${t('صفحه‌کلید هم کار می‌کند: عددها، + − * / %، Enter، Backspace و Esc.')}</p>
          </div>
        </div>
      </div>`;
    updateCalcView();
  }

  /* ---------- ورودی‌های مبلغ و تاریخ ---------- */

  function updateMoneyWords(input) {
    const target = input.closest('.field, .field-inline')?.querySelector('.money-words');
    if (!target) return;
    const value = parseMoney(input.value, { signed: input.hasAttribute('data-signed') });
    target.textContent = value !== null && Math.abs(value) >= 1000 ? `${value < 0 ? t('منفی ') : ''}${numberToWords(Math.abs(value))} ${cur()}` : '';
  }

  function formatMoneyField(input) {
    const signed = input.hasAttribute('data-signed');
    const raw = enDigits(input.value);
    const negative = signed && /^\s*[-−–‐]/.test(raw);
    const caret = input.selectionStart ?? raw.length;
    const digitsBefore = raw.slice(0, caret).replace(/\D/g, '').length;
    const digits = raw.replace(/\D/g, '').replace(/^0+(?=\d)/, '').slice(0, 14);
    let formatted = localDigits(digits.replace(/\B(?=(\d{3})+(?!\d))/g, groupSeparator()));
    if (negative) formatted = `−${formatted}`;
    if (input.value !== formatted) {
      input.value = formatted;
      let position = negative ? 1 : 0;
      let seen = 0;
      if (digitsBefore > 0) {
        position = formatted.length;
        for (let index = 0; index < formatted.length; index += 1) {
          if (/[۰-۹\d]/.test(formatted[index])) seen += 1;
          if (seen === digitsBefore) { position = index + 1; break; }
        }
      }
      try { input.setSelectionRange(position, position); } catch { /* برخی کیبوردها اجازه نمی‌دهند */ }
    }
    updateMoneyWords(input);
    updateLcd(input);
  }

  function updateDatePreview(input) {
    const target = input.closest('.field')?.querySelector('.date-preview');
    if (!target) return;
    const text = input.value.trim();
    const iso = parseJalaliDate(text);
    target.classList.toggle('error', Boolean(text) && !iso);
    target.textContent = !text ? '' : iso ? jalaliWeekdayLabel(iso, true) : t('تاریخ معتبر نیست');
  }

  function formatDateField(input) {
    const raw = enDigits(input.value);
    const parts = raw.split(/[\/.\-٫،\\]/);
    // اگر کاربر خودش با جداکننده‌ای مثل «۱۴۰۵/۷/۵» نوشته باشد دست‌نخورده می‌ماند؛ در غیر این صورت اسلش‌ها خودکار گذاشته می‌شوند.
    const typedByHand = parts.length > 2 && parts.slice(1, -1).some(part => part.length !== 2);
    if (typedByHand) {
      const converted = localDigits(raw);
      if (converted !== input.value) input.value = converted;
    } else {
      const digits = raw.replace(/\D/g, '').slice(0, 8);
      let formatted = digits;
      if (digits.length > 4) formatted = `${digits.slice(0, 4)}/${digits.slice(4, 6)}`;
      if (digits.length > 6) formatted += `/${digits.slice(6)}`;
      formatted = localDigits(formatted);
      if (input.value !== formatted) input.value = formatted;
    }
    updateDatePreview(input);
  }

  function refreshInputs(root) {
    root.querySelectorAll('[data-money]').forEach(input => { updateMoneyWords(input); updateLcd(input); });
    root.querySelectorAll('[data-date]').forEach(updateDatePreview);
  }

  function dateField(name, label, iso, { chipSet = 'past', optional = false, placeholder = '' } = {}) {
    const hint = placeholder || jalaliInput(localISO());
    const chipButton = (text, attributes) => `<button type="button" class="chip-button" data-date-chip="${name}" ${attributes}>${text}</button>`;
    let quick = '';
    if (chipSet === 'past') quick = chipButton(t('امروز'), 'data-days="0"') + chipButton(t('دیروز'), 'data-days="-1"') + chipButton(t('پریروز'), 'data-days="-2"');
    else if (chipSet === 'future') quick = chipButton(t('امروز'), 'data-days="0"') + chipButton(t('فردا'), 'data-days="1"') + chipButton(t('یک هفته بعد'), 'data-add-days="7"') + chipButton(t('یک ماه بعد'), 'data-months="1"');
    return `<div class="field"><label for="f-${name}">${esc(label)}</label><input id="f-${name}" name="${name}" data-date inputmode="numeric" dir="ltr" autocomplete="off" value="${iso ? jalaliInput(iso) : ''}" placeholder="${esc(hint)}" ${optional ? '' : 'required'}><div class="date-preview" aria-live="polite"></div>${quick ? `<div class="date-chips">${quick}</div>` : ''}</div>`;
  }

  function moneyField(name, label, value, { autofocus = false, required = true, placeholder = '', big = false } = {}) {
    return `<div class="field ${big ? 'big' : ''}"><label for="f-${name}">${esc(label)}</label>${big ? `<div class="lcd lcd-live" aria-hidden="true">${segMoney(Number(value) > 0 ? Number(value) : 0, { pad: 9 })}</div>` : ''}<input id="f-${name}" name="${name}" inputmode="numeric" autocomplete="off" data-money ${autofocus ? 'data-autofocus' : ''} ${required ? 'required' : ''} placeholder="${esc(placeholder || (big ? localDigits('0') : ''))}" value="${value === undefined || value === null || value === '' ? '' : localMoney(value)}"><div class="money-words" aria-live="polite"></div></div>`;
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
    captureDraft(input);
  }

  /* ---------- تأیید ---------- */

  function askConfirm({ title = t('تأیید'), message, okLabel = t('تأیید'), danger = false }) {
    return new Promise(resolve => {
      const box = $('#confirmBox');
      lastFocus = document.activeElement;
      box.innerHTML = `<h2 id="confirmTitle">${esc(title)}</h2><p>${esc(message)}</p><div class="form-actions"><button class="button" type="button" data-confirm="no">${t('انصراف')}</button><button class="button ${danger ? 'danger-solid' : 'primary'}" type="button" data-confirm="yes">${esc(okLabel)}</button></div>`;
      const dialog = $('#confirmModal');
      const finish = value => {
        dialog.classList.remove('open');
        dialog.setAttribute('aria-hidden', 'true');
        document.documentElement.classList.remove('modal-open');
        box.innerHTML = '';
        confirmResolver = null;
        if (lastFocus?.isConnected) lastFocus.focus({ preventScroll: true });
        resolve(value);
      };
      confirmResolver = finish;
      dialog.classList.add('open');
      dialog.setAttribute('aria-hidden', 'false');
      document.documentElement.classList.add('modal-open');
      setTimeout(() => box.querySelector('[data-confirm="no"]')?.focus({ preventScroll: true }), 30);
    });
  }

  /* ---------- کارهای حذف، پشتیبان و ... ---------- */

  function deleteTransaction(id) {
    if (!state.transactions.some(item => item.id === id)) return;
    try { withUndo(t('تراکنش حذف شد'), draft => removeTransactionDraft(draft, id)); } catch { toast(t('حذف انجام نشد')); return; }
    ui.expanded = '';
    render();
  }

  async function deleteObligation(store, id) {
    if (!['installments', 'debts'].includes(store)) return;
    const ok = await askConfirm({ title: t('حذف شود؟'), message: t('تراکنش‌های قبلیِ مربوط به آن باقی می‌مانند و فقط ارتباطشان با این مورد قطع می‌شود.'), okLabel: t('حذف'), danger: true });
    if (!ok) return;
    try {
      withUndo(t('مورد حذف شد'), draft => {
        draft[store] = draft[store].filter(item => item.id !== id);
        draft.transactions.forEach(transaction => { if (transaction.source?.id === id) transaction.source = null; });
      });
    } catch { toast(t('حذف انجام نشد')); return; }
    ui.paying = '';
    render();
  }

  function updateNote(id, change, message) {
    try { commit(draft => { const note = draft.notes.find(item => item.id === id); if (note) change(note); }); render(); if (message) toast(message); } catch { toast(t('ذخیره انجام نشد')); }
  }

  async function deleteRecurring(id) {
    const ok = await askConfirm({ title: t('حذف مورد تکراری'), message: t('تراکنش‌هایی که قبلاً ساخته شده‌اند باقی می‌مانند؛ فقط از این به بعد ساخته نمی‌شوند.'), okLabel: t('حذف'), danger: true });
    if (!ok) return;
    try { commit(draft => { draft.recurring = draft.recurring.filter(item => item.id !== id); }); render(); toast(t('حذف شد')); } catch { toast(t('حذف انجام نشد')); }
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
      if (!silent) { render(); toast(t('{v1} تراکنش تکراری ثبت شد', { v1: number(created), c: created })); }
      return created;
    } catch (error) { console.error(error); return 0; }
  }

  /* ---------- نسخهٔ خودکار داخل مرورگر (IndexedDB) ---------- */

  const MIRROR_DB = 'ORBIT_MIRROR';
  const MIRROR_DAYS = 7;
  let mirrorTimer = 0;
  let mirrorPending = null;

  function mirrorOpen() {
    return new Promise((resolve, reject) => {
      if (!globalThis.indexedDB) { reject(new Error('no idb')); return; }
      const request = indexedDB.open(MIRROR_DB, 1);
      request.onupgradeneeded = () => request.result.createObjectStore('snaps', { keyPath: 'key' });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  function mirrorTx(mode, work) {
    return mirrorOpen().then(db => new Promise((resolve, reject) => {
      const tx = db.transaction('snaps', mode);
      const result = work(tx.objectStore('snaps'));
      tx.oncomplete = () => { db.close(); resolve(result?.result); };
      tx.onerror = tx.onabort = () => { db.close(); reject(tx.error); };
    }));
  }

  const hasContent = source => Boolean(source && (source.transactions?.length || source.installments?.length || source.debts?.length || source.notes?.length || source.goals?.length));

  function mirrorSchedule(nextState) {
    if (!hasContent(nextState)) return;
    mirrorPending = JSON.stringify(nextState);
    clearTimeout(mirrorTimer);
    mirrorTimer = setTimeout(mirrorFlush, 1500);
  }

  async function mirrorFlush() {
    const json = mirrorPending;
    mirrorPending = null;
    if (!json) return;
    try {
      const at = new Date().toISOString();
      await mirrorTx('readwrite', store => { store.put({ key: `day:${localISO()}`, at, json }); });
      const all = await mirrorList();
      const stale = all.filter(item => item.key.startsWith('day:')).slice(MIRROR_DAYS);
      if (stale.length) await mirrorTx('readwrite', store => { stale.forEach(item => store.delete(item.key)); });
    } catch (error) { console.warn('ORBIT mirror failed', error); }
  }

  async function mirrorList() {
    const all = (await mirrorTx('readonly', store => store.getAll())) || [];
    return all.filter(item => item && typeof item.key === 'string' && typeof item.json === 'string').sort((a, b) => b.key.localeCompare(a.key));
  }

  function copySummary(item) {
    try {
      const parsed = JSON.parse(item.json);
      return t('{v1} تراکنش، {v2} قسط، {v3} بدهی/طلب', { v1: number(parsed.transactions?.length || 0), v2: number(parsed.installments?.length || 0), v3: number(parsed.debts?.length || 0) });
    } catch { return ''; }
  }

  async function fillAutoCopies() {
    const box = $('#autoCopies');
    if (!box) return;
    let items = [];
    try { items = await mirrorList(); } catch { box.innerHTML = `<div class="sub">${t('ذخیرهٔ خودکار در این مرورگر در دسترس نیست.')}</div>`; return; }
    if (!$('#autoCopies')) return;
    box.innerHTML = items.length ? `<div class="list">${items.map(item => `<div class="row copy-row"><div class="grow"><div class="title">${esc(jalaliDateLabel(localISO(item.at)))}</div><div class="sub">${esc(copySummary(item))}</div></div><button class="button small" type="button" data-action="restore-copy" data-key="${esc(item.key)}">${t('بازیابی')}</button></div>`).join('')}</div>` : `<div class="sub">${t('هنوز نسخهٔ خودکاری ساخته نشده؛ بعد از ثبت اولین اطلاعات ساخته می‌شود.')}</div>`;
  }

  async function restoreCopy(key, confirmed = false) {
    let record = null;
    try { record = (await mirrorList()).find(item => item.key === key); } catch { /* ignore */ }
    if (!record) return toast(t('نسخه پیدا نشد'));
    try {
      const imported = normalizeState(JSON.parse(record.json));
      imported.settings.theme = state.settings.theme;
      if (imported.settings.language !== LANG) migrateCalendarDraft(imported, imported.settings.language, LANG);
      const ok = confirmed || await askConfirm({ title: t('بازیابی نسخهٔ خودکار'), message: t('نسخهٔ {v1} ({v2}) جایگزین اطلاعات فعلی می‌شود.', { v1: jalaliDateLabel(localISO(record.at)), v2: copySummary(record) }), okLabel: t('بازیابی'), danger: true });
      if (!ok) return;
      stashPrevious();
      saveState(imported);
      state = imported;
      revision += 1;
      banners.data = '';
      render(); toast(t('اطلاعات بازیابی شد'));
    } catch (error) { console.error(error); toast(t('بازیابی انجام نشد')); }
  }

  /** اگر حافظهٔ اصلی خالی شده ولی نسخهٔ خودکار هست، پیشنهاد بازیابی می‌دهد. */
  async function offerAutoRecovery() {
    if (hasSavedData() && !banners.data) return;
    let items = [];
    try { items = await mirrorList(); } catch { return; }
    const record = items.find(item => { try { return hasContent(JSON.parse(item.json)); } catch { return false; } });
    if (!record) return;
    const ok = await askConfirm({ title: t('نسخهٔ خودکار پیدا شد'), message: t('اطلاعات اصلی خالی است ولی یک نسخهٔ خودکار از {v1} هست ({v2}). بازیابی شود؟', { v1: jalaliDateLabel(localISO(record.at)), v2: copySummary(record) }), okLabel: t('بازیابی') });
    if (ok) await restoreCopy(record.key, true);
  }

  function markBackupDone() {
    try { commit(draft => { draft.settings.lastBackup = new Date().toISOString(); }); render(); } catch { /* مهم نیست */ }
  }

  function downloadBlob(json, name, type = 'application/json') {
    const url = URL.createObjectURL(new Blob([json], { type }));
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  /* ---------- خروجی CSV ---------- */

  function csvCell(value, raw = false) {
    let text = String(value ?? '');
    if (!raw && /^[=+\-@\t\r]/.test(text)) text = `'${text}`;
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  }

  function transactionsCsv(rows) {
    const header = [t('تاریخ میلادی'), t('تاریخ شمسی'), t('نوع'), t('مبلغ'), t('دسته'), t('عنوان'), t('توضیح'), t('در موجودی حساب شد')].map(value => csvCell(value));
    const lines = [...rows].sort((a, b) => a.date.localeCompare(b.date) || String(a.createdAt).localeCompare(String(b.createdAt))).map(item => {
      const p = persianParts(item.date);
      return [item.date, `${p.jy}/${pad2(p.jm)}/${pad2(p.jd)}`, item.type === 'income' ? t('درآمد') : t('خرج'), Math.round(Number(item.amount) || 0), catName(item.category || ''), displayText(item.title || ''), displayText(item.note || ''), isCounted(item) ? t('بله') : t('خیر')]
        .map((value, index) => csvCell(value, index < 4 && index !== 2));
    });
    return `\ufeff${[header.join(','), ...lines.map(line => line.join(','))].join('\r\n')}\r\n`;
  }

  /** فایل را روی گوشی با برگهٔ اشتراک‌گذاری و در جاهای دیگر با دانلود تحویل می‌دهد. */
  async function deliverFile(content, name, mime, title) {
    try {
      const file = typeof File === 'function' ? new File([content], name, { type: mime }) : null;
      const touch = globalThis.matchMedia?.('(pointer: coarse)').matches;
      if (file && touch && navigator.canShare?.({ files: [file] })) {
        try { await navigator.share({ files: [file], title }); return true; } catch (error) { if (error?.name === 'AbortError') return false; }
      }
    } catch (error) { console.warn('ORBIT share unavailable', error); }
    downloadBlob(content, name, mime);
    return true;
  }

  async function exportCsv(scope) {
    const rows = scope === 'month' ? monthTransactions(jalaliMonthKey(cursor)) : state.transactions;
    if (!rows.length) return toast(t('تراکنشی برای خروجی نیست'));
    const stamp = scope === 'month' ? jalaliMonthKey(cursor) : localISO();
    if (await deliverFile(transactionsCsv(rows), `orbit-transactions-${stamp}.csv`, 'text/csv;charset=utf-8', t('تراکنش‌های ORBIT'))) toast(t('فایل CSV آماده شد'));
  }

  const voiceAsDataUrl = blob => new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => reject(reader.error); reader.readAsDataURL(blob); });
  async function exportData() {
    const voices = {};
    for (const note of state.notes.filter(item => item.voice)) {
      const clip = await voiceGet(note.id);
      if (clip) voices[note.id] = await voiceAsDataUrl(clip);
    }
    const json = JSON.stringify({ schemaVersion: 5, appVersion: APP_VERSION, exportedAt: new Date().toISOString(), data: state, voices }, null, 2);
    const name = `orbit-finance-${localISO()}.json`;
    try {
      const file = typeof File === 'function' ? new File([json], name, { type: 'application/json' }) : null;
      const touch = globalThis.matchMedia?.('(pointer: coarse)').matches;
      if (file && touch && navigator.canShare?.({ files: [file] })) {
        navigator.share({ files: [file], title: t('پشتیبان ORBIT') })
          .then(() => { markBackupDone(); toast(t('پشتیبان آماده شد')); })
          .catch(error => { if (error?.name !== 'AbortError') { downloadBlob(json, name); markBackupDone(); } });
        return;
      }
    } catch (error) { console.warn('ORBIT share unavailable', error); }
    downloadBlob(json, name);
    markBackupDone();
    toast(t('فایل پشتیبان آماده شد'));
  }

  async function importData(file) {
    const input = $('#importInput');
    try {
      if (!file) return;
      if (file.size > 100 * 1024 * 1024) throw new Error('File too large');
      const parsed = JSON.parse(await file.text());
      const payload = parsed?.data && typeof parsed.data === 'object' ? parsed.data : parsed;
      if (!payload || typeof payload !== 'object' || !['transactions', 'debts', 'installments', 'notes', 'goals'].some(key => Array.isArray(payload[key]))) throw new Error('Invalid backup');
      const stats = { dropped: 0 };
      const imported = normalizeState(payload, stats);
      imported.settings.theme = state.settings.theme;
      imported.settings.crt = state.settings.crt;
      if (imported.settings.language !== LANG) migrateCalendarDraft(imported, imported.settings.language, LANG);
      const summary = t('{v1} تراکنش، {v2} قسط، {v3} بدهی/طلب و {v4} یادداشت{v5}.', { v1: number(imported.transactions.length), v2: number(imported.installments.length), v3: number(imported.debts.length), v4: number(imported.notes.length), v5: stats.dropped ? t('؛ {v1} رکورد نامعتبر نادیده گرفته می‌شود', { v1: number(stats.dropped) }) : '' });
      const ok = await askConfirm({ title: t('بازیابی پشتیبان'), message: t('فایل شامل {summary} اطلاعات فعلی با آن جایگزین می‌شود.', { summary }), okLabel: t('بازیابی'), danger: true });
      if (!ok) return;
      const voiceEntries = Object.entries(parsed.voices || {});
      for (const [id, encoded] of voiceEntries) {
        if (!imported.notes.some(note => note.id === id && note.voice) || typeof encoded !== 'string' || !/^data:audio\/[\w.+-]+;base64,/.test(encoded)) continue;
        const blob = await (await fetch(encoded)).blob();
        await voicePut(id, blob);
      }
      stashPrevious();
      saveState(imported);
      state = imported;
      revision += 1;
      banners.data = '';
      render(); toast(t('اطلاعات پشتیبان بازیابی شد'));
    } catch (error) {
      console.error(error); toast(t('فایل پشتیبان معتبر نیست'));
    } finally {
      if (input) input.value = '';
    }
  }

  async function restorePrevious() {
    let previous = null;
    try { previous = normalizeState(JSON.parse(localStorage.getItem(BACKUP_KEY))); } catch { toast(t('نسخهٔ قبلی قابل خواندن نیست')); return; }
    if (previous.settings.language !== LANG) migrateCalendarDraft(previous, previous.settings.language, LANG);
    const ok = await askConfirm({ title: t('بازگرداندن نسخهٔ قبلی'), message: t('{v1} تراکنش و {v2} قسط و بدهی برگردانده می‌شود و اطلاعات فعلی جایگزین می‌شود.', { v1: number(previous.transactions.length), v2: number(previous.installments.length + previous.debts.length) }), okLabel: t('بازگردان') });
    if (!ok) return;
    const current = clone(state);
    try {
      saveState(previous); state = previous; revision += 1;
      try { localStorage.setItem(BACKUP_KEY, JSON.stringify(current)); } catch { /* ignore */ }
      render(); toast(t('نسخهٔ قبلی برگردانده شد'));
    } catch { toast(t('بازگردانی انجام نشد')); }
  }

  async function clearAllData() {
    const ok = await askConfirm({ title: t('پاک کردن همهٔ اطلاعات'), message: t('همهٔ تراکنش‌ها، اقساط، بدهی‌ها، بودجه‌ها و یادداشت‌ها پاک می‌شوند. اگر فایل پشتیبان نداری، قابل برگشت نیست.'), okLabel: t('پاک کن'), danger: true });
    if (!ok) return;
    const fresh = defaultState();
    fresh.settings.theme = state.settings.theme;
    fresh.settings.crt = state.settings.crt;
    fresh.settings.currency = state.settings.currency;
    fresh.settings.language = state.settings.language;
    stashPrevious();
    try {
      saveState(fresh); state = fresh; revision += 1; await voiceClear().catch(console.warn); location.hash = '/'; render(); toast(t('همهٔ اطلاعات پاک شد'));
    } catch (error) {
      console.error(error); toast(t('پاک‌سازی انجام نشد'));
    }
  }

  function toggleTheme() {
    try {
      commit(draft => { draft.settings.theme = draft.settings.theme === 'dark' ? 'light' : 'dark'; });
      applyTheme(); render();
    } catch (error) {
      console.error(error); toast(t('تغییر تم ذخیره نشد'));
    }
  }

  /* ---------- زبان و تقویم ---------- */

  /** زبان فعلی را روی صفحه (جهت، عنوان، متن‌های ثابت HTML) اعمال می‌کند. */
  function syncLanguage() {
    LANG = state.settings.language === 'en' ? 'en' : 'fa';
    const root = document.documentElement;
    root.lang = LANG;
    root.dir = isEn() ? 'ltr' : 'rtl';
    document.title = t('ORBIT — مدیریت مالی شخصی');
    document.querySelector('meta[name="description"]')?.setAttribute('content', t('مدیریت شخصی درآمد، خرج، بودجه، قسط و بدهی با تقویم شمسی'));
    document.querySelectorAll('[data-t]').forEach(element => { element.textContent = t(element.dataset.t); });
    document.querySelectorAll('[data-t-aria]').forEach(element => { element.setAttribute('aria-label', t(element.dataset.tAria)); });
    const toggle = $('#langToggle');
    if (toggle) {
      toggle.textContent = isEn() ? 'فا' : 'EN';
      const label = t(isEn() ? 'تغییر زبان به فارسی' : 'تغییر زبان به انگلیسی');
      toggle.setAttribute('aria-label', label);
      toggle.title = label;
    }
  }

  /** انیمیشن روشن‌شدن مانیتور (خط نورانی که باز می‌شود). */
  function crtBoot() {
    const shell = document.querySelector('.app-shell');
    if (!shell || state.settings.crt === 'off' || globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    shell.classList.remove('crt-boot');
    void shell.offsetWidth;
    shell.classList.add('crt-boot');
    shell.addEventListener('animationend', () => shell.classList.remove('crt-boot'), { once: true });
  }

  /** پرش کوتاه تصویر هنگام عوض‌شدن صفحه (فقط در حالت «شدید»). */
  function crtSwitch() {
    const main = document.querySelector('.main');
    if (!main || state.settings.crt !== 'full') return;
    main.classList.remove('crt-switch');
    void main.offsetWidth;
    main.classList.add('crt-switch');
    main.addEventListener('animationend', () => main.classList.remove('crt-switch'), { once: true });
  }

  function switchLanguage(next) {
    next = next === 'en' ? 'en' : 'fa';
    if (next === LANG) return;
    const from = LANG;
    try { commit(draft => migrateCalendarDraft(draft, from, next)); } catch (error) { console.error(error); toast(t('ذخیره انجام نشد')); return; }
    Object.keys(drafts).forEach(key => { delete drafts[key]; });
    Object.assign(ui, { expanded: '', paying: '', category: '', recurring: '', preset: null });
    transactionQuery = '';
    cursor = new Date();
    syncLanguage();
    runRecurring(true);
    render();
    toast(t(next === 'en' ? 'زبان انگلیسی و تقویم میلادی فعال شد' : 'زبان فارسی و تقویم شمسی فعال شد'));
  }

  /* ---------- رسید سررسید ماه (خروجی PNG / JPG / PDF) ---------- */

  const RC_KEY = 'orbit_receipt_prefs_v1';
  const RC_GROUPS = ['overdue', 'installment', 'owe', 'recv', 'recurring', 'note'];
  const RC_LABEL = { overdue: 'معوق‌های قبلی', installment: 'اقساط', owe: 'بدهی‌ها', recv: 'طلب‌ها', recurring: 'تکرار ماهانه', note: 'یادآوری‌ها' };
  const RC_PAL = { paper: '#f6f3e6', ink: '#1a2412', muted: '#6d7660', line: '#a9b096', lit: '#b9e08f', screen: '#070807', accent: '#d6400f', green: '#2f6a1c', red: '#b3260f' };
  const RC_FONT = '"LOG", "GOL", "Vazirmatn", "Vazir", Tahoma, system-ui, sans-serif';
  const RC_W = 380, RC_M = 0, RC_TOP = 30;
  const rc = { loaded: false, groupOn: {}, opts: { summary: true, meta: true, barcode: true, paid: false }, owner: '', footer: undefined, fmt: 'png', off: new Set(), expanded: new Set(), month: '', entries: [], timer: 0, url: '', fonts: null };

  function rcLoadPrefs() {
    if (rc.loaded) return;
    rc.loaded = true;
    try {
      const saved = JSON.parse(localStorage.getItem(RC_KEY) || 'null') || {};
      if (saved.groupOn && typeof saved.groupOn === 'object') rc.groupOn = saved.groupOn;
      if (saved.opts && typeof saved.opts === 'object') rc.opts = { ...rc.opts, ...saved.opts };
      if (typeof saved.owner === 'string') rc.owner = saved.owner.slice(0, 40);
      if (typeof saved.footer === 'string') rc.footer = saved.footer.slice(0, 120);
      if (['png', 'jpg', 'pdf'].includes(saved.fmt)) rc.fmt = saved.fmt;
    } catch { /* ignore */ }
  }
  function rcSavePrefs() {
    try { localStorage.setItem(RC_KEY, JSON.stringify({ groupOn: rc.groupOn, opts: rc.opts, owner: rc.owner, footer: rc.footer, fmt: rc.fmt })); } catch { /* ignore */ }
  }

  function rcDateShort(iso) {
    const p = jalaliParts(iso);
    return isEn() ? `${monthNames()[p.jm - 1].slice(0, 3)} ${p.jd}` : `${localDigits(p.jd)} ${monthNames()[p.jm - 1]}`;
  }
  function rcDateLong(iso) {
    const p = jalaliParts(iso);
    return isEn() ? `${monthNames()[p.jm - 1].slice(0, 3)} ${p.jd}, ${p.jy}` : `${localDigits(p.jd)} ${monthNames()[p.jm - 1]} ${localDigits(p.jy)}`;
  }

  /** موارد سررسیددار ماهِ انتخاب‌شده (cursor): اقساط (با پیش‌بینی ماه‌های بعد)، بدهی/طلب، تکراری‌ها و یادآوری‌ها. */
  function rcBuildEntries() {
    const parts = jalaliParts(cursor);
    const year = parts.jy, month = parts.jm, key = monthKeyOf(year, month);
    const first = jalaliToISO(year, month, 1), last = jalaliToISO(year, month, jalaliMonthLength(year, month));
    const today = localISO();
    const carry = today >= first && today <= last;
    const inMonth = iso => iso >= first && iso <= last;
    const out = [];

    state.installments.forEach(item => {
      const amount = Number(item.amount) || 0, count = Number(item.count) || 0, paid = Number(item.paidCount) || 0;
      if (!amount || paid >= count || !isValidISO(item.nextDueDate)) return;
      const day = Number(item.dueDay) || jalaliParts(item.nextDueDate).jd;
      for (let k = 0; k < count - paid && k < 600; k += 1) {
        const due = k === 0 ? item.nextDueDate : changeJalaliMonth(item.nextDueDate, k, day);
        if (!due || due > last) break;
        const base = { id: `i${item.id}_${k}`, title: displayText(item.title), detail: t('قسط {a} از {b}', { a: number(paid + k + 1), b: number(count) }), amount, date: due, incoming: false };
        if (inMonth(due)) out.push({ ...base, group: 'installment', status: due < today ? 'overdue' : 'pending' });
        else if (due < first && carry && due < today) out.push({ ...base, group: 'overdue', status: 'overdue' });
      }
    });
    state.transactions.forEach(tx => {
      const source = tx.source;
      if (source?.kind === 'installment' && isValidISO(source.prevDue) && inMonth(source.prevDue)) {
        out.push({ id: `p${tx.id}`, group: 'installment', title: displayText(String(tx.title || '').replace(/^قسط: /, '')), detail: displayText(tx.note || ''), amount: Number(tx.amount) || 0, date: source.prevDue, incoming: false, status: 'paid' });
      }
    });
    state.debts.forEach(item => {
      if (!isValidISO(item.dueDate)) return;
      const owe = item.direction !== 'receivable';
      const remaining = Number(item.remaining) || 0, total = Number(item.total) || 0;
      const base = { id: `d${item.id}`, title: displayText(item.title), detail: [item.person, owe ? t('بدهی من') : t('طلب من')].filter(Boolean).join(' · '), date: item.dueDate, incoming: !owe };
      if (item.status === 'done' || remaining <= 0) {
        if (inMonth(item.dueDate) && total) out.push({ ...base, group: owe ? 'owe' : 'recv', amount: total, status: 'paid' });
        return;
      }
      if (inMonth(item.dueDate)) out.push({ ...base, group: owe ? 'owe' : 'recv', amount: remaining, status: item.dueDate < today ? 'overdue' : 'pending' });
      else if (item.dueDate < first && carry && item.dueDate < today) out.push({ ...base, group: 'overdue', amount: remaining, status: 'overdue' });
    });
    state.recurring.forEach(rule => {
      const amount = Number(rule.amount) || 0, day = Number(rule.day) || 0;
      if (!amount || !(day >= 1 && day <= 31) || String(rule.startMonth) > key) return;
      const date = jalaliToISO(year, month, Math.min(day, jalaliMonthLength(year, month)));
      if (!date) return;
      out.push({ id: `r${rule.id}`, group: 'recurring', title: displayText(rule.title), detail: t('تکرار ماهانه'), amount, date, incoming: rule.type === 'income', status: (rule.doneMonths || []).includes(key) ? 'paid' : 'pending' });
    });
    state.notes.forEach(note => {
      if (!isValidISO(note.date) || !inMonth(note.date) || !note.text) return;
      out.push({ id: `n${note.id}`, group: 'note', title: String(note.text), detail: '', amount: 0, date: note.date, incoming: false, status: note.done ? 'paid' : (note.date < today ? 'overdue' : 'pending') });
    });
    return out.sort((a, b) => RC_GROUPS.indexOf(a.group) - RC_GROUPS.indexOf(b.group) || a.date.localeCompare(b.date) || String(a.title).localeCompare(String(b.title)));
  }

  const rcVisible = () => rc.entries.filter(entry => rc.opts.paid || entry.status !== 'paid');
  const rcSelected = () => rcVisible().filter(entry => rc.groupOn[entry.group] !== false && !rc.off.has(entry.id));

  function rcData() {
    const selected = rcSelected();
    const groups = RC_GROUPS.map(key => ({ key, label: t(RC_LABEL[key]), items: selected.filter(entry => entry.group === key) })).filter(group => group.items.length);
    const open = selected.filter(entry => entry.status !== 'paid' && entry.amount);
    const sum = test => open.filter(test).reduce((total, entry) => total + entry.amount, 0);
    const parts = jalaliParts(cursor);
    return {
      groups, count: selected.length, parts,
      payable: sum(entry => !entry.incoming), receivable: sum(entry => entry.incoming), overdue: sum(entry => !entry.incoming && entry.status === 'overdue'),
      month: jalaliMonthLabel(cursor), today: localISO(), owner: rc.owner.trim(),
      footer: rc.footer === undefined ? t('ممنون که حواست به سررسیدهاست') : rc.footer.trim(),
      no: localDigits(`${pad2(parts.jy % 100)}${pad2(parts.jm)}-${String(selected.length).padStart(3, '0')}`),
      seed: `${monthKeyOf(parts.jy, parts.jm)}|${selected.map(entry => entry.id).join(',')}`
    };
  }

  /* ---- رسم روی بوم ---- */

  function rcRoundRect(ctx, x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
  }
  function rcRandom(seedText) {
    let h = 1779033703 ^ seedText.length;
    for (let i = 0; i < seedText.length; i += 1) { h = Math.imul(h ^ seedText.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
    let a = h >>> 0;
    return () => { a = (a + 0x6D2B79F5) | 0; let x = Math.imul(a ^ (a >>> 15), 1 | a); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
  }
  /** محتوای رسید را از Y0 می‌کشد و مختصات پایان را برمی‌گرداند (با بوم آزمایشی برای اندازه‌گیری هم استفاده می‌شود). */
  function rcDraw(ctx, d, Y0) {
    const rtl = !isEn();
    const x0 = RC_M, x1 = RC_W - RC_M, pad = 24, Lx = x0 + pad, Rx = x1 - pad, IW = Rx - Lx, CX = RC_W / 2;
    const sX = rtl ? Rx : Lx, eX = rtl ? Lx : Rx, sA = rtl ? 'right' : 'left', eA = rtl ? 'left' : 'right';
    const at = o => (rtl ? Rx - o : Lx + o);
    const up = s => (isEn() ? String(s).toUpperCase() : s);
    ctx.direction = rtl ? 'rtl' : 'ltr';
    const setFont = (size, weight, spacing) => { ctx.font = `${weight} ${size}px ${RC_FONT}`; if ('letterSpacing' in ctx) ctx.letterSpacing = `${spacing || 0}px`; };
    const width = (s, size, weight, spacing) => { setFont(size, weight, spacing); return ctx.measureText(s).width; };
    const text = (s, x, y, size, weight, color, align, spacing) => { setFont(size, weight, spacing); ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'alphabetic'; ctx.fillText(s, x, y); };
    const fit = (s, maxW, size, weight) => {
      s = String(s); if (width(s, size, weight) <= maxW) return s;
      while (s.length > 1 && width(`${s}…`, size, weight) > maxW) s = s.slice(0, -1);
      return `${s.trimEnd()}…`;
    };
    const wrap = (s, maxW, size, weight, maxLines) => {
      const lines = []; let line = '';
      String(s).split(/\s+/).filter(Boolean).forEach(word => {
        const next = line ? `${line} ${word}` : word;
        if (!line || width(next, size, weight) <= maxW) line = next; else { lines.push(line); line = word; }
      });
      if (line) lines.push(line);
      if (lines.length > maxLines) { lines.length = maxLines; lines[maxLines - 1] += '…'; }
      return lines.map(value => fit(value, maxW, size, weight));
    };
    const dash = y => { ctx.save(); ctx.setLineDash([4, 4]); ctx.strokeStyle = RC_PAL.line; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(Lx, y); ctx.lineTo(Rx, y); ctx.stroke(); ctx.restore(); };
    const pair = (label, value, y, o = {}) => {
      const vs = o.size || 12.5, vw = o.weight || 800;
      text(label, sX, y, 11.5, 500, o.labelColor || RC_PAL.muted, sA);
      text(value, eX, y, vs, vw, o.color || RC_PAL.ink, eA);
      const a = width(label, 11.5, 500), b = width(value, vs, vw);
      const g1 = rtl ? Rx - a - 6 : Lx + a + 6, g2 = rtl ? Lx + b + 6 : Rx - b - 6;
      if (Math.abs(g2 - g1) > 14) { ctx.save(); ctx.setLineDash([1.5, 3]); ctx.strokeStyle = RC_PAL.line; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(g1, y - 3); ctx.lineTo(g2, y - 3); ctx.stroke(); ctx.restore(); }
    };
    const statusText = entry => (entry.status === 'paid' ? t('انجام شد') : dueLabel(entry.date));

    const solid = (y, w) => { ctx.save(); ctx.strokeStyle = RC_PAL.ink; ctx.lineWidth = w || 1.4; ctx.beginPath(); ctx.moveTo(Lx, y); ctx.lineTo(Rx, y); ctx.stroke(); ctx.restore(); };
    const AMT = 92, oDate = IW - AMT - 54, oTitle = 16;
    let y = Y0;
    y += 12; text('ORBIT', CX, y, 11, 800, RC_PAL.muted, 'center', 5);
    y += 36; text(up(t('رسید سررسید')), CX, y, 27, 800, RC_PAL.ink, 'center', rtl ? 0 : 2);
    y += 34;
    const meta = [d.month];
    if (rc.opts.meta) meta.push(`${t('شمارهٔ رسید')}: ${d.no}`, rcDateLong(d.today));
    if (d.owner) meta.push(d.owner);
    meta.forEach((line, index) => { text(up(line), CX, y, index ? 12.5 : 14, index ? 500 : 700, index ? RC_PAL.muted : RC_PAL.ink, 'center'); y += 23; });
    y += 4; dash(y); y += 24;
    text(up(t('شرح')), at(oTitle), y, 11, 800, RC_PAL.ink, sA, rtl ? 0 : 1);
    text(up(t('سررسید')), at(oDate), y, 11, 800, RC_PAL.ink, sA, rtl ? 0 : 1);
    text(up(`${t('مبلغ')}`), eX, y, 11, 800, RC_PAL.ink, eA, rtl ? 0 : 1);
    y += 12; dash(y);

    if (!d.groups.length) { y += 48; text(t('موردی برای چاپ انتخاب نشده'), CX, y, 13, 600, RC_PAL.muted, 'center'); y += 14; }
    d.groups.forEach(group => {
      y += 30;
      text(up(group.label), sX, y, 12.5, 800, group.key === 'overdue' ? RC_PAL.red : RC_PAL.ink, sA, rtl ? 0 : 1);
      text(localDigits(group.items.length), eX, y, 12, 600, RC_PAL.muted, eA);
      y += 6;
      group.items.forEach(entry => {
        const paid = entry.status === 'paid', over = entry.status === 'overdue';
        const amountText = entry.amount ? `${entry.incoming ? '+' : ''}${localMoney(entry.amount)}` : '';
        const lines = wrap(entry.title || '—', oDate - oTitle - 10, 13.5, 600, entry.amount ? 2 : 4);
        const b1 = y + 22;
        ctx.beginPath(); ctx.arc(at(4), b1 - 4.5, 4, 0, 7);
        if (paid) { ctx.lineWidth = 1.4; ctx.strokeStyle = RC_PAL.muted; ctx.stroke(); }
        else { ctx.fillStyle = over ? RC_PAL.accent : entry.incoming ? '#4c9a26' : RC_PAL.ink; ctx.fill(); }
        lines.forEach((line, index) => text(line, at(oTitle), b1 + index * 18, 13.5, 600, paid ? RC_PAL.muted : RC_PAL.ink, sA));
        text(rcDateShort(entry.date), at(oDate), b1, 12.5, 500, paid ? RC_PAL.muted : RC_PAL.ink, sA);
        if (amountText) text(amountText, eX, b1, 13.5, 700, paid ? RC_PAL.muted : entry.incoming ? RC_PAL.green : over ? RC_PAL.red : RC_PAL.ink, eA);
        const status = paid ? t('انجام شد') : dueLabel(entry.date);
        const sub = [entry.detail, status].filter(Boolean).join(' — ');
        const b2 = b1 + (lines.length - 1) * 18 + 17;
        text(fit(sub, oDate - oTitle - 10, 10.5, 500), at(oTitle), b2, 10.5, 500, over ? RC_PAL.red : RC_PAL.muted, sA);
        y = b2 + 6;
      });
    });

    y += 18; dash(y); y += 26;
    if (rc.opts.summary && d.groups.length) {
      pair(t('تعداد موارد'), localDigits(d.count), y); y += 24;
      if (d.receivable > 0) { pair(t('جمع دریافتنی'), localMoney(d.receivable), y, { color: RC_PAL.green }); y += 24; }
      if (d.overdue > 0) { pair(t('جمع معوق'), localMoney(d.overdue), y, { color: RC_PAL.red, labelColor: RC_PAL.red }); y += 24; }
      y += 4; solid(y, 1.6); y += 38;
      text(up(t('جمع پرداختنی')), sX, y - 2, 13, 800, RC_PAL.ink, sA, rtl ? 0 : 1);
      text(localMoney(d.payable), eX, y, 28, 800, RC_PAL.ink, eA);
      y += 16; text(up(cur()), eX, y, 11, 500, RC_PAL.muted, eA, rtl ? 0 : 1);
      y += 14; solid(y, 1.6); y += 26;
    }
    if (d.footer) {
      y += 4;
      wrap(d.footer, IW - 20, 12.5, 600, 3).forEach(line => { text(line, CX, y, 12.5, 600, RC_PAL.ink, 'center'); y += 19; });
    }
    if (rc.opts.barcode) {
      y += 14;
      const random = rcRandom(d.seed), total = IW * .8; let x = CX - total / 2, on = true;
      ctx.fillStyle = RC_PAL.ink;
      while (x < CX + total / 2) { const w = 1 + Math.floor(random() * 3) + (random() > .85 ? 1 : 0); if (on) ctx.fillRect(x, y, Math.min(w, CX + total / 2 - x), 36); x += w; on = !on; }
      y += 36 + 14;
      text(String(Math.floor(random() * 1e9)).padStart(9, '0') + pad2(d.parts.jm) + pad2(d.parts.jy % 100), CX, y, 10, 500, RC_PAL.muted, 'center', 3);
      y += 6;
    }
    y += 22; text(`ORBIT · ${t('داده‌ها فقط روی دستگاه خودت می‌ماند')}`, CX, y, 9.5, 500, RC_PAL.muted, 'center');
    return y + 26;
  }

  function rcCanvas() {
    const d = rcData();
    const probe = document.createElement('canvas').getContext('2d');
    const bottom = rcDraw(probe, d, 30);
    const H = Math.ceil(bottom);
    const scale = Math.max(1, Math.min(3, Math.sqrt(14e6 / (RC_W * H))));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(RC_W * scale); canvas.height = Math.round(H * scale);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(canvas.width / RC_W, 0, 0, canvas.height / H, 0, 0);
    ctx.fillStyle = RC_PAL.paper; ctx.fillRect(0, 0, RC_W, H);
    rcDraw(ctx, d, 30);
    return canvas;
  }

  /* ---- خروجی‌ها ---- */

  const rcToBlob = (canvas, type, quality) => new Promise((resolve, reject) => canvas.toBlob(blob => (blob ? resolve(blob) : reject(new Error('blob'))), type, quality));

  /** PDF یک‌صفحه‌ای که فقط تصویر JPEG رسید را در خود دارد (بدون کتابخانه). */
  function rcMakePdf(jpeg, imageW, imageH) {
    const pw = 360, ph = Math.round(pw * imageH / imageW * 100) / 100;
    const encoder = new TextEncoder(), chunks = [], offsets = []; let length = 0;
    const push = value => { const bytes = typeof value === 'string' ? encoder.encode(value) : value; chunks.push(bytes); length += bytes.length; };
    push('%PDF-1.4\n%âãÏÓ\n');
    const object = (number, body) => { offsets[number] = length; push(`${number} 0 obj\n${body}\nendobj\n`); };
    object(1, '<< /Type /Catalog /Pages 2 0 R >>');
    object(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
    object(3, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pw} ${ph}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`);
    offsets[4] = length;
    push(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${imageW} /Height ${imageH} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`);
    push(jpeg); push('\nendstream\nendobj\n');
    const content = `q ${pw} 0 0 ${ph} 0 0 cm /Im0 Do Q`;
    object(5, `<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
    const xref = length; let table = 'xref\n0 6\n0000000000 65535 f \n';
    for (let i = 1; i <= 5; i += 1) table += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
    push(`${table}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
    const out = new Uint8Array(length); let position = 0;
    chunks.forEach(bytes => { out.set(bytes, position); position += bytes.length; });
    return out;
  }

  async function rcFile() {
    const canvas = rcCanvas();
    const base = `ORBIT-receipt-${rc.month}`;
    if (rc.fmt === 'png') return { blob: await rcToBlob(canvas, 'image/png'), name: `${base}.png`, type: 'image/png' };
    const jpeg = await rcToBlob(canvas, 'image/jpeg', 0.93);
    if (rc.fmt === 'jpg') return { blob: jpeg, name: `${base}.jpg`, type: 'image/jpeg' };
    const bytes = new Uint8Array(await jpeg.arrayBuffer());
    return { blob: new Blob([rcMakePdf(bytes, canvas.width, canvas.height)], { type: 'application/pdf' }), name: `${base}.pdf`, type: 'application/pdf' };
  }

  function rcCanShare() {
    try { return Boolean(navigator.share && navigator.canShare && navigator.canShare({ files: [new File(['x'], 'a.png', { type: 'image/png' })] })); } catch { return false; }
  }

  async function rcShare() {
    const file = await rcFile();
    await navigator.share({ files: [new File([file.blob], file.name, { type: file.type })], title: t('رسید سررسید') });
  }

  async function rcDownload() {
    // در برنامهٔ نصب‌شدهٔ آیفون دانلود مستقیم کار نمی‌کند؛ برگهٔ اشتراک‌گذاری جایگزین می‌شود.
    if (isIOS() && isStandalone() && rcCanShare()) return rcShare();
    const file = await rcFile();
    const url = URL.createObjectURL(file.blob);
    const link = document.createElement('a');
    link.href = url; link.download = file.name; document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    toast(t('فایل آماده شد'));
  }

  async function rcRun(button, task) {
    if (button.disabled) return;
    button.disabled = true;
    try { await rcFonts(); await task(); } catch (error) { console.error(error); if (error?.name !== 'AbortError') toast(t('ساخت فایل انجام نشد')); } finally { button.disabled = false; }
  }

  function rcFonts() {
    if (!rc.fonts) {
      const load = Promise.all([document.fonts.load('400 14px "Vazirmatn"', 'رسید ۱۲۳ ORBIT'), document.fonts.load('800 14px "Vazirmatn"', 'رسید ۱۲۳ ORBIT'), document.fonts.load('400 14px "GOL"', 'رسید ۱۲۳ ORBIT'), document.fonts.load('800 14px "GOL"', 'رسید ۱۲۳ ORBIT'), document.fonts.load('400 14px "LOG"', 'ORBIT 123'), document.fonts.load('800 14px "LOG"', 'ORBIT 123')]).catch(() => {});
      rc.fonts = Promise.race([load, new Promise(resolve => setTimeout(resolve, 3000))]);
    }
    return rc.fonts;
  }

  function rcSchedule() { clearTimeout(rc.timer); rc.timer = setTimeout(rcPreview, 90); }

  async function rcPreview() {
    const image = $('#rcPreview');
    if (!image || route.page !== 'receipt') return;
    try {
      await rcFonts();
      const blob = await rcToBlob(rcCanvas(), 'image/png');
      const url = URL.createObjectURL(blob);
      const target = $('#rcPreview');
      if (target) target.src = url;
      if (rc.url) URL.revokeObjectURL(rc.url);
      rc.url = url;
    } catch (error) { console.error(error); }
  }

  /* ---- صفحه ---- */

  function rcRenderGroups() {
    const box = $('#rcGroups');
    if (!box) return;
    const byGroup = {};
    rcVisible().forEach(entry => { (byGroup[entry.group] ||= []).push(entry); });
    const html = RC_GROUPS.filter(key => byGroup[key]).map(key => {
      const items = byGroup[key], on = rc.groupOn[key] !== false, open = rc.expanded.has(key);
      const chosen = items.filter(entry => !rc.off.has(entry.id)).length;
      const rows = open ? `<div class="rc-items">${items.map(entry => `<label class="rc-item"><input type="checkbox" data-rc-i="${esc(entry.id)}" ${rc.off.has(entry.id) ? '' : 'checked'}><span class="grow"><span class="title">${esc(entry.title || '—')}</span><span class="sub">${esc([rcDateShort(entry.date), entry.detail].filter(Boolean).join(' · '))}</span></span>${entry.amount ? `<span class="amount ${entry.status === 'overdue' ? 'negative' : entry.incoming ? 'positive' : ''}">${entry.incoming ? '+' : ''}${localMoney(entry.amount)}</span>` : ''}</label>`).join('')}</div>` : '';
      return `<div class="rc-group ${on ? '' : 'off'}"><div class="rc-ghead"><label class="check"><input type="checkbox" data-rc-g="${key}" ${on ? 'checked' : ''} aria-label="${esc(t(RC_LABEL[key]))}"></label><button class="rc-gname" type="button" data-action="rc-expand" data-id="${key}" aria-expanded="${open}"><strong>${esc(t(RC_LABEL[key]))}</strong><span class="muted">${localDigits(chosen)}/${localDigits(items.length)}</span><span class="rc-car" aria-hidden="true"></span></button></div>${rows}</div>`;
    }).join('');
    box.innerHTML = html || empty(t('برای این ماه سررسیدی ثبت نشده است.'), '');
  }

  function rcRenderOptions() {
    const box = $('#rcOpts');
    if (!box) return;
    const sw = (key, label) => `<label class="check"><input type="checkbox" data-rc-o="${key}" ${rc.opts[key] ? 'checked' : ''}><span>${esc(t(label))}</span></label>`;
    box.innerHTML = `${sw('summary', 'جمع‌بندی و نمایشگر')}${sw('meta', 'شماره و تاریخ صدور')}${sw('barcode', 'بارکد پایین رسید')}${sw('paid', 'موارد انجام‌شده هم باشد')}
      <div class="field"><label for="rcOwner">${t('نام روی رسید')} <span class="muted">${t('(اختیاری)')}</span></label><input id="rcOwner" maxlength="40" autocomplete="off" value="${esc(rc.owner)}"></div>
      <div class="field"><label for="rcFooter">${t('پیام پایین رسید')}</label><input id="rcFooter" maxlength="120" autocomplete="off" value="${esc(rc.footer === undefined ? t('ممنون که حواست به سررسیدهاست') : rc.footer)}"></div>`;
  }

  function renderReceipt() {
    rcLoadPrefs();
    const parts = jalaliParts(cursor);
    const key = monthKeyOf(parts.jy, parts.jm);
    if (rc.month !== key) { rc.month = key; rc.off.clear(); rc.expanded.clear(); }
    rc.entries = rcBuildEntries();
    const fmts = ['png', 'jpg', 'pdf'].map(value => `<button class="filter ${rc.fmt === value ? 'active' : ''}" type="button" data-action="rc-fmt" data-fmt="${value}" aria-pressed="${rc.fmt === value}">${value.toUpperCase()}</button>`).join('');
    $('#screen').innerHTML = `${pageHead(jalaliMonthLabel(cursor), t('رسید سررسید'), `<a class="button small" href="#/list/obligations">${t('قسط و بدهی')}</a>`)}
      <div class="rc-top">${monthSwitcher()}</div>
      <div class="rc-layout">
        <div class="rc-controls">
          <div class="panel"><h2>${t('چه چیزهایی در رسید باشد؟')}</h2><div id="rcGroups"></div></div>
          <div class="panel"><h2>${t('جزئیات رسید')}</h2><div id="rcOpts"></div></div>
        </div>
        <div class="rc-stage">
          <div class="panel rc-preview"><img id="rcPreview" alt="${esc(t('رسید سررسید'))}"></div>
          <div class="rc-bar"><div class="filters" role="group">${fmts}</div><div class="actions"><button class="button primary" type="button" data-action="rc-download">${icon('download')} ${t('دانلود')}</button>${rcCanShare() ? `<button class="button" type="button" data-action="rc-share">${t('اشتراک‌گذاری')}</button>` : ''}</div></div>
        </div>
      </div>`;
    rcRenderGroups(); rcRenderOptions(); rcSchedule();
  }

  function renderNoteReceipt() {
    const note = state.notes.find(item => item.id === route.parts[0]);
    if (!note) { $('#screen').innerHTML = empty(t('این مورد پیدا نشد'), '', `<a class="button" href="#/list/notes">${t('یادداشت‌ها')}</a>`); return; }
    const stamp = jalaliDateLabel(localISO(note.createdAt));
    $('#screen').innerHTML = `${pageHead(stamp, t('رسید یادداشت'), `<a class="button small" href="#/list/notes">${t('یادداشت‌ها')}</a>`)}
      <div class="note-receipt panel"><div class="note-receipt-head"><span>ORBIT / NOTE</span><span>${esc(stamp)}</span></div>
      <h2>${t(note.voice ? 'رسید ویس و متن' : 'رسید یادداشت')}</h2><div class="note-receipt-rule"></div>
      <span class="sub">${t(note.voice ? 'متن تبدیل‌شده از گفتار' : 'متن یادداشت')}</span><p dir="auto">${esc(note.text)}</p>
      ${note.voice ? `<div class="voice-playback"><span>${icon('mic')} ${t('صدای اصلی')}</span><audio id="noteReceiptAudio" controls hidden></audio><div class="sub" id="noteAudioMissing">${t('در حال بارگذاری صدا…')}</div></div>` : ''}
      <div class="note-receipt-rule"></div><div class="note-receipt-head"><span>${t('شماره رسید')}</span><span dir="ltr">${esc(note.id.slice(0, 12).toUpperCase())}</span></div></div>
      <div class="rc-bar note-receipt-actions"><div class="filters"><button class="filter active" type="button" data-action="note-fmt" data-fmt="png">PNG</button><button class="filter" type="button" data-action="note-fmt" data-fmt="pdf">PDF</button></div><div class="actions"><button class="button primary" type="button" data-action="note-download" data-id="${esc(note.id)}">${icon('download')} ${t('دانلود رسید')}</button>${note.voice ? `<button class="button" type="button" data-action="note-audio" data-id="${esc(note.id)}">${icon('download')} ${t('دریافت فایل صوتی')}</button>` : ''}</div></div>`;
    if (note.voice) voiceLoadPlayer(note.id, '#noteReceiptAudio').then(() => {
      const status = $('#noteAudioMissing'), player = $('#noteReceiptAudio');
      if (status && player) status.textContent = player.hidden ? t('فایل صوتی روی این دستگاه پیدا نشد') : '';
    });
  }
  let noteReceiptFormat = 'png';
  function noteReceiptCanvas(note) {
    const width = 760, padding = 62;
    const probe = document.createElement('canvas').getContext('2d');
    probe.font = '24px Vazirmatn, sans-serif';
    const lines = [];
    for (const paragraph of note.text.split('\n')) {
      let line = '';
      for (const word of paragraph.split(/\s+/)) {
        const next = line ? `${line} ${word}` : word;
        if (line && probe.measureText(next).width > width - padding * 2) { lines.push(line); line = word; } else line = next;
      }
      lines.push(line || ' ');
    }
    const canvas = document.createElement('canvas');
    canvas.width = width; canvas.height = Math.max(650, 490 + lines.length * 38);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f6f3e6'; ctx.fillRect(0, 0, width, canvas.height);
    ctx.direction = isEn() ? 'ltr' : 'rtl'; ctx.textAlign = isEn() ? 'left' : 'right';
    const x = isEn() ? padding : width - padding;
    ctx.fillStyle = '#6d7660'; ctx.font = 'bold 23px Vazirmatn, sans-serif'; ctx.fillText('ORBIT / NOTE', x, 94);
    ctx.fillStyle = '#1a2412'; ctx.font = 'bold 42px Vazirmatn, sans-serif'; ctx.fillText(t(note.voice ? 'رسید ویس و متن' : 'رسید یادداشت'), x, 163);
    ctx.strokeStyle = '#a9b096'; ctx.beginPath(); ctx.moveTo(padding, 194); ctx.lineTo(width-padding, 194); ctx.stroke();
    ctx.fillStyle = '#6d7660'; ctx.font = '24px Vazirmatn, sans-serif'; ctx.fillText(jalaliDateLabel(localISO(note.createdAt)), x, 246);
    ctx.fillText(t(note.voice ? 'متن تبدیل‌شده از گفتار' : 'متن یادداشت'), x, 320);
    ctx.fillStyle = '#1a2412'; ctx.font = '24px Vazirmatn, sans-serif';
    lines.forEach((line, index) => ctx.fillText(line, x, 380 + index * 38));
    const bottom = canvas.height - 135;
    ctx.strokeStyle = '#a9b096'; ctx.beginPath(); ctx.moveTo(padding, bottom); ctx.lineTo(width-padding, bottom); ctx.stroke();
    ctx.fillStyle = '#6d7660'; ctx.font = '22px Vazirmatn, sans-serif';
    ctx.fillText(note.voice ? t('فایل صوتی همراه این رسید جداگانه دریافت می‌شود') : 'ORBIT', x, bottom + 48);
    ctx.font = '19px sans-serif'; ctx.fillText(note.id.slice(0, 12).toUpperCase(), x, bottom + 85);
    return canvas;
  }
  async function noteReceiptDownload(id) {
    const note = state.notes.find(item => item.id === id);
    if (!note) return;
    await rcFonts();
    const canvas = noteReceiptCanvas(note), base = `ORBIT-note-${id.slice(0, 12)}`;
    if (noteReceiptFormat === 'png') return deliverFile(await rcToBlob(canvas, 'image/png'), `${base}.png`, 'image/png', t('رسید یادداشت'));
    const jpeg = await rcToBlob(canvas, 'image/jpeg', .94);
    const pdf = rcMakePdf(new Uint8Array(await jpeg.arrayBuffer()), canvas.width, canvas.height);
    return deliverFile(new Blob([pdf], { type: 'application/pdf' }), `${base}.pdf`, 'application/pdf', t('رسید یادداشت'));
  }
  async function noteAudioDownload(id) {
    const blob = await voiceGet(id);
    if (!blob) return toast(t('فایل صوتی روی این دستگاه پیدا نشد'));
    const extension = blob.type.includes('mp4') ? 'm4a' : blob.type.includes('ogg') ? 'ogg' : 'webm';
    await deliverFile(blob, `ORBIT-voice-${id.slice(0, 12)}.${extension}`, blob.type || 'audio/webm', t('صدای یادداشت'));
  }

  /* ---------- مقایسهٔ ماه‌ها ---------- */

  function categoryTotals(monthKey) {
    const out = {};
    monthTransactions(monthKey).filter(item => item.type === 'expense' && isCounted(item)).forEach(item => { const name = item.category || 'سایر'; out[name] = (out[name] || 0) + (Number(item.amount) || 0); });
    return out;
  }

  function deltaMarkup(now, before, goodWhenUp) {
    if (!now && !before) return '<span class="muted">—</span>';
    if (!before) return `<span class="muted">${t('جدید')}</span>`;
    const percent = Math.round((now - before) / Math.abs(before) * 100);
    if (percent === 0) return `<span class="muted">${t('بدون تغییر')}</span>`;
    const up = percent > 0;
    return `<span class="${up === goodWhenUp ? 'positive' : 'negative'}">${up ? '▲' : '▼'} ${number(Math.abs(percent))}${pctSign()}</span>`;
  }

  function renderCompare() {
    const key = jalaliMonthKey(cursor);
    const previousKey = jalaliMonthKey(shiftJalaliMonth(cursor, -1));
    const now = totals(monthTransactions(key)), before = totals(monthTransactions(previousKey));
    const nets = [now.income - now.expense, before.income - before.expense];
    const summary = [[t('درآمد'), now.income, before.income, true], [t('خرج'), now.expense, before.expense, false], [t('مانده'), nets[0], nets[1], true]]
      .map(([label, a, b, good]) => `<div class="cmp-sum"><span class="muted">${label}</span><strong>${number(a)}</strong><small class="muted">${t('ماه قبل')} ${number(b)}</small>${deltaMarkup(a, b, good)}</div>`).join('');
    const a = categoryTotals(key), b = categoryTotals(previousKey);
    const names = [...new Set([...Object.keys(a), ...Object.keys(b)])].sort((x, y) => Math.max(a[y] || 0, b[y] || 0) - Math.max(a[x] || 0, b[x] || 0));
    const top = Math.max(1, ...names.map(name => Math.max(a[name] || 0, b[name] || 0)));
    const rows = names.map(name => `<button class="cmp-row ${ui.cmpCat === name ? 'on' : ''}" type="button" data-action="cmp-cat" data-category="${esc(name)}" aria-pressed="${ui.cmpCat === name}">
      <span class="cmp-name">${esc(catName(name))}</span><span class="cmp-delta">${deltaMarkup(a[name] || 0, b[name] || 0, false)}</span>
      <span class="cmp-bars"><span class="category-meter" aria-hidden="true">${ledBar((a[name] || 0) / top, 16, 'g')}</span><span class="category-meter dim" aria-hidden="true">${ledBar((b[name] || 0) / top, 16, 'a')}</span></span>
      <span class="cmp-vals"><b>${number(a[name] || 0)}</b><small class="muted">${t('ماه قبل')} ${number(b[name] || 0)}</small></span></button>`).join('');
    let trend = '';
    if (ui.cmpCat) {
      const months = [];
      for (let offset = 5; offset >= 0; offset -= 1) {
        const p = jalaliParts(shiftJalaliMonth(cursor, -offset));
        const mk = monthKeyOf(p.jy, p.jm);
        months.push({ key: mk, jm: p.jm, value: categoryTotals(mk)[ui.cmpCat] || 0 });
      }
      const maximum = Math.max(1, ...months.map(item => item.value));
      const average = Math.round(months.reduce((sum, item) => sum + item.value, 0) / months.length);
      trend = `<div class="panel section"><h2>${t('روند {v1} در شش ماه', { v1: esc(catName(ui.cmpCat)) })}</h2><div class="lcd vu"><div class="vu-cols">${months.map(item => `<span class="vu-month ${item.key === key ? 'current' : ''}" aria-label="${esc(monthNames()[item.jm - 1])}: ${number(item.value)}"><span class="vu-col expense">${Array.from({ length: 10 }, (_, index) => `<i class="${index < (item.value > 0 ? Math.max(1, Math.round(item.value / maximum * 10)) : 0) ? 'on' : ''}"></i>`).join('')}</span></span>`).join('')}</div>
        <div class="month-names">${months.map(item => `<span class="${item.key === key ? 'current' : ''}">${monthShort(item.jm - 1)}</span>`).join('')}</div></div>
        <div class="cmp-avg">${t('میانگین شش ماه: {v1} {v2}', { v1: number(average), v2: esc(cur()) })} · ${t('این ماه')}: ${deltaMarkup(months[5].value, average, false)}</div></div>`;
    }
    $('#screen').innerHTML = `${pageHead(jalaliMonthLabel(cursor), t('مقایسهٔ ماه‌ها'), `<a class="button small" href="#/">${t('خانه')}</a>`)}
      <div class="rc-top">${monthSwitcher()}</div>
      <div class="panel section"><h2>${t('این ماه نسبت به ماه قبل')} <small class="muted">· ${esc(monthKeyLabel(previousKey))}</small></h2><div class="cmp-summary">${summary}</div></div>
      <div class="panel section"><h2>${t('خرج دسته‌ها')}</h2>${rows ? `<div class="cmp-legend sub"><span><i class="dot solid"></i> ${t('این ماه')}</span><span><i class="dot soft"></i> ${t('ماه قبل')}</span></div><div class="cmp-list">${rows}</div><div class="sub hint-line">${t('روی هر دسته بزن تا روند شش‌ماههٔ آن را ببینی.')}</div>` : empty(t('هنوز داده‌ای نیست'), t('برای این ماه و ماه قبل خرجی ثبت نشده'))}</div>
      ${trend}`;
  }

  /* ---------- رندر اصلی ---------- */

  function renderChrome() {
    const info = todayInfo();
    const label = $('#todayLabel');
    if (label) label.innerHTML = `<span class="today-week">${esc(info.weekday)}</span>${segDate(info.iso, 'seg-date')}<span class="sr-only">${esc(info.jalali)}</span>`;
    const markup = NAV.map(([page, path, iconName, text]) => `<a class="nav-button ${route.page === page ? 'active' : ''} ${page === 'add' ? 'add' : ''}" href="#${path}" ${route.page === page ? 'aria-current="page"' : ''}><span class="nav-icon">${icon(iconName)}</span><span>${t(text)}</span></a>`).join('');
    $('#desktopNav').innerHTML = markup;
    $('#mobileNav').innerHTML = markup;
    applyTheme();
  }

  function render() {
    route = parseRoute();
    renderChrome();
    const screens = { home: renderHome, add: renderAdd, list: renderList, calc: renderCalc, settings: renderSettings, receipt: renderReceipt, 'note-receipt': renderNoteReceipt, compare: renderCompare };
    try {
      screens[route.page]();
    } catch (error) {
      console.error('ORBIT render error', error);
      $('#screen').innerHTML = `<div class="fatal">${t('نمایش این صفحه با خطا روبه‌رو شد. صفحه را دوباره بارگذاری کن؛ اطلاعاتت دست‌نخورده است.')}</div>`;
    }
    if (!storageReady) banners.storage = STORAGE_MESSAGE;
    renderBanners();
  }

  /* ---------- رویدادها ---------- */

  function handleAction(target) {
    const action = target.dataset.action;
    const id = target.dataset.id || '';
    switch (action) {
      case 'theme': toggleTheme(); break;
      case 'lang': switchLanguage(isEn() ? 'fa' : 'en'); break;
      case 'set-lang': switchLanguage(target.dataset.lang); break;
      case 'set-crt': {
        const mode = target.dataset.crt;
        if (!['off', 'soft', 'full'].includes(mode) || mode === state.settings.crt) break;
        try { commit(draft => { draft.settings.crt = mode; }); applyTheme(); render(); if (mode !== 'off') crtBoot(); } catch (error) { console.error(error); toast(t('ذخیره انجام نشد')); }
        break;
      }
      case 'current-month': cursor = new Date(); render(); break;
      case 'previous-month': cursor = shiftJalaliMonth(cursor, -1); render(); break;
      case 'next-month': cursor = shiftJalaliMonth(cursor, 1); render(); break;
      case 'goto-month': cursor = new Date(`${target.dataset.date}T12:00:00`); render(); break;
      case 'day-info': {
        const readout = $('#dayReadout');
        if (!readout) break;
        const amount = Number(target.dataset.amount);
        readout.textContent = amount ? t('{label}: {v2} {v3} خرج', { label: target.dataset.label, v2: number(amount), v3: cur() }) : t('{label}: خرجی ثبت نشده', { label: target.dataset.label });
        document.querySelectorAll('.day-bar.selected').forEach(bar => bar.classList.remove('selected'));
        target.classList.add('selected');
        break;
      }
      case 'filter-category': ui.category = target.dataset.category; transactionFilter = 'expense'; transactionQuery = ''; location.hash = '/list/transactions'; render(); break;
      case 'clear-category': ui.category = ''; transactionFilter = 'all'; render(); break;
      case 'transaction-filter': transactionFilter = target.dataset.filter; render(); break;
      case 'toggle-row': ui.expanded = ui.expanded === id ? '' : id; render(); break;
      case 'duplicate-transaction': {
        const source = state.transactions.find(item => item.id === id);
        if (source) { ui.preset = { kind: source.type, data: { ...source, date: localISO(), source: null } }; ui.expanded = ''; go(`/add/${source.type}`); }
        break;
      }
      case 'delete-transaction': deleteTransaction(id); break;
      case 'pick-category': {
        const form = target.closest('form');
        if (form) { form.dataset.categoryTouched = '1'; setCategory(form, target.dataset.category); }
        break;
      }
      case 'quick-fill': {
        const input = $('#f-title');
        if (input) { input.value = target.dataset.title; captureDraft(input); suggestFromTitle(input); }
        break;
      }
      case 'open-pay': {
        const key = payKey(target.dataset.kind, id);
        ui.paying = ui.paying === key ? '' : key;
        render();
        if (ui.paying) setTimeout(() => { const field = $('.pay-box [data-autofocus]'); field?.focus({ preventScroll: true }); field?.select?.(); }, 30);
        break;
      }
      case 'close-pay': ui.paying = ''; render(); break;
      case 'delete-goal': deleteGoal(id); break;
      case 'delete-obligation': deleteObligation(target.dataset.store, id); break;
      case 'toggle-note': updateNote(id, note => { note.done = !note.done; note.updatedAt = new Date().toISOString(); }); break;
      case 'pin-note': updateNote(id, note => { note.pinned = !note.pinned; }); break;
      case 'delete-note': {
        try { withUndo(t('یادداشت حذف شد'), draft => { draft.notes = draft.notes.filter(item => item.id !== id); }); ui.expanded = ''; render(); setTimeout(() => { if (!state.notes.some(note => note.id === id)) voiceDelete(id).catch(console.warn); }, 7000); } catch { toast(t('حذف انجام نشد')); }
        break;
      }
      case 'note-record': voiceToggle(); break;
      case 'note-transcribe': voiceTranscribeOnly(); break;
      case 'mic-test': voiceMicTest(); break;
      case 'note-fmt': noteReceiptFormat = target.dataset.fmt === 'pdf' ? 'pdf' : 'png'; document.querySelectorAll('[data-action="note-fmt"]').forEach(button => button.classList.toggle('active', button.dataset.fmt === noteReceiptFormat)); break;
      case 'note-download': rcRun(target, () => noteReceiptDownload(id)); break;
      case 'note-audio': rcRun(target, () => noteAudioDownload(id)); break;
      case 'recurring-new': ui.recurring = 'new'; render(); break;
      case 'recurring-edit': ui.recurring = id; render(); break;
      case 'recurring-close': ui.recurring = ''; render(); break;
      case 'recurring-delete': deleteRecurring(id); break;
      case 'rc-expand': rc.expanded.has(id) ? rc.expanded.delete(id) : rc.expanded.add(id); rcRenderGroups(); break;
      case 'rc-fmt': rc.fmt = target.dataset.fmt; rcSavePrefs(); document.querySelectorAll('[data-action="rc-fmt"]').forEach(b => { const on = b.dataset.fmt === rc.fmt; b.classList.toggle('active', on); b.setAttribute('aria-pressed', on); }); break;
      case 'rc-download': rcRun(target, rcDownload); break;
      case 'rc-share': rcRun(target, rcShare); break;
      case 'calc-copy': calcCopy(); break;
      case 'calc-expense': calcToAdd('expense'); break;
      case 'calc-income': calcToAdd('income'); break;
      case 'calc-tape-clear': calc.tape = []; updateCalcView(); break;
      case 'export': exportData().catch(error => { console.error(error); toast(t('ساخت فایل انجام نشد')); }); break;
      case 'export-csv': exportCsv(target.dataset.scope); break;
      case 'restore-copy': restoreCopy(target.dataset.key); break;
      case 'cmp-cat': ui.cmpCat = ui.cmpCat === target.dataset.category ? '' : target.dataset.category; render(); break;
      case 'restore-previous': restorePrevious(); break;
      case 'dismiss-backup': backupNagDismissed = true; render(); break;
      case 'clear-data': clearAllData(); break;
      default: break;
    }
  }

  function trapFocus(event) {
    const dialog = $('#confirmModal').classList.contains('open') ? $('#confirmBox') : null;
    if (!dialog || event.key !== 'Tab') return;
    const focusable = [...dialog.querySelectorAll('button')].filter(element => !element.disabled);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }

  function checkNewDay() {
    const today = localISO();
    if (today === lastDay) return;
    const wasCurrent = jalaliMonthKey(cursor) === jalaliMonthKey(lastDay);
    lastDay = today;
    if (wasCurrent) cursor = new Date();
    runRecurring(true);
    render();
  }

  function registerEvents() {
    document.addEventListener('click', event => {
      const confirmButton = event.target.closest('[data-confirm]');
      if (confirmButton && confirmResolver) return confirmResolver(confirmButton.dataset.confirm === 'yes');
      const calcKey = event.target.closest('[data-calc]');
      if (calcKey) { calcPress(calcKey.dataset.calc); if (event.detail) calcKey.blur(); return; }
      const tapeLine = event.target.closest('[data-calc-tape]');
      if (tapeLine) return calcReuse(Number(tapeLine.dataset.calcTape));
      const chip = event.target.closest('[data-date-chip]');
      if (chip) return applyDateChip(chip);
      const actionButton = event.target.closest('[data-action]');
      if (actionButton) handleAction(actionButton);
    });
    document.addEventListener('input', event => {
      const target = event.target;
      if (target.matches?.('[data-money]')) formatMoneyField(target);
      else if (target.matches?.('[data-date]')) formatDateField(target);
      else if (target.id === 'rcOwner') { rc.owner = target.value; rcSavePrefs(); rcSchedule(); }
      else if (target.id === 'rcFooter') { rc.footer = target.value; rcSavePrefs(); rcSchedule(); }
      else if (target.id === 'transactionSearch') { transactionQuery = target.value; updateTransactionList(); }
      captureDraft(target);
    });
    document.addEventListener('change', event => {
      const target = event.target;
      if (target.dataset?.rcG) { rc.groupOn[target.dataset.rcG] = target.checked; rcSavePrefs(); rcRenderGroups(); rcSchedule(); return; }
      if (target.dataset?.rcI) { target.checked ? rc.off.delete(target.dataset.rcI) : rc.off.add(target.dataset.rcI); rcRenderGroups(); rcSchedule(); return; }
      if (target.dataset?.rcO) { rc.opts[target.dataset.rcO] = target.checked; rcSavePrefs(); rcSchedule(); return; }
      captureDraft(target);
      if (target.name === 'title' && target.form?.id === 'addForm') suggestFromTitle(target);
      else if (target.name === 'direction' && target.form?.id === 'addForm') {
        const label = $('#cashLabel');
        if (label) label.textContent = cashLabel(target.value);
      }
    });
    document.addEventListener('submit', async event => {
      const form = event.target.closest?.('form[data-form]');
      if (!form) return;
      event.preventDefault();
      if (form.dataset.busy === '1') return;
      form.dataset.busy = '1';
      try {
        await FORM_HANDLERS[form.dataset.form]?.(form, new FormData(form));
      } catch (error) {
        console.error('ORBIT save error', error);
        toast(t('ذخیره انجام نشد؛ تنظیمات ذخیره‌سازی مرورگر را بررسی کن'));
      } finally {
        if (form.isConnected) form.dataset.busy = '0';
      }
    });
    document.addEventListener('toggle', event => {
      const key = event.target?.dataset?.fold;
      if (key) { if (event.target.open) ui.open.add(key); else ui.open.delete(key); }
    }, true);
    $('#confirmModal').addEventListener('click', event => { if (event.target === $('#confirmModal') && confirmResolver) confirmResolver(false); });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && confirmResolver) confirmResolver(false);
      trapFocus(event);
      calcKeyboard(event);
    });
    window.addEventListener('hashchange', () => { if (route.page === 'add' && route.parts[0] === 'note') voiceReset(); ui.expanded = ''; ui.paying = ''; ui.recurring = ''; render(); window.scrollTo({ top: 0 }); crtSwitch(); });
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') { checkNewDay(); runRecurring(); } });
    setInterval(checkNewDay, 30000);
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
      const action = new URLSearchParams(location.search).get('action');
      if (action === 'expense' || action === 'income') { history.replaceState(null, '', location.pathname); location.hash = `/add/${action}`; }
      else if (action) history.replaceState(null, '', location.pathname);
    } catch { /* ignore */ }
  }

  async function init() {
    loadState();
    await migrateLegacyData();
    applyTheme();
    syncLanguage();
    registerEvents();
    const created = runRecurring(true);
    handleLaunchAction();
    render();
    crtBoot();
    if (created) toast(t('{v1} تراکنش تکراری ثبت شد', { v1: number(created), c: created }));
    registerServiceWorker();
    offerAutoRecovery();
  }

  globalThis.ORBIT_TEST = {
    parseAmount, parseMoney, numberToWords, jalaliParts, jalaliToISO, parseJalaliDate, jalaliInput, jalaliMonthKey, jalaliMonthLength,
    changeJalaliMonth, normalizeState, isValidISO, totals, balanceOf, effectiveBudgets, payInstallmentDraft, payDebtDraft,
    removeTransactionDraft, applyRecurringDraft, upcomingItems, defaultState, nextMonthKey, migrateCalendarDraft, t, displayText,
    calcEvaluate, calcFormat, calcGroup, calcPress, calcDisplay, calcState: calc, calcClear, segNumber,
    setLang: value => { LANG = value === 'en' ? 'en' : 'fa'; }, getLang: () => LANG,
    getState: () => state, setState: next => { state = next; }, transactionsCsv, goalInfo, mirrorFlush
  };
  if (typeof document !== 'undefined') document.addEventListener('DOMContentLoaded', () => init().catch(error => {
    console.error('ORBIT initialization error', error);
    document.body.innerHTML = `<div class="fatal"><h1>ORBIT</h1><p>${t('راه‌اندازی برنامه انجام نشد. صفحه را دوباره بارگذاری کن؛ اگر مشکل ادامه داشت، اطلاعاتت در حافظهٔ مرورگر دست‌نخورده است.')}</p></div>`;
  }));
})();
