import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useNimranStore, translations } from "@/store/nimranStore";
import { 
  Code2, 
  Smartphone, 
  Play, 
  Save, 
  Settings, 
  CheckCircle, 
  RefreshCw, 
  Info, 
  Cpu, 
  AlertCircle,
  Sparkles,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Toaster, toast } from "sonner";

export function IdePage() {
  const language = useNimranStore((state) => state.language);
  const activeProjectId = useNimranStore((state) => state.activeProjectId);
  const isCompiling = useNimranStore((state) => state.isCompiling);
  const setIsCompiling = useNimranStore((state) => state.setIsCompiling);
  
  const t = translations[language];
  const isRtl = language === "ar";

  // Convex Queries and Mutations
  const projects = useQuery(api.nimran.getProjects);
  const updateProjectMutation = useMutation(api.nimran.updateProject);
  const compileProjectMutation = useMutation(api.nimran.compileProject);

  // Find active project
  const activeProject = projects?.find((p) => p._id === activeProjectId) || projects?.[0];

  // IDE Local States
  const [codeContent, setCodeContent] = useState("");
  const [projName, setProjName] = useState("");
  const [projPkg, setProjPkg] = useState("");
  const [projVer, setProjVer] = useState("");
  const [compilerLogs, setCompilerLogs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"editor" | "settings">("editor");
  const [simulatedScreenStatus, setSimulatedScreenStatus] = useState<string>("IDLE");

  // Sync state when active project loads
  useEffect(() => {
    if (activeProject) {
      setCodeContent(activeProject.code);
      setProjName(activeProject.name);
      setProjPkg(activeProject.packageName);
      setProjVer(activeProject.version);
      setCompilerLogs([`[IDE-SHELL] Loaded project: ${activeProject.name} successfully.`]);
    }
  }, [activeProject]);

  const handleSave = async () => {
    if (!activeProject) return;
    try {
      await updateProjectMutation({
        id: activeProject._id,
        name: projName,
        packageName: projPkg,
        version: projVer,
        code: codeContent,
        designerLayout: activeProject.designerLayout,
      });
      toast.success(t.saveSuccess);
      setCompilerLogs(prev => [
        ...prev,
        `[IDE-SHELL] [${new Date().toLocaleTimeString()}] Saved draft updates to Cloud database.`
      ]);
    } catch (err: any) {
      toast.error(err.message || "Failed to save project");
    }
  };

  const handleCompile = async () => {
    if (!activeProject) return;
    setIsCompiling(true);
    setSimulatedScreenStatus("COMPILING");
    setCompilerLogs(prev => [
      ...prev,
      `[IDE-SHELL] [${new Date().toLocaleTimeString()}] Spawning build subprocess...`,
      `[IDE-SHELL] Running custom APK assembler on target ${activeProject.type.toUpperCase()}`
    ]);

    try {
      const result = await compileProjectMutation({ id: activeProject._id });
      setCompilerLogs(prev => [...prev, result.logOutput]);
      setSimulatedScreenStatus("COMPILED");
      toast.success(t.compileSuccess, {
        description: `${t.fileSize} ${result.size}`
      });
    } catch (err: any) {
      setSimulatedScreenStatus("ERROR");
      setCompilerLogs(prev => [...prev, `[COMPILER-ERROR] Build failed: ${err.message}`]);
      toast.error("Compilation error");
    } finally {
      setIsCompiling(false);
    }
  };

  // Safe split for rendering line numbers
  const linesCount = codeContent.split("\n").length;

  // Visual simulation components parsed from project data
  const visualComponents = React.useMemo(() => {
    try {
      return activeProject?.designerLayout ? JSON.parse(activeProject.designerLayout) : [];
    } catch (e) {
      return [];
    }
  }, [activeProject]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8" dir={isRtl ? "rtl" : "ltr"}>
      {/* Title block */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 flex items-center gap-2">
            <Code2 className="h-6 w-6 text-cyan-400" />
            {t.ideSuite}
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            {activeProject ? `${activeProject.name} (${activeProject.type.toUpperCase()})` : "يرجى تحديد مشروع من الرئيسية للبدء"}
          </p>
        </div>

        {/* Quick Toolbar */}
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleSave} 
            variant="outline" 
            size="sm" 
            className="border-cyan-500/20 hover:border-cyan-400 hover:bg-cyan-950/20 text-cyan-400 flex items-center gap-1.5"
            disabled={!activeProject}
          >
            <Save className="h-4 w-4" />
            {t.saveBtn}
          </Button>
          
          <Button 
            onClick={handleCompile} 
            disabled={!activeProject || isCompiling}
            className="bg-cyan-500 hover:bg-cyan-600 disabled:bg-zinc-800 text-zinc-950 font-bold flex items-center gap-1.5"
            size="sm"
          >
            {isCompiling ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {isCompiling ? t.compiling : t.compileBtn}
          </Button>
        </div>
      </div>

      {!activeProject ? (
        <Card className="bg-zinc-900/40 border-cyan-950/40 p-8 text-center">
          <AlertCircle className="h-10 w-10 text-cyan-400 mx-auto mb-4" />
          <CardTitle className="text-zinc-200 mb-2">{isRtl ? "لم يتم اختيار مشروع" : "No Active Project"}</CardTitle>
          <CardDescription className="text-zinc-400">
            {isRtl ? "توجه إلى لوحة التحكم الرئيسية وقم بتهيئة مشروع للبدء بالكتابة والتعديل." : "Go back to the dashboard to launch or generate an app."}
          </CardDescription>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Editor Workspace Panel (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            <Card className="bg-zinc-900/60 border-cyan-950/30 flex-1 flex flex-col overflow-hidden">
              <CardHeader className="py-3 px-4 border-b border-cyan-950/30 flex flex-row justify-between items-center bg-zinc-900/40">
                <div className="flex items-center gap-3">
                  <Button 
                    onClick={() => setActiveTab("editor")}
                    className={`text-xs px-3 py-1.5 rounded-lg h-auto transition-all ${
                      activeTab === "editor" ? "bg-cyan-950/60 text-cyan-400 border border-cyan-500/20" : "bg-transparent text-zinc-400"
                    }`}
                  >
                    {t.codeEditorTitle}
                  </Button>
                  <Button 
                    onClick={() => setActiveTab("settings")}
                    className={`text-xs px-3 py-1.5 rounded-lg h-auto transition-all ${
                      activeTab === "settings" ? "bg-cyan-950/60 text-cyan-400 border border-cyan-500/20" : "bg-transparent text-zinc-400"
                    }`}
                  >
                    <Settings className="h-3 w-3 mr-1 inline" />
                    {isRtl ? "إعدادات الحزمة" : "Package Config"}
                  </Button>
                </div>
                
                <span className="text-xs font-mono text-zinc-500 bg-zinc-950 px-2 py-1 rounded">
                  {activeProject.type === "android" ? "MainActivity.kt" : activeProject.type === "ios" ? "ContentView.swift" : "Index.ets"}
                </span>
              </CardHeader>
              
              <CardContent className="p-0 flex flex-1 flex-row font-mono text-sm leading-relaxed overflow-hidden h-[420px]">
                {activeTab === "editor" ? (
                  <>
                    {/* Line numbers bar */}
                    <div className="bg-zinc-950 text-zinc-600 px-3 py-4 text-right select-none border-r border-cyan-950/20 min-w-[40px] text-xs">
                      {Array.from({ length: linesCount }).map((_, idx) => (
                        <div key={idx}>{idx + 1}</div>
                      ))}
                    </div>

                    {/* Editor Input Area */}
                    <textarea
                      value={codeContent}
                      onChange={(e) => setCodeContent(e.target.value)}
                      spellCheck={false}
                      className="flex-1 w-full bg-zinc-950 text-cyan-300 p-4 focus:outline-none resize-none font-mono text-xs md:text-sm leading-relaxed"
                    />
                  </>
                ) : (
                  <div className="p-6 space-y-4 w-full">
                    <h3 className="text-sm font-semibold text-cyan-400 mb-4">{isRtl ? "تعديل معلمات الحزمة" : "Package Environment Parameters"}</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-zinc-400 mb-1 block">{t.projectName}</label>
                        <Input 
                          value={projName} 
                          onChange={(e) => setProjName(e.target.value)} 
                          className="bg-zinc-950 border-cyan-950 focus:border-cyan-500 text-zinc-100"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-zinc-400 mb-1 block">{t.packageName}</label>
                        <Input 
                          value={projPkg} 
                          onChange={(e) => setProjPkg(e.target.value)} 
                          className="bg-zinc-950 border-cyan-950 focus:border-cyan-500 text-zinc-100"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-zinc-400 mb-1 block">{t.version}</label>
                        <Input 
                          value={projVer} 
                          onChange={(e) => setProjVer(e.target.value)} 
                          className="bg-zinc-950 border-cyan-950 focus:border-cyan-500 text-zinc-100"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Compiler Console Console (Logs view) */}
            <Card className="bg-zinc-900/60 border-cyan-950/30">
              <CardHeader className="py-2.5 px-4 border-b border-cyan-950/30 bg-zinc-900/40">
                <CardTitle className="text-xs font-mono text-cyan-400 flex items-center gap-1.5">
                  <Cpu className="h-3.5 w-3.5 text-cyan-400" />
                  NIMRAN-COMPILER OUTPUT CONSOLE
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 bg-zinc-950 text-xs text-zinc-300 font-mono h-40 overflow-y-auto space-y-1">
                {compilerLogs.map((log, i) => (
                  <pre key={i} className="whitespace-pre-wrap leading-relaxed break-all">
                    {log}
                  </pre>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Interactive Mobile Simulator (5 Cols) */}
          <div className="lg:col-span-5">
            <Card className="bg-zinc-900/60 border-cyan-950/30 h-full flex flex-col">
              <CardHeader className="py-3 px-4 border-b border-cyan-950/30">
                <CardTitle className="text-sm font-bold text-zinc-200">
                  {t.designerTitle}
                </CardTitle>
                <CardDescription className="text-xs">
                  {activeProject.type === "android" ? "Android 14 API level 34 Simulator" : activeProject.type === "ios" ? "iOS 17 Simulator View" : "HarmonyOS Next API 12"}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 flex flex-1 items-center justify-center bg-zinc-950/40">
                {/* Physical Phone Frame */}
                <div className="w-[280px] h-[520px] rounded-[36px] bg-zinc-950 border-4 border-zinc-800 shadow-[0_0_35px_rgba(6,182,212,0.15)] flex flex-col overflow-hidden relative">
                  
                  {/* Top Notch */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 rounded-full bg-zinc-800 z-10 flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-zinc-900 mr-2" />
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-900 animate-pulse" />
                  </div>

                  {/* StatusBar */}
                  <div className="h-7 bg-zinc-900 flex justify-between items-end px-5 text-[9px] text-zinc-400 font-mono pb-1 select-none">
                    <span>9:41</span>
                    <div className="flex items-center gap-1">
                      <span>5G</span>
                      <div className="w-4 h-2 border border-zinc-500 rounded-sm bg-cyan-400" />
                    </div>
                  </div>

                  {/* Simulator Screen Content */}
                  <div className="flex-1 bg-zinc-900 p-4 overflow-y-auto space-y-4">
                    {/* Render visual elements or simple placeholder */}
                    {visualComponents.length > 0 ? (
                      visualComponents.map((comp: any) => {
                        if (comp.type === "header") {
                          return (
                            <h2 key={comp.id} className="text-base font-bold text-cyan-400 text-center py-2 border-b border-cyan-950/30">
                              {comp.text}
                            </h2>
                          );
                        }
                        if (comp.type === "button") {
                          return (
                            <Button key={comp.id} className="w-full bg-cyan-600 hover:bg-cyan-700 text-zinc-950 font-bold py-2 rounded text-xs">
                              {comp.text}
                            </Button>
                          );
                        }
                        if (comp.type === "input") {
                          return (
                            <Input key={comp.id} readOnly placeholder={comp.placeholder} className="bg-zinc-950 border-zinc-800 text-xs h-8 text-zinc-300" />
                          );
                        }
                        if (comp.type === "status") {
                          return (
                            <div key={comp.id} className="text-[10px] text-center bg-zinc-950 border border-emerald-500/20 text-emerald-400 p-1.5 rounded-lg font-mono">
                              {comp.status}
                            </div>
                          );
                        }
                        return null;
                      })
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center p-4">
                        <Smartphone className="h-8 w-8 text-cyan-400 mb-2 animate-bounce" />
                        <span className="text-xs text-zinc-500 font-mono">No elements designed yet</span>
                      </div>
                    )}
                  </div>

                  {/* App compilation download action */}
                  {activeProject.compiledAt && (
                    <div className="absolute bottom-4 left-4 right-4 p-3 rounded-2xl bg-zinc-950/95 border border-cyan-500/30 text-center animate-fade-in backdrop-blur-sm shadow-xl">
                      <p className="text-[10px] text-zinc-300 font-bold mb-1.5 flex items-center justify-center gap-1">
                        <CheckCircle className="h-3 w-3 text-emerald-400" />
                        {isRtl ? "تم تجميع الحزمة!" : "App Compiled!"}
                      </p>
                      <Button asChild size="sm" className="w-full bg-emerald-500 hover:bg-emerald-600 text-zinc-950 text-[10px] h-7 font-bold">
                        <a href={activeProject.apkUrl} download>
                          <Download className="h-3.5 w-3.5 mr-1" />
                          {t.downloadFile}
                        </a>
                      </Button>
                    </div>
                  )}

                  {/* Bottom Home Indicator */}
                  <div className="h-6 bg-zinc-900 flex items-center justify-center">
                    <div className="w-24 h-1 rounded-full bg-zinc-700" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <Toaster richColors closeButton />
    </div>
  );
}
