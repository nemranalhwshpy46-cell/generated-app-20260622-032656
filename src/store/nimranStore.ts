import { create } from "zustand";

export interface ProjectComponent {
  id: string;
  type: "header" | "button" | "input" | "status" | "image" | "video" | "gps";
  text: string;
  placeholder?: string;
  status?: string;
}

interface NimranState {
  language: "ar" | "en";
  setLanguage: (lang: "ar" | "en") => void;
  
  activeProjectId: string | null;
  setActiveProjectId: (id: string | null) => void;
  
  isCompiling: boolean;
  setIsCompiling: (val: boolean) => void;
  
  terminalHistory: Array<{ command: string; output: string; timestamp: number }>;
  addTerminalLogLocal: (command: string, output: string) => void;
  clearTerminalLogsLocal: () => void;
}

export const useNimranStore = create<NimranState>((set) => ({
  language: "ar",
  setLanguage: (lang) => set({ language: lang }),
  
  activeProjectId: null,
  setActiveProjectId: (id) => set({ activeProjectId: id }),
  
  isCompiling: false,
  setIsCompiling: (val) => set({ isCompiling: val }),
  
  terminalHistory: [],
  addTerminalLogLocal: (command, output) =>
    set((state) => ({
      terminalHistory: [
        { command, output, timestamp: Date.now() },
        ...state.terminalHistory,
      ].slice(0, 50),
    })),
  clearTerminalLogsLocal: () => set({ terminalHistory: [] }),
}));

