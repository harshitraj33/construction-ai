import React, { createContext, useContext, useState, useEffect } from 'react';

export type LanguageCode = 'en' | 'hi' | 'mr' | 'gu' | 'bn';

export interface TranslationDict {
  brandName: string;
  tagline: string;
  login: string;
  register: string;
  username: string;
  password: string;
  email: string;
  role: string;
  phoneNumber: string;
  companyName: string;
  dashboard: string;
  overview: string;
  projects: string;
  tasks: string;
  budget: string;
  startDate: string;
  endDate: string;
  status: string;
  priority: string;
  addProject: string;
  createTask: string;
  logout: string;
  welcomeBack: string;
  demoAccounts: string;
  active: string;
  planning: string;
  onHold: string;
  completed: string;
  todo: string;
  inProgress: string;
  review: string;
  done: string;
  low: string;
  medium: string;
  high: string;
  assignedTo: string;
  dueDate: string;
  cancel: string;
  create: string;
  admin: string;
  contractor: string;
  client: string;
  vendor: string;
  labor: string;
  controlRoom: string;
  userDirectory: string;
  gstAnalytics: string;
  aiEngineNodes: string;
  ganttSchedule: string;
  aiEstimateOcr: string;
  labourPayroll: string;
  gstInvoicing: string;
  marketplaceShop: string;
  siteCommChannel: string;
  siteAssistantChat: string;
  billsInvoices: string;
  manageInventory: string;
  incomingOrders: string;
  assignedTasks: string;
  shiftCheckIn: string;
  manageSystemDetails: string;
  projectName: string;
  description: string;
  projectNamePlaceholder: string;
  projectDescPlaceholder: string;
  activeUsers: string;
  gstCollected: string;
  aiModulesStatus: string;
  managedSites: string;
  pendingTasks: string;
  budgetBurnRate: string;
  laborOnsite: string;
  projectProgress: string;
  projectBudget: string;
  activeWorkersOnsite: string;
  laborExpenses: string;
  completedTasks: string;
  attendanceLogged: string;
  sites: string;
  pending: string;
  optimal: string;
  workers: string;
  complete: string;
  of: string;
  milestones: string;
  totalAllocation: string;
  onShiftToday: string;
  accumulatedSalary: string;
  compliance: string;
  leadContractor: string;
  assignedVendor: string;
  clientOwner: string;
  selectContractor: string;
  selectVendor: string;
  selectClient: string;
}

