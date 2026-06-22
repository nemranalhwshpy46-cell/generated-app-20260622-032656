import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Default codes for the three platforms
const DEFAULT_CODES: Record<string, string> = {
  android: `package com.nimran.suite

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import android.widget.Toast
import android.widget.Button

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        // Nimran Smart Systems SDK initialization
        val runButton = findViewById<Button>(R.id.btnRun)
        runButton.setOnClickListener {
            Toast.makeText(this, "أهلاً بك في نظام نمران الذكي!", Toast.LENGTH_LONG).show()
        }
    }
}`,
  ios: `import SwiftUI

struct ContentView: View {
    @State private var isActive = false
    
    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: "cpu")
                .imageScale(.large)
                .foregroundColor(.cyan)
            Text("المبرمج نمران - Swift Suite")
                .font(.title)
                .fontWeight(.bold)
            Button("تشغيل النظام الذكي") {
                isActive.toggle()
            }
            .buttonStyle(.borderedProminent)
            .tint(.cyan)
        }
        .padding()
    }
}`,
  harmonyos: `import router from '@ohos.router';

@Entry
@Component
struct Index {
  @State message: string = 'برمجة أنظمة نمران المتطورة'

  build() {
    Row() {
      Column() {
        Text(this.message)
          .fontSize(24)
          .fontWeight(FontWeight.Bold)
          .fontColor('#06b6d4')
        
        Button('تهيئة نظام HarmonyOS')
          .onClick(() => {
            this.message = 'تم تشغيل نظام نمران بنجاح!'
          })
          .margin({ top: 20 })
          .backgroundColor('#0ea5e9')
      }
      .width('100%')
    }
    .height('100%')
  }
}`
};

const DEFAULT_LAYOUTS: Record<string, string> = {
  android: JSON.stringify([
    { id: "1", type: "header", text: "تطبيق نمران الذكي" },
    { id: "2", type: "button", text: "تشغيل النظام Core" },
    { id: "3", type: "input", placeholder: "أدخل عنوان الـ IP للجهاز المستهدف..." },
    { id: "4", type: "status", status: "متصل - جاهز للتجميع" }
  ]),
  ios: JSON.stringify([
    { id: "1", type: "header", text: "iOS Pro Tool Suite" },
    { id: "2", type: "button", text: "تفعيل الجيلبريك التخيلي" },
    { id: "3", type: "status", status: "Secure Sandbox Ready" }
  ]),
  harmonyos: JSON.stringify([
    { id: "1", type: "header", text: "HarmonyOS Nimran Kernel" },
    { id: "2", type: "button", text: "بدء محاكاة ArkCompiler" },
    { id: "3", type: "status", status: "ArkTS Compiler Online" }
  ])
};

// Seeding helper for default projects
export const seedDefaultProjects = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("projects").take(1);
    if (existing.length === 0) {
      const authUserId = await getAuthUserId(ctx);
      
      await ctx.db.insert("projects", {
        userId: authUserId ?? undefined,
        name: "نظام نمران الذكي للأندرويد",
        type: "android",
        packageName: "com.nimran.androidsmart",
        version: "1.0.0",
        code: DEFAULT_CODES.android,
        designerLayout: DEFAULT_LAYOUTS.android,
        createdAt: Date.now(),
      });

      await ctx.db.insert("projects", {
        userId: authUserId ?? undefined,
        name: "نظام نمران لبرمجة iOS",
        type: "ios",
        packageName: "com.nimran.ioscompiler",
        version: "2.1.0",
        code: DEFAULT_CODES.ios,
        designerLayout: DEFAULT_LAYOUTS.ios,
        createdAt: Date.now() - 3600000,
      });

      await ctx.db.insert("projects", {
        userId: authUserId ?? undefined,
        name: "مشروع هارموني المتطور",
        type: "harmonyos",
        packageName: "com.nimran.harmony",
        version: "1.5.0",
        code: DEFAULT_CODES.harmonyos,
        designerLayout: DEFAULT_LAYOUTS.harmonyos,
        createdAt: Date.now() - 7200000,
      });
    }
  }
});

