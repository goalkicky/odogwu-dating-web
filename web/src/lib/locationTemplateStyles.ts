export const LOCATION_TEMPLATE_CSS = `
        .ln{--b:#b31319;--c:#111;background:#d8d8d8;color:#171717;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;min-height:100svh;-webkit-tap-highlight-color:transparent}
        .ln *{margin:0;padding:0;box-sizing:border-box}
        .ln button{font:inherit;border:0;background:none;cursor:pointer}
        .ln .app{position:relative;width:min(100%,707px);margin:0 auto;min-height:100svh;background:#d8d8d8;overflow:hidden}
        .ln .app-header{height:180px;position:relative;display:flex;justify-content:center;padding-top:56px}
        .ln .back-arrow{position:absolute;left:31px;top:103px;width:15px;height:15px;border-left:2px solid #111;border-bottom:2px solid #111;transform:rotate(45deg);display:block;padding:0;cursor:pointer}
        .ln .logo{text-align:center;color:#b31319;user-select:none}
        .ln .logo-main{font-family:Georgia,"Times New Roman",serif;font-size:48px;line-height:48px;font-weight:700;letter-spacing:-2px}
        .ln .logo-main::before{content:"◔";font-size:45px;display:inline-block;margin-right:3px}
        .ln .logo-heart{font-size:17px;position:relative;top:-27px;margin-left:-2px}
        .ln .logo-sub{margin-top:7px;font-size:12px;font-weight:500;letter-spacing:7px;color:#222}
        .ln .logo-sub::before,.ln .logo-sub::after{content:"";display:inline-block;vertical-align:middle;width:26px;height:1px;background:#b31319;margin:0 11px}
        .ln .chat-icon{position:absolute;right:30px;top:101px;width:34px;height:28px;border:2px solid #111;border-radius:50%;display:block;padding:0}
        .ln .chat-icon::before{content:"";position:absolute;right:-3px;bottom:-5px;width:9px;height:9px;border-left:2px solid #111;transform:rotate(-30deg)}
        .ln .chat-dots{position:absolute;left:8px;top:7px;font-size:16px;letter-spacing:2px;color:#111}
        .ln .notification{position:absolute;top:-7px;right:-7px;width:22px;height:22px;border-radius:50%;background:#d9182d;color:white;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700}
        .ln .location-sheet{position:absolute;left:0;right:0;top:180px;bottom:0;background:#fff;border-radius:30px 30px 0 0;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 -2px 15px rgba(0,0,0,.06)}
        .ln .sheet-header{height:91px;flex-shrink:0;position:relative;display:flex;align-items:center;justify-content:center}
        .ln .sheet-title{font-size:25px;font-weight:700}
        .ln .close-button{position:absolute;left:30px;top:39px;width:22px;height:22px;display:block;padding:0;cursor:pointer}
        .ln .close-button::before,.ln .close-button::after{content:"";position:absolute;left:10px;top:-1px;width:2px;height:25px;background:#111;border-radius:2px}
        .ln .close-button::before{transform:rotate(45deg)}
        .ln .close-button::after{transform:rotate(-45deg)}
        .ln .search-container{padding:8px 29px 12px;flex-shrink:0}
        .ln .search-box{height:66px;border:1px solid #dedede;background:#fafafa;border-radius:32px;display:flex;align-items:center;padding:0 17px;box-shadow:inset 0 1px 3px rgba(0,0,0,.02)}
        .ln .search-icon{width:21px;height:21px;border:2px solid #9b9b9b;border-radius:50%;position:relative;flex-shrink:0}
        .ln .search-icon::after{content:"";position:absolute;width:8px;height:2px;background:#9b9b9b;right:-6px;bottom:-3px;transform:rotate(45deg);border-radius:2px}
        .ln .search-input{flex:1;border:none;outline:none;background:transparent;margin-left:17px;font-size:19px !important;color:#111}
        .ln .clear-button{width:27px;height:27px;border-radius:50%;background:#999;color:white;display:flex;align-items:center;justify-content:center;font-size:22px;line-height:1;cursor:pointer;padding:0}
        .ln .selected-country{margin:6px 29px 15px;min-height:88px;border-radius:18px;background:linear-gradient(90deg,#fff1f5,#fff3f6);display:flex;align-items:center;padding:13px 18px;flex-shrink:0}
        .ln .pin-icon{width:30px;height:38px;position:relative;margin-right:27px;flex-shrink:0}
        .ln .pin-icon::before{content:"";position:absolute;width:20px;height:26px;left:4px;top:1px;border:4px solid #ed1730;border-radius:50%}
        .ln .pin-icon::after{content:"";position:absolute;width:7px;height:7px;background:#fff;border:2px solid #ed1730;border-radius:50%;left:10px;top:10px}
        .ln .country-text{flex:1}
        .ln .country-name{font-size:20px;font-weight:700;margin-bottom:6px}
        .ln .country-type{font-size:16px;color:#777}
        .ln .check{width:29px;height:29px;border-radius:50%;background:#ed1730;position:relative;flex-shrink:0}
        .ln .check::after{content:"";position:absolute;width:10px;height:5px;border-left:3px solid white;border-bottom:3px solid white;left:8px;top:8px;transform:rotate(-45deg)}
        .ln .content-scroll{flex:1;overflow-y:auto;overflow-x:hidden;scrollbar-width:none;-ms-overflow-style:none}
        .ln .content-scroll::-webkit-scrollbar{display:none}
        .ln .city-heading{font-size:19px;font-weight:700;padding:5px 29px 9px}
        .ln .city-list{padding:0 29px}
        .ln .city-item{min-height:99px;border-bottom:1px solid #e1e1e1;display:flex;align-items:center;position:relative}
        .ln .city-image{width:72px;height:72px;border-radius:50%;object-fit:cover;flex-shrink:0;margin-right:17px;background:#ddd}
        .ln .city-info{min-width:0;padding-right:65px}
        .ln .city-name{font-size:20px;font-weight:700;margin-bottom:5px}
        .ln .city-location{font-size:16px;color:#777;white-space:nowrap}
        .ln .city-distance{position:absolute;right:0;font-size:17px;color:#777;white-space:nowrap}
        .ln .current-location{min-height:106px;margin:0 29px;display:flex;align-items:center;border-bottom:1px solid #eee;cursor:pointer}
        .ln .current-icon{width:66px;height:66px;border:1px solid #ddd;border-radius:50%;display:flex;align-items:center;justify-content:center;margin-right:17px;flex-shrink:0}
        .ln .current-pin{width:21px;height:27px;border:3px solid #777;border-radius:50%;position:relative}
        .ln .current-pin::after{content:"";position:absolute;width:5px;height:5px;border:2px solid #777;border-radius:50%;left:5px;top:6px}
        .ln .current-text{flex:1}
        .ln .current-title{font-size:18px;font-weight:700;margin-bottom:5px}
        .ln .current-subtitle{font-size:15px;color:#777}
        .ln .chevron{width:11px;height:11px;border-right:2px solid #777;border-top:2px solid #777;transform:rotate(45deg);margin-right:5px;flex-shrink:0}
        .ln .info-card{margin:15px 29px 14px;min-height:122px;border-radius:17px;background:#fff0f4;display:flex;align-items:center;padding:16px 20px;flex-shrink:0}
        .ln .world-icon{width:106px;height:82px;flex-shrink:0;position:relative;display:flex;align-items:center;justify-content:center;font-size:64px}
        .ln .world-icon::before{content:"🌎";filter:saturate(1.2)}
        .ln .info-text{padding-left:11px;min-width:0}
        .ln .info-title{font-size:19px;font-weight:700;margin-bottom:7px}
        .ln .info-description{color:#777;font-size:15px;line-height:1.4}
        .ln .bottom-action{padding:9px 26px 25px;background:white;flex-shrink:0}
        .ln .location-button{width:100%;height:74px;border:none;border-radius:22px;background:linear-gradient(180deg,#ff2a38 0%,#ee0e2e 100%);color:white;font-size:23px;font-weight:500;cursor:pointer;box-shadow:0 3px 7px rgba(230,0,30,.18);transition:transform .15s ease,opacity .15s ease}
        .ln .location-button:active{transform:scale(.985);opacity:.9}
        .ln .toast{position:fixed;z-index:60;left:50%;bottom:30px;transform:translateX(-50%) translateY(20px);background:#171717;color:#fff;padding:11px 17px;border-radius:30px;opacity:0;pointer-events:none;transition:.25s;font-size:14px;white-space:nowrap;max-width:calc(100% - 40px)}
        .ln .toast.show{opacity:1;transform:translateX(-50%) translateY(0)}
        @media(max-width:600px){
          .ln .app-header{height:130px;padding-top:28px}
          .ln .back-arrow{left:24px;top:78px}
          .ln .chat-icon{right:23px;top:76px}
          .ln .logo-main{font-size:36px;line-height:37px}
          .ln .logo-main::before{font-size:34px}
          .ln .logo-sub{font-size:9px;letter-spacing:5px}
          .ln .logo-sub::before,.ln .logo-sub::after{width:18px;margin:0 6px}
          .ln .location-sheet{top:130px;border-radius:27px 27px 0 0}
          .ln .sheet-header{height:72px}
          .ln .sheet-title{font-size:20px}
          .ln .close-button{left:22px;top:30px}
          .ln .search-container{padding:5px 18px 9px}
          .ln .search-box{height:56px}
          .ln .search-input{font-size:17px !important;margin-left:14px}
          .ln .selected-country{margin:5px 18px 11px;min-height:70px;border-radius:15px;padding:9px 14px}
          .ln .pin-icon{transform:scale(.82);margin-right:16px}
          .ln .country-name{font-size:17px;margin-bottom:3px}
          .ln .country-type{font-size:14px}
          .ln .city-heading{font-size:16px;padding:3px 18px 7px}
          .ln .city-list{padding:0 18px}
          .ln .city-item{min-height:79px}
          .ln .city-image{width:57px;height:57px;margin-right:13px}
          .ln .city-name{font-size:16px;margin-bottom:3px}
          .ln .city-location{font-size:13px}
          .ln .city-distance{font-size:14px}
          .ln .current-location{min-height:82px;margin:0 18px}
          .ln .current-icon{width:53px;height:53px;margin-right:13px}
          .ln .current-title{font-size:15px}
          .ln .current-subtitle{font-size:13px}
          .ln .info-card{margin:11px 18px 9px;min-height:95px;border-radius:14px;padding:11px 13px}
          .ln .world-icon{width:72px;height:65px;font-size:45px}
          .ln .info-text{padding-left:5px}
          .ln .info-title{font-size:15px;margin-bottom:4px}
          .ln .info-description{font-size:12px;line-height:1.35}
          .ln .bottom-action{padding:7px 18px 14px}
          .ln .location-button{height:57px;border-radius:17px;font-size:18px}
        }
        @media(max-height:700px){
          .ln .app-header{height:105px}
          .ln .location-sheet{top:105px}
          .ln .back-arrow{top:60px}
          .ln .chat-icon{top:59px}
          .ln .logo-main{font-size:31px;line-height:31px}
          .ln .sheet-header{height:57px}
          .ln .close-button{top:22px}
          .ln .search-box{height:49px}
          .ln .selected-country{min-height:62px}
          .ln .city-item{min-height:67px}
          .ln .city-image{width:50px;height:50px}
          .ln .current-location{min-height:70px}
          .ln .current-icon{width:45px;height:45px}
          .ln .info-card{min-height:82px}
          .ln .location-button{height:51px}
        }
`;