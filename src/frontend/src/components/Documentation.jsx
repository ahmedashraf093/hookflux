import React from 'react';
import { BookOpen, HelpCircle, Terminal, Activity, Key, Globe } from 'lucide-react';

export default function Documentation() {
  return (
    <div className="p-12 max-w-5xl mx-auto w-full overflow-y-auto custom-scrollbar font-mono text-zinc-300">
      <div className="mb-12 border-b border-zinc-800 pb-8">
        <h1 className="text-3xl font-black tracking-tighter text-zinc-100 flex items-center gap-4">
          <BookOpen size={32} className="text-blue-500" /> System_Documentation
        </h1>
        <p className="text-zinc-500 mt-4 leading-relaxed">
          HookFlux is a modular execution engine that transforms webhooks into automated bash pipelines.
          This guide explains the core primitives and security model of the platform.
        </p>
      </div>

      {/* 1. Core Primitives */}
      <section className="mb-16">
        <h2 className="text-xl font-black text-zinc-100 uppercase tracking-widest mb-6 flex items-center gap-3">
          1. Core_Primitives
        </h2>
        
        <div className="space-y-10 pl-4 border-l-2 border-zinc-900">
          <div>
            <h3 className="text-blue-400 font-bold mb-2 flex items-center gap-2 underline decoration-zinc-800 underline-offset-4">
              <Activity size={16} /> Fluxes (Pipelines)
            </h3>
            <p className="text-sm leading-relaxed">
              A **Flux** is a top-level automation path. It is triggered by a unique webhook endpoint. 
              Each Flux contains a "Flow" — an ordered chain of modules that execute sequentially when the webhook is hit.
            </p>
          </div>

          <div>
            <h3 className="text-blue-400 font-bold mb-2 flex items-center gap-2 underline decoration-zinc-800 underline-offset-4">
              <Terminal size={16} /> Modules (Execution Blocks)
            </h3>
            <p className="text-sm leading-relaxed">
              **Modules** are reusable bash script templates. They use placeholders like <code className="bg-zinc-950 px-1.5 py-0.5 rounded text-blue-500">{`{{VARIABLE}}`}</code> to remain generic. 
              Modules are the building blocks you use to construct different Fluxes without rewriting bash logic.
            </p>
          </div>
        </div>
      </section>

      {/* 2. The Flow Builder */}
      <section className="mb-16">
        <h2 className="text-xl font-black text-zinc-100 uppercase tracking-widest mb-6 flex items-center gap-3">
          2. Pipeline_Flow_Builder
        </h2>
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 space-y-4">
          <p className="text-sm">The Flow Builder allows you to "LEGO" your deployment logic together:</p>
          <ul className="list-disc pl-6 space-y-3 text-xs text-zinc-400">
            <li><span className="text-zinc-200 font-bold">Search & Insert:</span> Access the Module Library to find pre-defined tasks.</li>
            <li><span className="text-zinc-200 font-bold">Drag & Drop:</span> Reorder steps by grabbing the handle on the left of each task card.</li>
            <li><span className="text-zinc-200 font-bold">In-Place Configuration:</span> Click the cog icon on any step to inject project-specific variables.</li>
            <li><span className="text-zinc-200 font-bold">Validation:</span> The system automatically flags steps with missing parameters in red.</li>
          </ul>
        </div>
      </section>

      {/* 3. SSH & Remote Execution */}
      <section className="mb-16">
        <h2 className="text-xl font-black text-zinc-100 uppercase tracking-widest mb-6 flex items-center gap-3">
          3. Remote_Orchestration (SSH)
        </h2>
        
        <div className="bg-blue-900/5 border border-blue-900/20 p-8">
          <div className="flex items-center gap-3 mb-4">
            <Key className="text-blue-500" />
            <h3 className="font-bold text-zinc-100 uppercase tracking-tight text-sm">What is the Public_Key?</h3>
          </div>
          <p className="text-sm leading-relaxed mb-6">
            To execute commands on a remote machine (like your Swarm Manager or a VPS), HookFlux uses a unique RSA key pair generated specifically for your instance.
          </p>
          
          <div className="space-y-6">
            <div className="p-4 bg-zinc-950 border border-zinc-800">
              <h4 className="text-[10px] font-black text-zinc-500 uppercase mb-2 tracking-widest">Setup Instructions:</h4>
              <ol className="list-decimal pl-6 space-y-3 text-xs">
                <li>Click <span className="text-blue-400 font-bold underline">Copy_System_Key</span> in the sidebar.</li>
                <li>SSH into your target machine manually once.</li>
                <li>Open <code className="text-zinc-300 bg-zinc-900 px-1">~/.ssh/authorized_keys</code> and paste the key on a new line.</li>
                <li>In HookFlux, edit your Flux, select **Remote (SSH)**, and enter the machine's IP.</li>
              </ol>
            </div>
            <p className="text-[10px] text-zinc-600 font-bold italic uppercase tracking-tighter">
              Note: HookFlux pipes the entire script via SSH directly to bash, ensuring no temporary files are left on the target machine.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Webhook Security */}
      <section className="mb-16">
        <h2 className="text-xl font-black text-zinc-100 uppercase tracking-widest mb-6 flex items-center gap-3">
          4. Webhook_Security
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-zinc-900 border border-zinc-800">
            <h3 className="text-zinc-100 font-bold text-sm mb-3 flex items-center gap-2"><Globe size={14} className="text-blue-500"/> Slug-Based URLs</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Every Flux has a private URL containing its unique slug. This prevents payload ambiguity and ensures only the correct pipeline is triggered.
            </p>
          </div>
          <div className="p-6 bg-zinc-900 border border-zinc-800">
            <h3 className="text-zinc-100 font-bold text-sm mb-3 flex items-center gap-2"><HelpCircle size={14} className="text-blue-500"/> HMAC Verification</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              We verify the <code className="text-zinc-300">X-Hub-Signature-256</code> header from GitHub using your secret key to ensure the payload hasn't been tampered with.
            </p>
          </div>
        </div>
      </section>

      <footer className="mt-20 pt-8 border-t border-zinc-900 text-center">
        <div className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-800">
          HookFlux // Automation Framework // v1.1.0-Release
        </div>
      </footer>
    </div>
  );
}
