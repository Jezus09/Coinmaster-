import { useState, useEffect, useRef, useCallback } from "react";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Lilita+One&display=swap');
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
body{background:#06001a;font-family:'Lilita One',cursive;overflow:hidden;}
#root{display:flex;justify-content:center;align-items:flex-start;min-height:100vh;background:#06001a;}
.app{width:100%;max-width:420px;min-height:100vh;background:#06001a;position:relative;overflow:hidden;display:flex;flex-direction:column;}

/* HUD */
.hud{display:flex;align-items:center;justify-content:space-between;padding:10px 14px 6px;background:linear-gradient(180deg,#1a0a3a,#06001a);border-bottom:2px solid #FFD600;}
.hud-block{display:flex;align-items:center;gap:6px;}
.hud-val{color:#FFD600;font-size:22px;text-shadow:0 0 8px #FFD600aa;}
.hud-label{color:#aaa;font-size:11px;}
.village-badge{background:linear-gradient(135deg,#FF6B00,#FFD600);color:#06001a;border-radius:20px;padding:3px 10px;font-size:13px;}

/* Bet selector */
.bet-row{display:flex;gap:8px;justify-content:center;padding:6px 0;}
.bet-btn{background:#1a0a3a;border:2px solid #FF6B00;color:#FFD600;border-radius:20px;padding:5px 18px;font-family:'Lilita One',cursive;font-size:14px;cursor:pointer;transition:all .15s;}
.bet-btn.active{background:linear-gradient(135deg,#FF6B00,#FFD600);color:#06001a;border-color:#FFD600;}

/* Slot cabinet */
.cabinet-wrap{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:8px 0;}
.cabinet{position:relative;width:340px;background:linear-gradient(145deg,#FF8C00,#FFD600,#FF6B00);border-radius:32px;padding:6px;box-shadow:0 0 30px #FF6B0066,0 8px 32px #000a;}
.cabinet-inner{background:linear-gradient(180deg,#0d0025,#06001a);border-radius:26px;padding:16px 12px 20px;}
.lights-ring{position:absolute;inset:0;border-radius:32px;pointer-events:none;}
.light{position:absolute;width:14px;height:14px;border-radius:50%;background:#FFD600;box-shadow:0 0 8px #FFD600;animation:lampRun 1.1s infinite;}
.reels-row{display:flex;gap:10px;justify-content:center;margin-bottom:16px;}
.reel{width:90px;height:90px;background:linear-gradient(180deg,#1a0535,#06001a);border:3px solid #FF6B00;border-radius:16px;display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative;}
.reel.spinning .reel-sym{animation:reelBlur .8s ease-out;}
.reel-sym{display:flex;align-items:center;justify-content:center;width:80px;height:80px;}
.spin-btn{display:block;margin:0 auto;width:110px;height:110px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#00ff6a,#00C853,#007a32);border:5px solid #FFD600;font-family:'Lilita One',cursive;font-size:22px;color:#fff;cursor:pointer;text-shadow:0 2px 4px #000a;box-shadow:0 0 0 4px #FFD60044,0 6px 20px #000a;animation:spinPulse 2s infinite;user-select:none;-webkit-user-select:none;}
.spin-btn:disabled{background:radial-gradient(circle at 35% 35%,#555,#333,#222);border-color:#555;animation:none;color:#888;}
.spin-btn.spinning-active{animation:none;transform:scale(0.95);}

/* Nav button */
.nav-btn{margin:0 auto 12px;display:block;background:linear-gradient(135deg,#FF6B00,#FFD600);border:none;border-radius:30px;padding:12px 48px;font-family:'Lilita One',cursive;font-size:18px;color:#06001a;cursor:pointer;box-shadow:0 4px 16px #FF6B0066;}

/* Toast */
.toast{position:fixed;top:16px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#FF6B00,#FFD600);color:#06001a;padding:10px 24px;border-radius:30px;font-size:16px;z-index:999;animation:toastIn .3s ease;white-space:nowrap;box-shadow:0 4px 20px #FF6B0099;}

/* Overlay / modals */
.overlay{position:fixed;inset:0;background:#000000cc;z-index:100;display:flex;align-items:center;justify-content:center;}
.modal{background:linear-gradient(180deg,#1a0535,#06001a);border:3px solid #FFD600;border-radius:24px;padding:24px;width:340px;max-width:92vw;text-align:center;}
.modal h2{color:#FFD600;font-size:24px;margin-bottom:16px;text-shadow:0 0 10px #FFD600aa;}
.modal-close{margin-top:16px;background:linear-gradient(135deg,#FF6B00,#FFD600);border:none;border-radius:20px;padding:10px 32px;font-family:'Lilita One',cursive;font-size:16px;color:#06001a;cursor:pointer;}

/* Raid modal */
.holes-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:16px 0;}
.hole{width:120px;height:120px;border-radius:50%;background:radial-gradient(circle,#3d2200,#1a0e00);border:4px solid #8B5E3C;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;transition:all .2s;position:relative;margin:0 auto;}
.hole:not(.dug):hover{border-color:#FFD600;box-shadow:0 0 16px #FFD60066;}
.hole.dug{background:radial-gradient(circle,#5a3a10,#2d1a00);cursor:default;border-color:#FFD600;animation:coinPop .4s ease;}
.hole-reward{color:#FFD600;font-size:18px;margin-top:4px;}
.raid-total{color:#00C853;font-size:22px;margin:12px 0;animation:coinPop .5s ease;}

/* Attack modal */
.hammer-wrap{display:flex;justify-content:center;margin:16px 0;}
.hammer-anim{animation:hammerSwing .4s ease-in-out infinite alternate;transform-origin:bottom center;}
.opponent-name{color:#FF6B00;font-size:28px;margin:8px 0;}
.attack-msg{color:#fff;font-size:15px;margin:8px 0;}
.shield-msg{color:#00C853;font-size:20px;margin:8px 0;animation:coinPop .5s ease;}

/* Village screen */
.village-wrap{position:relative;width:100%;flex:1;overflow:hidden;}
.village-bg{display:block;width:100%;}
.building-slot{position:absolute;transform:translate(-50%,-50%);cursor:pointer;}
.building-placeholder{width:54px;height:54px;border:3px dashed #FF6B0099;border-radius:10px;background:#FF6B0011;display:flex;align-items:center;justify-content:center;color:#FF6B00;font-size:24px;}

/* Upgrade panel */
.upgrade-panel{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:420px;background:linear-gradient(180deg,#1a0535,#06001a);border-top:3px solid #FFD600;border-radius:24px 24px 0 0;padding:20px 24px 32px;z-index:200;animation:slideUp .3s ease;}
.upgrade-title{color:#FFD600;font-size:22px;text-align:center;margin-bottom:12px;}
.level-dots{display:flex;gap:10px;justify-content:center;margin-bottom:16px;}
.level-dot{width:22px;height:22px;border-radius:50%;border:2px solid #FFD600;}
.level-dot.filled{background:#FFD600;}
.upgrade-cost{color:#fff;font-size:15px;text-align:center;margin-bottom:12px;}
.upgrade-btn{display:block;margin:0 auto;background:linear-gradient(135deg,#FF6B00,#FFD600);border:none;border-radius:20px;padding:12px 40px;font-family:'Lilita One',cursive;font-size:18px;color:#06001a;cursor:pointer;}
.upgrade-btn:disabled{background:linear-gradient(135deg,#444,#666);color:#999;cursor:not-allowed;}
.panel-close{position:absolute;top:14px;right:18px;background:none;border:none;color:#FFD600;font-size:26px;cursor:pointer;}
.maxed{color:#00C853;font-size:16px;text-align:center;}

/* Village done overlay */
.village-done{position:fixed;inset:0;background:#000000bb;z-index:300;display:flex;flex-direction:column;align-items:center;justify-content:center;}
.village-done h1{color:#FFD600;font-size:36px;text-shadow:0 0 20px #FFD600;text-align:center;animation:bounce 1s infinite;}
.fw-star{position:absolute;border-radius:50%;animation:fireworks 1.5s infinite;}

/* Shield indicator */
.shield-hud{font-size:22px;filter:drop-shadow(0 0 6px #4488ff);}

@keyframes lampRun{0%,100%{opacity:1;box-shadow:0 0 8px #FFD600;}50%{opacity:0.15;box-shadow:none;}}
@keyframes reelBlur{0%{filter:blur(10px);transform:scaleY(1.08);}100%{filter:blur(0);transform:scaleY(1);}}
@keyframes spinPulse{0%,100%{box-shadow:0 0 0 4px #FFD60044,0 0 20px #00C853,0 6px 20px #000a;}50%{box-shadow:0 0 0 4px #FFD60088,0 0 40px #00C853,0 0 60px #00ff6a66,0 6px 20px #000a;}}
@keyframes coinPop{0%{transform:scale(0);}70%{transform:scale(1.2);}100%{transform:scale(1);}}
@keyframes digBounce{0%,100%{transform:translateY(0);}50%{transform:translateY(-8px);}}
@keyframes fw{0%,100%{transform:skewX(0deg);}50%{transform:skewX(5deg);}}
@keyframes twinkle{0%,100%{opacity:1;}50%{opacity:0.15;}}
@keyframes slideUp{from{transform:translateX(-50%) translateY(100%);}to{transform:translateX(-50%) translateY(0);}}
@keyframes fireworks{0%{opacity:0;transform:scale(0.5);}50%{opacity:1;transform:scale(1.1);}100%{opacity:0;transform:scale(1.3);}}
@keyframes toastIn{from{transform:translateX(-50%) translateY(-80px);opacity:0;}to{transform:translateX(-50%) translateY(0);opacity:1;}}
@keyframes bounce{0%,100%{transform:translateY(0);}50%{transform:translateY(-12px);}}
@keyframes hammerSwing{0%{transform:rotate(-35deg);}100%{transform:rotate(25deg);}}
@keyframes spin360{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
`;

// ---- Constants ----
const SYMS = ["Malac","Kalapacs","Pajzs","Zsak","Villam"];
const CUMW = [38,60,76,90,100];
const OPPONENTS = ["Bjorn","Sigrid","Harald","Freya","Ragnar","Astrid","Ivar","Helga"];
const BKEYS = ["longhouse","windmill","tavern","blacksmith","castle"];
const COSTS = {
  longhouse:  [100,200,400,800,1600],
  windmill:   [150,300,600,1200,2400],
  tavern:     [280,560,1120,2240,4480],
  blacksmith: [450,900,1800,3600,7200],
  castle:     [1500,3000,6000,12000,24000],
};
const SLOTS = [
  {id:"longhouse", name:"Longhouse",  left:"29.8%", top:"48.0%"},
  {id:"windmill",  name:"Szelmalom",  left:"27.2%", top:"66.9%"},
  {id:"tavern",    name:"Kocsma",     left:"75.3%", top:"75.9%"},
  {id:"blacksmith",name:"Kovacs",     left:"74.8%", top:"58.0%"},
  {id:"castle",    name:"Kastely",    left:"76.6%", top:"42.1%"},
];

// ---- Helpers ----
const rand = (a,b) => Math.floor(Math.random()*(b-a+1))+a;
const weightedRand = () => { const r=Math.random()*100; return CUMW.findIndex(w=>r<w); };

// ---- SVG Symbols ----
function SymMalac(){
  return <svg viewBox="0 0 80 80" width="72" height="72">
    <ellipse cx="40" cy="46" rx="26" ry="22" fill="#ff8eb0" stroke="#3d1a00" strokeWidth="3"/>
    <circle cx="24" cy="28" r="10" fill="#ff8eb0" stroke="#3d1a00" strokeWidth="3"/>
    <circle cx="56" cy="28" r="10" fill="#ff8eb0" stroke="#3d1a00" strokeWidth="3"/>
    <circle cx="24" cy="26" r="6" fill="#ffb3cc"/>
    <circle cx="56" cy="26" r="6" fill="#ffb3cc"/>
    <ellipse cx="40" cy="54" rx="14" ry="10" fill="#ffb3cc" stroke="#3d1a00" strokeWidth="2"/>
    <circle cx="36" cy="52" r="3" fill="#3d1a00"/>
    <circle cx="44" cy="52" r="3" fill="#3d1a00"/>
    <circle cx="28" cy="40" r="4" fill="#3d1a00"/>
    <circle cx="52" cy="40" r="4" fill="#3d1a00"/>
    <circle cx="29" cy="39" r="1.5" fill="#fff"/>
    <circle cx="53" cy="39" r="1.5" fill="#fff"/>
    <path d="M60 62 Q68 56 72 62" fill="none" stroke="#ff8eb0" strokeWidth="4" strokeLinecap="round"/>
  </svg>;
}
function SymKalapacs(){
  return <svg viewBox="0 0 80 80" width="72" height="72">
    <rect x="34" y="38" width="12" height="34" rx="4" fill="#8B5E3C" stroke="#3d1a00" strokeWidth="3"/>
    <rect x="14" y="18" width="52" height="26" rx="8" fill="#9e9e9e" stroke="#3d1a00" strokeWidth="3"/>
    <rect x="14" y="18" width="52" height="12" rx="8" fill="#bdbdbd" stroke="none"/>
    <rect x="30" y="36" width="20" height="6" fill="#7a4a20" stroke="#3d1a00" strokeWidth="2"/>
    <line x1="20" y1="24" x2="60" y2="24" stroke="#e0e0e0" strokeWidth="3" strokeLinecap="round"/>
  </svg>;
}
function SymPajzs(){
  return <svg viewBox="0 0 80 80" width="72" height="72">
    <path d="M40 8 L68 20 L68 44 Q68 64 40 74 Q12 64 12 44 L12 20 Z" fill="#1565C0" stroke="#3d1a00" strokeWidth="3"/>
    <path d="M40 14 L62 24 L62 44 Q62 60 40 68 Q18 60 18 44 L18 24 Z" fill="#1976D2" stroke="none"/>
    <path d="M40 14 L62 24 L62 38 Q40 30 18 38 L18 24 Z" fill="#1e88e5" stroke="none"/>
    <path d="M40 10 L40 72" stroke="#FFD600" strokeWidth="4" strokeLinecap="round"/>
    <path d="M14 36 L66 36" stroke="#FFD600" strokeWidth="4" strokeLinecap="round"/>
    <circle cx="40" cy="36" r="8" fill="#FFD600" stroke="#3d1a00" strokeWidth="2"/>
    <circle cx="40" cy="36" r="4" fill="#FF6B00"/>
  </svg>;
}
function SymZsak(){
  return <svg viewBox="0 0 80 80" width="72" height="72">
    <ellipse cx="40" cy="50" rx="24" ry="22" fill="#8B5E3C" stroke="#3d1a00" strokeWidth="3"/>
    <ellipse cx="40" cy="50" rx="24" ry="22" fill="url(#bagGrad)" stroke="none"/>
    <defs><radialGradient id="bagGrad" cx="35%" cy="35%"><stop offset="0%" stopColor="#a0724a"/><stop offset="100%" stopColor="#6b3e1a"/></radialGradient></defs>
    <ellipse cx="40" cy="32" rx="10" ry="6" fill="#6b3e1a" stroke="#3d1a00" strokeWidth="2"/>
    <path d="M33 26 Q36 18 40 16 Q44 18 47 26" fill="none" stroke="#3d1a00" strokeWidth="3" strokeLinecap="round"/>
    <text x="40" y="56" textAnchor="middle" fontSize="22" fill="#FFD600" stroke="#3d1a00" strokeWidth="1" fontFamily="Arial">$</text>
    <circle cx="26" cy="60" r="5" fill="#FFD600" stroke="#3d1a00" strokeWidth="2"/>
    <circle cx="54" cy="60" r="5" fill="#FFD600" stroke="#3d1a00" strokeWidth="2"/>
    <circle cx="40" cy="66" r="5" fill="#FFD600" stroke="#3d1a00" strokeWidth="2"/>
  </svg>;
}
function SymVillam(){
  return <svg viewBox="0 0 80 80" width="72" height="72">
    <polygon points="46,6 24,42 38,42 34,74 58,36 44,36" fill="#FFD600" stroke="#3d1a00" strokeWidth="3"/>
    <polygon points="46,6 24,42 38,42 34,74 58,36 44,36" fill="url(#boltGrad)" stroke="none"/>
    <defs><linearGradient id="boltGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#fff176"/><stop offset="100%" stopColor="#FF6B00"/></linearGradient></defs>
    <line x1="46" y1="6" x2="24" y2="42" stroke="#fff" strokeWidth="2" opacity="0.5"/>
  </svg>;
}

const SYM_COMPONENTS = [SymMalac, SymKalapacs, SymPajzs, SymZsak, SymVillam];

// ---- Building SVGs ----
const S = "#3d1a00"; // stroke color
const SW = 3; // stroke width

function Longhouse({level}){
  if(level===0) return null;
  return <svg viewBox="0 0 90 80" width="70" height="62" style={{filter:"drop-shadow(2px 4px 6px #000a)"}}>
    {/* Base */}
    <rect x="8" y="40" width="74" height="32" rx="3" fill="#c97c2a" stroke={S} strokeWidth={SW}/>
    {/* Roof */}
    <polygon points="4,42 45,12 86,42" fill="#7b2c0a" stroke={S} strokeWidth={SW}/>
    {/* Door */}
    <rect x="35" y="56" width="20" height="16" rx="4" fill="#3d1a00" stroke={S} strokeWidth={SW}/>
    {level>=2 && <rect x="14" y="48" width="14" height="12" rx="2" fill="#87CEEB" stroke={S} strokeWidth={2}/>}
    {level>=2 && <rect x="62" y="48" width="14" height="12" rx="2" fill="#87CEEB" stroke={S} strokeWidth={2}/>}
    {level>=2 && <rect x="38" y="20" width="8" height="30" rx="3" fill="#8B5E3C" stroke={S} strokeWidth={2}/>}
    {level>=3 && <rect x="0" y="44" width="14" height="28" rx="2" fill="#b06820" stroke={S} strokeWidth={2}/>}
    {level>=3 && <rect x="76" y="44" width="14" height="28" rx="2" fill="#b06820" stroke={S} strokeWidth={2}/>}
    {level>=4 && <polygon points="0,46 7,34 14,46" fill="#6b2008" stroke={S} strokeWidth={2}/>}
    {level>=4 && <polygon points="76,46 83,34 90,46" fill="#6b2008" stroke={S} strokeWidth={2}/>}
    {level>=4 && <rect x="20" y="56" width="6" height="6" fill="#FFD600" stroke={S} strokeWidth={1}/>}
    {level>=4 && <rect x="64" y="56" width="6" height="6" fill="#FFD600" stroke={S} strokeWidth={1}/>}
    {level>=5 && <line x1="8" y1="40" x2="82" y2="40" stroke="#FFD600" strokeWidth="2"/>}
    {level>=5 && <circle cx="20" cy="40" r="4" fill="#FFD600" stroke={S} strokeWidth={1}/>}
    {level>=5 && <circle cx="45" cy="40" r="4" fill="#FFD600" stroke={S} strokeWidth={1}/>}
    {level>=5 && <circle cx="70" cy="40" r="4" fill="#FFD600" stroke={S} strokeWidth={1}/>}
    {level>=5 && <path d="M30 40 Q35 32 40 40 Q45 32 50 40 Q55 32 60 40" fill="none" stroke="#FFD600" strokeWidth="2"/>}
  </svg>;
}

function Windmill({level}){
  if(level===0) return null;
  return <svg viewBox="0 0 80 90" width="60" height="68" style={{filter:"drop-shadow(2px 4px 6px #000a)"}}>
    <rect x="26" y="36" width="28" height="50" rx="4" fill="#d4a44c" stroke={S} strokeWidth={SW}/>
    <polygon points="12,38 40,20 68,38 56,90 24,90" fill="#c8923a" stroke={S} strokeWidth={SW}/>
    <rect x="30" y="68" width="20" height="18" rx="3" fill="#3d1a00" stroke={S} strokeWidth={2}/>
    <circle cx="40" cy="32" r="8" fill="#e8b860" stroke={S} strokeWidth={SW}/>
    {level>=2 && <rect x="38" y="4" width="4" height="28" rx="2" fill="#8B5E3C" stroke={S} strokeWidth={2}/>}
    {level>=2 && <rect x="18" y="20" width="28" height="4" rx="2" fill="#8B5E3C" stroke={S} strokeWidth={2}/>}
    {level>=3 && <rect x="52" y="20" width="4" height="24" rx="2" fill="#8B5E3C" stroke={S} strokeWidth={2} transform="rotate(45,54,32)"/>}
    {level>=3 && <rect x="24" y="10" width="4" height="24" rx="2" fill="#8B5E3C" stroke={S} strokeWidth={2} transform="rotate(-45,26,22)"/>}
    {level>=4 && <rect x="14" y="50" width="12" height="16" rx="2" fill="#c8923a" stroke={S} strokeWidth={2}/>}
    {level>=4 && <polygon points="14,52 20,42 26,52" fill="#a06828" stroke={S} strokeWidth={2}/>}
    {level>=5 && <circle cx="40" cy="32" r="4" fill="#FFD600" stroke={S} strokeWidth={1}/>}
    {level>=5 && <rect x="16" y="58" width="10" height="8" rx="1" fill="#87CEEB" stroke={S} strokeWidth={1}/>}
    {level>=5 && <path d="M30 52 Q40 46 50 52" fill="none" stroke="#FFD600" strokeWidth="2"/>}
  </svg>;
}

function Tavern({level}){
  if(level===0) return null;
  return <svg viewBox="0 0 90 80" width="70" height="62" style={{filter:"drop-shadow(2px 4px 6px #000a)"}}>
    <rect x="10" y="36" width="70" height="40" rx="3" fill="#c84a0a" stroke={S} strokeWidth={SW}/>
    <polygon points="6,38 45,10 84,38" fill="#8b1a08" stroke={S} strokeWidth={SW}/>
    <rect x="34" y="56" width="22" height="20" rx="4" fill="#3d1a00" stroke={S} strokeWidth={SW}/>
    {level>=2 && <rect x="14" y="44" width="16" height="14" rx="2" fill="#87CEEB" stroke={S} strokeWidth={2}/>}
    {level>=2 && <rect x="60" y="44" width="16" height="14" rx="2" fill="#87CEEB" stroke={S} strokeWidth={2}/>}
    {level>=2 && <rect x="28" y="24" width="24" height="5" rx="2" fill="#8B5E3C" stroke={S} strokeWidth={2}/>}
    {level>=2 && <line x1="40" y1="10" x2="40" y2="24" stroke="#3d1a00" strokeWidth="2"/>}
    {level>=3 && <ellipse cx="18" cy="74" rx="7" ry="8" fill="#8B5E3C" stroke={S} strokeWidth={2}/>}
    {level>=3 && <ellipse cx="18" cy="70" rx="7" ry="5" fill="#a06828" stroke={S} strokeWidth={1}/>}
    {level>=3 && <rect x="70" y="56" width="10" height="18" rx="2" fill="#c84a0a" stroke={S} strokeWidth={2}/>}
    {level>=4 && <rect x="6" y="52" width="8" height="24" rx="2" fill="#b03808" stroke={S} strokeWidth={2}/>}
    {level>=4 && <rect x="76" y="52" width="8" height="24" rx="2" fill="#b03808" stroke={S} strokeWidth={2}/>}
    {level>=4 && <rect x="4" y="50" width="82" height="4" rx="2" fill="#FFD600" stroke={S} strokeWidth={1}/>}
    {level>=5 && <circle cx="22" cy="26" r="4" fill="#FF6B00" stroke={S} strokeWidth={1}/>}
    {level>=5 && <circle cx="58" cy="26" r="4" fill="#FF6B00" stroke={S} strokeWidth={1}/>}
    {level>=5 && <text x="45" y="30" textAnchor="middle" fontSize="7" fill="#FFD600" fontFamily="Arial" fontWeight="bold">KOCSMA</text>}
    {level>=5 && <rect x="36" y="40" width="18" height="4" rx="1" fill="#FFD600" stroke={S} strokeWidth={1}/>}
  </svg>;
}

function Blacksmith({level}){
  if(level===0) return null;
  return <svg viewBox="0 0 80 80" width="62" height="62" style={{filter:"drop-shadow(2px 4px 6px #000a)"}}>
    <rect x="12" y="38" width="56" height="38" rx="3" fill="#5a5a5a" stroke={S} strokeWidth={SW}/>
    <polygon points="8,40 40,16 72,40" fill="#3a3a3a" stroke={S} strokeWidth={SW}/>
    <rect x="28" y="54" width="24" height="22" rx="3" fill="#3d1a00" stroke={S} strokeWidth={SW}/>
    <rect x="54" y="20" width="8" height="28" rx="3" fill="#444" stroke={S} strokeWidth={2}/>
    {level>=2 && <ellipse cx="16" cy="76" rx="8" ry="5" fill="#555" stroke={S} strokeWidth={2}/>}
    {level>=2 && <ellipse cx="16" cy="73" rx="8" ry="4" fill="#777" stroke={S} strokeWidth={1}/>}
    {level>=2 && <rect x="12" y="60" width="8" height="4" rx="1" fill="#FFD600" stroke={S} strokeWidth={1}/>}
    {level>=3 && <line x1="60" y1="48" x2="70" y2="52" stroke="#888" strokeWidth="3" strokeLinecap="round"/>}
    {level>=3 && <line x1="60" y1="54" x2="70" y2="58" stroke="#888" strokeWidth="3" strokeLinecap="round"/>}
    {level>=3 && <ellipse cx="56" cy="20" rx="5" ry="8" fill="#FF6B00" stroke={S} strokeWidth={1} opacity="0.7"/>}
    {level>=4 && <rect x="0" y="50" width="14" height="26" rx="2" fill="#4a4a4a" stroke={S} strokeWidth={2}/>}
    {level>=4 && <polygon points="0,52 7,40 14,52" fill="#2a2a2a" stroke={S} strokeWidth={2}/>}
    {level>=4 && <rect x="2" y="62" width="10" height="8" rx="1" fill="#87CEEB" stroke={S} strokeWidth={1}/>}
    {level>=5 && <circle cx="40" cy="30" r="5" fill="#FFD600" stroke={S} strokeWidth={2}/>}
    {level>=5 && <line x1="30" y1="38" x2="50" y2="38" stroke="#FFD600" strokeWidth="2"/>}
    {level>=5 && <path d="M56 14 Q60 8 56 2 Q52 8 56 14" fill="#FF6B00" stroke={S} strokeWidth={1}/>}
    {level>=5 && <path d="M60 10 Q66 4 60 0 Q54 4 60 10" fill="#FF8C00" stroke={S} strokeWidth={1}/>}
  </svg>;
}

function Castle({level}){
  if(level===0) return null;
  return <svg viewBox="0 0 90 90" width="70" height="70" style={{filter:"drop-shadow(2px 4px 6px #000a)"}}>
    <rect x="30" y="20" width="30" height="66" rx="3" fill="#9e8060" stroke={S} strokeWidth={SW}/>
    <rect x="24" y="14" width="42" height="12" rx="2" fill="#8b6e48" stroke={S} strokeWidth={SW}/>
    <rect x="26" y="8" width="8" height="10" rx="1" fill="#8b6e48" stroke={S} strokeWidth={2}/>
    <rect x="37" y="8" width="8" height="10" rx="1" fill="#8b6e48" stroke={S} strokeWidth={2}/>
    <rect x="48" y="8" width="8" height="10" rx="1" fill="#8b6e48" stroke={S} strokeWidth={2}/>
    <rect x="36" y="58" width="18" height="28" rx="2" fill="#3d1a00" stroke={S} strokeWidth={2}/>
    <path d="M36 58 Q45 52 54 58" fill="#3d1a00" stroke={S} strokeWidth={2}/>
    {level>=2 && <rect x="34" y="34" width="10" height="10" rx="2" fill="#ffcc88" stroke={S} strokeWidth={2}/>}
    {level>=2 && <rect x="46" y="34" width="10" height="10" rx="2" fill="#ffcc88" stroke={S} strokeWidth={2}/>}
    {level>=3 && <rect x="6" y="36" width="24" height="50" rx="3" fill="#8b6e48" stroke={S} strokeWidth={SW}/>}
    {level>=3 && <rect x="2" y="28" width="30" height="12" rx="2" fill="#7a5e38" stroke={S} strokeWidth={2}/>}
    {level>=3 && <rect x="4" y="22" width="7" height="10" rx="1" fill="#7a5e38" stroke={S} strokeWidth={2}/>}
    {level>=3 && <rect x="15" y="22" width="7" height="10" rx="1" fill="#7a5e38" stroke={S} strokeWidth={2}/>}
    {level>=4 && <rect x="60" y="36" width="24" height="50" rx="3" fill="#8b6e48" stroke={S} strokeWidth={SW}/>}
    {level>=4 && <rect x="58" y="28" width="30" height="12" rx="2" fill="#7a5e38" stroke={S} strokeWidth={2}/>}
    {level>=4 && <rect x="62" y="22" width="7" height="10" rx="1" fill="#7a5e38" stroke={S} strokeWidth={2}/>}
    {level>=4 && <rect x="73" y="22" width="7" height="10" rx="1" fill="#7a5e38" stroke={S} strokeWidth={2}/>}
    {level>=4 && <rect x="24" y="68" width="42" height="18" rx="2" fill="#7a5e38" stroke={S} strokeWidth={2}/>}
    {level>=5 && <rect x="42" y="0" width="4" height="12" fill="#8B5E3C" stroke={S} strokeWidth={1}/>}
    {level>=5 && <polygon points="44,0 49,8 44,6 39,8" fill="#FF6B00" stroke={S} strokeWidth={1} style={{animation:"fw 1s infinite"}}/>}
    {level>=5 && <rect x="12" y="44" width="8" height="8" rx="1" fill="#ffcc88" stroke={S} strokeWidth={1}/>}
    {level>=5 && <rect x="68" y="44" width="8" height="8" rx="1" fill="#ffcc88" stroke={S} strokeWidth={1}/>}
    {level>=5 && <circle cx="45" cy="70" r="8" fill="#3d1a00" stroke={S} strokeWidth={2}/>}
    {level>=5 && <rect x="41" y="62" width="8" height="4" fill="#3d1a00" stroke={S} strokeWidth={1}/>}
  </svg>;
}

const BUILDING_COMPONENTS = {longhouse:Longhouse, windmill:Windmill, tavern:Tavern, blacksmith:Blacksmith, castle:Castle};

// ---- Village Background ----
function VillageBG(){
  const stars = [];
  const starData = [
    [30,20],[80,35],[130,15],[190,25],[250,18],[310,30],[370,12],[400,40],
    [50,55],[110,48],[170,60],[230,42],[290,50],[350,45],[410,55],
    [20,80],[70,90],[140,75],[200,85],[260,70],[330,88],[380,78],
    [90,110],[160,100],[220,115],[280,95],[340,108],[390,92],
  ];
  starData.forEach(([cx,cy],i) => {
    stars.push(<circle key={i} cx={cx} cy={cy} r={i%3===0?2:1.2} fill="#fff" style={{animation:`twinkle ${1.5+i*0.2}s infinite`,animationDelay:`${i*0.13}s`}}/>);
  });

  return <svg viewBox="0 0 420 700" width="420" height="700" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#0a0618"/>
        <stop offset="25%" stopColor="#1a0e3a"/>
        <stop offset="45%" stopColor="#3d1654"/>
        <stop offset="65%" stopColor="#7b2d6b"/>
        <stop offset="82%" stopColor="#c45e3e"/>
        <stop offset="100%" stopColor="#e8883a"/>
      </linearGradient>
      <radialGradient id="moonGlow" cx="50%" cy="50%">
        <stop offset="0%" stopColor="#fffde7" stopOpacity="0.6"/>
        <stop offset="100%" stopColor="#ffd600" stopOpacity="0"/>
      </radialGradient>
      <radialGradient id="vignetteGrad" cx="50%" cy="50%">
        <stop offset="40%" stopColor="transparent"/>
        <stop offset="100%" stopColor="#000" stopOpacity="0.7"/>
      </radialGradient>
      <filter id="blur2"><feGaussianBlur stdDeviation="2"/></filter>
      <filter id="blur4"><feGaussianBlur stdDeviation="4"/></filter>
      <filter id="blur6"><feGaussianBlur stdDeviation="6"/></filter>
    </defs>

    {/* Sky */}
    <rect width="420" height="700" fill="url(#skyGrad)"/>

    {/* Stars */}
    {stars}

    {/* Moon glow */}
    <circle cx="360" cy="80" r="60" fill="url(#moonGlow)"/>
    {/* Moon */}
    <circle cx="360" cy="80" r="36" fill="#fef9ee" stroke="#f5e98a" strokeWidth="1"/>
    <circle cx="352" cy="74" r="6" fill="#e8ddb8" opacity="0.7"/>
    <circle cx="368" cy="88" r="4" fill="#e8ddb8" opacity="0.6"/>
    <circle cx="358" cy="90" r="3" fill="#e8ddb8" opacity="0.5"/>

    {/* Distant mountains */}
    <path d="M-10 420 Q60 300 140 340 Q200 300 260 340 Q320 280 420 320 L420 500 L-10 500 Z" fill="#2a1440" filter="url(#blur4)"/>
    <path d="M0 460 Q80 360 160 380 Q240 340 330 370 Q380 340 430 360 L430 520 L0 520 Z" fill="#3a1a50" filter="url(#blur2)"/>

    {/* Distant castle on hill */}
    <ellipse cx="200" cy="390" rx="50" ry="20" fill="#1e0d30" filter="url(#blur2)"/>
    <rect x="188" y="360" width="24" height="32" fill="#2a1240"/>
    <rect x="184" y="352" width="32" height="10" fill="#221038"/>
    <rect x="185" y="346" width="6" height="8" fill="#221038"/>
    <rect x="196" y="346" width="6" height="8" fill="#221038"/>
    <rect x="207" y="346" width="6" height="8" fill="#221038"/>
    <rect x="192" y="368" width="8" height="12" fill="#0a0618"/>
    <rect x="193" y="356" width="6" height="6" fill="#ffcc88" opacity="0.8"/>
    <rect x="202" y="356" width="6" height="6" fill="#ffcc88" opacity="0.8"/>
    <rect x="196" y="344" width="2" height="8" fill="#6b3a0a"/>
    <polygon points="197,340 201,344 197,342 193,344" fill="#c0392b"/>

    {/* Fog layers */}
    <ellipse cx="210" cy="410" rx="250" ry="30" fill="#9b7eb8" opacity="0.18" filter="url(#blur6)"/>
    <ellipse cx="180" cy="440" rx="280" ry="25" fill="#c9a0e8" opacity="0.12" filter="url(#blur6)"/>
    <rect x="-20" y="430" width="460" height="40" fill="#8b6aaa" opacity="0.10" filter="url(#blur4)"/>
    <ellipse cx="220" cy="470" rx="300" ry="20" fill="#b090cc" opacity="0.10" filter="url(#blur4)"/>

    {/* Mid hills */}
    <path d="M-10 540 Q60 470 130 490 Q200 460 280 490 Q350 460 430 480 L430 600 L-10 600 Z" fill="#1a3a1a"/>
    <path d="M-10 560 Q50 510 110 530 Q170 500 240 525 Q300 495 370 515 L430 520 L430 620 L-10 620 Z" fill="#1e4020"/>

    {/* Treeline left */}
    <path d="M0 520 L20 470 L30 490 L45 440 L60 465 L72 430 L85 460 L95 440 L105 465 L115 520 Z" fill="#0f2a0f"/>
    <path d="M0 540 L15 495 L25 510 L38 475 L52 498 L65 480 L78 505 L90 488 L100 510 L110 540 Z" fill="#0a200a"/>

    {/* Treeline right */}
    <path d="M310 520 L322 455 L335 475 L348 440 L362 465 L375 435 L388 460 L400 442 L414 468 L420 520 Z" fill="#0f2a0f"/>
    <path d="M315 540 L326 490 L340 510 L352 472 L368 498 L380 475 L395 504 L410 485 L420 510 L420 540 Z" fill="#0a200a"/>

    {/* Ground */}
    <path d="M0 600 Q100 570 210 575 Q320 570 420 580 L420 700 L0 700 Z" fill="#163016"/>
    <path d="M0 640 Q110 615 210 620 Q310 612 420 625 L420 700 L0 700 Z" fill="#1e3e1e"/>

    {/* Stone path */}
    <path d="M160 700 L180 580 L200 520 L210 480 L220 520 L240 580 L260 700 Z" fill="#2a4a2a" opacity="0.6"/>
    <ellipse cx="210" cy="690" rx="30" ry="8" fill="#3a3a3a" opacity="0.7"/>
    <ellipse cx="208" cy="650" rx="22" ry="6" fill="#3a3a3a" opacity="0.7"/>
    <ellipse cx="212" cy="610" rx="16" ry="5" fill="#3a3a3a" opacity="0.7"/>
    <ellipse cx="210" cy="575" rx="12" ry="4" fill="#3a3a3a" opacity="0.7"/>
    <ellipse cx="209" cy="545" rx="9" ry="3" fill="#3a3a3a" opacity="0.6"/>

    {/* Vignette */}
    <rect width="420" height="700" fill="url(#vignetteGrad)"/>
  </svg>;
}

// ---- Toast ----
function Toast({msg}){
  return <div className="toast">{msg}</div>;
}

// ---- Raid Modal ----
function RaidModal({bet, onClose, onCoins}){
  const [dug, setDug] = useState([]);
  const [rewards, setRewards] = useState([null,null,null,null]);
  const [total, setTotal] = useState(0);
  const done = dug.length >= 3;

  function digHole(i){
    if(dug.includes(i) || done) return;
    const r = rand(10,500)*bet;
    const newRewards = [...rewards];
    newRewards[i] = r;
    setRewards(newRewards);
    const newDug = [...dug, i];
    setDug(newDug);
    const newTotal = total + r;
    setTotal(newTotal);
    if(newDug.length >= 3){
      onCoins(newTotal);
    }
  }

  return <div className="overlay">
    <div className="modal">
      <h2>Rablotamas!</h2>
      <p style={{color:"#ccc",fontSize:"14px",marginBottom:"8px"}}>Valassz 3 lyukat az arashoz!</p>
      <div className="holes-grid">
        {[0,1,2,3].map(i => (
          <div key={i} className={"hole"+(dug.includes(i)?" dug":"")} onClick={()=>digHole(i)}>
            {dug.includes(i)
              ? <><div style={{fontSize:"28px"}}>🪙</div><div className="hole-reward">+{rewards[i]}</div></>
              : <div style={{fontSize:"36px",animation:"digBounce 0.8s infinite"}}>⛏️</div>
            }
          </div>
        ))}
      </div>
      {done && <>
        <div className="raid-total">Osszesen {total} ermet raboltals!</div>
        <button className="modal-close" onClick={onClose}>Bezar</button>
      </>}
    </div>
  </div>;
}

// ---- Attack Modal ----
function AttackModal({shield, buildings, onClose, onShieldUsed, onBuildingHit}){
  const opponent = useRef(OPPONENTS[rand(0,OPPONENTS.length-1)]).current;
  const buildingKey = useRef(BKEYS[rand(0,BKEYS.length-1)]).current;
  const blocked = shield;

  useEffect(()=>{
    if(blocked){
      onShieldUsed();
    } else {
      onBuildingHit(buildingKey);
    }
  },[]);

  const bnames = {longhouse:"Longhouse",windmill:"Szelmalom",tavern:"Kocsma",blacksmith:"Kovacs",castle:"Kastely"};

  return <div className="overlay">
    <div className="modal">
      <h2>Tamadas!</h2>
      <div className="opponent-name">{opponent}</div>
      <div className="hammer-wrap">
        <svg viewBox="0 0 80 80" width="80" height="80" className="hammer-anim">
          <rect x="34" y="38" width="12" height="34" rx="4" fill="#8B5E3C" stroke={S} strokeWidth={3}/>
          <rect x="14" y="18" width="52" height="26" rx="8" fill="#9e9e9e" stroke={S} strokeWidth={3}/>
          <rect x="14" y="18" width="52" height="12" rx="8" fill="#bdbdbd"/>
        </svg>
      </div>
      {blocked
        ? <div className="shield-msg">Pajzs megvedett! 🛡️</div>
        : <div className="attack-msg">{opponent} megutotte: <b style={{color:"#FFD600"}}>{bnames[buildingKey]}</b></div>
      }
      <button className="modal-close" onClick={onClose}>Bezar</button>
    </div>
  </div>;
}

// ---- Upgrade Panel ----
function UpgradePanel({building, coins, buildings, onUpgrade, onClose}){
  const lvl = buildings[building.id];
  const maxed = lvl >= 5;
  const cost = maxed ? 0 : COSTS[building.id][lvl];
  const canAfford = coins >= cost;

  return <div className="upgrade-panel">
    <button className="panel-close" onClick={onClose}>x</button>
    <div className="upgrade-title">{building.name}</div>
    <div className="level-dots">
      {[0,1,2,3,4].map(i=>(
        <div key={i} className={"level-dot"+(i<lvl?" filled":"")}/>
      ))}
    </div>
    {maxed
      ? <div className="maxed">Max szint elert!</div>
      : <>
        <div className="upgrade-cost">Fejlesztesi koltseg: <span style={{color:"#FFD600"}}>{cost} erme</span></div>
        <button className="upgrade-btn" disabled={!canAfford} onClick={()=>onUpgrade(building.id, cost)}>
          {canAfford ? "Fejlesztes" : "Nincs eleg erme"}
        </button>
      </>
    }
  </div>;
}

// ---- Slot Screen ----
function SlotScreen({coins, spins, bet, setBet, shield, reels, spinning, onSpin, onSpinDown, onSpinUp, onNav}){
  const lightPositions = [
    {top:"6%",left:"12%"},{top:"6%",left:"30%"},{top:"6%",left:"50%"},{top:"6%",left:"70%"},{top:"6%",left:"88%"},
    {top:"50%",left:"96%"},{top:"94%",left:"88%"},{top:"94%",left:"70%"},{top:"94%",left:"50%"},{top:"94%",left:"30%"},
    {top:"50%",left:"2%"},
  ];

  return <div style={{display:"flex",flexDirection:"column",height:"100vh",maxHeight:"100vh"}}>
    <style>{CSS}</style>
    {/* HUD */}
    <div className="hud">
      <div className="hud-block">
        <svg width="28" height="28" viewBox="0 0 28 28">
          <circle cx="14" cy="14" r="13" fill="#FFD600" stroke="#c8960a" strokeWidth="2"/>
          <text x="14" y="19" textAnchor="middle" fontSize="13" fill="#8B5E3C" fontFamily="Arial" fontWeight="bold">$</text>
        </svg>
        <div><div className="hud-val">{coins}</div><div className="hud-label">Erme</div></div>
      </div>
      <div className="hud-block">
        <div className="village-badge">Falu {"\u00a0"}1</div>
        {shield && <div className="shield-hud">🛡️</div>}
      </div>
      <div className="hud-block">
        <svg width="28" height="28" viewBox="0 0 28 28">
          <circle cx="14" cy="14" r="13" fill="#FF6B00" stroke="#c84800" strokeWidth="2"/>
          <path d="M10 8 L10 20 L20 14 Z" fill="#fff"/>
        </svg>
        <div><div className="hud-val">{spins}</div><div className="hud-label">Forgatas</div></div>
      </div>
    </div>

    {/* Bet row */}
    <div className="bet-row">
      {[1,2,3].map(b=>(
        <button key={b} className={"bet-btn"+(bet===b?" active":"")} onClick={()=>setBet(b)}>{b}x</button>
      ))}
    </div>

    {/* Cabinet */}
    <div className="cabinet-wrap">
      <div className="cabinet">
        <div className="lights-ring">
          {lightPositions.map((pos,i)=>(
            <div key={i} className="light" style={{...pos,transform:"translate(-50%,-50%)",animationDelay:`${i*0.1}s`}}/>
          ))}
        </div>
        <div className="cabinet-inner">
          <div className="reels-row">
            {reels.map((sym,i)=>{
              const Sym = SYM_COMPONENTS[sym];
              return <div key={i} className={"reel"+(spinning?" spinning":"")}>
                <div className="reel-sym"><Sym/></div>
              </div>;
            })}
          </div>
          <button
            className={"spin-btn"+(spinning?" spinning-active":"")}
            disabled={spins<1}
            onMouseDown={onSpinDown}
            onMouseUp={onSpinUp}
            onTouchStart={onSpinDown}
            onTouchEnd={onSpinUp}
          >
            {spins<1 ? "Var..." : spinning ? "..." : "SPIN"}
          </button>
        </div>
      </div>
    </div>

    {/* Nav */}
    <button className="nav-btn" onClick={onNav}>Falu megtekintese</button>
  </div>;
}

// ---- Village Screen ----
function VillageScreen({coins, buildings, onBuildingTap, selBuilding, onUpgrade, onClosePanel, onNav}){
  return <div style={{position:"relative",width:"100%",flex:1}}>
    <div style={{position:"relative",width:"100%"}}>
      <VillageBG/>
      {SLOTS.map(slot=>{
        const lvl = buildings[slot.id];
        const Comp = BUILDING_COMPONENTS[slot.id];
        return <div
          key={slot.id}
          className="building-slot"
          style={{left:slot.left, top:slot.top}}
          onClick={()=>onBuildingTap(slot)}
        >
          {lvl===0
            ? <div className="building-placeholder">+</div>
            : <Comp level={lvl}/>
          }
        </div>;
      })}
    </div>
    {selBuilding && (
      <UpgradePanel
        building={selBuilding}
        coins={coins}
        buildings={buildings}
        onUpgrade={onUpgrade}
        onClose={onClosePanel}
      />
    )}
    <button className="nav-btn" style={{position:"absolute",bottom:"12px",left:"50%",transform:"translateX(-50%)",zIndex:10}} onClick={onNav}>
      Forgatogep
    </button>
  </div>;
}

// ---- Village Done Overlay ----
function VillageDoneOverlay({village}){
  const fwItems = [];
  for(let i=0;i<18;i++){
    const hue = i*20;
    const cx = 20+rand(0,80);
    const cy = 10+rand(0,80);
    fwItems.push(
      <div key={i} className="fw-star" style={{
        width:rand(8,20)+"px",height:rand(8,20)+"px",
        left:cx+"%",top:cy+"%",
        background:`hsl(${hue},100%,60%)`,
        animationDelay:`${i*0.08}s`,
        animationDuration:`${1+rand(0,10)*0.1}s`
      }}/>
    );
  }
  return <div className="village-done">
    {fwItems}
    <h1>Falu kesz!</h1>
    <p style={{color:"#FFD600",fontSize:"20px",marginTop:"12px"}}>Falu {village} teljesitve!</p>
    <p style={{color:"#ccc",fontSize:"14px",marginTop:"8px"}}>Uj falu kezdodik...</p>
  </div>;
}

// ---- App ----
export default function App(){
  const [coins, setCoins] = useState(500);
  const [spins, setSpins] = useState(50);
  const [bet, setBet] = useState(1);
  const [shield, setShield] = useState(false);
  const [village, setVillage] = useState(1);
  const [buildings, setBuildings] = useState({longhouse:0,windmill:0,tavern:0,blacksmith:0,castle:0});
  const [screen, setScreen] = useState("slot");
  const [spinning, setSpinning] = useState(false);
  const [reels, setReels] = useState([0,0,0]);
  const [result, setResult] = useState(null);
  const [raidOpen, setRaidOpen] = useState(false);
  const [attackOpen, setAttackOpen] = useState(false);
  const [selBuilding, setSelBuilding] = useState(null);
  const [toast, setToast] = useState(null);
  const [villageDone, setVillageDone] = useState(false);

  const autoSpinRef = useRef(null);
  const holdTimerRef = useRef(null);
  const spinningRef = useRef(false);
  const spinsRef = useRef(50);
  const betRef = useRef(1);
  const villageRef = useRef(1);
  const shieldRef = useRef(false);

  // Keep refs in sync
  useEffect(()=>{ spinningRef.current = spinning; },[spinning]);
  useEffect(()=>{ spinsRef.current = spins; },[spins]);
  useEffect(()=>{ betRef.current = bet; },[bet]);
  useEffect(()=>{ villageRef.current = village; },[village]);
  useEffect(()=>{ shieldRef.current = shield; },[shield]);

  // Toast helper
  const showToast = useCallback((msg)=>{
    setToast(msg);
    setTimeout(()=>setToast(null),2000);
  },[]);

  // Spin timer: +5 spins every 60s
  useEffect(()=>{
    const id = setInterval(()=>setSpins(s=>s+5),60000);
    return ()=>clearInterval(id);
  },[]);

  // Village complete check
  useEffect(()=>{
    if(Object.values(buildings).every(v=>v===5)){
      setVillageDone(true);
      setTimeout(()=>{
        setVillageDone(false);
        setVillage(v=>v+1);
        setBuildings({longhouse:0,windmill:0,tavern:0,blacksmith:0,castle:0});
      },4000);
    }
  },[buildings]);

  const evaluateResult = useCallback((a,b,c,curBet,curVillage)=>{
    const mult = curVillage;
    if(a===b && b===c){
      if(a===0){
        const won = rand(50,200)*curBet*mult;
        setCoins(co=>co+won);
        showToast("JACKPOT! +"+won+" erme!");
        setRaidOpen(true);
      } else if(a===1){
        setAttackOpen(true);
      } else if(a===2){
        setShield(true);
        showToast("Pajzs aktivalva! Vedve vagy!");
      } else if(a===3){
        setRaidOpen(true);
        showToast("Rablotamas!");
      } else if(a===4){
        setSpins(s=>s+10);
        showToast("+10 Forgatas!");
      }
    } else if(a===b||b===c||a===c){
      const won = rand(5,20)*curBet;
      setCoins(co=>co+won);
      showToast("+"+won+" erme");
    } else if(a===0||b===0||c===0){
      const won = 10*curBet;
      setCoins(co=>co+won);
      showToast("+"+won+" erme");
    }
  },[showToast]);

  const doSpin = useCallback(()=>{
    if(spinningRef.current || spinsRef.current<1) return;
    const curBet = betRef.current;
    const curVillage = villageRef.current;
    setSpins(s=>{
      spinsRef.current = s-1;
      return s-1;
    });
    setSpinning(true);
    spinningRef.current = true;
    const r0=weightedRand(), r1=weightedRand(), r2=weightedRand();
    setTimeout(()=>{
      setReels([r0,r1,r2]);
      setSpinning(false);
      spinningRef.current = false;
      evaluateResult(r0,r1,r2,curBet,curVillage);
    },800);
  },[evaluateResult]);

  const onSpinDown = useCallback(()=>{
    holdTimerRef.current = setTimeout(()=>{
      autoSpinRef.current = setInterval(()=>doSpin(),600);
    },500);
  },[doSpin]);

  const onSpinUp = useCallback(()=>{
    clearTimeout(holdTimerRef.current);
    if(autoSpinRef.current){
      clearInterval(autoSpinRef.current);
      autoSpinRef.current = null;
    } else {
      doSpin();
    }
  },[doSpin]);

  const onBuildingTap = useCallback((slot)=>{
    setSelBuilding(slot);
  },[]);

  const onUpgrade = useCallback((id, cost)=>{
    setCoins(c=>{
      if(c<cost) return c;
      return c-cost;
    });
    setBuildings(b=>({...b,[id]:b[id]+1}));
    setSelBuilding(null);
  },[]);

  const onRaidCoins = useCallback((total)=>{
    setCoins(c=>c+total);
  },[]);

  const onAttackShieldUsed = useCallback(()=>{
    setShield(false);
    showToast("Pajzs megvedett!");
  },[showToast]);

  const onAttackBuildingHit = useCallback((key)=>{
    setBuildings(b=>({...b,[key]:Math.max(0,b[key]-1)}));
    showToast("Epuleted megserult!");
  },[showToast]);

  return <div className="app">
    <style>{CSS}</style>
    {toast && <Toast msg={toast}/>}
    {raidOpen && <RaidModal bet={bet} onClose={()=>setRaidOpen(false)} onCoins={onRaidCoins}/>}
    {attackOpen && <AttackModal
      shield={shield}
      buildings={buildings}
      onClose={()=>setAttackOpen(false)}
      onShieldUsed={onAttackShieldUsed}
      onBuildingHit={onAttackBuildingHit}
    />}
    {villageDone && <VillageDoneOverlay village={village}/>}

    {screen==="slot"
      ? <SlotScreen
          coins={coins} spins={spins} bet={bet} setBet={setBet}
          shield={shield} reels={reels} spinning={spinning}
          onSpin={doSpin} onSpinDown={onSpinDown} onSpinUp={onSpinUp}
          onNav={()=>setScreen("village")}
        />
      : <VillageScreen
          coins={coins} buildings={buildings}
          onBuildingTap={onBuildingTap}
          selBuilding={selBuilding}
          onUpgrade={onUpgrade}
          onClosePanel={()=>setSelBuilding(null)}
          onNav={()=>setScreen("slot")}
        />
    }
  </div>;
}
