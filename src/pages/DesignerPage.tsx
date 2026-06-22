import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useNimranStore, translations, ProjectComponent } from "@/store/nimranStore";
import { 
  Plus, 
  Trash2, 
  Save, 
  Smartphone, 
  Sliders, 
  Heading, 
  Hand, 
  Type, 
  Eye, 
  MapPin, 
  Image as ImageIcon,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Toaster, toast } from "sonner";

export function DesignerPage() {
  const language = useNimranStore((state) => state.language);
  const activeProjectId = useNimranStore((state) => state.activeProjectId);
  
  const t = translations[language];
  const isRtl = language === "ar";

  // Convex Queries & Mutations
  const projects = useQuery(api.nimran.getProjects);
  const updateProjectMutation = useMutation(api.nimran.updateProject);

  const activeProject = projects?.find((p) => p._id === activeProjectId) || projects?.[0];

  // Local designer layouts
  const [components, setComponents] = useState<ProjectComponent[]>([]);

  // Sync state on load
  useEffect(() => {
    if (activeProject?.designerLayout) {
      try {
        setComponents(JSON.parse(activeProject.designerLayout));
      } catch (e) {
        setComponents([]);
      }
    } else {
      setComponents([]);
    }
  }, [activeProject]);

  const addComponent = (type: ProjectComponent["type"]) => {
    const id = Date.now().toString();
    let text = "";
    let placeholder = "";
    let status = "";

    if (type === "header") text = isRtl ? "عنوان جديد" : "New Header Title";
    if (type === "button") text = isRtl ? "اضغط هنا" : "Interact Button";
    if (type === "input") placeholder = isRtl ? "اكتب النص هنا..." : "Type here...";
    if (type === "status") status = isRtl ? "الحالة: متصل بالنواة" : "Status: Kernel Linked";
    if (type === "image") text = isRtl ? "شعار المبرمج نمران" : "Nimran Logo placeholder";
    if (type === "gps") text = isRtl ? "مستشعر الملاحة GPS" : "GPS Satellite Sensor";

    const newComp: ProjectComponent = { id, type, text, placeholder, status };
    setComponents((prev) => [...prev, newComp]);
    toast.success(isRtl ? "تمت إضافة المكون بنجاح" : "Component added successfully");
  };

  const removeComponent = (id: string) => {
    setComponents((prev) => prev.filter((c) => c.id !== id));
    toast.info(isRtl ? "تمت إزالة المكون" : "Component removed");
  };

  const updateComponentText = (id: string, text: string) => {
    setComponents((prev) => prev.map((c) => (c.id === id ? { ...c, text } : c)));
  };

  const updateComponentPlaceholder = (id: string, placeholder: string) => {
    setComponents((prev) => prev.map((c) => (c.id === id ? { ...c, placeholder } : c)));
  };

  const updateComponentStatus = (id: string, status: string) => {
    setComponents((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
  };

  const handleSave = async () => {
    if (!activeProject) return;
    try {
      await updateProjectMutation({
        id: activeProject._id,
        name: activeProject.name,
        packageName: activeProject.packageName,
        version: activeProject.version,
        code: activeProject.code,
        designerLayout: JSON.stringify(components),
      });
      toast.success(t.saveSuccess);
    } catch (err: any) {
      toast.error(err.message || "Failed to save design");
    }
  };

  const handleReset = () => {
    setComponents([]);
    toast.warning(isRtl ? "تمت إعادة تعيين واجهة الهاتف" : "Simulator screen reset");
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8" dir={isRtl ? "rtl" : "ltr"}>
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 flex items-center gap-2">
            <Sliders className="h-6 w-6 text-cyan-400" />
            {t.visualDesigner}
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            {t.designerSub}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            onClick={handleReset} 
            variant="outline" 
            size="sm" 
            className="border-amber-500/20 hover:border-amber-500 hover:bg-amber-950/20 text-amber-500"
          >
            {t.clearDesigner}
          </Button>

          <Button 
            onClick={handleSave} 
            className="bg-cyan-500 hover:bg-cyan-600 text-zinc-950 font-bold flex items-center gap-1.5"
            size="sm"
          >
            <Save className="h-4 w-4" />
            {t.saveBtn}
          </Button>
        </div>
      </div>

      {!activeProject ? (
        <Card className="bg-zinc-900/40 border-cyan-950/40 p-8 text-center">
          <AlertCircle className="h-10 w-10 text-cyan-400 mx-auto mb-4" />
          <CardTitle className="text-zinc-200 mb-2">{isRtl ? "لم يتم اختيار مشروع" : "No Active Project"}</CardTitle>
          <CardDescription className="text-zinc-400">
            {isRtl ? "توجه إلى لوحة التحكم الرئيسية وقم بتهيئة مشروع للبدء بالبناء المرئي." : "Go to dashboard and initiate a project to use visual builder."}
          </CardDescription>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Component catalog & property editor (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Catalog block */}
            <Card className="bg-zinc-900/60 border-cyan-950/30">
              <CardHeader className="py-4">
                <CardTitle className="text-sm font-bold text-zinc-200 uppercase tracking-wider">
                  {t.addComponent}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                <Button 
                  onClick={() => addComponent("header")}
                  variant="outline" 
                  className="bg-zinc-950 border-cyan-950/40 hover:border-cyan-400 hover:bg-cyan-950/20 text-zinc-200 flex flex-col items-center justify-center h-20 gap-2"
                >
                  <Heading className="h-5 w-5 text-cyan-400" />
                  <span className="text-[11px]">{t.headerComp}</span>
                </Button>

                <Button 
                  onClick={() => addComponent("button")}
                  variant="outline" 
                  className="bg-zinc-950 border-cyan-950/40 hover:border-cyan-400 hover:bg-cyan-950/20 text-zinc-200 flex flex-col items-center justify-center h-20 gap-2"
                >
                  <Hand className="h-5 w-5 text-indigo-400" />
                  <span className="text-[11px]">{t.buttonComp}</span>
                </Button>

                <Button 
                  onClick={() => addComponent("input")}
                  variant="outline" 
                  className="bg-zinc-950 border-cyan-950/40 hover:border-cyan-400 hover:bg-cyan-950/20 text-zinc-200 flex flex-col items-center justify-center h-20 gap-2"
                >
                  <Type className="h-5 w-5 text-emerald-400" />
                  <span className="text-[11px]">{t.inputComp}</span>
                </Button>

                <Button 
                  onClick={() => addComponent("status")}
                  variant="outline" 
                  className="bg-zinc-950 border-cyan-950/40 hover:border-cyan-400 hover:bg-cyan-950/20 text-zinc-200 flex flex-col items-center justify-center h-20 gap-2"
                >
                  <Eye className="h-5 w-5 text-amber-400" />
                  <span className="text-[11px]">{t.statusComp}</span>
                </Button>

                <Button 
                  onClick={() => addComponent("image")}
                  variant="outline" 
                  className="bg-zinc-950 border-cyan-950/40 hover:border-cyan-400 hover:bg-cyan-950/20 text-zinc-200 flex flex-col items-center justify-center h-20 gap-2"
                >
                  <ImageIcon className="h-5 w-5 text-red-400" />
                  <span className="text-[11px]">{t.imageComp}</span>
                </Button>

                <Button 
                  onClick={() => addComponent("gps")}
                  variant="outline" 
                  className="bg-zinc-950 border-cyan-950/40 hover:border-cyan-400 hover:bg-cyan-950/20 text-zinc-200 flex flex-col items-center justify-center h-20 gap-2"
                >
                  <MapPin className="h-5 w-5 text-purple-400" />
                  <span className="text-[11px]">{t.gpsComp}</span>
                </Button>
              </CardContent>
            </Card>

            {/* Properties and layouts modifier */}
            <Card className="bg-zinc-900/60 border-cyan-950/30">
              <CardHeader className="py-4 border-b border-cyan-950/30">
                <CardTitle className="text-sm font-bold text-zinc-200">
                  {isRtl ? "تعديل محتوى العناصر النشطة" : "Active Elements Content Modifier"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4 max-h-[380px] overflow-y-auto">
                {components.length === 0 ? (
                  <p className="text-zinc-500 text-xs text-center font-mono py-8">
                    {isRtl ? "قائمة العناصر فارغة. أضف عناصر من الكتالوج أعلاه." : "Element list empty. Select components to customize."}
                  </p>
                ) : (
                  components.map((comp) => (
                    <div key={comp.id} className="flex items-center gap-3 bg-zinc-950/60 p-3 rounded-lg border border-cyan-950/30">
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                            {comp.type}
                          </span>
                        </div>

                        {comp.type !== "input" && (
                          <Input 
                            value={comp.text || ""} 
                            onChange={(e) => updateComponentText(comp.id, e.target.value)} 
                            className="bg-zinc-900 border-zinc-800 text-xs h-8 text-zinc-100 focus:border-cyan-500"
                            placeholder="Text content"
                          />
                        )}

                        {comp.type === "input" && (
                          <Input 
                            value={comp.placeholder || ""} 
                            onChange={(e) => updateComponentPlaceholder(comp.id, e.target.value)} 
                            className="bg-zinc-900 border-zinc-800 text-xs h-8 text-zinc-100 focus:border-cyan-500"
                            placeholder="Placeholder text"
                          />
                        )}

                        {comp.type === "status" && (
                          <Input 
                            value={comp.status || ""} 
                            onChange={(e) => updateComponentStatus(comp.id, e.target.value)} 
                            className="bg-zinc-900 border-zinc-800 text-xs h-8 text-zinc-100 focus:border-cyan-500"
                            placeholder="Status indicator text"
                          />
                        )}
                      </div>

                      <Button 
                        onClick={() => removeComponent(comp.id)}
                        variant="ghost" 
                        size="icon" 
                        className="text-red-400 hover:text-red-500 hover:bg-red-950/20 shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Device Live Mock (5 Cols) */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-[300px] h-[550px] rounded-[42px] bg-zinc-950 border-8 border-zinc-800 shadow-[0_0_40px_rgba(6,182,212,0.2)] flex flex-col overflow-hidden relative">
              
              {/* Dynamic island notch */}
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-5 rounded-full bg-zinc-800 z-10 flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 mr-2" />
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              </div>

              {/* Statusbar */}
              <div className="h-8 bg-zinc-900 flex justify-between items-end px-6 text-[10px] text-zinc-400 font-mono pb-1 select-none">
                <span>10:00</span>
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3 w-3 text-cyan-400 animate-pulse" />
                  <span>5G</span>
                </div>
              </div>

              {/* Live Canvas Viewport */}
              <div className="flex-1 bg-zinc-900 p-5 overflow-y-auto space-y-4">
                {components.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4">
                    <Smartphone className="h-10 w-10 text-cyan-500/40 mb-3 animate-pulse" />
                    <p className="text-xs text-zinc-500">
                      {isRtl ? "المحاكي فارغ حالياً" : "Canvas emulator is empty"}
                    </p>
                  </div>
                ) : (
                  components.map((comp) => {
                    switch (comp.type) {
                      case "header":
                        return (
                          <h2 key={comp.id} className="text-base font-extrabold text-cyan-400 text-center py-2 border-b border-cyan-950/30">
                            {comp.text}
                          </h2>
                        );
                      case "button":
                        return (
                          <Button key={comp.id} className="w-full bg-cyan-600 hover:bg-cyan-700 text-zinc-950 font-extrabold py-2 rounded shadow-md text-xs">
                            {comp.text}
                          </Button>
                        );
                      case "input":
                        return (
                          <Input key={comp.id} readOnly placeholder={comp.placeholder} className="bg-zinc-950 border-zinc-800 text-xs h-8 text-zinc-300" />
                        );
                      case "status":
                        return (
                          <div key={comp.id} className="text-[10px] text-center bg-cyan-950/20 border border-emerald-500/30 text-emerald-400 p-2 rounded-lg font-mono flex items-center justify-center gap-1.5">
                            <CheckCircle className="h-3.5 w-3.5" />
                            {comp.status}
                          </div>
                        );
                      case "image":
                        return (
                          <div key={comp.id} className="border border-dashed border-cyan-950/40 bg-zinc-950/50 p-4 rounded-lg flex flex-col items-center gap-2">
                            <ImageIcon className="h-8 w-8 text-cyan-400" />
                            <span className="text-[10px] text-zinc-400 font-mono">{comp.text}</span>
                          </div>
                        );
                      case "gps":
                        return (
                          <div key={comp.id} className="bg-zinc-950 p-3 rounded-lg border border-purple-500/20 flex justify-between items-center text-[10px] font-mono text-purple-400">
                            <span>{comp.text}</span>
                            <span className="bg-purple-950/60 px-1.5 py-0.5 rounded text-purple-300 border border-purple-500/20 animate-pulse">FIX ON SATELLITE</span>
                          </div>
                        );
                      default:
                        return null;
                    }
                  })
                )}
              </div>

              {/* Bottom Nav indicators bar */}
              <div className="h-6 bg-zinc-900 flex items-center justify-center">
                <div className="w-24 h-1 rounded-full bg-zinc-700" />
              </div>
            </div>
          </div>
        </div>
      )}

      <Toaster richColors closeButton />
    </div>
  );
}
