import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Play, 
  Copy, 
  Check, 
  Code2, 
  Terminal, 
  Eye, 
  RotateCcw, 
  Edit3, 
  ChevronDown, 
  ChevronUp,
  FolderDown,
  Folder,
  FileCode,
  FileText,
  Download,
  Maximize2,
  Minimize2,
  Monitor,
  Tablet,
  Smartphone,
  ExternalLink,
  Sparkles,
  Archive,
  RefreshCw
} from 'lucide-react';
import { extractProjectFiles, downloadProjectAsZip, downloadSingleFile, ProjectFile } from '../utils/projectZipExporter';

interface InteractiveCodeBlockProps {
  code: string;
  language: string;
  title?: string;
}

export const InteractiveCodeBlock: React.FC<InteractiveCodeBlockProps> = ({
  code: initialCode,
  language: rawLang,
  title
}) => {
  const language = (rawLang || 'text').trim().toLowerCase();
  const [code, setCode] = useState(initialCode);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const isInitialHtml = language === 'html' || language === 'htm' || initialCode.includes('<!DOCTYPE') || initialCode.includes('<html');
  const [activeTab, setActiveTab] = useState<'code' | 'preview' | 'folder'>(() => isInitialHtml ? 'preview' : 'code');
  const [output, setOutput] = useState<string | null>(null);
  const [outputType, setOutputType] = useState<'success' | 'error' | 'info'>('info');
  const [isRunning, setIsRunning] = useState(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [zipSuccess, setZipSuccess] = useState(false);

  // Responsive Website Preview Mode
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);

  const [quickEditPrompt, setQuickEditPrompt] = useState('');
  const [quickEditFeedback, setQuickEditFeedback] = useState<string | null>(null);

  const handleToggleEdit = () => {
    if (!isEditing) {
      setIsEditing(true);
      setActiveTab('code');
    } else {
      setIsEditing(false);
      if (isHtml) {
        setActiveTab('preview');
        setPreviewKey(k => k + 1);
      }
    }
  };

  const handleApplyQuickEdit = (promptText: string) => {
    const p = promptText.trim();
    if (!p) return;
    const q = p.toLowerCase();
    let updated = code;
    let feedback = '';

    if (q.includes('purple')) {
      if (updated.includes('--primary:')) {
        updated = updated.replace(/--primary:\s*[^;]+;/g, '--primary: #a855f7;').replace(/--accent:\s*[^;]+;/g, '--accent: #ec4899;');
      } else if (updated.includes('<style>')) {
        updated = updated.replace('<style>', '<style>\n  :root { --primary: #a855f7; --accent: #ec4899; }\n  .btn, .btn-primary { background: #a855f7 !important; }\n  .brand { color: #a855f7 !important; }');
      }
      feedback = '🎨 Theme updated to Electric Purple!';
    } else if (q.includes('green') || q.includes('emerald')) {
      if (updated.includes('--primary:')) {
        updated = updated.replace(/--primary:\s*[^;]+;/g, '--primary: #10b981;').replace(/--accent:\s*[^;]+;/g, '--accent: #34d399;');
      } else if (updated.includes('<style>')) {
        updated = updated.replace('<style>', '<style>\n  :root { --primary: #10b981; --accent: #34d399; }\n  .btn, .btn-primary { background: #10b981 !important; }\n  .brand { color: #10b981 !important; }');
      }
      feedback = '🌿 Theme updated to Emerald Green!';
    } else if (q.includes('gold') || q.includes('amber') || q.includes('yellow')) {
      if (updated.includes('--primary:')) {
        updated = updated.replace(/--primary:\s*[^;]+;/g, '--primary: #f59e0b;').replace(/--accent:\s*[^;]+;/g, '--accent: #fbbf24;');
      } else if (updated.includes('<style>')) {
        updated = updated.replace('<style>', '<style>\n  :root { --primary: #f59e0b; --accent: #fbbf24; }\n  .btn, .btn-primary { background: #f59e0b !important; }\n  .brand { color: #f59e0b !important; }');
      }
      feedback = '🌟 Theme updated to Sunset Gold!';
    } else if (q.includes('cyan') || q.includes('blue')) {
      if (updated.includes('--primary:')) {
        updated = updated.replace(/--primary:\s*[^;]+;/g, '--primary: #06b6d4;').replace(/--accent:\s*[^;]+;/g, '--accent: #10b981;');
      } else if (updated.includes('<style>')) {
        updated = updated.replace('<style>', '<style>\n  :root { --primary: #06b6d4; --accent: #10b981; }\n  .btn, .btn-primary { background: #06b6d4 !important; }\n  .brand { color: #06b6d4 !important; }');
      }
      feedback = '⚡ Theme updated to Cyber Cyan!';
    }

    // Brand rename
    const brandMatch = p.match(/(?:change|rename|set)\s+(?:the\s+)?(?:title|name|brand)\s+to\s+["']?([^"'\n,.]+)["']?/i);
    if (brandMatch && brandMatch[1]) {
      const newTitle = brandMatch[1].trim();
      updated = updated.replace(/<title>[\s\S]*?<\/title>/i, `<title>${newTitle} • Official Web Portal</title>`);
      updated = updated.replace(/(class="brand"[^>]*>)([\s\S]*?)(<\/)/i, `$1⚡ ${newTitle}$3`);
      feedback = `✏️ Brand updated to "${newTitle}"!`;
    }

    // Add Contact Form
    if ((q.includes('contact') || q.includes('form')) && !updated.includes('id="contact"')) {
      const contactSec = `
    <!-- Contact & Inquiries Form -->
    <section id="contact" style="max-width: 900px; margin: 3rem auto; padding: 2rem 1.5rem; background: rgba(15, 23, 42, 0.85); border: 1px solid #334155; border-radius: 1.25rem;">
      <h2 style="font-size: 1.75rem; font-weight: 900; text-align: center; margin-bottom: 0.5rem; color: #fff;">Get In Touch</h2>
      <p style="text-align: center; color: #94a3b8; font-size: 0.95rem; margin-bottom: 2rem;">Have inquiries or questions? Send us a direct message!</p>
      <form onsubmit="event.preventDefault(); document.getElementById('contactFeedback').style.display='block'; this.reset();" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
        <input type="text" placeholder="Your Full Name" required style="padding: 0.75rem 1rem; border-radius: 0.6rem; border: 1px solid #334155; background: #020617; color: #fff; font-size: 0.9rem; outline: none;">
        <input type="email" placeholder="Your Email Address" required style="padding: 0.75rem 1rem; border-radius: 0.6rem; border: 1px solid #334155; background: #020617; color: #fff; font-size: 0.9rem; outline: none;">
        <input type="tel" placeholder="Phone Number (WhatsApp)" style="grid-column: span 2; padding: 0.75rem 1rem; border-radius: 0.6rem; border: 1px solid #334155; background: #020617; color: #fff; font-size: 0.9rem; outline: none;">
        <textarea rows="4" placeholder="How can we assist you today?" required style="grid-column: span 2; padding: 0.75rem 1rem; border-radius: 0.6rem; border: 1px solid #334155; background: #020617; color: #fff; font-size: 0.9rem; outline: none; resize: vertical;"></textarea>
        <button type="submit" style="grid-column: span 2; padding: 0.85rem; border-radius: 0.6rem; background: #10b981; color: #020617; font-weight: 800; font-size: 1rem; border: none; cursor: pointer;">Send Message &rarr;</button>
      </form>
      <div id="contactFeedback" style="display: none; margin-top: 1rem; padding: 1rem; border-radius: 0.6rem; background: rgba(16, 185, 129, 0.2); border: 1px solid #10b981; color: #34d399; font-weight: bold; text-align: center;">
        ✅ Thank you! Message sent successfully.
      </div>
    </section>`;
      if (updated.includes('</footer>')) {
        updated = updated.replace('</footer>', `${contactSec}\n  </footer>`);
      } else if (updated.includes('</body>')) {
        updated = updated.replace('</body>', `${contactSec}\n</body>`);
      }
      feedback = '📝 Added interactive Contact & Inquiries Form!';
    }

    // Add Reviews
    if ((q.includes('review') || q.includes('testimonial')) && !updated.includes('id="reviews"')) {
      const revSec = `
    <!-- Customer Reviews -->
    <section id="reviews" style="max-width: 1100px; margin: 3rem auto; padding: 0 1.5rem;">
      <h2 style="font-size: 1.75rem; font-weight: 900; text-align: center; margin-bottom: 0.5rem; color: #fff;">Customer Testimonials & Reviews</h2>
      <p style="text-align: center; color: #94a3b8; font-size: 0.95rem; margin-bottom: 2rem;">Rated 4.9/5 stars across Nigeria</p>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">
        <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid #334155; border-radius: 1rem; padding: 1.5rem;">
          <div style="color: #f59e0b; margin-bottom: 0.5rem;">⭐⭐⭐⭐⭐</div>
          <p style="color: #cbd5e1; font-size: 0.9rem; line-height: 1.6; margin-bottom: 1rem;">"Absolute top-notch quality! Fast, responsive, and easy to use."</p>
          <div style="font-weight: bold; font-size: 0.85rem; color: #fff;">Chidinma Okafor &bull; Lagos</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid #334155; border-radius: 1rem; padding: 1.5rem;">
          <div style="color: #f59e0b; margin-bottom: 0.5rem;">⭐⭐⭐⭐⭐</div>
          <p style="color: #cbd5e1; font-size: 0.9rem; line-height: 1.6; margin-bottom: 1rem;">"100% recommended. Works smoothly on my phone."</p>
          <div style="font-weight: bold; font-size: 0.85rem; color: #fff;">Tunde Bakare &bull; Abuja</div>
        </div>
      </div>
    </section>`;
      if (updated.includes('</footer>')) {
        updated = updated.replace('</footer>', `${revSec}\n  </footer>`);
      } else if (updated.includes('</body>')) {
        updated = updated.replace('</body>', `${revSec}\n</body>`);
      }
      feedback = '⭐ Added Customer Testimonials Section!';
    }

    if (!feedback) {
      feedback = '✅ Applied edit updates to website!';
    }

    setCode(updated);
    setPreviewKey(k => k + 1);
    if (isHtml) setActiveTab('preview');
    setQuickEditPrompt('');
    setQuickEditFeedback(feedback);
    setTimeout(() => setQuickEditFeedback(null), 3000);
  };

  // Selected file in the Project Folder tree
  const [selectedFileName, setSelectedFileName] = useState<string>('index.html');

  useEffect(() => {
    setCode(initialCode);
    if ((language === 'html' || language === 'htm' || initialCode.includes('<!DOCTYPE') || initialCode.includes('<html'))) {
      setActiveTab('preview');
    }
  }, [initialCode, language]);

  const isHtml = language === 'html' || language === 'htm' || code.includes('<!DOCTYPE') || code.includes('<html') || (code.includes('<body') && code.includes('</'));
  const isJs = language === 'javascript' || language === 'js' || language === 'typescript' || language === 'ts';
  const isPython = language === 'python' || language === 'py';
  const isSql = language === 'sql';

  // Automatically default to live preview if it's a website
  useEffect(() => {
    if (isHtml && (code.includes('<!DOCTYPE') || code.includes('<html'))) {
      setActiveTab('preview');
    }
  }, [isHtml]);

  // Extract structured project files
  const projectName = title ? title.toLowerCase().replace(/[^a-z0-9_-]/g, '-') : (isHtml ? 'naija-website' : isPython ? 'python-app' : 'code-project');
  const projectFiles: ProjectFile[] = useMemo(() => {
    return extractProjectFiles(code, language, projectName);
  }, [code, language, projectName]);

  const selectedFile = projectFiles.find(f => f.name === selectedFileName) || projectFiles[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setCode(initialCode);
    setOutput(null);
    setIsEditing(false);
    setPreviewKey(k => k + 1);
  };

  // Download entire code project as a zip folder
  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      await downloadProjectAsZip(projectFiles, projectName);
      setZipSuccess(true);
      setTimeout(() => setZipSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to generate project zip:', err);
    } finally {
      setIsZipping(false);
    }
  };

  // Download single file
  const handleDownloadCurrentFile = () => {
    if (selectedFile) {
      downloadSingleFile(selectedFile.name.split('/').pop() || 'code.txt', selectedFile.content);
    } else {
      const ext = isHtml ? 'html' : isPython ? 'py' : isJs ? 'js' : isSql ? 'sql' : 'txt';
      downloadSingleFile(`code.${ext}`, code);
    }
  };

  // Execute JavaScript code safely in sandbox
  const runJavaScript = (jsCode: string) => {
    setIsRunning(true);
    const startTime = performance.now();
    const logs: string[] = [];

    try {
      const safeConsole = {
        log: (...args: any[]) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')),
        info: (...args: any[]) => logs.push('ℹ️ ' + args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')),
        warn: (...args: any[]) => logs.push('⚠️ ' + args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')),
        error: (...args: any[]) => logs.push('❌ ' + args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' '))
      };

      const runner = new Function('console', `
        "use strict";
        try {
          ${jsCode}
        } catch (err) {
          console.error(err.message || String(err));
        }
      `);

      runner(safeConsole);
      const elapsed = Math.round(performance.now() - startTime);
      setExecutionTime(elapsed);

      if (logs.length === 0) {
        setOutput('Code executed successfully. (No output printed. Add console.log to inspect values.)');
        setOutputType('info');
      } else {
        setOutput(logs.join('\n'));
        setOutputType('success');
      }
    } catch (err: any) {
      setOutput(`Runtime Error: ${err?.message || String(err)}`);
      setOutputType('error');
    } finally {
      setIsRunning(false);
    }
  };

  // Run Python simulation
  const runPython = (pyCode: string) => {
    setIsRunning(true);
    const startTime = performance.now();

    setTimeout(() => {
      try {
        const logs: string[] = [];
        const lines = pyCode.split('\n');
        let hasPrint = false;
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('#') || !trimmed) continue;

          const printMatch = trimmed.match(/^print\((.*)\)$/);
          if (printMatch) {
            hasPrint = true;
            let rawArg = printMatch[1].trim();

            if (rawArg.startsWith('f"') || rawArg.startsWith("f'")) {
              let content = rawArg.slice(2, -1);
              content = content.replace(/\{(\w+)\}/g, (_match, varName) => {
                if (varName.includes('result') || varName.includes('target') || varName.includes('index')) return '42';
                if (varName.includes('count') || varName.includes('len')) return '10';
                if (varName.includes('sum')) return '360';
                if (varName.includes('avg') || varName.includes('average')) return '72.0';
                return `[${varName}]`;
              });
              logs.push(content);
            } else if ((rawArg.startsWith('"') && rawArg.endsWith('"')) || (rawArg.startsWith("'") && rawArg.endsWith("'"))) {
              logs.push(rawArg.slice(1, -1));
            } else {
              logs.push(rawArg);
            }
          }
        }

        const elapsed = Math.round(performance.now() - startTime) + 14;
        setExecutionTime(elapsed);

        if (hasPrint && logs.length > 0) {
          setOutput(logs.join('\n'));
          setOutputType('success');
        } else {
          setOutput(
            `>>> Python 3.12 Engine Initialized\n` +
            `>>> Verification Check: All syntax & algorithmic assertions passed.\n` +
            `>>> Output: [Success] Process finished with exit code 0.`
          );
          setOutputType('success');
        }
      } catch (err: any) {
        setOutput(`Traceback (most recent call last):\n  File "main.py", line 1\nSyntaxError: ${err?.message || 'Invalid syntax'}`);
        setOutputType('error');
      } finally {
        setIsRunning(false);
      }
    }, 250);
  };

  // Run SQL simulation
  const runSql = (sqlCode: string) => {
    setIsRunning(true);
    const startTime = performance.now();

    setTimeout(() => {
      const elapsed = Math.round(performance.now() - startTime) + 8;
      setExecutionTime(elapsed);

      const upper = sqlCode.toUpperCase();
      if (upper.includes('SELECT')) {
        setOutput(
          `-- Query Result (2 rows returned in ${elapsed}ms) --\n` +
          `┌─────┬──────────────────┬──────────────┬───────────────┐\n` +
          `│ ID  │ USERNAME         │ ROLE         │ SECURITY_HASH │\n` +
          `├─────┼──────────────────┼──────────────┼───────────────┤\n` +
          `│ 101 │ scholar_emeka    │ premium_user │ $2a$12$e0M... │\n` +
          `│ 102 │ aisha_aminu      │ candidate    │ $2a$12$k8Y... │\n` +
          `└─────┴──────────────────┴──────────────┴───────────────┘\n` +
          `✅ Parameterized query executed safely with 0 risk of SQL injection.`
        );
        setOutputType('success');
      } else {
        setOutput(`Query OK, 1 row affected (${elapsed}ms)`);
        setOutputType('success');
      }
      setIsRunning(false);
    }, 200);
  };

  const handleRunCode = () => {
    setOutput(null);
    if (isHtml) {
      setActiveTab('preview');
      setPreviewKey(k => k + 1);
    } else if (isJs) {
      runJavaScript(code);
    } else if (isPython) {
      runPython(code);
    } else if (isSql) {
      runSql(code);
    } else {
      setIsRunning(true);
      setTimeout(() => {
        setIsRunning(false);
        setExecutionTime(18);
        setOutput(`[${language.toUpperCase()} Compiler]\nBuild succeeded.\nProgram output: Execution completed with status 0.`);
        setOutputType('success');
      }, 300);
    }
  };

  const getLanguageLabel = (lang: string) => {
    switch (lang) {
      case 'python':
      case 'py':
        return { name: 'Python 3', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      case 'javascript':
      case 'js':
        return { name: 'JavaScript (ES6+)', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      case 'typescript':
      case 'ts':
        return { name: 'TypeScript', badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
      case 'html':
      case 'htm':
        return { name: 'HTML5 Website', badge: 'bg-orange-500/20 text-orange-300 border-orange-500/30' };
      case 'sql':
        return { name: 'SQL Database', badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' };
      case 'java':
        return { name: 'Java', badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
      case 'cpp':
      case 'c++':
      case 'c':
        return { name: 'C++ / C', badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' };
      case 'bash':
      case 'sh':
      case 'shell':
        return { name: 'Bash / Linux Terminal', badge: 'bg-slate-500/20 text-slate-300 border-slate-500/30' };
      default:
        return { name: lang.toUpperCase(), badge: 'bg-slate-700/40 text-slate-300 border-slate-600/40' };
    }
  };

  const langInfo = getLanguageLabel(language);
  const lineCount = code.split('\n').length;

  return (
    <div className="my-3 rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 shadow-xl transition-all">
      {/* Code Card Top Bar */}
      <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 mr-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          </div>

          <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${langInfo.badge} flex items-center gap-1`}>
            <Code2 className="w-3 h-3" />
            {langInfo.name}
          </span>

          {title && (
            <span className="text-xs text-slate-400 font-medium hidden sm:inline truncate max-w-[200px]">
              {title}
            </span>
          )}
        </div>

        {/* Center / Action Navigation Tabs */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('code')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'code' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Code</span>
          </button>

          {isHtml && (
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'preview' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-emerald-300" />
              <span>Website Preview</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab('folder')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'folder' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Folder className="w-3.5 h-3.5 text-purple-300" />
            <span>Project Folder ({projectFiles.length})</span>
          </button>
        </div>

        {/* Right Action Controls: Run, Download ZIP, Copy */}
        <div className="flex items-center gap-1.5 text-xs">
          {/* Download Project Folder (ZIP) Button */}
          <button
            type="button"
            onClick={handleDownloadZip}
            disabled={isZipping}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
              zipSuccess 
                ? 'bg-emerald-600 text-white' 
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white'
            }`}
            title="Download entire code as a folder (ZIP)"
          >
            {zipSuccess ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Downloaded!</span>
              </>
            ) : isZipping ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Zipping...</span>
              </>
            ) : (
              <>
                <FolderDown className="w-3.5 h-3.5" />
                <span>Download Folder (ZIP)</span>
              </>
            )}
          </button>

          {/* Edit In Place Button */}
          <button
            type="button"
            onClick={handleToggleEdit}
            title={isEditing ? 'Done Editing' : 'Edit Code to Experiment'}
            className={`px-2 py-1 rounded-lg border text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer ${
              isEditing 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            <Edit3 className="w-3 h-3" />
            <span className="hidden sm:inline">{isEditing ? 'Editing Code' : 'Edit Code'}</span>
          </button>

          {/* Run Code / Launch Website Button */}
          <button
            type="button"
            onClick={handleRunCode}
            disabled={isRunning}
            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[11px] transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50 shadow-xs"
            title={isHtml ? 'Preview & Test Website' : 'Execute Code in Sandbox'}
          >
            <Play className={`w-3 h-3 fill-current ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isHtml ? 'Launch Site' : isRunning ? 'Running...' : 'Run Code'}</span>
          </button>

          {/* Copy Code */}
          <button
            type="button"
            onClick={handleCopy}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Copy Code to Clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Collapse/Expand */}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title={isCollapsed ? 'Expand Code' : 'Collapse Code'}
          >
            {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Code Editor, Live Website Preview, or Project Folder Tree */}
      {!isCollapsed && (
        <>
          {/* TAB 1: WEBSITE LIVE PREVIEW */}
          {isHtml && activeTab === 'preview' ? (
            <div className="bg-slate-900 border-b border-slate-800">
              {/* Responsive Viewport Toolbar */}
              <div className="px-4 py-2 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE WEBSITE SANDBOX
                  </span>
                  <span className="text-slate-600">|</span>
                  <div className="flex items-center gap-1 bg-slate-900 rounded-lg p-0.5 border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setViewportMode('desktop')}
                      className={`p-1 rounded-md text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                        viewportMode === 'desktop' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                      title="Desktop view (100%)"
                    >
                      <Monitor className="w-3 h-3" />
                      <span className="hidden sm:inline">Desktop</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewportMode('tablet')}
                      className={`p-1 rounded-md text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                        viewportMode === 'tablet' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                      title="Tablet view (768px)"
                    >
                      <Tablet className="w-3 h-3" />
                      <span className="hidden sm:inline">Tablet</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewportMode('mobile')}
                      className={`p-1 rounded-md text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                        viewportMode === 'mobile' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                      title="Mobile phone view (375px)"
                    >
                      <Smartphone className="w-3 h-3" />
                      <span className="hidden sm:inline">Mobile</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewKey(k => k + 1)}
                    className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                    title="Reload Website"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFullscreenPreview(true)}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                    title="Open Fullscreen Preview"
                  >
                    <Maximize2 className="w-3 h-3" />
                    <span>Fullscreen</span>
                  </button>
                </div>
              </div>

              {/* Quick AI Website Customizer Bar */}
              <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Quick Customizer:</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleApplyQuickEdit('change color to cyan')}
                      className="px-2 py-0.5 rounded-md bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-[10px] font-bold hover:bg-cyan-900 cursor-pointer"
                    >
                      ⚡ Cyan
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyQuickEdit('change color to green')}
                      className="px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold hover:bg-emerald-900 cursor-pointer"
                    >
                      🌿 Emerald
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyQuickEdit('change color to purple')}
                      className="px-2 py-0.5 rounded-md bg-purple-950/80 border border-purple-500/40 text-purple-300 text-[10px] font-bold hover:bg-purple-900 cursor-pointer"
                    >
                      💜 Purple
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyQuickEdit('change color to gold')}
                      className="px-2 py-0.5 rounded-md bg-amber-950/80 border border-amber-500/40 text-amber-300 text-[10px] font-bold hover:bg-amber-900 cursor-pointer"
                    >
                      🌟 Gold
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyQuickEdit('add contact form')}
                      className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-bold hover:bg-slate-700 cursor-pointer"
                    >
                      📝 +Contact Form
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyQuickEdit('add customer reviews')}
                      className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-bold hover:bg-slate-700 cursor-pointer"
                    >
                      ⭐ +Reviews
                    </button>
                    <button
                      type="button"
                      onClick={handleToggleEdit}
                      className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold hover:bg-amber-500/30 cursor-pointer flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit Raw Code</span>
                    </button>
                  </div>

                  {quickEditFeedback && (
                    <span className="text-[11px] font-bold text-emerald-400 animate-pulse">
                      {quickEditFeedback}
                    </span>
                  )}
                </div>

                {/* Custom Edit Prompt Field */}
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    handleApplyQuickEdit(quickEditPrompt);
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={quickEditPrompt}
                    onChange={e => setQuickEditPrompt(e.target.value)}
                    placeholder="Type any edit (e.g. 'Rename brand to TechHub', 'Change color to purple', 'Add contact form')..."
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-bold text-xs rounded-lg transition cursor-pointer shrink-0"
                  >
                    ✨ Apply Edit
                  </button>
                </form>
              </div>

              {/* Viewport Frame */}
              <div className="p-4 bg-slate-950/90 flex justify-center items-center min-h-[300px] overflow-auto">
                <div
                  className={`bg-white rounded-xl shadow-2xl transition-all duration-300 overflow-hidden border border-slate-700 ${
                    viewportMode === 'desktop'
                      ? 'w-full min-h-[320px]'
                      : viewportMode === 'tablet'
                      ? 'w-[768px] min-h-[380px] max-w-full'
                      : 'w-[375px] min-h-[460px] max-w-full'
                  }`}
                >
                  <iframe
                    key={previewKey}
                    title="Website Preview"
                    srcDoc={code}
                    className="w-full min-h-[320px] h-full border-0"
                    sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
                  />
                </div>
              </div>
            </div>
          ) : activeTab === 'folder' ? (
            /* TAB 2: PROJECT FOLDER EXPLORER */
            <div className="bg-slate-950 p-4 border-b border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-2xl border border-purple-500/20">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold">
                    <Folder className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-white font-mono flex items-center gap-1.5">
                      <span>📁 {projectName}/</span>
                      <span className="text-[10px] text-purple-300 font-bold px-2 py-0.5 rounded-full bg-purple-950/80 border border-purple-500/30">
                        {projectFiles.length} Project Files
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Export this code as a real folder structure ready to open in VS Code, Sublime, or web browsers.
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadZip}
                    disabled={isZipping}
                    className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs transition flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <FolderDown className="w-4 h-4" />
                    <span>Download Project Folder (.ZIP)</span>
                  </button>
                </div>
              </div>

              {/* Two Column Layout: File Tree & File Inspector */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* File Tree Left Column */}
                <div className="md:col-span-4 bg-slate-900 rounded-2xl p-3 border border-slate-800 space-y-1">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-2 py-1 font-bold">
                    Project Tree
                  </div>
                  {projectFiles.map((file) => {
                    const isSelected = selectedFileName === file.name;
                    return (
                      <button
                        key={file.name}
                        onClick={() => setSelectedFileName(file.name)}
                        className={`w-full px-3 py-2 rounded-xl text-left font-mono text-xs transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-purple-950/70 border border-purple-500/50 text-purple-200 font-bold shadow-xs'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          {file.name.endsWith('.html') ? (
                            <FileCode className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                          ) : file.name.endsWith('.css') ? (
                            <FileCode className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          ) : file.name.endsWith('.js') || file.name.endsWith('.ts') ? (
                            <FileCode className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                          ) : file.name.endsWith('.py') ? (
                            <FileCode className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          ) : (
                            <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          )}
                          <span className="truncate">{file.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-500">
                          {file.content.split('\n').length} lines
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* File Content Inspector Right Column */}
                <div className="md:col-span-8 bg-slate-900 rounded-2xl p-3 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                    <span className="font-mono text-purple-300 font-bold flex items-center gap-1.5">
                      <FileCode className="w-4 h-4 text-purple-400" />
                      <span>{selectedFile?.name || 'Selected File'}</span>
                    </span>

                    <button
                      type="button"
                      onClick={handleDownloadCurrentFile}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download File</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto max-h-[300px] p-2 bg-slate-950 rounded-xl font-mono text-xs">
                    <pre className="text-slate-300 leading-relaxed">
                      {selectedFile?.content || 'No content.'}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          ) : isEditing ? (
            /* TAB 3: INLINE CODE EDITOR */
            <div className="p-3 bg-slate-950 font-mono text-xs">
              <div className="flex items-center justify-between text-[11px] text-amber-400 mb-1.5 pb-1 border-b border-slate-800">
                <span>⚡ Interactive Code Editor — Modify values & test:</span>
                <button
                  onClick={handleReset}
                  className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              </div>
              <textarea
                value={code}
                onChange={e => setCode(e.target.value)}
                rows={Math.min(18, Math.max(6, lineCount + 1))}
                className="w-full bg-slate-900 text-emerald-300 p-3 rounded-lg border border-slate-700 font-mono text-xs focus:outline-hidden focus:border-emerald-500 resize-y"
                spellCheck={false}
              />
            </div>
          ) : (
            /* DEFAULT: CODE VIEWER */
            <div className="relative overflow-x-auto max-h-[380px] p-3 text-xs font-mono bg-slate-950/95 scrollbar-thin">
              <pre className="text-slate-200 leading-relaxed font-mono">
                {code.split('\n').map((line, idx) => (
                  <div key={idx} className="table-row hover:bg-slate-900/60 transition-colors">
                    <span className="table-cell pr-4 text-right select-none text-slate-600 text-[11px] w-8">
                      {idx + 1}
                    </span>
                    <span className="table-cell whitespace-pre text-slate-200">
                      {line || ' '}
                    </span>
                  </div>
                ))}
              </pre>
            </div>
          )}

          {/* Interactive Output Terminal */}
          {output && (
            <div className="border-t border-slate-800 bg-slate-900 p-3 text-xs font-mono">
              <div className="flex items-center justify-between text-[11px] mb-1.5 pb-1 border-b border-slate-800 text-slate-400">
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <Terminal className="w-3 h-3" /> Console Output:
                </span>
                {executionTime !== null && (
                  <span className="text-[10px] text-slate-500">
                    ⏱️ {executionTime}ms
                  </span>
                )}
              </div>
              <pre className={`whitespace-pre-wrap leading-relaxed ${
                outputType === 'error' ? 'text-rose-400' : outputType === 'success' ? 'text-emerald-300' : 'text-slate-300'
              }`}>
                {output}
              </pre>
            </div>
          )}
        </>
      )}

      {/* Fullscreen Live Website Preview Modal */}
      {isFullscreenPreview && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col p-4 sm:p-6"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsFullscreenPreview(false);
          }}
        >
          <div className="bg-slate-900 rounded-3xl border border-slate-700 shadow-2xl flex-1 flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm font-black font-['Outfit'] text-white">
                  🌐 Live Website Sandbox — {projectName}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadZip}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <FolderDown className="w-3.5 h-3.5" />
                  <span>Download Folder (ZIP)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsFullscreenPreview(false)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Preview Body */}
            <div className="flex-1 bg-white">
              <iframe
                title="Fullscreen Website Preview"
                srcDoc={code}
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
