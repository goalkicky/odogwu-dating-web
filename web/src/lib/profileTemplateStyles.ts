export const PROFILE_TEMPLATE_CSS = `
        .ep{--red:#df003f;--red2:#e50046;--pink:#fff1f5;--text:#151515;--muted:#777;--line:#eee;--card:#fff;color:#151515;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;-webkit-font-smoothing:antialiased}
        .ep *{box-sizing:border-box}
        .ep .app-shell{width:min(100%,710px);margin:auto;background:#fff;min-height:100vh;padding:14px 14px 14px}
        .uv-mobile>main{padding-left:8px!important;padding-right:8px!important}
        .uv-content-inner{padding-left:8px!important;padding-right:8px!important}
        .ep .topbar{height:85px;display:grid;grid-template-columns:50px 1fr 50px;align-items:center}
        .ep .icon-btn,.ep .chat-btn{border:0;background:transparent}
        .ep .back{font-size:43px;font-weight:200;line-height:1;text-align:left;color:#202020;transform:translateY(-2px);cursor:pointer;padding:0}
        .ep .brand-logo{justify-self:center;height:44px;width:auto;object-fit:contain;display:block}
        .ep .chat-btn{position:relative;font-size:24px;cursor:pointer}
        .ep .bubble{border:2px solid #222;border-radius:50%;padding:2px 5px;font-size:14px;letter-spacing:1px;display:inline-block;line-height:20px;position:relative}
        .ep .bubble:after{content:"";position:absolute;bottom:-5px;left:5px;border-width:5px 5px 0 0;border-style:solid;border-color:#222 transparent transparent transparent}
        .ep .chat-btn em{position:absolute;right:-2px;top:-5px;background:var(--red);color:#fff;width:22px;height:22px;border-radius:50%;font-size:12px;font-style:normal;display:grid;place-items:center;font-weight:700}
        .ep .intro{text-align:center;padding:8px 0 11px}
        .ep .intro h1{font-size:25px;letter-spacing:-.6px;margin:0 0 4px;font-weight:700}
        .ep .intro p{font-size:15px;color:#777;margin:0}
        .ep .intro p span{color:var(--red)}
        .ep .progress{display:flex;gap:7px;margin:22px 84px 9px}
        .ep .progress span{height:6px;background:#dd0050;border-radius:5px;flex:1}
        .ep .progress-label{font-size:12px;color:#c31a4d}
        .ep .missing{list-style:none;margin:8px 20px 0;padding:8px 12px;background:#fff4f6;border:1px solid #f6dfe5;border-radius:9px;font-size:11px;color:#a83455;text-align:left;line-height:1.7}
        .ep .card{border:1px solid #eee;border-radius:15px;margin-top:14px;padding:16px 10px 15px;background:#fff;box-shadow:0 1px 7px rgba(0,0,0,.025)}
        .ep .section-head{display:flex;align-items:center;gap:12px;padding:0 10px 11px}
        .ep .section-head h2{font-size:18px;margin:0;font-weight:700;letter-spacing:-.3px}
        .ep .section-head p{margin:2px 0 0;color:#777;font-size:12px}
        .ep .section-head>div:first-child:not(.title-icon){flex:1}
        .ep .section-head strong{color:#cf1a4e;font-size:15px;white-space:nowrap}
        .ep .photo-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:12px;padding:0 7px}
        .ep .photo-item{height:168px;position:relative;overflow:hidden;border-radius:9px;background:#f5f5f5}
        .ep .photo-item img{width:100%;height:100%;object-fit:cover;display:block}
        .ep .remove{position:absolute;right:5px;top:5px;border:0;background:rgba(255,255,255,.93);width:20px;height:20px;border-radius:50%;font-size:19px;line-height:17px;color:#555;cursor:pointer}
        .ep .add-tile{height:168px;border:1px dashed #e5e5e5;background:#fff;border-radius:9px;color:#c71c4c;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:8px;cursor:pointer;font-family:inherit}
        .ep .add-tile span{font-size:32px;font-weight:200;line-height:1}
        .ep .add-tile small{font-size:11px;color:#c71c4c}
        .ep .video-icon{font-size:25px!important}
        .ep .hint{background:#fff0f5;border-radius:6px;margin:8px 7px 0;padding:4px 6px;color:#5f5f5f;font-size:7px;font-weight:700}
        .ep .hint span{font-size:21px;color:#d31a4d;vertical-align:middle;margin-right:8px}
        .ep .title-icon{width:35px;height:35px;border-radius:8px;background:#fff0f5;color:#d4154c;display:grid;place-items:center;font-size:23px;flex:none}
        .ep .accordion-title{cursor:pointer}
        .ep .accordion-title>h2,.ep .accordion-title>.title-icon+h2{flex:1}
        .ep .accordion-title>div:nth-child(2){flex:1}
        .ep .accordion-title strong span{margin-left:5px;color:#777}
        .ep .info-grid{display:grid;grid-template-columns:1fr 1fr}
        .ep .info{min-height:61px;border:0;border-top:1px solid #eee;padding:10px 25px 7px 10px;position:relative;width:100%;background:transparent;text-align:left;font-family:inherit;cursor:pointer}
        .ep .info label{display:block;font-size:11px;color:#777;margin-bottom:4px}
        .ep .info b{display:block;font-size:12px;font-weight:500;color:#151515}
        .ep .info small{display:block;font-size:11px;color:#333;margin-top:2px}
        .ep .info span,.ep .about-body>span,.ep .interest em{position:absolute;right:10px;color:#cf164b;font-size:16px}
        .ep .info span{top:29px}
        .ep .about-body{position:relative;border:1px solid #f0f0f0;border-radius:10px;margin:0 7px;padding:13px 14px;font-size:12px;line-height:1.6;color:#404040;cursor:pointer}
        .ep .about-body>span{right:12px;bottom:13px}
        .ep .preferences{display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid #eee}
        .ep .pref{text-align:center;padding:12px 3px 3px;min-height:81px;border:0;border-right:1px dashed #ddd;background:transparent;font-family:inherit;cursor:pointer}
        .ep .pref:last-child{border:0}
        .ep .pref div{font-size:22px;color:#d5164d;height:29px}
        .ep .pref label{display:block;font-size:10px;color:#777;margin:3px 0}
        .ep .pref b{font-size:11px;color:#151515}
        .ep .interest-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;padding:0 7px}
        .ep .interest{min-height:50px;border:1px solid #eee;border-radius:12px;padding:0 26px 0 8px;display:flex;align-items:center;gap:8px;position:relative;background:#fff;font-family:inherit;width:100%;text-align:left}
        .ep .interest>span{font-size:20px;width:27px;text-align:center;flex:none}
        .ep .interest b{font-size:11px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#151515}
        .ep .interest em{right:9px;top:50%;transform:translateY(-50%);font-style:normal}
        .ep .save{display:block;width:100%;border:0;border-radius:22px;background:#df003f;color:white;font-size:17px;font-weight:600;padding:11px 15px;margin:19px 0 10px;cursor:pointer;box-shadow:0 2px 4px rgba(223,0,63,.12);font-family:inherit}
        .ep .save:active{transform:scale(.99)}
        .ep .save:disabled{opacity:.6}
        .ep .logout{display:block;width:100%;border:1.5px solid #df003f;border-radius:22px;background:#fff;color:#df003f;font-size:16px;font-weight:600;padding:11px 15px;margin:0 0 10px;cursor:pointer;font-family:inherit}
        .ep .logout:active{transform:scale(.99)}
        .ep .footer-note{text-align:center;font-size:12px;color:#777;margin:0 0 4px}
        .ep .home-indicator{display:none}
        .ep.toast,.ep .toast{position:fixed;left:50%;bottom:25px;transform:translate(-50%,20px);opacity:0;background:#222;color:#fff;padding:11px 18px;border-radius:22px;font-size:13px;transition:.25s;pointer-events:none;z-index:400;white-space:nowrap;max-width:calc(100% - 40px);overflow:hidden;text-overflow:ellipsis}
        .ep.toast.show,.ep .toast.show{opacity:1;transform:translate(-50%,0)}
        @media(max-width:620px){
          .ep .app-shell{padding:6px 8px 12px}
          .ep .topbar{height:72px}
          .ep .brand-logo{height:40px}
          .ep .intro{padding-top:7px}
          .ep .intro h1{font-size:22px}
          .ep .intro p{font-size:13px}
          .ep .progress{margin:20px 75px 9px;gap:6px}
          .ep .card{margin-top:12px;padding:14px 8px}
          .ep .photo-grid{gap:8px;padding:0 5px}
          .ep .photo-item,.ep .add-tile{height:165px}
          .ep .section-head{padding:0 8px 10px;gap:9px}
          .ep .section-head h2{font-size:16px}
          .ep .section-head p{font-size:10px}
          .ep .info{padding-left:8px}
          .ep .interest-grid{grid-template-columns:1fr 1fr;gap:7px}
          .ep .interest:nth-child(9){grid-column:2}
          .ep .interest:nth-child(10){grid-column:1}
          .ep .save{font-size:16px}
          .ep .home-indicator{display:block;width:135px;height:5px;border-radius:5px;background:#111;margin:20px auto 0}
          .ep.toast,.ep .toast{bottom:92px}
        }
        @media(max-width:430px){
          .ep .app-shell{padding-left:6px;padding-right:6px}
          .ep .topbar{grid-template-columns:42px 1fr 42px}
          .ep .brand-logo{height:36px}
          .ep .photo-grid{grid-template-columns:repeat(6,1fr);gap:8px}
          .ep .photo-item,.ep .add-tile{height:88px}
          .ep .info-grid{grid-template-columns:1fr 1fr}
          .ep .info{min-height:62px}
          .ep .preferences .pref label{font-size:9px}
          .ep .preferences .pref b{font-size:10px}
          .ep .interest{min-height:46px}
          .ep .interest b{font-size:10px}
          .ep .progress{margin-left:45px;margin-right:45px}
        }
        @media(max-width:350px){
          .ep .photo-item{height:78px}
          .ep .intro h1{font-size:20px}
          .ep .section-head h2{font-size:15px}
          .ep .interest>span{font-size:18px;width:23px}
          .ep .interest{padding-right:20px}
          .ep .interest b{font-size:9px}
          .ep .pref b{font-size:9px}
        }
      `;