// Seeding default system tweaks
export const seedDefaultTweaks = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("systemTweaks").take(1);
    if (existing.length === 0) {
      const authUserId = await getAuthUserId(ctx);
      const defaults = [
        { name: "تجاوز تردد النواة CPU Governor Tweak", category: "cpu", value: 85, status: "active" },
        { name: "ذاكرة النظام العشوائية Virtual RAM Expander", category: "memory", value: 60, status: "active" },
        { name: "تحسين استجابة اللمس Touch Responsiveness", category: "kernel", value: 95, status: "active" },
        { name: "توفير بطارية نمران الذكي Battery Saver Ultra", category: "battery", value: 40, status: "inactive" },
      ];
      for (const d of defaults) {
        await ctx.db.insert("systemTweaks", {
          userId: authUserId ?? undefined,
          name: d.name,
          category: d.category,
          value: d.value,
          status: d.status,
          updatedAt: Date.now(),
        });
      }
    }
  }
});

// Seed default logs
export const seedDefaultLogs = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("terminalLogs").take(1);
    if (existing.length === 0) {
      const logs = [
        { command: "nimran-compile --target android", output: "[NIMRAN-COMPILER] Target: Android (Kotlin 1.9.0)\n[NIMRAN-COMPILER] Initializing build tools...\n[NIMRAN-COMPILER] Parsing AndroidManifest.xml...\n[NIMRAN-COMPILER] Packaging resources using aapt2...\n[NIMRAN-COMPILER] Compiling source files to classes.dex...\n[NIMRAN-COMPILER] Optimizing bytecode via R8 Pro...\n[NIMRAN-COMPILER] Signing APK with Nimran Developers Key v3...\n[NIMRAN-COMPILER] SUCCESS: Build completed in 2.45s! Generated com.nimran.androidsmart-v1.0.0.apk (12.4 MB)", timestamp: Date.now() - 600000 },
        { command: "nimran-adb devices", output: "List of devices attached\nnimran_phone_ultra\tdevice\nemulator-5554\tdevice\nharmony_pad_pro\tdevice", timestamp: Date.now() - 300000 }
      ];
      for (const log of logs) {
        await ctx.db.insert("terminalLogs", {
          command: log.command,
          output: log.output,
          timestamp: log.timestamp,
        });
      }
    }
  }
});

// Seed AI messages
export const seedDefaultAiMessages = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("aiConversations").take(1);
    if (existing.length === 0) {
      await ctx.db.insert("aiConversations", {
        role: "assistant",
        content: "أهلاً بك يا زميلي المبرمج! أنا المساعد الذكي الخاص بالمبرمج نمران. يمكنني مساعدتك في توليد كود Kotlin أو Swift أو ArkTS، وشرح أنظمة التشغيل، وتوفير أوامر Flashing/Fastboot للهواتف المحمولة. اكتب سؤالك وسأساعدك فوراً!",
        timestamp: Date.now(),
      });
    }
  }
});

// Queries
export const getProjects = query({
  args: {},
  handler: async (ctx) => {
    const authUserId = await getAuthUserId(ctx);
    // Fetch all public/guest or own projects
    return await ctx.db.query("projects").order("desc").collect();
  },
});

export const getSystemTweaks = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("systemTweaks").order("desc").collect();
  },
});

export const getTerminalLogs = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("terminalLogs").order("desc").take(50);
  },
});

export const getAiMessages = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("aiConversations").order("asc").take(100);
  },
});

// Mutations
export const createProject = mutation({
  args: {
    name: v.string(),
    type: v.string(), // "android" | "ios" | "harmonyos"
    packageName: v.string(),
    version: v.string(),
  },
  handler: async (ctx, args) => {
    const authUserId = await getAuthUserId(ctx);
    const code = DEFAULT_CODES[args.type] || "// Start coding here";
    const designerLayout = DEFAULT_LAYOUTS[args.type] || "[]";
    
    return await ctx.db.insert("projects", {
      userId: authUserId ?? undefined,
      name: args.name,
      type: args.type,
      packageName: args.packageName,
      version: args.version,
      code,
      designerLayout,
      createdAt: Date.now(),
    });
  },
});

