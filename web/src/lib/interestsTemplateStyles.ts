export const INTERESTS_TEMPLATE_CSS = `
.pi{font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#17171b;-webkit-font-smoothing:antialiased;background:#fff}
.pi *{box-sizing:border-box}
.pi button{font:inherit;cursor:pointer}
.pi input{font:inherit}
.pi .app-shell{width:100%;max-width:768px;min-height:100vh;background:#fff;margin:0 auto;padding:18px 29px}
.pi .head{position:relative;text-align:center;margin-top:7px}
.pi .back{position:absolute;left:0;top:-8px;border:0;background:none;font-size:37px;font-weight:300;line-height:1;padding:0;color:#111;outline:0}
.pi .head h1{font-size:24px;font-weight:700;letter-spacing:-.5px;line-height:1.2;margin:0}
.pi .counttop{position:absolute;right:0;top:2px;color:#c82a58;font-size:14px;font-weight:600}
.pi .head p{margin:8px 0 24px;color:#777b87;font-size:15px}
.pi .search{height:64px;border:1px solid #dedee3;border-radius:18px;display:flex;align-items:center;padding:0 17px;margin-bottom:45px}
.pi .search svg{width:27px;height:27px;color:#6f7480;flex:none}
.pi .search input{border:0;outline:0;width:100%;padding:0 14px;background:transparent;color:#222;font-size:15px}
.pi .search input::placeholder{color:#999ca7}
.pi section{margin-bottom:34px}
.pi .title{font-size:16px;font-weight:600;margin:0 0 27px}
.pi .grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:19px 17px}
.pi .lang{height:60px;border:1px solid #e7e7eb;border-radius:18px;background:#fff;display:flex;align-items:center;justify-content:space-between;padding:0 14px 0 17px;font-size:14px;min-width:0;text-align:left;width:100%}
.pi .lang>span:first-child{min-width:0;line-height:1.25}
.pi .plus{width:24px;height:24px;border:1.5px solid #777b85;border-radius:50%;display:grid;place-items:center;color:#666b76;font-size:19px;line-height:1;flex:none;margin-left:6px}
.pi .lang.selected{border:2px solid #e90058;background:#fff7fa}
.pi .lang.selected .plus{background:#e90058;border-color:#e90058;color:#fff;font-size:0}
.pi .lang.selected .plus:after{content:"✓";font-size:14px;font-weight:700}
.pi .selectedArea{margin-top:58px;border-top:1px solid #e9e9ed;padding-top:31px}
.pi .selhead{display:flex;justify-content:space-between;align-items:center;margin-bottom:34px}
.pi .selhead h2{font-size:16px;font-weight:500;margin:0}
.pi .clear{border:0;background:none;color:#d12c5a;font-size:15px;padding:4px 0}
.pi .empty{height:151px;border-radius:18px;background:#fff0f5;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center}
.pi .emptyIcon{position:relative;width:70px;height:58px;margin-bottom:10px}
.pi .globe{position:absolute;left:21px;top:0;width:36px;height:36px;border-radius:50%;background:#111;color:#fff;display:grid;place-items:center}
.pi .globe svg{width:24px;height:24px}
.pi .bubble{position:absolute;width:25px;height:25px;border-radius:50%;background:#e90058;color:#fff;font-weight:700;font-size:12px;display:grid;place-items:center}
.pi .b1{left:8px;top:27px}
.pi .b2{right:5px;top:18px}
.pi .empty p{margin:0;color:#666b78;font-size:13px}
.pi .selchips{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:20px}
.pi .chip{height:44px;border:1px solid #e90058;border-radius:22px;background:#fff7fa;display:flex;align-items:center;justify-content:space-between;padding:0 8px 0 15px;font-size:14px;gap:8px;min-width:0}
.pi .chip span:first-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pi .x{width:26px;height:26px;border:0;border-radius:50%;background:#e90058;color:#fff;font-size:16px;line-height:1;display:grid;place-items:center;flex:none;padding:0}
.pi .save{width:100%;height:67px;border:0;border-radius:36px;background:linear-gradient(90deg,#e90058,#ee0062);color:#fff;font-size:20px;font-weight:500;margin-top:42px}
.pi .save:disabled{opacity:.6}
.pi .home{width:133px;height:5px;background:#080808;border-radius:10px;margin:30px auto 0}
@media(min-width:769px){
 .pi .app-shell{margin:20px auto;min-height:calc(100vh - 40px);border-radius:24px;box-shadow:0 12px 50px rgba(0,0,0,.08)}
}
@media(max-width:600px){
 .pi .app-shell{padding:13px 29px 15px}
 .pi .head{margin-top:4px}
 .pi .back{font-size:34px}
 .pi .head h1{font-size:20px}
 .pi .counttop{font-size:12px}
 .pi .head p{font-size:12px;margin:8px 0 22px}
 .pi .search{height:64px;margin-bottom:45px}
 .pi .search input{font-size:14px}
 .pi .title{font-size:15px}
 .pi .grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:16px 14px}
 .pi .lang{font-size:13px}
 .pi .selectedArea{margin-top:58px}
 .pi .selhead h2{font-size:15px}
 .pi .clear{font-size:14px}
 .pi .empty p{font-size:12.5px}
 .pi .save{height:66px;font-size:20px}
}
@media(max-width:430px){
 .pi .app-shell{padding-left:21px;padding-right:21px}
 .pi .grid{grid-template-columns:repeat(2,minmax(0,1fr))}
 .pi .lang{font-size:12px;padding-left:14px;padding-right:10px}
 .pi .plus{width:23px;height:23px}
}
@media(max-width:370px){
 .pi .app-shell{padding-left:18px;padding-right:18px}
 .pi .grid{gap:15px 10px}
 .pi .lang{height:56px;border-radius:16px;font-size:11px;padding-left:12px;padding-right:9px}
 .pi .plus{width:22px;height:22px}
 .pi .head h1{font-size:18px}
 .pi .counttop{font-size:10px}
 .pi .chip{height:40px;font-size:12.5px}
}
`;