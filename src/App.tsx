import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { supabase } from "../utils/supabase/client";

type Language = "en" | "hi";
type Page = "home" | "customers" | "records";
type Period = "day" | "week" | "month";
type ProductId = "milk-small" | "buttermilk" | "milk-500" | "dahi";

type Product = {
  id: ProductId;
  name: string;
  hindi: string;
  size: string;
  buy: number;
  sell: number;
  color: string;
};

type Customer = {
  id: string;
  name: string;
  phone: string;
  productId: ProductId;
  dailyQty: number;
  due: number;
  active: boolean;
};

type Transaction = {
  id: string;
  productId: ProductId;
  qty: number;
  total: number;
  cost: number;
  payment: "cash" | "credit" | "collection";
  customerId?: string;
  customerName?: string;
  createdAt: string;
};

type Purchase = {
  id: string;
  productId: ProductId;
  qty: number;
  amount: number;
  createdAt: string;
};

type LedgerState = {
  customers: Customer[];
  transactions: Transaction[];
  purchases: Purchase[];
  updatedAt: string;
};

const products: Product[] = [
  { id: "milk-small", name: "Small Milk", hindi: "छोटा दूध", size: "1 pouch", buy: 10, sell: 12, color: "blue" },
  { id: "buttermilk", name: "Buttermilk", hindi: "छाछ", size: "1 pouch", buy: 15, sell: 18, color: "cyan" },
  { id: "milk-500", name: "Milk 500ml", hindi: "दूध 500ml", size: "500 ml", buy: 35, sell: 37, color: "violet" },
  { id: "dahi", name: "Dahi", hindi: "दही", size: "1 cup", buy: 20, sell: 22, color: "orange" },
];

const seedState: LedgerState = {
  customers: [],
  transactions: [],
  purchases: [],
  updatedAt: "",
};

const words = {
  en: {
    greeting: "Namaste",
    subtitle: "Here’s how your dairy is doing",
    home: "Home",
    customers: "Customers",
    records: "Records",
    book: "Daily account book",
    quickSale: "New sale",
    addPurchase: "Morning purchase",
    today: "Today",
    week: "This week",
    month: "This month",
    sales: "Total sales",
    received: "Money received",
    spent: "Stock purchased",
    profit: "Profit",
    items: "Items sold",
    dues: "Total due",
    quick: "Quick sale",
    chooseProduct: "Choose a product",
    buy: "Buy",
    sell: "Sell",
    margin: "profit",
    recent: "Recent activity",
    viewAll: "View all",
    cashSale: "Cash sale",
    creditSale: "Added to due",
    collect: "Collect due",
    addCustomer: "Add customer",
    monthlyCustomers: "Daily milk customers",
    dueNow: "Due now",
    daily: "Daily",
    collectMoney: "Collect",
    giveMilk: "Give today",
    delivered: "Given today",
    active: "Active",
    quantity: "Quantity",
    payment: "Payment",
    cash: "Cash",
    credit: "Monthly / Due",
    customer: "Customer",
    existingCustomer: "Existing customer",
    newCustomer: "New customer",
    newCustomerName: "Enter new customer name",
    searchCustomer: "Search customer by name",
    customerOptional: "Customer (optional for cash)",
    addThisCustomer: "Add as new customer",
    noCustomerFound: "No matching customer",
    selectCustomer: "Select customer",
    total: "Total",
    saveSale: "Save sale",
    cancel: "Cancel",
    name: "Customer name",
    phone: "Phone number",
    product: "Daily product",
    add: "Add customer",
    collected: "Amount collected",
    save: "Save",
    noActivity: "No activity in this period",
    saved: "Saved successfully",
    syncing: "Saving…",
    synced: "Safe & saved",
    localOnly: "Saved on this device",
    allTransactions: "All transactions",
    expense: "Product cost",
    netProfit: "Net profit",
    simpleSummary: "Business summary",
    revenue: "Sales money",
    purchaseTitle: "Add morning stock",
    purchaseAmount: "Amount paid",
    savePurchase: "Save purchase",
    unitRate: "Buy rate",
    enterQuantity: "Enter any quantity. Keep 0 for products not purchased.",
    purchases: "Stock purchases",
    edit: "Edit",
    delete: "Delete",
    deleteCustomer: "Delete customer?",
    deleteRecord: "Delete this record?",
    emptyStart: "Start today’s account",
    emptyStartHint: "First add the stock you bought this morning, then record each sale.",
    noCustomers: "No customers yet. Add only customers who buy on monthly credit.",
    saleEntries: "Sales & collections",
    loss: "Loss",
    entryDate: "Entry date",
    chooseDate: "Choose a date to see its complete account",
    previousDay: "Previous day",
    nextDay: "Next day",
    todayButton: "Today",
    daySales: "Sales on this day",
    dayPurchases: "Purchases on this day",
  },
  hi: {
    greeting: "नमस्ते",
    subtitle: "आज आपके डेयरी का पूरा हिसाब",
    home: "होम",
    customers: "ग्राहक",
    records: "हिसाब",
    book: "रोज़ का खाता-बुक",
    quickSale: "नई बिक्री",
    addPurchase: "सुबह की खरीद",
    today: "आज",
    week: "इस हफ्ते",
    month: "इस महीने",
    sales: "कुल बिक्री",
    received: "मिले हुए पैसे",
    spent: "खरीदा हुआ माल",
    profit: "मुनाफ़ा",
    items: "सामान बिका",
    dues: "कुल उधार",
    quick: "जल्दी बिक्री",
    chooseProduct: "सामान चुनें",
    buy: "खरीद",
    sell: "बिक्री",
    margin: "बचत",
    recent: "हाल का हिसाब",
    viewAll: "सभी देखें",
    cashSale: "नकद बिक्री",
    creditSale: "उधार में जोड़ा",
    collect: "उधार जमा करें",
    addCustomer: "ग्राहक जोड़ें",
    monthlyCustomers: "रोज़ दूध लेने वाले",
    dueNow: "अभी उधार",
    daily: "रोज़",
    collectMoney: "जमा करें",
    giveMilk: "आज का दूध दें",
    delivered: "आज दे दिया",
    active: "चालू",
    quantity: "कितना",
    payment: "पैसे",
    cash: "नकद",
    credit: "महीने का उधार",
    customer: "ग्राहक",
    existingCustomer: "पुराना ग्राहक",
    newCustomer: "नया ग्राहक",
    newCustomerName: "नए ग्राहक का नाम लिखें",
    searchCustomer: "नाम से ग्राहक खोजें",
    customerOptional: "ग्राहक (नकद में जरूरी नहीं)",
    addThisCustomer: "नया ग्राहक बनाएँ",
    noCustomerFound: "कोई ग्राहक नहीं मिला",
    selectCustomer: "ग्राहक चुनें",
    total: "कुल",
    saveSale: "बिक्री सेव करें",
    cancel: "रद्द करें",
    name: "ग्राहक का नाम",
    phone: "फोन नंबर",
    product: "रोज़ का सामान",
    add: "ग्राहक जोड़ें",
    collected: "जमा किए पैसे",
    save: "सेव करें",
    noActivity: "इस समय में कोई हिसाब नहीं",
    saved: "हिसाब सेव हो गया",
    syncing: "सेव हो रहा है…",
    synced: "सुरक्षित और सेव",
    localOnly: "इस डिवाइस में सेव है",
    allTransactions: "सारा लेन-देन",
    expense: "सामान की लागत",
    netProfit: "शुद्ध मुनाफ़ा",
    simpleSummary: "व्यापार का हिसाब",
    revenue: "बिक्री के पैसे",
    purchaseTitle: "सुबह का माल जोड़ें",
    purchaseAmount: "दिए हुए पैसे",
    savePurchase: "खरीद सेव करें",
    unitRate: "खरीद भाव",
    enterQuantity: "जितना माल लिया उतना लिखें। जो नहीं लिया उसमें 0 रखें।",
    purchases: "माल की खरीद",
    edit: "बदलें",
    delete: "हटाएँ",
    deleteCustomer: "ग्राहक को हटाएँ?",
    deleteRecord: "यह हिसाब हटाएँ?",
    emptyStart: "आज का हिसाब शुरू करें",
    emptyStartHint: "पहले सुबह खरीदा हुआ माल जोड़ें, फिर हर बिक्री लिखें।",
    noCustomers: "अभी कोई ग्राहक नहीं है। महीने में पैसे देने वाले ग्राहक ही जोड़ें।",
    saleEntries: "बिक्री और जमा",
    loss: "नुकसान",
    entryDate: "हिसाब की तारीख",
    chooseDate: "किसी भी तारीख का पूरा हिसाब देखें",
    previousDay: "पिछला दिन",
    nextDay: "अगला दिन",
    todayButton: "आज",
    daySales: "इस दिन की बिक्री",
    dayPurchases: "इस दिन की खरीद",
  },
};

