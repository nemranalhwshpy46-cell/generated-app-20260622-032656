import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useNimranStore, translations } from "@/store/nimranStore";
import { 
  Terminal as TerminalIcon, 
  Sparkles, 
  Send, 
  Trash2, 
  RefreshCw, 
  Bot, 
  User, 
  ShieldCheck, 
  Play,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Toaster, toast } from "sonner";

export function TerminalPage() {
  const language = useNimranStore((state) => state.language);
  const t = translations[language];
  const isRtl = language === "ar";

  // Convex integration
  const dbLogs = useQuery(api.nimran.getTerminalLogs);
  const dbAiMessages = useQuery(api.nimran.getAiMessages);
  
  const addLogMutation = useMutation(api.nimran.addTerminalLog);
  const clearLogsMutation = useMutation(api.nimran.clearTerminalLogs);
  const askAiMutation = useMutation(api.nimran.askNimranAi);

  // Shell terminal local input
  const [terminalInput, setTerminalInput] = useState("");
  const [localLogs, setLocalLogs] = useState<string[]>([]);
  
  // Chat bot state
  const [aiInput, setAiInput] = useState("");
  const [isAsking, setIsAsking] = useState(false);

  const consoleEndRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sync initial log entries on load
  useEffect(() => {
    if (dbLogs) {
      const reversed = [...dbLogs].reverse();
      const combined = reversed.map(log => `$ ${log.command}\n${log.output}`);
      setLocalLogs(combined);
    }
  }, [dbLogs]);

  // Scroll to bottoms of consoles
  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localLogs]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [dbAiMessages]);

  // Command executing controller
  const executeCommand = async (cmdText: string) => {
    const trimmed = cmdText.trim();
    if (!trimmed) return;

    let reply = "";
    const lower = trimmed.toLowerCase();

    if (lower === "help" || lower === "مساعدة") {
      reply = `المبرمج نمران - Available SDK shell commands:
  - help                                    : List all available systems commands.
  - nimran-adb devices                      : List connected simulated physical devices.
  - nimran-compile                          : Compile and package the active code project.
  - nimran-fastboot flash boot [file.img]   : Flash system kernels securely.
  - clear                                   : Clear the terminal output buffer.
  - uname -a                                : Output custom system kernel info.`;
    } else if (lower.includes("devices") || lower.includes("adb")) {
      reply = `List of devices attached\nnimran_phone_ultra\t\tdevice (Android 14 API 34)\nemulator-5554\t\tdevice (HarmonyOS Next)\nharmony_pad_pro\t\tdevice (ArkTS API 12)`;
    } else if (lower.includes("compile") || lower.includes("تجميع")) {
      reply = `[NIMRAN-COMPILER] Launching compilation pipeline...
[NIMRAN-COMPILER] Merging Gradle scripts & source modules...
[NIMRAN-COMPILER] Assembling byte structures... Done!
[NIMRAN-COMPILER] Signing package: release_nimran_signed.apk successfully generated!`;
    } else if (lower.includes("fastboot") || lower.includes("flash") || lower.includes("تفليش")) {
      reply = `[FASTBOOT-SHELL] Establishing high-speed bootloader pipe...
[FASTBOOT-SHELL] Sending 'boot' image signature (32768 KB)...
[FASTBOOT-SHELL] Writing 'boot' partition... OKAY [ 0.854s]
[FASTBOOT-SHELL] Finishing flashing sequence. Device rebooting.`;
    } else if (lower === "clear" || lower === "مسح") {
      setLocalLogs([]);
      try {
        await clearLogsMutation();
      } catch (e) {
        // empty catch ignored
      }
      setTerminalInput("");
      return;
    } else if (lower === "uname -a") {
      reply = `Linux nimran-host 5.15.0-89-generic #99-SMP Tue Oct 31 17:29:21 UTC 2023 x86_64 x86_64 GNU/Linux (Nimran Kernel v3.4)`;
    } else {
      reply = `Command not recognized: '${trimmed}'. Type 'help' to view the list of systems parameters.`;
    }

    const commandEntry = `$ ${trimmed}\n${reply}`;
    setLocalLogs(prev => [...prev, commandEntry]);
    
    // Save to Convex backend
    try {
      await addLogMutation({
        command: trimmed,
        output: reply
      });
    } catch (err) {
      console.error("Save log failure", err);
    }
    
    setTerminalInput("");
  };

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeCommand(terminalInput);
  };

  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const queryStr = aiInput.trim();
    if (!queryStr || isAsking) return;

    setIsAsking(true);
    setAiInput("");
    toast.info(isRtl ? "جاري التفكير وصياغة كود نمران..." : "Consulting Nimran AI coding nodes...");

    try {
      await askAiMutation({ message: queryStr });
    } catch (err: any) {
      toast.error("Failed to fetch response");
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8" dir={isRtl ? "rtl" : "ltr"}>
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 flex items-center gap-2">
          <TerminalIcon className="h-6 w-6 text-cyan-400" />
          {t.terminalAi}
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          {isRtl ? "تحكم بالأنظمة عبر الأوامر المباشرة واحصل على دعم فني برمجي مباشر من نمران AI" : "Control environments via direct shell scripts and receive instant coder support"}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Terminal Section (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <Card className="bg-zinc-900/60 border-cyan-950/30 flex-1 flex flex-col min-h-[450px]">
            <CardHeader className="py-3 px-4 border-b border-cyan-950/30 bg-zinc-900/40 flex justify-between flex-row items-center">
              <CardTitle className="text-xs font-mono text-cyan-400 flex items-center gap-1.5">
                <TerminalIcon className="h-3.5 w-3.5 text-cyan-400" />
                {t.terminalTitle}
              </CardTitle>
              <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-500/20 px-2 py-0.5 rounded font-mono">
                ROOT@NIMRAN_SUITE:~#
              </span>
            </CardHeader>

            <CardContent className="flex-1 p-4 bg-zinc-950 font-mono text-xs md:text-sm text-zinc-300 overflow-y-auto space-y-4 h-[350px]">
              {localLogs.length === 0 ? (
                <div className="text-zinc-600">
                  <p>$ help</p>
                  <p className="text-zinc-500 mt-1">{isRtl ? "مرحبًا بك في موجه أوامر المبرمج نمران. اكتب help لمعرفة الأدوات المتوفرة." : "Welcome to the custom ADB & Fastboot host console. Type help to start."}</p>
                </div>
              ) : (
                localLogs.map((log, i) => (
                  <div key={i} className="whitespace-pre-wrap leading-relaxed border-b border-zinc-900/50 pb-2">
                    {log}
                  </div>
                ))
              )}
              <div ref={consoleEndRef} />
            </CardContent>

            {/* Terminal Input Form */}
            <form onSubmit={handleTerminalSubmit} className="p-3 bg-zinc-900 border-t border-cyan-950/30 flex gap-2">
              <span className="text-cyan-400 font-mono self-center select-none ml-1 mr-1">#</span>
              <Input 
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                placeholder={t.terminalPlaceholder}
                className="bg-zinc-950 border-cyan-950 text-zinc-200 text-xs focus:border-cyan-400 font-mono flex-1 h-9"
              />
              <Button type="submit" className="bg-cyan-500 hover:bg-cyan-600 text-zinc-950 text-xs font-bold font-mono h-9">
                {t.runCommand}
              </Button>
            </form>
          </Card>
        </div>

        {/* AI Assistant Section (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <Card className="bg-zinc-900/60 border-cyan-950/30 flex-1 flex flex-col min-h-[450px]">
            <CardHeader className="py-3 px-4 border-b border-cyan-950/30 bg-zinc-900/40 flex items-center justify-between flex-row">
              <CardTitle className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-cyan-400 animate-pulse" />
                {t.aiTitle}
              </CardTitle>
            </CardHeader>

            <CardContent className="flex-1 p-4 overflow-y-auto bg-zinc-950/50 space-y-4 h-[350px]">
              {!dbAiMessages ? (
                <div className="flex items-center justify-center h-full">
                  <RefreshCw className="h-5 w-5 text-cyan-400 animate-spin" />
                </div>
              ) : (
                dbAiMessages.map((msg) => {
                  const isBot = msg.role === "assistant";
                  return (
                    <div 
                      key={msg._id} 
                      className={`flex gap-3 max-w-[85%] ${
                        isBot ? "self-start" : "self-end flex-row-reverse mr-auto"
                      }`}
                    >
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isBot ? "bg-cyan-950/50 text-cyan-400 border border-cyan-500/30" : "bg-indigo-950/50 text-indigo-400 border border-indigo-500/30"
                      }`}>
                        {isBot ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                      </div>
                      <div className={`p-3 rounded-2xl text-xs md:text-sm leading-relaxed ${
                        isBot ? "bg-zinc-900 text-zinc-200 rounded-tl-none border border-cyan-950/20" : "bg-cyan-500 text-zinc-950 font-medium rounded-tr-none"
                      }`}>
                        <div className="whitespace-pre-line">{msg.content}</div>
                      </div>
                    </div>
                  );
                })
              )}
              {isAsking && (
                <div className="flex gap-3 max-w-[80%] self-start">
                  <div className="h-8 w-8 rounded-lg bg-cyan-950/50 text-cyan-400 border border-cyan-500/30 flex items-center justify-center animate-pulse">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="bg-zinc-900 text-zinc-400 p-3 rounded-2xl rounded-tl-none text-xs border border-cyan-950/20 flex items-center gap-2">
                    <RefreshCw className="h-3 w-3 animate-spin text-cyan-400" />
                    <span>{isRtl ? "جاري توليد الكود والحلول..." : "Formulating system answers..."}</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </CardContent>

            {/* AI Input Form */}
            <form onSubmit={handleAiSubmit} className="p-3 bg-zinc-900 border-t border-cyan-950/30 flex gap-2">
              <Input 
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder={t.aiPlaceholder}
                className="bg-zinc-950 border-cyan-950 text-zinc-200 text-xs focus:border-cyan-400 flex-1 h-9"
              />
              <Button type="submit" disabled={isAsking || !aiInput.trim()} className="bg-cyan-500 hover:bg-cyan-600 disabled:bg-zinc-800 text-zinc-950 font-bold h-9">
                <Send className="h-3.5 w-3.5" />
              </Button>
            </form>
          </Card>
        </div>

      </div>

      <Toaster richColors closeButton />
    </div>
  );
}