const translations: Record<LanguageCode, TranslationDict> = {
  en: {
    brandName: "Construct.ai",
    tagline: "Access your smart builder workspace",
    login: "Sign In",
    register: "Sign Up",
    username: "Username",
    password: "Password",
    email: "Email",
    role: "Role",
    phoneNumber: "Phone Number",
    companyName: "Company Name",
    dashboard: "Dashboard",
    overview: "Dashboard Overview",
    projects: "Site & Construction Projects",
    tasks: "Task Units",
    budget: "Site Budget",
    startDate: "Start Date",
    endDate: "End Date",
    status: "Status",
    priority: "Priority",
    addProject: "Add Site Project",
    createTask: "Create Task Unit",
    logout: "Logout",
    welcomeBack: "Welcome Back",
    demoAccounts: "Developer Demo Accounts",
    active: "Active Site",
    planning: "Planning",
    onHold: "On Hold",
    completed: "Completed",
    todo: "To Do",
    inProgress: "In Progress",
    review: "Review Sign-off",
    done: "Completed",
    low: "Low",
    medium: "Medium",
    high: "High",
    assignedTo: "Assignee",
    dueDate: "Due Date",
    cancel: "Cancel",
    create: "Create",
    admin: "Admin",
    contractor: "Contractor",
    client: "Client",
    vendor: "Vendor",
    labor: "Labor",
    controlRoom: "Control Room",
    userDirectory: "User Directory",
    gstAnalytics: "GST Analytics",
    aiEngineNodes: "AI Engine Nodes",
    ganttSchedule: "Gantt Schedule",
    aiEstimateOcr: "AI Estimate & OCR",
    labourPayroll: "Labour & Payroll",
    gstInvoicing: "GST Invoicing",
    marketplaceShop: "Marketplace Shop",
    siteCommChannel: "Site Comm Channel",
    siteAssistantChat: "Site Assistant Chat",
    billsInvoices: "Bills & Invoices",
    manageInventory: "Manage Inventory",
    incomingOrders: "Incoming Orders",
    assignedTasks: "Assigned Tasks",
    shiftCheckIn: "Shift Check-in",
    manageSystemDetails: "Manage system details, local data and operations.",
    projectName: "Project Name",
    description: "Description",
    projectNamePlaceholder: "e.g. Marina Bay Residence",
    projectDescPlaceholder: "Detail the site requirements...",
    activeUsers: "Active Users",
    gstCollected: "GST Collected",
    aiModulesStatus: "AI Modules Status",
    managedSites: "Managed Sites",
    pendingTasks: "Pending Tasks",
    budgetBurnRate: "Budget Burn Rate",
    laborOnsite: "Labor Onsite",
    projectProgress: "Project Progress",
    projectBudget: "Project Budget",
    activeWorkersOnsite: "Active Workers Onsite",
    laborExpenses: "Labor Expenses",
    completedTasks: "Completed Tasks",
    attendanceLogged: "Attendance Logged",
    sites: "Sites",
    pending: "Pending",
    optimal: "Optimal",
    workers: "Workers",
    complete: "Complete",
    of: "of",
    milestones: "Milestones",
    totalAllocation: "Total Allocation",
    onShiftToday: "On Shift Today",
    accumulatedSalary: "Accumulated Salary",
    compliance: "Compliance",
    leadContractor: "Lead Contractor",
    assignedVendor: "Assigned Vendor",
    clientOwner: "Client Owner",
    selectContractor: "-- Select Contractor --",
    selectVendor: "-- Select Vendor --",
    selectClient: "-- Select Client --"
  },
  hi: {
    brandName: "Construct.ai",
    tagline: "अपने स्मार्ट बिल्डर कार्यक्षेत्र में प्रवेश करें",
    login: "लॉगिन करें",
    register: "पंजीकरण करें",
    username: "उपयोगकर्ता नाम",
    password: "पासवर्ड",
    email: "ईमेल",
    role: "भूमिका",
    phoneNumber: "फ़ोन नंबर",
    companyName: "कंपनी का नाम",
    dashboard: "डैशबोर्ड",
    overview: "डैशबोर्ड अवलोकन",
    projects: "साइट और निर्माण परियोजनाएं",
    tasks: "कार्य इकाइयाँ",
    budget: "साइट बजट",
    startDate: "आरंभ तिथि",
    endDate: "समाप्ति तिथि",
    status: "स्थिति",
    priority: "प्राथमिकता",
    addProject: "परियोजना जोड़ें",
    createTask: "कार्य जोड़ें",
    logout: "लॉगआउट",
    welcomeBack: "आपका स्वागत है",
    demoAccounts: "डेवलपर डेमो खाते",
    active: "सक्रिय साइट",
    planning: "नियोजन",
    onHold: "रोका गया",
    completed: "पूर्ण",
    todo: "करने योग्य",
    inProgress: "प्रगति पर",
    review: "समीक्षा और साइन-ऑफ",
    done: "पूर्ण",
    low: "कम",
    medium: "मध्यम",
    high: "उच्च",
    assignedTo: "सौंपा गया",
    dueDate: "नियत तिथि",
    cancel: "रद्द करें",
    create: "बनाएं",
    admin: "प्रशासक",
    contractor: "ठेकेदार",
    client: "ग्राहक",
    vendor: "विक्रेता",
    labor: "मजदूर",
    controlRoom: "नियंत्रण कक्ष",
    userDirectory: "उपयोगकर्ता निर्देशिका",
    gstAnalytics: "जीएसटी विश्लेषण",
    aiEngineNodes: "एआई इंजन नोड्स",
    ganttSchedule: "गैंट समय सारिणी",
    aiEstimateOcr: "एआई अनुमान और ओसीआर",
    labourPayroll: "श्रम और पेरोल",
    gstInvoicing: "जीएसटी इनवॉइसिंग",
    marketplaceShop: "मार्केटप्लेस शॉप",
    siteCommChannel: "साइट संचार चैनल",
    siteAssistantChat: "साइट सहायक चैट",
    billsInvoices: "बिल और इनवॉइस",
    manageInventory: "इन्वेंटरी प्रबंधित करें",
    incomingOrders: "आने वाले ऑर्डर",
    assignedTasks: "सौंपे गए कार्य",
    shiftCheckIn: "शिफ्ट चेक-इन",
    manageSystemDetails: "सिस्टम विवरण, स्थानीय डेटा और संचालन प्रबंधित करें।",
    projectName: "परियोजना का नाम",
    description: "विवरण",
    projectNamePlaceholder: "जैसे: मरीना बे रेजिडेंस",
    projectDescPlaceholder: "साइट की आवश्यकताओं का विवरण दें...",
    activeUsers: "सक्रिय उपयोगकर्ता",
    gstCollected: "एकत्रित जीएसटी",
    aiModulesStatus: "एआई मॉड्यूल स्थिति",
    managedSites: "प्रबंधित साइटें",
    pendingTasks: "लंबित कार्य",
    budgetBurnRate: "बजट बर्न दर",
    laborOnsite: "साइट पर मजदूर",
    projectProgress: "परियोजना प्रगति",
    projectBudget: "परियोजना बजट",
    activeWorkersOnsite: "साइट पर सक्रिय कर्मचारी",
    laborExpenses: "श्रम व्यय",
    completedTasks: "पूर्ण कार्य",
    attendanceLogged: "दर्ज उपस्थिति",
    sites: "साइटें",
    pending: "लंबित",
    optimal: "इष्टतम",
    workers: "कर्मचारी",
    complete: "पूर्ण",
    of: "का",
    milestones: "मील के पत्थर",
    totalAllocation: "कुल आवंटन",
    onShiftToday: "आज की शिफ्ट में",
    accumulatedSalary: "संचित वेतन",
    compliance: "अनुपालन",
    leadContractor: "मुख्य ठेकेदार",
    assignedVendor: "सौंपा गया विक्रेता",
    clientOwner: "ग्राहक मालिक",
    selectContractor: "-- ठेकेदार चुनें --",
    selectVendor: "-- विक्रेता चुनें --",
    selectClient: "-- ग्राहक चुनें --"
  },
  mr: {
    brandName: "Construct.ai",
    tagline: "तुमच्या स्मार्ट बिल्डर वर्कस्पेसमध्ये प्रवेश करा",
    login: "लॉगिन करा",
    register: "नोंदणी करा",
    username: "वापरकर्तानाव",
    password: "पासवर्ड",
    email: "ईमेल",
    role: "भूमिका",
    phoneNumber: "फोन नंबर",
    companyName: "कंपनीचे नाव",
    dashboard: "डॅशबोर्ड",
    overview: "डॅशबोर्ड विहंगावलोकन",
    projects: "साइट आणि बांधकाम प्रकल्प",
    tasks: "काम युनिट्स",
    budget: "साइट बजेट",
    startDate: "सुरू होण्याची तारीख",
    endDate: "संपण्याची तारीख",
    status: "स्थिती",
    priority: "प्राधान्य",
    addProject: "प्रकल्प जोडा",
    createTask: "काम जोडा",
    logout: "लॉगआऊट",
    welcomeBack: "तुमचे स्वागत आहे",
    demoAccounts: "डेव्हलपर डेमो खाती",
    active: "सक्रिय साइट",
    planning: "नियोजन",
    onHold: "थांबवलेले",
    completed: "पूर्ण",
    todo: "करायची कामे",
    inProgress: "प्रगतीपथावर",
    review: "तपासणी आणि मंजूरी",
    done: "पूर्ण",
    low: "कमी",
    medium: "मध्यम",
    high: "उच्च",
    assignedTo: "सोपविलेले",
    dueDate: "अंतिम तारीख",
    cancel: "रद्द करा",
    create: "तयार करा",
    admin: "प्रशासक",
    contractor: "कंत्राटदार",
    client: "ग्राहक",
    vendor: "विक्रेता",
    labor: "कामगार",
    controlRoom: "नियंत्रण कक्ष",
    userDirectory: "वापरकर्ता निर्देशिका",
    gstAnalytics: "जीएसटी विश्लेषण",
    aiEngineNodes: "एआय इंजिन नोड्स",
    ganttSchedule: "गँट वेळापत्रक",
    aiEstimateOcr: "एआय अंदाज आणि ओसीआर",
    labourPayroll: "श्रम आणि वेतनपट",
    gstInvoicing: "जीएसटी इनव्हॉइसिंग",
    marketplaceShop: "मार्केटप्लेस शॉप",
    siteCommChannel: "साइट संवाद चॅनेल",
    siteAssistantChat: "साइट असिस्टंट चॅट",
    billsInvoices: "बिले आणि इनव्हॉइस",
    manageInventory: "इन्व्हेंटरी व्यवस्थापित करा",
    incomingOrders: "येणारे ऑर्डर्स",
    assignedTasks: "सोपवलेली कामे",
    shiftCheckIn: "शिफ्ट चेक-इन",
    manageSystemDetails: "सिस्टम तपशील, स्थानिक डेटा आणि ऑपरेशन्स व्यवस्थापित करा.",
    projectName: "प्रकल्पाचे नाव",
    description: "वर्णन",
    projectNamePlaceholder: "उदा. मरीना बे रेसिडेन्स",
    projectDescPlaceholder: "साइटच्या आवश्यकतांचा तपशील द्या...",
    activeUsers: "सक्रिय वापरकर्ते",
    gstCollected: "गोळा केलेला जीएसटी",
    aiModulesStatus: "एआय मॉड्युल्स स्थिती",
    managedSites: "व्यवस्थापित साइट्स",
    pendingTasks: "प्रलंबित कामे",
    budgetBurnRate: "बजेट खर्च दर",
    laborOnsite: "साइटवर कामगार",
    projectProgress: "प्रकल्प प्रगती",
    projectBudget: "प्रकल्प बजेट",
    activeWorkersOnsite: "साइटवर सक्रिय कामगार",
    laborExpenses: "श्रम खर्च",
    completedTasks: "पूर्ण झालेली कामे",
    attendanceLogged: "नोंदवलेली उपस्थिती",
    sites: "साइट्स",
    pending: "प्रलंबित",
    optimal: "उत्कृष्ट",
    workers: "कामगार",
    complete: "पूर्ण",
    of: "पैकी",
    milestones: "टप्पे",
    totalAllocation: "एकूण वाटप",
    onShiftToday: "आजच्या शिफ्टवर",
    accumulatedSalary: "एकत्रित वेतन",
    compliance: "अनुपालन",
    leadContractor: "मुख्य कंत्राटदार",
    assignedVendor: "सोपविलेला विक्रेता",
    clientOwner: "ग्राहक मालक",
    selectContractor: "-- कंत्राटदार निवडा --",
    selectVendor: "-- विक्रेता निवडा --",
    selectClient: "-- ग्राहक निवडा --"
  },
  gu: {
    brandName: "Construct.ai",
    tagline: "તમારા સ્માર્ટ બિલ્ડર વર્કસ્પેસમાં પ્રવેશ કરો",
    login: "લૉગિન કરો",
    register: "નોંધણી કરો",
    username: "વપરાશકર્તા નામ",
    password: "પાસવર્ડ",
    email: "ઈમેલ",
    role: "ભૂમિકા",
    phoneNumber: "ફોન નંબર",
    companyName: "કંપનીનું નામ",
    dashboard: "ડેશબોર્ડ",
    overview: "ડેશબોર્ડ વિહંગાવલોકન",
    projects: "સાઇટ અને બાંધકામ પ્રોજેક્ટ્સ",
    tasks: "કાર્ય એકમો",
    budget: "સાઇટ બજેટ",
    startDate: "શરૂઆતની તારીખ",
    endDate: "અંતિમ તારીખ",
    status: "સ્થિતિ",
    priority: "પ્રાથમિકતા",
    addProject: "પ્રોજેક્ટ ઉમેરો",
    createTask: "કાર્ય ઉમેરો",
    logout: "લૉગઆઉટ",
    welcomeBack: "આપનું સ્વાગત છે",
    demoAccounts: "ડેવલપર ડેમો એકાઉન્ટ્સ",
    active: "સક્રિય સાઇટ",
    planning: "આયોજન",
    onHold: "સ્થગિત",
    completed: "પૂર્ણ",
    todo: "કરવાના કાર્યો",
    inProgress: "પ્રગતિમાં",
    review: "સમીક્ષા અને મંજૂરી",
    done: "પૂર્ણ",
    low: "ઓછી",
    medium: "મધ્યમ",
    high: "ઉચ્ચ",
    assignedTo: "સોંપાયેલ",
    dueDate: "નિયત તારીખ",
    cancel: "રદ કરો",
    create: "બનાવો",
    admin: "એડમિન",
    contractor: "કોન્ટ્રાક્ટર",
    client: "ગ્રાહક",
    vendor: "વિક્રેતા",
    labor: "મજૂર",
    controlRoom: "નિયંત્રણ ખંડ",
    userDirectory: "વપરાશકર્તા નિર્દેશિકા",
    gstAnalytics: "જીએસટી વિશ્લેષણ",
    aiEngineNodes: "એઆઈ એન્જિન નોડ્સ",
    ganttSchedule: "ગેન્ટ સમયપત્રક",
    aiEstimateOcr: "એઆઈ અંદાજ અને OCR",
    labourPayroll: "મજૂરી અને પેરોલ",
    gstInvoicing: "જીએસટી ઇન્વોઇસિંગ",
    marketplaceShop: "માર્કેટપ્લેસ શોપ",
    siteCommChannel: "સાઇટ સંચાર ચેનલ",
    siteAssistantChat: "સાઇટ સહાયક ચેટ",
    billsInvoices: "બિલ અને ઇન્વૉઇસેસ",
    manageInventory: "ઇન્વેન્ટરી સંચાલન",
    incomingOrders: "આવતા ઓર્ડર્સ",
    assignedTasks: "સોંપાયેલ કાર્યો",
    shiftCheckIn: "શિફ્ટ ચેક-ઇન",
    manageSystemDetails: "સિસ્ટમ વિગતો, સ્થાનિક ડેટา અને કામગીરીનું સંચાલન કરો.",
    projectName: "પ્રોજેક્ટનું નામ",
    description: "વર્ણન",
    projectNamePlaceholder: "દા.ત. મરિના બે રેસીડેન્સી",
    projectDescPlaceholder: "સાઇટ જરૂરિયાતો વિગતવાર જણાવો...",
    activeUsers: "સક્રિય વપરાશકર્તાઓ",
    gstCollected: "એકત્રિત જીએસટી",
    aiModulesStatus: "એઆઈ મોડ્યુલોની સ્થિતિ",
    managedSites: "સંચાલિત સાઇટ્સ",
    pendingTasks: "બાકી કાર્યો",
    budgetBurnRate: "બજેટ વપરાશ દર",
    laborOnsite: "સાઇટ પર મજૂરો",
    projectProgress: "પ્રોજેક્ટ પ્રગતિ",
    projectBudget: "પ્રોજેક્ટ બજેટ",
    activeWorkersOnsite: "સાઇટ પર સક્રિય કામદારો",
    laborExpenses: "મજૂરી ખર્ચ",
    completedTasks: "પૂર્ણ થયેલ કાર્યો",
    attendanceLogged: "હાજરી નોંધણી",
    sites: "સાઇટ્સ",
    pending: "બાકી",
    optimal: "શ્રેષ્ઠ",
    workers: "કામદારો",
    complete: "પૂર્ણ",
    of: "માંથી",
    milestones: "લક્ષ્યો",
    totalAllocation: "કુલ ફાળવણી",
    onShiftToday: "આજે શિફ્ટ પર",
    accumulatedSalary: "એકત્રિત પગાર",
    compliance: "પાલન",
    leadContractor: "મુખ્ય કોન્ટ્રાક્ટર",
    assignedVendor: "સોંપાયેલ વિક્રેતા",
    clientOwner: "ગ્રાહક માલિક",
    selectContractor: "-- કોન્ટ્રાક્ટર પસંદ કરો --",
    selectVendor: "-- વિક્રેતા પસંદ કરો --",
    selectClient: "-- ગ્રાહક પસંદ કરો --"
  },
  bn: {
    brandName: "Construct.ai",
    tagline: "আপনার স্মার্ট বিল্ডার ওয়ার্কস্পেসে প্রবেশ করুন",
    login: "লগইন করুন",
    register: "নিবন্ধন করুন",
    username: "ব্যবহারকারীর নাম",
    password: "পাসওয়ার্ড",
    email: "ইমেল",
    role: "ভূমিকা",
    phoneNumber: "ফোন নম্বর",
    companyName: "কোম্পানির নাম",
    dashboard: "ড্যাশবোর্ড",
    overview: "ড্যাশবোর্ড সংক্ষিপ্ত বিবরণ",
    projects: "সাইট ও নির্মাণ প্রকল্পসমূহ",
    tasks: "কাজ ইউনিটসমূহ",
    budget: "সাইট বাজেট",
    startDate: "শুরু হওয়ার তারিখ",
    endDate: "শেষ হওয়ার তারিখ",
    status: "অবস্থা",
    priority: "অগ্রাধিকার",
    addProject: "প্রকল্প যোগ করুন",
    createTask: "কাজ তৈরি করুন",
    logout: "লগআউট",
    welcomeBack: "স্বাগতম",
    demoAccounts: "ডেভেলপার ডেমো অ্যাকাউন্ট",
    active: "সক্রিয় সাইট",
    planning: "পরিকল্পনা",
    onHold: "স্থগিত",
    completed: "সম্পন্ন",
    todo: "করণীয়",
    inProgress: "চলমান",
    review: "পর্যালোচনা ও অনুমোদন",
    done: "সম্পন্ন",
    low: "নিম্ন",
    medium: "মাঝারি",
    high: "উচ্চ",
    assignedTo: "বরাদ্দকৃত ব্যক্তি",
    dueDate: "নির্দিষ্ট সময়সীমা",
    cancel: "বাতিল করুন",
    create: "তৈরি করুন",
    admin: "প্রশাসক",
    contractor: "ঠিকাদার",
    client: "ক্লায়েন্ট",
    vendor: "বিক্রেতা",
    labor: "শ্রমিক",
    controlRoom: "নিয়ন্ত্রণ কক্ষ",
    userDirectory: "ব্যবহারকারী নির্দেশিকা",
    gstAnalytics: "জিএসটি বিশ্লেষণ",
    aiEngineNodes: "এআই ইঞ্জিন নোড",
    ganttSchedule: "গ্যান্ট সময়সূচী",
    aiEstimateOcr: "এআই অনুমান ও ওসিআর",
    labourPayroll: "শ্রম ও পে-রোল",
    gstInvoicing: "জিএসটি ইনভয়েসিং",
    marketplaceShop: "মার্কেটপ্লেস শপ",
    siteCommChannel: "সাইট যোগাযোগ চ্যানেল",
    siteAssistantChat: "সাইট সহকারী চ্যাট",
    billsInvoices: "বিল ও ইনভয়েস",
    manageInventory: "ইনভেন্টরি পরিচালনা",
    incomingOrders: "আগত অর্ডারসমূহ",
    assignedTasks: "বরাদ্দকৃত কাজ",
    shiftCheckIn: "শিফট চেক-ইন",
    manageSystemDetails: "সিস্টেমের বিবরণ, স্থানীয় ডেটা এবং ক্রিয়াকলাপ পরিচালনা করুন।",
    projectName: "প্রকল্পের নাম",
    description: "বর্ণন",
    projectNamePlaceholder: "উদাঃ মেরিনা বে রেসিডেন্স",
    projectDescPlaceholder: "সাইটের প্রয়োজনীয়তার বিবরণ দিন...",
    activeUsers: "সক্রিয় ব্যবহারকারী",
    gstCollected: "সংগৃহীত জিএসটি",
    aiModulesStatus: "এআই মডিউল অবস্থা",
    managedSites: "পরিচালিত সাইটসমূহ",
    pendingTasks: "লণ্ডিত কাজ",
    budgetBurnRate: "বজেট খরচ হার",
    laborOnsite: "সাইটে শ্রমিক",
    projectProgress: "প্রকল্পের অগ্রগতি",
    projectBudget: "প্রকল্পের বাজেট",
    activeWorkersOnsite: "সাইটে সক্রিয় কর্মী",
    laborExpenses: "শ্রম খরচ",
    completedTasks: "সম্পন্ন কাজ",
    attendanceLogged: "উপস্থিতি নথিভুক্ত",
    sites: "সাইটসমূহ",
    pending: "চলমান",
    optimal: "অনুকূল",
    workers: "কর্মী",
    complete: "সম্পন্ন",
    of: "এর মধ্যে",
    milestones: "মাইলফলক",
    totalAllocation: "মোট বরাদ্দ",
    onShiftToday: "আজকে শিফটে আছে",
    accumulatedSalary: "সঞ্চিত বেতন",
    compliance: "সম্মতি",
    leadContractor: "প্রধান ঠিকাদার",
    assignedVendor: "বরাদ্দকৃত বিক্রেতা",
    clientOwner: "ক্লায়েন্ট মালিক",
    selectContractor: "-- ঠিকাদার নির্বাচন করুন --",
    selectVendor: "-- বিক্রেতা নির্বাচন করুন --",
    selectClient: "-- ক্লায়েন্ট নির্বাচন করুন --"
  }
};

interface LanguageContextType {
  language: LanguageCode;
  t: TranslationDict;
  setLanguage: (lang: LanguageCode) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('app_language') as LanguageCode;
    if (savedLang && translations[savedLang]) {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
  };

  return (
    <LanguageContext.Provider value={{ language, t: translations[language], setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
