import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { supabase } from "../utils/supabase/client";

type Language = "en" | "hi";
type Page = "home" | "customers" | "records";
type Period = "day" | "week" | "month" | "all";

type Product = {
  id: string;
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
  productId: string;
  dailyQty: number;
  due: number;
  active: boolean;
};

type Transaction = {
  id: string;
  productId: string;
  qty: number;
  unitRate?: number;
  total: number;
  cost: number;
  payment: "cash" | "credit" | "collection";
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  createdAt: string;
};

type Purchase = {
  id: string;
  productId: string;
  qty: number;
  amount: number;
  createdAt: string;
};

type LedgerState = {
  customers: Customer[];
  transactions: Transaction[];
  purchases: Purchase[];
  products?: Product[];
  updatedAt: string;
};

const defaultProducts: Product[] = [
  { id: "milk-small", name: "Small Milk", hindi: "छोटा दूध", size: "1 pouch", buy: 10, sell: 12, color: "blue" },
  { id: "buttermilk", name: "Buttermilk", hindi: "छाछ", size: "1 pouch", buy: 15, sell: 18, color: "cyan" },
  { id: "milk-500", name: "Milk 500ml", hindi: "दूध 500ml", size: "500 ml", buy: 35, sell: 37, color: "violet" },
  { id: "dahi", name: "Dahi", hindi: "दही", size: "1 cup", buy: 20, sell: 22, color: "orange" },
];

const seedState: LedgerState = {
  customers: [],
  transactions: [],
  purchases: [],
  products: defaultProducts,
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
    allTime: "All Time",
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
    existingCustomer: "Old / Existing customer",
    newCustomer: "New customer",
    walkinCash: "Walk-in cash",
    walkinHint: "Direct counter sale (no customer record created)",
    newCustomerName: "Customer name",
    newCustomerPhone: "Phone number (optional)",
    searchCustomer: "Search customer by name or phone...",
    saveToCustomerList: "Save in permanent customer list",
    customerOptional: "Customer name (optional for cash)",
    addThisCustomer: "Add as new customer",
    noCustomerFound: "No matching customer found",
    selectCustomer: "Select customer",
    selectedCustomer: "Selected customer",
    changeCustomer: "Change",
    walkinCustomerName: "Counter Cash",
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
    syncing: "Saving to Cloud…",
    synced: "Cloud Live (Supabase)",
    localOnly: "Offline / Sync",
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
    noCustomers: "No customers yet. Add your regular daily milk buyers.",
    saleEntries: "Sales & collections",
    loss: "Loss",
    entryDate: "Entry date",
    chooseDate: "Choose a date to see its complete account",
    previousDay: "Previous day",
    nextDay: "Next day",
    todayButton: "Today",
    daySales: "Sales on this day",
    dayPurchases: "Purchases on this day",
    dailyTrack: "Daily Track",
    allDaysTrack: "All Days Track",
    singleDayView: "Single Day Ledger",
    viewDayDetails: "View day details",
    allFilter: "All",
    cashFilter: "Cash (Nakad)",
    creditFilter: "Credit (Udhari)",
    collectionFilter: "Collected",
    purchasesFilter: "Stock purchases",
    searchPlaceholder: "Search by customer name or product...",
    showAllToday: "Show all transactions",
    showLess: "Show less",
    customerStatement: "Customer Account History",
    totalBought: "Total purchases",
    totalPaid: "Total paid",
    balanceDue: "Balance due",
    noCustomerHistory: "No transactions recorded for this customer yet",
    refreshCloud: "Sync Cloud",
    allDaysHeader: "All Days Ledger & Daily Track",
    allDaysSubtext: "Day-by-day sales, cash, credit, stock and profit overview",
    addProduct: "Add Product",
    editProduct: "Edit Product",
    deleteProduct: "Delete Product",
    productNameEn: "Product name (English)",
    productNameHi: "Product name (Hindi)",
    productUnit: "Unit / Size (e.g. 1 liter, 1 kg, 1 pouch)",
    defaultBuy: "Buy rate (₹)",
    defaultSell: "Sell rate (₹)",
    colorTheme: "Color theme",
    customRate: "Rate per unit (₹)",
    customTotalAmount: "Total Amount (₹)",
    customPriceBadge: "Custom rate",
    exportBackup: "Backup Data",
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
    allTime: "पूरा हिसाब",
    sales: "कुल बिक्री",
    received: "मिले हुए पैसे (नकद)",
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
    payment: "भुगतान",
    cash: "नकद (Nakad)",
    credit: "महीने का उधार",
    customer: "ग्राहक",
    existingCustomer: "पुराना ग्राहक",
    newCustomer: "नया ग्राहक",
    walkinCash: "काउंटर नकद (बिना नाम)",
    walkinHint: "सीधी काउंटर बिक्री — किसी खाते में जोड़ने की ज़रूरत नहीं",
    newCustomerName: "ग्राहक का नाम",
    newCustomerPhone: "मोबाइल नंबर (वैकल्पिक)",
    searchCustomer: "नाम या मोबाइल नंबर से ग्राहक खोजें...",
    saveToCustomerList: "ग्राहक लिस्ट में हमेशा के लिए जोड़ें",
    customerOptional: "ग्राहक का नाम (नकद में ज़रूरी नहीं)",
    addThisCustomer: "नया ग्राहक बनाएँ",
    noCustomerFound: "कोई ग्राहक नहीं मिला",
    selectCustomer: "ग्राहक चुनें",
    selectedCustomer: "चुना हुआ ग्राहक",
    changeCustomer: "बदलें",
    walkinCustomerName: "काउंटर नकद",
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
    syncing: "क्लाउड पर सेव हो रहा है…",
    synced: "क्लाउड लाइव (Supabase)",
    localOnly: "ऑफ़लाइन / सिंक करें",
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
    noCustomers: "अभी कोई ग्राहक नहीं है। रोज़ दूध लेने वाले ग्राहक जोड़ें।",
    saleEntries: "बिक्री और जमा",
    loss: "नुकसान",
    entryDate: "हिसाब की तारीख",
    chooseDate: "किसी भी तारीख का पूरा हिसाब देखें",
    previousDay: "पिछला दिन",
    nextDay: "अगला दिन",
    todayButton: "आज",
    daySales: "इस दिन की बिक्री",
    dayPurchases: "इस दिन की खरीद",
    dailyTrack: "ऑल डे ट्रैक",
    allDaysTrack: "सभी दिनों का ट्रैक",
    singleDayView: "एक दिन का विस्तृत हिसाब",
    viewDayDetails: "इस दिन का पूरा हिसाब देखें",
    allFilter: "सभी",
    cashFilter: "नकद (Nakad)",
    creditFilter: "उधार (खाता)",
    collectionFilter: "जमा पैसे",
    purchasesFilter: "माल खरीद",
    searchPlaceholder: "ग्राहक का नाम या सामान खोजें...",
    showAllToday: "सभी लेन-देन देखें",
    showLess: "कम देखें",
    customerStatement: "ग्राहक का पूरा खाता-बही",
    totalBought: "कुल खरीदारी",
    totalPaid: "कुल जमा",
    balanceDue: "बाकी उधार",
    noCustomerHistory: "इस ग्राहक का कोई लेन-देन दर्ज नहीं है",
    refreshCloud: "क्लाउड सिंक",
    allDaysHeader: "ऑल डे ट्रैक — रोज़ का दैनिक खाता",
    allDaysSubtext: "हर दिन की बिक्री, नकद कमाई, उधार और मुनाफ़े का पूरा ट्रैक",
    addProduct: "नया सामान जोड़ें",
    editProduct: "सामान बदलें",
    deleteProduct: "सामान हटाएँ",
    productNameEn: "सामान का नाम (अंग्रेज़ी)",
    productNameHi: "सामान का नाम (हिंदी)",
    productUnit: "इकाई / नाप (उदा. 1 लीटर, 1 किलो, 1 पाउच)",
    defaultBuy: "खरीद भाव (₹)",
    defaultSell: "बिक्री भाव (₹)",
    colorTheme: "रंग थीम",
    customRate: "बिक्री भाव (₹/इकाई)",
    customTotalAmount: "कुल रकम (₹)",
    customPriceBadge: "विशेष भाव",
    exportBackup: "डेटा बैकअप",
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
    search: <><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></>,
    calendar: <><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>,
    refresh: <><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path d="M16 21h5v-5" /></>,
    history: <><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l3 3" /></>,
    userCheck: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><polyline points="16 11 18 13 22 9" /></>,
    userPlus: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></>,
    filter: <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name] || <circle cx="12" cy="12" r="10" />}
    </svg>
  );
}

