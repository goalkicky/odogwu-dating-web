export const DISCOVER_FILTER_TEMPLATE_CSS = `
.dpr,.dpr *{box-sizing:border-box}
.dpr{
  --pink:#e90052;--pink2:#d90a57;--pink-soft:#fff1f7;--text:#17171a;--muted:#6d6d75;--line:#e9e9ed;--purple:#6718d4;
  min-height:100%;display:flex;justify-content:center;
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;
  color:var(--text);background:#f5f5f7;
}
.dpr button{font:inherit;color:inherit;border:0;background:none;cursor:pointer;-webkit-tap-highlight-color:transparent}
.dpr .app{width:100%;min-height:100vh;background:#fff}
.dpr .topbar{height:92px;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:20px 28px 12px;border-bottom:1px solid #f2f2f3;background:#fff}
.dpr .brand{display:flex;align-items:center;gap:7px}
.dpr .brand-mark{width:38px;height:38px;border:3px solid #c9161c;border-radius:50%;position:relative}
.dpr .brand-mark:before{content:"";position:absolute;width:12px;height:12px;border:3px solid #c9161c;border-radius:50%;left:-7px;top:-5px;background:#fff}
.dpr .brand-mark:after{content:"";position:absolute;width:12px;height:3px;background:#c9161c;right:-4px;bottom:1px;transform:rotate(-42deg);border-radius:3px}
.dpr .brand-copy strong{font-size:25px;letter-spacing:-1.2px;color:#b80f17;line-height:1}
.dpr .brand-copy small{display:block;font-size:9px;letter-spacing:4px;margin-top:5px;color:#777}
.dpr .brand-copy small b{color:#ed1251;font-size:11px}
.dpr .topbar h1{font-size:28px;margin:0;font-weight:700;letter-spacing:-.7px}
.dpr .filter-icon{justify-self:end;width:34px;height:34px;position:relative}
.dpr .filter-icon i{display:block;width:30px;height:2px;background:#17171a;margin:7px 0;position:relative}
.dpr .filter-icon i:after{content:"";position:absolute;width:7px;height:7px;border:2px solid #17171a;border-radius:50%;background:#fff;top:-4px}
.dpr .filter-icon i:nth-child(1):after{left:7px}.dpr .filter-icon i:nth-child(2):after{right:5px}.dpr .filter-icon i:nth-child(3):after{left:13px}

.dpr .sheet{width:min(100%,760px);margin:0 auto;background:#fff}
.dpr .sheet-head{height:76px;border:1px solid #f0f0f2;border-radius:16px 16px 0 0;display:flex;align-items:center;justify-content:center;position:relative}
.dpr .sheet-head h2{font-size:23px;margin:0;font-weight:700}
.dpr .close{position:absolute;left:18px;top:17px;font-size:35px;line-height:1;font-weight:300;color:#2c3035}
.dpr .section{padding:0 24px}
.dpr .section h3{font-size:18px;margin:19px 0 17px;display:flex;align-items:center;gap:12px}
.dpr .pink{color:var(--pink)}
.dpr .person{font-size:0;width:24px;height:24px;position:relative;line-height:1}
.dpr .person:before{content:"";position:absolute;width:9px;height:9px;background:var(--pink);border-radius:50%;top:-5px;left:2px}
.dpr .person:after{content:"";position:absolute;width:19px;height:11px;background:var(--pink);border-radius:10px 10px 3px 3px;left:1px;bottom:1px}

.dpr .preference-card{border:1px solid #ededf0;border-radius:16px;overflow:hidden;box-shadow:0 1px 5px rgba(0,0,0,.025)}
.dpr .gender-row{display:flex;align-items:center;gap:18px;padding:19px 22px 18px;border-bottom:1px solid #ededf0}
.dpr .gender-row>label{font-weight:600;font-size:16px;min-width:68px}
.dpr .segmented{display:grid;grid-template-columns:1fr 1.25fr 1.25fr;gap:12px;flex:1}
.dpr .segmented button,.dpr .choice-card button{height:50px;border:1px solid #e9e9ee;border-radius:13px;background:#fff;font-weight:600;font-size:15px;position:relative}
.dpr .segmented button.selected,.dpr .choice-card button.selected{border-color:#db6b94;background:var(--pink-soft);box-shadow:inset 0 0 0 1px #ed8aab}
.dpr .check{display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;background:var(--pink);color:white;border-radius:50%;font-size:15px;margin-left:5px}
.dpr .range-block{padding:27px 22px 24px;border-bottom:1px solid #ededf0}
.dpr .range-block:last-child{border-bottom:0}
.dpr .range-title{display:flex;justify-content:space-between;font-size:16px;font-weight:600}
.dpr .dual-range,.dpr .single-range{height:31px;position:relative;margin-top:20px;touch-action:none}
.dpr .track,.dpr .active-track{position:absolute;height:4px;top:13px;border-radius:5px}
.dpr .track{left:0;right:0;background:#dddde1}.dpr .active-track{left:0;right:0;background:var(--pink)}
.dpr .knob{position:absolute;width:22px;height:22px;background:var(--pink);border-radius:50%;top:4px;box-shadow:0 2px 6px rgba(233,0,82,.2);cursor:grab;touch-action:none}
.dpr .range-labels{display:flex;justify-content:space-between;font-size:14px;color:#424249;margin-top:0}
.dpr .distance-labels{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;margin-top:5px;color:#5f6067;font-size:13px}.dpr .distance-labels span:nth-child(2),.dpr .distance-labels span:nth-child(3){text-align:center}.dpr .distance-labels span:last-child{text-align:right}

.dpr .premium{margin:16px 24px 24px;padding:17px 18px;border-radius:15px;background:#f8f0ff;display:flex;align-items:center;gap:16px}
.dpr .crown{width:55px;height:55px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;color:#5e11c8;font-size:34px;box-shadow:0 2px 8px rgba(80,0,150,.08);flex:none}
.dpr .premium-copy{flex:1}.dpr .premium-copy strong{font-size:18px;color:#5f15bf}.dpr .premium-copy em{font-style:normal;font-size:11px;color:#7a3bc6;background:#eadcff;border-radius:8px;padding:3px 7px;margin-left:5px}.dpr .premium-copy p{font-size:14px;line-height:1.55;color:#68616f;margin:8px 0 0}
.dpr .upgrade{background:#6818d5;color:#fff;padding:13px 22px;border-radius:12px;font-weight:700;font-size:15px}

.dpr .simple-row{margin:0 24px 24px;border:1px solid #ededf0;border-radius:14px;min-height:75px;display:flex;align-items:center;justify-content:space-between;padding:0 21px;box-shadow:0 1px 4px rgba(0,0,0,.025);cursor:pointer}
.dpr .simple-row .left-content{display:flex;align-items:center;gap:13px}.dpr .outline-icon{font-size:28px}.dpr .value{font-size:16px;color:#5b5b62}.dpr .chevron{font-size:30px;vertical-align:-2px;margin-left:7px;color:#303038}
.dpr .relationship h3,.dpr .profile h3{margin-top:0}.dpr .heart{font-size:24px}.dpr .choice-card{border:1px solid #ededf0;border-radius:14px;padding:14px 12px;display:grid;grid-template-columns:1.7fr 1fr 1fr 1.2fr;gap:12px}.dpr .choice-card button{height:50px;font-size:14px;padding:0 8px}
.dpr .profile{margin-top:25px;padding-bottom:115px}.dpr .shield{font-size:23px}.dpr .switch-card{border:1px solid #ededf0;border-radius:14px;overflow:hidden}.dpr .switch-row{height:63px;display:flex;align-items:center;justify-content:space-between;padding:0 20px;border-bottom:1px solid #ededf0}.dpr .switch-row:last-child{border-bottom:0}.dpr .switch-label{font-size:16px;display:flex;align-items:center;gap:13px}.dpr .icon{font-size:20px;width:22px;text-align:center}.dpr .blue{color:#1689d8}.dpr .red{color:#df243d}.dpr .green{color:#17b56d}.dpr .switch{width:52px;height:31px;background:#ddd;border-radius:20px;padding:3px;transition:.2s}.dpr .switch span{display:block;width:25px;height:25px;border-radius:50%;background:#fff;transition:.2s}.dpr .switch.on{background:var(--pink)}.dpr .switch.on span{transform:translateX(21px)}

.dpr .bottom-actions{position:fixed;z-index:10;bottom:0;left:50%;transform:translateX(-50%);width:min(100%,760px);display:grid;grid-template-columns:1fr 1fr;gap:16px;padding:15px 24px calc(15px + env(safe-area-inset-bottom));background:rgba(255,255,255,.97);border-top:1px solid #eee}
.dpr .bottom-actions button{height:58px;border-radius:13px;font-size:17px;font-weight:700}.dpr .reset{border:2px solid #db5e8a;color:#cf356c;background:#fff}.dpr .reset span{font-size:24px;vertical-align:-2px;margin-right:6px}.dpr .apply{background:var(--pink);color:#fff;box-shadow:0 4px 12px rgba(233,0,82,.2)}.dpr .apply span{margin-right:7px;font-size:20px}

@media(min-width:900px){
  .dpr{padding:24px 0;background:#f1f1f4}.dpr .app{max-width:900px;min-height:calc(100vh - 48px);border-radius:22px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,.08)}.dpr .topbar{padding-left:34px;padding-right:34px}
}
@media(max-width:620px){
  .dpr .topbar{height:75px;padding:13px 18px 9px}.dpr .brand-copy strong{font-size:22px}.dpr .topbar h1{font-size:24px}.dpr .filter-icon{transform:scale(.85)}
  .dpr .sheet-head{height:65px;border-radius:14px 14px 0 0}.dpr .sheet-head h2{font-size:20px}.dpr .close{left:16px;top:12px}
  .dpr .section{padding:0 18px}.dpr .section h3{font-size:16px;margin:17px 0 14px}
  .dpr .gender-row{display:block;padding:17px 16px}.dpr .gender-row>label{display:block;margin-bottom:12px}.dpr .segmented{gap:7px}.dpr .segmented button{height:45px;font-size:13px}.dpr .check{width:21px;height:21px;font-size:13px}
  .dpr .range-block{padding:22px 16px}.dpr .range-title{font-size:15px}.dpr .knob{width:22px;height:22px}
  .dpr .premium{margin:14px 18px 20px;padding:14px 12px;gap:10px}.dpr .crown{width:50px;height:50px}.dpr .premium-copy strong{font-size:16px}.dpr .premium-copy p{font-size:12px}.dpr .upgrade{padding:11px 16px;font-size:14px}
  .dpr .simple-row{margin:0 18px 20px;min-height:68px;padding:0 16px}.dpr .value{font-size:14px}
  .dpr .choice-card{padding:11px 9px;gap:7px}.dpr .choice-card button{height:46px;font-size:12px}
  .dpr .profile{padding-bottom:105px}.dpr .switch-row{padding:0 14px;height:58px}.dpr .switch-label{font-size:14px}
  .dpr .bottom-actions{padding:12px 18px calc(12px + env(safe-area-inset-bottom));gap:10px}.dpr .bottom-actions button{height:54px;font-size:15px}
}
@media(max-width:390px){
  .dpr .brand-copy small{font-size:7px;letter-spacing:3px}.dpr .brand-copy strong{font-size:20px}.dpr .topbar h1{font-size:21px}
  .dpr .segmented{grid-template-columns:1fr 1.3fr 1.3fr}.dpr .segmented button{font-size:11px}.dpr .check{width:18px;height:18px;font-size:11px}
  .dpr .choice-card{grid-template-columns:1.65fr 1fr 1fr 1.15fr}.dpr .choice-card button{font-size:10px;padding:0 4px}
  .dpr .premium-copy p{font-size:11px}.dpr .upgrade{padding:10px 12px}.dpr .desktop-break{display:none}
}
`;