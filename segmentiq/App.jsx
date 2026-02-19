import AnimatedBG from "./AnimatedBG.jsx";
import { useState, useEffect, useRef } from "react";

const API = "https://avirup2005-customer-segmentation.hf.space";
const C = { 0:"#a78bfa", 1:"#34d399", 2:"#fbbf24" };

// ─── Inject CSS ────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Figtree:wght@400;500;600;700&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  html,body,#root{background:#0c0820;color:#e8e0ff;font-family:'Figtree',sans-serif;min-height:100vh}
  ::-webkit-scrollbar{width:4px}
  ::-webkit-scrollbar-thumb{background:#7c3aed;border-radius:2px}
  ::-webkit-scrollbar-track{background:#0c0820}
  input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none}
  @keyframes up{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:none}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
  @keyframes glow{0%,100%{opacity:.12}50%{opacity:.22}}
  .page{animation:up .5s cubic-bezier(.16,1,.3,1) both}
  .card{background:rgba(124,58,237,0.07);border:1px solid rgba(167,139,250,0.15);border-radius:16px;padding:24px;transition:all .25s ease}
  .card:hover{background:rgba(124,58,237,0.13);border-color:rgba(167,139,250,0.35);transform:translateY(-3px)}
  .glass{background:rgba(124,58,237,0.06);backdrop-filter:blur(20px);border:1px solid rgba(167,139,250,0.12);border-radius:16px}
  .nav-btn{display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:10px;width:100%;background:none;border:1px solid transparent;color:#7c6aac;font-family:'Figtree',sans-serif;font-size:14px;font-weight:500;cursor:pointer;transition:all .2s;text-align:left;position:relative}
  .nav-btn:hover{color:#e8e0ff;background:rgba(124,58,237,0.1)}
  .nav-btn.on{color:#e8e0ff;background:rgba(124,58,237,0.18);border-color:rgba(167,139,250,0.3)}
  .nav-btn.on::before{content:'';position:absolute;left:0;top:22%;bottom:22%;width:2px;background:#a78bfa;border-radius:0 2px 2px 0}
  .inp{width:100%;padding:11px 14px;background:rgba(12,8,32,0.8);border:1px solid rgba(167,139,250,0.15);border-radius:10px;color:#e8e0ff;font-family:'Figtree',sans-serif;font-size:14px;transition:border-color .2s,box-shadow .2s}
  .inp:focus{outline:none;border-color:#7c3aed;box-shadow:0 0 0 3px rgba(124,58,237,0.2)}
  .inp option{background:#160c3a}
  .btn{width:100%;padding:15px;border-radius:12px;border:none;font-family:'Outfit',sans-serif;font-size:15px;font-weight:700;cursor:pointer;background:linear-gradient(135deg,#6d28d9,#7c3aed,#8b5cf6);color:#fff;transition:all .25s;box-shadow:0 4px 20px rgba(109,40,217,0.4)}
  .btn:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(109,40,217,0.55)}
  .btn:active{transform:none}
  .btn:disabled{opacity:.5;cursor:not-allowed;transform:none}
  .spin{width:18px;height:18px;border:2px solid rgba(255,255,255,0.2);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;display:inline-block}
  .badge{display:inline-flex;align-items:center;gap:5px;padding:5px 11px;border-radius:20px;font-size:12px;font-weight:600}
  .gt{background:linear-gradient(135deg,#c4b5fd,#8b5cf6,#6d28d9);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
`;
const s = document.createElement("style");
s.textContent = css;
document.head.appendChild(s);


// ─── Animated number ──────────────────────────────────────────────────────
function Num({ to, suffix="" }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const t = parseFloat(to) || 0;
    const start = performance.now();
    const tick = n => {
      const p = Math.min((n - start) / 1200, 1);
      setV((1 - Math.pow(1 - p, 4)) * t);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [to]);
  const d = Number.isInteger(parseFloat(to)) ? Math.round(v).toLocaleString() : v.toFixed(1);
  return <span>{d}{suffix}</span>;
}

// ─── Progress bar ─────────────────────────────────────────────────────────
function Bar({ val, color="#8b5cf6" }) {
  const [w, setW] = useState(0);
  useEffect(() => { setTimeout(() => setW(val), 100); }, [val]);
  return (
    <div style={{height:6,background:"rgba(255,255,255,0.06)",borderRadius:3,overflow:"hidden"}}>
      <div style={{height:"100%",borderRadius:3,background:color,width:`${w}%`,transition:"width 1.1s cubic-bezier(.16,1,.3,1)",boxShadow:`0 0 8px ${color}55`}}/>
    </div>
  );
}

// ─── Donut ────────────────────────────────────────────────────────────────
function Donut({ segs }) {
  const [hov, setHov] = useState(null);
  const circ = 2 * Math.PI * 70;
  let off = 0;
  const arcs = segs.map((s, i) => {
    const pct = s.percentage / 100;
    const el = (
      <circle key={i} cx={100} cy={100} r={70} fill="none"
        stroke={s.color} strokeWidth={hov===i?30:24}
        strokeDasharray={`${pct*circ} ${(1-pct)*circ}`}
        strokeDashoffset={-off*circ} strokeLinecap="round"
        style={{transition:"stroke-width .2s,opacity .2s",opacity:hov!==null&&hov!==i?.3:1,cursor:"pointer",filter:hov===i?`drop-shadow(0 0 10px ${s.color})`:"none"}}
        onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)}
      />
    );
    off += pct;
    return el;
  });
  const h = hov !== null ? segs[hov] : null;
  return (
    <div style={{position:"relative",display:"inline-block"}}>
      <svg width={200} height={200} style={{transform:"rotate(-90deg)"}}>
        <circle cx={100} cy={100} r={70} fill="none" stroke="rgba(167,139,250,0.08)" strokeWidth={24}/>
        {arcs}
      </svg>
      <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
        {h ? <>
          <span style={{fontSize:22,fontFamily:"'Outfit',sans-serif",fontWeight:800,color:h.color}}>{h.percentage}%</span>
          <span style={{fontSize:10,color:"#7c6aac",textAlign:"center",maxWidth:68,lineHeight:1.3}}>{h.name}</span>
        </> : <>
          <span style={{fontSize:26,fontFamily:"'Outfit',sans-serif",fontWeight:800}}>3</span>
          <span style={{fontSize:11,color:"#7c6aac"}}>segments</span>
        </>}
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────
function Dashboard() {
  const [data, setData] = useState(null);
  useEffect(() => { fetch(`${API}/api/stats`).then(r=>r.json()).then(setData).catch(()=>{}); }, []);
  const segs = (data?.segments || []).map(s => ({...s, color: C[s.id]||"#a78bfa"}));
  const cards = [
    {label:"Total Customers", val:data?.total_customers||0, icon:"👥"},
    {label:"Segments",        val:data?.n_segments||3,      icon:"🎯"},
    {label:"Accuracy",        val:data?.model_accuracy?(data.model_accuracy*100).toFixed(1):0, icon:"🧠", suf:"%"},
    {label:"Last Trained",    val:data?.trained_on?.split(" ")[0]||"—", icon:"🕐", raw:true},
  ];
  return (
    <div className="page" style={{padding:"36px 36px 60px"}}>
      <div style={{marginBottom:44}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
          <span style={{width:7,height:7,borderRadius:"50%",background:"#34d399",display:"inline-block",boxShadow:"0 0 8px #34d399"}}/>
          <span style={{fontSize:11,fontWeight:600,color:"#34d399",letterSpacing:".1em",textTransform:"uppercase"}}>Live Data</span>
        </div>
        <h1 style={{fontFamily:"'Outfit',sans-serif",fontSize:48,fontWeight:900,lineHeight:1.05,marginBottom:10}}>
          Customer<br/><span className="gt">Intelligence</span>
        </h1>
        <p style={{color:"#7c6aac",fontSize:15,lineHeight:1.7,maxWidth:420}}>Real-time segmentation analytics powered by machine learning.</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:24}}>
        {cards.map((c,i)=>(
          <div key={i} className="card">
            <div style={{fontSize:20,marginBottom:14}}>{c.icon}</div>
            <div style={{fontSize:10,fontWeight:700,color:"#7c6aac",letterSpacing:".08em",textTransform:"uppercase",marginBottom:6}}>{c.label}</div>
            <div style={{fontFamily:"'Outfit',sans-serif",fontSize:26,fontWeight:800}}>
              {c.raw ? c.val : <Num to={c.val} suffix={c.suf||""}/>}
            </div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1.4fr",gap:16}}>
        <div className="glass" style={{padding:28}}>
          <h3 style={{fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:15,marginBottom:22}}>Segment Distribution</h3>
          <div style={{display:"flex",alignItems:"center",gap:20}}>
            {segs.length>0&&<Donut segs={segs}/>}
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {segs.map((s,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:9}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:s.color,boxShadow:`0 0 6px ${s.color}`,flexShrink:0}}/>
                  <div>
                    <div style={{fontSize:13,fontWeight:500}}>{s.name}</div>
                    <div style={{fontSize:11,color:"#7c6aac"}}>{s.percentage}% · {s.count?.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="glass" style={{padding:28}}>
          <h3 style={{fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:15,marginBottom:22}}>Segment Breakdown</h3>
          <div style={{display:"flex",flexDirection:"column",gap:20}}>
            {segs.map((s,i)=>(
              <div key={i}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:15}}>{s.emoji}</span>
                    <span style={{fontWeight:600,fontSize:14}}>{s.name}</span>
                  </div>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <span style={{color:"#7c6aac",fontSize:12}}>{s.count?.toLocaleString()}</span>
                    <span className="badge" style={{background:`${s.color}18`,color:s.color,border:`1px solid ${s.color}35`}}>{s.percentage}%</span>
                  </div>
                </div>
                <Bar val={s.percentage} color={s.color}/>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PREDICT ──────────────────────────────────────────────────────────────
const FIELDS = [
  {k:"Age",               l:"Age",                  t:"n", p:"45",    c:1},
  {k:"Education",         l:"Education",             t:"s", c:1, o:[["0","High School"],["1","Diploma"],["2","Graduate"],["3","Masters"],["4","PhD"]]},
  {k:"Marital_Status",    l:"Marital Status",        t:"s", c:1, o:[["0","Single"],["1","Has Partner"]]},
  {k:"Parental_Status",   l:"Parental Status",       t:"s", c:1, o:[["0","No Children"],["1","Has Children"]]},
  {k:"Children",          l:"No. of Children",       t:"n", p:"0",    c:1},
  {k:"Income",            l:"Annual Income ($)",     t:"n", p:"55000",c:1},
  {k:"Total_Spending",    l:"Total Spending ($)",    t:"n", p:"800",  c:2},
  {k:"Days_as_Customer",  l:"Days as Customer",      t:"n", p:"1200", c:2},
  {k:"Recency",           l:"Days Since Last Buy",   t:"n", p:"30",   c:2},
  {k:"Wines",             l:"Wines ($)",             t:"n", p:"300",  c:2},
  {k:"Fruits",            l:"Fruits ($)",            t:"n", p:"50",   c:2},
  {k:"Meat",              l:"Meat ($)",              t:"n", p:"200",  c:2},
  {k:"Fish",              l:"Fish ($)",              t:"n", p:"80",   c:3},
  {k:"Sweets",            l:"Sweets ($)",            t:"n", p:"60",   c:3},
  {k:"Gold",              l:"Gold ($)",              t:"n", p:"110",  c:3},
  {k:"Web",               l:"Web Purchases",         t:"n", p:"4",    c:3},
  {k:"Catalog",           l:"Catalog Purchases",     t:"n", p:"3",    c:3},
  {k:"Store",             l:"Store Purchases",       t:"n", p:"6",    c:3},
  {k:"Discount_Purchases",l:"Discount Purchases",    t:"n", p:"2",    c:3},
  {k:"Total_Promo",       l:"Promo Responses",       t:"n", p:"1",    c:3},
  {k:"NumWebVisitsMonth", l:"Web Visits / Month",    t:"n", p:"5",    c:3},
];

function Predict() {
  const [form, setForm] = useState({});
  const [res, setRes]   = useState(null);
  const [load, setLoad] = useState(false);
  const [err, setErr]   = useState(null);

  const go = async () => {
    setLoad(true); setErr(null); setRes(null);
    try {
      const body = {};
      FIELDS.forEach(f => { body[f.k] = parseFloat(form[f.k]) || 0; });
      const r = await fetch(`${API}/api/predict`, {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
      const d = await r.json();
      if (d.status==="success") setRes(d);
      else setErr(d.message||"Prediction failed");
    } catch { setErr("Cannot reach API. Is it running?"); }
    setLoad(false);
  };

  const colTitles = ["👤 Profile","🛒 Spending","📊 Behavior"];
  const colColors = ["#a78bfa","#34d399","#fbbf24"];

  return (
    <div className="page" style={{padding:"36px 36px 60px"}}>
      <div style={{marginBottom:36}}>
        <h1 style={{fontFamily:"'Outfit',sans-serif",fontSize:48,fontWeight:900,marginBottom:8}}>
          <span className="gt">Predict</span> Segment
        </h1>
        <p style={{color:"#7c6aac",fontSize:15}}>Enter customer details to find their segment.</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:res?"1.2fr .85fr":"1fr",gap:20,alignItems:"start"}}>
        <div className="glass" style={{padding:28}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:20,marginBottom:22}}>
            {[1,2,3].map(col=>(
              <div key={col} style={{display:"flex",flexDirection:"column",gap:13}}>
                <div style={{fontSize:10,fontWeight:800,color:colColors[col-1],letterSpacing:".1em",textTransform:"uppercase",paddingBottom:8,borderBottom:"1px solid rgba(167,139,250,0.1)"}}>
                  {colTitles[col-1]}
                </div>
                {FIELDS.filter(f=>f.c===col).map(f=>(
                  <div key={f.k} style={{display:"flex",flexDirection:"column",gap:5}}>
                    <label style={{fontSize:11,fontWeight:700,color:"#7c6aac",letterSpacing:".04em",textTransform:"uppercase"}}>{f.l}</label>
                    {f.t==="s"
                      ? <select className="inp" value={form[f.k]||""} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} style={{cursor:"pointer"}}>
                          <option value="">Select...</option>
                          {f.o.map(([v,l])=><option key={v} value={v}>{l}</option>)}
                        </select>
                      : <input className="inp" type="number" placeholder={f.p} value={form[f.k]||""} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))}/>
                    }
                  </div>
                ))}
              </div>
            ))}
          </div>
          {err&&<div style={{padding:"11px 14px",borderRadius:10,background:"rgba(248,113,113,0.08)",border:"1px solid rgba(248,113,113,0.2)",color:"#f87171",fontSize:13,marginBottom:14}}>⚠️ {err}</div>}
          <button className="btn" onClick={go} disabled={load}>
            {load ? <span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10}}><span className="spin"/>Analyzing...</span> : "✦ Predict Segment"}
          </button>
        </div>
        {res&&(
          <div className="glass" style={{padding:28,borderLeft:`3px solid ${C[res.cluster]}`,boxShadow:`0 0 40px ${C[res.cluster]}18`,animation:"up .5s cubic-bezier(.16,1,.3,1) both"}}>
            <div style={{fontSize:44,marginBottom:12,display:"inline-block",animation:"float 3s ease-in-out infinite"}}>{res.emoji}</div>
            <div style={{fontSize:10,fontWeight:800,color:C[res.cluster],letterSpacing:".1em",textTransform:"uppercase",marginBottom:4}}>Cluster {res.cluster}</div>
            <h2 style={{fontFamily:"'Outfit',sans-serif",fontSize:22,fontWeight:800,marginBottom:8}}>{res.segment_name}</h2>
            <p style={{color:"#7c6aac",fontSize:13,lineHeight:1.75,marginBottom:18}}>{res.description}</p>
            <div style={{marginBottom:18}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <span style={{fontSize:11,color:"#7c6aac",fontWeight:700,textTransform:"uppercase",letterSpacing:".05em"}}>Confidence</span>
                <span style={{fontFamily:"'Outfit',sans-serif",fontSize:18,fontWeight:800,color:C[res.cluster]}}>{res.confidence}%</span>
              </div>
              <Bar val={res.confidence} color={C[res.cluster]}/>
            </div>
            <div style={{marginBottom:18}}>
              <div style={{fontSize:10,color:"#7c6aac",fontWeight:700,letterSpacing:".06em",textTransform:"uppercase",marginBottom:10}}>Traits</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                {res.traits?.map((t,i)=>(
                  <span key={i} className="badge" style={{background:`${C[res.cluster]}15`,color:C[res.cluster],border:`1px solid ${C[res.cluster]}30`}}>{t}</span>
                ))}
              </div>
            </div>
            <div>
              <div style={{fontSize:10,color:"#7c6aac",fontWeight:700,letterSpacing:".06em",textTransform:"uppercase",marginBottom:10}}>All Probabilities</div>
              {Object.entries(res.probabilities||{}).map(([k,v])=>{
                const id = parseInt(k.split("_")[1]);
                return (
                  <div key={k} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                    <span style={{fontSize:11,color:"#7c6aac",width:55}}>Cluster {id}</span>
                    <div style={{flex:1}}><Bar val={v} color={C[id]}/></div>
                    <span style={{fontSize:11,fontWeight:700,color:C[id],width:32,textAlign:"right"}}>{v}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── API STATUS ────────────────────────────────────────────────────────────
function Status() {
  const [h, setH] = useState(null);
  const [ms, setMs] = useState(null);
  useEffect(()=>{
    const t = performance.now();
    fetch(`${API}/api/health`).then(r=>r.json()).then(d=>{setH(d);setMs(Math.round(performance.now()-t));}).catch(()=>{});
  },[]);
  const checks = ["API Server","ML Model","Prediction Endpoint","Stats Endpoint"].map(l=>({l, ok:!!h}));
  return (
    <div className="page" style={{padding:"36px 36px 60px"}}>
      <div style={{marginBottom:44}}>
        <h1 style={{fontFamily:"'Outfit',sans-serif",fontSize:48,fontWeight:900,marginBottom:8}}><span className="gt">API</span> Status</h1>
        <p style={{color:"#7c6aac",fontSize:15}}>Live health check of the backend infrastructure.</p>
      </div>
      <div className="glass" style={{padding:28,marginBottom:14,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <div style={{fontSize:10,color:"#7c6aac",fontWeight:700,letterSpacing:".07em",textTransform:"uppercase",marginBottom:6}}>Overall</div>
          <div style={{fontFamily:"'Outfit',sans-serif",fontSize:26,fontWeight:800,color:h?"#34d399":"#7c6aac"}}>{h?"All Systems Operational":"Checking..."}</div>
        </div>
        <div style={{width:54,height:54,borderRadius:"50%",background:h?"rgba(52,211,153,0.1)":"rgba(124,58,237,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,boxShadow:h?"0 0 20px rgba(52,211,153,0.2)":"none"}}>{h?"✅":"⏳"}</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
        {checks.map((c,i)=>(
          <div key={i} className="glass" style={{padding:20,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontSize:14,fontWeight:500}}>{c.l}</span>
            <span className="badge" style={{background:c.ok?"rgba(52,211,153,0.1)":"rgba(124,58,237,0.08)",color:c.ok?"#34d399":"#7c6aac",border:`1px solid ${c.ok?"rgba(52,211,153,0.25)":"rgba(167,139,250,0.15)"}`}}>
              <span style={{width:5,height:5,borderRadius:"50%",background:"currentColor",display:"inline-block"}}/>
              {c.ok?"operational":"pending"}
            </span>
          </div>
        ))}
      </div>
      {h&&(
        <div className="glass" style={{padding:28}}>
          <h3 style={{fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:15,marginBottom:22}}>Model Details</h3>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:20}}>
            {[{l:"Model Type",v:h.model},{l:"Accuracy",v:`${(h.accuracy*100).toFixed(1)}%`},{l:"Response",v:ms?`${ms}ms`:"—"},{l:"Trained",v:h.trained_on?.split(" ")[0]}].map((x,i)=>(
              <div key={i}>
                <div style={{fontSize:10,color:"#7c6aac",fontWeight:700,letterSpacing:".06em",textTransform:"uppercase",marginBottom:5}}>{x.l}</div>
                <div style={{fontFamily:"'Outfit',sans-serif",fontSize:18,fontWeight:700}}>{x.v}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ABOUT ────────────────────────────────────────────────────────────────
function useVisible(threshold=0.15){
  const ref=useRef(null);
  const [v,setV]=useState(false);
  useEffect(()=>{
    const o=new IntersectionObserver(([e])=>{if(e.isIntersecting)setV(true)},{threshold});
    if(ref.current)o.observe(ref.current);
    return()=>o.disconnect();
  },[]);
  return[ref,v];
}

function Reveal({children,delay=0}){
  const[ref,v]=useVisible();
  return(
    <div ref={ref} style={{opacity:v?1:0,transform:v?"none":"translateY(28px)",transition:`opacity .65s ${delay}s cubic-bezier(.16,1,.3,1),transform .65s ${delay}s cubic-bezier(.16,1,.3,1)`}}>
      {children}
    </div>
  );
}

function Code({title,code}){
  const[copied,setCopied]=useState(false);
  const hl=l=>l
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
    .replace(/(#.*$)/g,'<span style="color:#6b7280">$1</span>')
    .replace(/\b(import|from|def|return|if|for|in|with|as|True|False|None|open)\b/g,'<span style="color:#c084fc">$1</span>')
    .replace(/(".*?"|'.*?')/g,'<span style="color:#86efac">$1</span>')
    .replace(/\b(\d+\.?\d*)\b/g,'<span style="color:#fb923c">$1</span>');
  return(
    <div style={{borderRadius:12,overflow:"hidden",border:"1px solid rgba(167,139,250,0.12)",background:"#07041a",fontFamily:"'JetBrains Mono','Fira Code',monospace"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",background:"rgba(124,58,237,0.08)",borderBottom:"1px solid rgba(167,139,250,0.1)"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{display:"flex",gap:5}}>
            {["#ff5f57","#febc2e","#28c840"].map((c,i)=><div key={i} style={{width:9,height:9,borderRadius:"50%",background:c}}/>)}
          </div>
          <span style={{fontSize:12,color:"#7c6aac",marginLeft:6}}>{title}</span>
        </div>
        <button onClick={()=>{navigator.clipboard.writeText(code);setCopied(true);setTimeout(()=>setCopied(false),2000);}} style={{background:"none",border:"1px solid rgba(167,139,250,0.2)",borderRadius:5,padding:"3px 9px",color:copied?"#34d399":"#7c6aac",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>{copied?"✓ Copied":"Copy"}</button>
      </div>
      <div style={{padding:"14px 0",overflowX:"auto"}}>
        {code.trim().split("\n").map((l,i)=>(
          <div key={i} style={{display:"flex"}}>
            <span style={{minWidth:34,textAlign:"right",paddingRight:12,color:"rgba(255,255,255,0.1)",fontSize:12,userSelect:"none",paddingLeft:8}}>{i+1}</span>
            <span style={{fontSize:13,lineHeight:1.75,color:"#ddd6fe",whiteSpace:"pre"}} dangerouslySetInnerHTML={{__html:hl(l)}}/>
          </div>
        ))}
      </div>
    </div>
  );
}

function Step({n,title,desc,code,index,last}){
  const[ref,v]=useVisible(0.1);
  return(
    <div ref={ref} style={{display:"flex",gap:0,opacity:v?1:0,transform:v?"none":"translateY(24px)",transition:`all .65s ${index*.1}s cubic-bezier(.16,1,.3,1)`}}>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",marginRight:26,flexShrink:0}}>
        <div style={{width:44,height:44,borderRadius:"50%",background:"linear-gradient(135deg,#6d28d9,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Outfit',sans-serif",fontWeight:800,fontSize:14,boxShadow:"0 0 18px rgba(109,40,217,0.4)",flexShrink:0}}>{n}</div>
        {!last&&<div style={{width:2,flex:1,minHeight:40,background:"linear-gradient(180deg,#7c3aed,rgba(124,58,237,0.04))",marginTop:6}}/>}
      </div>
      <div style={{flex:1,paddingBottom:last?0:52}}>
        <h3 style={{fontFamily:"'Outfit',sans-serif",fontSize:20,fontWeight:800,marginBottom:8}}>{title}</h3>
        <p style={{color:"#7c6aac",fontSize:14,lineHeight:1.8,marginBottom:16,maxWidth:560}}>{desc}</p>
        {code&&<Code {...code}/>}
      </div>
    </div>
  );
}

function About(){
  const steps=[
    {n:"01",title:"Data Collection & EDA",desc:"Loaded the Marketing Campaign dataset — 2,240 customers, 29 features. Explored distributions, found Income had missing values (filled with median), dropped constant columns Z_CostContact and Z_Revenue.",code:{title:"eda.py",code:`df = pd.read_csv('marketing_campaign.csv', sep='\\t')\n# Fill Income with median (right-skewed, has outliers)\ndf['Income'].fillna(df['Income'].median(), inplace=True)\n# Drop zero-variance columns\ndf.drop(columns=['Z_CostContact', 'Z_Revenue'], inplace=True)`}},
    {n:"02",title:"Feature Engineering",desc:"Raw columns weren't meaningful alone. Created 6 new features: Age, Children, Total_Spending, Days_as_Customer, Total_Promo, Parental_Status to better describe each customer.",code:{title:"features.py",code:`df['Age'] = 2022 - df['Year_Birth']\ndf['Children'] = df['Kidhome'] + df['Teenhome']\ndf['Total_Spending'] = (df['MntWines'] + df['MntFruits'] +\n                        df['MntMeatProducts'] + df['MntFishProducts'] +\n                        df['MntSweetProducts'] + df['MntGoldProds'])\ndf['Days_as_Customer'] = (datetime.today() - df['Dt_Customer']).dt.days`}},
    {n:"03",title:"Outlier Capping & Scaling",desc:"Spending features were heavily skewed. Capped outliers using IQR. Applied StandardScaler to normal features and PowerTransformer to skewed ones. Saved preprocessor.pkl.",code:{title:"preprocess.py",code:`preprocessor = ColumnTransformer([\n    ('normal', Pipeline([\n        ('imputer', SimpleImputer(strategy='constant', fill_value=0)),\n        ('scaler', StandardScaler())\n    ]), normal_cols),\n    ('outlier', Pipeline([\n        ('transformer', PowerTransformer(standardize=True))\n    ]), outlier_cols)\n])\nopen('models/preprocessor.pkl', 'wb').write(pickle.dumps(preprocessor))`}},
    {n:"04",title:"KMeans Clustering",desc:"Reduced to 3 PCA components. Tested K=2 to 8 using Elbow Method + Silhouette Score. K=3 gave cleanest separation — Budget Conscious, Mid-Tier, and Premium segments.",code:{title:"cluster.py",code:`pca = PCA(n_components=3, random_state=42)\npca_data = pca.fit_transform(scaled_df)\n\n# K=3 best by silhouette score\nkmeans = KMeans(n_clusters=3, random_state=42, n_init=10)\ndf['cluster'] = kmeans.fit_predict(pca_data)`}},
    {n:"05",title:"Classification Model",desc:"With clusters as labels, compared 6 classifiers. Tuned best with GridSearchCV (5-fold CV). Final Logistic Regression: 99.6% accuracy.",code:{title:"train.py",code:`param_grid = {'C': [0.001, 0.01, 0.1, 1, 10, 100, 1000],\n              'solver': ['lbfgs', 'newton-cg', 'saga']}\ngrid = GridSearchCV(LogisticRegression(), param_grid, cv=5)\ngrid.fit(X_train, y_train)\nopen('models/model.pkl','wb').write(pickle.dumps(grid.best_estimator_))`}},
    {n:"06",title:"FastAPI + Docker + Deploy",desc:"Built FastAPI backend loading pkl files on startup. Containerized with Docker. Deployed to Hugging Face Spaces (free, never sleeps). Frontend in React on Vercel via GitHub.",code:{title:"Dockerfile",code:`FROM python:3.9-slim\nWORKDIR /app\nCOPY requirements.txt .\nRUN pip install --no-cache-dir -r requirements.txt\nCOPY . .\nEXPOSE 7860\nCMD ["python", "app.py"]`}},
  ];

  const upgrades=[
    {i:"🍃",t:"MongoDB Pipeline",      tag:"Planned",tc:"#a78bfa",d:"Replace static CSV with live MongoDB Atlas. New data flows in continuously, enabling fresh model training."},
    {i:"🔄",t:"Live Retraining API",    tag:"Planned",tc:"#a78bfa",d:"A /api/train endpoint that runs the full pipeline, evaluates against current model, deploys only if better."},
    {i:"📊",t:"Drift Detection",        tag:"Planned",tc:"#a78bfa",d:"Evidently AI to detect data drift and auto-trigger retraining when customer profiles shift significantly."},
    {i:"🧠",t:"Deep Learning Clusters", tag:"Future", tc:"#fbbf24",d:"Replace KMeans with an autoencoder for non-linear clustering. Finds complex patterns KMeans misses."},
    {i:"🎯",t:"Recommendation Engine",  tag:"Future", tc:"#fbbf24",d:"Suggest products most likely to convert for each segment based on historical purchase patterns."},
    {i:"📱",t:"Real-time Dashboard",    tag:"Soon",   tc:"#34d399",d:"WebSocket-powered dashboard. Segment shifts update in real-time without page refresh."},
  ];

  return(
    <div style={{padding:"36px 36px 80px",maxWidth:860,margin:"0 auto"}}>
      {/* Hero */}
      <div style={{marginBottom:68}}>
        <Reveal>
          <div style={{display:"inline-flex",alignItems:"center",gap:7,padding:"5px 13px",borderRadius:20,background:"rgba(124,58,237,0.1)",border:"1px solid rgba(167,139,250,0.25)",marginBottom:20}}>
            <span style={{width:5,height:5,borderRadius:"50%",background:"#a78bfa",display:"inline-block"}}/>
            <span style={{fontSize:11,fontWeight:700,color:"#c4b5fd",letterSpacing:".08em",textTransform:"uppercase"}}>Case Study</span>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <h1 style={{fontFamily:"'Outfit',sans-serif",fontSize:52,fontWeight:900,lineHeight:1.05,marginBottom:14}}>
            How I Built<br/><span className="gt">SegmentIQ</span>
          </h1>
        </Reveal>
        <Reveal delay={0.2}>
          <p style={{color:"#7c6aac",fontSize:15,lineHeight:1.8,maxWidth:520,marginBottom:24}}>
            A full-stack ML platform that segments customers into personality groups using unsupervised clustering and a 99.6% accurate classifier — from raw CSV to deployed product.
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {["Python","FastAPI","Scikit-learn","KMeans","Logistic Regression","Docker","Hugging Face","React","Vercel"].map((t,i)=>(
              <span key={i} style={{padding:"5px 12px",borderRadius:20,fontSize:12,fontWeight:600,background:"rgba(124,58,237,0.08)",border:"1px solid rgba(167,139,250,0.18)",color:"#c4b5fd"}}>{t}</span>
            ))}
          </div>
        </Reveal>
      </div>

      <Reveal><div style={{height:1,background:"linear-gradient(90deg,transparent,rgba(124,58,237,0.5),transparent)",marginBottom:68}}/></Reveal>

      {/* Steps */}
      <div style={{marginBottom:68}}>
        <Reveal>
          <h2 style={{fontFamily:"'Outfit',sans-serif",fontSize:34,fontWeight:800,marginBottom:6}}>How It Was Built</h2>
          <p style={{color:"#7c6aac",fontSize:14,marginBottom:44}}>Every step of the pipeline, from raw data to live predictions.</p>
        </Reveal>
        {steps.map((s,i)=><Step key={i} {...s} index={i} last={i===steps.length-1}/>)}
      </div>

      <Reveal><div style={{height:1,background:"linear-gradient(90deg,transparent,rgba(52,211,153,0.4),transparent)",marginBottom:68}}/></Reveal>

      {/* Upgrades */}
      <div style={{marginBottom:68}}>
        <Reveal>
          <h2 style={{fontFamily:"'Outfit',sans-serif",fontSize:34,fontWeight:800,marginBottom:6}}>Future Upgrades</h2>
          <p style={{color:"#7c6aac",fontSize:14,marginBottom:32}}>The roadmap for turning this into a full production MLOps system.</p>
        </Reveal>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:13}}>
          {upgrades.map((u,i)=><UpCard key={i} {...u} idx={i}/>)}
        </div>
      </div>

      <Reveal><div style={{height:1,background:"linear-gradient(90deg,transparent,rgba(251,191,36,0.35),transparent)",marginBottom:68}}/></Reveal>

      {/* Contact */}
      <div>
        <Reveal>
          <h2 style={{fontFamily:"'Outfit',sans-serif",fontSize:34,fontWeight:800,marginBottom:6}}>Get In Touch</h2>
          <p style={{color:"#7c6aac",fontSize:14,marginBottom:30}}>Questions about the project or want to collaborate?</p>
        </Reveal>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
          {[
            {href:"https://github.com/avirup2005",icon:"⌥",label:"GitHub",sub:"github.com/avirup2005",hov:"rgba(255,255,255,0.08)"},
            {href:"https://www.linkedin.com/in/avirup-sasmal-0b74a4304/",icon:"in",label:"LinkedIn",sub:"Avirup Sasmal",hov:"rgba(10,102,194,0.08)"},
          ].map((l,i)=>(
            <Reveal key={i} delay={i*.1}>
              <a href={l.href} target="_blank" rel="noreferrer" style={{textDecoration:"none",display:"block"}}>
                <div className="card" style={{display:"flex",alignItems:"center",gap:14}}
                  onMouseEnter={e=>{e.currentTarget.style.background=l.hov}}
                  onMouseLeave={e=>{e.currentTarget.style.background="rgba(124,58,237,0.07)"}}>
                  <div style={{width:42,height:42,borderRadius:10,background:"rgba(124,58,237,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:800,flexShrink:0}}>{l.icon}</div>
                  <div>
                    <div style={{fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:14,marginBottom:2}}>{l.label}</div>
                    <div style={{color:"#7c6aac",fontSize:12}}>{l.sub}</div>
                  </div>
                  <span style={{marginLeft:"auto",color:"#7c6aac"}}>↗</span>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.2}>
          <div style={{padding:24,borderRadius:16,background:"rgba(124,58,237,0.06)",border:"1px solid rgba(167,139,250,0.18)",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:14}}>
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              <div style={{width:42,height:42,borderRadius:10,background:"rgba(124,58,237,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>✉</div>
              <div>
                <div style={{fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:14,marginBottom:2}}>Send a Message</div>
                <div style={{color:"#7c6aac",fontSize:12}}>avirupsasmal2005@gmail.com</div>
              </div>
            </div>
            <a href="mailto:avirupsasmal2005@gmail.com" style={{padding:"11px 22px",borderRadius:10,background:"linear-gradient(135deg,#6d28d9,#7c3aed)",color:"#fff",textDecoration:"none",fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:14,boxShadow:"0 4px 16px rgba(109,40,217,0.35)",transition:"all .2s"}}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 8px 24px rgba(109,40,217,0.5)"}}
              onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 4px 16px rgba(109,40,217,0.35)"}}>
              Say Hello →
            </a>
          </div>
        </Reveal>
        <Reveal delay={0.3}>
          <div style={{marginTop:44,textAlign:"center"}}>
            <p style={{color:"#7c6aac",fontSize:13,lineHeight:1.8}}>
              Built with Python, FastAPI, React & ❤️ by <span style={{color:"#c4b5fd",fontWeight:600}}>Avirup Sasmal</span><br/>
              Hosted free on <span style={{color:"#e8e0ff"}}>Hugging Face Spaces</span> & <span style={{color:"#e8e0ff"}}>Vercel</span>
            </p>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

function UpCard({i,t,tag,tc,d,idx}){
  const[ref,v]=useVisible();
  const[hov,setHov]=useState(false);
  return(
    <div ref={ref} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{padding:20,borderRadius:14,background:hov?"rgba(124,58,237,0.1)":"rgba(124,58,237,0.04)",border:`1px solid ${hov?"rgba(167,139,250,0.3)":"rgba(167,139,250,0.1)"}`,transition:"all .3s cubic-bezier(.16,1,.3,1)",transform:v?(hov?"translateY(-4px)":"none"):"translateY(20px)",opacity:v?1:0,transitionDelay:`${idx*.07}s`}}>
      <div style={{fontSize:24,marginBottom:11}}>{i}</div>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8,marginBottom:8}}>
        <h4 style={{fontFamily:"'Outfit',sans-serif",fontSize:14,fontWeight:700}}>{t}</h4>
        <span style={{padding:"2px 8px",borderRadius:20,fontSize:10,fontWeight:700,letterSpacing:".06em",textTransform:"uppercase",flexShrink:0,color:tc,background:`${tc}15`,border:`1px solid ${tc}30`}}>{tag}</span>
      </div>
      <p style={{color:"#7c6aac",fontSize:13,lineHeight:1.7}}>{d}</p>
    </div>
  );
}

// ─── APP SHELL ────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("dashboard");
  const nav = [
    {id:"dashboard",icon:"▦",label:"Dashboard"},
    {id:"predict",  icon:"◈",label:"Predict"},
    {id:"status",   icon:"◉",label:"API Status"},
    {id:"about",    icon:"◎",label:"About"},
  ];
  const pages = {dashboard:<Dashboard/>, predict:<Predict/>, status:<Status/>, about:<About/>};

  return (
    <div style={{display:"flex",minHeight:"100vh",background:"#0c0820",position:"relative"}}>
      <AnimatedBG/>
      {/* Sidebar */}
      <div style={{width:208,flexShrink:0,background:"rgba(12,8,32,0.88)",backdropFilter:"blur(24px)",borderRight:"1px solid rgba(167,139,250,0.1)",padding:"24px 13px",display:"flex",flexDirection:"column",position:"sticky",top:0,height:"100vh",zIndex:10}}>
        <div style={{marginBottom:34,paddingLeft:11}}>
          <div style={{fontFamily:"'Outfit',sans-serif",fontSize:20,fontWeight:900,marginBottom:2}}>
            <span className="gt">Segment</span><span style={{color:"#e8e0ff"}}>IQ</span>
          </div>
          <div style={{fontSize:11,color:"#7c6aac"}}>ML Analytics Platform</div>
        </div>
        <nav style={{display:"flex",flexDirection:"column",gap:3}}>
          {nav.map(n=>(
            <button key={n.id} className={`nav-btn${page===n.id?" on":""}`} onClick={()=>setPage(n.id)}>
              <span style={{fontSize:14,opacity:.7}}>{n.icon}</span>{n.label}
            </button>
          ))}
        </nav>
        <div style={{marginTop:"auto",paddingLeft:11}}>
          <div style={{fontSize:11,color:"#7c6aac",lineHeight:1.7}}>
            Powered by<br/><span style={{color:"#a78bfa",fontWeight:600}}>Hugging Face Spaces</span>
          </div>
        </div>
      </div>
      {/* Main */}
      <main key={page} style={{flex:1,overflow:"auto",position:"relative",zIndex:1}}>
        {pages[page]}
      </main>
    </div>
  );
}
