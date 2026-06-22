import React, { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useNimranStore, translations } from "@/store/nimranStore";
import { 
  Plus, 
  Smartphone, 
  Cpu, 
  Activity, 
  Code, 
  Layers, 
  Terminal, 
  CheckCircle, 
  Play, 
  Trash, 
  Download, 
  Layers3, 
  RefreshCw,
  Sparkles,
  Info
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Toaster, toast } from "sonner";
import { SignInForm } from "@/components/SignInForm";
import { SignOutButton } from "@/components/SignOutButton";

export function HomePage() {
  const navigate = useNavigate();
  
  // Zustand State (using only primitive selectors to follow absolute rules)
  const language = useNimranStore((state) => state.language);
  const setLanguage = useNimranStore((state) => state.setLanguage);
  const activeProjectId = useNimranStore((state) => state.activeProjectId);
  const setActiveProjectId = useNimranStore((state) => state.setActiveProjectId);
  const isCompiling = useNimranStore((state) => state.isCompiling);
  const setIsCompiling = useNimranStore((state) => state.setIsCompiling);

  const t = translations[language];
  const isRtl = language === "ar";

  // Convex Queries and Mutations
  const projects = useQuery(api.nimran.getProjects);
  const user = useQuery(api.auth.loggedInUser);
  
  // Seeding mutations
  const seedProjects = useMutation(api.nimran.seedDefaultProjects);
  const seedTweaks = useMutation(api.nimran.seedDefaultTweaks);
  const seedLogs = useMutation(api.nimran.seedDefaultLogs);
  const seedAi = useMutation(api.nimran.seedDefaultAiMessages);

  // Core mutations
  const createProjectMutation = useMutation(api.nimran.createProject);
  const compileProjectMutation = useMutation(api.nimran.compileProject);

  // New Project Form State
  const [newProjName, setNewProjName] = useState("");
  const [newProjType, setNewProjType] = useState("android");
  const [newProjPkg, setNewProjPkg] = useState("com.nimran.myapp");
  const [newProjVer, setNewProjVer] = useState("1.0.0");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [compilingId, setCompilingId] = useState<string | null>(null);

  // Automatically seed tables on mount if database is empty
  useEffect(() => {
    async function triggerSeeding() {
      try {
        await seedProjects();
        await seedTweaks();
        await seedLogs();
        await seedAi();
      } catch (err) {
        console.error("Seeding error:", err);
      }
    }
    triggerSeeding();
  }, [seedProjects, seedTweaks, seedLogs, seedAi]);

  // Set first project as active if none selected
  useEffect(() => {
    if (projects && projects.length > 0 && !activeProjectId) {
      setActiveProjectId(projects[0]._id);
    }
  }, [projects, activeProjectId, setActiveProjectId]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName.trim() || !newProjPkg.trim()) {
      toast.error(isRtl ? "يرجى إكمال جميع الحقول" : "Please fill out all fields");
      return;
    }

    try {
      const newId = await createProjectMutation({
        name: newProjName,
        type: newProjType,
        packageName: newProjPkg,
        version: newProjVer,
      });
      setActiveProjectId(newId);
      setIsCreateOpen(false);
      // Reset form
      setNewProjName("");
      setNewProjType("android");
      setNewProjPkg("com.nimran.myapp");
      setNewProjVer("1.0.0");
      toast.success(isRtl ? "تم إنشاء مشروع نمران الجديد بنجاح!" : "Successfully created new Nimran project!");
      navigate("/ide");
    } catch (err: any) {
      toast.error(err.message || "Failed to create project");
    }
  };

  const handleCompile = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (isCompiling) return;

    setIsCompiling(true);
    setCompilingId(projectId);
    toast.info(isRtl ? "جاري تجميع الكود المصدري وتوليد ملف النظام..." : "Compiling source code and generating system file...");

    try {
      const result = await compileProjectMutation({ id: projectId as any });
      toast.success(isRtl ? "تم تجميع التطبيق وتوقيعه بنجاح!" : "Application compiled and signed successfully!", {
        description: `${isRtl ? "الحجم:" : "Size:"} ${result.size}`,
      });
    } catch (err: any) {
      toast.error(err.message || "Compilation failed");
    } finally {
      setIsCompiling(false);
      setCompilingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8" dir={isRtl ? "rtl" : "ltr"}>
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-gradient-to-r from-cyan-950/20 via-zinc-900 to-indigo-950/20 p-6 rounded-2xl border border-cyan-950/30">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-cyan-500/10 text-cyan-400 text-xs px-2.5 py-1 rounded-full font-mono border border-cyan-500/20 flex items-center gap-1">
              <Sparkles className="h-3 w-3 animate-spin text-cyan-400" />
              {isRtl ? "المبرمج نمران - المنصة الاحترافية" : "Developer Nimran - Pro Suite"}
            </span>
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-zinc-100">
            {t.title}
          </h1>
          <p className="text-zinc-400 text-sm md:text-base mt-2 max-w-2xl">
            {t.subtitle}
          </p>
        </div>
        
        {/* Auth & Language Quick Action */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          {user ? (
            <div className="flex items-center gap-3 bg-cyan-950/30 px-4 py-2 rounded-xl border border-cyan-950/40">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono text-cyan-300">{user.email}</span>
              <SignOutButton />
            </div>
          ) : (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="border-cyan-500/20 hover:border-cyan-400 hover:bg-cyan-950/30 text-cyan-400">
                  {isRtl ? "تسجيل الدخول (اختياري)" : "Sign In (Optional)"}
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-zinc-950 border-cyan-950 text-zinc-100 max-w-md">
                <DialogHeader dir={isRtl ? "rtl" : "ltr"}>
                  <DialogTitle className="text-cyan-400">{isRtl ? "حساب المبرمج نمران" : "Nimran Programmer Account"}</DialogTitle>
                  <DialogDescription>
                    {isRtl ? "قم بتسجيل الدخول للاحتفاظ بمشاريعك ومزامنتها سحابياً." : "Sign in to keep your custom code modifications synchronized."}
                  </DialogDescription>
                </DialogHeader>
                <SignInForm />
              </DialogContent>
            </Dialog>
          )}

          <Button
            onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
            variant="ghost"
            size="sm"
            className="text-zinc-400 hover:text-cyan-400"
          >
            {t.languageLabel}
          </Button>
        </div>
      </div>

      {/* Systems telemetry & diagnostics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-zinc-900/60 border-cyan-950/40 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-zinc-400 flex items-center gap-2">
              <Activity className="h-4 w-4 text-cyan-400" />
              {isRtl ? "حالة الأجهزة المستهدفة" : "Target Devices Status"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-400 font-mono">3 {isRtl ? "أجهزة متصلة" : "Connected"}</div>
            <p className="text-[11px] text-zinc-500 mt-1 font-mono">nimran_phone_ultra, emulator-5554, harmony_pad</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/60 border-cyan-950/40 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-zinc-400 flex items-center gap-2">
              <Cpu className="h-4 w-4 text-indigo-400" />
              {isRtl ? "تحسين النواة النشط" : "Kernel Optimization"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-400 font-mono">95% {isRtl ? "جاهزية" : "Ready"}</div>
            <p className="text-[11px] text-zinc-500 mt-1 font-mono">Touch Boost & CPU Governor Tweak: ON</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/60 border-cyan-950/40 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-zinc-400 flex items-center gap-2">
              <Layers3 className="h-4 w-4 text-emerald-400" />
              {isRtl ? "سرعة الترجمة الفورية" : "ArkCompiler / Fast dex"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400 font-mono">Instant {isRtl ? "فوري" : "Build"}</div>
            <p className="text-[11px] text-zinc-500 mt-1 font-mono">Optimized Dexing & SwiftUI compiler online</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/60 border-cyan-950/40 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-zinc-400 flex items-center gap-2">
              <Terminal className="h-4 w-4 text-amber-400" />
              {isRtl ? "إصدار بيئة نمران" : "Nimran Environment"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-400 font-mono">v3.0.4-PRO</div>
            <p className="text-[11px] text-zinc-500 mt-1 font-mono">All platforms (APK, IPA, HAP, ELF)</p>
          </CardContent>
        </Card>
      </div>

      {/* Main projects workspace */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-cyan-400">
          {t.recentProjects}
        </h2>

        {/* Dialog to create a project */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-cyan-500 hover:bg-cyan-600 text-zinc-950 font-bold flex items-center gap-2 px-4 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all">
              <Plus className="h-4 w-4" />
              {t.createNewProject}
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border border-cyan-950 text-zinc-100 max-w-lg">
            <form onSubmit={handleCreateProject}>
              <DialogHeader dir={isRtl ? "rtl" : "ltr"}>
                <DialogTitle className="text-cyan-400 font-bold text-lg">{t.createNewProject}</DialogTitle>
                <DialogDescription className="text-zinc-400">
                  {isRtl ? "قم بتهيئة بارامترات التطبيق الجديد. سيقوم محرك نمران الذكي بتوليد الأكواد الأساسية فوراً." : "Configure parameters for your new application. Nimran's compile suite will write the foundation structure immediately."}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4" dir={isRtl ? "rtl" : "ltr"}>
                <div className="space-y-2">
                  <label className="text-xs text-zinc-400 font-semibold">{t.projectName}</label>
                  <Input 
                    placeholder="مثال: تطبيق نمران الذكي" 
                    value={newProjName} 
                    onChange={(e) => setNewProjName(e.target.value)}
                    className="bg-zinc-950 border-cyan-950 text-zinc-100 focus:border-cyan-400"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-zinc-400 font-semibold">{t.packageName}</label>
                    <Input 
                      placeholder="com.nimran.app" 
                      value={newProjPkg} 
                      onChange={(e) => setNewProjPkg(e.target.value)}
                      className="bg-zinc-950 border-cyan-950 text-zinc-100 focus:border-cyan-400"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-zinc-400 font-semibold">{t.version}</label>
                    <Input 
                      placeholder="1.0.0" 
                      value={newProjVer} 
                      onChange={(e) => setNewProjVer(e.target.value)}
                      className="bg-zinc-950 border-cyan-950 text-zinc-100 focus:border-cyan-400"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-zinc-400 font-semibold">{t.platform}</label>
                  <Select value={newProjType} onValueChange={(value) => setNewProjType(value)}>
                    <SelectTrigger className="bg-zinc-950 border-cyan-950 text-zinc-100">
                      <SelectValue placeholder="اختر المنصة" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-cyan-950 text-zinc-100">
                      <SelectItem value="android">{t.androidKotlin}</SelectItem>
                      <SelectItem value="ios">{t.iosSwift}</SelectItem>
                      <SelectItem value="harmonyos">{t.harmonyArkTS}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter className="gap-2" dir={isRtl ? "rtl" : "ltr"}>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateOpen(false)}
                  className="border-zinc-800 text-zinc-400 hover:text-zinc-100"
                >
                  {t.cancel}
                </Button>
                <Button type="submit" className="bg-cyan-500 hover:bg-cyan-600 text-zinc-950 font-bold">
                  {t.createBtn}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Projects list */}
      {!projects ? (
        <div className="flex flex-col items-center justify-center p-12 bg-zinc-900/30 rounded-2xl border border-dashed border-cyan-950/40">
          <RefreshCw className="h-8 w-8 text-cyan-400 animate-spin mb-4" />
          <p className="text-zinc-400 text-sm font-mono">{isRtl ? "جاري الاتصال بقاعدة البيانات السحابية..." : "Connecting to cloud backend..."}</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center p-12 bg-zinc-900/30 rounded-2xl border border-dashed border-cyan-950/40">
          <p className="text-zinc-400 mb-4">{t.noProjects}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => {
            const isActive = activeProjectId === proj._id;
            const platformName = 
              proj.type === "android" ? t.androidKotlin : 
              proj.type === "ios" ? t.iosSwift : t.harmonyArkTS;
            
            return (
              <Card 
                key={proj._id} 
                onClick={() => setActiveProjectId(proj._id)}
                className={`group relative overflow-hidden bg-zinc-900/80 border-cyan-950/60 hover:border-cyan-500/50 transition-all duration-300 shadow-lg cursor-pointer ${
                  isActive ? "ring-2 ring-cyan-500 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.15)]" : ""
                }`}
              >
                {/* Visual platform glow banner */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                  proj.type === "android" ? "bg-cyan-500" : 
                  proj.type === "ios" ? "bg-indigo-500" : "bg-emerald-500"
                }`} />

                <CardHeader className="pb-3 pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                        proj.type === "android" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : 
                        proj.type === "ios" ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" : 
                        "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      }`}>
                        {platformName}
                      </span>
                    </div>
                    {isActive && (
                      <span className="text-[10px] bg-cyan-500 text-zinc-950 font-bold px-2 py-0.5 rounded">
                        {isRtl ? "مفتوح في بيئة العمل" : "ACTIVE WORKSPACE"}
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-lg font-bold text-zinc-100 group-hover:text-cyan-400 mt-3 transition-colors">
                    {proj.name}
                  </CardTitle>
                  <CardDescription className="font-mono text-xs text-zinc-500 mt-1">
                    {proj.packageName} • v{proj.version}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pb-4">
                  <div className="text-xs text-zinc-400 bg-zinc-950/50 p-2.5 rounded-lg font-mono border border-cyan-950/30 truncate">
                    {proj.code.split("\n").filter(line => line.trim().length > 0).slice(0, 3).join(" ")}...
                  </div>
                  
                  {proj.compiledAt && (
                    <div className="mt-3 flex items-center justify-between text-xs text-emerald-400 font-mono bg-emerald-950/10 p-2 rounded border border-emerald-500/10">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle className="h-3 w-3" />
                        {isRtl ? "تجميع ناجح" : "Compiled Successfully"}
                      </span>
                      <span>
                        {new Date(proj.compiledAt).toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="border-t border-cyan-950/20 pt-4 flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <Button 
                    onClick={() => {
                      setActiveProjectId(proj._id);
                      navigate("/ide");
                    }}
                    variant="secondary" 
                    size="sm" 
                    className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 gap-1.5"
                  >
                    <Code className="h-3.5 w-3.5 text-cyan-400" />
                    {isRtl ? "الأكواد" : "Code IDE"}
                  </Button>

                  <Button 
                    onClick={() => {
                      setActiveProjectId(proj._id);
                      navigate("/designer");
                    }}
                    variant="secondary" 
                    size="sm" 
                    className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 gap-1.5"
                  >
                    <Layers className="h-3.5 w-3.5 text-indigo-400" />
                    {isRtl ? "الواجهات" : "Designer"}
                  </Button>

                  <Button 
                    onClick={(e) => handleCompile(proj._id, e)}
                    disabled={isCompiling && compilingId === proj._id}
                    className="flex-1 bg-cyan-500 hover:bg-cyan-600 disabled:bg-zinc-800 text-zinc-950 font-bold gap-1.5"
                    size="sm"
                  >
                    {isCompiling && compilingId === proj._id ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Play className="h-3.5 w-3.5" />
                    )}
                    {isRtl ? "تجميع APK" : "Build APK"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Developer Nimran suite overview info */}
      <div className="mt-12 bg-gradient-to-br from-zinc-900 to-cyan-950/20 p-6 rounded-2xl border border-cyan-950/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0">
            <Info className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-cyan-400 mb-1">
              {isRtl ? "بيان الجودة والتقنيات الحديثة للمبرمج نمران" : "Nimran Software Modern Technology Manifesto"}
            </h3>
            <p className="text-zinc-400 text-xs md:text-sm leading-relaxed">
              {isRtl ? (
                "تم تصميم وتطوير هذه البيئة المتكاملة لتلبي تطلعات المطورين والمهتمين بتعديل الأنظمة وتجميع واجهات تطبيقات APK الاحترافية لجميع الأجهزة الذكية من فئات Android و iOS و HarmonyOS. نحن نستخدم مترجمات افتراضية دقيقة تحاكي الترجمات النقدية للهواتف الذكية مع تكامل مباشر مع نظام Tuning لضبط تردد المعالجات والتحكم بنواة الأنظمة بطرق آمنة وسهلة الاستخدام."
              ) : (
                "This comprehensive suite is designed to fulfill the expectations of system engineers compiling modern APK apps, Swift structures, and HarmonyOS packages. We employ simulated compiler loops that replicate Gradle and Xcode workflows with native touch booster governors, CPU throttling meters, and real-time interactive design structures."
              )}
            </p>
          </div>
        </div>
      </div>

      <Toaster richColors closeButton />
    </div>
  );
}
