var e=(e,t,n)=>()=>{if(n)throw n[0];try{return e&&(t=e(e=0)),t}catch(e){throw n=[e],e}},t=(e,t)=>()=>(t||(e((t={exports:{}}).exports,t),e=null),t.exports);(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var n,r,i=e((()=>{n=`http://localhost:3000`,r=class{static async getCars(){try{let e=await fetch(`${n}/garage`);if(!e.ok)throw Error(`Error of loading...`);return await e.json()}catch(e){return console.error(`Error getCars:`,e),[]}}static async createCar(e,t){try{let r=await fetch(`${n}/garage`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({name:e,color:t})});if(!r.ok)throw Error(`Ошибка создания`);return await r.json()}catch(e){return console.error(`Error createCar:`,e),null}}static async deleteCar(e){try{return(await fetch(`${n}/garage/${e}`,{method:`DELETE`})).ok}catch(e){return console.error(`Error deleteCar:`,e),!1}}static async updateCar(e,t,r){try{let i=await fetch(`${n}/garage/${e}`,{method:`PUT`,headers:{"Content-Type":`application/json`},body:JSON.stringify({name:t,color:r})});if(!i.ok)throw Error(`Ошибка обновления`);return await i.json()}catch(e){return console.error(`Ошибка updateCar:`,e),null}}static async controlEngine(e,t){try{let r=await fetch(`${n}/engine?id=${e}&status=${t}`,{method:`PATCH`});if(!r.ok)throw r.status===404?Error(`Car ${e} not found`):Error(`Failed to ${t} engine for car ${e}`);return await r.json()}catch(e){return console.error(`Error ${t} engine:`,e),null}}static async driveMode(e){let t=await fetch(`${n}/engine?id=${e}&status=drive`,{method:`PATCH`});if(!t.ok)throw t.status===500?Error(`ENGINE_BROKEN`):t.status===429?Error(`RACE_IN_PROGRESS`):t.status===404?Error(`CAR_NOT_FOUND`):Error(`Failed to switch to drive mode for car ${e}`);return t.json()}static async raceCar(e){try{let t=await this.controlEngine(e,`started`);if(!t)throw Error(`Failed to start engine`);let n=t.distance/t.velocity/1e3;return await this.driveMode(e),n}catch(t){return t instanceof Error&&t.message===`ENGINE_BROKEN`?(console.log(`Car ${e} broke down during race`),null):(console.error(`Car ${e} race failed:`,t),null)}}static async getWinners(){try{let e=await fetch(`${n}/winners`);if(!e.ok)throw Error(`Error loading winners`);return await e.json()}catch(e){return console.error(`Error getWinners:`,e),[]}}static async getWinner(e){try{let t=await fetch(`${n}/winners/${e}`);if(!t.ok){if(t.status===404)return null;throw Error(`Error loading winner`)}return await t.json()}catch(e){return console.error(`Error getWinner:`,e),null}}static async createWinner(e,t,r){try{let i=await fetch(`${n}/winners`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({id:e,wins:t,time:r})});if(!i.ok){if(i.status===500)return console.log(`Winner already exists`),null;throw Error(`Error creating winner`)}return await i.json()}catch(e){return console.error(`Error createWinner:`,e),null}}static async updateWinner(e,t,r){try{let i=await fetch(`${n}/winners/${e}`,{method:`PUT`,headers:{"Content-Type":`application/json`},body:JSON.stringify({wins:t,time:r})});if(!i.ok){if(i.status===404)return null;throw Error(`Error updating winner`)}return await i.json()}catch(e){return console.error(`Error updateWinner:`,e),null}}static async saveWinner(e,t){try{let n=await this.getWinner(e);if(n){let r=n.wins+1,i=Math.min(n.time,t);await this.updateWinner(e,r,i),console.log(`✅ Winner ${e} updated: ${r} wins, best time: ${i}s`)}else await this.createWinner(e,1,t),console.log(`✅ New winner ${e} created with time ${t}s`)}catch(e){console.error(`Error saving winner:`,e)}}}})),a,o,s=e((()=>{a=`http://127.0.0.1:3000`,o=class e{static{this.instance=null}constructor(){}static getInstance(){return e.instance===null&&(e.instance=new e),e.instance}async getWinners(e=1){let t=await fetch(`${a}/winners?_page=${e}&_limit=10`),n=t.headers.get(`X-Total-Count`),r=n===null?0:Number(n);return{data:await t.json(),total:r}}async getAllWinners(){return await(await fetch(`${a}/winners`)).json()}async addWinner(e,t,n){return await(await fetch(`${a}/winners`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({id:e,wins:t,time:n})})).json()}async updateWinner(e,t,n){return await(await fetch(`${a}/winners/${e}`,{method:`PUT`,headers:{"Content-Type":`application/json`},body:JSON.stringify({wins:t,time:n})})).json()}async deleteWinner(e){let t=await fetch(`${a}/winners/${e}`,{method:`DELETE`});if(!t.ok)throw Error(`Failed to delete winner with id ${e}: ${t.status}`)}}})),c,l=e((()=>{i(),s(),c=class{constructor(){this.currentPage=1,this.carsPerPage=7,this.animationFrames=new Map,this.carStates=new Map,this.exhaustIntervals=new Map,this.smokeIntervals=new Map,this.fireworkIntervals=new Map,this.createColor=`#ffffff`,this.createName=``,this.updateName=``,this.updateColor=`#ffffff`,this.selectedCarId=null,this.resizeHandlers=new Map,this.carProgressData=new Map,this.carService=new r,this.winnersAPI=o.getInstance(),this.addStyles()}addStyles(){let e=document.createElement(`style`);e.textContent=`
      /* Общие стили */
      .garage-view {
        background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
        min-height: 100vh;
        padding: 20px;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      }

      /* Заголовок */
      .car-info-page {
        display: flex;
        justify-content: space-between;
        padding: 15px 0;
        color: #fff;
        border-bottom: 2px solid rgba(255, 215, 0, 0.3);
        margin-bottom: 25px;
        position: relative;
      }
      .car-info-page .car-name {
        font-size: 28px;
        font-weight: 700;
        background: linear-gradient(90deg, #ffd700, #ff6b6b);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-shadow: 0 0 30px rgba(255, 215, 0, 0.3);
      }
      .car-info-page .page-name {
        font-size: 18px;
        color: #888;
        background: rgba(255,255,255,0.05);
        padding: 5px 15px;
        border-radius: 20px;
        border: 1px solid rgba(255,255,255,0.1);
      }

      /* Карточка машины */
      .car-card {
        background: linear-gradient(135deg, #1a1a2e, #16213e);
        border-radius: 16px;
        padding: 15px 20px;
        margin-bottom: 15px;
        border: 1px solid rgba(255,255,255,0.05);
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }
      .car-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
        transition: left 0.5s ease;
      }
      .car-card:hover::before {
        left: 100%;
      }
      .car-card:hover {
        transform: translateX(5px);
        border-color: rgba(255, 215, 0, 0.2);
        box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      }

      /* Кнопки */
      .car-actions button {
        padding: 6px 16px;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .select-btn {
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
      }
      .select-btn:hover {
        transform: scale(1.05);
        box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
      }
      .remove-btn {
        background: linear-gradient(135deg, #f093fb, #f5576c);
        color: white;
      }
      .remove-btn:hover {
        transform: scale(1.05);
        box-shadow: 0 4px 20px rgba(245, 87, 108, 0.4);
      }

      /* Кнопки двигателя */
      .car-engine button {
        width: 36px;
        height: 36px;
        border: none;
        border-radius: 50%;
        font-size: 16px;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .start-btn {
        background: linear-gradient(135deg, #00b894, #00cec9);
        color: white;
        box-shadow: 0 2px 10px rgba(0, 206, 201, 0.3);
      }
      .start-btn:hover:not(:disabled) {
        transform: scale(1.1);
        box-shadow: 0 4px 20px rgba(0, 206, 201, 0.5);
      }
      .start-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .stop-btn {
        background: linear-gradient(135deg, #fd79a8, #e17055);
        color: white;
        box-shadow: 0 2px 10px rgba(225, 112, 85, 0.3);
      }
      .stop-btn:hover:not(:disabled) {
        transform: scale(1.1);
        box-shadow: 0 4px 20px rgba(225, 112, 85, 0.5);
      }
      .stop-btn:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }

      /* Имя машины */
      .car-name {
        font-size: 18px;
        font-weight: 600;
        color: #ffcc41;
        text-shadow: 0 0 20px rgba(255, 204, 65, 0.2);
      }

      /* Трек */
      .car-track {
        background: linear-gradient(180deg, #1a1a2e 0%, #2d2d2d 100%) !important;
        border-radius: 12px !important;
        overflow: hidden !important;
        height: 120px !important;
        position: relative;
        box-shadow: inset 0 2px 20px rgba(0,0,0,0.5);
      }
      .car-track::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: repeating-linear-gradient(90deg, rgba(255,255,255,0.1) 0px, rgba(255,255,255,0.1) 20px, transparent 20px, transparent 40px);
      }

      /* Флаг финиша */
      .flag {
        filter: drop-shadow(0 0 10px rgba(255, 0, 0, 0.5));
        animation: flagWave 1s ease-in-out infinite;
      }
      @keyframes flagWave {
        0%, 100% { transform: translateY(-50%) rotate(0deg); }
        50% { transform: translateY(-50%) rotate(5deg); }
      }

      /* Контролы */
      .controls {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 15px;
        padding: 20px;
        background: rgba(255,255,255,0.03);
        border-radius: 16px;
        border: 1px solid rgba(255,255,255,0.05);
        margin-bottom: 25px;
      }
      .wrapper {
        display: flex;
        gap: 10px;
        align-items: center;
        flex-wrap: wrap;
      }
      .wrapper input[type="text"] {
        padding: 10px 16px;
        border-radius: 10px;
        border: 1px solid rgba(255,255,255,0.1);
        background: rgba(255,255,255,0.05);
        color: #fff;
        font-size: 14px;
        transition: all 0.3s ease;
        min-width: 150px;
      }
      .wrapper input[type="text"]:focus {
        outline: none;
        border-color: #ffd700;
        box-shadow: 0 0 20px rgba(255, 215, 0, 0.1);
      }
      .wrapper input[type="color"] {
        width: 44px;
        height: 44px;
        border: none;
        border-radius: 10px;
        cursor: pointer;
        background: none;
        padding: 0;
      }
      .wrapper input[type="color"]::-webkit-color-swatch-wrapper {
        padding: 2px;
      }
      .wrapper input[type="color"]::-webkit-color-swatch {
        border: 2px solid rgba(255,255,255,0.1);
        border-radius: 8px;
      }
      .wrapper button {
        padding: 10px 24px;
        border: none;
        border-radius: 10px;
        font-weight: 600;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s ease;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      #create-car {
        background: linear-gradient(135deg, #00b894, #00cec9);
        color: white;
      }
      #create-car:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 20px rgba(0, 206, 201, 0.4);
      }
      .update-btn {
        background: linear-gradient(135deg, #fdcb6e, #f39c12);
        color: white;
      }
      .update-btn:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 4px 20px rgba(243, 156, 18, 0.4);
      }
      .update-btn:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }

      /* Кнопки гонки */
      .race-controls {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }
      .race-controls button {
        padding: 10px 24px;
        border: none;
        border-radius: 10px;
        font-weight: 600;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s ease;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      #race-btn {
        background: linear-gradient(135deg, #ff6b6b, #ee5a24);
        color: white;
        box-shadow: 0 4px 15px rgba(238, 90, 36, 0.3);
      }
      #race-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 25px rgba(238, 90, 36, 0.5);
      }
      #reset-btn {
        background: linear-gradient(135deg, #a29bfe, #6c5ce7);
        color: white;
        box-shadow: 0 4px 15px rgba(108, 92, 231, 0.3);
      }
      #reset-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 25px rgba(108, 92, 231, 0.5);
      }
      #generate-btn {
        background: linear-gradient(135deg, #fd79a8, #e17055);
        color: white;
        box-shadow: 0 4px 15px rgba(225, 112, 85, 0.3);
      }
      #generate-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 25px rgba(225, 112, 85, 0.5);
      }

      /* Пагинация */
      .pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 20px;
        padding: 25px 0;
        color: #fff;
      }
      .pagination button {
        padding: 10px 24px;
        border: none;
        border-radius: 10px;
        font-weight: 600;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s ease;
        background: linear-gradient(135deg, #636e72, #2d3436);
        color: white;
      }
      .pagination button:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 4px 20px rgba(0,0,0,0.4);
        background: linear-gradient(135deg, #ffd700, #f39c12);
      }
      .pagination button:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }
      .pagination span {
        font-size: 16px;
        padding: 8px 20px;
        background: rgba(255,255,255,0.05);
        border-radius: 20px;
        border: 1px solid rgba(255,255,255,0.05);
      }

      /* Анимация машины */
      .car-image {
        filter: drop-shadow(0 4px 15px rgba(255, 215, 0, 0.2));
        transition: transform 0.3s ease;
      }
      .car-image-wrapper {
        position: relative;
      }

      /* Speedometer */
      .car-speed {
        font-family: 'Courier New', monospace;
        font-weight: 700;
        padding: 2px 10px;
        background: rgba(0,0,0,0.5);
        border-radius: 6px;
        border: 1px solid rgba(76, 175, 80, 0.3);
      }

      /* Race time */
      .race-time {
        font-family: 'Courier New', monospace;
        font-weight: 700;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.1);
      }

      /* Empty message */
      .empty-message {
        text-align: center;
        padding: 60px 20px;
        font-size: 24px;
        color: #555;
        background: rgba(255,255,255,0.02);
        border-radius: 16px;
        border: 2px dashed rgba(255,255,255,0.05);
      }

      /* Анимации для сообщения */
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translate(-50%, -50%) scale(0.8);
        }
        to {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1);
        }
      }
      @keyframes bounce {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }
    `,document.head.appendChild(e)}renderCars(e){return e.length===0?`<div class="empty-message">🚗 No cars in the garage</div>`:[...e].sort((e,t)=>e.id-t.id).map((e,t)=>{let n=t+1;return`
        <div class="car-card" data-car-id="${e.id}">
          <div class="car-actions">
            <button class="select-btn" data-id="${e.id}">SELECT</button>
            <button class="remove-btn" data-id="${e.id}" data-number="${n}">REMOVE</button>
          </div>
          <div class="car-info">
            <div class="car-engine">
              <button class="start-btn" data-id="${e.id}">▶</button>
              <button class="stop-btn" data-id="${e.id}" disabled>⏹</button>
            </div>
            <span class="car-name" style="color: #ffcc41">${e.name}</span>
            <div class="car-speed" id="speed-${e.id}" style="display: none; color: #4caf50; font-size: 12px; margin-left: 10px;">0 km/h</div>
          </div>
          <div class="car-track" style="position: relative; background: linear-gradient(180deg, #2d2d2d 0%, #3d3d3d 100%); border-radius: 10px; overflow: hidden; height: 120px;">
            <div style="position: absolute; bottom: 0; width: 100%; height: 100%;">
              <div style="position: absolute; bottom: 20px; width: 100%; height: 2px; background: repeating-linear-gradient(90deg, #fff 0px, #fff 20px, transparent 20px, transparent 40px); opacity: 0.3;"></div>
              <div style="position: absolute; bottom: 60px; width: 100%; height: 1px; background: repeating-linear-gradient(90deg, rgba(255,255,255,0.1) 0px, rgba(255,255,255,0.1) 10px, transparent 10px, transparent 20px);"></div>
            </div>
            
            <div class="car-image-wrapper" style="position: relative; height: 100%;">
              <div class="car-image" id="car-${e.id}" style="background-color: ${e.color}; width: 140px; height: 100px; mask: url('/car.svg') center/contain no-repeat; -webkit-mask: url('/car.svg') center/contain no-repeat; transition: none; position: relative; z-index: 2; transform: translateX(0px);">
                <div class="exhaust" id="exhaust-${e.id}" style="position: absolute; right: -30px; top: 35px; width: 40px; height: 25px; background: radial-gradient(ellipse, rgba(200,200,200,0.7) 0%, transparent 70%); border-radius: 50%; display: none; filter: blur(5px); z-index: 1;"></div>
                <div class="exhaust-flame" id="flame-${e.id}" style="position: absolute; right: -25px; top: 45px; width: 15px; height: 10px; background: radial-gradient(ellipse, rgba(255,200,50,0.8) 0%, transparent 70%); border-radius: 50%; display: none; filter: blur(3px); z-index: 1;"></div>
              </div>
              
              <div class="flag" style="background-color: #ff0000; width: 40px; height: 40px; position: absolute; right: 20px; top: 50%; transform: translateY(-50%); mask: url('/flag.svg') center/contain no-repeat; -webkit-mask: url('/flag.svg') center/contain no-repeat; z-index: 1;"></div>
              
              <div class="race-time" id="time-${e.id}" style="position: absolute; right: 80px; top: 15px; color: #fff; font-weight: bold; display: none; font-size: 14px; z-index: 3; background: rgba(0,0,0,0.7); padding: 2px 8px; border-radius: 4px;"></div>
              
              <div class="fireworks-container" id="fireworks-${e.id}" style="position: absolute; right: 0px; top: 0px; width: 200px; height: 120px; pointer-events: none; display: none; z-index: 4; overflow: visible;"></div>
              
              <div class="smoke-container" id="smoke-${e.id}" style="position: absolute; left: 0px; top: 0px; width: 100%; height: 100%; pointer-events: none; display: none; z-index: 3; overflow: visible;"></div>
            </div>
          </div>
        </div>
      `}).join(``)}getFinishPosition(e){let t=e.closest(`.car-track`);if(!t)return 700;let n=t.clientWidth;return Math.max(n-160-60,100)}async render(e){let t=await r.getCars(),n=t.length,i=Math.ceil(n/this.carsPerPage),a=(this.currentPage-1)*this.carsPerPage,o=a+this.carsPerPage,s=t.slice(a,o),c=this.renderCars(s);e.innerHTML=`
      <div class="garage-view">
        <div class="controls">
          <div class="create-controls">
            <div class="wrapper">
              <input type="text" id="create-name" placeholder="Car name" value="${this.createName}">
              <input type="color" id="create-color" value="${this.createColor}">
              <button id="create-car">Create</button>
            </div>
            
            <div class="wrapper">
              <input type="text" id="update-name" disabled value="${this.updateName}">
              <input type="color" id="update-color" value="${this.updateColor}" disabled>
              <button id="update-btn" class="update-btn" disabled>Update</button>
            </div>
          </div>

          <div class="race-controls">
            <button id="race-btn">Race</button>
            <button id="reset-btn">Reset</button>
            <button id="generate-btn">Generate Cars</button>
          </div>
        </div>

        <div class="car-info-page">
          <span class="car-name">🚗 GARAGE (${n})</span>
          <span class="page-name">PAGE #${this.currentPage}</span>
        </div>

        <div id="cars-list">
          ${c}
        </div>

        <div class="pagination">
          <button ${this.currentPage===1?`disabled`:``} id="prev-page">◀ Prev</button>
          <span>Page ${this.currentPage} of ${i||1}</span>
          <button ${this.currentPage===i||i===0?`disabled`:``} id="next-page">Next ▶</button>
        </div>
      </div>
    `,this.setupCreateListener(e),this.setupUpdateListener(e),this.setupGenerateListener(e),this.setupDeleteListener(e),this.setupPaginationListeners(e),this.setupRaceListeners(e),this.setupRaceControls(e)}createFirework(e,t){let n=t.querySelector(`#fireworks-${e}`);if(!n)return;n.style.display=`block`,n.innerHTML=``;let r=[`#ff0000`,`#ff8800`,`#ffff00`,`#00ff00`,`#0088ff`,`#ff00ff`,`#ff44aa`],i=[`🎆`,`🎇`,`✨`,`⭐`,`🌟`,`💫`];for(let e=0;e<5;e++)setTimeout(()=>{let e=100+Math.random()*100,t=20+Math.random()*80,a=20+Math.floor(Math.random()*20);for(let o=0;o<a;o++){let s=document.createElement(`div`),c=Math.PI*2*o/a+Math.random()*.5,l=30+Math.random()*80,u=6+Math.random()*10,d=r[Math.floor(Math.random()*r.length)];s.textContent=i[Math.floor(Math.random()*i.length)],s.style.cssText=`
            position: absolute;
            left: ${e}px;
            top: ${t}px;
            font-size: ${u}px;
            color: ${d};
            pointer-events: none;
            transform: translate(0, 0) scale(1);
            opacity: 1;
            transition: all ${.5+Math.random()*.5}s cubic-bezier(0.2, 0.8, 0.2, 1);
            z-index: 5;
            text-shadow: 0 0 10px ${d};
          `,n.appendChild(s),requestAnimationFrame(()=>{let e=Math.cos(c)*l,t=Math.sin(c)*l;s.style.transform=`translate(${e}px, ${t}px) scale(1.5)`,s.style.opacity=`0`}),setTimeout(()=>{s.parentNode&&s.remove()},1500)}},e*300);setTimeout(()=>{n&&(n.style.display=`none`,n.innerHTML=``)},3e3)}createSmokeEffect(e,t){let n=t.querySelector(`#smoke-${e}`);if(!n)return;n.style.display=`block`,n.innerHTML=``;let r=[];for(let e=0;e<15;e++){let t=document.createElement(`div`),i=30+Math.random()*60,a=40+Math.random()*60,o=20+Math.random()*60;t.style.cssText=`
        position: absolute;
        left: ${a}px;
        top: ${o}px;
        width: ${i}px;
        height: ${i}px;
        background: radial-gradient(ellipse, rgba(100,100,100,0.6) 0%, rgba(50,50,50,0.3) 40%, transparent 70%);
        border-radius: 50%;
        filter: blur(10px);
        pointer-events: none;
        opacity: 0;
        transform: scale(0.5);
        transition: all ${1+Math.random()*2}s cubic-bezier(0.1, 0.8, 0.3, 1);
        z-index: 5;
      `,n.appendChild(t),r.push(t),setTimeout(()=>{t.style.opacity=`0.8`,t.style.transform=`scale(${1+Math.random()*1.5}) translate(${-20+Math.random()*40}px, ${-30-Math.random()*50}px)`,t.style.filter=`blur(${15+Math.random()*20}px)`},e*100)}setTimeout(()=>{r.forEach((e,t)=>{setTimeout(()=>{e.style.opacity=`0`,e.style.transform=`scale(2) translate(${-30+Math.random()*60}px, ${-50-Math.random()*80}px)`},t*50)}),setTimeout(()=>{n&&(n.style.display=`none`,n.innerHTML=``)},3e3)},2e3)}animateExhaust(e,t){let n=t.querySelector(`#exhaust-${e}`),r=t.querySelector(`#flame-${e}`);if(!n)return;n.style.display=`block`,r&&(r.style.display=`block`);let i=setInterval(()=>{if(!n.parentElement){clearInterval(i);return}let e=.3+Math.random()*.5,t=.8+Math.random()*.8,a=30+Math.random()*30;if(n.style.opacity=e.toString(),n.style.transform=`scaleX(${t}) scaleY(${.7+Math.random()*.6})`,n.style.width=`${a}px`,n.style.left=`${-a/2}px`,r){let e=.3+Math.random()*.5,t=8+Math.random()*15;r.style.opacity=e.toString(),r.style.width=`${t}px`,r.style.height=`${t/2}px`,r.style.transform=`scaleX(${.5+Math.random()*.8})`,r.style.filter=`blur(${2+Math.random()*3}px)`}},80);this.exhaustIntervals.set(e,i)}stopExhaust(e,t){let n=this.exhaustIntervals.get(e);n&&(clearInterval(n),this.exhaustIntervals.delete(e));let r=t.querySelector(`#exhaust-${e}`),i=t.querySelector(`#flame-${e}`);r&&(r.style.display=`none`),i&&(i.style.display=`none`)}setupRaceListeners(e){let t=e.querySelectorAll(`.start-btn`),n=e.querySelectorAll(`.stop-btn`);t.forEach(t=>{t.addEventListener(`click`,async t=>{let n=t.currentTarget,r=Number(n.dataset.id);if(this.animationFrames.has(r)){console.log(`Car ${r} is already running`);return}n.disabled=!0,n.textContent=`⏳`;let i=e.querySelector(`.stop-btn[data-id="${r}"]`);i&&(i.disabled=!1);let a=e.querySelector(`#speed-${r}`);a&&(a.style.display=`inline`),this.animateExhaust(r,e),await this.startCarRace(r,e)})}),n.forEach(t=>{t.addEventListener(`click`,async t=>{let n=t.currentTarget,r=Number(n.dataset.id);n.disabled=!0,n.textContent=`⏳`,await this.stopCar(r,e),n.disabled=!0,n.textContent=`⏹`})})}setupRaceControls(e){let t=e.querySelector(`#race-btn`),n=e.querySelector(`#reset-btn`);t?.addEventListener(`click`,()=>{this.startRace(e)}),n?.addEventListener(`click`,()=>{this.resetRace(e)})}async startCarRace(e,t){let n=t.querySelector(`#car-${e}`),i=t.querySelector(`#time-${e}`),a=t.querySelector(`#speed-${e}`),o=t.querySelector(`.start-btn[data-id="${e}"]`);if(n)try{let s=await r.controlEngine(e,`started`);if(!s)throw Error(`Failed to start engine`);let c=s.distance/s.velocity/1e3,l=()=>this.getFinishPosition(n),u=l();n.style.transition=`none`,n.style.transform=`translateX(0px)`,n.offsetHeight,i&&(i.style.display=`block`,i.textContent=`⏳`,i.style.color=`#fff`);let d=t.querySelector(`#smoke-${e}`);d&&(d.style.display=`none`,d.innerHTML=``);let f=null,p=!1;this.carProgressData.set(e,{startTime:Date.now(),duration:c,endPosition:u,progress:0});let m=()=>{if(p||!this.animationFrames.has(e))return;let t=this.carProgressData.get(e);if(!t)return;let r=l();if(Math.abs(r-t.endPosition)>1){let e=(Date.now()-t.startTime)/1e3,i=Math.min(e/t.duration,1);t.endPosition=r,t.progress=i;let a=r*(i<.5?2*i*i:1-(-2*i+2)**2/2);n.style.transform=`translateX(${Math.min(a,r)}px)`}},h=()=>m();this.resizeHandlers.set(e,h),window.addEventListener(`resize`,h);let g=new Promise((r,o)=>{let c=u=>{if(!this.animationFrames.has(e)||p){window.removeEventListener(`resize`,h),this.resizeHandlers.delete(e),this.carProgressData.delete(e),o(Error(`Animation stopped`));return}let d=this.carProgressData.get(e);if(!d){o(Error(`No data`));return}let m=l();Math.abs(m-d.endPosition)>1&&(d.endPosition=m);let g=(Date.now()-d.startTime)/1e3,_=Math.min(g/d.duration,1);d.progress=_;let v=_<.5?2*_*_:1-(-2*_+2)**2/2,y=d.endPosition*v;if(n.style.transform=`translateX(${Math.min(y,d.endPosition)}px)`,a&&_<1){let e=Math.round(s.velocity/1e3*(1-Math.abs(_-.5)*.6)*3.6);a.textContent=`${e} km/h`}if(_>=1){let o=(Date.now()-d.startTime)/1e3;i&&(i.textContent=`${o.toFixed(2)}s`,i.style.color=`#4caf50`,i.style.background=`rgba(0,0,0,0.8)`),a&&(a.textContent=`🏁`,a.style.color=`#ffd700`),this.createFirework(e,t),this.stopExhaust(e,t),n.raceTime=o,n.raceSuccess=!0,window.removeEventListener(`resize`,h),this.resizeHandlers.delete(e),this.carProgressData.delete(e),r();return}f=requestAnimationFrame(c)};f=requestAnimationFrame(c),this.animationFrames.set(e,f)});try{await r.driveMode(e),console.log(`✅ Car ${e} drive mode activated`)}catch(r){if(r?.message?.includes(`500`)||r?.status===500||r?.toString()?.includes(`500`)){console.log(`💥 Car ${e} engine broken! (500 error)`),f&&(cancelAnimationFrame(f),this.animationFrames.delete(e)),p=!0,window.removeEventListener(`resize`,h),this.resizeHandlers.delete(e),this.carProgressData.delete(e),i&&(i.textContent=`💥 BROKEN`,i.style.color=`#ff1744`,i.style.display=`block`,i.style.background=`rgba(0,0,0,0.8)`),a&&(a.textContent=`💥`,a.style.color=`#ff1744`),this.createSmokeEffect(e,t),this.stopExhaust(e,t),n.raceSuccess=!1,o&&(o.textContent=`💥`,o.disabled=!0);return}throw r}await g,console.log(`✅ Car ${e} finished race!`),o&&(o.textContent=`🏁`,o.disabled=!0)}catch(n){console.error(`❌ Failed to start car ${e}:`,n);let r=this.animationFrames.get(e);r&&(cancelAnimationFrame(r),this.animationFrames.delete(e));let i=this.resizeHandlers.get(e);i&&(window.removeEventListener(`resize`,i),this.resizeHandlers.delete(e)),this.carProgressData.delete(e),o&&(o.disabled=!1,o.textContent=`▶`);let a=t.querySelector(`.stop-btn[data-id="${e}"]`);a&&(a.disabled=!0),this.stopExhaust(e,t)}}async stopCar(e,t){let n=t.querySelector(`.start-btn[data-id="${e}"]`),r=t.querySelector(`.stop-btn[data-id="${e}"]`);n&&(n.disabled=!0,n.textContent=`⏳`),r&&(r.disabled=!0,r.textContent=`⏳`);let i=this.animationFrames.get(e);i&&(cancelAnimationFrame(i),this.animationFrames.delete(e),console.log(`Animation stopped for car ${e}`));let a=this.resizeHandlers.get(e);a&&(window.removeEventListener(`resize`,a),this.resizeHandlers.delete(e)),this.carProgressData.delete(e),this.stopExhaust(e,t);let o=t.querySelector(`#car-${e}`);o&&(o.style.transition=`transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)`,o.style.transform=`translateX(0px)`,setTimeout(()=>{o&&(o.style.transition=`none`,o.style.transform=`translateX(0px)`)},500),o.style.border=`none`,o.style.boxShadow=`none`,o.raceSuccess=!1,o.raceTime=null);let s=t.querySelector(`#time-${e}`);s&&(s.style.display=`none`,s.textContent=``,s.style.color=`#fff`,s.style.background=`none`);let c=t.querySelector(`#speed-${e}`);c&&(c.style.display=`none`,c.textContent=`0 km/h`,c.style.color=`#4caf50`);let l=t.querySelector(`#smoke-${e}`);l&&(l.style.display=`none`,l.innerHTML=``);let u=t.querySelector(`#fireworks-${e}`);u&&(u.style.display=`none`,u.innerHTML=``),fetch(`http://127.0.0.1:3000/engine?id=${e}&status=stopped`,{method:`PATCH`}).then(t=>{console.log(`Stop response for car ${e}: ${t.status}`),t.ok&&console.log(`✅ Car ${e} stopped successfully (200 OK)`)}).catch(t=>{console.error(`Failed to stop car ${e} on server:`,t)}),setTimeout(()=>{n&&(n.disabled=!1,n.textContent=`▶`),r&&(r.disabled=!0,r.textContent=`⏹`)},500)}async startRace(e){let t=e.querySelectorAll(`.car-card`),n=[];if(t.forEach(t=>{let r=Number(t.dataset.carId),i=t.querySelector(`.start-btn`);if(i&&!i.disabled){i.click();let t=new Promise((t,n)=>{let i=setInterval(()=>{let a=e.querySelector(`#car-${r}`);if(a.raceSuccess!==void 0)if(clearInterval(i),a.raceSuccess){let e=a.raceTime||1/0;t({id:r,time:e})}else n(Error(`Car ${r} failed`))},100)});n.push(t)}}),n.length===0){alert(`No cars to race!`);return}try{let t=await Promise.race(n);console.log(`🏆 WINNER: Car ${t.id} with time ${t.time.toFixed(2)}s`);let i=(await r.getCars()).find(e=>e.id===t.id);setTimeout(()=>{this.createFirework(t.id,e),setTimeout(()=>{this.createFirework(t.id,e)},800)},500),this.showWinnerMessage(e,i?.name||`Unknown`,t.time),await this.saveWinner(t.id,t.time);let a=new CustomEvent(`winnerAdded`,{detail:{carId:t.id,time:t.time}});document.dispatchEvent(a);let o=e.querySelector(`#car-${t.id}`);if(o){o.style.border=`3px solid gold`,o.style.boxShadow=`0 0 30px gold`;let e=0,t=setInterval(()=>{if(!o.parentElement){clearInterval(t);return}e=(e+1)%20;let n=Math.abs(e-10)/10;o.style.boxShadow=`0 0 ${20+n*30}px gold`},100)}}catch{console.log(`All cars failed or no cars finished`),this.showWinnerMessage(e,`No cars finished the race!`,0)}}showWinnerMessage(e,t,n){let r=e.querySelector(`.winner-message`);r&&r.remove();let i=document.createElement(`div`);i.className=`winner-message`,n===0?(i.style.cssText=`
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #1a1a2e, #2d1b1b);
        padding: 40px 60px;
        border-radius: 20px;
        box-shadow: 0 0 80px rgba(255, 0, 0, 0.3);
        border: 2px solid #ff1744;
        z-index: 1000;
        text-align: center;
        max-width: 400px;
        animation: slideIn 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
      `,i.innerHTML=`
        <div style="font-size: 64px; margin-bottom: 10px;">😢</div>
        <div style="color: #ff1744; font-size: 24px; font-weight: 700;">
          No cars finished!
        </div>
        <div style="color: #888; margin-top: 10px; font-size: 14px;">
          All cars broke down or crashed
        </div>
      `):(i.style.cssText=`
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #1a1a2e, #1a2e1a);
        padding: 50px 70px;
        border-radius: 24px;
        box-shadow: 0 0 80px rgba(255, 215, 0, 0.4), inset 0 0 60px rgba(255, 215, 0, 0.05);
        border: 2px solid gold;
        z-index: 1000;
        text-align: center;
        max-width: 500px;
        animation: slideIn 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
      `,i.innerHTML=`
        <div style="font-size: 80px; margin-bottom: 5px; animation: bounce 1s ease infinite;">🏆</div>
        <div style="color: #ffd700; font-size: 36px; font-weight: 800; margin-bottom: 5px; text-shadow: 0 0 30px rgba(255, 215, 0, 0.3);">
          WINNER!
        </div>
        <div style="color: #fff; font-size: 28px; margin-bottom: 5px; font-weight: 600; text-shadow: 0 0 20px rgba(255,255,255,0.1);">
          ${t}
        </div>
        <div style="color: #4caf50; font-size: 22px; margin-bottom: 25px; font-weight: 500;">
          ⏱ <span style="font-size: 28px; font-weight: 700;">${n.toFixed(2)}s</span>
        </div>
        <button id="close-winner-message" style="
          padding: 14px 50px;
          background: linear-gradient(135deg, #ffd700, #f39c12);
          color: #1a1a2e;
          border: none;
          border-radius: 12px;
          font-size: 18px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px rgba(255, 215, 0, 0.3);
        "
        onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 6px 30px rgba(255,215,0,0.5)';"
        onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 20px rgba(255,215,0,0.3)';">
          🎉 Awesome!
        </button>
      `),document.body.appendChild(i);let a=i.querySelector(`#close-winner-message`);a&&a.addEventListener(`click`,()=>{i.remove()}),i.addEventListener(`click`,e=>{e.target===i&&i.remove()}),setTimeout(()=>{i.parentNode&&i.remove()},6e3)}async saveWinner(e,t){try{let n=(await this.winnersAPI.getAllWinners()).find(t=>t.id===e);if(n){let r=n.wins+1,i=Math.min(n.time,t);await this.winnersAPI.updateWinner(e,r,i),console.log(`✅ Winner ${e} updated: ${r} wins, best time: ${i}s`)}else await this.winnersAPI.addWinner(e,1,t),console.log(`✅ New winner ${e} created with time ${t}s`)}catch(e){console.error(`Error saving winner:`,e)}}async resetRace(e){let t=e.querySelectorAll(`.car-card`);for(let n of t){let t=Number(n.dataset.carId);await this.stopCar(t,e);let r=e.querySelector(`#car-${t}`);r&&(r.style.border=`none`,r.style.boxShadow=`none`)}console.log(`🔄 Race reset completed`)}setupCreateListener(e){let t=e.querySelector(`#create-car`),n=e.querySelector(`#create-name`),i=e.querySelector(`#create-color`);n.value=this.createName,i.value=this.createColor,n.addEventListener(`input`,()=>{this.createName=n.value}),i.addEventListener(`input`,()=>{this.createColor=i.value}),t?.addEventListener(`click`,async()=>{let t=n.value,a=i.value;if(t){let n=await r.createCar(t,a);n?(console.log(`✅ Car created on server:`,n),this.createName=``,await this.render(e)):console.error(`❌ Creation error`)}else this.createName=``,n.value=``})}setupUpdateListener(e){let t=e.querySelectorAll(`.select-btn`),n=e.querySelector(`#update-btn`),i=e.querySelector(`#update-name`),a=e.querySelector(`#update-color`);this.selectedCarId!==null&&(i.value=this.updateName,a.value=this.updateColor,i.disabled=!1,a.disabled=!1,n.disabled=!1),t.forEach(e=>{e.addEventListener(`click`,()=>{let t=Number(e.dataset.id);this.selectedCarId=t;let r=e.closest(`.car-card`),o=(r?.querySelector(`.car-name`))?.textContent?.trim()||``;this.updateName=o;let s=r?.querySelector(`.car-image`);s&&(this.updateColor=s.style.backgroundColor||`#ffffff`),i.value=this.updateName,i.disabled=!1,a.value=this.updateColor,a.disabled=!1,n.disabled=!1,console.log(`🔍 Selected car #${t} for update`)})}),n?.addEventListener(`click`,async()=>{if(this.selectedCarId===null){alert(`Please select a car first (SELECT button)`);return}let t=i.value.trim(),n=a.value;if(!t){alert(`Please enter car name`);return}let o=await r.updateCar(this.selectedCarId,t,n);o?(console.log(`✅ Car #${this.selectedCarId} updated:`,o),this.selectedCarId=null,this.updateName=``,this.updateColor=`#ffffff`,await this.render(e)):(console.error(`❌ Update error for car #${this.selectedCarId}`),alert(`Failed to update car`))})}setupGenerateListener(e){let t=e.querySelector(`#generate-btn`);t?.addEventListener(`click`,async()=>{let n=[`Tesla`,`BMW`,`Mercedes`,`Audi`,`Toyota`,`Honda`,`Ford`,`Chevrolet`,`Nissan`,`Volkswagen`,`Porsche`,`Ferrari`,`Lamborghini`,`Maserati`,`Lexus`,`Volvo`,`Hyundai`,`Kia`,`Mazda`,`Subaru`],i=`Model S.Model 3.Model X.Model Y.Roadster.X5.X3.X7.M3.M5.E-Class.S-Class.C-Class.G-Class.A-Class.A4.A6.Q5.Q7.R8.Camry.Corolla.Supra.RAV4.Land Cruiser.Accord.Civic.CR-V.Pilot.Odyssey.Mustang.F-150.Explorer.Escape.Bronco.Corvette.Malibu.Impala.Equinox.Traverse.GT-R.Qashqai.Juke.Patrol.370Z.Golf.Passat.Tiguan.Touareg.Polo.XC90.S60.V60.XC60.C40.Tucson.Santa Fe.Kona.Elantra.Sonata`.split(`.`);t.disabled=!0,t.textContent=`⏳ Generating...`;try{for(let e=0;e<100;e++){let a=n[Math.floor(Math.random()*n.length)],o=i[Math.floor(Math.random()*i.length)],s=`#${Math.floor(Math.random()*16777215).toString(16).padStart(6,`0`)}`,c=`${a} ${o}`;await r.createCar(c,s),(e+1)%10==0&&(console.log(`✅ Generated ${e+1}/100 cars...`),t.textContent=`⏳ ${e+1}/100`)}console.log(`🎉 100 cars generated successfully!`),t.textContent=`✅ Done!`,await this.render(e),document.dispatchEvent(new CustomEvent(`carsGenerated`))}catch(e){console.error(`❌ Error generating cars:`,e),alert(`Error generating cars. Please try again.`)}finally{setTimeout(()=>{t.disabled=!1,t.textContent=`🎲 Generate Cars`},1e3)}})}setupDeleteListener(e){e.querySelectorAll(`.remove-btn`).forEach(t=>{t.addEventListener(`click`,async t=>{let n=t.currentTarget,i=Number(n.dataset.id),a=n.dataset.number,o=(await r.getCars()).find(e=>e.id===i)?.name||`Unknown`;if(confirm(`Delete car #${a} (${o})?`))try{if(!await r.deleteCar(i)){alert(`Failed to delete car #${a}`);return}console.log(`✅ Car #${a} (${o}) deleted`);try{await this.winnersAPI.deleteWinner(i),console.log(`✅ Winner ${i} deleted`)}catch{console.log(`ℹ️ Winner ${i} not found`)}await this.render(e);let t=new CustomEvent(`carDeleted`,{detail:{carId:i}});document.dispatchEvent(t),console.log(`📤 CarDeleted event dispatched`)}catch(e){console.error(`Delete error:`,e),alert(`Error deleting car`)}})})}setupPaginationListeners(e){let t=e.querySelector(`#prev-page`),n=e.querySelector(`#next-page`),i=e.querySelector(`#create-color`);i&&(this.createColor=i.value);let a=e.querySelector(`#create-name`);a&&(this.createName=a.value),t?.addEventListener(`click`,async()=>{if(this.currentPage>1){let t=e.querySelector(`#create-color`);t&&(this.createColor=t.value);let n=e.querySelector(`#create-name`);n&&(this.createName=n.value),this.currentPage--,await this.render(e)}}),n?.addEventListener(`click`,async()=>{let t=await r.getCars(),n=Math.ceil(t.length/this.carsPerPage);if(this.currentPage<n){let t=e.querySelector(`#create-color`);t&&(this.createColor=t.value);let n=e.querySelector(`#create-name`);n&&(this.createName=n.value),this.currentPage++,await this.render(e)}})}}})),u,d=e((()=>{s(),i(),u=class{constructor(){this.currentPage=1,this.itemsPerPage=10,this.sortBy=`wins`,this.sortOrder=`DESC`,this.container=null,this.allWinners=[],this.winnersAPI=o.getInstance(),this.setupEventListeners(),this.addStyles()}addStyles(){let e=document.createElement(`style`);e.textContent=`
      /* Общие стили */
      .winners-view {
        background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
        min-height: 100vh;
        padding: 20px;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      }

      /* Заголовок */
      .winner-info-page {
        display: flex;
        justify-content: space-between;
        padding: 15px 0;
        color: #fff;
        border-bottom: 2px solid rgba(255, 215, 0, 0.3);
        margin-bottom: 25px;
        position: relative;
      }
      .winner-info-page span:first-child {
        font-size: 28px;
        font-weight: 700;
        background: linear-gradient(90deg, #ffd700, #ff6b6b);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-shadow: 0 0 30px rgba(255, 215, 0, 0.3);
      }
      .winner-info-page span:last-child {
        font-size: 18px;
        color: #888;
        background: rgba(255,255,255,0.05);
        padding: 5px 15px;
        border-radius: 20px;
        border: 1px solid rgba(255,255,255,0.1);
      }

      /* Контролы сортировки */
      .controls {
        display: flex;
        justify-content: flex-start;
        gap: 15px;
        padding: 20px;
        background: rgba(255,255,255,0.03);
        border-radius: 16px;
        border: 1px solid rgba(255,255,255,0.05);
        margin-bottom: 25px;
        flex-wrap: wrap;
      }
      .sort-controls {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }
      .sort-controls button {
        padding: 10px 24px;
        border: none;
        border-radius: 10px;
        font-weight: 600;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s ease;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: white;
      }
      #sort-wins {
        background: ${this.sortBy===`wins`?`linear-gradient(135deg, #ffd700, #f39c12)`:`linear-gradient(135deg, #636e72, #2d3436)`};
        box-shadow: ${this.sortBy===`wins`?`0 4px 20px rgba(255, 215, 0, 0.3)`:`none`};
      }
      #sort-wins:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 25px rgba(255, 215, 0, 0.4);
      }
      #sort-time {
        background: ${this.sortBy===`time`?`linear-gradient(135deg, #4caf50, #2e7d32)`:`linear-gradient(135deg, #636e72, #2d3436)`};
        box-shadow: ${this.sortBy===`time`?`0 4px 20px rgba(76, 175, 80, 0.3)`:`none`};
      }
      #sort-time:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 25px rgba(76, 175, 80, 0.4);
      }

      /* Таблица */
      .winners-table {
        width: 100%;
        border-collapse: collapse;
        background: rgba(255,255,255,0.02);
        border-radius: 16px;
        overflow: hidden;
        border: 1px solid rgba(255,255,255,0.05);
      }
      .winners-table thead {
        background: linear-gradient(135deg, #1a1a2e, #2d2d44);
      }
      .winners-table th {
        padding: 15px 12px;
        text-align: center;
        color: #fff;
        font-weight: 600;
        font-size: 14px;
        text-transform: uppercase;
        letter-spacing: 1px;
        border-bottom: 2px solid rgba(255, 215, 0, 0.2);
      }
      .winners-table td {
        padding: 12px;
        text-align: center;
        color: #fff;
        border-bottom: 1px solid rgba(255,255,255,0.05);
        transition: background 0.3s ease;
      }
      .winners-table tbody tr {
        transition: all 0.3s ease;
      }
      .winners-table tbody tr:hover {
        background: rgba(255,255,255,0.05);
        transform: scale(1.01);
      }
      .winners-table tbody tr:last-child td {
        border-bottom: none;
      }

      /* Номер */
      .winners-table td:first-child {
        color: #888;
        font-weight: 700;
        font-size: 16px;
      }

      /* Имя машины */
      .winners-table td:nth-child(3) {
        color: #ffcc41;
        font-weight: 600;
        font-size: 16px;
        text-align: left;
        padding-left: 20px;
      }

      /* Победы */
      .winners-table td:nth-child(4) {
        color: #ffd700;
        font-weight: 700;
        font-size: 18px;
      }

      /* Время */
      .winners-table td:last-child {
        color: #4caf50;
        font-weight: 700;
        font-size: 16px;
        font-family: 'Courier New', monospace;
      }

      /* Машина-иконка */
      .car-icon {
        display: inline-block;
        width: 44px;
        height: 44px;
        border-radius: 8px;
        transition: all 0.3s ease;
        filter: drop-shadow(0 2px 10px rgba(255, 215, 0, 0.2));
      }
      .car-icon:hover {
        transform: scale(1.15) rotate(-5deg);
        filter: drop-shadow(0 4px 20px rgba(255, 215, 0, 0.4));
      }

      /* Пагинация */
      .pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 20px;
        padding: 25px 0;
        color: #fff;
      }
      .pagination button {
        padding: 10px 24px;
        border: none;
        border-radius: 10px;
        font-weight: 600;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s ease;
        background: linear-gradient(135deg, #636e72, #2d3436);
        color: white;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .pagination button:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 4px 20px rgba(0,0,0,0.4);
        background: linear-gradient(135deg, #ffd700, #f39c12);
      }
      .pagination button:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }
      .pagination span {
        font-size: 16px;
        padding: 8px 20px;
        background: rgba(255,255,255,0.05);
        border-radius: 20px;
        border: 1px solid rgba(255,255,255,0.05);
        color: #888;
      }

      /* Пустое состояние */
      .empty-state {
        text-align: center;
        padding: 60px 20px;
        color: #555;
        background: rgba(255,255,255,0.02);
        border-radius: 16px;
        border: 2px dashed rgba(255,255,255,0.05);
      }
      .empty-state .icon {
        font-size: 64px;
        display: block;
        margin-bottom: 15px;
      }
      .empty-state .title {
        font-size: 24px;
        font-weight: 600;
        color: #666;
        margin-bottom: 10px;
      }
      .empty-state .subtitle {
        font-size: 16px;
        color: #444;
      }

      /* Анимация появления строк */
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .winners-table tbody tr {
        animation: fadeInUp 0.3s ease forwards;
      }
      .winners-table tbody tr:nth-child(1) { animation-delay: 0.05s; }
      .winners-table tbody tr:nth-child(2) { animation-delay: 0.10s; }
      .winners-table tbody tr:nth-child(3) { animation-delay: 0.15s; }
      .winners-table tbody tr:nth-child(4) { animation-delay: 0.20s; }
      .winners-table tbody tr:nth-child(5) { animation-delay: 0.25s; }
      .winners-table tbody tr:nth-child(6) { animation-delay: 0.30s; }
      .winners-table tbody tr:nth-child(7) { animation-delay: 0.35s; }
      .winners-table tbody tr:nth-child(8) { animation-delay: 0.40s; }
      .winners-table tbody tr:nth-child(9) { animation-delay: 0.45s; }
      .winners-table tbody tr:nth-child(10) { animation-delay: 0.50s; }
    `,document.head.appendChild(e)}setupEventListeners(){document.addEventListener(`carDeleted`,e=>{console.log(`📥 CarDeleted event received in WinnersView`,e.detail),this.container!==null&&this.container.isConnected?(console.log(`🔄 Refreshing winners table after car deletion`),this.render(this.container)):console.log(`ℹ️ Winners view is not visible, skipping refresh`)}),document.addEventListener(`winnerAdded`,e=>{console.log(`📥 WinnerAdded event received in WinnersView`,e.detail),this.container!==null&&this.container.isConnected&&(console.log(`🔄 Refreshing winners table after new winner`),this.currentPage=1,this.render(this.container))})}async render(e){this.container=e;try{let t=await this.winnersAPI.getAllWinners();this.allWinners=t;let n=await r.getCars(),i=new Map(n.map(e=>[e.id,e])),a=this.allWinners.filter(e=>i.has(e.id)),o=a.length,s=this.sortWinners(a),c=(this.currentPage-1)*this.itemsPerPage,l=c+this.itemsPerPage,u=s.slice(c,l),d=``;u.length===0?d=`
          <tr>
            <td colspan="5">
              <div class="empty-state">
                <span class="icon">🏁</span>
                <div class="title">No Winners Yet</div>
                <div class="subtitle">Start a race to see results here!</div>
              </div>
            </td>
          </tr>
        `:u.forEach((e,t)=>{let n=i.get(e.id),r=c+t+1,a=n?.color??`#ffffff`,o=n?.name??`Car #${e.id}`;d+=`
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
              <td style="padding: 12px; color: ${r<=3?`#ffd700`:`#888`}; text-align: center; font-weight: 700; font-size: ${r<=3?`20px`:`16px`};">
                ${(r===1?`🥇`:r===2?`🥈`:r===3?`🥉`:``)||r}
              </td>
              <td style="padding: 12px; text-align: center;">
                <div class="car-icon" style="background-color: ${a}; mask: url('/car.svg') center/contain no-repeat; -webkit-mask: url('/car.svg') center/contain no-repeat;"></div>
              </td>
              <td style="padding: 12px; color: #ffcc41; text-align: left; padding-left: 20px; font-weight: 600; font-size: 16px;">
                ${o}
              </td>
              <td style="padding: 12px; color: #ffd700; text-align: center; font-weight: 700; font-size: 18px;">
                ${e.wins} 🏆
              </td>
              <td style="padding: 12px; color: #4caf50; text-align: center; font-weight: 700; font-size: 16px; font-family: 'Courier New', monospace;">
                ${e.time.toFixed(2)}s
              </td>
            </tr>
          `});let f=Math.ceil(o/this.itemsPerPage);e.innerHTML=`
        <div class="winners-view">
          <div class="winner-info-page">
            <span>WINNERS (${o})</span>
            <span>PAGE #${this.currentPage}</span>
          </div>
          
          <div class="controls">
            <div class="sort-controls">
              <button id="sort-wins" style="background: ${this.sortBy===`wins`?`linear-gradient(135deg, #ffd700, #f39c12)`:`linear-gradient(135deg, #636e72, #2d3436)`};">
                Sort by Wins ${this.sortBy===`wins`?this.sortOrder===`DESC`?`↓`:`↑`:``}
              </button>
              <button id="sort-time" style="background: ${this.sortBy===`time`?`linear-gradient(135deg, #4caf50, #2e7d32)`:`linear-gradient(135deg, #636e72, #2d3436)`};">
                Sort by Time ${this.sortBy===`time`?this.sortOrder===`DESC`?`↓`:`↑`:``}
              </button>
            </div>
          </div>

          <table class="winners-table">
            <thead>
              <tr>
                <th style="padding: 15px 12px; text-align: center; color: #fff; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid rgba(255, 215, 0, 0.2);">#</th>
                <th style="padding: 15px 12px; text-align: center; color: #fff; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid rgba(255, 215, 0, 0.2);">Car</th>
                <th style="padding: 15px 12px; text-align: left; padding-left: 20px; color: #fff; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid rgba(255, 215, 0, 0.2);">Name</th>
                <th style="padding: 15px 12px; text-align: center; color: #fff; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid rgba(255, 215, 0, 0.2);">🏆 Wins</th>
                <th style="padding: 15px 12px; text-align: center; color: #fff; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid rgba(255, 215, 0, 0.2);">⏱ Best Time</th>
              </tr>
            </thead>
            <tbody>
              ${d}
            </tbody>
          </table>

          <div class="pagination">
            <button ${this.currentPage===1?`disabled`:``} id="prev-page">◀ Prev</button>
            <span>Page ${this.currentPage} of ${f||1}</span>
            <button ${this.currentPage===f||f===0?`disabled`:``} id="next-page">Next ▶</button>
          </div>
        </div>
      `,this.setupSortListeners(e),this.setupPaginationListeners(e)}catch(t){console.error(`Error rendering winners:`,t),e.innerHTML=`
        <div class="winners-view" style="padding: 40px; text-align: center; color: #ff1744;">
          <div style="font-size: 64px; margin-bottom: 20px;">💥</div>
          <div style="font-size: 24px; font-weight: 700; margin-bottom: 10px;">Error Loading Winners</div>
          <div style="color: #888;">Please try again later</div>
        </div>
      `}}setupSortListeners(e){let t=e.querySelector(`#sort-wins`),n=e.querySelector(`#sort-time`);t!==null&&t.addEventListener(`click`,()=>{this.sortBy===`wins`?this.sortOrder=this.sortOrder===`DESC`?`ASC`:`DESC`:(this.sortBy=`wins`,this.sortOrder=`DESC`),this.render(e)}),n!==null&&n.addEventListener(`click`,()=>{this.sortBy===`time`?this.sortOrder=this.sortOrder===`DESC`?`ASC`:`DESC`:(this.sortBy=`time`,this.sortOrder=`DESC`),this.render(e)})}setupPaginationListeners(e){let t=e.querySelector(`#prev-page`),n=e.querySelector(`#next-page`);t!==null&&t.addEventListener(`click`,async()=>{this.currentPage>1&&(this.currentPage--,await this.render(e))}),n!==null&&n.addEventListener(`click`,async()=>{let t=await r.getCars(),n=new Map(t.map(e=>[e.id,e])),i=this.allWinners.filter(e=>n.has(e.id)),a=Math.ceil(i.length/this.itemsPerPage);this.currentPage<a&&(this.currentPage++,await this.render(e))})}sortWinners(e){let t=[...e];return t.sort((e,t)=>{let n=0;return this.sortBy===`wins`?n=e.wins-t.wins:this.sortBy===`time`&&(n=e.time-t.time),this.sortOrder===`DESC`?-n:n}),t}}})),f,p=e((()=>{l(),d(),f=class{constructor(e){this.currentView=`garage`,this.container=e,this.garageView=new c,this.winnersView=new u}init(){this.render(),this.setupNavigation(),this.showGarage()}render(){this.container.innerHTML=`
      <header class="header">
        <nav class="nav">
          <button class="nav-btn active" data-view="garage">To Garage</button>
          <button class="nav-btn" data-view="winners">To Winners</button>
        </nav>
      </header>
      <main id="view-container"></main>
    `}setupNavigation(){let e=this.container.querySelectorAll(`.nav-btn`);e.forEach(t=>{t.addEventListener(`click`,t=>{let n=t.currentTarget,r=n.dataset.view;e.forEach(e=>{e.classList.remove(`active`)}),n.classList.add(`active`),r===`garage`?this.showGarage():r===`winners`&&this.showWinners()})})}showGarage(){this.currentView=`garage`;let e=document.getElementById(`view-container`);e!==null&&this.garageView.render(e)}showWinners(){this.currentView=`winners`;let e=document.getElementById(`view-container`);e!==null&&this.winnersView.render(e)}}}));t((()=>{p(),document.addEventListener(`DOMContentLoaded`,()=>{let e=document.getElementById(`app`);e&&new f(e).init()})}))();