const money = (value: number) => `₹${Math.round(value).toLocaleString("en-IN")}`;

const getProduct = (productsList: Product[], id: string): Product => {
  return productsList.find((p) => p.id === id) || productsList[0] || defaultProducts[0];
};

const localDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const timestampForDate = (date: string) => {
  if (date === localDateKey()) return new Date().toISOString();
  return new Date(`${date}T12:00:00`).toISOString();
};

const normalizeLedger = (value: Partial<LedgerState> | null): LedgerState => ({
  customers: Array.isArray(value?.customers) ? value.customers : [],
  transactions: Array.isArray(value?.transactions) ? value.transactions : [],
  purchases: Array.isArray(value?.purchases) ? value.purchases : [],
  products: Array.isArray(value?.products) && value.products.length ? value.products : defaultProducts,
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
  const [trackMode, setTrackMode] = useState<"all-days" | "single-day">("all-days");
  const [state, setState] = useState<LedgerState>(seedState);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [syncError, setSyncError] = useState(false);

  // Modals
  const [saleOpen, setSaleOpen] = useState(false);
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [customerOpen, setCustomerOpen] = useState(false);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [collecting, setCollecting] = useState<Customer | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string>("milk-small");
  const [viewingCustomerHistory, setViewingCustomerHistory] = useState<Customer | null>(null);

  // Filters & Search
  const [homeFilter, setHomeFilter] = useState<"all" | "cash" | "credit" | "collection">("all");
  const [homeSearch, setHomeSearch] = useState("");
  const [showAllHome, setShowAllHome] = useState(false);
  const [recordsFilter, setRecordsFilter] = useState<"all" | "cash" | "credit" | "collection" | "purchases">("all");
  const [recordsSearch, setRecordsSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");

  const t = words[language];
  const activeProducts = useMemo(() => {
    return state.products && state.products.length ? state.products : defaultProducts;
  }, [state.products]);

  // Initial Load & Realtime Subscription
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

        if (useLocal && localLedger.customers.length + localLedger.transactions.length > 0) {
          const { error: recoveryError } = await supabase
            .from("dairy_ledger")
            .upsert({ id: "main", value: localLedger, updated_at: localLedger.updatedAt || new Date().toISOString() });
          if (recoveryError) throw recoveryError;
        }
        setSyncError(false);
      } catch {
        setSyncError(true);
        setState(localLedger);
      } finally {
        setLoaded(true);
      }
    };

    loadLedger();

    const channel = supabase
      .channel("dairy_ledger_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "dairy_ledger", filter: "id=eq.main" },
        (payload) => {
          if (payload.new && (payload.new as any).value) {
            const remoteLedger = normalizeLedger((payload.new as any).value);
            setState((current) => {
              if (ledgerFreshness(remoteLedger) > ledgerFreshness(current)) {
                localStorage.setItem("doodh-saathi-ledger-v2", JSON.stringify(remoteLedger));
                return remoteLedger;
              }
              return current;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Persist
  const persist = async (next: Omit<LedgerState, "updatedAt"> | LedgerState) => {
    const savedLedger: LedgerState = {
      ...next,
      products: next.products && next.products.length ? next.products : activeProducts,
      updatedAt: new Date().toISOString(),
    };
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
      setSyncError(true);
    } finally {
      setSaving(false);
    }
  };

  const forceSyncFromCloud = async () => {
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from("dairy_ledger")
        .select("value")
        .eq("id", "main")
        .maybeSingle();
      if (error) throw error;
      if (data?.value) {
        const cloudLedger = normalizeLedger(data.value);
        setState(cloudLedger);
        localStorage.setItem("doodh-saathi-ledger-v2", JSON.stringify(cloudLedger));
        setSyncError(false);
      }
    } catch {
      setSyncError(true);
    } finally {
      setSaving(false);
    }
  };

  const exportBackup = () => {
    const backupData = {
      appName: "Doodh-Saathi",
      exportDate: new Date().toISOString(),
      state,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dudh-sathi-backup-${localDateKey()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filtered lists for Home
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
    return state.transactions.filter((item) => {
      if (period !== "all" && new Date(item.createdAt) < start) return false;
      if (homeFilter !== "all" && item.payment !== homeFilter) return false;
      if (homeSearch.trim()) {
        const query = homeSearch.trim().toLowerCase();
        const p = getProduct(activeProducts, item.productId);
        const nameMatch = (item.customerName || "").toLowerCase().includes(query);
        const prodMatch = p.name.toLowerCase().includes(query) || p.hindi.toLowerCase().includes(query);
        return nameMatch || prodMatch;
      }
      return true;
    });
  }, [state.transactions, period, homeFilter, homeSearch, activeProducts]);

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
    return state.purchases.filter((item) => {
      if (period !== "all" && new Date(item.createdAt) < start) return false;
      return true;
    });
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

  const openSale = (productId?: string) => {
    setSelectedProduct(productId || activeProducts[0]?.id || "milk-small");
    setSaleOpen(true);
  };

  // Save Sale with Custom Rate & Custom Total Amount
  const saveSale = (
    qty: number,
    payment: "cash" | "credit",
    customerId?: string,
    entryDate = localDateKey(),
    newCustomerName?: string,
    newCustomerPhone?: string,
    saveNewCustomerToList = true,
    customRate?: number,
    customTotal?: number,
  ) => {
    const product = getProduct(activeProducts, selectedProduct);
    const unitRate = customRate !== undefined && customRate > 0 ? customRate : product.sell;
    const finalTotal = customTotal !== undefined && customTotal >= 0 ? customTotal : unitRate * qty;
    const totalCost = product.buy * qty;

    const existingCustomer = state.customers.find((item) => item.id === customerId);
    const trimmedNewName = newCustomerName?.trim();

    let finalCustomerId = existingCustomer?.id;
    let finalCustomerName = existingCustomer?.name ?? (trimmedNewName || undefined);
    let nextCustomers = [...state.customers];

    if (trimmedNewName && (saveNewCustomerToList || payment === "credit")) {
      const createdId = crypto.randomUUID();
      finalCustomerId = createdId;
      nextCustomers = [
        {
          id: createdId,
          name: trimmedNewName,
          phone: newCustomerPhone?.trim() || "",
          productId: selectedProduct,
          dailyQty: qty,
          due: payment === "credit" ? finalTotal : 0,
          active: true,
        },
        ...nextCustomers,
      ];
    } else if (existingCustomer && payment === "credit") {
      nextCustomers = nextCustomers.map((item) =>
        item.id === existingCustomer.id ? { ...item, due: item.due + finalTotal } : item
      );
    }

    const transaction: Transaction = {
      id: crypto.randomUUID(),
      productId: selectedProduct,
      qty,
      unitRate,
      total: finalTotal,
      cost: totalCost,
      payment,
      customerId: finalCustomerId,
      customerName: finalCustomerName,
      customerPhone: existingCustomer?.phone || newCustomerPhone?.trim(),
      createdAt: timestampForDate(entryDate),
    };

    persist({
      ...state,
      transactions: [transaction, ...state.transactions],
      customers: nextCustomers,
      purchases: state.purchases,
    });
    setSaleOpen(false);
  };

  // Product Management Functions
  const saveProduct = (productData: Omit<Product, "id">, editingId?: string) => {
    let nextProducts: Product[];
    if (editingId) {
      nextProducts = activeProducts.map((p) => p.id === editingId ? { ...productData, id: editingId } : p);
    } else {
      nextProducts = [...activeProducts, { ...productData, id: crypto.randomUUID() }];
    }
    persist({
      ...state,
      products: nextProducts,
    });
    setProductModalOpen(false);
    setEditingProduct(null);
  };

  const removeProduct = (productId: string) => {
    if (activeProducts.length <= 1) {
      alert(language === "hi" ? "कम से कम 1 सामान होना ज़रूरी है।" : "At least 1 product is required.");
      return;
    }
    if (!window.confirm(language === "hi" ? "क्या आप इस सामान को हटाना चाहते हैं?" : "Delete this product?")) return;
    const nextProducts = activeProducts.filter((p) => p.id !== productId);
    persist({
      ...state,
      products: nextProducts,
    });
    if (selectedProduct === productId) {
      setSelectedProduct(nextProducts[0].id);
    }
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
      ...state,
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
        customerPhone: collecting.phone,
        createdAt: timestampForDate(entryDate),
      }, ...state.transactions],
      purchases: state.purchases,
    });
    setCollecting(null);
  };

  const recordDailyDelivery = (customer: Customer) => {
    const product = getProduct(activeProducts, customer.productId);
    const transaction: Transaction = {
      id: crypto.randomUUID(),
      productId: customer.productId,
      qty: customer.dailyQty,
      total: product.sell * customer.dailyQty,
      cost: product.buy * customer.dailyQty,
      payment: "credit",
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      createdAt: new Date().toISOString(),
    };
    persist({
      ...state,
      transactions: [transaction, ...state.transactions],
      customers: state.customers.map((item) =>
        item.id === customer.id ? { ...item, due: item.due + transaction.total } : item
      ),
      purchases: state.purchases,
    });
  };

  const savePurchases = (entries: Array<{ productId: string; qty: number; amount: number }>, entryDate: string) => {
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

  // Single Day Ledger calculations
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

  // All-Days Daily Track calculation
  const allDaysList = useMemo(() => {
    const dateMap = new Map<string, {
      date: string;
      transactions: Transaction[];
      purchases: Purchase[];
      cashSales: number;
      cashCount: number;
      creditSales: number;
      creditCount: number;
      collections: number;
      purchasesTotal: number;
      revenue: number;
      profit: number;
    }>();

    for (const tx of state.transactions) {
      const d = localDateKey(new Date(tx.createdAt));
      if (!dateMap.has(d)) {
        dateMap.set(d, {
          date: d,
          transactions: [],
          purchases: [],
          cashSales: 0,
          cashCount: 0,
          creditSales: 0,
          creditCount: 0,
          collections: 0,
          purchasesTotal: 0,
          revenue: 0,
          profit: 0,
        });
      }
      const entry = dateMap.get(d)!;
      entry.transactions.push(tx);
      if (tx.payment === "cash") {
        entry.cashSales += tx.total;
        entry.cashCount += 1;
        entry.revenue += tx.total;
      } else if (tx.payment === "credit") {
        entry.creditSales += tx.total;
        entry.creditCount += 1;
        entry.revenue += tx.total;
      } else if (tx.payment === "collection") {
        entry.collections += tx.total;
      }
    }

    for (const p of state.purchases) {
      const d = localDateKey(new Date(p.createdAt));
      if (!dateMap.has(d)) {
        dateMap.set(d, {
          date: d,
          transactions: [],
          purchases: [],
          cashSales: 0,
          cashCount: 0,
          creditSales: 0,
          creditCount: 0,
          collections: 0,
          purchasesTotal: 0,
          revenue: 0,
          profit: 0,
        });
      }
      const entry = dateMap.get(d)!;
      entry.purchases.push(p);
      entry.purchasesTotal += p.amount;
    }

    for (const entry of dateMap.values()) {
      entry.profit = entry.revenue - entry.purchasesTotal;
    }

    return Array.from(dateMap.values()).sort((a, b) => b.date.localeCompare(a.date));
  }, [state.transactions, state.purchases]);

  const filteredBookTransactions = useMemo(() => {
    return bookTransactions.filter((item) => {
      if (recordsFilter !== "all" && recordsFilter !== "purchases" && item.payment !== recordsFilter) return false;
      if (recordsSearch.trim()) {
        const q = recordsSearch.trim().toLowerCase();
        const p = getProduct(activeProducts, item.productId);
        const nameMatch = (item.customerName || "").toLowerCase().includes(q);
        const prodMatch = p.name.toLowerCase().includes(q) || p.hindi.toLowerCase().includes(q);
        return nameMatch || prodMatch;
      }
      return true;
    });
  }, [bookTransactions, recordsFilter, recordsSearch, activeProducts]);

  const displayedCustomers = useMemo(() => {
    if (!customerSearch.trim()) return state.customers;
    const q = customerSearch.trim().toLowerCase();
    return state.customers.filter((c) =>
      c.name.toLowerCase().includes(q) || (c.phone || "").includes(q)
    );
  }, [state.customers, customerSearch]);

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
          <NavItem active={page === "records"} icon="book" label={t.dailyTrack} onClick={() => setPage("records")} />
        </nav>

        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
          <button
            className="backup-btn"
            style={{ width: "100%", justifyContent: "center" }}
            onClick={exportBackup}
            title={t.exportBackup}
          >
            <Icon name="download" size={16} />
            {t.exportBackup}
          </button>
          <button
            className={`sync-btn ${syncError ? "error" : "live"}`}
            style={{ width: "100%", justifyContent: "center" }}
            onClick={forceSyncFromCloud}
            title={t.refreshCloud}
          >
            <Icon name="cloud" size={17} />
            {saving ? t.syncing : syncError ? t.localOnly : t.synced}
          </button>
        </div>
      </aside>

      <main>
        <header className="topbar">
          <div>
            <p className="eyebrow">{new Date().toLocaleDateString(language === "hi" ? "hi-IN" : "en-IN", { weekday: "long", day: "numeric", month: "long" })}</p>
            <h1>{page === "home" ? `${t.greeting} — ${t.simpleSummary}` : page === "customers" ? t.monthlyCustomers : t.allDaysHeader}</h1>
            <p className="subtext">{page === "home" ? t.subtitle : page === "customers" ? `${state.customers.length} ${t.active}` : t.allDaysSubtext}</p>
          </div>
          <div className="header-actions">
            <button
              className="backup-btn"
              onClick={exportBackup}
              title={t.exportBackup}
            >
              <Icon name="download" size={15} />
              {t.exportBackup}
            </button>
            <button
              className={`sync-btn ${syncError ? "error" : "live"}`}
              onClick={forceSyncFromCloud}
              title={t.refreshCloud}
            >
              <Icon name="refresh" size={15} />
              {saving ? t.syncing : syncError ? t.localOnly : t.synced}
            </button>
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
                {(["day", "week", "month", "all"] as Period[]).map((item) => (
                  <button key={item} className={period === item ? "active" : ""} onClick={() => setPeriod(item)}>
                    {item === "day" ? t.today : item === "week" ? t.week : item === "month" ? t.month : t.allTime}
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

              {/* Products Section with Add/Edit Product Option */}
              <section className="panel products-panel">
                <div className="section-heading">
                  <div>
                    <h2>{t.quick}</h2>
                    <p>{t.chooseProduct}</p>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      className="secondary-button"
                      style={{ padding: "7px 12px", fontSize: 12 }}
                      onClick={() => { setEditingProduct(null); setProductModalOpen(true); }}
                    >
                      <Icon name="plus" size={16} />{t.addProduct}
                    </button>
                    <button className="stock-shortcut" onClick={() => setPurchaseOpen(true)}>
                      <Icon name="box" size={17} />{t.addPurchase}
                    </button>
                  </div>
                </div>

                <div className="product-grid">
                  {activeProducts.map((product) => (
                    <div className="product-card" key={product.id}>
                      <button
                        className="product-card-edit"
                        title={t.editProduct}
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingProduct(product);
                          setProductModalOpen(true);
                        }}
                      >
                        <Icon name="edit" size={14} />
                      </button>

                      <div
                        style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", cursor: "pointer" }}
                        onClick={() => openSale(product.id)}
                      >
                        <div className={`product-icon ${product.color}`}>
                          <Icon name="milk" size={25} />
                        </div>
                        <div className="product-copy">
                          <strong>{language === "hi" ? product.hindi : product.name}</strong>
                          <span>{product.size}</span>
                          <small>{t.buy} {money(product.buy)} · {t.sell} {money(product.sell)}</small>
                        </div>
                        <div className="price" style={{ marginLeft: "auto" }}>
                          {money(product.sell)}
                          <Icon name="chevron" size={18} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Recent Activity */}
              <section className="panel activity-panel">
                <div className="section-heading">
                  <div>
                    <h2>{t.recent}</h2>
                    <p>{language === "hi" ? "नकद एवं उधार बिक्री का हिसाब (ग्राहक नाम व विशेष रकम सहित)" : "Sales with customer names & payment mode"}</p>
                  </div>
                  <button className="text-button" onClick={() => { setPage("records"); setTrackMode("all-days"); }}>
                    {t.viewAll} ({state.transactions.length})<Icon name="chevron" size={16} />
                  </button>
                </div>

                <div className="filter-bar">
                  <button className={`filter-chip ${homeFilter === "all" ? "active" : ""}`} onClick={() => setHomeFilter("all")}>
                    {t.allFilter} <span className="chip-count">{filteredTransactions.length}</span>
                  </button>
                  <button className={`filter-chip ${homeFilter === "cash" ? "active cash" : ""}`} onClick={() => setHomeFilter("cash")}>
                    <Icon name="wallet" size={14} /> {t.cashFilter}
                  </button>
                  <button className={`filter-chip ${homeFilter === "credit" ? "active credit" : ""}`} onClick={() => setHomeFilter("credit")}>
                    <Icon name="book" size={14} /> {t.creditFilter}
                  </button>
                  <button className={`filter-chip ${homeFilter === "collection" ? "active" : ""}`} onClick={() => setHomeFilter("collection")}>
                    <Icon name="rupee" size={14} /> {t.collectionFilter}
                  </button>

                  <div className="search-input-box">
                    <Icon name="search" size={15} />
                    <input
                      placeholder={t.searchPlaceholder}
                      value={homeSearch}
                      onChange={(e) => setHomeSearch(e.target.value)}
                    />
                    {homeSearch && <button className="clear-btn" onClick={() => setHomeSearch("")}>✕</button>}
                  </div>
                </div>

                <TransactionList
                  transactions={showAllHome ? filteredTransactions : filteredTransactions.slice(0, 7)}
                  products={activeProducts}
                  language={language}
                  empty={t.noActivity}
                  onDelete={removeTransaction}
                />

                {filteredTransactions.length > 7 && (
                  <div className="view-more-bar">
                    <button onClick={() => setShowAllHome(!showAllHome)}>
                      {showAllHome ? t.showLess : `${t.showAllToday} (${filteredTransactions.length})`}
                    </button>
                  </div>
                )}
              </section>
            </>
          )}

          {page === "customers" && (
            <section className="panel customer-panel">
              <div className="section-heading">
                <div>
                  <h2>{t.monthlyCustomers}</h2>
                  <p>{language === "hi" ? "नियमित ग्राहक और खाता-बही (उधार व नकद रिकॉर्ड)" : "Regular customer accounts, daily delivery and statement"}</p>
                </div>
                <button className="secondary-button" onClick={() => setCustomerOpen(true)}><Icon name="plus" size={19} />{t.addCustomer}</button>
              </div>

              <div className="filter-bar">
                <div className="search-input-box" style={{ maxWidth: 360 }}>
                  <Icon name="search" size={16} />
                  <input
                    placeholder={t.searchByNameOrPhone}
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                  />
                  {customerSearch && <button className="clear-btn" onClick={() => setCustomerSearch("")}>✕</button>}
                </div>
              </div>

              <div className="customer-list">
                {!displayedCustomers.length && <div className="empty-state">{t.noCustomers}</div>}
                {displayedCustomers.map((customer) => {
                  const product = getProduct(activeProducts, customer.productId);
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
                        <button className="mini-icon-button" title={t.customerStatement} onClick={() => setViewingCustomerHistory(customer)}><Icon name="history" size={16} /></button>
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
              <div className="track-mode-toggle">
                <button
                  className={trackMode === "all-days" ? "active" : ""}
                  onClick={() => setTrackMode("all-days")}
                >
                  <Icon name="calendar" size={16} />
                  {t.allDaysTrack} ({allDaysList.length} {language === "hi" ? "दिन" : "days"})
                </button>
                <button
                  className={trackMode === "single-day" ? "active" : ""}
                  onClick={() => setTrackMode("single-day")}
                >
                  <Icon name="book" size={16} />
                  {t.singleDayView}
                </button>
              </div>

              {trackMode === "all-days" ? (
                <div className="daily-track-container">
                  {!allDaysList.length && <div className="panel empty-state">{t.noActivity}</div>}
                  {allDaysList.map((dayItem) => {
                    const isToday = dayItem.date === localDateKey();
                    const dayDateObj = new Date(`${dayItem.date}T12:00:00`);
                    const formattedDate = dayDateObj.toLocaleDateString(language === "hi" ? "hi-IN" : "en-IN", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    });

                    return (
                      <article className="daily-track-card" key={dayItem.date}>
                        <div className="daily-track-header">
                          <div className="daily-track-date">
                            <Icon name="calendar" size={20} />
                            <strong>{formattedDate}</strong>
                            {isToday && <span className="date-badge">{t.today}</span>}
                          </div>
                          <button
                            className="secondary-button"
                            style={{ padding: "6px 12px", fontSize: 12 }}
                            onClick={() => {
                              setBookDate(dayItem.date);
                              setTrackMode("single-day");
                            }}
                          >
                            {t.viewDayDetails} <Icon name="chevron" size={14} />
                          </button>
                        </div>

                        <div className="daily-track-metrics">
                          <div className="metric-chip cash">
                            <span>{t.cash} ({t.received})</span>
                            <strong>{money(dayItem.cashSales + dayItem.collections)}</strong>
                            <small>{dayItem.cashCount} {t.cashSale.toLowerCase()}</small>
                          </div>
                          <div className="metric-chip credit">
                            <span>{t.credit} ({t.dues})</span>
                            <strong>{money(dayItem.creditSales)}</strong>
                            <small>{dayItem.creditCount} {t.creditSale.toLowerCase()}</small>
                          </div>
                          <div className="metric-chip purchase">
                            <span>{t.purchases}</span>
                            <strong>{money(dayItem.purchasesTotal)}</strong>
                            <small>{dayItem.purchases.length} {t.purchases.toLowerCase()}</small>
                          </div>
                          <div className="metric-chip">
                            <span>{t.sales}</span>
                            <strong>{money(dayItem.revenue)}</strong>
                            <small>{dayItem.transactions.filter(x => x.payment !== "collection").length} {t.items.toLowerCase()}</small>
                          </div>
                          <div className={`metric-chip ${dayItem.profit >= 0 ? "profit" : "loss"}`}>
                            <span>{dayItem.profit >= 0 ? t.profit : t.loss}</span>
                            <strong>{money(Math.abs(dayItem.profit))}</strong>
                            <small>{t.sales} − {t.purchases}</small>
                          </div>
                        </div>

                        <div className="day-preview-list">
                          <TransactionList
                            transactions={dayItem.transactions.slice(0, 4)}
                            products={activeProducts}
                            language={language}
                            empty={t.noActivity}
                            onDelete={removeTransaction}
                          />
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
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
                    <div className={bookRevenue - bookSpent >= 0 ? "profit" : "loss"}>
                      <span>{bookRevenue - bookSpent >= 0 ? t.netProfit : t.loss}</span>
                      <strong>{money(Math.abs(bookRevenue - bookSpent))}</strong>
                    </div>
                  </section>

                  <section className="panel purchase-panel">
                    <div className="section-heading">
                      <div><h2>{t.dayPurchases}</h2><p>{t.addPurchase}</p></div>
                      <button className="secondary-button" onClick={() => setPurchaseOpen(true)}><Icon name="plus" size={18} />{t.add}</button>
                    </div>
                    <PurchaseList
                      purchases={bookPurchases}
                      products={activeProducts}
                      language={language}
                      empty={t.noActivity}
                      onDelete={removePurchase}
                    />
                  </section>

                  <section className="panel activity-panel">
                    <div className="section-heading">
                      <div><h2>{t.daySales}</h2><p>{language === "hi" ? "इस दिन की नकद व उधार बिक्री (ग्राहक नाम व विशेष रकम सहित)" : "Sales with customer names & payment mode"}</p></div>
                      <button className="primary-button" onClick={() => openSale()} style={{ padding: "8px 14px", fontSize: 13 }}>
                        <Icon name="plus" size={17} />{t.quickSale}
                      </button>
                    </div>

                    <div className="filter-bar">
                      <button className={`filter-chip ${recordsFilter === "all" ? "active" : ""}`} onClick={() => setRecordsFilter("all")}>
                        {t.allFilter} <span className="chip-count">{bookTransactions.length}</span>
                      </button>
                      <button className={`filter-chip ${recordsFilter === "cash" ? "active cash" : ""}`} onClick={() => setRecordsFilter("cash")}>
                        <Icon name="wallet" size={13} /> {t.cashFilter}
                      </button>
                      <button className={`filter-chip ${recordsFilter === "credit" ? "active credit" : ""}`} onClick={() => setRecordsFilter("credit")}>
                        <Icon name="book" size={13} /> {t.creditFilter}
                      </button>
                      <button className={`filter-chip ${recordsFilter === "collection" ? "active" : ""}`} onClick={() => setRecordsFilter("collection")}>
                        <Icon name="rupee" size={13} /> {t.collectionFilter}
                      </button>

                      <div className="search-input-box">
                        <Icon name="search" size={15} />
                        <input
                          placeholder={t.searchPlaceholder}
                          value={recordsSearch}
                          onChange={(e) => setRecordsSearch(e.target.value)}
                        />
                        {recordsSearch && <button className="clear-btn" onClick={() => setRecordsSearch("")}>✕</button>}
                      </div>
                    </div>

                    <TransactionList
                      transactions={filteredBookTransactions}
                      products={activeProducts}
                      language={language}
                      empty={t.noActivity}
                      onDelete={removeTransaction}
                    />
                  </section>
                </>
              )}
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

      {saleOpen && (
        <SaleModal
          language={language}
          selected={selectedProduct}
          products={activeProducts}
          customers={state.customers}
          defaultDate={page === "records" ? bookDate : localDateKey()}
          onProduct={setSelectedProduct}
          onClose={() => setSaleOpen(false)}
          onSave={saveSale}
        />
      )}

      {purchaseOpen && (
        <PurchaseModal
          language={language}
          products={activeProducts}
          defaultDate={page === "records" ? bookDate : localDateKey()}
          onClose={() => setPurchaseOpen(false)}
          onSave={savePurchases}
        />
      )}

      {customerOpen && (
        <CustomerModal
          language={language}
          products={activeProducts}
          customer={editingCustomer}
          onClose={() => { setCustomerOpen(false); setEditingCustomer(null); }}
          onSave={saveCustomer}
        />
      )}

      {productModalOpen && (
        <ProductModal
          language={language}
          product={editingProduct}
          onClose={() => { setProductModalOpen(false); setEditingProduct(null); }}
          onSave={saveProduct}
          onDelete={removeProduct}
        />
      )}

      {collecting && (
        <CollectModal
          language={language}
          customer={collecting}
          onClose={() => setCollecting(null)}
          onSave={collectDue}
        />
      )}

      {viewingCustomerHistory && (
        <CustomerHistoryModal
          language={language}
          customer={viewingCustomerHistory}
          products={activeProducts}
          transactions={state.transactions.filter(t => t.customerId === viewingCustomerHistory.id)}
          onClose={() => setViewingCustomerHistory(null)}
          onCollect={() => {
            const c = viewingCustomerHistory;
            setViewingCustomerHistory(null);
            setCollecting(c);
          }}
        />
      )}

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

function TransactionList({
  transactions,
  products,
  language,
  empty,
  onDelete,
}: {
  transactions: Transaction[];
  products: Product[];
  language: Language;
  empty: string;
  onDelete?: (item: Transaction) => void;
}) {
  if (!transactions.length) return <div className="empty-state">{empty}</div>;
  const t = words[language];
  return (
    <div className="transaction-list">
      {transactions.map((item) => {
        const product = getProduct(products, item.productId);
        const collection = item.payment === "collection";
        const hasCustomer = Boolean(item.customerName);
        const hasCustomRate = item.unitRate && item.unitRate !== product.sell;
        return (
          <article className="transaction-row" key={item.id}>
            <div className={`transaction-icon ${collection ? "collection" : product.color}`}>
              <Icon name={collection ? "wallet" : "milk"} size={20} />
            </div>
            <div className="transaction-main">
              <strong>{collection ? (language === "hi" ? "उधार जमा" : "Due collected") : (language === "hi" ? product.hindi : product.name)}</strong>
              <span>
                {collection
                  ? (item.customerName || t.customer)
                  : `${item.qty} × ${money(item.unitRate || product.sell)}`}
                {hasCustomRate && (
                  <span className="custom-rate-badge">
                    {t.customPriceBadge}
                  </span>
                )}
              </span>
              {hasCustomer && (
                <div className={`customer-tag ${item.payment === "cash" ? "cash-tag" : item.payment === "credit" ? "credit-tag" : "collection-tag"}`}>
                  <Icon name="users" size={11} /> {item.customerName}
                </div>
              )}
            </div>
            <div className="transaction-meta">
              <strong className={collection ? "positive" : ""}>{collection ? "+" : ""}{money(item.total)}</strong>
              <span>{new Date(item.createdAt).toLocaleTimeString(language === "hi" ? "hi-IN" : "en-IN", { hour: "numeric", minute: "2-digit" })}</span>
            </div>
            <div className={`payment-pill ${item.payment}`}>
              {item.payment === "cash" ? (language === "hi" ? "नकद" : "Cash") : item.payment === "credit" ? (language === "hi" ? "उधार" : "Due") : (language === "hi" ? "जमा" : "Paid")}
            </div>
            {onDelete && <button className="row-delete" title={t.delete} onClick={() => onDelete(item)}><Icon name="trash" size={15} /></button>}
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

/* Sale Modal with Custom Rate & Custom Total Amount Edit Options */
function SaleModal({
  language,
  selected,
  products,
  customers,
  defaultDate,
  onProduct,
  onClose,
  onSave,
}: {
  language: Language;
  selected: string;
  products: Product[];
  customers: Customer[];
  defaultDate: string;
  onProduct: (id: string) => void;
  onClose: () => void;
  onSave: (
    qty: number,
    payment: "cash" | "credit",
    customerId?: string,
    entryDate?: string,
    newCustomerName?: string,
    newCustomerPhone?: string,
    saveNewCustomerToList?: boolean,
    customRate?: number,
    customTotal?: number,
  ) => void;
}) {
  const t = words[language];
  const product = getProduct(products, selected);

  const [qty, setQty] = useState(1);
  const [unitRate, setUnitRate] = useState<number>(product.sell);
  const [totalAmount, setTotalAmount] = useState<number>(product.sell * 1);
  const [isTotalManuallyEdited, setIsTotalManuallyEdited] = useState(false);

  const [payment, setPayment] = useState<"cash" | "credit">("cash");
  const [customerMode, setCustomerMode] = useState<"old" | "new" | "walkin">("old");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [saveToPermanentList, setSaveToPermanentList] = useState(true);
  const [entryDate, setEntryDate] = useState(defaultDate);

  // When selected product changes, reset unit rate and total
  useEffect(() => {
    setUnitRate(product.sell);
    setTotalAmount(product.sell * qty);
    setIsTotalManuallyEdited(false);
  }, [selected]);

  // Update total when qty changes
  const handleQtyChange = (newQty: number) => {
    const q = Math.max(1, newQty);
    setQty(q);
    if (!isTotalManuallyEdited) {
      setTotalAmount(unitRate * q);
    }
  };

  // Update unit rate
  const handleRateChange = (newRate: number) => {
    setUnitRate(newRate);
    setTotalAmount(newRate * qty);
    setIsTotalManuallyEdited(false);
  };

  // Directly edit total amount (for random/custom lump-sum amount)
  const handleTotalChange = (newTotal: number) => {
    setTotalAmount(newTotal);
    setIsTotalManuallyEdited(true);
    if (qty > 0 && newTotal > 0) {
      setUnitRate(Math.round((newTotal / qty) * 10) / 10);
    }
  };

  const matchingCustomers = useMemo(() => {
    if (!customerSearch.trim()) return customers;
    const q = customerSearch.trim().toLowerCase();
    return customers.filter((c) => c.name.toLowerCase().includes(q) || (c.phone || "").includes(q));
  }, [customers, customerSearch]);

  const selectedCustomerObj = customers.find((c) => c.id === selectedCustomerId);

  const canSave = useMemo(() => {
    if (!entryDate || totalAmount < 0) return false;
    if (payment === "credit") {
      if (customerMode === "old") return Boolean(selectedCustomerId);
      if (customerMode === "new") return Boolean(newCustomerName.trim());
      return false;
    }
    if (customerMode === "old") return true;
    if (customerMode === "new") return Boolean(newCustomerName.trim());
    return true;
  }, [entryDate, totalAmount, payment, customerMode, selectedCustomerId, newCustomerName]);

  const calculatedCost = product.buy * qty;
  const calculatedProfit = totalAmount - calculatedCost;

  return (
    <Modal title={t.quickSale} onClose={onClose}>
      <div className="modal-body">
        <label>{t.product}</label>
        <div className="choice-grid">
          {products.map((item) => (
            <button key={item.id} className={selected === item.id ? "active" : ""} onClick={() => onProduct(item.id)}>
              {language === "hi" ? item.hindi : item.name}
              <span>{money(item.sell)}</span>
            </button>
          ))}
        </div>

        <label>{t.quantity}</label>
        <div className="stepper">
          <button onClick={() => handleQtyChange(qty - 1)}>−</button>
          <strong>{qty}</strong>
          <button onClick={() => handleQtyChange(qty + 1)}>+</button>
        </div>

        {/* Amount & Rate Edit Grid (Allows custom rate or direct lump sum total!) */}
        <div className="amount-edit-grid">
          <div className="amount-field">
            <label htmlFor="sale-unit-rate">
              {t.customRate}
              {unitRate !== product.sell && <span className="custom-rate-badge">{t.customPriceBadge}</span>}
            </label>
            <div className="amount-input-box">
              <span>₹</span>
              <input
                id="sale-unit-rate"
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                value={unitRate || ""}
                onChange={(e) => handleRateChange(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="amount-field">
            <label htmlFor="sale-total-amount">
              {t.customTotalAmount}
              {isTotalManuallyEdited && <span className="custom-rate-badge">{t.customPriceBadge}</span>}
            </label>
            <div className="amount-input-box">
              <span>₹</span>
              <input
                id="sale-total-amount"
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                value={totalAmount || ""}
                onChange={(e) => handleTotalChange(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        <label>{t.payment}</label>
        <div className="payment-choices">
          <button className={payment === "cash" ? "active" : ""} onClick={() => setPayment("cash")}>
            <Icon name="rupee" size={20} />{t.cash}
          </button>
          <button
            className={payment === "credit" ? "active" : ""}
            onClick={() => {
              setPayment("credit");
              if (customerMode === "walkin") setCustomerMode("old");
            }}
          >
            <Icon name="book" size={20} />{t.credit}
          </button>
        </div>

        {/* Customer Selector */}
        <div className="credit-customer-box">
          <label>{t.customer}</label>
          <div className={`customer-mode-nav ${payment === "credit" ? "two-col" : ""}`}>
            <button
              type="button"
              className={customerMode === "old" ? "active" : ""}
              onClick={() => setCustomerMode("old")}
            >
              <Icon name="userCheck" size={15} />
              {t.existingCustomer}
            </button>
            <button
              type="button"
              className={customerMode === "new" ? "active" : ""}
              onClick={() => setCustomerMode("new")}
            >
              <Icon name="userPlus" size={15} />
              {t.newCustomer}
            </button>
            {payment === "cash" && (
              <button
                type="button"
                className={customerMode === "walkin" ? "active" : ""}
                onClick={() => setCustomerMode("walkin")}
              >
                <Icon name="wallet" size={15} />
                {t.walkinCash}
              </button>
            )}
          </div>

          {customerMode === "old" && (
            <div>
              {selectedCustomerObj ? (
                <div className="selected-customer-pill">
                  <div className="pill-info">
                    <div className="avatar" style={{ width: 34, height: 34, fontSize: 13 }}>
                      {selectedCustomerObj.name.charAt(0)}
                    </div>
                    <div>
                      <strong>{selectedCustomerObj.name}</strong>
                      <span>{selectedCustomerObj.phone ? `${selectedCustomerObj.phone} · ` : ""}{t.dueNow}: {money(selectedCustomerObj.due)}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="change-btn"
                    onClick={() => setSelectedCustomerId("")}
                  >
                    {t.changeCustomer}
                  </button>
                </div>
              ) : (
                <>
                  <div className="customer-search">
                    <Icon name="search" size={17} />
                    <input
                      id="customer-search"
                      value={customerSearch}
                      placeholder={t.searchCustomer}
                      onChange={(event) => setCustomerSearch(event.target.value)}
                    />
                    {customerSearch && (
                      <button className="icon-button" style={{ width: 24, height: 24 }} onClick={() => setCustomerSearch("")}>✕</button>
                    )}
                  </div>
                  <div className="customer-results">
                    {matchingCustomers.map((customer) => (
                      <button
                        key={customer.id}
                        type="button"
                        onClick={() => {
                          setSelectedCustomerId(customer.id);
                          setCustomerSearch("");
                        }}
                      >
                        <div className="avatar" style={{ width: 28, height: 28, fontSize: 11 }}>
                          {customer.name.charAt(0)}
                        </div>
                        <span>
                          {customer.name}
                          <small>{customer.phone ? `${customer.phone} · ` : ""}{t.dueNow}: {money(customer.due)}</small>
                        </span>
                        <Icon name="chevron" size={15} />
                      </button>
                    ))}
                    {!matchingCustomers.length && <p>{t.noCustomerFound}</p>}
                  </div>
                </>
              )}
            </div>
          )}

          {customerMode === "new" && (
            <div>
              <div className="field" style={{ marginBottom: 10 }}>
                <label htmlFor="new-customer-name">{t.newCustomerName} *</label>
                <input
                  id="new-customer-name"
                  placeholder={language === "hi" ? "उदा. रमेश भाई" : "e.g. Ramesh Bhai"}
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="field" style={{ marginBottom: 10 }}>
                <label htmlFor="new-customer-phone">{t.newCustomerPhone}</label>
                <input
                  id="new-customer-phone"
                  inputMode="tel"
                  placeholder={language === "hi" ? "10 अंकों का मोबाइल नंबर" : "10-digit mobile number"}
                  value={newCustomerPhone}
                  onChange={(e) => setNewCustomerPhone(e.target.value)}
                />
              </div>
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={saveToPermanentList}
                  onChange={(e) => setSaveToPermanentList(e.target.checked)}
                />
                <span>{t.saveToCustomerList}</span>
              </label>
            </div>
          )}

          {customerMode === "walkin" && (
            <div className="walkin-box">
              <p><Icon name="check" size={16} />{t.walkinCash}</p>
              <small>{t.walkinHint}</small>
            </div>
          )}
        </div>

        <div className="field">
          <label htmlFor="sale-date">{t.entryDate}</label>
          <input
            id="sale-date"
            type="date"
            max={localDateKey()}
            value={entryDate}
            onChange={(event) => setEntryDate(event.target.value)}
          />
        </div>

        <div className="sale-total">
          <span>{t.total}</span>
          <strong>{money(totalAmount)}</strong>
          <small style={{ color: calculatedProfit >= 0 ? "var(--green)" : "var(--orange)" }}>
            {calculatedProfit >= 0 ? `${t.profit}: +${money(calculatedProfit)}` : `${t.loss}: -${money(Math.abs(calculatedProfit))}`}
          </small>
        </div>

        <button
          className="modal-primary"
          disabled={!canSave}
          onClick={() => {
            const customerIdParam = customerMode === "old" ? selectedCustomerId || undefined : undefined;
            const newNameParam = customerMode === "new" ? newCustomerName.trim() : undefined;
            const newPhoneParam = customerMode === "new" ? newCustomerPhone.trim() : undefined;
            onSave(
              qty,
              payment,
              customerIdParam,
              entryDate,
              newNameParam,
              newPhoneParam,
              saveToPermanentList,
              unitRate,
              totalAmount,
            );
          }}
        >
          <Icon name="check" size={20} />{t.saveSale}
        </button>
      </div>
    </Modal>
  );
}

/* Add / Edit Product Modal */
function ProductModal({
  language,
  product,
  onClose,
  onSave,
  onDelete,
}: {
  language: Language;
  product: Product | null;
  onClose: () => void;
  onSave: (productData: Omit<Product, "id">, editingId?: string) => void;
  onDelete: (id: string) => void;
}) {
  const t = words[language];
  const [name, setName] = useState(product?.name ?? "");
  const [hindi, setHindi] = useState(product?.hindi ?? "");
  const [size, setSize] = useState(product?.size ?? "1 liter");
  const [buy, setBuy] = useState(product ? String(product.buy) : "30");
  const [sell, setSell] = useState(product ? String(product.sell) : "35");
  const [color, setColor] = useState(product?.color ?? "blue");

  const colors = ["blue", "cyan", "violet", "orange", "green", "rose", "amber"];

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(
      {
        name: name.trim(),
        hindi: hindi.trim() || name.trim(),
        size: size.trim() || "1 unit",
        buy: Math.max(0, Number(buy) || 0),
        sell: Math.max(0, Number(sell) || 0),
        color,
      },
      product?.id
    );
  };

  return (
    <Modal title={product ? t.editProduct : t.addProduct} onClose={onClose}>
      <form className="modal-body form" onSubmit={submit}>
        <div className="field">
          <label htmlFor="prod-name-en">{t.productNameEn} *</label>
          <input
            id="prod-name-en"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={language === "hi" ? "उदा. Paneer, Ghee, Cow Milk" : "e.g. Paneer, Cow Milk"}
          />
        </div>

        <div className="field">
          <label htmlFor="prod-name-hi">{t.productNameHi}</label>
          <input
            id="prod-name-hi"
            value={hindi}
            onChange={(e) => setHindi(e.target.value)}
            placeholder={language === "hi" ? "उदा. पनीर, गाय का दूध" : "e.g. पनीर, गाय का दूध"}
          />
        </div>

        <div className="field">
          <label htmlFor="prod-size">{t.productUnit}</label>
          <input
            id="prod-size"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            placeholder={language === "hi" ? "उदा. 1 लीटर, 500g, 1 किलो" : "e.g. 1 liter, 500g, 1 kg"}
          />
        </div>

        <div className="amount-edit-grid">
          <div className="amount-field">
            <label htmlFor="prod-buy-rate">{t.defaultBuy} *</label>
            <div className="amount-input-box">
              <span>₹</span>
              <input
                id="prod-buy-rate"
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                value={buy}
                onChange={(e) => setBuy(e.target.value)}
              />
            </div>
          </div>

          <div className="amount-field">
            <label htmlFor="prod-sell-rate">{t.defaultSell} *</label>
            <div className="amount-input-box">
              <span>₹</span>
              <input
                id="prod-sell-rate"
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                value={sell}
                onChange={(e) => setSell(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="field" style={{ marginBottom: 20 }}>
          <label>{t.colorTheme}</label>
          <div className="color-swatches">
            {colors.map((c) => (
              <button
                key={c}
                type="button"
                className={`color-swatch-btn ${c} ${color === c ? "selected" : ""}`}
                onClick={() => setColor(c)}
              >
                {color === c && <Icon name="check" size={14} />}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          {product && (
            <button
              type="button"
              className="mini-icon-button danger"
              style={{ width: 48, height: 48, flex: "0 0 48px" }}
              title={t.deleteProduct}
              onClick={() => {
                onDelete(product.id);
                onClose();
              }}
            >
              <Icon name="trash" size={18} />
            </button>
          )}
          <button className="modal-primary" type="submit" disabled={!name.trim() || !sell}>
            <Icon name="check" size={20} />{product ? t.save : t.addProduct}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function PurchaseList({
  purchases,
  products,
  language,
  empty,
  onDelete,
}: {
  purchases: Purchase[];
  products: Product[];
  language: Language;
  empty: string;
  onDelete: (purchase: Purchase) => void;
}) {
  if (!purchases.length) return <div className="empty-state">{empty}</div>;
  return (
    <div className="purchase-list">
      {purchases.map((purchase) => {
        const product = getProduct(products, purchase.productId);
        return (
          <article className="purchase-row" key={purchase.id}>
            <div className={`transaction-icon ${product.color}`}><Icon name="box" size={19} /></div>
            <div>
              <strong>{language === "hi" ? product.hindi : product.name}</strong>
              <span>{purchase.qty} × {money(purchase.amount / purchase.qty)}</span>
            </div>
            <time>{new Date(purchase.createdAt).toLocaleDateString(language === "hi" ? "hi-IN" : "en-IN", { day: "numeric", month: "short" })}</time>
            <strong>{money(purchase.amount)}</strong>
            <button className="row-delete" title={words[language].delete} onClick={() => onDelete(purchase)}><Icon name="trash" size={15} /></button>
          </article>
        );
      })}
    </div>
  );
}

function PurchaseModal({
  language,
  products,
  defaultDate,
  onClose,
  onSave,
}: {
  language: Language;
  products: Product[];
  defaultDate: string;
  onClose: () => void;
  onSave: (entries: Array<{ productId: string; qty: number; amount: number }>, entryDate: string) => void;
}) {
  const t = words[language];
  const [entryDate, setEntryDate] = useState(defaultDate);
  const [rows, setRows] = useState(() => products.map((product) => ({ productId: product.id, qty: 0, rate: product.buy })));

  const updateRow = (productId: string, field: "qty" | "rate", value: number) => {
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
            const product = getProduct(products, row.productId);
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

function CustomerModal({
  language,
  products,
  customer,
  onClose,
  onSave,
}: {
  language: Language;
  products: Product[];
  customer: Customer | null;
  onClose: () => void;
  onSave: (customer: Omit<Customer, "id" | "due" | "active">) => void;
}) {
  const t = words[language];
  const [name, setName] = useState(customer?.name ?? "");
  const [phone, setPhone] = useState(customer?.phone ?? "");
  const [productId, setProductId] = useState<string>(customer?.productId ?? products[0]?.id ?? "milk-500");
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
        <div className="field">
          <label htmlFor="product">{t.product}</label>
          <select id="product" value={productId} onChange={(event) => setProductId(event.target.value)}>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {language === "hi" ? product.hindi : product.name} — {money(product.sell)}
              </option>
            ))}
          </select>
        </div>
        <label>{t.quantity}</label>
        <div className="stepper"><button type="button" onClick={() => setDailyQty(Math.max(1, dailyQty - 1))}>−</button><strong>{dailyQty}</strong><button type="button" onClick={() => setDailyQty(dailyQty + 1)}>+</button></div>
        <button className="modal-primary" type="submit" disabled={!name.trim()}><Icon name={customer ? "check" : "plus"} size={20} />{customer ? t.save : t.add}</button>
      </form>
    </Modal>
  );
}

function CollectModal({
  language,
  customer,
  onClose,
  onSave,
}: {
  language: Language;
  customer: Customer;
  onClose: () => void;
  onSave: (amount: number, entryDate?: string) => void;
}) {
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

function CustomerHistoryModal({
  language,
  customer,
  products,
  transactions,
  onClose,
  onCollect,
}: {
  language: Language;
  customer: Customer;
  products: Product[];
  transactions: Transaction[];
  onClose: () => void;
  onCollect: () => void;
}) {
  const t = words[language];
  const product = getProduct(products, customer.productId);

  const totalBought = transactions
    .filter((tx) => tx.payment !== "collection")
    .reduce((sum, tx) => sum + tx.total, 0);

  const totalPaid = transactions
    .filter((tx) => tx.payment === "cash" || tx.payment === "collection")
    .reduce((sum, tx) => sum + tx.total, 0);

  return (
    <Modal title={`${customer.name} — ${t.customerStatement}`} onClose={onClose}>
      <div className="modal-body">
        <div className="collect-person" style={{ marginBottom: 14 }}>
          <div className="avatar">{customer.name.charAt(0)}</div>
          <div>
            <strong>{customer.name}</strong>
            <span>{customer.phone || "—"} · {t.daily} {customer.dailyQty} × {language === "hi" ? product.hindi : product.name}</span>
          </div>
        </div>

        <div className="history-summary">
          <div>
            <span>{t.totalBought}</span>
            <strong>{money(totalBought)}</strong>
          </div>
          <div>
            <span>{t.totalPaid}</span>
            <strong>{money(totalPaid)}</strong>
          </div>
          <div>
            <span>{t.balanceDue}</span>
            <strong className="due-highlight">{money(customer.due)}</strong>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <label style={{ margin: 0 }}>{t.allTransactions} ({transactions.length})</label>
          {customer.due > 0 && (
            <button className="collect-button" style={{ padding: "6px 12px" }} onClick={onCollect}>
              <Icon name="rupee" size={14} /> {t.collectMoney}
            </button>
          )}
        </div>

        <div style={{ maxHeight: 280, overflowY: "auto", border: "1px solid var(--line)", borderRadius: 12, padding: "4px 8px" }}>
          {!transactions.length ? (
            <div className="empty-state" style={{ padding: 20 }}>{t.noCustomerHistory}</div>
          ) : (
            <TransactionList
              transactions={transactions}
              products={products}
              language={language}
              empty={t.noCustomerHistory}
            />
          )}
        </div>
      </div>
    </Modal>
  );
}
