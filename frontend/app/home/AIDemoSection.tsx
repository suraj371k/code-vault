'use client';
import { Wand2 } from 'lucide-react';

/* ── Animated token for the demo code block ── */
function T({ c, d = 0, children }: { c: string; d?: number; children: React.ReactNode }) {
  return (
    <span style={{ color: c, display: 'inline-block', animation: `token-fade .45s ease ${d}ms both` }}>
      {children}
    </span>
  );
}

/* ── Chat message bubble ── */
function ChatMsg({ from, text, delay }: { from: 'you' | 'ai'; text: React.ReactNode; delay: number }) {
  const isAi = from === 'ai';
  return (
    <div
      className={`rounded-xl p-4 ${isAi ? '' : 'glass-card'}`}
      style={
        isAi
          ? { background: 'rgba(20,184,166,.06)', border: '1px solid rgba(20,184,166,.2)',
              animation: `chat-slide-in-right .45s ease ${delay}ms both` }
          : { animation: `chat-slide-in .45s ease ${delay}ms both` }
      }
    >
      <p className={`text-xs font-mono mb-1 ${isAi ? 'text-teal-500' : 'text-zinc-500'}`}>
        {isAi ? 'Assistant' : 'You'}
      </p>
      <p className="text-zinc-300 text-sm leading-relaxed">{text}</p>
    </div>
  );
}

export function AIDemoSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-10 items-center">

          {/* ── Code block ── */}
          <div className="glass-card rounded-2xl p-8 card-border-glow"
               style={{ animation: 'section-reveal .6s ease both' }}>
            {/* traffic lights */}
            <div className="flex items-center gap-2 mb-5">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="ml-3 font-mono text-xs text-zinc-500">processData.js</span>
            </div>

            <div className="code-block rounded-xl p-5 font-mono text-sm">
              {/* line 1 */}
              <div style={{ animation: 'code-line-sweep .4s ease 100ms both' }}>
                <T c="#818cf8" d={120}>async</T>
                <T c="#818cf8" d={160}> function</T>
                <T c="#2dd4bf" d={200}> processData</T>
                <T c="#a1a1aa" d={230}>()</T>
                <T c="#71717a" d={250}> {'{'}</T>
              </div>

              {/* line 2 */}
              <div style={{ animation: 'code-line-sweep .4s ease 380ms both' }}>
                <span className="select-none">{'  '}</span>
                <T c="#818cf8" d={400}>const</T>
                <T c="#a1a1aa" d={440}> data </T>
                <T c="#71717a" d={470}>=</T>
                <T c="#818cf8" d={500}> await</T>
                <T c="#14b8a6" d={540}> fetch</T>
                <T c="#a1a1aa" d={570}>(</T>
                <T c="#34d399" d={600}>'/api'</T>
                <T c="#a1a1aa" d={630}>)</T>
              </div>

              {/* line 3 */}
              <div style={{ animation: 'code-line-sweep .4s ease 680ms both' }}>
                <span className="select-none">{'  '}</span>
                <T c="#818cf8" d={700}>return</T>
                <T c="#a1a1aa" d={740}> data</T>
                <T c="#71717a" d={770}>.</T>
                <T c="#06b6d4" d={800}>json</T>
                <T c="#a1a1aa" d={830}>()</T>
              </div>

              {/* line 4 */}
              <div style={{ animation: 'code-line-sweep .4s ease 920ms both' }}>
                <T c="#71717a" d={940}>{'}'}</T>
              </div>
            </div>

            {/* AI summary pill */}
            <div className="mt-4 flex items-start gap-2 px-3 py-2 rounded-lg text-xs"
                 style={{ background:'rgba(20,184,166,.08)', border:'1px solid rgba(20,184,166,.18)',
                          animation: 'chat-slide-in .5s ease 1.1s both' }}>
              <Wand2 className="w-3.5 h-3.5 text-teal-400 mt-0.5 flex-shrink-0 spin-slow" />
              <p className="text-zinc-400 leading-relaxed">
                <span className="text-teal-400 font-semibold">AI summary: </span>
                Async data fetcher — calls <code className="text-teal-300">/api</code> and returns parsed JSON.
              </p>
            </div>
          </div>

          {/* ── Chat messages ── */}
          <div style={{ animation: 'section-reveal .6s ease .15s both' }}>
            <p className="text-xs font-semibold text-teal-500 tracking-widest uppercase mb-3 font-mono">AI-Powered Chat</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Understand Any Code<br />
              <span className="shimmer-text">Instantly</span>
            </h2>

            <div className="space-y-3">
              <ChatMsg from="you" text="What does this function do?" delay={300} />
              <ChatMsg from="ai"
                text={<>This async function fetches data from <code className="text-teal-400 text-xs">/api</code> and
                  returns it as JSON. Perfect for loading remote data asynchronously.</>}
                delay={500} />
              <ChatMsg from="you" text="How can I make it more robust?" delay={700} />
              <ChatMsg from="ai"
                text={<>Add <code className="text-teal-400 text-xs">try/catch</code> for error handling, implement
                  response caching, and add a timeout via <code className="text-teal-400 text-xs">AbortController</code> for better reliability.</>}
                delay={900} />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
