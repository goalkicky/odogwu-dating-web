export const PROFILE_TEMPLATE_CSS = `
        .ep{--red:#df003f;--red2:#e50046;--pink:#fff1f5;--text:#151515;--muted:#777;--line:#eee;--card:#fff;color:#151515;font-family:var(--font-montserrat),-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;-webkit-font-smoothing:antialiased}
        .ep *{box-sizing:border-box}
        .ep .app-shell{width:min(100%,710px);margin:auto;background:#fff;min-height:100vh;padding:8px 6px 10px}
        .uv-mobile>main{padding-left:4px!important;padding-right:4px!important}
        .uv-content-inner{padding-left:4px!important;padding-right:4px!important}
        .ep .topbar{height:85px;display:grid;grid-template-columns:50px 1fr 50px;align-items:center}
        .ep .icon-btn,.ep .chat-btn{border:0;background:transparent}
        .ep .back{font-size:43px;font-weight:200;line-height:1;text-align:left;color:#202020;transform:translateY(-2px);cursor:pointer;padding:0}
        .ep .brand-logo{justify-self:center;height:44px;width:auto;object-fit:contain;display:block}
        .ep .chat-btn{position:relative;font-size:24px;cursor:pointer}
        .ep .bubble{border:2px solid #222;border-radius:50%;padding:2px 5px;font-size:14px;letter-spacing:1px;display:inline-block;line-height:20px;position:relative}
        .ep .bubble:after{content:"";position:absolute;bottom:-5px;left:5px;border-width:5px 5px 0 0;border-style:solid;border-color:#222 transparent transparent transparent}
        .ep .chat-btn em{position:absolute;right:-2px;top:-5px;background:var(--red);color:#fff;width:22px;height:22px;border-radius:50%;font-size:12px;font-style:normal;display:grid;place-items:center;font-weight:700}
        .ep .intro{text-align:center;padding:4px 0 6px;position:relative}
        .ep .intro .intro-back{position:absolute;left:0;top:-1px;font-size:30px;font-weight:500;line-height:1;transform:none;padding:0}
        .ep .intro h1{font-size:14.5px;letter-spacing:-.3px;margin:0 0 2px;font-weight:700}
        .ep .intro p{font-size:8.5px;color:#777;margin:0;font-weight:500}
        .ep .intro p span{color:var(--red)}
        .ep .progress{display:flex;gap:5px;margin:11px 78px 4px}
        .ep .progress span{height:3px;background:#dd0050;border-radius:3px;flex:1}
        .ep .progress-label{font-size:9px;color:#c31a4d}
        .ep .missing{list-style:none;margin:6px 16px 0;padding:7px 11px;background:#fff4f6;border:1px solid #f6dfe5;border-radius:9px;font-size:11px;color:#a83455;text-align:left;line-height:1.7}
        .ep .card{border:1px solid #eee;border-radius:15px;margin-top:9px;padding:12px 6px 11px;background:#fff;box-shadow:0 1px 7px rgba(0,0,0,.025);min-width:0}
        .ep .interests-card{overflow:hidden}
        .ep .section-head{display:flex;align-items:center;gap:10px;padding:0 6px 8px}
        .ep .section-head h2{font-size:11px;margin:0;font-weight:700;letter-spacing:-.1px;line-height:1.2}
        .ep .section-head p{margin:1px 0 0;color:#000;font-size:9px;line-height:1.25;font-weight:500}
        .ep .section-head>div:first-child:not(.title-icon){flex:1}
        .ep .section-head strong{color:#cf1a4e;font-size:15px;white-space:nowrap}
        .ep .section-head strong.photo-count{font-size:10px;color:#c0315e;background:#fff1f5;border-radius:9px;padding:2px 7px;line-height:1.3;flex:none;display:flex;align-items:center;gap:4px}
        .ep .section-head strong.photo-count span{color:#c0315e;font-size:11px;line-height:1;margin-left:0}
        .ep .section-head strong.count{margin-left:auto;display:flex;align-items:center;gap:5px;flex:none}
        .ep .section-head strong.count span{color:#cf1a4e;font-size:17px;line-height:1;display:block}
        .ep .photo-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:6px;padding:0;margin:0 -6px}
        .ep .photo-item{height:168px;position:relative;overflow:hidden;border-radius:9px;background:#f5f5f5}
        .ep .photo-item img{width:100%;height:100%;object-fit:cover;display:block}
        .ep .remove{position:absolute;right:5px;top:5px;border:0;background:rgba(255,255,255,.93);width:20px;height:20px;border-radius:50%;font-size:19px;line-height:17px;color:#555;cursor:pointer}
        .ep .add-tile{height:168px;border:1px dashed #e5e5e5;background:#fff;border-radius:9px;color:#c71c4c;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:8px;cursor:pointer;font-family:inherit}
        .ep .add-tile span{font-size:18px;font-weight:200;line-height:1}
        .ep .add-tile small{font-size:8px;font-weight:700;color:#c71c4c}
        .ep .video-icon{font-size:25px!important}
        .ep .hint{background:#fff0f5;border-radius:6px;margin:7px 4px 0;padding:4px 6px;color:#5f5f5f;font-size:7px;font-weight:700}
        .ep .hint span{font-size:21px;color:#d31a4d;vertical-align:middle;margin-right:8px}
        .ep .title-icon{width:30px;height:30px;border-radius:8px;background:#fff0f5;color:#d4154c;display:grid;place-items:center;font-size:19px;flex:none}
        .ep .accordion-title{cursor:pointer}
        .ep .accordion-title>h2,.ep .accordion-title>.title-icon+h2{flex:1}
        .ep .accordion-title>div:nth-child(2){flex:1}
        .ep .accordion-title strong span{margin-left:5px;color:#777}
        .ep .info-grid{display:grid;grid-template-columns:1fr 1fr}
        .ep .info{min-height:38px;border:0;border-top:1px solid #eee;padding:5px 16px 3px 8px;position:relative;width:100%;background:transparent;text-align:left;font-family:inherit;cursor:pointer}
        .ep .info label{display:block;font-size:7.5px;color:#777;margin-bottom:1px}
        .ep .info b{display:block;font-size:8.5px;font-weight:500;color:#151515}
        .ep .info small{display:block;font-size:7.5px;color:#333;margin-top:1px}
        .ep .info span,.ep .about-body>span,.ep .interest em{position:absolute;right:10px;color:#cf164b;font-size:16px}
        .ep .info span{top:16px}
        .ep .about-body{position:relative;border:1px solid #f0f0f0;border-radius:10px;margin:0 4px;padding:7px 8px;font-size:8px;line-height:1.45;color:#404040;cursor:pointer}
        .ep .about-body>span{right:7px;bottom:7px}
        .ep .preferences{display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid #eee}
        .ep .pref{text-align:center;padding:8px 3px 3px;min-height:64px;border:0;border-right:1px dashed #ddd;background:transparent;font-family:inherit;cursor:pointer}
        .ep .pref:last-child{border:0}
        .ep .pref div{font-size:20px;color:#d5164d;height:24px}
        .ep .pref label{display:block;font-size:10px;color:#777;margin:3px 0}
        .ep .pref b{font-size:11px;color:#151515}
        .ep .interest-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;padding:0 4px}
        .ep .interest{--ic:clamp(11px,3.1vw,13px);--nm:clamp(8px,2.5vw,10px);--ct:clamp(5.5px,1.8vw,7px);min-width:0;min-height:calc(var(--ic) * 3.3);border:1px solid #eee;border-radius:11px;padding:calc(var(--ic) * .3) calc(var(--ic) * .9) calc(var(--ic) * .3) calc(var(--ic) * .34);display:flex;align-items:center;gap:calc(var(--ic) * .34);position:relative;background:#fff;font-family:inherit;width:100%;text-align:left}
        .ep .interest>span{font-size:var(--ic);width:calc(var(--ic) * 1.18);text-align:center;flex:none;line-height:1}
        .ep .interest .itxt{display:flex;flex-direction:column;gap:1px;min-width:0;flex:1}
        .ep .interest .icat{font-style:normal;font-size:var(--ct);font-weight:600;letter-spacing:.2px;line-height:1.35;text-transform:uppercase;color:#151515;background:none;border-radius:0;padding:0;max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .ep .interest b{font-size:var(--nm);font-weight:600;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#df003f}
        .ep .interest em{right:calc(var(--ic) * .34);top:50%;transform:translateY(-50%);font-style:normal;font-size:calc(var(--ic) * .72)}
        .ep .save{display:block;width:100%;border:0;border-radius:22px;background:#df003f;color:white;font-size:17px;font-weight:600;padding:11px 15px;margin:11px 0 6px;cursor:pointer;box-shadow:0 2px 4px rgba(223,0,63,.12);font-family:inherit}
        .ep .save:active{transform:scale(.99)}
        .ep .save:disabled{opacity:.6}
        .ep .logout{display:block;width:100%;border:1.5px solid #df003f;border-radius:22px;background:#fff;color:#df003f;font-size:16px;font-weight:600;padding:11px 15px;margin:0 0 8px;cursor:pointer;font-family:inherit}
        .ep .logout:active{transform:scale(.99)}
        .ep .footer-note{text-align:center;font-size:11px;color:#777;margin:0 0 0}
        .ep .home-indicator{display:none}
        .ep.toast,.ep .toast{position:fixed;left:50%;bottom:25px;transform:translate(-50%,20px);opacity:0;background:#222;color:#fff;padding:11px 18px;border-radius:22px;font-size:13px;transition:.25s;pointer-events:none;z-index:400;white-space:nowrap;max-width:calc(100% - 40px);overflow:hidden;text-overflow:ellipsis}
        .ep.toast.show,.ep .toast.show{opacity:1;transform:translate(-50%,0)}
        @media(max-width:620px){
          .ep .app-shell{padding:4px 5px 8px}
          .ep .topbar{height:72px}
          .ep .brand-logo{height:40px}
          .ep .intro{padding-top:4px}
          .ep .intro h1{font-size:13.5px}
          .ep .intro p{font-size:8px}
          .ep .progress{margin:9px 70px 4px;gap:4px}
          .ep .card{margin-top:8px;padding:10px 5px 9px}
          .ep .photo-grid{gap:5px;padding:0;margin:0 -5px}
          .ep .photo-item,.ep .add-tile{height:165px}
          .ep .section-head{padding:0 5px 7px;gap:9px}
          .ep .section-head h2{font-size:10px}
          .ep .section-head p{font-size:8px}
          .ep .info{padding-left:8px}
          .ep .interest-grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;padding:0 3px}
          .ep .save{font-size:16px}
          .ep .home-indicator{display:block;width:110px;height:4px;border-radius:5px;background:#111;margin:8px auto 0}
          .ep.toast,.ep .toast{bottom:92px}
        }
        @media(max-width:430px){
          .ep .app-shell{padding-left:4px;padding-right:4px}
          .ep .topbar{grid-template-columns:42px 1fr 42px}
          .ep .brand-logo{height:36px}
          .ep .photo-grid{grid-template-columns:repeat(6,1fr);gap:4px}
          .ep .photo-item,.ep .add-tile{height:88px}
          .ep .info-grid{grid-template-columns:1fr 1fr}
          .ep .info{min-height:36px}
          .ep .preferences .pref label{font-size:9px}
          .ep .preferences .pref b{font-size:10px}
          .ep .progress{margin-left:40px;margin-right:40px}
        }
        @media(max-width:350px){
          .ep .photo-item{height:78px}
          .ep .intro h1{font-size:12.5px}
          .ep .section-head h2{font-size:9.5px}
          .ep .pref b{font-size:9px}
        }
      `;