export const updateProject = mutation({
  args: {
    id: v.id("projects"),
    name: v.string(),
    packageName: v.string(),
    version: v.string(),
    code: v.string(),
    designerLayout: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      name: args.name,
      packageName: args.packageName,
      version: args.version,
      code: args.code,
      designerLayout: args.designerLayout,
    });
    return args.id;
  },
});

export const compileProject = mutation({
  args: {
    id: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.id);
    if (!project) {
      throw new Error("Project not found");
    }
    
    const timestamp = Date.now();
    const apkSize = (Math.random() * 15 + 5).toFixed(1); // 5 to 20 MB
    const isAndroid = project.type === "android";
    const extension = isAndroid ? "apk" : project.type === "ios" ? "ipa" : "hap";
    const fileUrl = `/downloads/simulated_${project.packageName}_v${project.version}.${extension}`;
    
    await ctx.db.patch(args.id, {
      compiledAt: timestamp,
      apkUrl: fileUrl,
    });

    const commandStr = `nimran-compile --target ${project.type} --project ${project.packageName}`;
    const logOutput = `[NIMRAN-COMPILER] [${new Date(timestamp).toLocaleTimeString()}] Initializing smart build for: ${project.name} (${project.type.toUpperCase()})
[NIMRAN-COMPILER] Package: ${project.packageName}
[NIMRAN-COMPILER] Version: ${project.version}
[NIMRAN-COMPILER] Verifying source syntax & modules... Pass!
[NIMRAN-COMPILER] Compiling UI layout components...
[NIMRAN-COMPILER] Running Nimran Code Optimizers (Level 3)...
[NIMRAN-COMPILER] Assembling binaries...
[NIMRAN-COMPILER] Signing package key using global trust certification...
[NIMRAN-COMPILER] COMPILATION COMPLETE! Generated virtual release: ${project.packageName}-v${project.version}.${extension} (${apkSize} MB)
[NIMRAN-COMPILER] Download available in Local Sandbox memory storage.`;

    await ctx.db.insert("terminalLogs", {
      command: commandStr,
      output: logOutput,
      timestamp,
    });

    return {
      compiledAt: timestamp,
      apkUrl: fileUrl,
      size: `${apkSize} MB`,
      logOutput,
    };
  },
});

