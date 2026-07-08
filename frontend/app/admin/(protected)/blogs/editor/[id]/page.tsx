"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Upload, Sparkles, Cpu, Globe, CheckCircle2, AlertTriangle, BookOpen, Layers } from "lucide-react";
import Link from "next/link";
import { Toaster, toast } from 'sonner';
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false, loading: () => <div className="h-96 w-full animate-pulse bg-muted rounded-md" /> });

// Define tabs
type Tab = "seo" | "writing" | "ai";

export default function BlogEditorPage() {
  const params = useParams();
  const router = useRouter();
  const isNew = params.id === "new";

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [focusKeyword, setFocusKeyword] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [status, setStatus] = useState("draft");
  const [coverImage, setCoverImage] = useState("");
  
  const [activeTab, setActiveTab] = useState<Tab>("seo");
  
  // SEO Metrics
  const [wordCount, setWordCount] = useState(0);
  const [seoScore, setSeoScore] = useState(0);
  const [keywordDensity, setKeywordDensity] = useState(0);
  const [hasH2, setHasH2] = useState(false);
  
  // Writing Checks Metrics
  const [passiveCount, setPassiveCount] = useState(0);
  const [fillerCount, setFillerCount] = useState(0);
  const [longParagraphs, setLongParagraphs] = useState(0);
  
  // AI Metrics
  const [aiScore, setAiScore] = useState<number | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  // Autosave handling
  const lastSavedContent = useRef("");
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const getPlainText = (html: string) => {
    return html.replace(/<[^>]*>/g, '').trim();
  };

  // Analyze SEO on change
  useEffect(() => {
    const plainText = getPlainText(content);
    const wordsArray = plainText.split(/\s+/).filter(w => w.length > 0);
    const words = wordsArray.length;
    setWordCount(words);

    // Calculate SEO Score
    let score = 0;
    if (words > 800) score += 30;
    else if (words > 500) score += 15;

    // Headings check
    const headings = (content.match(/<h[2-3]>/g) || []).length;
    setHasH2(headings > 0);
    if (headings > 0) score += 10;

    // Keyword density
    let kDensity = 0;
    if (focusKeyword && words > 0) {
      const keywordRegex = new RegExp(`\\b${focusKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const keywordCount = (plainText.match(keywordRegex) || []).length;
      kDensity = (keywordCount / words) * 100;
      setKeywordDensity(kDensity);

      if (kDensity >= 0.8 && kDensity <= 1.5) score += 20;
      else if (kDensity > 0 && kDensity < 0.8) score += 10;
      
      // Structural Checks
      if (title.toLowerCase().includes(focusKeyword.toLowerCase())) score += 10;
      if (slug.toLowerCase().includes(focusKeyword.toLowerCase().replace(/\s+/g, '-'))) score += 10;
      if (plainText.substring(0, 300).toLowerCase().includes(focusKeyword.toLowerCase())) score += 10;
    } else {
      setKeywordDensity(0);
    }

    if (seoDescription.length >= 120 && seoDescription.length <= 160) score += 10;
    
    setSeoScore(Math.min(100, score));

    // Writing Checks
    const passiveRegex = /\b(am|is|are|was|were|be|been|being)\s+([a-z]+ed|done|made|seen|written)\b/gi;
    setPassiveCount((plainText.match(passiveRegex) || []).length);

    const fillerWords = /\b(basically|actually|literally|very|really|simply|totally|obviously)\b/gi;
    setFillerCount((plainText.match(fillerWords) || []).length);

    const paragraphs = content.split(/<\/?p>/).filter(p => getPlainText(p).trim().length > 0);
    let longPCount = 0;
    paragraphs.forEach(p => {
      if (getPlainText(p).split(/\s+/).length > 150) longPCount++;
    });
    setLongParagraphs(longPCount);

  }, [title, slug, content, focusKeyword, seoDescription]);

  // Load existing if not new
  useEffect(() => {
    if (!isNew) {
      fetch(`/api/admin/blogs?id=${params.id}`)
        .then(res => res.json())
        .then(data => {
          setTitle(data.title || "");
          setSlug(data.slug || "");
          setContent(data.content || "");
          setFocusKeyword(data.focusKeyword || "");
          setSeoTitle(data.seoTitle || "");
          setSeoDescription(data.seoDescription || "");
          setCoverImage(data.coverImage || "");
          setStatus(data.status || "draft");
          
          lastSavedContent.current = data.content || "";
          setIsLoaded(true);
        });
    } else {
      setIsLoaded(true);
    }
  }, [params.id, isNew]);

  const saveToBackend = async (saveStatus: string, silent = false) => {
    if (!title) {
      if (!silent) toast.error("Title is required");
      return false;
    }

    const payload = { title, slug, content, coverImage, focusKeyword, seoTitle, seoDescription, status: saveStatus, seoScore };
    const method = isNew ? "POST" : "PUT";
    const url = isNew ? `/api/admin/blogs` : `/api/admin/blogs/${params.id}`;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        lastSavedContent.current = content;
        if (!silent) {
          toast.success(`Blog ${saveStatus === 'published' ? 'published' : 'saved'} successfully!`);
          if (isNew) router.push("/admin/blogs");
        } else {
          toast.success("Autosaved successfully", { duration: 2000, position: 'bottom-right' });
        }
        return true;
      } else {
        if (!silent) toast.error("Error saving blog");
        return false;
      }
    } catch (e) {
      if (!silent) toast.error("Network error while saving");
      return false;
    }
  };

  // Autosave Effect
  useEffect(() => {
    if (!isLoaded || isNew) return; // Don't autosave new untended blogs yet

    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    // Only autosave if content actually changed
    if (content !== lastSavedContent.current) {
      autosaveTimerRef.current = setTimeout(() => {
        saveToBackend(status, true);
      }, 6000); // 6 seconds debounce
    }

    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, [content, title, slug, focusKeyword, seoTitle, seoDescription, coverImage, status, isLoaded]);

  const handleSave = (saveStatus: string) => {
    saveToBackend(saveStatus, false);
  };

  const handleAiScan = async () => {

    setIsScanning(true);
    setAiScore(null);
    try {
      const res = await fetch('/api/admin/blogs/ai-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // ZeroGPT returns fakePercentage for AI generated. Check multiple nested paths safely.
        const fakePercentage = data.data?.data?.fakePercentage ?? data.data?.fakePercentage ?? data.fakePercentage ?? 0;
        setAiScore(Math.round(fakePercentage));
        toast.success("AI Scan complete");
      } else {
        toast.error(data.error || data.message || "Scan failed.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error contacting the AI scanner.");
    }
    setIsScanning(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB");
      return;
    }

    const toastId = toast.loading("Uploading image...");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/blogs/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setCoverImage(data.url);
        toast.success("Image uploaded", { id: toastId });
      } else {
        toast.error("Upload failed: " + (data.error || "Unknown error"), { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error("Upload failed", { id: toastId });
    }
  };

  const modules = {
    toolbar: [
      [{ 'header': [2, 3, 4, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ],
  };

  return (
    <div className="flex flex-col h-full min-h-[85vh] gap-4 pb-20">
      <Toaster />
      
      {/* Full-width Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/blogs">
            <Button variant="outline" size="icon" className="rounded-full shadow-sm"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">{isNew ? "Draft New Blog" : "Edit Blog"}</h1>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={() => handleSave("draft")} variant="secondary" className="shadow-sm">
            Save Draft
          </Button>
          <Button onClick={() => handleSave("published")} className="bg-primary shadow-md">
            <Save className="mr-2 h-4 w-4" /> Publish
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-0">
        {/* Left Pane - Writer (Span 8/9) */}
        <div className="lg:col-span-8 xl:col-span-9 flex flex-col min-w-0">
          <div className="bg-white/60 dark:bg-card/60 backdrop-blur-md border border-gray-150 dark:border-border lg:rounded-r-none rounded-2xl p-6 flex flex-col gap-5 shadow-lg shadow-black/5 h-full">
          <div>
            <Label className="text-muted-foreground font-semibold">Blog Title</Label>
            <Input 
              placeholder="Enter a compelling title..." 
              value={title} 
              onChange={e => {
                setTitle(e.target.value);
                if (isNew) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""));
              }} 
              className="text-xl font-bold mt-1.5 h-12 border-gray-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground font-semibold">Slug URL Handle</Label>
              <Input 
                value={slug} 
                onChange={e => setSlug(e.target.value)} 
                className="mt-1.5 font-mono text-sm border-gray-200"
              />
            </div>
            <div>
              <Label className="text-muted-foreground font-semibold">Target Keyword</Label>
              <Input 
                placeholder="e.g. tax filing 2026" 
                value={focusKeyword} 
                onChange={e => setFocusKeyword(e.target.value)} 
                className="mt-1.5 border-gray-200"
              />
            </div>
          </div>

          <div>
            <Label className="text-muted-foreground font-semibold">Meta Description</Label>
            <Textarea 
              placeholder="Optimal length 120-160 chars..." 
              value={seoDescription} 
              onChange={(e: any) => setSeoDescription(e.target.value)} 
              className="mt-1.5 resize-none border-gray-200"
              rows={2}
            />
          </div>

          <div className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl p-8 flex flex-col items-center justify-center text-muted-foreground bg-gray-50/50 dark:bg-muted/20 relative overflow-hidden transition-colors hover:bg-gray-50">
            {coverImage ? (
              <img src={coverImage} alt="Cover" className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-multiply" />
            ) : (
              <Upload className="h-8 w-8 mb-3 opacity-50 z-10" />
            )}
            <p className="z-10 font-medium">{coverImage ? "Change Header Image" : "Upload Header Image"}</p>
            <div className="relative mt-4 z-10">
              <Button variant="outline" size="sm" type="button" className="bg-white/80 backdrop-blur-sm shadow-sm">Browse Files (Max 5MB)</Button>
              <input 
                type="file" 
                accept="image/*" 
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleImageUpload}
              />
            </div>
          </div>

          <div className="flex-1 mt-2 text-left">
            <Label className="text-muted-foreground font-semibold mb-2 block">Content Editor</Label>
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
              <ReactQuill 
                theme="snow" 
                value={content} 
                onChange={setContent} 
                modules={modules}
                className="h-[500px] border-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right Pane - Sticky Sidebar (Span 4/3) */}
      <div className="lg:col-span-4 xl:col-span-3">
        <div className="sticky top-6 flex flex-col h-full">
          
          <div className="bg-white/60 dark:bg-card/60 backdrop-blur-md border border-gray-150 border-l-0 lg:rounded-l-none rounded-2xl overflow-hidden shadow-lg shadow-black/5 h-full">
            {/* Tab Switcher */}
            <div className="flex border-b border-gray-150">
              <button 
                onClick={() => setActiveTab("seo")}
                className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${activeTab === 'seo' ? 'bg-primary/5 text-primary border-b-2 border-primary' : 'text-muted-foreground hover:bg-gray-50'}`}
              >
                <Globe className="h-4 w-4" /> SEO
              </button>
              <button 
                onClick={() => setActiveTab("writing")}
                className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${activeTab === 'writing' ? 'bg-orange-500/5 text-orange-600 border-b-2 border-orange-500' : 'text-muted-foreground hover:bg-gray-50'}`}
              >
                <BookOpen className="h-4 w-4" /> Writing
              </button>
              <button 
                onClick={() => setActiveTab("ai")}
                className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${activeTab === 'ai' ? 'bg-indigo-500/5 text-indigo-600 border-b-2 border-indigo-500' : 'text-muted-foreground hover:bg-gray-50'}`}
              >
                <Cpu className="h-4 w-4" /> AI Scan
              </button>
            </div>

            <div className="p-5">
              
              {/* --- SEO TAB --- */}
              {activeTab === "seo" && (
                <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">SEO Quality</span>
                      <div className="font-bold text-3xl mt-1 flex items-baseline gap-1">
                        <span className={seoScore > 80 ? 'text-green-600' : seoScore > 50 ? 'text-yellow-600' : 'text-red-500'}>{seoScore}</span>
                        <span className="text-sm text-muted-foreground">/ 100</span>
                      </div>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                      <Sparkles className={`h-6 w-6 ${seoScore > 80 ? 'text-green-500' : 'text-yellow-500'}`} />
                    </div>
                  </div>

                  <div className="space-y-3 mt-4">
                    <div className="flex items-start gap-2.5 text-sm">
                      {wordCount >= 500 ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" /> : <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />}
                      <span className="text-gray-700 leading-snug">
                        Word count: <span className="font-semibold">{wordCount}</span> <span className="text-xs text-muted-foreground ml-1">(Target: 800+)</span>
                      </span>
                    </div>

                    <div className="flex items-start gap-2.5 text-sm">
                      {keywordDensity >= 0.8 && keywordDensity <= 1.5 ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" /> : <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />}
                      <span className="text-gray-700 leading-snug">
                        Keyword Density: <span className="font-semibold">{keywordDensity.toFixed(1)}%</span> <span className="text-xs text-muted-foreground ml-1">(Ideal: 0.8-1.5%)</span>
                      </span>
                    </div>

                    <div className="flex items-start gap-2.5 text-sm">
                      {hasH2 ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" /> : <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />}
                      <span className="text-gray-700 leading-snug">
                        Subheadings (H2, H3) used for readability
                      </span>
                    </div>

                    <div className="flex items-start gap-2.5 text-sm">
                      {(seoDescription.length >= 120 && seoDescription.length <= 160) ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" /> : <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />}
                      <span className="text-gray-700 leading-snug">
                        Meta Description length: <span className="font-semibold">{seoDescription.length}</span> <span className="text-xs text-muted-foreground ml-1">(120-160 chars)</span>
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* --- WRITING CHECKS TAB --- */}
              {activeTab === "writing" && (
                <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="p-4 bg-orange-50/50 rounded-xl border border-orange-100 flex items-start gap-3">
                    <Layers className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-orange-900 leading-relaxed">
                      Our real-time engine scans for common stylistic pitfalls to keep your writing crisp and engaging.
                    </p>
                  </div>

                  <div className="space-y-4 mt-2">
                    <div className="p-3 border rounded-lg flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">Passive Voice Uses</span>
                        <span className="text-xs text-muted-foreground">Try to use active verbs</span>
                      </div>
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${passiveCount > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                        {passiveCount} found
                      </span>
                    </div>

                    <div className="p-3 border rounded-lg flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">Filler Words</span>
                        <span className="text-xs text-muted-foreground">e.g., basically, very, literally</span>
                      </div>
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${fillerCount > 0 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                        {fillerCount} found
                      </span>
                    </div>

                    <div className="p-3 border rounded-lg flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">Long Paragraphs</span>
                        <span className="text-xs text-muted-foreground">Blocks &gt; 150 words</span>
                      </div>
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${longParagraphs > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {longParagraphs} found
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* --- AI SCAN TAB --- */}
              {activeTab === "ai" && (
                <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 flex flex-col items-center text-center gap-2">
                    <Cpu className="h-6 w-6 text-indigo-500" />
                    <h3 className="font-semibold text-indigo-900">Arsalan AI Detector</h3>
                    <p className="text-xs text-indigo-700/80">Verify human originality before publishing.</p>
                  </div>

                  {aiScore !== null ? (
                    <div className="relative pt-6 pb-2 flex flex-col items-center justify-center border rounded-xl overflow-hidden mt-2 bg-gradient-to-b from-white to-gray-50">
                      {/* Speedometer visualization */}
                      <div className="relative w-40 h-20 overflow-hidden mb-2">
                        <div className="absolute top-0 left-0 w-40 h-40 rounded-full border-[16px] border-gray-100"></div>
                        <div 
                          className={`absolute top-0 left-0 w-40 h-40 rounded-full border-[16px] border-b-transparent border-r-transparent transition-all duration-1000 ease-out`}
                          style={{
                            borderColor: aiScore < 20 ? '#22c55e' : aiScore < 60 ? '#eab308' : '#ef4444',
                            transform: `rotate(${45 + (aiScore * 1.8)}deg)`
                          }}
                        ></div>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-2xl font-black">
                          {aiScore}%
                        </div>
                      </div>
                      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">AI Probability</span>
                      
                      <div className="w-full p-3 text-center border-t text-sm font-semibold">
                        {aiScore < 20 ? (
                          <span className="text-green-600">✓ Highly likely Human</span>
                        ) : aiScore < 60 ? (
                          <span className="text-yellow-600">⚠ Mixed / Heavily Edited</span>
                        ) : (
                          <span className="text-red-600">✗ Likely AI Generated</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="h-48 border rounded-xl border-dashed flex items-center justify-center mt-2 bg-gray-50/50">
                      <span className="text-sm text-muted-foreground">Not scanned yet</span>
                    </div>
                  )}

                  <Button 
                    onClick={handleAiScan} 
                    disabled={isScanning}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-2"
                  >
                    {isScanning ? "Scanning..." : "Run AI Scan"}
                  </Button>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
