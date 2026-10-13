import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { supabase } from "../utils/supabase/client";
import amulGoldImg from "./assets/products/amul-gold.jpg";
import amulTaazaImg from "./assets/products/amul-taaza.jpg";
import amulChhashImg from "./assets/products/amul-chhash.png";
import amulDahiImg from "./assets/products/amul-dahi.jpg";

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
  image?: string;
};

type Customer = {
  id: string;
  name: string;
  phone: string;
  productId: string;
  dailyQty: number;
  due: number;
  active: boolean;
  customRate?: number;
};

type Transaction = {
  id: string;
  productId: string;
  qty: number;
  unitRate?: number;
  total: number;
  cost: number;
  payment: "cash" | "credit" | "collection" | "self";
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

type DayProductStat = {
  productId: string;
  name: string;
  hindi: string;
  size: string;
  soldQty: number;
  soldRevenue: number;
  selfQty?: number;
  selfCost?: number;
  boughtQty: number;
  boughtCost: number;
  profit: number;
};

type DayLedgerItem = {
  date: string;
  transactions: Transaction[];
  purchases: Purchase[];
  cashSales: number;
  cashCount: number;
  creditSales: number;
  creditCount: number;
  selfUseCost: number;
  selfUseCount: number;
  selfUseUnits: number;
  collections: number;
  collectionsCount: number;
  purchasesTotal: number;
  purchasesCount: number;
  revenue: number;
  receivedTotal: number;
  gallaCash: number;
  unitsSold: number;
  stockBoughtUnits: number;
  profit: number;
  marginPercent: number;
  productStats: DayProductStat[];
};

const defaultProducts: Product[] = [
  { id: "milk-500", name: "Amul Gold Milk", hindi: "अमूल गोल्ड दूध", size: "500 ml", buy: 33, sell: 35, color: "rose", image: amulGoldImg },
  { id: "milk-small", name: "Amul Taaza Milk", hindi: "अमूल ताज़ा दूध", size: "500 ml", buy: 26, sell: 28, color: "blue", image: amulTaazaImg },
  { id: "buttermilk", name: "Amul Buttermilk (Chhash)", hindi: "अमूल छाछ", size: "500 ml", buy: 15, sell: 18, color: "green", image: amulChhashImg },
  { id: "dahi", name: "Amul Masti Dahi", hindi: "अमूल मस्ती दही", size: "400 g", buy: 30, sell: 34, color: "amber", image: amulDahiImg },
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
    udharKhata: "Udhar Khata",
    viewUdhar: "View Udhar",
    clearPayment: "Clear Payment",
    clearPaymentTitle: "Clear Due Payment",
    clearDue: "Clear Due",
    cleared: "Clear",
    allCustomers: "All Customers",
    dueCustomersOnly: "Pending Udhar",
    noPendingDue: "No pending dues! All accounts clear.",
    clearFullPayment: "Clear Full Due",
    remainingDue: "Remaining balance",
    dueSummaryBanner: "Total Pending Dues",
    clearPaymentSuccess: "Payment cleared successfully!",
    selectCustomerPrompt: "Select customer to clear payment",
    searchByNameOrPhone: "Search by customer name or phone...",
    editPrice: "Edit Price",
    editRate: "Edit rate",
    editRateHint: "Customer prices differ — adjust rate below",
    customerSpecialRate: "Special rate for this customer (₹)",
    customerSpecialRateHint: "Leave empty to use standard price",
    customerRateBadge: "Customer price",
    saveAsDefaultCustomerRate: "Save this price as customer's permanent rate",
    dailyEntryForCustomer: "Daily Milk Entry",
    differentPriceHint: "Prices differ by customer — customize today's rate or quantity here",
    updateEntry: "Update Entry",
    editEntry: "Edit Entry",
    productImage: "Product Photo",
    presetAmulGold: "Amul Gold (Red)",
    presetAmulTaaza: "Amul Taaza (Blue)",
    presetAmulChhash: "Amul Chhash (Green)",
    presetAmulDahi: "Amul Masti Dahi",
    customImageUrl: "Image URL",
    noImage: "Icon only",
    gallaCash: "Cash in Drawer (Galla)",
    gallaCashHint: "Cash Sales + Collections − Morning Stock",
    milkVolume: "Milk / Items Sold",
    unitsSold: "Units sold",
    stockBoughtUnits: "Stock bought",
    dayAnalytics: "Day-wise Business Analytics",
    allDaysSummary: "Daily Tracking Summary",
    totalTrackedDays: "Tracked Days",
    avgDailySales: "Avg. Daily Sales",
    bestDay: "Top Sales Day",
    productBreakdown: "Product-wise Breakdown",
    dayTimeline: "Day Entries & History",
    addSaleForDay: "Add Sale",
    addStockForDay: "Add Stock",
    expandDay: "Details",
    collapseDay: "Close",
    dayStock: "Morning Stock Purchases",
    daySalesUdhar: "Sales & Udhar Khata",
    filterDays: "Filter Days",
    last7Days: "Last 7 Days",
    last30Days: "This Month",
    allDates: "All Dates",
    currentDue: "Current Due / Balance (₹)",
    currentDueHint: "Edit customer's current balance if needed",
    units: "Units",
    marginPercent: "Margin %",
    profitable: "Profitable",
    lossDay: "Loss",
    editPurchase: "Edit Morning Stock",
    adjustDue: "Adjust Balance",
    daySummary: "Day Summary",
    stockVsSales: "Stock vs Sales Reconciliation",
    selfUse: "Self Use (Home)",
    selfUseTitle: "Personal / Home Consumption",
    selfUseDescription: "Items taken from shop for personal/home use",
    selfUseNotice: "This entry is for household/personal use. Evaluated at buy cost with no customer dues and no counter cash.",
    selfUseAtCost: "At Buy Cost (No Profit)",
    selfUseFree: "Free (₹0)",
    totalSelfUse: "Total Self Use",
    logSelfUse: "+ Home Use",
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
    udharKhata: "उधार खाता",
    viewUdhar: "उधार देखें",
    clearPayment: "पेमेंट क्लियर",
    clearPaymentTitle: "उधार जमा — पेमेंट क्लियर करें",
    clearDue: "उधार चुकता",
    cleared: "क्लियर",
    allCustomers: "सभी ग्राहक",
    dueCustomersOnly: "केवल उधार वाले",
    noPendingDue: "कोई उधार बाकी नहीं है! सबका हिसाब चुकता है।",
    clearFullPayment: "पूरा उधार क्लियर करें",
    remainingDue: "बाकी बचेगा",
    dueSummaryBanner: "कुल बाकी उधार",
    clearPaymentSuccess: "पेमेंट क्लियर हो गई और हिसाब दर्ज हो गया!",
    selectCustomerPrompt: "जिस ग्राहक का उधार जमा करना है उसे चुनें",
    searchByNameOrPhone: "नाम या मोबाइल नंबर से ग्राहक खोजें...",
    editPrice: "भाव बदलें",
    editRate: "भाव बदलें",
    editRateHint: "हर ग्राहक का भाव अलग हो सकता है — यहाँ भाव बदलें",
    customerSpecialRate: "ग्राहक का विशेष भाव (₹/इकाई)",
    customerSpecialRateHint: "सामान्य भाव रखने के लिए खाली छोड़ें",
    customerRateBadge: "ग्राहक भाव",
    saveAsDefaultCustomerRate: "इस ग्राहक का पक्का भाव यह रखें",
    dailyEntryForCustomer: "दैनिक दूध एंट्री",
    differentPriceHint: "हर ग्राहक के लिए अलग भाव — यहाँ आज का भाव या मात्रा बदलें",
    updateEntry: "एंट्री अपडेट करें",
    editEntry: "एंट्री बदलें",
    productImage: "सामान की फोटो",
    presetAmulGold: "अमूल गोल्ड (लाल)",
    presetAmulTaaza: "अमूल ताज़ा (नीला)",
    presetAmulChhash: "अमूल छाछ (हरा)",
    presetAmulDahi: "अमूल मस्ती दही",
    customImageUrl: "फोटो लिंक (URL)",
    noImage: "केवल रंग/आइकन",
    gallaCash: "गल्ले का नकद",
    gallaCashHint: "नकद बिक्री + जमा − खरीद खर्च",
    milkVolume: "कुल दूध व सामान बिका",
    unitsSold: "इकाई बिकी",
    stockBoughtUnits: "खरीदा माल",
    dayAnalytics: "दैनिक व्यापार विश्लेषण",
    allDaysSummary: "दैनिक ट्रैक सारांश",
    totalTrackedDays: "कुल दिन",
    avgDailySales: "औसत दैनिक बिक्री",
    bestDay: "सर्वश्रेष्ठ बिक्री दिन",
    productBreakdown: "सामान अनुसार हिसाब",
    dayTimeline: "दिन का पूरा लेन-देन",
    addSaleForDay: "बिक्री जोड़ें",
    addStockForDay: "खरीद जोड़ें",
    expandDay: "विवरण",
    collapseDay: "बंद करें",
    dayStock: "सुबह का माल खरीद",
    daySalesUdhar: "बिक्री और उधार",
    filterDays: "दिन फ़िल्टर",
    last7Days: "पिछले 7 दिन",
    last30Days: "इस महीने",
    allDates: "सभी तारीखें",
    currentDue: "वर्तमान बाकी उधार (₹)",
    currentDueHint: "ग्राहक का वर्तमान बाकी उधार बदलें (यदि संशोधन हो)",
    units: "इकाई",
    marginPercent: "मार्जिन %",
    profitable: "मुनाफ़ा",
    lossDay: "नुकसान",
    editPurchase: "सुबह की खरीद बदलें",
    adjustDue: "उधार सुधारें",
    daySummary: "दिन का सारांश",
    stockVsSales: "खरीद व बिक्री मिलान",
    selfUse: "घर खर्च (खुद का उपयोग)",
    selfUseTitle: "घर खर्च / खुद का उपयोग",
    selfUseDescription: "दुकान से खुद के परिवार/घर के लिए निकाला गया सामान",
    selfUseNotice: "यह सामान घर खर्च के लिए निकाला गया है। इसे खरीद भाव (लागत मूल्य) पर गिना गया है - इससे नकद गल्ला या ग्राहक खाते पर कोई असर नहीं पड़ेगा।",
    selfUseAtCost: "खरीद भाव पर (लागत)",
    selfUseFree: "मुफ्त (₹0)",
    totalSelfUse: "कुल घर खर्च",
    logSelfUse: "+ घर खर्च दर्ज करें",
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
    chevronDown: <path d="m6 9 6 6 6-6" />,
    chevronUp: <path d="m18 15-6-6-6 6" />,
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
    chart: <><path d="M3 3v18h18" /><path d="m7 14 4-4 4 4 5-5" /></>,
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

type ProductPresetKey = "milk-500" | "milk-small" | "buttermilk" | "dahi";

const PRODUCT_ASSETS: Record<ProductPresetKey, { bundled: string; publicUrl: string; name: string; hindi: string }> = {
  "milk-500": { bundled: amulGoldImg, publicUrl: "/products/amul-gold.jpg", name: "Amul Gold Milk", hindi: "अमूल गोल्ड दूध" },
  "milk-small": { bundled: amulTaazaImg, publicUrl: "/products/amul-taaza.jpg", name: "Amul Taaza Milk", hindi: "अमूल ताज़ा दूध" },
  "buttermilk": { bundled: amulChhashImg, publicUrl: "/products/amul-chhash.png", name: "Amul Buttermilk (Chhash)", hindi: "अमूल छाछ" },
  "dahi": { bundled: amulDahiImg, publicUrl: "/products/amul-dahi.jpg", name: "Amul Masti Dahi", hindi: "अमूल मस्ती दही" },
};

function detectProductPresetKey(str?: string): ProductPresetKey | null {
  if (!str) return null;
  const s = str.toLowerCase();
  if (s === "milk-500" || s.includes("amul-gold") || s.includes("gold") || s.includes("गोल्ड") || s.includes("500 ml") || s.includes("500ml")) {
    return "milk-500";
  }
  if (s === "milk-small" || s.includes("amul-taaza") || s.includes("taaza") || s.includes("ताज़ा") || s.includes("ताजा") || s.includes("small milk") || s.includes("छोटा दूध")) {
    return "milk-small";
  }
  if (s === "buttermilk" || s.includes("amul-chhash") || s.includes("chhash") || s.includes("छाछ") || s.includes("chhachh") || s.includes("buttermilk")) {
    return "buttermilk";
  }
  if (s === "dahi" || s.includes("amul-dahi") || s.includes("dahi") || s.includes("दही") || s.includes("masti")) {
    return "dahi";
  }
  return null;
}

const defaultImageMap: Record<string, { image: string; name?: string; hindi?: string }> = {
  "milk-500": { image: amulGoldImg, name: "Amul Gold Milk", hindi: "अमूल गोल्ड दूध" },
  "milk-small": { image: amulTaazaImg, name: "Amul Taaza Milk", hindi: "अमूल ताज़ा दूध" },
  "buttermilk": { image: amulChhashImg, name: "Amul Buttermilk (Chhash)", hindi: "अमूल छाछ" },
  "dahi": { image: amulDahiImg, name: "Amul Masti Dahi", hindi: "अमूल मस्ती दही" },
};

const productImageMap: Record<string, string> = {
  "milk-500": amulGoldImg,
  "milk-small": amulTaazaImg,
  "buttermilk": amulChhashImg,
  "dahi": amulDahiImg,
  "/products/amul-gold.jpg": amulGoldImg,
  "/products/amul-taaza.jpg": amulTaazaImg,
  "/products/amul-chhash.png": amulChhashImg,
  "/products/amul-dahi.jpg": amulDahiImg,
  "products/amul-gold.jpg": amulGoldImg,
  "products/amul-taaza.jpg": amulTaazaImg,
  "products/amul-chhash.png": amulChhashImg,
  "products/amul-dahi.jpg": amulDahiImg,
};

function getProductPrimaryImage(product?: Partial<Product> | string): string | undefined {
  if (!product) return undefined;
  if (typeof product === "string") {
    if (/^https?:\/\//i.test(product) || product.startsWith("data:") || product.startsWith("blob:")) {
      return product;
    }
    const detected = detectProductPresetKey(product);
    if (detected && PRODUCT_ASSETS[detected]) {
      return PRODUCT_ASSETS[detected].bundled || PRODUCT_ASSETS[detected].publicUrl;
    }
    if (productImageMap[product]) return productImageMap[product];
    return product;
  }

  // If product has a custom web image or data URL, keep it
  if (product.image && (/^https?:\/\//i.test(product.image) || product.image.startsWith("data:") || product.image.startsWith("blob:"))) {
    return product.image;
  }

  // Identify preset by id first, then image, then name
  const detected =
    detectProductPresetKey(product.id) ||
    detectProductPresetKey(product.image) ||
    detectProductPresetKey(`${product.name || ""} ${product.hindi || ""}`);

  if (detected && PRODUCT_ASSETS[detected]) {
    return PRODUCT_ASSETS[detected].bundled || PRODUCT_ASSETS[detected].publicUrl;
  }

  return product.image;
}

function getProductFallbackImage(product?: Partial<Product> | string): string | undefined {
  if (!product) return undefined;
  const str = typeof product === "string" ? product : `${product.id || ""} ${product.image || ""} ${product.name || ""}`;
  const detected = detectProductPresetKey(str);
  if (detected && PRODUCT_ASSETS[detected]) {
    return PRODUCT_ASSETS[detected].publicUrl;
  }
  return undefined;
}

function resolveProductImage(imgOrId?: string): string | undefined {
  if (!imgOrId) return undefined;
  return getProductPrimaryImage(imgOrId);
}

const normalizeLedger = (value: Partial<LedgerState> | null): LedgerState => {
  const baseProducts = Array.isArray(value?.products) && value.products.length ? value.products : defaultProducts;
  const mergedProducts = baseProducts.map((p) => {
    const presetKey = detectProductPresetKey(p.id) || detectProductPresetKey(p.name) || detectProductPresetKey(p.image);
    let resolvedImage = p.image;
    if (presetKey && PRODUCT_ASSETS[presetKey]) {
      const isCustomExternal = p.image && (/^https?:\/\//i.test(p.image) || p.image.startsWith("data:") || p.image.startsWith("blob:"));
      if (!isCustomExternal) {
        resolvedImage = PRODUCT_ASSETS[presetKey].bundled || PRODUCT_ASSETS[presetKey].publicUrl;
      }
    } else {
      resolvedImage = getProductPrimaryImage(p) || p.image;
    }

    const preset = presetKey ? PRODUCT_ASSETS[presetKey] : undefined;
    if (preset) {
      return {
        ...p,
        image: resolvedImage,
        name: p.name === "Small Milk" || p.name === "Milk 500ml" ? (preset.name || p.name) : p.name,
        hindi: p.hindi === "छोटा दूध" || p.hindi === "दूध 500ml" ? (preset.hindi || p.hindi) : p.hindi,
      };
    }
    return { ...p, image: resolvedImage };
  });

  return {
    customers: Array.isArray(value?.customers) ? value.customers : [],
    transactions: Array.isArray(value?.transactions) ? value.transactions : [],
    purchases: Array.isArray(value?.purchases) ? value.purchases : [],
    products: mergedProducts,
    updatedAt: typeof value?.updatedAt === "string" ? value.updatedAt : "",
  };
};

function ProductThumb({
  product,
  size = 42,
  className = "",
}: {
  product?: Product;
  size?: number;
  className?: string;
}) {
  if (!product) return null;

  const primarySrc = getProductPrimaryImage(product);
  const fallbackSrc = getProductFallbackImage(product);

  const [imgSrc, setImgSrc] = useState<string | undefined>(primarySrc || fallbackSrc);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const src = getProductPrimaryImage(product) || getProductFallbackImage(product);
    setImgSrc(src);
    setFailed(false);
  }, [product.id, product.image, product.name]);

  const handleImgError = () => {
    // If bundled import fails in browser, seamlessly fall back to static public URL
    if (fallbackSrc && imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
    } else {
      setFailed(true);
    }
  };

  const showImg = Boolean(imgSrc && !failed);

  return (
    <div
      className={`product-thumb ${product.color || "blue"} ${className}`}
      style={{ width: size, height: size }}
      title={product.name}
    >
      {showImg ? (
        <img
          src={imgSrc}
          alt={product.name}
          className="product-thumb-img"
          onError={handleImgError}
          loading="eager"
        />
      ) : (
        <Icon name="milk" size={Math.max(14, Math.round(size * 0.52))} />
      )}
    </div>
  );
}

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
  const [customerTab, setCustomerTab] = useState<"all" | "due">("all");
  const [clearPaymentModalOpen, setClearPaymentModalOpen] = useState(false);
  const [clearPaymentCustomer, setClearPaymentCustomer] = useState<Customer | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);
  const [saleModalDate, setSaleModalDate] = useState<string | null>(null);
  const [purchaseModalDate, setPurchaseModalDate] = useState<string | null>(null);
  const [customerEntryTarget, setCustomerEntryTarget] = useState<Customer | null>(null);
  const [expandedDayCards, setExpandedDayCards] = useState<Record<string, "sales" | "stock" | "products" | null>>({});

  // Filters & Search
  const [homeFilter, setHomeFilter] = useState<"all" | "cash" | "credit" | "collection" | "self">("all");
  const [homeSearch, setHomeSearch] = useState("");
  const [showAllHome, setShowAllHome] = useState(false);
  const [recordsFilter, setRecordsFilter] = useState<"all" | "cash" | "credit" | "collection" | "self" | "purchases">("all");
  const [recordsSearch, setRecordsSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [dailyTrackRange, setDailyTrackRange] = useState<"all" | "7days" | "month">("all");
  const [dailyTrackSearch, setDailyTrackSearch] = useState("");
  const [saleInitialPayment, setSaleInitialPayment] = useState<"cash" | "credit" | "self">("cash");

  const t = words[language];
  const activeProducts = useMemo(() => {
    return state.products && state.products.length ? state.products : defaultProducts;
  }, [state.products]);

  const dueCustomers = useMemo(() => {
    return state.customers.filter((c) => c.due > 0);
  }, [state.customers]);

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
    const regularSales = filteredTransactions.filter((item) => item.payment === "cash" || item.payment === "credit");
    const selfUseList = filteredTransactions.filter((item) => item.payment === "self");
    const selfUseCost = selfUseList.reduce((sum, item) => sum + (item.cost || item.total), 0);
    const selfUseUnits = selfUseList.reduce((sum, item) => sum + item.qty, 0);

    const received = filteredTransactions
      .filter((item) => item.payment === "cash" || item.payment === "collection")
      .reduce((sum, item) => sum + item.total, 0);
    const spent = filteredPurchases.reduce((sum, item) => sum + item.amount, 0);
    const revenue = regularSales.reduce((sum, item) => sum + item.total, 0);
    const cost = regularSales.reduce((sum, item) => sum + item.cost, 0);

    return {
      revenue,
      cost,
      received,
      spent,
      items: regularSales.reduce((sum, item) => sum + item.qty, 0),
      selfUseCost,
      selfUseUnits,
      selfUseCount: selfUseList.length,
      due: state.customers.reduce((sum, customer) => sum + customer.due, 0),
    };
  }, [filteredTransactions, filteredPurchases, state.customers]);

  const openSale = (productId?: string, date?: string, initialPayment: "cash" | "credit" | "self" = "cash") => {
    setSelectedProduct(productId || activeProducts[0]?.id || "milk-small");
    setSaleModalDate(date || null);
    setSaleInitialPayment(initialPayment);
    setSaleOpen(true);
  };

  const openPurchase = (date?: string) => {
    setPurchaseModalDate(date || null);
    setPurchaseOpen(true);
  };

  const updatePurchase = (updatedPurchase: Purchase) => {
    persist({
      ...state,
      purchases: state.purchases.map((p) => (p.id === updatedPurchase.id ? updatedPurchase : p)),
    });
    setEditingPurchase(null);
  };

  const toggleDayTab = (date: string, tab: "sales" | "stock" | "products") => {
    setExpandedDayCards((prev) => {
      const current = prev[date];
      if (current === tab) {
        const next = { ...prev };
        delete next[date];
        return next;
      }
      return { ...prev, [date]: tab };
    });
  };

  // Save Sale with Custom Rate & Custom Total Amount (supports Cash, Due, and Self-use)
  const saveSale = (
    qty: number,
    payment: "cash" | "credit" | "self",
    customerId?: string,
    entryDate = localDateKey(),
    newCustomerName?: string,
    newCustomerPhone?: string,
    saveNewCustomerToList = true,
    customRate?: number,
    customTotal?: number,
    saveRateAsCustomerDefault = false,
  ) => {
    const product = getProduct(activeProducts, selectedProduct);
    const defaultRate = payment === "self" ? product.buy : product.sell;
    const unitRate = customRate !== undefined && customRate >= 0 ? customRate : defaultRate;
    const finalTotal = customTotal !== undefined && customTotal >= 0 ? customTotal : unitRate * qty;
    const totalCost = product.buy * qty;

    const existingCustomer = state.customers.find((item) => item.id === customerId);
    const trimmedNewName = newCustomerName?.trim();

    let finalCustomerId = payment === "self" ? undefined : existingCustomer?.id;
    let finalCustomerName = payment === "self"
      ? (language === "hi" ? "घर खर्च (खुद का उपयोग)" : "Self Use (Home)")
      : existingCustomer?.name ?? (trimmedNewName || undefined);
    let nextCustomers = [...state.customers];

    if (payment !== "self") {
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
            customRate: saveRateAsCustomerDefault ? unitRate : undefined,
          },
          ...nextCustomers,
        ];
      } else if (existingCustomer) {
        nextCustomers = nextCustomers.map((item) => {
          if (item.id !== existingCustomer.id) return item;
          const newDue = payment === "credit" ? item.due + finalTotal : item.due;
          const newRate = saveRateAsCustomerDefault ? unitRate : item.customRate;
          return { ...item, due: newDue, customRate: newRate };
        });
      }
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
      customerPhone: payment === "self" ? undefined : (existingCustomer?.phone || newCustomerPhone?.trim()),
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

  const saveCustomer = (customer: Omit<Customer, "id" | "active"> & { due?: number }) => {
    persist({
      ...state,
      customers: editingCustomer
        ? state.customers.map((item) =>
            item.id === editingCustomer.id
              ? { ...item, ...customer, due: customer.due !== undefined ? customer.due : item.due }
              : item
          )
        : [
            {
              ...customer,
              id: crypto.randomUUID(),
              due: customer.due ?? 0,
              active: true,
            },
            ...state.customers,
          ],
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

  const handleClearPayment = (customerId: string, amount: number, entryDate = localDateKey()) => {
    const cust = state.customers.find((c) => c.id === customerId);
    if (!cust || amount <= 0) return;
    const paid = Math.min(amount, cust.due);
    persist({
      ...state,
      customers: state.customers.map((item) =>
        item.id === cust.id ? { ...item, due: Math.max(0, item.due - paid) } : item
      ),
      transactions: [
        {
          id: crypto.randomUUID(),
          productId: cust.productId || (activeProducts[0]?.id ?? "milk-small"),
          qty: 0,
          total: paid,
          cost: 0,
          payment: "collection",
          customerId: cust.id,
          customerName: cust.name,
          customerPhone: cust.phone,
          createdAt: timestampForDate(entryDate),
        },
        ...state.transactions,
      ],
      purchases: state.purchases,
    });
    setClearPaymentModalOpen(false);
    setClearPaymentCustomer(null);
  };

  const recordDailyDelivery = (customer: Customer) => {
    const product = getProduct(activeProducts, customer.productId);
    const unitRate = customer.customRate && customer.customRate > 0 ? customer.customRate : product.sell;
    const finalTotal = unitRate * customer.dailyQty;
    const totalCost = product.buy * customer.dailyQty;
    const transaction: Transaction = {
      id: crypto.randomUUID(),
      productId: customer.productId,
      qty: customer.dailyQty,
      unitRate,
      total: finalTotal,
      cost: totalCost,
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

  const saveCustomerDailyEntry = (
    customer: Customer,
    productId: string,
    qty: number,
    unitRate: number,
    total: number,
    payment: "credit" | "cash",
    entryDate: string,
    saveAsDefaultRate: boolean,
  ) => {
    const product = getProduct(activeProducts, productId);
    const cost = product.buy * qty;
    const transaction: Transaction = {
      id: crypto.randomUUID(),
      productId,
      qty,
      unitRate,
      total,
      cost,
      payment,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      createdAt: timestampForDate(entryDate),
    };
    const nextCustomers = state.customers.map((c) => {
      if (c.id !== customer.id) return c;
      return {
        ...c,
        due: payment === "credit" ? c.due + total : c.due,
        customRate: saveAsDefaultRate ? unitRate : c.customRate,
      };
    });
    persist({
      ...state,
      transactions: [transaction, ...state.transactions],
      customers: nextCustomers,
      purchases: state.purchases,
    });
    setCustomerEntryTarget(null);
  };

  const updateTransaction = (updatedTx: Transaction, saveCustomerRate = false) => {
    const oldTx = state.transactions.find((t) => t.id === updatedTx.id);
    if (!oldTx) return;

    let nextCustomers = [...state.customers];

    // Revert old transaction effect on old customer's due
    if (oldTx.customerId) {
      nextCustomers = nextCustomers.map((c) => {
        if (c.id !== oldTx.customerId) return c;
        let due = c.due;
        if (oldTx.payment === "credit") due = Math.max(0, due - oldTx.total);
        if (oldTx.payment === "collection") due = due + oldTx.total;
        return { ...c, due };
      });
    }

    // Apply updated transaction effect on customer's due
    if (updatedTx.customerId) {
      nextCustomers = nextCustomers.map((c) => {
        if (c.id !== updatedTx.customerId) return c;
        let due = c.due;
        if (updatedTx.payment === "credit") due = due + updatedTx.total;
        if (updatedTx.payment === "collection") due = Math.max(0, due - updatedTx.total);
        const customRate = saveCustomerRate && updatedTx.unitRate ? updatedTx.unitRate : c.customRate;
        return { ...c, due, customRate };
      });
    }

    persist({
      ...state,
      transactions: state.transactions.map((t) => (t.id === updatedTx.id ? updatedTx : t)),
      customers: nextCustomers,
      purchases: state.purchases,
    });
    setEditingTransaction(null);
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
  const allDaysList: DayLedgerItem[] = useMemo(() => {
    const dateMap = new Map<string, {
      date: string;
      transactions: Transaction[];
      purchases: Purchase[];
      cashSales: number;
      cashCount: number;
      creditSales: number;
      creditCount: number;
      selfUseCost: number;
      selfUseCount: number;
      selfUseUnits: number;
      collections: number;
      collectionsCount: number;
      purchasesTotal: number;
      purchasesCount: number;
      revenue: number;
      receivedTotal: number;
      gallaCash: number;
      unitsSold: number;
      stockBoughtUnits: number;
      profit: number;
      marginPercent: number;
      productStatsMap: Map<string, DayProductStat>;
    }>();

    const getOrCreate = (d: string) => {
      if (!dateMap.has(d)) {
        const prodMap = new Map<string, DayProductStat>();
        for (const prod of activeProducts) {
          prodMap.set(prod.id, {
            productId: prod.id,
            name: prod.name,
            hindi: prod.hindi,
            size: prod.size,
            soldQty: 0,
            soldRevenue: 0,
            selfQty: 0,
            selfCost: 0,
            boughtQty: 0,
            boughtCost: 0,
            profit: 0,
          });
        }
        dateMap.set(d, {
          date: d,
          transactions: [],
          purchases: [],
          cashSales: 0,
          cashCount: 0,
          creditSales: 0,
          creditCount: 0,
          selfUseCost: 0,
          selfUseCount: 0,
          selfUseUnits: 0,
          collections: 0,
          collectionsCount: 0,
          purchasesTotal: 0,
          purchasesCount: 0,
          revenue: 0,
          receivedTotal: 0,
          gallaCash: 0,
          unitsSold: 0,
          stockBoughtUnits: 0,
          profit: 0,
          marginPercent: 0,
          productStatsMap: prodMap,
        });
      }
      return dateMap.get(d)!;
    };

    for (const tx of state.transactions) {
      const d = localDateKey(new Date(tx.createdAt));
      const entry = getOrCreate(d);
      entry.transactions.push(tx);

      if (tx.payment === "cash") {
        entry.cashSales += tx.total;
        entry.cashCount += 1;
        entry.revenue += tx.total;
        entry.receivedTotal += tx.total;
      } else if (tx.payment === "credit") {
        entry.creditSales += tx.total;
        entry.creditCount += 1;
        entry.revenue += tx.total;
      } else if (tx.payment === "collection") {
        entry.collections += tx.total;
        entry.collectionsCount += 1;
        entry.receivedTotal += tx.total;
      } else if (tx.payment === "self") {
        entry.selfUseCost += (tx.cost || tx.total);
        entry.selfUseCount += 1;
        entry.selfUseUnits += tx.qty;
      }

      if (tx.payment !== "collection") {
        entry.unitsSold += tx.qty;
        let stat = entry.productStatsMap.get(tx.productId);
        if (!stat) {
          const prod = getProduct(activeProducts, tx.productId);
          stat = {
            productId: prod.id,
            name: prod.name,
            hindi: prod.hindi,
            size: prod.size,
            soldQty: 0,
            soldRevenue: 0,
            selfQty: 0,
            selfCost: 0,
            boughtQty: 0,
            boughtCost: 0,
            profit: 0,
          };
          entry.productStatsMap.set(tx.productId, stat);
        }
        if (tx.payment === "self") {
          stat.selfQty = (stat.selfQty || 0) + tx.qty;
          stat.selfCost = (stat.selfCost || 0) + (tx.cost || tx.total);
        } else {
          stat.soldQty += tx.qty;
          stat.soldRevenue += tx.total;
        }
      }
    }

    for (const p of state.purchases) {
      const d = localDateKey(new Date(p.createdAt));
      const entry = getOrCreate(d);
      entry.purchases.push(p);
      entry.purchasesTotal += p.amount;
      entry.purchasesCount += 1;
      entry.stockBoughtUnits += p.qty;

      let stat = entry.productStatsMap.get(p.productId);
      if (!stat) {
        const prod = getProduct(activeProducts, p.productId);
        stat = {
          productId: prod.id,
          name: prod.name,
          hindi: prod.hindi,
          size: prod.size,
          soldQty: 0,
          soldRevenue: 0,
          selfQty: 0,
          selfCost: 0,
          boughtQty: 0,
          boughtCost: 0,
          profit: 0,
        };
        entry.productStatsMap.set(p.productId, stat);
      }
      stat.boughtQty += p.qty;
      stat.boughtCost += p.amount;
    }

    const result: DayLedgerItem[] = [];
    for (const entry of dateMap.values()) {
      entry.profit = entry.revenue - entry.purchasesTotal;
      entry.gallaCash = entry.receivedTotal - entry.purchasesTotal;
      entry.marginPercent = entry.revenue > 0 ? (entry.profit / entry.revenue) * 100 : 0;

      const productStats: DayProductStat[] = [];
      for (const stat of entry.productStatsMap.values()) {
        stat.profit = stat.soldRevenue - stat.boughtCost;
        productStats.push(stat);
      }
      productStats.sort((a, b) => b.soldQty - a.soldQty);

      result.push({
        date: entry.date,
        transactions: entry.transactions,
        purchases: entry.purchases,
        cashSales: entry.cashSales,
        cashCount: entry.cashCount,
        creditSales: entry.creditSales,
        creditCount: entry.creditCount,
        selfUseCost: entry.selfUseCost,
        selfUseCount: entry.selfUseCount,
        selfUseUnits: entry.selfUseUnits,
        collections: entry.collections,
        collectionsCount: entry.collectionsCount,
        purchasesTotal: entry.purchasesTotal,
        purchasesCount: entry.purchasesCount,
        revenue: entry.revenue,
        receivedTotal: entry.receivedTotal,
        gallaCash: entry.gallaCash,
        unitsSold: entry.unitsSold,
        stockBoughtUnits: entry.stockBoughtUnits,
        profit: entry.profit,
        marginPercent: entry.marginPercent,
        productStats,
      });
    }

    return result.sort((a, b) => b.date.localeCompare(a.date));
  }, [state.transactions, state.purchases, activeProducts]);

  // Filtered days list based on range chip and search query
  const filteredAllDaysList = useMemo(() => {
    const now = new Date();
    return allDaysList.filter((dayItem) => {
      if (dailyTrackRange === "7days") {
        const dayDate = new Date(`${dayItem.date}T12:00:00`);
        const diffDays = Math.floor((now.getTime() - dayDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays > 7 || diffDays < 0) return false;
      } else if (dailyTrackRange === "month") {
        const dayDate = new Date(`${dayItem.date}T12:00:00`);
        if (dayDate.getMonth() !== now.getMonth() || dayDate.getFullYear() !== now.getFullYear()) {
          return false;
        }
      }

      if (dailyTrackSearch.trim()) {
        const q = dailyTrackSearch.trim().toLowerCase();
        const dateMatches = dayItem.date.toLowerCase().includes(q);
        const dayDateObj = new Date(`${dayItem.date}T12:00:00`);
        const formattedEn = dayDateObj.toLocaleDateString("en-IN", { weekday: "long", month: "short", day: "numeric", year: "numeric" }).toLowerCase();
        const formattedHi = dayDateObj.toLocaleDateString("hi-IN", { weekday: "long", month: "short", day: "numeric", year: "numeric" }).toLowerCase();
        const textMatches = formattedEn.includes(q) || formattedHi.includes(q);
        const txMatch = dayItem.transactions.some((tx) =>
          (tx.customerName || "").toLowerCase().includes(q) ||
          getProduct(activeProducts, tx.productId).name.toLowerCase().includes(q) ||
          getProduct(activeProducts, tx.productId).hindi.toLowerCase().includes(q)
        );
        const purchaseMatch = dayItem.purchases.some((p) =>
          getProduct(activeProducts, p.productId).name.toLowerCase().includes(q) ||
          getProduct(activeProducts, p.productId).hindi.toLowerCase().includes(q)
        );
        return dateMatches || textMatches || txMatch || purchaseMatch;
      }
      return true;
    });
  }, [allDaysList, dailyTrackRange, dailyTrackSearch, activeProducts]);

  // Grand summary analytics across filtered days
  const allDaysAnalytics = useMemo(() => {
    const totalDays = filteredAllDaysList.length;
    const totalRevenue = filteredAllDaysList.reduce((sum, d) => sum + d.revenue, 0);
    const totalPurchases = filteredAllDaysList.reduce((sum, d) => sum + d.purchasesTotal, 0);
    const totalCashReceived = filteredAllDaysList.reduce((sum, d) => sum + d.receivedTotal, 0);
    const totalGallaCash = filteredAllDaysList.reduce((sum, d) => sum + d.gallaCash, 0);
    const totalCreditSales = filteredAllDaysList.reduce((sum, d) => sum + d.creditSales, 0);
    const totalCollections = filteredAllDaysList.reduce((sum, d) => sum + d.collections, 0);
    const totalUnitsSold = filteredAllDaysList.reduce((sum, d) => sum + d.unitsSold, 0);
    const totalSelfUseCost = filteredAllDaysList.reduce((sum, d) => sum + (d.selfUseCost || 0), 0);
    const totalSelfUseUnits = filteredAllDaysList.reduce((sum, d) => sum + (d.selfUseUnits || 0), 0);
    const totalProfit = totalRevenue - totalPurchases;
    const avgDailySales = totalDays > 0 ? totalRevenue / totalDays : 0;
    const overallMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    let bestDay: DayLedgerItem | null = null;
    for (const d of filteredAllDaysList) {
      if (!bestDay || d.revenue > bestDay.revenue) {
        bestDay = d;
      }
    }

    return {
      totalDays,
      totalRevenue,
      totalPurchases,
      totalCashReceived,
      totalGallaCash,
      totalCreditSales,
      totalCollections,
      totalUnitsSold,
      totalSelfUseCost,
      totalSelfUseUnits,
      totalProfit,
      avgDailySales,
      overallMargin,
      bestDay,
    };
  }, [filteredAllDaysList]);

  // Current selected single day ledger details
  const currentBookDayItem = useMemo(() => {
    const existing = allDaysList.find((d) => d.date === bookDate);
    if (existing) return existing;
    const regularSales = bookTransactions.filter((t) => t.payment === "cash" || t.payment === "credit");
    const selfList = bookTransactions.filter((t) => t.payment === "self");
    return {
      date: bookDate,
      transactions: bookTransactions,
      purchases: bookPurchases,
      cashSales: bookTransactions.filter((t) => t.payment === "cash").reduce((s, t) => s + t.total, 0),
      cashCount: bookTransactions.filter((t) => t.payment === "cash").length,
      creditSales: bookTransactions.filter((t) => t.payment === "credit").reduce((s, t) => s + t.total, 0),
      creditCount: bookTransactions.filter((t) => t.payment === "credit").length,
      selfUseCost: selfList.reduce((s, t) => s + (t.cost || t.total), 0),
      selfUseCount: selfList.length,
      selfUseUnits: selfList.reduce((s, t) => s + t.qty, 0),
      collections: bookTransactions.filter((t) => t.payment === "collection").reduce((s, t) => s + t.total, 0),
      collectionsCount: bookTransactions.filter((t) => t.payment === "collection").length,
      purchasesTotal: bookSpent,
      purchasesCount: bookPurchases.length,
      revenue: bookRevenue,
      receivedTotal: bookReceived,
      gallaCash: bookReceived - bookSpent,
      unitsSold: regularSales.reduce((s, t) => s + t.qty, 0) + selfList.reduce((s, t) => s + t.qty, 0),
      stockBoughtUnits: bookPurchases.reduce((s, p) => s + p.qty, 0),
      profit: bookRevenue - bookSpent,
      marginPercent: bookRevenue > 0 ? ((bookRevenue - bookSpent) / bookRevenue) * 100 : 0,
      productStats: activeProducts.map((p) => {
        const sold = regularSales.filter((t) => t.productId === p.id);
        const selfs = selfList.filter((t) => t.productId === p.id);
        const bought = bookPurchases.filter((b) => b.productId === p.id);
        const soldQty = sold.reduce((s, t) => s + t.qty, 0);
        const soldRevenue = sold.reduce((s, t) => s + t.total, 0);
        const selfQty = selfs.reduce((s, t) => s + t.qty, 0);
        const selfCost = selfs.reduce((s, t) => s + (t.cost || t.total), 0);
        const boughtQty = bought.reduce((s, b) => s + b.qty, 0);
        const boughtCost = bought.reduce((s, b) => s + b.amount, 0);
        return {
          productId: p.id,
          name: p.name,
          hindi: p.hindi,
          size: p.size,
          soldQty,
          soldRevenue,
          selfQty,
          selfCost,
          boughtQty,
          boughtCost,
          profit: soldRevenue - boughtCost,
        };
      }),
    };
  }, [allDaysList, bookDate, bookTransactions, bookPurchases, bookRevenue, bookReceived, bookSpent, activeProducts]);

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
    let list = state.customers;
    if (customerTab === "due") {
      list = list.filter((c) => c.due > 0);
    }
    if (!customerSearch.trim()) return list;
    const q = customerSearch.trim().toLowerCase();
    return list.filter((c) =>
      c.name.toLowerCase().includes(q) || (c.phone || "").includes(q)
    );
  }, [state.customers, customerSearch, customerTab]);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><Icon name="milk" size={26} /></div>
          <div><strong>Doodh Saathi</strong><span>दूध साथी</span></div>
        </div>
        <nav>
          <NavItem active={page === "home"} icon="home" label={t.home} onClick={() => setPage("home")} />
          <NavItem
            active={page === "customers" && customerTab === "all"}
            icon="users"
            label={t.customers}
            onClick={() => {
              setPage("customers");
              setCustomerTab("all");
            }}
          />
          <NavItem
            active={page === "customers" && customerTab === "due"}
            icon="wallet"
            label={t.udharKhata}
            badge={dueCustomers.length > 0 ? dueCustomers.length : undefined}
            onClick={() => {
              setPage("customers");
              setCustomerTab("due");
            }}
          />
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
        {/* Mobile App Bar */}
        <div className="mobile-header">
          <div className="mobile-brand">
            <div className="brand-mark small"><Icon name="milk" size={19} /></div>
            <div><strong>Doodh Saathi</strong><span>दूध साथी</span></div>
          </div>
          <div className="mobile-header-tools">
            <button
              className={`sync-btn icon-only ${syncError ? "error" : "live"}`}
              onClick={forceSyncFromCloud}
              title={t.refreshCloud}
            >
              <Icon name="refresh" size={14} />
            </button>
            <button
              className="backup-btn icon-only"
              onClick={exportBackup}
              title={t.exportBackup}
            >
              <Icon name="download" size={14} />
            </button>
            <button className="language-toggle compact" onClick={() => setLanguage(language === "en" ? "hi" : "en")}>
              <span className={language === "en" ? "selected" : ""}>EN</span>
              <span className={language === "hi" ? "selected" : ""}>हिं</span>
            </button>
          </div>
        </div>

        <header className="topbar">
          <div>
            <p className="eyebrow">{new Date().toLocaleDateString(language === "hi" ? "hi-IN" : "en-IN", { weekday: "long", day: "numeric", month: "long" })}</p>
            <h1>
              {page === "home"
                ? `${t.greeting} — ${t.simpleSummary}`
                : page === "customers"
                ? customerTab === "due"
                  ? t.udharKhata
                  : t.monthlyCustomers
                : t.allDaysHeader}
            </h1>
            <p className="subtext">
              {page === "home"
                ? t.subtitle
                : page === "customers"
                ? customerTab === "due"
                  ? `${dueCustomers.length} ${language === "hi" ? "ग्राहकों पर कुल उधार बाकी" : "customers with pending dues"}`
                  : `${state.customers.length} ${t.active}`
                : t.allDaysSubtext}
            </p>
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

            {/* BUTTON JO UDHAR LEKE JAE */}
            <button
              className="udhar-nav-button"
              onClick={() => {
                setPage("customers");
                setCustomerTab("due");
              }}
              title={language === "hi" ? "उधार खाता खोलें" : "View Udhar / Dues"}
            >
              <Icon name="book" size={17} />
              <span>{t.udharKhata}</span>
              {totals.due > 0 && <span className="udhar-badge">{money(totals.due)}</span>}
            </button>

            {/* USKE AAGE TICK BTN TO CLEAR PAYMENT */}
            <button
              className="clear-tick-header-button"
              onClick={() => {
                setClearPaymentCustomer(null);
                setClearPaymentModalOpen(true);
              }}
              title={language === "hi" ? "पेमेंट क्लियर करें (उधार जमा)" : "Clear Payment (Settle Due)"}
            >
              <span className="tick-icon-circle"><Icon name="check" size={16} /></span>
              <span>{t.clearPayment}</span>
            </button>

            {/* BUTTON FOR GHAR KHARCH / SELF USE */}
            <button
              className="self-use-nav-button"
              onClick={() => openSale(undefined, undefined, "self")}
              title={t.selfUseTitle}
            >
              <Icon name="home" size={17} />
              <span>{t.selfUse}</span>
              {totals.selfUseCost > 0 && <span className="self-badge">{money(totals.selfUseCost)}</span>}
            </button>

            <button className="secondary-button" onClick={() => setPurchaseOpen(true)}><Icon name="box" size={19} />{t.addPurchase}</button>
            <button className="primary-button" onClick={() => openSale()}><Icon name="plus" size={20} />{t.quickSale}</button>
          </div>
        </header>

        <div className="content">
          {page === "home" && (
            <>
              {/* Mobile Quick Action Launchpad */}
              <div className="mobile-quick-actions">
                <button className="quick-action-btn sale" onClick={() => openSale()}>
                  <div className="quick-btn-icon"><Icon name="plus" size={18} /></div>
                  <div className="quick-btn-text">
                    <strong>{t.quickSale}</strong>
                    <small>{language === "hi" ? "नई बिक्री" : "Record sale"}</small>
                  </div>
                </button>
                <button className="quick-action-btn purchase" onClick={() => setPurchaseOpen(true)}>
                  <div className="quick-btn-icon"><Icon name="box" size={18} /></div>
                  <div className="quick-btn-text">
                    <strong>{t.addPurchase}</strong>
                    <small>{language === "hi" ? "सुबह का माल" : "Add stock"}</small>
                  </div>
                </button>
                <button
                  className="quick-action-btn udhar"
                  onClick={() => {
                    setPage("customers");
                    setCustomerTab("due");
                  }}
                >
                  <div className="quick-btn-icon"><Icon name="wallet" size={18} /></div>
                  <div className="quick-btn-text">
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <strong>{t.udharKhata}</strong>
                      {totals.due > 0 && <span className="udhar-badge-mini">{money(totals.due)}</span>}
                    </div>
                    <small>{dueCustomers.length} {language === "hi" ? "ग्राहकों का बाकी" : "with dues"}</small>
                  </div>
                </button>
                <button
                  className="quick-action-btn clear"
                  onClick={() => {
                    setClearPaymentCustomer(null);
                    setClearPaymentModalOpen(true);
                  }}
                >
                  <div className="quick-btn-icon"><Icon name="check" size={18} /></div>
                  <div className="quick-btn-text">
                    <strong>{t.clearPayment}</strong>
                    <small>{language === "hi" ? "उधार चुकता" : "Clear dues"}</small>
                  </div>
                </button>
                <button className="quick-action-btn self" onClick={() => openSale(undefined, undefined, "self")}>
                  <div className="quick-btn-icon"><Icon name="home" size={18} /></div>
                  <div className="quick-btn-text">
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <strong>{t.selfUse}</strong>
                      {totals.selfUseCost > 0 && <span className="self-badge-mini">{money(totals.selfUseCost)}</span>}
                    </div>
                    <small>{language === "hi" ? "घर खर्च दर्ज करें" : "Record home use"}</small>
                  </div>
                </button>
              </div>

              <div className="period-tabs">
                {(["day", "week", "month", "all"] as Period[]).map((item) => (
                  <button key={item} className={period === item ? "active" : ""} onClick={() => setPeriod(item)}>
                    {item === "day" ? t.today : item === "week" ? t.week : item === "month" ? t.month : t.allTime}
                  </button>
                ))}
              </div>
              {/* Quick Udhar & Clear Payment Banner Card */}
              <div className="quick-udhar-card">
                <div className="quick-udhar-left">
                  <div className="quick-udhar-icon">
                    <Icon name="book" size={23} />
                  </div>
                  <div>
                    <div className="quick-udhar-label">{t.udharKhata}</div>
                    <div className="quick-udhar-amount">{money(totals.due)}</div>
                    <div className="quick-udhar-note">
                      {dueCustomers.length} {language === "hi" ? "ग्राहकों का बकाया उधार" : "customers with pending dues"}
                    </div>
                  </div>
                </div>
                <div className="quick-udhar-btns">
                  {/* Button jo udhar leke jae */}
                  <button
                    className="udhar-nav-button"
                    onClick={() => {
                      setPage("customers");
                      setCustomerTab("due");
                    }}
                    title={language === "hi" ? "उधार खाता खोलें" : "Go to Udhar"}
                  >
                    <Icon name="book" size={16} />
                    <span>{t.viewUdhar}</span>
                  </button>

                  {/* Uske aage tick btn to clear payment */}
                  <button
                    className="clear-tick-header-button"
                    onClick={() => {
                      setClearPaymentCustomer(null);
                      setClearPaymentModalOpen(true);
                    }}
                    title={language === "hi" ? "पेमेंट क्लियर करें (उधार जमा)" : "Clear Due Payment"}
                  >
                    <span className="tick-icon-circle"><Icon name="check" size={15} /></span>
                    <span>{t.clearPayment}</span>
                  </button>
                </div>
              </div>

              <section className="stats-grid">
                <StatCard icon="wallet" label={t.received} value={money(totals.received)} tone="green" note={t.cash} />
                <StatCard icon="box" label={t.spent} value={money(totals.spent)} tone="violet" note={t.addPurchase} />
                <StatCard icon="rupee" label={t.sales} value={money(totals.revenue)} tone="blue" note={`${totals.items} ${t.items.toLowerCase()}`} />
                <StatCard icon="trend" label={totals.revenue - totals.spent >= 0 ? t.profit : t.loss} value={money(Math.abs(totals.revenue - totals.spent))} tone={totals.revenue - totals.spent >= 0 ? "green" : "orange"} note={`${t.sales} − ${t.spent}`} />
                <StatCard
                  icon="wallet"
                  label={t.dues}
                  value={money(totals.due)}
                  tone="orange"
                  note={`${dueCustomers.length} ${t.customers.toLowerCase()}`}
                  onClick={() => {
                    setPage("customers");
                    setCustomerTab("due");
                  }}
                />
                <StatCard
                  icon="home"
                  label={t.selfUse}
                  value={money(totals.selfUseCost)}
                  tone="purple"
                  note={`${totals.selfUseUnits} ${t.items.toLowerCase()} (${language === "hi" ? "लागत पर" : "at cost"})`}
                  onClick={() => openSale(undefined, undefined, "self")}
                />
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
                        <ProductThumb product={product} size={50} />
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
                  <button className={`filter-chip ${homeFilter === "self" ? "active self" : ""}`} onClick={() => setHomeFilter("self")}>
                    <Icon name="home" size={14} /> {t.selfUse}
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
                  onEdit={setEditingTransaction}
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
                  <h2>{customerTab === "due" ? t.udharKhata : t.monthlyCustomers}</h2>
                  <p>
                    {customerTab === "due"
                      ? (language === "hi" ? `कुल ${dueCustomers.length} ग्राहकों पर ${money(totals.due)} उधार बाकी है` : `${dueCustomers.length} customers owe ${money(totals.due)} in pending dues`)
                      : (language === "hi" ? "नियमित ग्राहक और खाता-बही (उधार व नकद रिकॉर्ड)" : "Regular customer accounts, daily delivery and statement")}
                  </p>
                </div>
                <button className="secondary-button" onClick={() => setCustomerOpen(true)}><Icon name="plus" size={19} />{t.addCustomer}</button>
              </div>

              {/* Customer View Tabs (All vs Due Only) */}
              <div className="customer-tabs-bar">
                <div className="customer-tab-chips">
                  <button
                    className={`filter-chip ${customerTab === "all" ? "active" : ""}`}
                    onClick={() => setCustomerTab("all")}
                  >
                    <Icon name="users" size={14} />
                    {t.allCustomers} <span className="chip-count">{state.customers.length}</span>
                  </button>
                  <button
                    className={`filter-chip ${customerTab === "due" ? "active credit" : ""}`}
                    onClick={() => setCustomerTab("due")}
                  >
                    <Icon name="wallet" size={14} />
                    {t.dueCustomersOnly} <span className="chip-count">{dueCustomers.length}</span>
                  </button>
                </div>

                <div className="search-input-box" style={{ maxWidth: 320 }}>
                  <Icon name="search" size={16} />
                  <input
                    placeholder={t.searchByNameOrPhone}
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                  />
                  {customerSearch && <button className="clear-btn" onClick={() => setCustomerSearch("")}>✕</button>}
                </div>
              </div>

              {/* Udhar Summary Banner when in due mode */}
              {customerTab === "due" && (
                <div className="udhar-summary-banner">
                  <div className="udhar-summary-info">
                    <div>
                      <span className="udhar-summary-title">{t.dueSummaryBanner}</span>
                      <strong className="udhar-summary-value">{money(totals.due)}</strong>
                    </div>
                    <div className="udhar-summary-stats">
                      <span>{dueCustomers.length} {t.customers.toLowerCase()}</span>
                    </div>
                  </div>
                  <button
                    className="clear-tick-header-button"
                    onClick={() => {
                      setClearPaymentCustomer(null);
                      setClearPaymentModalOpen(true);
                    }}
                  >
                    <span className="tick-icon-circle"><Icon name="check" size={16} /></span>
                    <span>{t.clearPayment}</span>
                  </button>
                </div>
              )}

              <div className="customer-list">
                {!displayedCustomers.length && (
                  <div className="empty-state">
                    {customerTab === "due" ? t.noPendingDue : t.noCustomers}
                  </div>
                )}
                {displayedCustomers.map((customer) => {
                  const product = getProduct(activeProducts, customer.productId);
                  const deliveredToday = state.transactions.some((item) =>
                    item.customerId === customer.id &&
                    item.payment === "credit" &&
                    new Date(item.createdAt).toDateString() === new Date().toDateString()
                  );
                  return (
                    <article className="customer-row" key={customer.id}>
                      <div className="customer-row-header">
                        <div className="avatar">{customer.name.charAt(0)}</div>
                        <div className="customer-info">
                          <div className="customer-name-row">
                            <strong>{customer.name}</strong>
                            <span className="product-qty-badge" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                              <ProductThumb product={product} size={18} />
                              {customer.dailyQty} × {language === "hi" ? product.hindi : product.name}
                              {customer.customRate && customer.customRate !== product.sell && (
                                <span className="customer-rate-tag" title={t.customerRateBadge}>
                                  @{money(customer.customRate)}
                                </span>
                              )}
                            </span>
                          </div>
                          <span className="customer-sub-info">{customer.phone || "—"}</span>
                        </div>
                        <div className={`due-amount ${customer.due > 0 ? "has-due" : "zero-due"}`}>
                          <span>{t.dueNow}</span>
                          <strong>{money(customer.due)}</strong>
                        </div>
                      </div>

                      <div className="customer-actions">
                        <div className="customer-primary-actions">
                          <button
                            className={`deliver-button ${deliveredToday ? "done" : ""}`}
                            disabled={deliveredToday}
                            onClick={() => recordDailyDelivery(customer)}
                            title={customer.customRate ? `${t.customerRateBadge}: ${money(customer.customRate)}` : undefined}
                          >
                            <Icon name={deliveredToday ? "check" : "milk"} size={16} />
                            <span>{deliveredToday ? t.delivered : t.giveMilk}</span>
                          </button>
                          <button
                            className="deliver-edit-button"
                            title={language === "hi" ? "भाव या मात्रा बदलकर आज की एंट्री करें" : "Edit rate / qty before adding entry"}
                            onClick={() => setCustomerEntryTarget(customer)}
                          >
                            <Icon name="edit" size={14} />
                            <span>{language === "hi" ? "भाव बदलें" : "Edit rate"}</span>
                          </button>
                          {customer.due > 0 && (
                            <button
                              className="clear-tick-button"
                              title={language === "hi" ? "पेमेंट क्लियर करें (✓)" : "Clear Payment (✓)"}
                              onClick={() => {
                                setClearPaymentCustomer(customer);
                                setClearPaymentModalOpen(true);
                              }}
                            >
                              <Icon name="check" size={15} />
                              <span>{t.cleared}</span>
                            </button>
                          )}
                          <button
                            className="collect-button"
                            disabled={!customer.due}
                            onClick={() => setCollecting(customer)}
                          >
                            <Icon name="rupee" size={14} />
                            <span>{t.collectMoney}</span>
                          </button>
                        </div>
                        <div className="customer-secondary-actions">
                          <button className="mini-icon-button" title={t.customerStatement} onClick={() => setViewingCustomerHistory(customer)}><Icon name="history" size={16} /></button>
                          <button className="mini-icon-button" title={t.edit} onClick={() => { setEditingCustomer(customer); setCustomerOpen(true); }}><Icon name="edit" size={16} /></button>
                          <button className="mini-icon-button danger" title={t.delete} onClick={() => removeCustomer(customer)}><Icon name="trash" size={16} /></button>
                        </div>
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
                  {t.allDaysTrack} ({filteredAllDaysList.length} {language === "hi" ? "दिन" : "days"})
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
                <>
                  {/* Grand Daily Tracking Analytics Banner */}
                  <div className="daily-track-analytics-banner">
                    <div className="banner-top-row">
                      <div className="banner-title-area">
                        <h2>
                          <Icon name="chart" size={22} />
                          {t.allDaysHeader}
                        </h2>
                        <p>{t.allDaysSubtext}</p>
                      </div>
                      <div className="banner-quick-badge">
                        <Icon name="calendar" size={15} />
                        <span>
                          {allDaysAnalytics.totalDays} {language === "hi" ? "दिन ट्रैक किए गए" : "Days Tracked"}
                        </span>
                      </div>
                    </div>

                    <div className="banner-metrics-grid">
                      <div className="banner-metric-box">
                        <span>{t.sales} ({t.revenue})</span>
                        <strong>{money(allDaysAnalytics.totalRevenue)}</strong>
                        <small>{language === "hi" ? "कुल बिक्री कमाई" : "Gross Revenue"}</small>
                      </div>
                      <div className="banner-metric-box">
                        <span>{t.purchases} ({t.spent})</span>
                        <strong>{money(allDaysAnalytics.totalPurchases)}</strong>
                        <small>{language === "hi" ? "खरीदा गया माल" : "Stock Investment"}</small>
                      </div>
                      <div className="banner-metric-box galla">
                        <span>{t.gallaCash}</span>
                        <strong>{money(allDaysAnalytics.totalGallaCash)}</strong>
                        <small>{t.gallaCashHint}</small>
                      </div>
                      <div className={`banner-metric-box ${allDaysAnalytics.totalProfit >= 0 ? "profit" : "loss"}`}>
                        <span>{allDaysAnalytics.totalProfit >= 0 ? t.profit : t.loss}</span>
                        <strong>{money(Math.abs(allDaysAnalytics.totalProfit))}</strong>
                        <small>{t.marginPercent}: {allDaysAnalytics.overallMargin.toFixed(1)}%</small>
                      </div>
                      <div className="banner-metric-box">
                        <span>{t.milkVolume}</span>
                        <strong>{allDaysAnalytics.totalUnitsSold}</strong>
                        <small>{t.items.toLowerCase()}</small>
                      </div>
                      <div className="banner-metric-box">
                        <span>{t.avgDailySales}</span>
                        <strong>{money(allDaysAnalytics.avgDailySales)}</strong>
                        <small>{language === "hi" ? "प्रति दिन औसत" : "per day average"}</small>
                      </div>
                      <div className="banner-metric-box" style={{ borderLeft: "3px solid #8b5cf6" }}>
                        <span>🏠 {t.selfUse}</span>
                        <strong style={{ color: "#a78bfa" }}>{money(allDaysAnalytics.totalSelfUseCost)}</strong>
                        <small>{allDaysAnalytics.totalSelfUseUnits} {t.units.toLowerCase()} ({language === "hi" ? "घर खर्च" : "home use"})</small>
                      </div>
                    </div>
                  </div>

                  {/* Range Filter & Search Bar */}
                  <div className="daily-track-filter-bar">
                    <div className="range-chips">
                      <button
                        className={`range-chip ${dailyTrackRange === "all" ? "active" : ""}`}
                        onClick={() => setDailyTrackRange("all")}
                      >
                        <Icon name="calendar" size={14} />
                        {t.allDates} ({allDaysList.length})
                      </button>
                      <button
                        className={`range-chip ${dailyTrackRange === "7days" ? "active" : ""}`}
                        onClick={() => setDailyTrackRange("7days")}
                      >
                        {t.last7Days}
                      </button>
                      <button
                        className={`range-chip ${dailyTrackRange === "month" ? "active" : ""}`}
                        onClick={() => setDailyTrackRange("month")}
                      >
                        {t.last30Days}
                      </button>
                    </div>

                    <div className="search-input-box" style={{ maxWidth: 300 }}>
                      <Icon name="search" size={15} />
                      <input
                        placeholder={language === "hi" ? "तारीख, ग्राहक या सामान खोजें..." : "Search date, customer, product..."}
                        value={dailyTrackSearch}
                        onChange={(e) => setDailyTrackSearch(e.target.value)}
                      />
                      {dailyTrackSearch && (
                        <button className="clear-btn" onClick={() => setDailyTrackSearch("")}>✕</button>
                      )}
                    </div>
                  </div>

                  {/* Daily Track Cards Container */}
                  <div className="daily-track-container">
                    {!filteredAllDaysList.length && (
                      <div className="panel empty-state">
                        <Icon name="calendar" size={32} />
                        <p>{t.noActivity}</p>
                      </div>
                    )}

                    {filteredAllDaysList.map((dayItem) => {
                      const isToday = dayItem.date === localDateKey();
                      const dayDateObj = new Date(`${dayItem.date}T12:00:00`);
                      const formattedDate = dayDateObj.toLocaleDateString(language === "hi" ? "hi-IN" : "en-IN", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      });
                      const expandedTab = expandedDayCards[dayItem.date];
                      const activeProductStats = dayItem.productStats.filter((s) => s.soldQty > 0 || s.boughtQty > 0 || (s.selfQty && s.selfQty > 0));

                      return (
                        <article className="daily-track-card" key={dayItem.date}>
                          <div className="daily-track-header">
                            <div className="day-header-left">
                              <div className="daily-track-date">
                                <Icon name="calendar" size={20} />
                                <strong>{formattedDate}</strong>
                              </div>
                              <div className="day-header-badges">
                                {isToday && <span className="date-badge">{t.today}</span>}
                                <span className={dayItem.profit >= 0 ? "profit-pill" : "loss-pill"}>
                                  {dayItem.profit >= 0 ? "+" : "−"}{money(Math.abs(dayItem.profit))} ({dayItem.marginPercent.toFixed(1)}%)
                                </span>
                                <span className="galla-pill" title={t.gallaCashHint}>
                                  {language === "hi" ? "गल्ला" : "Galla"}: {money(dayItem.gallaCash)}
                                </span>
                                {dayItem.selfUseCost > 0 && (
                                  <span className="self-pill" title={t.selfUseDescription}>
                                    🏠 {language === "hi" ? "घर खर्च" : "Home"}: {money(dayItem.selfUseCost)}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="day-header-actions">
                              <button
                                className="day-action-btn primary"
                                onClick={() => openSale(undefined, dayItem.date)}
                                title={t.addSaleForDay}
                              >
                                <Icon name="plus" size={13} />
                                <span>{language === "hi" ? "+ बिक्री" : "+ Sale"}</span>
                              </button>
                              <button
                                className="day-action-btn stock"
                                onClick={() => openPurchase(dayItem.date)}
                                title={t.addStockForDay}
                              >
                                <Icon name="box" size={13} />
                                <span>{language === "hi" ? "+ खरीद" : "+ Stock"}</span>
                              </button>
                              <button
                                className="day-action-btn self"
                                onClick={() => openSale(undefined, dayItem.date, "self")}
                                title={t.logSelfUse}
                              >
                                <Icon name="home" size={13} />
                                <span>{language === "hi" ? "+ घर खर्च" : "+ Home"}</span>
                              </button>
                              <button
                                className="day-action-btn"
                                onClick={() => {
                                  setBookDate(dayItem.date);
                                  setTrackMode("single-day");
                                }}
                                title={t.viewDayDetails}
                              >
                                <span>{t.singleDayView}</span>
                                <Icon name="chevron" size={13} />
                              </button>
                              <button
                                className={`day-action-btn ${expandedTab ? "active-toggle" : ""}`}
                                onClick={() => toggleDayTab(dayItem.date, expandedTab || "sales")}
                                title={expandedTab ? t.collapseDay : t.expandDay}
                              >
                                <span>{expandedTab ? t.collapseDay : t.expandDay}</span>
                                <Icon name={expandedTab ? "chevronUp" : "chevronDown"} size={13} />
                              </button>
                            </div>
                          </div>

                          {/* Metric Chip Financial Grid */}
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
                              <small>{dayItem.unitsSold} {t.items.toLowerCase()}</small>
                            </div>
                            <div className="metric-chip" style={{ borderLeft: "3px solid #3b82f6" }}>
                              <span>{t.gallaCash}</span>
                              <strong style={{ color: dayItem.gallaCash >= 0 ? "var(--blue)" : "var(--orange)" }}>
                                {money(dayItem.gallaCash)}
                              </strong>
                              <small>{t.gallaCashHint}</small>
                            </div>
                            <div className="metric-chip self-use" style={{ borderLeft: "3px solid #8b5cf6" }}>
                              <span>🏠 {t.selfUse}</span>
                              <strong style={{ color: "#7c3aed" }}>{money(dayItem.selfUseCost)}</strong>
                              <small>{dayItem.selfUseUnits} {t.items.toLowerCase()} ({language === "hi" ? "लागत" : "at cost"})</small>
                            </div>
                            <div className={`metric-chip ${dayItem.profit >= 0 ? "profit" : "loss"}`}>
                              <span>{dayItem.profit >= 0 ? t.profit : t.loss}</span>
                              <strong>{money(Math.abs(dayItem.profit))}</strong>
                              <small>{dayItem.marginPercent.toFixed(1)}% {t.marginPercent.toLowerCase()}</small>
                            </div>
                          </div>

                          {/* Product Milk Volume Badges */}
                          {activeProductStats.length > 0 && (
                            <div className="day-product-tags-bar">
                              <span className="day-product-tag-label">{t.milkVolume}:</span>
                              {activeProductStats.map((stat) => (
                                <div className="day-product-pill" key={stat.productId}>
                                  <span>{language === "hi" ? stat.hindi : stat.name}:</span>
                                  <strong>{stat.soldQty} {t.units.toLowerCase()}</strong>
                                  <small style={{ color: "var(--muted)", fontSize: 10 }}>({money(stat.soldRevenue)})</small>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Expandable Section with Sub-Tabs */}
                          {expandedTab && (
                            <div className="day-expanded-section">
                              <div className="day-subtabs-bar">
                                <button
                                  className={`day-subtab-btn ${expandedTab === "sales" ? "active" : ""}`}
                                  onClick={() => toggleDayTab(dayItem.date, "sales")}
                                >
                                  <Icon name="rupee" size={14} />
                                  <span>{t.daySalesUdhar} ({dayItem.transactions.length})</span>
                                </button>
                                <button
                                  className={`day-subtab-btn ${expandedTab === "stock" ? "active" : ""}`}
                                  onClick={() => toggleDayTab(dayItem.date, "stock")}
                                >
                                  <Icon name="box" size={14} />
                                  <span>{t.dayStock} ({dayItem.purchases.length})</span>
                                </button>
                                <button
                                  className={`day-subtab-btn ${expandedTab === "products" ? "active" : ""}`}
                                  onClick={() => toggleDayTab(dayItem.date, "products")}
                                >
                                  <Icon name="milk" size={14} />
                                  <span>{t.productBreakdown} ({activeProductStats.length})</span>
                                </button>
                              </div>

                              {expandedTab === "sales" && (
                                <TransactionList
                                  transactions={dayItem.transactions}
                                  products={activeProducts}
                                  language={language}
                                  empty={t.noActivity}
                                  onEdit={setEditingTransaction}
                                  onDelete={removeTransaction}
                                />
                              )}

                              {expandedTab === "stock" && (
                                <PurchaseList
                                  purchases={dayItem.purchases}
                                  products={activeProducts}
                                  language={language}
                                  empty={t.noActivity}
                                  onEdit={setEditingPurchase}
                                  onDelete={removePurchase}
                                />
                              )}

                              {expandedTab === "products" && (
                                <DayProductBreakdownTable
                                  stats={dayItem.productStats}
                                  language={language}
                                />
                              )}
                            </div>
                          )}

                          {!expandedTab && (
                            <div className="day-preview-list">
                              <TransactionList
                                transactions={dayItem.transactions.slice(0, 3)}
                                products={activeProducts}
                                language={language}
                                empty={t.noActivity}
                                onEdit={setEditingTransaction}
                                onDelete={removeTransaction}
                              />
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </div>
                </>
              ) : (
                <>
                  {/* Single Day View Header & Navigation */}
                  <section className="book-toolbar">
                    <div>
                      <h2>{t.book}</h2>
                      <p>
                        {new Date(`${bookDate}T12:00:00`).toLocaleDateString(language === "hi" ? "hi-IN" : "en-IN", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="date-controls">
                      <button title={t.previousDay} onClick={() => moveBookDate(-1)}>‹</button>
                      <input
                        aria-label={t.entryDate}
                        type="date"
                        value={bookDate}
                        max={localDateKey()}
                        onChange={(event) => setBookDate(event.target.value)}
                      />
                      <button
                        title={t.nextDay}
                        disabled={bookDate >= localDateKey()}
                        onClick={() => moveBookDate(1)}
                      >
                        ›
                      </button>
                      {bookDate !== localDateKey() && (
                        <button className="today-button" onClick={() => setBookDate(localDateKey())}>
                          {t.todayButton}
                        </button>
                      )}
                    </div>
                  </section>

                  {/* Single Day Quick Action Strip */}
                  <div className="single-day-action-strip">
                    <button
                      className="primary-button"
                      onClick={() => openSale(undefined, bookDate)}
                      style={{ padding: "8px 16px", fontSize: 13 }}
                    >
                      <Icon name="plus" size={16} />
                      <span>{t.addSaleForDay}</span>
                    </button>
                    <button
                      className="secondary-button"
                      onClick={() => openPurchase(bookDate)}
                      style={{ padding: "8px 16px", fontSize: 13 }}
                    >
                      <Icon name="box" size={16} />
                      <span>{t.addStockForDay}</span>
                    </button>
                    <button
                      className="self-use-strip-button"
                      onClick={() => openSale(undefined, bookDate, "self")}
                      style={{ padding: "8px 16px", fontSize: 13 }}
                    >
                      <Icon name="home" size={16} />
                      <span>{t.logSelfUse}</span>
                    </button>
                  </div>

                  {/* Single Day Financial Strip */}
                  <section className="summary-strip">
                    <div>
                      <span>{t.received}</span>
                      <strong>{money(bookReceived)}</strong>
                    </div>
                    <div>
                      <span>{t.spent}</span>
                      <strong>{money(bookSpent)}</strong>
                    </div>
                    <div>
                      <span>{t.gallaCash}</span>
                      <strong style={{ color: (bookReceived - bookSpent) >= 0 ? "var(--blue)" : "var(--orange)" }}>
                        {money(bookReceived - bookSpent)}
                      </strong>
                    </div>
                    <div>
                      <span>🏠 {t.selfUse}</span>
                      <strong style={{ color: "#7c3aed" }}>
                        {money(currentBookDayItem.selfUseCost)}
                      </strong>
                    </div>
                    <div className={bookRevenue - bookSpent >= 0 ? "profit" : "loss"}>
                      <span>{bookRevenue - bookSpent >= 0 ? t.netProfit : t.loss}</span>
                      <strong>{money(Math.abs(bookRevenue - bookSpent))}</strong>
                    </div>
                    <div>
                      <span>{t.milkVolume}</span>
                      <strong>{currentBookDayItem.unitsSold}</strong>
                    </div>
                  </section>

                  {/* Product-wise Breakdown for Single Day */}
                  <section className="panel" style={{ marginBottom: 16 }}>
                    <div className="section-heading">
                      <div>
                        <h2>{t.productBreakdown}</h2>
                        <p>{t.stockVsSales}</p>
                      </div>
                    </div>
                    <DayProductBreakdownTable
                      stats={currentBookDayItem.productStats}
                      language={language}
                    />
                  </section>

                  {/* Morning Stock Purchases Panel with Edit and Delete */}
                  <section className="panel purchase-panel">
                    <div className="section-heading">
                      <div>
                        <h2>{t.dayPurchases}</h2>
                        <p>{t.addPurchase}</p>
                      </div>
                      <button className="secondary-button" onClick={() => openPurchase(bookDate)}>
                        <Icon name="plus" size={18} />{t.add}
                      </button>
                    </div>
                    <PurchaseList
                      purchases={bookPurchases}
                      products={activeProducts}
                      language={language}
                      empty={t.noActivity}
                      onEdit={setEditingPurchase}
                      onDelete={removePurchase}
                    />
                  </section>

                  {/* Day Sales & Collections Panel with Edit and Delete */}
                  <section className="panel activity-panel">
                    <div className="section-heading">
                      <div>
                        <h2>{t.daySales}</h2>
                        <p>{language === "hi" ? "इस दिन की नकद व उधार बिक्री (ग्राहक नाम व विशेष रकम सहित)" : "Sales with customer names & payment mode"}</p>
                      </div>
                      <button className="primary-button" onClick={() => openSale(undefined, bookDate)} style={{ padding: "8px 14px", fontSize: 13 }}>
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
                      <button className={`filter-chip ${recordsFilter === "self" ? "active self" : ""}`} onClick={() => setRecordsFilter("self")}>
                        <Icon name="home" size={13} /> {t.selfUse}
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
                      onEdit={setEditingTransaction}
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
        <NavItem
          active={page === "customers" && customerTab === "all"}
          icon="users"
          label={t.customers}
          onClick={() => {
            setPage("customers");
            setCustomerTab("all");
          }}
        />
        <button className="mobile-sale" onClick={() => openSale()} title={t.quickSale}><Icon name="plus" size={26} /></button>
        <NavItem
          active={page === "customers" && customerTab === "due"}
          icon="wallet"
          label={t.udharKhata}
          badge={dueCustomers.length > 0 ? dueCustomers.length : undefined}
          onClick={() => {
            setPage("customers");
            setCustomerTab("due");
          }}
        />
        <NavItem active={page === "records"} icon="book" label={t.records} onClick={() => setPage("records")} />
      </div>

      {saleOpen && (
        <SaleModal
          language={language}
          selected={selectedProduct}
          products={activeProducts}
          customers={state.customers}
          defaultDate={saleModalDate || (page === "records" ? bookDate : localDateKey())}
          initialPayment={saleInitialPayment}
          onProduct={setSelectedProduct}
          onClose={() => { setSaleOpen(false); setSaleModalDate(null); setSaleInitialPayment("cash"); }}
          onSave={saveSale}
        />
      )}

      {purchaseOpen && (
        <PurchaseModal
          language={language}
          products={activeProducts}
          defaultDate={purchaseModalDate || (page === "records" ? bookDate : localDateKey())}
          onClose={() => { setPurchaseOpen(false); setPurchaseModalDate(null); }}
          onSave={savePurchases}
        />
      )}

      {editingPurchase && (
        <EditPurchaseModal
          language={language}
          purchase={editingPurchase}
          products={activeProducts}
          onClose={() => setEditingPurchase(null)}
          onSave={updatePurchase}
          onDelete={removePurchase}
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

      {clearPaymentModalOpen && (
        <ClearPaymentModal
          language={language}
          customers={state.customers}
          customer={clearPaymentCustomer}
          onClose={() => {
            setClearPaymentModalOpen(false);
            setClearPaymentCustomer(null);
          }}
          onSave={handleClearPayment}
        />
      )}

      {customerEntryTarget && (
        <CustomerEntryModal
          language={language}
          customer={customerEntryTarget}
          products={activeProducts}
          onClose={() => setCustomerEntryTarget(null)}
          onSave={saveCustomerDailyEntry}
        />
      )}

      {editingTransaction && (
        <EditTransactionModal
          language={language}
          transaction={editingTransaction}
          products={activeProducts}
          customers={state.customers}
          onClose={() => setEditingTransaction(null)}
          onSave={updateTransaction}
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
            setClearPaymentCustomer(c);
            setClearPaymentModalOpen(true);
          }}
          onEdit={(tx) => {
            setViewingCustomerHistory(null);
            setEditingTransaction(tx);
          }}
        />
      )}

      {!loaded && <div className="loading"><div className="spinner" /></div>}
    </div>
  );
}

function NavItem({
  active,
  icon,
  label,
  badge,
  onClick,
}: {
  active: boolean;
  icon: string;
  label: string;
  badge?: number | string;
  onClick: () => void;
}) {
  return (
    <button className={`nav-item ${active ? "active" : ""}`} onClick={onClick}>
      <Icon name={icon} size={21} />
      <span>{label}</span>
      {badge !== undefined && <span className="nav-badge">{badge}</span>}
    </button>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone,
  note,
  onClick,
}: {
  icon: string;
  label: string;
  value: string;
  tone: string;
  note: string;
  onClick?: () => void;
}) {
  return (
    <article
      className={`stat-card ${onClick ? "clickable" : ""}`}
      onClick={onClick}
    >
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
  onEdit,
  onDelete,
}: {
  transactions: Transaction[];
  products: Product[];
  language: Language;
  empty: string;
  onEdit?: (item: Transaction) => void;
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
            {collection ? (
              <div className="transaction-icon collection">
                <Icon name="wallet" size={20} />
              </div>
            ) : (
              <ProductThumb product={product} size={38} />
            )}
            <div className="transaction-main">
              <strong>{collection ? (language === "hi" ? "उधार जमा" : "Due collected") : (language === "hi" ? product.hindi : product.name)}</strong>
              <span>
                {collection
                  ? (item.customerName || t.customer)
                  : item.payment === "self"
                  ? `${item.qty} × ${money(item.unitRate !== undefined ? item.unitRate : product.buy)} (${language === "hi" ? "लागत" : "at cost"})`
                  : `${item.qty} × ${money(item.unitRate || product.sell)}`}
                {hasCustomRate && item.payment !== "self" && (
                  <span className="custom-rate-badge">
                    {t.customPriceBadge}
                  </span>
                )}
              </span>
              {hasCustomer && (
                <div className={`customer-tag ${item.payment === "cash" ? "cash-tag" : item.payment === "credit" ? "credit-tag" : item.payment === "self" ? "self-tag" : "collection-tag"}`}>
                  <Icon name={item.payment === "self" ? "home" : "users"} size={11} /> {item.customerName}
                </div>
              )}
            </div>
            <div className="transaction-meta">
              <strong className={collection ? "positive" : ""}>{collection ? "+" : ""}{money(item.total)}</strong>
              <span>{new Date(item.createdAt).toLocaleTimeString(language === "hi" ? "hi-IN" : "en-IN", { hour: "numeric", minute: "2-digit" })}</span>
            </div>
            <div className={`payment-pill ${item.payment}`}>
              {item.payment === "cash"
                ? (language === "hi" ? "नकद" : "Cash")
                : item.payment === "credit"
                ? (language === "hi" ? "उधार" : "Due")
                : item.payment === "self"
                ? (language === "hi" ? "घर खर्च" : "Home Use")
                : (language === "hi" ? "जमा" : "Paid")}
            </div>
            {(onEdit || onDelete) && (
              <div className="row-actions">
                {onEdit && (
                  <button className="row-edit" title={t.edit} onClick={() => onEdit(item)}>
                    <Icon name="edit" size={15} />
                  </button>
                )}
                {onDelete && (
                  <button className="row-delete" title={t.delete} onClick={() => onDelete(item)}>
                    <Icon name="trash" size={15} />
                  </button>
                )}
              </div>
            )}
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
  initialPayment = "cash",
  onProduct,
  onClose,
  onSave,
}: {
  language: Language;
  selected: string;
  products: Product[];
  customers: Customer[];
  defaultDate: string;
  initialPayment?: "cash" | "credit" | "self";
  onProduct: (id: string) => void;
  onClose: () => void;
  onSave: (
    qty: number,
    payment: "cash" | "credit" | "self",
    customerId?: string,
    entryDate?: string,
    newCustomerName?: string,
    newCustomerPhone?: string,
    saveNewCustomerToList?: boolean,
    customRate?: number,
    customTotal?: number,
    saveRateAsCustomerDefault?: boolean,
  ) => void;
}) {
  const t = words[language];
  const product = getProduct(products, selected);

  const [qty, setQty] = useState(1);
  const [payment, setPayment] = useState<"cash" | "credit" | "self">(initialPayment || "cash");
  const initialRate = (initialPayment === "self") ? product.buy : product.sell;
  const [unitRate, setUnitRate] = useState<number>(initialRate);
  const [totalAmount, setTotalAmount] = useState<number>(initialRate * 1);
  const [isTotalManuallyEdited, setIsTotalManuallyEdited] = useState(false);

  const [customerMode, setCustomerMode] = useState<"old" | "new" | "walkin">("old");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [saveToPermanentList, setSaveToPermanentList] = useState(true);
  const [saveRateAsCustomerDefault, setSaveRateAsCustomerDefault] = useState(false);
  const [entryDate, setEntryDate] = useState(defaultDate);

  const selectedCustomerObj = customers.find((c) => c.id === selectedCustomerId);

  // When selected product changes, reset unit rate and total
  useEffect(() => {
    if (payment === "self") {
      setUnitRate(product.buy);
      setTotalAmount(product.buy * qty);
      setIsTotalManuallyEdited(false);
      return;
    }
    const effectiveRate = selectedCustomerObj?.customRate && selectedCustomerObj.productId === selected
      ? selectedCustomerObj.customRate
      : product.sell;
    setUnitRate(effectiveRate);
    setTotalAmount(effectiveRate * qty);
    setIsTotalManuallyEdited(false);
  }, [selected]);

  // When customer is selected, if they have customRate, apply it
  useEffect(() => {
    if (payment !== "self" && selectedCustomerObj?.customRate) {
      setUnitRate(selectedCustomerObj.customRate);
      setTotalAmount(selectedCustomerObj.customRate * qty);
      setIsTotalManuallyEdited(false);
    }
  }, [selectedCustomerId]);

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

  const canSave = useMemo(() => {
    if (!entryDate || totalAmount < 0) return false;
    if (payment === "self") return true;
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
    <Modal title={payment === "self" ? `🏠 ${t.selfUse}` : t.quickSale} onClose={onClose}>
      <div className="modal-body">
        <label>{t.product}</label>
        <div className="choice-grid-products">
          {products.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`product-choice-btn ${selected === item.id ? "active" : ""}`}
              onClick={() => onProduct(item.id)}
            >
              <ProductThumb product={item} size={38} />
              <div className="choice-btn-info">
                <strong>{language === "hi" ? item.hindi : item.name}</strong>
                <small>{item.size}</small>
              </div>
              <span className="choice-btn-price">
                {payment === "self" ? `लागत ${money(item.buy)}` : money(item.sell)}
              </span>
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
              {payment === "self" ? t.selfUseCostLabel : t.customRate}
              {unitRate !== product.sell && payment !== "self" && (
                <span className="custom-rate-badge">{t.customPriceBadge}</span>
              )}
            </label>
            <div className="amount-input-box">
              <span>₹</span>
              <input
                id="sale-unit-rate"
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                value={unitRate !== undefined ? unitRate : ""}
                onChange={(e) => handleRateChange(Number(e.target.value))}
              />
            </div>
            <div className="quick-rate-buttons">
              <button type="button" className="quick-rate-btn" onClick={() => handleRateChange(Math.max(0, unitRate - 1))}>−₹1</button>
              <button type="button" className="quick-rate-btn" onClick={() => handleRateChange(unitRate + 1)}>+₹1</button>
              {payment === "self" ? (
                <button type="button" className="quick-rate-btn" onClick={() => handleRateChange(product.buy)}>
                  लागत {money(product.buy)}
                </button>
              ) : unitRate !== product.sell ? (
                <button type="button" className="quick-rate-btn" onClick={() => handleRateChange(product.sell)}>
                  MRP {money(product.sell)}
                </button>
              ) : null}
            </div>
          </div>

          <div className="amount-field">
            <label htmlFor="sale-total-amount">
              {payment === "self" ? (language === "hi" ? "कुल मूल्य (लागत)" : "Total Value (Cost)") : t.customTotalAmount}
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
                value={totalAmount !== undefined ? totalAmount : ""}
                onChange={(e) => handleTotalChange(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        <label>{t.payment}</label>
        <div className="payment-choices three-col">
          <button
            type="button"
            className={payment === "cash" ? "active" : ""}
            onClick={() => {
              setPayment("cash");
              if (unitRate === product.buy && product.buy !== product.sell) {
                setUnitRate(product.sell);
                setTotalAmount(product.sell * qty);
              }
            }}
          >
            <Icon name="rupee" size={19} />{t.cash}
          </button>
          <button
            type="button"
            className={payment === "credit" ? "active" : ""}
            onClick={() => {
              setPayment("credit");
              if (customerMode === "walkin") setCustomerMode("old");
              if (unitRate === product.buy && product.buy !== product.sell) {
                setUnitRate(product.sell);
                setTotalAmount(product.sell * qty);
              }
            }}
          >
            <Icon name="book" size={19} />{t.credit}
          </button>
          <button
            type="button"
            className={`self-choice-btn ${payment === "self" ? "active" : ""}`}
            onClick={() => {
              setPayment("self");
              setUnitRate(product.buy);
              setTotalAmount(product.buy * qty);
              setIsTotalManuallyEdited(false);
            }}
          >
            <Icon name="home" size={19} />{t.selfUse}
          </button>
        </div>

        {/* Self Use Mode Notice or Customer Selector */}
        {payment === "self" ? (
          <div className="self-use-notice-box">
            <div className="self-notice-header">
              <Icon name="home" size={18} />
              <div>
                <strong>{t.selfUseTitle}</strong>
                <p>{t.selfUseDescription}</p>
              </div>
            </div>
            <div className="self-rate-presets">
              <span>{language === "hi" ? "त्वरित भाव विकल्प:" : "Quick rate options:"}</span>
              <button
                type="button"
                className={`self-rate-chip ${unitRate === product.buy ? "active" : ""}`}
                onClick={() => handleRateChange(product.buy)}
              >
                🏠 {t.selfUseAtCost} ({money(product.buy)})
              </button>
              <button
                type="button"
                className={`self-rate-chip ${unitRate === 0 ? "active" : ""}`}
                onClick={() => handleRateChange(0)}
              >
                🎁 {t.selfUseFree}
              </button>
              {product.sell !== product.buy && (
                <button
                  type="button"
                  className={`self-rate-chip ${unitRate === product.sell ? "active" : ""}`}
                  onClick={() => handleRateChange(product.sell)}
                >
                  🏷️ MRP ({money(product.sell)})
                </button>
              )}
            </div>
          </div>
        ) : (
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
                        {selectedCustomerObj.customRate && (
                          <div style={{ marginTop: 2 }}>
                            <span className="customer-rate-tag">
                              {t.customerRateBadge}: {money(selectedCustomerObj.customRate)}
                            </span>
                          </div>
                        )}
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
                            <small>
                              {customer.phone ? `${customer.phone} · ` : ""}{t.dueNow}: {money(customer.due)}
                              {customer.customRate ? ` · @${money(customer.customRate)}` : ""}
                            </small>
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
        )}

        {/* Customer rate checkbox */}
        {payment !== "self" && selectedCustomerObj && (
          <label className="checkbox-row" style={{ marginTop: 4 }}>
            <input
              type="checkbox"
              checked={saveRateAsCustomerDefault}
              onChange={(e) => setSaveRateAsCustomerDefault(e.target.checked)}
            />
            <span>{t.saveAsDefaultCustomerRate} ({money(unitRate)})</span>
          </label>
        )}

        <div className="field" style={{ marginTop: 10 }}>
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
          <span>{payment === "self" ? (language === "hi" ? "घर खर्च कुल मूल्य" : "Self-Use Cost Total") : t.total}</span>
          <strong>{money(totalAmount)}</strong>
          {payment === "self" ? (
            <small style={{ color: "#7c3aed" }}>
              🏠 {language === "hi" ? "स्टॉक कम होगा · कोई नकद/उधारी नहीं" : "Stock reduced · Zero customer debt"}
            </small>
          ) : (
            <small style={{ color: calculatedProfit >= 0 ? "var(--green)" : "var(--orange)" }}>
              {calculatedProfit >= 0 ? `${t.profit}: +${money(calculatedProfit)}` : `${t.loss}: -${money(Math.abs(calculatedProfit))}`}
            </small>
          )}
        </div>

        <button
          className="modal-primary"
          disabled={!canSave}
          onClick={() => {
            const customerIdParam = payment === "self" ? undefined : (customerMode === "old" ? selectedCustomerId || undefined : undefined);
            const newNameParam = payment === "self" ? undefined : (customerMode === "new" ? newCustomerName.trim() : undefined);
            const newPhoneParam = payment === "self" ? undefined : (customerMode === "new" ? newCustomerPhone.trim() : undefined);
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
              saveRateAsCustomerDefault,
            );
          }}
        >
          <Icon name="check" size={20} />{payment === "self" ? t.logSelfUse : t.saveSale}
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
  const [image, setImage] = useState(product?.image ?? "");

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
        image: image.trim() || undefined,
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

        {/* Product Photo Preset Picker */}
        <div className="field">
          <label>{t.productImage}</label>
          <div className="image-preset-grid">
            <button
              type="button"
              className={`preset-chip ${detectProductPresetKey(image) === "milk-500" ? "active" : ""}`}
              onClick={() => { setImage(amulGoldImg); setColor("rose"); }}
            >
              <img
                src={amulGoldImg}
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/products/amul-gold.jpg"; }}
                alt="Amul Gold"
              />
              <span>{t.presetAmulGold}</span>
            </button>
            <button
              type="button"
              className={`preset-chip ${detectProductPresetKey(image) === "milk-small" ? "active" : ""}`}
              onClick={() => { setImage(amulTaazaImg); setColor("blue"); }}
            >
              <img
                src={amulTaazaImg}
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/products/amul-taaza.jpg"; }}
                alt="Amul Taaza"
              />
              <span>{t.presetAmulTaaza}</span>
            </button>
            <button
              type="button"
              className={`preset-chip ${detectProductPresetKey(image) === "buttermilk" ? "active" : ""}`}
              onClick={() => { setImage(amulChhashImg); setColor("green"); }}
            >
              <img
                src={amulChhashImg}
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/products/amul-chhash.png"; }}
                alt="Amul Chhash"
              />
              <span>{t.presetAmulChhash}</span>
            </button>
            <button
              type="button"
              className={`preset-chip ${detectProductPresetKey(image) === "dahi" ? "active" : ""}`}
              onClick={() => { setImage(amulDahiImg); setColor("amber"); }}
            >
              <img
                src={amulDahiImg}
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/products/amul-dahi.jpg"; }}
                alt="Amul Dahi"
              />
              <span>{t.presetAmulDahi}</span>
            </button>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder={t.customImageUrl}
              style={{ fontSize: 12 }}
            />
            {image && (
              <button
                type="button"
                className="secondary-button"
                style={{ padding: "6px 10px", fontSize: 11 }}
                onClick={() => setImage("")}
              >
                {t.noImage}
              </button>
            )}
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
  onEdit,
  onDelete,
}: {
  purchases: Purchase[];
  products: Product[];
  language: Language;
  empty: string;
  onEdit?: (purchase: Purchase) => void;
  onDelete: (purchase: Purchase) => void;
}) {
  if (!purchases.length) return <div className="empty-state">{empty}</div>;
  const t = words[language];
  return (
    <div className="purchase-list">
      {purchases.map((purchase) => {
        const product = getProduct(products, purchase.productId);
        return (
          <article className="purchase-row" key={purchase.id}>
            <ProductThumb product={product} size={36} />
            <div>
              <strong>{language === "hi" ? product.hindi : product.name}</strong>
              <span>{purchase.qty} × {money(purchase.amount / (purchase.qty || 1))}</span>
            </div>
            <time>{new Date(purchase.createdAt).toLocaleDateString(language === "hi" ? "hi-IN" : "en-IN", { day: "numeric", month: "short" })}</time>
            <strong>{money(purchase.amount)}</strong>
            <div className="row-actions">
              {onEdit && (
                <button className="row-edit" title={t.edit} onClick={() => onEdit(purchase)}>
                  <Icon name="edit" size={15} />
                </button>
              )}
              <button className="row-delete" title={t.delete} onClick={() => onDelete(purchase)}>
                <Icon name="trash" size={15} />
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function DayProductBreakdownTable({
  stats,
  language,
}: {
  stats: DayProductStat[];
  language: Language;
}) {
  const t = words[language];
  const activeStats = stats.filter((s) => s.soldQty > 0 || s.boughtQty > 0 || (s.selfQty && s.selfQty > 0));
  if (!activeStats.length) {
    return <div className="empty-state" style={{ padding: "16px 0" }}>{t.noActivity}</div>;
  }

  const totalSoldQty = activeStats.reduce((sum, s) => sum + s.soldQty, 0);
  const totalRevenue = activeStats.reduce((sum, s) => sum + s.soldRevenue, 0);
  const totalSelfQty = activeStats.reduce((sum, s) => sum + (s.selfQty || 0), 0);
  const totalSelfCost = activeStats.reduce((sum, s) => sum + (s.selfCost || 0), 0);
  const totalBoughtQty = activeStats.reduce((sum, s) => sum + s.boughtQty, 0);
  const totalCost = activeStats.reduce((sum, s) => sum + s.boughtCost, 0);
  const totalProfit = totalRevenue - totalCost;

  return (
    <div className="table-responsive">
      <table className="day-breakdown-table">
        <thead>
          <tr>
            <th>{t.product}</th>
            <th style={{ textAlign: "center" }}>{t.unitsSold}</th>
            <th style={{ textAlign: "right" }}>{t.revenue}</th>
            <th style={{ textAlign: "center", color: "#7c3aed" }}>🏠 {t.selfUse}</th>
            <th style={{ textAlign: "center" }}>{t.stockBoughtUnits}</th>
            <th style={{ textAlign: "right" }}>{t.expense}</th>
            <th style={{ textAlign: "right" }}>{t.profit}</th>
          </tr>
        </thead>
        <tbody>
          {activeStats.map((stat) => (
            <tr key={stat.productId}>
              <td>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <strong>{language === "hi" ? stat.hindi : stat.name}</strong>
                  <small style={{ color: "var(--muted)", fontSize: 11 }}>{stat.size}</small>
                </div>
              </td>
              <td style={{ textAlign: "center", fontWeight: 700 }}>
                {stat.soldQty > 0 ? `${stat.soldQty}` : "—"}
              </td>
              <td style={{ textAlign: "right", fontWeight: 700, color: "var(--navy)" }}>
                {stat.soldRevenue > 0 ? money(stat.soldRevenue) : "—"}
              </td>
              <td style={{ textAlign: "center", fontWeight: 700, color: "#7c3aed" }}>
                {stat.selfQty && stat.selfQty > 0 ? (
                  <span className="self-badge-mini" title={`${stat.selfQty} pkt · लागत ${money(stat.selfCost || 0)}`}>
                    {stat.selfQty} <small>({money(stat.selfCost || 0)})</small>
                  </span>
                ) : "—"}
              </td>
              <td style={{ textAlign: "center", fontWeight: 700, color: "var(--violet)" }}>
                {stat.boughtQty > 0 ? `${stat.boughtQty}` : "—"}
              </td>
              <td style={{ textAlign: "right", fontWeight: 700, color: "var(--violet)" }}>
                {stat.boughtCost > 0 ? money(stat.boughtCost) : "—"}
              </td>
              <td style={{ textAlign: "right", fontWeight: 800 }}>
                <span className={stat.profit >= 0 ? "profit-pill" : "loss-pill"}>
                  {stat.profit >= 0 ? "+" : ""}{money(stat.profit)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th>{t.total}</th>
            <th style={{ textAlign: "center" }}>{totalSoldQty}</th>
            <th style={{ textAlign: "right" }}>{money(totalRevenue)}</th>
            <th style={{ textAlign: "center", color: "#7c3aed" }}>
              {totalSelfQty > 0 ? `${totalSelfQty} (${money(totalSelfCost)})` : "—"}
            </th>
            <th style={{ textAlign: "center" }}>{totalBoughtQty}</th>
            <th style={{ textAlign: "right" }}>{money(totalCost)}</th>
            <th style={{ textAlign: "right" }}>
              <span className={totalProfit >= 0 ? "profit-pill" : "loss-pill"}>
                {totalProfit >= 0 ? "+" : ""}{money(totalProfit)}
              </span>
            </th>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function EditPurchaseModal({
  language,
  purchase,
  products,
  onClose,
  onSave,
  onDelete,
}: {
  language: Language;
  purchase: Purchase;
  products: Product[];
  onClose: () => void;
  onSave: (purchase: Purchase) => void;
  onDelete: (purchase: Purchase) => void;
}) {
  const t = words[language];
  const [productId, setProductId] = useState(purchase.productId);
  const [qty, setQty] = useState(purchase.qty);
  const [amount, setAmount] = useState(purchase.amount);
  const [entryDate, setEntryDate] = useState(() => {
    try {
      return localDateKey(new Date(purchase.createdAt));
    } catch {
      return localDateKey();
    }
  });

  const selectedProduct = getProduct(products, productId);
  const unitRate = qty > 0 ? Math.round((amount / qty) * 10) / 10 : selectedProduct.buy;

  const handleProductChange = (newProductId: string) => {
    setProductId(newProductId);
    const p = getProduct(products, newProductId);
    setAmount(p.buy * qty);
  };

  const handleQtyChange = (newQty: number) => {
    const validQty = Math.max(1, newQty);
    const rate = qty > 0 ? amount / qty : selectedProduct.buy;
    setQty(validQty);
    setAmount(Math.round(rate * validQty));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || qty <= 0) return;
    onSave({
      ...purchase,
      productId,
      qty,
      amount,
      createdAt: timestampForDate(entryDate),
    });
  };

  return (
    <Modal
      title={`${t.edit} — ${language === "hi" ? "सुबह का माल खरीद" : "Stock Purchase"}`}
      onClose={onClose}
    >
      <form className="modal-body form" onSubmit={handleSubmit}>
        <label>{t.product}</label>
        <div className="choice-grid choice-grid-products">
          {products.map((p) => {
            const isSelected = p.id === productId;
            return (
              <button
                key={p.id}
                type="button"
                className={`product-choice-btn ${isSelected ? "active" : ""}`}
                onClick={() => handleProductChange(p.id)}
              >
                <ProductThumb product={p} size={32} />
                <div className="product-choice-text">
                  <strong>{language === "hi" ? p.hindi : p.name}</strong>
                  <small>{p.size} · {t.buy} {money(p.buy)}</small>
                </div>
              </button>
            );
          })}
        </div>

        <label>{t.quantity}</label>
        <div className="stepper" style={{ marginBottom: 14 }}>
          <button type="button" onClick={() => handleQtyChange(qty - 1)}>−</button>
          <strong>{qty}</strong>
          <button type="button" onClick={() => handleQtyChange(qty + 1)}>+</button>
        </div>

        <div className="field">
          <label htmlFor="edit-purchase-amount">
            {t.purchaseAmount}
            <span className="customer-rate-tag" style={{ marginLeft: 6 }}>
              {money(unitRate)}/{t.units.toLowerCase()}
            </span>
          </label>
          <div className="amount-input-box">
            <span>₹</span>
            <input
              id="edit-purchase-amount"
              type="number"
              step="any"
              min="1"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value) || 0)}
            />
          </div>
          <div className="quick-rate-buttons">
            <button
              type="button"
              className="quick-rate-btn"
              onClick={() => setAmount(selectedProduct.buy * qty)}
            >
              {language === "hi" ? `कंपनी भाव (₹${selectedProduct.buy} × ${qty} = ₹${selectedProduct.buy * qty})` : `Default Buy (₹${selectedProduct.buy} × ${qty} = ₹${selectedProduct.buy * qty})`}
            </button>
          </div>
        </div>

        <div className="field">
          <label htmlFor="edit-purchase-date">{t.entryDate}</label>
          <input
            id="edit-purchase-date"
            type="date"
            max={localDateKey()}
            value={entryDate}
            onChange={(e) => setEntryDate(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <button
            type="button"
            className="mini-icon-button danger"
            style={{ width: 48, height: 48, flex: "0 0 48px" }}
            title={t.delete}
            onClick={() => {
              onDelete(purchase);
              onClose();
            }}
          >
            <Icon name="trash" size={18} />
          </button>
          <button className="modal-primary" type="submit" disabled={amount <= 0 || qty <= 0}>
            <Icon name="check" size={20} />
            {t.save} ({money(amount)})
          </button>
        </div>
      </form>
    </Modal>
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
                  <ProductThumb product={product} size={30} />
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
  onSave: (customer: Omit<Customer, "id" | "active"> & { due?: number }) => void;
}) {
  const t = words[language];
  const [name, setName] = useState(customer?.name ?? "");
  const [phone, setPhone] = useState(customer?.phone ?? "");
  const [productId, setProductId] = useState<string>(customer?.productId ?? products[0]?.id ?? "milk-500");
  const [dailyQty, setDailyQty] = useState(customer?.dailyQty ?? 1);
  const [customRate, setCustomRate] = useState(customer?.customRate !== undefined ? String(customer.customRate) : "");
  const [dueAmount, setDueAmount] = useState<string>(customer ? String(customer.due) : "0");

  const selectedProductObj = getProduct(products, productId);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (name.trim()) {
      onSave({
        name: name.trim(),
        phone,
        productId,
        dailyQty,
        customRate: customRate !== "" && Number(customRate) > 0 ? Number(customRate) : undefined,
        due: Math.max(0, Number(dueAmount) || 0),
      });
    }
  };

  return (
    <Modal title={customer ? t.edit : t.addCustomer} onClose={onClose}>
      <form className="modal-body form" onSubmit={submit}>
        <div className="field"><label htmlFor="name">{t.name}</label><input id="name" autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder={language === "hi" ? "जैसे: सीमा बेन" : "e.g. Seema Ben"} /></div>
        <div className="field"><label htmlFor="phone">{t.phone}</label><input id="phone" inputMode="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder={language === "hi" ? "10 अंकों का नंबर" : "10 digit number"} /></div>
        <div className="field">
          <label htmlFor="product">{t.product}</label>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ProductThumb product={selectedProductObj} size={40} />
            <select id="product" style={{ flex: 1 }} value={productId} onChange={(event) => setProductId(event.target.value)}>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {language === "hi" ? product.hindi : product.name} — {money(product.sell)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Customer Specific Price per Unit (Optional) */}
        <div className="field">
          <label htmlFor="customer-custom-rate">
            {t.customerSpecialRate}
            {customRate && Number(customRate) !== selectedProductObj.sell && (
              <span className="custom-rate-badge">{t.customPriceBadge}</span>
            )}
          </label>
          <div className="amount-input-box">
            <span>₹</span>
            <input
              id="customer-custom-rate"
              type="number"
              min="0"
              step="any"
              inputMode="decimal"
              value={customRate}
              placeholder={`${selectedProductObj.sell} (${language === "hi" ? "सामान्य भाव" : "default"})`}
              onChange={(e) => setCustomRate(e.target.value)}
            />
          </div>
          <small style={{ color: "var(--muted)", fontSize: 11, marginTop: 4, display: "block" }}>
            {t.customerSpecialRateHint}
          </small>
        </div>

        {/* Customer Due / Balance Direct Edit */}
        <div className="field">
          <label htmlFor="customer-due-amount">
            {t.currentDue}
            {Number(dueAmount) > 0 && (
              <span className="due-badge" style={{ marginLeft: 6, fontSize: 11, padding: "2px 7px", borderRadius: 6, background: "var(--orange-soft)", color: "var(--orange)", fontWeight: 700 }}>
                {money(Number(dueAmount))}
              </span>
            )}
          </label>
          <div className="amount-input-box">
            <span>₹</span>
            <input
              id="customer-due-amount"
              type="number"
              min="0"
              step="any"
              inputMode="decimal"
              value={dueAmount}
              placeholder="0"
              onChange={(e) => setDueAmount(e.target.value)}
            />
          </div>
          <small style={{ color: "var(--muted)", fontSize: 11, marginTop: 4, display: "block" }}>
            {t.currentDueHint}
          </small>
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
  onEdit,
}: {
  language: Language;
  customer: Customer;
  products: Product[];
  transactions: Transaction[];
  onClose: () => void;
  onCollect: () => void;
  onEdit?: (item: Transaction) => void;
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
              onEdit={onEdit}
            />
          )}
        </div>
      </div>
    </Modal>
  );
}

function ClearPaymentModal({
  language,
  customers,
  customer: initialCustomer,
  onClose,
  onSave,
}: {
  language: Language;
  customers: Customer[];
  customer: Customer | null;
  onClose: () => void;
  onSave: (customerId: string, amount: number, entryDate?: string) => void;
}) {
  const t = words[language];
  const dueCustomers = useMemo(() => customers.filter((c) => c.due > 0), [customers]);

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    initialCustomer?.id || (dueCustomers[0]?.id ?? "")
  );
  const [search, setSearch] = useState("");

  const currentCustomer = useMemo(() => {
    return customers.find((c) => c.id === selectedCustomerId) || dueCustomers[0] || null;
  }, [customers, selectedCustomerId, dueCustomers]);

  const [amount, setAmount] = useState<string>(
    currentCustomer ? String(currentCustomer.due) : "0"
  );
  const [entryDate, setEntryDate] = useState<string>(localDateKey());

  useEffect(() => {
    if (currentCustomer) {
      setAmount(String(currentCustomer.due));
    }
  }, [currentCustomer?.id]);

  const filteredDueCustomers = useMemo(() => {
    if (!search.trim()) return dueCustomers;
    const q = search.trim().toLowerCase();
    return dueCustomers.filter(
      (c) => c.name.toLowerCase().includes(q) || (c.phone || "").includes(q)
    );
  }, [dueCustomers, search]);

  if (!dueCustomers.length && !initialCustomer) {
    return (
      <Modal title={t.clearPaymentTitle} onClose={onClose}>
        <div className="modal-body" style={{ textAlign: "center", padding: "28px 16px" }}>
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: "50%",
              background: "var(--green-soft)",
              color: "var(--green)",
              display: "grid",
              placeItems: "center",
              margin: "0 auto 14px",
            }}
          >
            <Icon name="check" size={30} />
          </div>
          <h3 style={{ margin: "0 0 8px", fontSize: 17, color: "var(--navy)" }}>{t.noPendingDue}</h3>
          <p style={{ margin: "0 0 20px", color: "var(--muted)", fontSize: 13 }}>
            {language === "hi"
              ? "सभी ग्राहकों का हिसाब चुकता है, किसी पर कोई उधार बाकी नहीं है।"
              : "All customer accounts are clear, no outstanding dues found."}
          </p>
          <button className="primary-button" style={{ margin: "0 auto", minWidth: 120 }} onClick={onClose}>
            {language === "hi" ? "ठीक है" : "Close"}
          </button>
        </div>
      </Modal>
    );
  }

  const numAmount = Number(amount) || 0;
  const maxDue = currentCustomer?.due ?? 0;
  const remainingDue = Math.max(0, maxDue - numAmount);
  const isFullClear = numAmount >= maxDue && maxDue > 0;

  const handleSubmit = () => {
    if (!currentCustomer || numAmount <= 0) return;
    onSave(currentCustomer.id, numAmount, entryDate);
  };

  return (
    <Modal title={t.clearPaymentTitle} onClose={onClose}>
      <div className="modal-body">
        {/* Customer Selector if opened globally and multiple customers have dues */}
        {!initialCustomer && dueCustomers.length > 1 && (
          <div className="field">
            <label>{t.selectCustomerPrompt}</label>
            {dueCustomers.length > 4 && (
              <div className="search-input-box" style={{ marginBottom: 8, height: 38 }}>
                <Icon name="search" size={14} />
                <input
                  placeholder={language === "hi" ? "ग्राहक खोजें..." : "Search customer..."}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ fontSize: 13 }}
                />
                {search && <button className="clear-btn" onClick={() => setSearch("")}>✕</button>}
              </div>
            )}
            <div className="modal-customer-picker">
              {filteredDueCustomers.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`modal-customer-chip ${c.id === currentCustomer?.id ? "selected" : ""}`}
                  onClick={() => setSelectedCustomerId(c.id)}
                >
                  <span className="chip-name">{c.name}</span>
                  <span className="chip-due">{money(c.due)}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selected Customer Card */}
        {currentCustomer && (
          <div className="collect-person" style={{ marginBottom: 14 }}>
            <div className="avatar">{currentCustomer.name.charAt(0)}</div>
            <div>
              <strong>{currentCustomer.name}</strong>
              <span>
                {currentCustomer.phone ? `${currentCustomer.phone} · ` : ""}
                {t.dueNow}: <strong style={{ color: "var(--orange)", display: "inline" }}>{money(currentCustomer.due)}</strong>
              </span>
            </div>
          </div>
        )}

        {/* Quick Amount Options */}
        {currentCustomer && currentCustomer.due > 0 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            <button
              type="button"
              className={`quick-pill ${numAmount === currentCustomer.due ? "active" : ""}`}
              onClick={() => setAmount(String(currentCustomer.due))}
            >
              <Icon name="check" size={14} />
              <span>{language === "hi" ? `पूरा उधार ₹${currentCustomer.due} चुकता` : `Clear Full ${money(currentCustomer.due)}`}</span>
            </button>
            {currentCustomer.due > 100 && (
              <button
                type="button"
                className={`quick-pill ${numAmount === 100 ? "active" : ""}`}
                onClick={() => setAmount("100")}
              >
                ₹100
              </button>
            )}
            {currentCustomer.due > 500 && (
              <button
                type="button"
                className={`quick-pill ${numAmount === 500 ? "active" : ""}`}
                onClick={() => setAmount("500")}
              >
                ₹500
              </button>
            )}
          </div>
        )}

        {/* Amount Input */}
        <div className="field">
          <label htmlFor="clear-amount">{t.collected}</label>
          <div className="money-input">
            <span>₹</span>
            <input
              id="clear-amount"
              autoFocus
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
            />
          </div>
          {currentCustomer && (
            <div style={{ marginTop: 6, fontSize: 12, fontWeight: 600 }}>
              {isFullClear ? (
                <span style={{ color: "var(--green)", display: "flex", alignItems: "center", gap: 5 }}>
                  <Icon name="check" size={14} />
                  {language === "hi" ? "पूरा हिसाब साफ़ हो जाएगा (₹0 बाकी)" : "Full balance cleared (₹0 balance)"}
                </span>
              ) : numAmount > 0 ? (
                <span style={{ color: "var(--orange)" }}>
                  {t.remainingDue}: <strong>{money(remainingDue)}</strong>
                </span>
              ) : null}
            </div>
          )}
        </div>

        {/* Date Field */}
        <div className="field">
          <label htmlFor="clear-date">{t.entryDate}</label>
          <input
            id="clear-date"
            type="date"
            max={localDateKey()}
            value={entryDate}
            onChange={(e) => setEntryDate(e.target.value)}
          />
        </div>

        {/* Submit Button */}
        <button
          className="modal-primary clear-submit-btn"
          disabled={!numAmount || numAmount <= 0 || !entryDate || !currentCustomer}
          onClick={handleSubmit}
        >
          <Icon name="check" size={20} />
          <span>
            {isFullClear
              ? (language === "hi" ? "✓ पूरा पेमेंट क्लियर करें" : "✓ Clear Full Payment")
              : (language === "hi" ? `✓ ₹${numAmount} जमा करें` : `✓ Collect ${money(numAmount)}`)}
          </span>
        </button>
      </div>
    </Modal>
  );
}

function CustomerEntryModal({
  language,
  customer,
  products,
  onClose,
  onSave,
}: {
  language: Language;
  customer: Customer;
  products: Product[];
  onClose: () => void;
  onSave: (
    customer: Customer,
    productId: string,
    qty: number,
    unitRate: number,
    total: number,
    payment: "credit" | "cash",
    entryDate: string,
    saveAsDefaultRate: boolean,
  ) => void;
}) {
  const t = words[language];
  const [productId, setProductId] = useState(customer.productId || products[0]?.id || "milk-500");
  const selectedProduct = getProduct(products, productId);

  const initialRate = customer.customRate !== undefined ? customer.customRate : selectedProduct.sell;
  const [qty, setQty] = useState(customer.dailyQty || 1);
  const [unitRate, setUnitRate] = useState<number>(initialRate);
  const [total, setTotal] = useState<number>(initialRate * (customer.dailyQty || 1));
  const [isTotalManuallyEdited, setIsTotalManuallyEdited] = useState(false);
  const [payment, setPayment] = useState<"credit" | "cash">("credit");
  const [entryDate, setEntryDate] = useState(localDateKey());
  const [saveAsDefaultRate, setSaveAsDefaultRate] = useState(customer.customRate !== undefined);

  const handleProductChange = (newProductId: string) => {
    setProductId(newProductId);
    const prod = getProduct(products, newProductId);
    const newRate =
      newProductId === customer.productId && customer.customRate !== undefined
        ? customer.customRate
        : prod.sell;
    setUnitRate(newRate);
    setTotal(newRate * qty);
    setIsTotalManuallyEdited(false);
  };

  const handleRateChange = (newRate: number) => {
    setUnitRate(newRate);
    if (!isTotalManuallyEdited) {
      setTotal(newRate * qty);
    }
  };

  const handleQtyChange = (newQty: number) => {
    const validQty = Math.max(1, newQty);
    setQty(validQty);
    if (!isTotalManuallyEdited) {
      setTotal(unitRate * validQty);
    }
  };

  const handleTotalChange = (newTotal: number) => {
    setTotal(newTotal);
    setIsTotalManuallyEdited(true);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (qty <= 0 || unitRate <= 0 || total <= 0) return;
    onSave(customer, productId, qty, unitRate, total, payment, entryDate, saveAsDefaultRate);
  };

  const hasSpecialPrice = unitRate !== selectedProduct.sell;

  return (
    <Modal title={t.dailyEntryForCustomer} onClose={onClose}>
      <form className="modal-body form" onSubmit={handleSubmit}>
        <div className="collect-person" style={{ marginBottom: 12 }}>
          <div className="avatar">{customer.name.charAt(0)}</div>
          <div>
            <strong>{customer.name}</strong>
            <span>
              {customer.phone ? `${customer.phone} · ` : ""}
              {t.dueNow}: <strong style={{ color: "var(--orange)", display: "inline" }}>{money(customer.due)}</strong>
            </span>
          </div>
        </div>

        <div className="form-help" style={{ margin: "0 0 14px", padding: "8px 12px", fontSize: 12 }}>
          <Icon name="check" size={14} /> {t.differentPriceHint}
        </div>

        <label>{t.product}</label>
        <div className="choice-grid choice-grid-products">
          {products.map((p) => {
            const isSelected = p.id === productId;
            return (
              <button
                key={p.id}
                type="button"
                className={`product-choice-btn ${isSelected ? "active" : ""}`}
                onClick={() => handleProductChange(p.id)}
              >
                <ProductThumb product={p} size={32} />
                <div className="product-choice-text">
                  <strong>{language === "hi" ? p.hindi : p.name}</strong>
                  <small>{p.size} · {money(p.sell)}</small>
                </div>
              </button>
            );
          })}
        </div>

        <label>{t.quantity}</label>
        <div className="stepper" style={{ marginBottom: 14 }}>
          <button type="button" onClick={() => handleQtyChange(qty - 1)}>−</button>
          <strong>{qty}</strong>
          <button type="button" onClick={() => handleQtyChange(qty + 1)}>+</button>
        </div>

        <div className="field">
          <label htmlFor="entry-unit-rate">
            {t.customRate}
            {hasSpecialPrice && (
              <span className="customer-rate-tag" style={{ marginLeft: 6 }}>
                {t.customPriceBadge}
              </span>
            )}
          </label>
          <div className="amount-input-box">
            <span>₹</span>
            <input
              id="entry-unit-rate"
              type="number"
              step="any"
              min="0"
              inputMode="decimal"
              value={unitRate}
              onChange={(e) => handleRateChange(Number(e.target.value) || 0)}
            />
          </div>
          <div className="quick-rate-buttons">
            <button
              type="button"
              className="quick-rate-btn"
              onClick={() => handleRateChange(Math.max(1, unitRate - 1))}
            >
              -₹1
            </button>
            <button
              type="button"
              className="quick-rate-btn"
              onClick={() => handleRateChange(unitRate + 1)}
            >
              +₹1
            </button>
            {unitRate !== selectedProduct.sell && (
              <button
                type="button"
                className="quick-rate-btn"
                onClick={() => handleRateChange(selectedProduct.sell)}
              >
                {language === "hi" ? `सामान्य भाव (₹${selectedProduct.sell})` : `Default (₹${selectedProduct.sell})`}
              </button>
            )}
          </div>
        </div>

        <div className="field">
          <label htmlFor="entry-total-amount">
            {t.customTotalAmount}
            {isTotalManuallyEdited && (
              <small style={{ color: "var(--orange)", marginLeft: 6 }}>
                ({language === "hi" ? "कस्टम रकम" : "manual total"})
              </small>
            )}
          </label>
          <div className="amount-input-box">
            <span>₹</span>
            <input
              id="entry-total-amount"
              type="number"
              step="any"
              min="0"
              inputMode="decimal"
              value={total}
              onChange={(e) => handleTotalChange(Number(e.target.value) || 0)}
            />
          </div>
        </div>

        <label>{t.payment}</label>
        <div className="choice-grid" style={{ marginBottom: 14 }}>
          <button
            type="button"
            className={payment === "credit" ? "active" : ""}
            onClick={() => setPayment("credit")}
          >
            {language === "hi" ? "उधार (खाते में जुड़ेगा)" : "Credit (Add to due)"}
          </button>
          <button
            type="button"
            className={payment === "cash" ? "active" : ""}
            onClick={() => setPayment("cash")}
          >
            {language === "hi" ? "नकद (हाथों-हाथ पैसे मिले)" : "Cash (Paid now)"}
          </button>
        </div>

        <label className="checkbox-field" style={{ marginBottom: 14 }}>
          <input
            type="checkbox"
            checked={saveAsDefaultRate}
            onChange={(e) => setSaveAsDefaultRate(e.target.checked)}
          />
          <span>{t.saveAsDefaultCustomerRate} (₹{unitRate})</span>
        </label>

        <div className="field">
          <label htmlFor="daily-entry-date">{t.entryDate}</label>
          <input
            id="daily-entry-date"
            type="date"
            max={localDateKey()}
            value={entryDate}
            onChange={(e) => setEntryDate(e.target.value)}
          />
        </div>

        <button
          className="modal-primary"
          type="submit"
          disabled={qty <= 0 || total <= 0}
        >
          <Icon name="check" size={20} />
          {language === "hi" ? `✓ एंट्री दर्ज करें (₹${total})` : `✓ Record Entry (${money(total)})`}
        </button>
      </form>
    </Modal>
  );
}

function EditTransactionModal({
  language,
  transaction,
  products,
  customers,
  onClose,
  onSave,
}: {
  language: Language;
  transaction: Transaction;
  products: Product[];
  customers: Customer[];
  onClose: () => void;
  onSave: (updatedTx: Transaction, saveCustomerRate?: boolean) => void;
}) {
  const t = words[language];
  const isCollection = transaction.payment === "collection";

  const [productId, setProductId] = useState(transaction.productId || products[0]?.id || "milk-500");
  const selectedProduct = getProduct(products, productId);

  const [qty, setQty] = useState(transaction.qty || 1);
  const [unitRate, setUnitRate] = useState<number>(transaction.unitRate !== undefined ? transaction.unitRate : (transaction.payment === "self" ? selectedProduct.buy : selectedProduct.sell));
  const [total, setTotal] = useState<number>(transaction.total);
  const [payment, setPayment] = useState<"cash" | "credit" | "collection" | "self">(transaction.payment);
  const [customerId, setCustomerId] = useState<string>(transaction.customerId || "");
  const [saveCustomerRate, setSaveCustomerRate] = useState(false);
  const [entryDate, setEntryDate] = useState(() => {
    try {
      return localDateKey(new Date(transaction.createdAt));
    } catch {
      return localDateKey();
    }
  });

  const selectedCustomer = customers.find((c) => c.id === customerId);

  const handleProductChange = (newProductId: string) => {
    setProductId(newProductId);
    const p = getProduct(products, newProductId);
    const newRate = payment === "self"
      ? p.buy
      : selectedCustomer?.customRate && selectedCustomer.productId === newProductId
      ? selectedCustomer.customRate
      : p.sell;
    setUnitRate(newRate);
    setTotal(newRate * qty);
  };

  const handleRateChange = (newRate: number) => {
    setUnitRate(newRate);
    setTotal(newRate * qty);
  };

  const handleQtyChange = (newQty: number) => {
    const validQty = Math.max(1, newQty);
    setQty(validQty);
    setTotal(unitRate * validQty);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (total < 0) return;

    const prod = getProduct(products, productId);
    const isSelf = payment === "self";
    const updatedTx: Transaction = {
      ...transaction,
      productId: isCollection ? transaction.productId : productId,
      qty: isCollection ? 1 : qty,
      unitRate: isCollection ? undefined : unitRate,
      total,
      cost: isCollection ? 0 : prod.buy * qty,
      payment,
      customerId: isSelf ? undefined : (customerId || undefined),
      customerName: isSelf
        ? (language === "hi" ? "घर खर्च (खुद का उपयोग)" : "Home Use (Drawings)")
        : (selectedCustomer ? selectedCustomer.name : customerId ? transaction.customerName : undefined),
      customerPhone: isSelf ? undefined : (selectedCustomer ? selectedCustomer.phone : customerId ? transaction.customerPhone : undefined),
      createdAt: timestampForDate(entryDate),
    };

    onSave(updatedTx, isSelf ? false : saveCustomerRate);
  };

  return (
    <Modal
      title={`${t.edit} — ${
        isCollection
          ? language === "hi"
            ? "उधार जमा"
            : "Collection"
          : language === "hi"
          ? selectedProduct.hindi
          : selectedProduct.name
      }`}
      onClose={onClose}
    >
      <form className="modal-body form" onSubmit={handleSubmit}>
        {!isCollection && (
          <>
            <label>{t.product}</label>
            <div className="choice-grid choice-grid-products">
              {products.map((p) => {
                const isSelected = p.id === productId;
                return (
                  <button
                    key={p.id}
                    type="button"
                    className={`product-choice-btn ${isSelected ? "active" : ""}`}
                    onClick={() => handleProductChange(p.id)}
                  >
                    <ProductThumb product={p} size={32} />
                    <div className="product-choice-text">
                      <strong>{language === "hi" ? p.hindi : p.name}</strong>
                      <small>{p.size} · {payment === "self" ? `लागत ${money(p.buy)}` : money(p.sell)}</small>
                    </div>
                  </button>
                );
              })}
            </div>

            <label>{t.quantity}</label>
            <div className="stepper" style={{ marginBottom: 14 }}>
              <button type="button" onClick={() => handleQtyChange(qty - 1)}>−</button>
              <strong>{qty}</strong>
              <button type="button" onClick={() => handleQtyChange(qty + 1)}>+</button>
            </div>

            <div className="field">
              <label htmlFor="edit-unit-rate">
                {payment === "self" ? t.selfUseCostLabel : t.customRate}
                {unitRate !== selectedProduct.sell && payment !== "self" && (
                  <span className="customer-rate-tag" style={{ marginLeft: 6 }}>
                    {t.customPriceBadge}
                  </span>
                )}
              </label>
              <div className="amount-input-box">
                <span>₹</span>
                <input
                  id="edit-unit-rate"
                  type="number"
                  step="any"
                  min="0"
                  inputMode="decimal"
                  value={unitRate !== undefined ? unitRate : ""}
                  onChange={(e) => handleRateChange(Number(e.target.value) || 0)}
                />
              </div>
              <div className="quick-rate-buttons">
                <button
                  type="button"
                  className="quick-rate-btn"
                  onClick={() => handleRateChange(Math.max(0, unitRate - 1))}
                >
                  -₹1
                </button>
                <button
                  type="button"
                  className="quick-rate-btn"
                  onClick={() => handleRateChange(unitRate + 1)}
                >
                  +₹1
                </button>
                {payment === "self" ? (
                  <>
                    <button
                      type="button"
                      className="quick-rate-btn"
                      onClick={() => handleRateChange(selectedProduct.buy)}
                    >
                      लागत (₹{selectedProduct.buy})
                    </button>
                    <button
                      type="button"
                      className="quick-rate-btn"
                      onClick={() => handleRateChange(0)}
                    >
                      मुफ़्त (₹0)
                    </button>
                  </>
                ) : unitRate !== selectedProduct.sell ? (
                  <button
                    type="button"
                    className="quick-rate-btn"
                    onClick={() => handleRateChange(selectedProduct.sell)}
                  >
                    {language === "hi" ? `सामान्य भाव (₹${selectedProduct.sell})` : `Default (₹${selectedProduct.sell})`}
                  </button>
                ) : null}
              </div>
            </div>
          </>
        )}

        <div className="field">
          <label htmlFor="edit-total-amount">
            {isCollection ? t.collected : payment === "self" ? (language === "hi" ? "कुल मूल्य (लागत)" : "Total Value (Cost)") : t.customTotalAmount}
          </label>
          <div className="amount-input-box">
            <span>₹</span>
            <input
              id="edit-total-amount"
              type="number"
              step="any"
              min="0"
              inputMode="decimal"
              value={total !== undefined ? total : ""}
              onChange={(e) => setTotal(Number(e.target.value) || 0)}
            />
          </div>
        </div>

        {!isCollection && (
          <>
            <label>{t.payment}</label>
            <div className="choice-grid three-col" style={{ marginBottom: 14 }}>
              <button
                type="button"
                className={payment === "cash" ? "active" : ""}
                onClick={() => setPayment("cash")}
              >
                {language === "hi" ? "नकद (Cash)" : "Cash"}
              </button>
              <button
                type="button"
                className={payment === "credit" ? "active" : ""}
                onClick={() => setPayment("credit")}
              >
                {language === "hi" ? "उधार (Credit)" : "Credit (Due)"}
              </button>
              <button
                type="button"
                className={`self-choice-btn ${payment === "self" ? "active" : ""}`}
                onClick={() => {
                  setPayment("self");
                  setCustomerId("");
                  setUnitRate(selectedProduct.buy);
                  setTotal(selectedProduct.buy * qty);
                }}
              >
                🏠 {t.selfUse}
              </button>
            </div>
          </>
        )}

        {payment === "self" ? (
          <div className="self-use-notice-box" style={{ marginBottom: 14 }}>
            <div className="self-notice-header">
              <Icon name="home" size={16} />
              <div>
                <strong>{t.selfUseNotice}</strong>
                <p>{t.selfUseDescription}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="field">
            <label htmlFor="edit-tx-customer">{t.customer}</label>
            <select
              id="edit-tx-customer"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
            >
              <option value="">{language === "hi" ? "-- कोई ग्राहक नहीं (Walk-in) --" : "-- No customer (Walk-in) --"}</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.phone ? `(${c.phone})` : ""} {c.customRate ? `[@₹${c.customRate}]` : ""}
                </option>
              ))}
            </select>
          </div>
        )}

        {!isCollection && payment !== "self" && customerId && (
          <label className="checkbox-field" style={{ marginBottom: 14 }}>
            <input
              type="checkbox"
              checked={saveCustomerRate}
              onChange={(e) => setSaveCustomerRate(e.target.checked)}
            />
            <span>{t.saveAsDefaultCustomerRate} (₹{unitRate})</span>
          </label>
        )}

        <div className="field">
          <label htmlFor="edit-tx-date">{t.entryDate}</label>
          <input
            id="edit-tx-date"
            type="date"
            max={localDateKey()}
            value={entryDate}
            onChange={(e) => setEntryDate(e.target.value)}
          />
        </div>

        <button className="modal-primary" type="submit" disabled={total < 0}>
          <Icon name="check" size={20} />
          {t.save} ({money(total)})
        </button>
      </form>
    </Modal>
  );
}