export const saveSystemTweak = mutation({
  args: {
    id: v.optional(v.id("systemTweaks")),
    name: v.string(),
    category: v.string(),
    value: v.number(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const authUserId = await getAuthUserId(ctx);
    if (args.id) {
      await ctx.db.patch(args.id, {
        name: args.name,
        category: args.category,
        value: args.value,
        status: args.status,
        updatedAt: Date.now(),
      });
      return args.id;
    } else {
      return await ctx.db.insert("systemTweaks", {
        userId: authUserId ?? undefined,
        name: args.name,
        category: args.category,
        value: args.value,
        status: args.status,
        updatedAt: Date.now(),
      });
    }
  },
});

export const addTerminalLog = mutation({
  args: {
    command: v.string(),
    output: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("terminalLogs", {
      command: args.command,
      output: args.output,
      timestamp: Date.now(),
    });
  },
});

export const clearTerminalLogs = mutation({
  args: {},
  handler: async (ctx) => {
    const logs = await ctx.db.query("terminalLogs").take(100);
    for (const log of logs) {
      await ctx.db.delete(log._id);
    }
  }
});

// Clever interactive response algorithm for Nimran AI
export const askNimranAi = mutation({
  args: {
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const authUserId = await getAuthUserId(ctx);
    
    // Add User message
    await ctx.db.insert("aiConversations", {
      userId: authUserId ?? undefined,
      role: "user",
      content: args.message,
      timestamp: Date.now(),
    });

    // Generate intelligent responses customized about systems programming & "المبرمج نمران"
    const lower = args.message.toLowerCase();
    let reply = "";

    if (lower.includes("كود") || lower.includes("برمج") || lower.includes("برمجه") || lower.includes("code") || lower.includes("kotlin") || lower.includes("swift")) {
      reply = `بالتأكيد! يسعد المبرمج نمران دائماً بمساعدتك في كتابة الكود. إليك كود متقدم لإنشاء واجهة ذكية متصلة بنواة النظام:

\`\`\`kotlin
// كود مطور بواسطة المبرمج نمران
package com.nimran.system.core

import android.content.Context
import android.os.HardwarePropertiesManager
import android.os.SystemClock

class SystemTuner(private val context: Context) {
    fun optimizeKernelPerformance() {
        // تهيئة التردد الفائق للنظام
        val cpuGovernor = "/sys/devices/system/cpu/cpu0/cpufreq/scaling_governor"
        try {
            java.io.File(cpuGovernor).writeText("performance")
            android.util.Log.i("NIMRAN_CPU", "تم بنجاح كسر تردد المعالج لضمان أعلى أداء!")
        } catch (e: Exception) {
            android.util.Log.e("NIMRAN_CPU", "خطأ في تعديل التردد: \${e.message}")
        }
    }
}
\`\`\`

يمكنك نسخ هذا الكود واستخدامه في واجهة التطوير (IDE) الخاصة ببرنامج نمران لبرمجة الأنظمة! هل ترغب في تهيئة منصة أخرى مثل Swift أو HarmonyOS؟`;
    } else if (lower.includes("تفليش") || lower.includes("روم") || lower.includes("تعديل") || lower.includes("flash") || lower.includes("fastboot") || lower.includes("system")) {
      reply = `أهلاً بك يا بطل! لتعديل وتفليش الأنظمة الذكية باستخدام أدوات المبرمج نمران، يمكنك تشغيل الخطوات التالية عبر واجهة الـ Terminal المدمجة لدينا:

1. **دخول وضع التحميل Bootloader**:
   \`\`\`bash
   nimran-adb reboot bootloader
   \`\`\`

2. **التحقق من اتصال الهاتف**:
   \`\`\`bash
   nimran-fastboot devices
   \`\`\`

3. **تفليش نواة نمرan المعدلة (Nimran-Kernel.img)**:
   \`\`\`bash
   nimran-fastboot flash boot nimran-kernel.img
   \`\`\`

4. **إعادة تشغيل الهاتف بكامل طاقته**:
   \`\`\`bash
   nimran-fastboot reboot
   \`\`\`

تأكد من فتح خيار OEM Unlocking من إعدادات المطور أولاً لتفادي أي مشاكل. هل تريد تعديل إعدادات الـ RAM أم الـ CPU حالياً؟`;
    } else if (lower.includes("سلام") || lower.includes("أهلا") || lower.includes("مرحبا") || lower.includes("hi") || lower.includes("hello")) {
      reply = `مرحباً بك في تطبيق "المبرمج نمران" الاحترافي لبرمجة أنظمة الهواتف الحديثة! 🚀📱

أنا مساعدك التقني الذكي. يهدف تطبيقنا إلى توفير بيئة متكاملة لبرمجة وتجميع تطبيقات APK وIPA وHAP لجميع الهواتف المتطورة، بالإضافة لتعديل خيارات الكيرنل والنظام عبر بيئة سحابية غنية.

ماذا تريد أن تفعل اليوم؟
1. 💡 تصميم وتجميع تطبيق APK جديد.
2. 🛠️ تعديل وكسر سرعة أداء نظام الهاتف (Tuning).
3. 💻 كتابة كود مخصص في محرّر الأكواد الذكي.
4. ⚙️ تنفيذ أوامر الـ Shell على جهاز افتراضي.`;
    } else {
      reply = `فهمت سؤالك تماماً! باعتباري الذكاء الاصطناعي للمبرمج نمران (Nimran Systems AI)، أؤكد لك أن تقنيات البرمجة الحديثة لجميع الأنظمة (Android 14, iOS 17, HarmonyOS Next) مدعومة بالكامل هنا.

يمكننا ضبط وتعديل المعلمات الافتراضية، أو تجميع كود مخصص لإخراج ملف APK مثالي بدون تعقيدات وبسرعة فائقة.

ما هو الكود أو الميزة المحددة التي ترغب في تطبيقها الآن في مشروعك؟ سأقوم بكتابة الشفرة البرمجية فوراً وتوفيرها لك!`;
    }

    // Add Assistant message
    await ctx.db.insert("aiConversations", {
      userId: authUserId ?? undefined,
      role: "assistant",
      content: reply,
      timestamp: Date.now() + 500,
    });

    return reply;
  }
});
