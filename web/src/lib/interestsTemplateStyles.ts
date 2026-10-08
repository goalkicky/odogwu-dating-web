export const INTERESTS_TEMPLATE_CSS = `
.pi{font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#17171b;-webkit-font-smoothing:antialiased;background:#fff}
.pi *{box-sizing:border-box}
.pi button{font:inherit;cursor:pointer}
.pi input{font:inherit}
.pi .app-shell{width:100%;max-width:1200px;min-height:100vh;background:#fff;margin:0 auto;padding:18px 8px}
.pi .head{position:relative;text-align:center;margin-top:4px}
.pi .back{position:absolute;left:0;top:-6px;border:0;background:none;font-size:29px;font-weight:300;line-height:1;padding:0;color:#111;outline:0}
.pi .head h1{font-size:18px;font-weight:700;letter-spacing:-.4px;line-height:1.2;margin:0}
.pi .counttop{position:absolute;right:0;top:2px;color:#c82a58;font-size:11.5px;font-weight:600}
.pi .head p{margin:6px 0 14px;color:#777b87;font-size:11.5px}
.pi .search{height:36px;border:1px solid #dedee3;border-radius:11px;display:flex;align-items:center;padding:0 10px;margin-bottom:16px}
.pi .search svg{width:16px;height:16px;color:#6f7480;flex:none}
.pi .search input{border:0;outline:0;width:100%;padding:0 8px;background:transparent;color:#222;font-size:11px}
.pi .search input::placeholder{color:#999ca7}
.pi section{margin-bottom:18px}
.pi .title{font-size:12.5px;font-weight:700;margin:0 0 13px}
.pi .grid{display:flex;flex-wrap:wrap;gap:12px 10px}
.pi .lang{height:44px;border:1px solid #e7e7eb;border-radius:13px;background:#fff;display:flex;align-items:center;justify-content:space-between;padding:0 5px 0 7px;font-size:11.5px;font-weight:700;min-width:0;text-align:left;width:auto;flex:1 1 auto}
.pi .lang>span:first-child{min-width:0;line-height:1.25}
.pi .plus{width:20px;height:20px;border:1.5px solid #777b85;border-radius:50%;display:grid;place-items:center;color:#666b76;font-size:15px;line-height:1;flex:none;margin-left:5px}
.pi .lang.selected{border:2px solid #e90058;background:#fff7fa}
.pi .lang.selected .plus{background:#e90058;border-color:#e90058;color:#fff;font-size:0}
.pi .lang.selected .plus:after{content:"✓";font-size:11.5px;font-weight:700}
.pi .selectedArea{margin-top:26px;border-top:1px solid #e9e9ed;padding-top:16px}
.pi .selhead{display:flex;justify-content:space-between;align-items:center;margin-bottom:15px}
.pi .selhead h2{font-size:12.5px;font-weight:500;margin:0}
.pi .clear{border:0;background:none;color:#d12c5a;font-size:11.5px;padding:3px 0}
.pi .empty{height:104px;border-radius:13px;background:#fff0f5;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center}
.pi .emptyIcon{position:relative;width:56px;height:46px;margin-bottom:7px}
.pi .globe{position:absolute;left:17px;top:0;width:29px;height:29px;border-radius:50%;background:#111;color:#fff;display:grid;place-items:center}
.pi .globe svg{width:19px;height:19px}
.pi .bubble{position:absolute;width:20px;height:20px;border-radius:50%;background:#e90058;color:#fff;font-weight:700;font-size:10px;display:grid;place-items:center}
.pi .b1{left:6px;top:22px}
.pi .b2{right:4px;top:14px}
.pi .empty p{margin:0;color:#666b78;font-size:10.5px}
.pi .selchips{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:12px}
.pi .chip{height:34px;border:1px solid #e90058;border-radius:17px;background:#fff7fa;display:flex;align-items:center;justify-content:space-between;padding:0 6px 0 12px;font-size:11.5px;gap:6px;min-width:0}
.pi .chip span:first-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pi .x{width:22px;height:22px;border:0;border-radius:50%;background:#e90058;color:#fff;font-size:13px;line-height:1;display:grid;place-items:center;flex:none;padding:0}
.pi .save{width:100%;height:52px;border:0;border-radius:26px;background:linear-gradient(90deg,#e90058,#ee0062);color:#fff;font-size:15px;font-weight:500;margin-top:22px}
.pi .save:disabled{opacity:.6}
.pi .home{width:110px;height:4px;background:#080808;border-radius:10px;margin:16px auto 0}
@media(min-width:769px){
 .pi .app-shell{margin:20px auto;min-height:calc(100vh - 40px);border-radius:24px;box-shadow:0 12px 50px rgba(0,0,0,.08)}
}
@media(max-width:600px){
 .pi .app-shell{padding:10px 5px 12px}
 .pi .head{margin-top:2px}
 .pi .back{font-size:26px}
 .pi .head h1{font-size:15px}
 .pi .counttop{font-size:10px}
 .pi .head p{font-size:9.5px;margin:5px 0 12px}
 .pi .search{height:32px;margin-bottom:14px}
 .pi .search input{font-size:10px}
 .pi .title{font-size:11.5px}
 .pi .grid{gap:10px 6px}
 .pi .lang{font-size:10px;height:40px;padding:0 4px 0 6px}
 .pi .plus{width:17px;height:17px;font-size:13px}
 .pi .selectedArea{margin-top:24px}
 .pi .selhead h2{font-size:11.5px}
 .pi .clear{font-size:11px}
 .pi .empty p{font-size:10px}
 .pi .save{height:48px;font-size:15px}
}
@media(max-width:430px){
 .pi .lang{font-size:9.5px;padding-left:6px;padding-right:4px}
 .pi .plus{width:16px;height:16px;font-size:12px}
}
@media(max-width:370px){
 .pi .app-shell{padding-left:4px;padding-right:4px}
 .pi .grid{gap:9px 5px}
 .pi .lang{height:38px;border-radius:12px;font-size:9px;padding-left:5px;padding-right:3px}
 .pi .plus{width:15px;height:15px;font-size:11px}
 .pi .head h1{font-size:13.5px}
 .pi .counttop{font-size:9px}
 .pi .chip{height:30px;font-size:10.5px}
}
`;