function Icon({ name, size = 22 }: { name: string; size?: number }) {
  const paths: Record<string, ReactNode> = {
    home: <><path d="m3 11 9-8 9 8" /><path d="M5 10v10h14V10M9 20v-6h6v6" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z" /><path d="M4 5.5v14" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    rupee: <><path d="M6 4h12M6 8h12M7 4c7 0 7 8 0 8h-1l9 8" /></>,
    trend: <><path d="m3 17 6-6 4 4 8-9" /><path d="M15 6h6v6" /></>,
    box: <><path d="m21 8-9 5-9-5 9-5z" /><path d="m3 8 9 5 9-5v8l-9 5-9-5zM12 13v8" /></>,
    wallet: <><path d="M20 7V5a2 2 0 0 0-2-2H5a3 3 0 0 0 0 6h15v12H5a3 3 0 0 1-3-3V6" /><path d="M16 13h2" /></>,
    milk: <><path d="M8 2h8l-1 4 3 4v11H6V10l3-4zM9 6h6M6 11h12" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    chevron: <path d="m9 18 6-6-6-6" />,
    cloud: <><path d="M17.5 19H7a5 5 0 1 1 1.4-9.8A6 6 0 0 1 20 11a4 4 0 0 1-2.5 8Z" /><path d="m9 14 2 2 4-4" /></>,
    edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" /></>,
    trash: <><path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6M10 11v6M14 11v6" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

const money = (value: number) => `₹${Math.round(value).toLocaleString("en-IN")}`;
const productById = (id: ProductId) => products.find((product) => product.id === id)!;
const localDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
const timestampForDate = (date: string) => date === localDateKey()
  ? new Date().toISOString()
  : new Date(`${date}T12:00:00`).toISOString();
const normalizeLedger = (value: Partial<LedgerState> | null): LedgerState => ({
  customers: Array.isArray(value?.customers) ? value.customers : [],
  transactions: Array.isArray(value?.transactions) ? value.transactions : [],
  purchases: Array.isArray(value?.purchases) ? value.purchases : [],
  updatedAt: typeof value?.updatedAt === "string" ? value.updatedAt : "",
});
const ledgerFreshness = (ledger: LedgerState) => {
  const recordTimes = [
    ...ledger.transactions.map((item) => Date.parse(item.createdAt) || 0),
    ...ledger.purchases.map((item) => Date.parse(item.createdAt) || 0),
  ];
  return Math.max(Date.parse(ledger.updatedAt) || 0, ...recordTimes, ledger.customers.length ? 1 : 0);
};

export default function App() {
  const [language, setLanguage] = useState<Language>("hi");
  const [page, setPage] = useState<Page>("home");
  const [period, setPeriod] = useState<Period>("day");
  const [bookDate, setBookDate] = useState(localDateKey());
  const [state, setState] = useState<LedgerState>(seedState);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [syncError, setSyncError] = useState(false);
  const [saleOpen, setSaleOpen] = useState(false);
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [customerOpen, setCustomerOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [collecting, setCollecting] = useState<Customer | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductId>("milk-small");
  const t = words[language];

  useEffect(() => {
    let localLedger = seedState;
    const local = localStorage.getItem("doodh-saathi-ledger-v2");
    if (local) {
      try {
        localLedger = normalizeLedger(JSON.parse(local));
      } catch {
        localLedger = seedState;
      }
    }

    const loadLedger = async () => {
      try {
        const { data, error } = await supabase
          .from("dairy_ledger")
          .select("value")
          .eq("id", "main")
          .maybeSingle();
        if (error) throw error;

        const cloudLedger = normalizeLedger(data?.value ?? null);
        const useLocal = ledgerFreshness(localLedger) > ledgerFreshness(cloudLedger);
        const newestLedger = useLocal ? localLedger : cloudLedger;
        setState(newestLedger);
        localStorage.setItem("doodh-saathi-ledger-v2", JSON.stringify(newestLedger));

        if (useLocal) {
          const { error: recoveryError } = await supabase
            .from("dairy_ledger")
            .upsert({ id: "main", value: localLedger, updated_at: localLedger.updatedAt || new Date().toISOString() });
          if (recoveryError) throw recoveryError;
          setSyncError(false);
        } else {
          setSyncError(false);
        }
      } catch {
        setSyncError(true);
        setState(localLedger);
      } finally {
        setLoaded(true);
      }
    };

    loadLedger();
  }, []);

  const persist = async (next: Omit<LedgerState, "updatedAt"> | LedgerState) => {
    const savedLedger: LedgerState = { ...next, updatedAt: new Date().toISOString() };
    setState(savedLedger);
    localStorage.setItem("doodh-saathi-ledger-v2", JSON.stringify(savedLedger));
    setSaving(true);
    try {
      const { error } = await supabase
        .from("dairy_ledger")
        .upsert({ id: "main", value: savedLedger, updated_at: savedLedger.updatedAt });
      if (error) throw error;
      setSyncError(false);
    } catch {
      // Local storage remains the source of truth while the Edge Function is unavailable.
      setSyncError(true);
    } finally {
      setSaving(false);
    }
  };

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    if (period === "day") start.setHours(0, 0, 0, 0);
    if (period === "week") {
      start.setDate(now.getDate() - 6);
      start.setHours(0, 0, 0, 0);
    }
    if (period === "month") {
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
    }
    return state.transactions.filter((item) => new Date(item.createdAt) >= start);
  }, [state.transactions, period]);

  const filteredPurchases = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    if (period === "day") start.setHours(0, 0, 0, 0);
    if (period === "week") {
      start.setDate(now.getDate() - 6);
      start.setHours(0, 0, 0, 0);
    }
    if (period === "month") {
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
    }
    return state.purchases.filter((item) => new Date(item.createdAt) >= start);
  }, [state.purchases, period]);

  const totals = useMemo(() => {
    const sales = filteredTransactions.filter((item) => item.payment !== "collection");
    const received = filteredTransactions
      .filter((item) => item.payment === "cash" || item.payment === "collection")
      .reduce((sum, item) => sum + item.total, 0);
    const spent = filteredPurchases.reduce((sum, item) => sum + item.amount, 0);
    return {
      revenue: sales.reduce((sum, item) => sum + item.total, 0),
      cost: sales.reduce((sum, item) => sum + item.cost, 0),
      received,
      spent,
      items: sales.reduce((sum, item) => sum + item.qty, 0),
      due: state.customers.reduce((sum, customer) => sum + customer.due, 0),
    };
  }, [filteredTransactions, filteredPurchases, state.customers]);

  const openSale = (productId: ProductId = "milk-small") => {
    setSelectedProduct(productId);
    setSaleOpen(true);
  };

  const saveSale = (qty: number, payment: "cash" | "credit", customerId?: string, entryDate = localDateKey(), newCustomerName?: string) => {
    const product = productById(selectedProduct);
    const existingCustomer = state.customers.find((item) => item.id === customerId);
    const newCustomerId = newCustomerName?.trim() ? crypto.randomUUID() : undefined;
    const saleCustomerId = existingCustomer?.id ?? newCustomerId;
    const saleCustomerName = existingCustomer?.name ?? newCustomerName?.trim();
    const transaction: Transaction = {
      id: crypto.randomUUID(),
      productId: selectedProduct,
      qty,
      total: product.sell * qty,
      cost: product.buy * qty,
      payment,
      customerId: saleCustomerId,
      customerName: saleCustomerName,
      createdAt: timestampForDate(entryDate),
    };
    persist({
      transactions: [transaction, ...state.transactions],
      customers: newCustomerId
        ? [{
            id: newCustomerId,
            name: saleCustomerName!,
            phone: "",
            productId: selectedProduct,
            dailyQty: qty,
            due: payment === "credit" ? transaction.total : 0,
            active: true,
          }, ...state.customers]
        : state.customers.map((item) =>
            item.id === customerId && payment === "credit" ? { ...item, due: item.due + transaction.total } : item
          ),
      purchases: state.purchases,
    });
    setSaleOpen(false);
  };

  const saveCustomer = (customer: Omit<Customer, "id" | "due" | "active">) => {
    persist({
      ...state,
      customers: editingCustomer
        ? state.customers.map((item) => item.id === editingCustomer.id ? { ...item, ...customer } : item)
        : [{ ...customer, id: crypto.randomUUID(), due: 0, active: true }, ...state.customers],
    });
    setCustomerOpen(false);
    setEditingCustomer(null);
  };

  const collectDue = (amount: number, entryDate = localDateKey()) => {
    if (!collecting || amount <= 0) return;
    const paid = Math.min(amount, collecting.due);
    persist({
      customers: state.customers.map((item) => item.id === collecting.id ? { ...item, due: item.due - paid } : item),
      transactions: [{
        id: crypto.randomUUID(),
        productId: collecting.productId,
        qty: 0,
        total: paid,
        cost: 0,
        payment: "collection",
        customerId: collecting.id,
        customerName: collecting.name,
        createdAt: timestampForDate(entryDate),
      }, ...state.transactions],
      purchases: state.purchases,
    });
    setCollecting(null);
  };

  const recordDailyDelivery = (customer: Customer) => {
    const product = productById(customer.productId);
    const transaction: Transaction = {
      id: crypto.randomUUID(),
      productId: customer.productId,
      qty: customer.dailyQty,
      total: product.sell * customer.dailyQty,
      cost: product.buy * customer.dailyQty,
      payment: "credit",
      customerId: customer.id,
      customerName: customer.name,
      createdAt: new Date().toISOString(),
    };
    persist({
      transactions: [transaction, ...state.transactions],
      customers: state.customers.map((item) =>
        item.id === customer.id ? { ...item, due: item.due + transaction.total } : item
      ),
      purchases: state.purchases,
    });
  };

  const savePurchases = (entries: Array<{ productId: ProductId; qty: number; amount: number }>, entryDate: string) => {
    const createdAt = timestampForDate(entryDate);
    persist({
      ...state,
      purchases: [
        ...entries.map((entry) => ({ id: crypto.randomUUID(), ...entry, createdAt })),
        ...state.purchases,
      ],
    });
    setPurchaseOpen(false);
  };

  const removeCustomer = (customer: Customer) => {
    if (!window.confirm(t.deleteCustomer)) return;
    persist({ ...state, customers: state.customers.filter((item) => item.id !== customer.id) });
  };

  const removeTransaction = (transaction: Transaction) => {
    if (!window.confirm(t.deleteRecord)) return;
    const nextCustomers = state.customers.map((customer) => {
      if (customer.id !== transaction.customerId) return customer;
      if (transaction.payment === "credit") return { ...customer, due: Math.max(0, customer.due - transaction.total) };
      if (transaction.payment === "collection") return { ...customer, due: customer.due + transaction.total };
      return customer;
    });
    persist({ ...state, customers: nextCustomers, transactions: state.transactions.filter((item) => item.id !== transaction.id) });
  };

  const removePurchase = (purchase: Purchase) => {
    if (!window.confirm(t.deleteRecord)) return;
    persist({ ...state, purchases: state.purchases.filter((item) => item.id !== purchase.id) });
  };

  const bookTransactions = state.transactions.filter((item) => localDateKey(new Date(item.createdAt)) === bookDate);
  const bookPurchases = state.purchases.filter((item) => localDateKey(new Date(item.createdAt)) === bookDate);
  const bookSales = bookTransactions.filter((item) => item.payment !== "collection");
  const bookRevenue = bookSales.reduce((sum, item) => sum + item.total, 0);
  const bookReceived = bookTransactions
    .filter((item) => item.payment === "cash" || item.payment === "collection")
    .reduce((sum, item) => sum + item.total, 0);
  const bookSpent = bookPurchases.reduce((sum, item) => sum + item.amount, 0);
  const moveBookDate = (days: number) => {
    const date = new Date(`${bookDate}T12:00:00`);
    date.setDate(date.getDate() + days);
    setBookDate(localDateKey(date));
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><Icon name="milk" size={26} /></div>
          <div><strong>Doodh Saathi</strong><span>दूध साथी</span></div>
        </div>
        <nav>
          <NavItem active={page === "home"} icon="home" label={t.home} onClick={() => setPage("home")} />
          <NavItem active={page === "customers"} icon="users" label={t.customers} onClick={() => setPage("customers")} />
          <NavItem active={page === "records"} icon="book" label={t.records} onClick={() => setPage("records")} />
        </nav>
        <div className={`save-state ${syncError ? "local" : ""}`}><Icon name="cloud" size={18} />{saving ? t.syncing : syncError ? t.localOnly : t.synced}</div>
      </aside>

      <main>
        <header className="topbar">
          <div>
            <p className="eyebrow">{new Date().toLocaleDateString(language === "hi" ? "hi-IN" : "en-IN", { weekday: "long", day: "numeric", month: "long" })}</p>
            <h1>{page === "home" ? `${t.greeting} — ${t.simpleSummary}` : page === "customers" ? t.monthlyCustomers : t.book}</h1>
            <p className="subtext">{page === "home" ? t.subtitle : page === "customers" ? `${state.customers.length} ${t.active}` : t.chooseDate}</p>
          </div>
          <div className="header-actions">
            <button className="language-toggle" onClick={() => setLanguage(language === "en" ? "hi" : "en")}>
              <span className={language === "en" ? "selected" : ""}>EN</span>
              <span className={language === "hi" ? "selected" : ""}>हिं</span>
            </button>
            <button className="secondary-button" onClick={() => setPurchaseOpen(true)}><Icon name="box" size={19} />{t.addPurchase}</button>
            <button className="primary-button" onClick={() => openSale()}><Icon name="plus" size={20} />{t.quickSale}</button>
          </div>
        </header>

        <div className="content">
          {page === "home" && (
            <>
              <div className="period-tabs">
                {(["day", "week", "month"] as Period[]).map((item) => (
                  <button key={item} className={period === item ? "active" : ""} onClick={() => setPeriod(item)}>
                    {item === "day" ? t.today : item === "week" ? t.week : t.month}
                  </button>
                ))}
              </div>
              <section className="stats-grid">
                <StatCard icon="wallet" label={t.received} value={money(totals.received)} tone="green" note={t.cash} />
                <StatCard icon="box" label={t.spent} value={money(totals.spent)} tone="violet" note={t.addPurchase} />
                <StatCard icon="rupee" label={t.sales} value={money(totals.revenue)} tone="blue" note={`${totals.items} ${t.items.toLowerCase()}`} />
                <StatCard icon="trend" label={totals.revenue - totals.spent >= 0 ? t.profit : t.loss} value={money(Math.abs(totals.revenue - totals.spent))} tone={totals.revenue - totals.spent >= 0 ? "green" : "orange"} note={`${t.sales} − ${t.spent}`} />
                <StatCard icon="wallet" label={t.dues} value={money(totals.due)} tone="orange" note={`${state.customers.filter((item) => item.due > 0).length} ${t.customers.toLowerCase()}`} />
              </section>

              {!state.transactions.length && !state.purchases.length && (
                <section className="start-card">
                  <div className="start-icon"><Icon name="book" size={27} /></div>
                  <div><h2>{t.emptyStart}</h2><p>{t.emptyStartHint}</p></div>
                  <div className="start-actions">
                    <button className="secondary-button" onClick={() => setPurchaseOpen(true)}><Icon name="box" size={18} />{t.addPurchase}</button>
                    <button className="primary-button" onClick={() => openSale()}><Icon name="plus" size={18} />{t.quickSale}</button>
                  </div>
                </section>
              )}

              <section className="panel products-panel">
                <div className="section-heading">
                  <div><h2>{t.quick}</h2><p>{t.chooseProduct}</p></div>
                  <button className="stock-shortcut" onClick={() => setPurchaseOpen(true)}><Icon name="box" size={17} />{t.addPurchase}</button>
                </div>
                <div className="product-grid">
                  {products.map((product) => (
                    <button className="product-card" key={product.id} onClick={() => openSale(product.id)}>
                      <div className={`product-icon ${product.color}`}><Icon name="milk" size={25} /></div>
                      <div className="product-copy">
                        <strong>{language === "hi" ? product.hindi : product.name}</strong>
                        <span>{product.size}</span>
                        <small>{t.buy} {money(product.buy)} · {t.sell} {money(product.sell)}</small>
                      </div>
                      <div className="price">{money(product.sell)}<Icon name="chevron" size={18} /></div>
                    </button>
                  ))}
                </div>
              </section>

              <section className="panel activity-panel">
                <div className="section-heading">
                  <div><h2>{t.recent}</h2><p>{language === "hi" ? "आज की बिक्री और जमा" : "Sales and collections today"}</p></div>
                  <button className="text-button" onClick={() => setPage("records")}>{t.viewAll}<Icon name="chevron" size={16} /></button>
                </div>
                <TransactionList transactions={filteredTransactions.slice(0, 5)} language={language} empty={t.noActivity} />
              </section>
            </>
          )}

          {page === "customers" && (
            <section className="panel customer-panel">
              <div className="section-heading">
                <div><h2>{t.monthlyCustomers}</h2><p>{language === "hi" ? "महीने के अंत में पैसे लेने वाले ग्राहक" : "Customers who pay at the end of month"}</p></div>
                <button className="secondary-button" onClick={() => setCustomerOpen(true)}><Icon name="plus" size={19} />{t.addCustomer}</button>
              </div>
              <div className="customer-list">
                {!state.customers.length && <div className="empty-state">{t.noCustomers}</div>}
                {state.customers.map((customer) => {
                  const product = productById(customer.productId);
                  const deliveredToday = state.transactions.some((item) =>
                    item.customerId === customer.id &&
                    item.payment === "credit" &&
                    new Date(item.createdAt).toDateString() === new Date().toDateString()
                  );
                  return (
                    <article className="customer-row" key={customer.id}>
                      <div className="avatar">{customer.name.charAt(0)}</div>
                      <div className="customer-info">
                        <strong>{customer.name}</strong>
                        <span>{customer.phone || "—"} · {t.daily} {customer.dailyQty} × {language === "hi" ? product.hindi : product.name}</span>
                      </div>
                      <div className="due-amount"><span>{t.dueNow}</span><strong>{money(customer.due)}</strong></div>
                      <div className="customer-actions">
                        <button className={`deliver-button ${deliveredToday ? "done" : ""}`} disabled={deliveredToday} onClick={() => recordDailyDelivery(customer)}>
                          <Icon name={deliveredToday ? "check" : "milk"} size={16} />{deliveredToday ? t.delivered : t.giveMilk}
                        </button>
                        <button className="collect-button" disabled={!customer.due} onClick={() => setCollecting(customer)}>{t.collectMoney}</button>
                        <button className="mini-icon-button" title={t.edit} onClick={() => { setEditingCustomer(customer); setCustomerOpen(true); }}><Icon name="edit" size={16} /></button>
                        <button className="mini-icon-button danger" title={t.delete} onClick={() => removeCustomer(customer)}><Icon name="trash" size={16} /></button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          {page === "records" && (
            <>
              <section className="book-toolbar">
                <div>
                  <h2>{t.book}</h2>
                  <p>{new Date(`${bookDate}T12:00:00`).toLocaleDateString(language === "hi" ? "hi-IN" : "en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
                </div>
                <div className="date-controls">
                  <button title={t.previousDay} onClick={() => moveBookDate(-1)}>‹</button>
                  <input aria-label={t.entryDate} type="date" value={bookDate} max={localDateKey()} onChange={(event) => setBookDate(event.target.value)} />
                  <button title={t.nextDay} disabled={bookDate >= localDateKey()} onClick={() => moveBookDate(1)}>›</button>
                  {bookDate !== localDateKey() && <button className="today-button" onClick={() => setBookDate(localDateKey())}>{t.todayButton}</button>}
                </div>
              </section>
              <section className="summary-strip">
                <div><span>{t.received}</span><strong>{money(bookReceived)}</strong></div>
                <div><span>{t.spent}</span><strong>{money(bookSpent)}</strong></div>
                <div className={bookRevenue - bookSpent >= 0 ? "profit" : "loss"}><span>{bookRevenue - bookSpent >= 0 ? t.netProfit : t.loss}</span><strong>{money(Math.abs(bookRevenue - bookSpent))}</strong></div>
              </section>
              <section className="panel purchase-panel">
                <div className="section-heading">
                  <div><h2>{t.dayPurchases}</h2><p>{t.addPurchase}</p></div>
                  <button className="secondary-button" onClick={() => setPurchaseOpen(true)}><Icon name="plus" size={18} />{t.add}</button>
                </div>
                <PurchaseList purchases={bookPurchases} language={language} empty={t.noActivity} onDelete={removePurchase} />
              </section>
              <section className="panel activity-panel">
                <div className="section-heading">
                  <div><h2>{t.daySales}</h2><p>{language === "hi" ? "बिक्री, उधार और जमा" : "Sales, credit and collections"}</p></div>
                </div>
                <TransactionList transactions={bookTransactions} language={language} empty={t.noActivity} onDelete={removeTransaction} />
              </section>
            </>
          )}
        </div>
      </main>

      <div className="mobile-nav">
        <NavItem active={page === "home"} icon="home" label={t.home} onClick={() => setPage("home")} />
        <NavItem active={page === "customers"} icon="users" label={t.customers} onClick={() => setPage("customers")} />
        <button className="mobile-sale" onClick={() => openSale()}><Icon name="plus" size={26} /></button>
        <NavItem active={page === "records"} icon="book" label={t.records} onClick={() => setPage("records")} />
        <button className="mobile-language" onClick={() => setLanguage(language === "en" ? "hi" : "en")}>{language === "en" ? "हिं" : "EN"}</button>
      </div>

      {saleOpen && <SaleModal language={language} selected={selectedProduct} customers={state.customers} defaultDate={page === "records" ? bookDate : localDateKey()} onProduct={setSelectedProduct} onClose={() => setSaleOpen(false)} onSave={saveSale} />}
      {purchaseOpen && <PurchaseModal language={language} defaultDate={page === "records" ? bookDate : localDateKey()} onClose={() => setPurchaseOpen(false)} onSave={savePurchases} />}
      {customerOpen && <CustomerModal language={language} customer={editingCustomer} onClose={() => { setCustomerOpen(false); setEditingCustomer(null); }} onSave={saveCustomer} />}
      {collecting && <CollectModal language={language} customer={collecting} onClose={() => setCollecting(null)} onSave={collectDue} />}
      {!loaded && <div className="loading"><div className="spinner" /></div>}
    </div>
  );
}

function NavItem({ active, icon, label, onClick }: { active: boolean; icon: string; label: string; onClick: () => void }) {
  return <button className={`nav-item ${active ? "active" : ""}`} onClick={onClick}><Icon name={icon} size={21} /><span>{label}</span></button>;
}

function StatCard({ icon, label, value, tone, note }: { icon: string; label: string; value: string; tone: string; note: string }) {
  return (
    <article className="stat-card">
      <div className={`stat-icon ${tone}`}><Icon name={icon} size={22} /></div>
      <div className="stat-copy"><span>{label}</span><strong>{value}</strong><small>{note}</small></div>
    </article>
  );
}

function TransactionList({ transactions, language, empty, onDelete }: { transactions: Transaction[]; language: Language; empty: string; onDelete?: (item: Transaction) => void }) {
  if (!transactions.length) return <div className="empty-state">{empty}</div>;
  return (
    <div className="transaction-list">
      {transactions.map((item) => {
        const product = productById(item.productId);
        const collection = item.payment === "collection";
        return (
          <article className="transaction-row" key={item.id}>
            <div className={`transaction-icon ${collection ? "collection" : product.color}`}><Icon name={collection ? "wallet" : "milk"} size={20} /></div>
            <div className="transaction-main">
              <strong>{collection ? (language === "hi" ? "उधार जमा" : "Due collected") : (language === "hi" ? product.hindi : product.name)}</strong>
              <span>{collection ? item.customerName : `${item.qty} × ${money(product.sell)}${item.customerName ? ` · ${item.customerName}` : ""}`}</span>
            </div>
            <div className="transaction-meta">
              <strong className={collection ? "positive" : ""}>{collection ? "+" : ""}{money(item.total)}</strong>
              <span>{new Date(item.createdAt).toLocaleTimeString(language === "hi" ? "hi-IN" : "en-IN", { hour: "numeric", minute: "2-digit" })}</span>
            </div>
            <div className={`payment-pill ${item.payment}`}>{item.payment === "cash" ? (language === "hi" ? "नकद" : "Cash") : item.payment === "credit" ? (language === "hi" ? "उधार" : "Due") : (language === "hi" ? "जमा" : "Paid")}</div>
            {onDelete && <button className="row-delete" title={words[language].delete} onClick={() => onDelete(item)}><Icon name="trash" size={15} /></button>}
          </article>
        );
      })}
    </div>
  );
}

function Modal({ children, title, onClose }: { children: ReactNode; title: string; onClose: () => void }) {
  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header"><h2>{title}</h2><button className="icon-button" onClick={onClose}><Icon name="close" size={22} /></button></div>
        {children}
      </div>
    </div>
  );
}

function SaleModal({ language, selected, customers, defaultDate, onProduct, onClose, onSave }: { language: Language; selected: ProductId; customers: Customer[]; defaultDate: string; onProduct: (id: ProductId) => void; onClose: () => void; onSave: (qty: number, payment: "cash" | "credit", customerId?: string, entryDate?: string, newCustomerName?: string) => void }) {
  const t = words[language];
  const [qty, setQty] = useState(1);
  const [payment, setPayment] = useState<"cash" | "credit">("cash");
  const [customerId, setCustomerId] = useState("");
  const [newCustomerName, setNewCustomerName] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [entryDate, setEntryDate] = useState(defaultDate);
  const product = productById(selected);
  const matchingCustomers = customers.filter((customer) =>
    customer.name.toLocaleLowerCase().includes(customerSearch.trim().toLocaleLowerCase())
  );
  const exactCustomerExists = customers.some((customer) =>
    customer.name.toLocaleLowerCase() === customerSearch.trim().toLocaleLowerCase()
  );
  return (
    <Modal title={t.quickSale} onClose={onClose}>
      <div className="modal-body">
        <label>{t.product}</label>
        <div className="choice-grid">
          {products.map((item) => <button key={item.id} className={selected === item.id ? "active" : ""} onClick={() => onProduct(item.id)}>{language === "hi" ? item.hindi : item.name}<span>{money(item.sell)}</span></button>)}
        </div>
        <label>{t.quantity}</label>
        <div className="stepper">
          <button onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
          <strong>{qty}</strong>
          <button onClick={() => setQty(qty + 1)}>+</button>
        </div>
        <label>{t.payment}</label>
        <div className="payment-choices">
          <button className={payment === "cash" ? "active" : ""} onClick={() => setPayment("cash")}><Icon name="rupee" size={20} />{t.cash}</button>
          <button className={payment === "credit" ? "active" : ""} onClick={() => setPayment("credit")}><Icon name="book" size={20} />{t.credit}</button>
        </div>
        <div className="credit-customer-box">
          <label htmlFor="customer-search">{payment === "cash" ? t.customerOptional : t.customer}</label>
          <div className="customer-search">
            <Icon name="users" size={18} />
            <input
              id="customer-search"
              value={customerSearch}
              placeholder={t.searchCustomer}
              onChange={(event) => {
                setCustomerSearch(event.target.value);
                setCustomerId("");
                setNewCustomerName("");
              }}
            />
          </div>
          {customerSearch.trim() && (
            <div className="customer-results">
              {matchingCustomers.map((customer) => (
                <button
                  key={customer.id}
                  className={customerId === customer.id ? "selected" : ""}
                  onClick={() => {
                    setCustomerId(customer.id);
                    setNewCustomerName("");
                    setCustomerSearch(customer.name);
                  }}
                >
                  <span>{customer.name}<small>{t.dueNow}: {money(customer.due)}</small></span>
                  {customerId === customer.id && <Icon name="check" size={17} />}
                </button>
              ))}
              {!matchingCustomers.length && <p>{t.noCustomerFound}</p>}
              {!exactCustomerExists && (
                <button
                  className={newCustomerName ? "add-new selected" : "add-new"}
                  onClick={() => {
                    setCustomerId("");
                    setNewCustomerName(customerSearch.trim());
                  }}
                >
                  <Icon name="plus" size={17} />
                  <span>{t.addThisCustomer}<small>{customerSearch.trim()}</small></span>
                  {newCustomerName && <Icon name="check" size={17} />}
                </button>
              )}
            </div>
          )}
        </div>
        <div className="field"><label htmlFor="sale-date">{t.entryDate}</label><input id="sale-date" type="date" max={localDateKey()} value={entryDate} onChange={(event) => setEntryDate(event.target.value)} /></div>
        <div className="sale-total"><span>{t.total}</span><strong>{money(product.sell * qty)}</strong><small>{t.profit}: {money((product.sell - product.buy) * qty)}</small></div>
        <button
          className="modal-primary"
          disabled={!entryDate || (payment === "credit" && !customerId && !newCustomerName.trim())}
          onClick={() => onSave(
            qty,
            payment,
            customerId || undefined,
            entryDate,
            newCustomerName || undefined,
          )}
        >
          <Icon name="check" size={20} />{t.saveSale}
        </button>
      </div>
    </Modal>
  );
}

function PurchaseList({ purchases, language, empty, onDelete }: { purchases: Purchase[]; language: Language; empty: string; onDelete: (purchase: Purchase) => void }) {
  if (!purchases.length) return <div className="empty-state">{empty}</div>;
  return (
    <div className="purchase-list">
      {purchases.map((purchase) => {
        const product = productById(purchase.productId);
        return (
          <article className="purchase-row" key={purchase.id}>
            <div className={`transaction-icon ${product.color}`}><Icon name="box" size={19} /></div>
            <div><strong>{language === "hi" ? product.hindi : product.name}</strong><span>{purchase.qty} × {money(purchase.amount / purchase.qty)}</span></div>
            <time>{new Date(purchase.createdAt).toLocaleDateString(language === "hi" ? "hi-IN" : "en-IN", { day: "numeric", month: "short" })}</time>
            <strong>{money(purchase.amount)}</strong>
            <button className="row-delete" title={words[language].delete} onClick={() => onDelete(purchase)}><Icon name="trash" size={15} /></button>
          </article>
        );
      })}
    </div>
  );
}

function PurchaseModal({ language, defaultDate, onClose, onSave }: { language: Language; defaultDate: string; onClose: () => void; onSave: (entries: Array<{ productId: ProductId; qty: number; amount: number }>, entryDate: string) => void }) {
  const t = words[language];
  const [entryDate, setEntryDate] = useState(defaultDate);
  const [rows, setRows] = useState(() => products.map((product) => ({ productId: product.id, qty: 0, rate: product.buy })));
  const updateRow = (productId: ProductId, field: "qty" | "rate", value: number) => {
    setRows((current) => current.map((row) => row.productId === productId ? { ...row, [field]: Math.max(0, value || 0) } : row));
  };
  const entries = rows
    .filter((row) => row.qty > 0)
    .map((row) => ({ productId: row.productId, qty: row.qty, amount: row.qty * row.rate }));
  const total = entries.reduce((sum, entry) => sum + entry.amount, 0);
  return (
    <Modal title={t.purchaseTitle} onClose={onClose}>
      <div className="modal-body">
        <p className="form-help">{t.enterQuantity}</p>
        <div className="bulk-purchase">
          <div className="bulk-heading"><span>{t.product}</span><span>{t.quantity}</span><span>{t.unitRate}</span></div>
          {rows.map((row) => {
            const product = productById(row.productId);
            return (
              <div className="bulk-row" key={row.productId}>
                <div className="bulk-product">
                  <div className={`tiny-product-icon ${product.color}`}><Icon name="milk" size={17} /></div>
                  <strong>{language === "hi" ? product.hindi : product.name}</strong>
                </div>
                <input aria-label={`${product.name} ${t.quantity}`} inputMode="numeric" min="0" type="number" value={row.qty || ""} placeholder="0" onChange={(event) => updateRow(row.productId, "qty", Number(event.target.value))} />
                <div className="rate-input"><span>₹</span><input aria-label={`${product.name} ${t.unitRate}`} inputMode="decimal" min="0" type="number" value={row.rate || ""} onChange={(event) => updateRow(row.productId, "rate", Number(event.target.value))} /></div>
              </div>
            );
          })}
        </div>
        <div className="field"><label htmlFor="purchase-date">{t.entryDate}</label><input id="purchase-date" type="date" max={localDateKey()} value={entryDate} onChange={(event) => setEntryDate(event.target.value)} /></div>
        <div className="purchase-total"><span>{t.purchaseAmount}</span><strong>{money(total)}</strong></div>
        <button className="modal-primary" disabled={!entryDate || !entries.length || !total} onClick={() => onSave(entries, entryDate)}><Icon name="check" size={20} />{t.savePurchase}</button>
      </div>
    </Modal>
  );
}

function CustomerModal({ language, customer, onClose, onSave }: { language: Language; customer: Customer | null; onClose: () => void; onSave: (customer: Omit<Customer, "id" | "due" | "active">) => void }) {
  const t = words[language];
  const [name, setName] = useState(customer?.name ?? "");
  const [phone, setPhone] = useState(customer?.phone ?? "");
  const [productId, setProductId] = useState<ProductId>(customer?.productId ?? "milk-500");
  const [dailyQty, setDailyQty] = useState(customer?.dailyQty ?? 1);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (name.trim()) onSave({ name: name.trim(), phone, productId, dailyQty });
  };
  return (
    <Modal title={customer ? t.edit : t.addCustomer} onClose={onClose}>
      <form className="modal-body form" onSubmit={submit}>
        <div className="field"><label htmlFor="name">{t.name}</label><input id="name" autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder={language === "hi" ? "जैसे: सीमा बेन" : "e.g. Seema Ben"} /></div>
        <div className="field"><label htmlFor="phone">{t.phone}</label><input id="phone" inputMode="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder={language === "hi" ? "10 अंकों का नंबर" : "10 digit number"} /></div>
        <div className="field"><label htmlFor="product">{t.product}</label><select id="product" value={productId} onChange={(event) => setProductId(event.target.value as ProductId)}>{products.map((product) => <option key={product.id} value={product.id}>{language === "hi" ? product.hindi : product.name} — {money(product.sell)}</option>)}</select></div>
        <label>{t.quantity}</label>
        <div className="stepper"><button type="button" onClick={() => setDailyQty(Math.max(1, dailyQty - 1))}>−</button><strong>{dailyQty}</strong><button type="button" onClick={() => setDailyQty(dailyQty + 1)}>+</button></div>
        <button className="modal-primary" type="submit" disabled={!name.trim()}><Icon name={customer ? "check" : "plus"} size={20} />{customer ? t.save : t.add}</button>
      </form>
    </Modal>
  );
}

function CollectModal({ language, customer, onClose, onSave }: { language: Language; customer: Customer; onClose: () => void; onSave: (amount: number, entryDate?: string) => void }) {
  const t = words[language];
  const [amount, setAmount] = useState(String(customer.due));
  const [entryDate, setEntryDate] = useState(localDateKey());
  return (
    <Modal title={t.collect} onClose={onClose}>
      <div className="modal-body">
        <div className="collect-person"><div className="avatar">{customer.name.charAt(0)}</div><div><strong>{customer.name}</strong><span>{t.dueNow}: {money(customer.due)}</span></div></div>
        <div className="field"><label htmlFor="amount">{t.collected}</label><div className="money-input"><span>₹</span><input id="amount" autoFocus inputMode="numeric" value={amount} onChange={(event) => setAmount(event.target.value)} /></div></div>
        <div className="field"><label htmlFor="collection-date">{t.entryDate}</label><input id="collection-date" type="date" max={localDateKey()} value={entryDate} onChange={(event) => setEntryDate(event.target.value)} /></div>
        <button className="modal-primary" disabled={!Number(amount) || !entryDate} onClick={() => onSave(Number(amount), entryDate)}><Icon name="check" size={20} />{t.save}</button>
      </div>
    </Modal>
  );
}