// Arabic / English translation dictionary
export const translations = {
  ar: {
    title: "المبرمج نمران - أنظمة برمجة الهواتف الحديثة",
    subtitle: "منصة متطورة لتصميم وتجميع تطبيقات APK و IPA و HAP وكسر سرعة الهواتف",
    nimranBranding: "المبرمج نمران",
    dashboard: "لوحة التحكم",
    ideSuite: "محرر الأكواد الذكي",
    visualDesigner: "مصمم الواجهات المرئي",
    systemsTuning: "تعديل الأنظمة والكيرنل",
    terminalAi: "الطرفية والذكاء الاصطناعي",
    aboutNimran: "حول المبرمج نمران",
    languageLabel: "English",
    activeProjects: "المشاريع النشطة",
    createNewProject: "إنشاء مشروع برمجي جديد",
    projectName: "اسم المشروع",
    packageName: "اسم الحزمة (Package Name)",
    version: "الإصدار",
    platform: "نظام التشغيل",
    androidKotlin: "أندرويد - Kotlin SDK",
    iosSwift: "آيفون - Swift UI",
    harmonyArkTS: "هارموني - ArkTS OS",
    createBtn: "ابدأ البرمجة والتصميم",
    cancel: "إلغاء",
    compileBtn: "تجميع النظام الذكي APK / IPA",
    compiling: "جاري الترجمة والتجميع...",
    latestCompile: "آخر تجميع ناجح:",
    compileSuccess: "تم تجميع النظام وتوقيعه بنجاح!",
    fileSize: "حجم الملف:",
    downloadFile: "تحميل الملف المحاكي",
    codeEditorTitle: "محرر الكود المصدري الذكي",
    designerTitle: "شاشة محاكاة الهاتف الذكي",
    designerSub: "اسحب أو أضف العناصر التفاعلية لرؤية كيف يتشكل الكود في النظام المتطور",
    addComponent: "إضافة عنصر للواجهة",
    headerComp: "عنوان رأس الصفحة",
    buttonComp: "زر تفاعلي",
    inputComp: "حقل إدخال بيانات",
    statusComp: "مؤشر حالة النظام",
    imageComp: "مساحة عرض صورة",
    gpsComp: "تفعيل مستشعر GPS",
    clearDesigner: "إعادة ضبط الشاشة",
    systemPerformance: "أداء النواة والمعالجة الفائقة",
    cpuChart: "محاكي استهلاك المعالج الفائق",
    thermalTemp: "درجة حرارة المعالج CPU:",
    batterySave: "مؤشر توفير البطارية الذكي",
    kernelTuning: "تعديل إعدادات الكيرنل العميقة",
    tweakName: "اسم التعديل الفائق",
    tweakValue: "القوة البرمجية للتعديل",
    tweakStatus: "حالة التفعيل",
    active: "نشط ومفعل",
    inactive: "غير نشط",
    applyTweaks: "تطبيق التعديلات على نواة الهاتف",
    terminalTitle: "موجه أوامر نمران (Command Shell Emulator)",
    terminalPlaceholder: "اكتب الأمر هنا (مثال: help, nimran-compile, nimran-adb devices)...",
    runCommand: "تنفيذ",
    aiTitle: "مساعد المبرمج نمران بالذكاء الاصطناعي",
    aiPlaceholder: "اسأل نمران AI عن الأكواد وتعديل الأنظمة...",
    send: "إرسال",
    recentProjects: "مشاريعك البرمجية المتطورة",
    systemDiagnostics: "تشخيصات الأنظمة الذكية",
    androidStatus: "نظام الأندرويد: جاهز",
    iosStatus: "نظام الـ iOS: آمن",
    harmonyStatus: "نظام الـ Harmony: متصل",
    connectedDevices: "الأجهزة المتصلة:",
    noProjects: "لا توجد مشاريع حالية. يرجى تهيئة مشروع للبدء!",
    codePreview: "معاينة كود النظام",
    saveSuccess: "تم حفظ الكود والمكونات في قاعدة البيانات بنجاح!",
    saveBtn: "حفظ التعديلات",
    quickStats: "إحصائيات سريعة للأنظمة",
    activePlatformCount: "3 منصات متطورة",
    compiledCount: "تجميع فوري ذكي",
    creatorCredits: "جميع الحقوق محفوظة © للمطور والمبرمج نمران"
  },
  en: {
    title: "Programmer Nimran - Mobile Systems Suite",
    subtitle: "Advanced workspace to design & compile APK, IPA, HAP apps and adjust kernel parameters",
    nimranBranding: "Programmer Nimran",
    dashboard: "Dashboard",
    ideSuite: "Smart Code IDE",
    visualDesigner: "Visual UI Designer",
    systemsTuning: "Systems & Kernel Tuning",
    terminalAi: "Terminal & Nimran AI",
    aboutNimran: "About Nimran",
    languageLabel: "العربية",
    activeProjects: "Active Projects",
    createNewProject: "Create New Software Project",
    projectName: "Project Name",
    packageName: "Package Name",
    version: "Version",
    platform: "Platform",
    androidKotlin: "Android - Kotlin SDK",
    iosSwift: "iPhone - SwiftUI Engine",
    harmonyArkTS: "HarmonyOS - ArkTS Engine",
    createBtn: "Start Coding & Design",
    cancel: "Cancel",
    compileBtn: "Compile Smart APK / IPA",
    compiling: "Translating & Compiling...",
    latestCompile: "Last Successful Build:",
    compileSuccess: "Compiled & Signed Successfully!",
    fileSize: "File Size:",
    downloadFile: "Download Simulated App",
    codeEditorTitle: "Smart Source Code Editor",
    designerTitle: "Smartphone Simulation View",
    designerSub: "Add or drag interactive UI elements to see how system code responds",
    addComponent: "Add UI Component",
    headerComp: "Header Component",
    buttonComp: "Interactive Button",
    inputComp: "Text Input Field",
    statusComp: "System Status Flag",
    imageComp: "Image View Slot",
    gpsComp: "GPS Sensor Toggle",
    clearDesigner: "Reset Viewport",
    systemPerformance: "Core Performance & Supercharging",
    cpuChart: "CPU Throttle Simulation",
    thermalTemp: "CPU Temperature:",
    batterySave: "Smart Battery Optimization",
    kernelTuning: "Deep Kernel Adjustments",
    tweakName: "Advanced Tweak Name",
    tweakValue: "System Allocation Strength",
    tweakStatus: "Activation Status",
    active: "Active & Latent",
    inactive: "Inactive",
    applyTweaks: "Flash Tweaks to Phone Kernel",
    terminalTitle: "Nimran Command Shell Emulator",
    terminalPlaceholder: "Enter custom commands (try: help, nimran-compile, nimran-adb devices)...",
    runCommand: "Execute",
    aiTitle: "Programmer Nimran AI Assistant",
    aiPlaceholder: "Ask Nimran AI about code templates or system mods...",
    send: "Send",
    recentProjects: "Your Advanced Software Projects",
    systemDiagnostics: "Smart Systems Diagnostics",
    androidStatus: "Android OS: Ready",
    iosStatus: "iOS Core: Secure",
    harmonyStatus: "HarmonyOS: Connected",
    connectedDevices: "Connected Target Devices:",
    noProjects: "No projects yet. Initiate one to start coding!",
    codePreview: "System Code Preview",
    saveSuccess: "Saved code and designer state to database!",
    saveBtn: "Save Draft",
    quickStats: "Rapid Telemetry Info",
    activePlatformCount: "3 High-Tech Engines",
    compiledCount: "Real-time Native Build",
    creatorCredits: "All Rights Reserved © Developer Programmer Nimran"
  }
};
