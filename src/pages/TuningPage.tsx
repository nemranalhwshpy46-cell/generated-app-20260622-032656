import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useNimranStore, translations } from "@/store/nimranStore";
import { 
  Cpu, 
  BatteryCharging, 
  Activity, 
  Flame, 
  Gauge, 
  CheckCircle, 
  RefreshCw, 
  Save, 
  Info,
  ShieldCheck,
  ToggleLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Toaster, toast } from "sonner";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export function TuningPage() {
  const language = useNimranStore((state) => state.language);
  const t = translations[language];
  const isRtl = language === "ar";

  // Convex queries and mutations
  const tweaks = useQuery(api.nimran.getSystemTweaks);
  const saveTweakMutation = useMutation(api.nimran.saveSystemTweak);

  // Local state for interactive sliders/status
  const [localTweaks, setLocalTweaks] = useState<any[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [cpuTemp, setCpuTemp] = useState(42);

  // Generate mock real-time telemetry data
  const [telemetry, setTelemetry] = useState<any[]>([]);

  useEffect(() => {
    // Initialize mock telemetry points
    const initialData = Array.from({ length: 12 }).map((_, i) => ({
      time: `${i * 5}s`,
      cpu: Math.floor(Math.random() * 20 + 35),
      ram: 58,
      thermals: 40 + Math.floor(Math.random() * 4),
    }));
    setTelemetry(initialData);

    // Update telemetry dynamically for gorgeous interactive graph
    const interval = setInterval(() => {
      setTelemetry((prev) => {
        const nextTime = `${(prev.length) * 5}s`;
        const nextCpu = Math.floor(Math.random() * 30 + 40);
        const nextThermals = Math.max(35, Math.min(85, Math.floor(nextCpu * 0.8 + 10)));
        const nextRam = Math.floor(Math.random() * 5 + 60);

        setCpuTemp(nextThermals);

        return [
          ...prev.slice(1),
          { time: nextTime, cpu: nextCpu, ram: nextRam, thermals: nextThermals },
        ];
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Sync with Convex database when tweaks load
  useEffect(() => {
    if (tweaks) {
      setLocalTweaks(tweaks);
    }
  }, [tweaks]);

  const handleSliderChange = (id: string, value: number) => {
    setLocalTweaks((prev) =>
      prev.map((tw) => (tw._id === id ? { ...tw, value } : tw))
    );
  };

  const handleToggleStatus = (id: string) => {
    setLocalTweaks((prev) =>
      prev.map((tw) =>
        tw._id === id
          ? { ...tw, status: tw.status === "active" ? "inactive" : "active" }
          : tw
      )
    );
  };

  const handleSaveTweak = async (tweak: any) => {
    setIsUpdating(true);
    try {
      await saveTweakMutation({
        id: tweak._id,
        name: tweak.name,
        category: tweak.category,
        value: tweak.value,
        status: tweak.status,
      });
      toast.success(isRtl ? `تم حفظ تعديل: ${tweak.name}` : `Saved tweak: ${tweak.name}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to save tweak");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveAll = async () => {
    setIsUpdating(true);
    toast.info(isRtl ? "جاري تجميع وحقن التعديلات في نواة الهاتف..." : "Flashing adjustments to target system...");
    try {
      for (const tweak of localTweaks) {
        await saveTweakMutation({
          id: tweak._id,
          name: tweak.name,
          category: tweak.category,
          value: tweak.value,
          status: tweak.status,
        });
      }
      toast.success(t.applyTweaks);
    } catch (err: any) {
      toast.error(err.message || "Failed to save tweaks");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8" dir={isRtl ? "rtl" : "ltr"}>
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 flex items-center gap-2">
            <Cpu className="h-6 w-6 text-cyan-400" />
            {t.systemsTuning}
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            {isRtl ? "شاشة كسر سرعة الترددات وضبط الذاكرة العشوائية ونواة الأجهزة المتصلة" : "Override clock values, tweak virtual memory parameters & flash ROM boots safely"}
          </p>
        </div>

        <Button
          onClick={handleSaveAll}
          disabled={isUpdating || localTweaks.length === 0}
          className="bg-cyan-500 hover:bg-cyan-600 disabled:bg-zinc-800 text-zinc-950 font-bold flex items-center gap-1.5"
        >
          {isUpdating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {t.applyTweaks}
        </Button>
      </div>

      {/* Real-time Telemetry Monitor charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Dynamic Recharts telemetry */}
        <Card className="lg:col-span-8 bg-zinc-900/60 border-cyan-950/30">
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-bold text-zinc-200 flex items-center gap-2">
              <Activity className="h-4 w-4 text-cyan-400 animate-pulse" />
              {t.cpuChart}
            </CardTitle>
            <CardDescription className="text-xs">
              {isRtl ? "قراءات حية لترددات النواة والاستقرار الحراري تحت معالجة نمران" : "Live core tracking under full kernel emulation load"}
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[280px] p-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={telemetry} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#082f49" />
                <XAxis dataKey="time" stroke="#52525b" fontSize={10} />
                <YAxis stroke="#52525b" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#09090b", borderColor: "#155e75", borderRadius: "8px" }}
                  labelStyle={{ color: "#a1a1aa" }}
                />
                <Line type="monotone" dataKey="cpu" name="CPU Core Speed %" stroke="#06b6d4" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                <Line type="monotone" dataKey="thermals" name="Thermals °C" stroke="#ec4899" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="ram" name="RAM Usage %" stroke="#6366f1" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Diagnostic parameters side panel */}
        <div className="lg:col-span-4 grid grid-cols-1 gap-4">
          <Card className="bg-zinc-900/60 border-cyan-950/30 p-5 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-zinc-400 font-semibold">{t.thermalTemp}</span>
                <Flame className={`h-4 w-4 ${cpuTemp > 70 ? "text-red-500 animate-bounce" : "text-amber-500"}`} />
              </div>
              <div className="text-3xl font-extrabold font-mono text-pink-500">{cpuTemp}°C</div>
            </div>
            <Progress value={(cpuTemp / 100) * 100} className="h-2 bg-zinc-950 mt-4 [&>div]:bg-pink-500" />
            <p className="text-[10px] text-zinc-500 mt-2">
              {cpuTemp > 70 ? "Warning: High thermal index. Automatic throttling active." : "Operating temperature fully optimized under Nimran Kernel."}
            </p>
          </Card>

          <Card className="bg-zinc-900/60 border-cyan-950/30 p-5 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-zinc-400 font-semibold">{t.batterySave}</span>
                <BatteryCharging className="h-4 w-4 text-emerald-400 animate-pulse" />
              </div>
              <div className="text-3xl font-extrabold font-mono text-emerald-400">92%</div>
            </div>
            <Progress value={92} className="h-2 bg-zinc-950 mt-4 [&>div]:bg-emerald-400" />
            <p className="text-[10px] text-zinc-500 mt-2">
              Deep sleep battery governor saving active. Up to 48 hours simulated runtime.
            </p>
          </Card>
        </div>
      </div>

      {/* Tweaks list editor */}
      <Card className="bg-zinc-900/60 border-cyan-950/30">
        <CardHeader className="py-4 border-b border-cyan-950/30">
          <CardTitle className="text-sm font-bold text-zinc-200">
            {t.kernelTuning}
          </CardTitle>
          <CardDescription className="text-xs">
            {isRtl ? "حدد خيارات النواة المتقدمة وقم بحقنها لاسلكياً في الهواتف الذكية" : "Fine-tune low-level configuration registers and synchronize live"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 divide-y divide-cyan-950/20">
          {localTweaks.length === 0 ? (
            <div className="text-center py-8">
              <RefreshCw className="h-6 w-6 text-cyan-400 animate-spin mx-auto mb-2" />
              <p className="text-xs text-zinc-500">{isRtl ? "جاري جلب إعدادات النواة..." : "Loading kernel parameters..."}</p>
            </div>
          ) : (
            localTweaks.map((tw) => (
              <div key={tw._id} className="py-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                
                {/* Info */}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-cyan-500/10 text-cyan-400 text-[10px] font-mono px-2 py-0.5 rounded uppercase">
                      {tw.category}
                    </span>
                    <h4 className="text-sm font-bold text-zinc-100">{tw.name}</h4>
                  </div>
                  <p className="text-xs text-zinc-500 font-mono">ID: {tw._id}</p>
                </div>

                {/* Slider */}
                <div className="w-full md:w-64 space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-zinc-500">{t.tweakValue}:</span>
                    <span className="text-cyan-400 font-bold">{tw.value}%</span>
                  </div>
                  <Slider 
                    value={[tw.value]} 
                    max={100} 
                    step={1} 
                    onValueChange={(val) => handleSliderChange(tw._id, val[0])}
                    className="[&>span:first-child]:bg-zinc-950 [&>span_span]:bg-cyan-400"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => handleToggleStatus(tw._id)}
                    variant="outline"
                    className={`text-xs px-3 py-1.5 h-auto ${
                      tw.status === "active" ? "border-emerald-500/20 text-emerald-400 bg-emerald-950/10" : "border-zinc-800 text-zinc-500"
                    }`}
                  >
                    {tw.status === "active" ? t.active : t.inactive}
                  </Button>

                  <Button
                    onClick={() => handleSaveTweak(tw)}
                    variant="secondary"
                    className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 h-8"
                    size="sm"
                  >
                    {isRtl ? "تعديل منفصل" : "Save"}
                  </Button>
                </div>

              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Toaster richColors closeButton />
    </div>
  );
}
