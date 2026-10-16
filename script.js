/* AÇAÍ DO BAIRRO V4 - CORRIGIDO + ANTI-CALOTE + PERFORMANCE 3G */

const SIZES = [
    { id:'300', ml:300, label:'Pequeno • 300ml', desc:'Ideal pra matar a vontade', price:18, maxToppings:2, popular:false, fill:'55%' },
    { id:'400', ml:400, label:'Médio • 400ml', desc:'O queridinho', price:22, maxToppings:3, popular:false, fill:'70%' },
    { id:'500', ml:500, label:'Grande • 500ml', desc:'Pra quem tem fome', price:26, maxToppings:4, popular:true, fill:'85%' },
    { id:'700', ml:700, label:'Família • 700ml', desc:'Pra dividir', price:32, maxToppings:6, popular:false, fill:'100%' },
  ];
  
  const TOPPINGS = [
    { id:'banana', name:'Banana', emoji:'🍌', category:'Frutas', price:0 },
    { id:'morango', name:'Morango', emoji:'🍓', category:'Frutas', price:2.0 },
    { id:'manga', name:'Manga', emoji:'🥭', category:'Frutas', price:2.0 },
    { id:'kiwi', name:'Kiwi', emoji:'🥝', category:'Frutas', price:3.0 },
    { id:'leite_po', name:'Leite em pó', emoji:'🥛', category:'Cremes', price:0 },
    { id:'leite_cond', name:'Leite condensado', emoji:'🍯', category:'Cremes', price:2.5 },
    { id:'nutella', name:'Nutella', emoji:'🍫', category:'Cremes', price:6.0 },
    { id:'doce_leite', name:'Doce de leite', emoji:'🍮', category:'Cremes', price:2.5 },
    { id:'pacoca', name:'Paçoca', emoji:'🥜', category:'Cremes', price:2.0 },
    { id:'granola', name:'Granola tradicional', emoji:'🌾', category:'Crocantes', price:0 },
    { id:'granola_choc', name:'Granola de chocolate', emoji:'🍪', category:'Crocantes', price:2.0 },
    { id:'sucrilhos', name:'Sucrilhos', emoji:'🥣', category:'Crocantes', price:2.0 },
    { id:'flocos_arroz', name:'Flocos de arroz', emoji:'🍚', category:'Crocantes', price:1.5 },
    { id:'amendoim', name:'Amendoim', emoji:'🥜', category:'Crocantes', price:2.0 },
    { id:'castanha', name:'Castanha', emoji:'🌰', category:'Crocantes', price:3.5 },
    { id:'oreo', name:'Oreo', emoji:'🖤', category:'Crocantes', price:3.0 },
    { id:'bis', name:'Bis', emoji:'💥', category:'Crocantes', price:3.0 },
    { id:'mel', name:'Mel', emoji:'🍯', category:'Extras', price:1.5 },
    { id:'chia', name:'Chia', emoji:'🌱', category:'Extras', price:2.0 },
    { id:'coco', name:'Coco ralado', emoji:'🥥', category:'Extras', price:2.0 },
  ];
  
  const CATEGORIES = ['Todos','Frutas','Cremes','Crocantes','Extras'];
  const FREE_LIMIT = 4;
  const STORAGE_KEY = 'acai_bairro_v4';
  
  const state = { selectedSize: null, selectedToppings: [], filter: 'Todos', step: 1, coupon: null };
  
  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);
  const formatBRL = v => v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  const getToppingObjs = () => state.selectedToppings.map(id => TOPPINGS.find(t=>t.id===id)).filter(Boolean);
  
  function calculateOrder(){
    if(!state.selectedSize) return {subtotal:0,total:0,freeUsed:0,freeItems:[],paidItems:[],allItems:[],economy:0,extra:0,discount:0};
    const allItems = getToppingObjs();
    const freeItems = allItems.slice(0, FREE_LIMIT);
    const paidItems = allItems.slice(FREE_LIMIT);
    const extra = paidItems.reduce((s,t)=>s+t.price,0);
    const subtotal = state.selectedSize.price + extra;
    const discount = state.coupon==='BEMVINDO10' ? subtotal*0.10 : 0;
    const total = subtotal - discount;
    const economy = freeItems.reduce((s,t)=>s+t.price,0);
    return {subtotal,extra,discount,total,freeUsed:Math.min(allItems.length,FREE_LIMIT),freeItems,paidItems,allItems,economy};
  }
  
  function showToast(msg, isError=false){
    const t=$('#toast'); t.textContent=msg; t.classList.toggle('is-error', isError); t.classList.add('is-visible');
    setTimeout(()=>t.classList.remove('is-visible','is-error'),3500);
  }
  
  function saveToStorage(){
    try{
      const data = {
        sizeId: state.selectedSize?.id || null,
        toppings: state.selectedToppings,
        filter: state.filter,
        step: state.step,
        coupon: state.coupon,
        obs: $('#obsInput')?.value || '',
        couponInput: $('#couponInput')?.value || '',
        client: {
          name: $('#clientName')?.value || '',
          phone: $('#clientPhone')?.value || '',
          cep: $('#clientCep')?.value || '',
          street: $('#clientStreet')?.value || '',
          number: $('#clientNumber')?.value || '',
          neighborhood: $('#clientNeighborhood')?.value || '',
          complement: $('#clientComplement')?.value || '',
          confirm: $('#confirmAddress')?.checked || false
        },
        savedAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }catch(e){}
  }
  
  function loadFromStorage(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      if(!raw) return null;
      const data = JSON.parse(raw);
      if(data.sizeId) state.selectedSize = SIZES.find(s=>s.id===data.sizeId) || null;
      state.selectedToppings = Array.isArray(data.toppings) ? data.toppings : [];
      state.filter = data.filter || 'Todos';
      state.step = data.step || 1;
      state.coupon = data.coupon || null;
      if(state.selectedSize && state.selectedToppings.length > state.selectedSize.maxToppings){
        state.selectedToppings = state.selectedToppings.slice(0, state.selectedSize.maxToppings);
      }
      setTimeout(()=>{
        if($('#obsInput') && data.obs) $('#obsInput').value = data.obs;
        if($('#couponInput') && data.couponInput) $('#couponInput').value = data.couponInput;
        if(data.client){
          if($('#clientName')) $('#clientName').value = data.client.name||'';
          if($('#clientPhone')) $('#clientPhone').value = data.client.phone||'';
          if($('#clientCep')) $('#clientCep').value = data.client.cep||'';
          if($('#clientStreet')) $('#clientStreet').value = data.client.street||'';
          if($('#clientNumber')) $('#clientNumber').value = data.client.number||'';
          if($('#clientNeighborhood')) $('#clientNeighborhood').value = data.client.neighborhood||'';
          if($('#clientComplement')) $('#clientComplement').value = data.client.complement||'';
          if($('#confirmAddress')) $('#confirmAddress').checked = !!data.client.confirm;
        }
      },100);
      return data;
    }catch(e){ return null; }
  }
  
  function clearStorage(){
    localStorage.removeItem(STORAGE_KEY);
    state.selectedSize = null; state.selectedToppings = []; state.step = 1; state.coupon = null;
    $$('input').forEach(i=>{ if(i.type==='checkbox') i.checked=false; else i.value=''; });
    $('#obsInput').value=''; renderAll(); showToast('Pedido limpo! 🧹');
  }
  
  function renderSizes(){
    $('#sizeGrid').innerHTML = SIZES.map(s=>`
      <div class="size-card ${state.selectedSize?.id===s.id?'is-selected':''}" data-id="${s.id}">
        ${s.popular?'<span class="size-card__badge">MAIS PEDIDO</span>':''}
        <div class="size-card__ml">${s.ml}ml</div>
        <div class="size-card__price">${formatBRL(s.price)}</div>
        <div class="size-card__desc">${s.desc}</div>
        <div class="size-card__limit">Máx ${s.maxToppings} adicionais</div>
      </div>`).join('');
    $$('#sizeGrid .size-card').forEach(c=>c.onclick=()=>{
      const newSize = SIZES.find(s=>s.id===c.dataset.id);
      if(state.selectedToppings.length > newSize.maxToppings){
        const removed = state.selectedToppings.length - newSize.maxToppings;
        state.selectedToppings = state.selectedToppings.slice(0, newSize.maxToppings);
        showToast(`Tamanho ${newSize.ml}ml só permite ${newSize.maxToppings}. ${removed} removido(s) ✂`, true);
      }
      state.selectedSize = newSize;
      if(state.step===1){ state.step=2; syncSteps(); }
      renderAll(); saveToStorage();
    });
  }
  
  function renderFilters(){
    $('#filterTabs').innerHTML = CATEGORIES.map(cat=>`<button class="${state.filter===cat?'is-active':''}" data-cat="${cat}">${cat}</button>`).join('');
    $$('#filterTabs button').forEach(b=>b.onclick=()=>{state.filter=b.dataset.cat;renderFilters();renderToppings();saveToStorage();});
  }
  
  function renderToppings(){
    const grid = $('#toppingsGrid'); const limitInfo = $('#limitAlert');
    if(!state.selectedSize){
      limitInfo.innerHTML = '⚠ <strong>Escolha um tamanho primeiro</strong> para ver seu limite.';
      $('#limitLabel').textContent='—';
      grid.innerHTML = '<p style="grid-column:1/-1;color:var(--muted);text-align:center;padding:20px">Selecione o tamanho na etapa 1</p>';
      return;
    }
    const max = state.selectedSize.maxToppings; const current = state.selectedToppings.length; const remaining = max-current;
    limitInfo.innerHTML = `📏 <strong>${state.selectedSize.ml}ml = máx ${max} adicionais</strong> • Você tem ${current}/${max} • ${remaining>0?`Pode adicionar mais ${remaining}`:`<span style="color:#C0392B">Limite atingido! Remova um para trocar.</span>`}`;
    $('#limitLabel').textContent = `${current}/${max}`;
    const list = TOPPINGS.filter(t=>state.filter==='Todos'||t.category===state.filter);
    grid.innerHTML = list.map(t=>{
      const sel=state.selectedToppings.includes(t.id); const idx=state.selectedToppings.indexOf(t.id);
      const isFree=sel&&idx<FREE_LIMIT; const disabled = !sel && current >= max;
      return `<div class="topping ${sel?'is-selected':''} ${disabled?'is-disabled':''}" data-id="${t.id}">
        ${isFree?'<span class="topping__free">GRÁTIS</span>':''}
        <div class="topping__emoji">${t.emoji}</div>
        <div class="topping__info"><strong>${t.name}</strong><small>${t.category} • ${t.price===0?'incluso':formatBRL(t.price)}</small></div>
        <div class="topping__check">${sel?'✓':disabled?'—':'+'}</div></div>`;
    }).join('');
    $$('#toppingsGrid .topping').forEach(card=>{
      card.onclick=()=>{
        const id=card.dataset.id; const i=state.selectedToppings.indexOf(id);
        if(i>-1){ state.selectedToppings.splice(i,1); }
        else{
          if(state.selectedToppings.length >= state.selectedSize.maxToppings){
            showToast(`🚫 Esse copo de ${state.selectedSize.ml}ml só permite ${state.selectedSize.maxToppings} adicionais!`, true);
            card.animate([{transform:'translateX(0)'},{transform:'translateX(-4px)'},{transform:'translateX(4px)'},{transform:'translateX(0)'}],{duration:250});
            return;
          }
          state.selectedToppings.push(id);
        }
        renderToppings();renderSummary();renderReview();renderCup();saveToStorage();
      };
    });
  }
  
  function renderCup(){
    if(!state.selectedSize){$('#cupName').textContent='Selecione o tamanho';$('#cupDesc').textContent='—';$('#cupFill').style.height='0%';return;}
    $('#cupName').textContent=state.selectedSize.label; $('#cupDesc').textContent=`${state.selectedToppings.length}/${state.selectedSize.maxToppings} adicionais • ${FREE_LIMIT} grátis`;
    $('#cupFill').style.height=state.selectedSize.fill;
  }
  function renderSummary(){
    const o=calculateOrder();
    if(!state.selectedSize){
      $('#summaryList').innerHTML='<p class="empty">Escolha um tamanho pra começar 👆</p>';
      $('#subtotal').textContent='R$ 0,00';$('#total').textContent='R$ 0,00';$('#freeLabel').textContent='0/4';
      $('#nextBtn').textContent='Escolha o tamanho';$('#nextBtn').disabled=true;$('#cartCount').textContent='0';$('#economyMsg').textContent='';return;
    }
    $('#cartCount').textContent=1+o.allItems.length; $('#freeLabel').textContent=`${o.freeUsed}/${FREE_LIMIT}`;
    $('#subtotal').textContent=formatBRL(o.subtotal); $('#total').textContent=formatBRL(o.total);
    $('#economyMsg').textContent=o.economy>0?`Você economizou ${formatBRL(o.economy)}!`:'';
    $('#summaryList').innerHTML=`
      <div class="item"><span>🥤 ${state.selectedSize.label}</span><b>${formatBRL(state.selectedSize.price)}</b></div>
      ${o.allItems.map((t,i)=>`<div class="item"><span>${i<FREE_LIMIT?'💚':'💜'} ${t.name}${i<FREE_LIMIT?' • GRÁTIS':''}</span><b>${i<FREE_LIMIT?'R$ 0,00':formatBRL(t.price)}</b></div>`).join('')}
      ${o.discount>0?`<div class="item" style="background:#E9FFE0"><span>🏷 BEMVINDO10</span><b>- ${formatBRL(o.discount)}</b></div>`:''}`;
    $('#nextBtn').textContent=state.step===1?`Continuar → ${formatBRL(o.total)}`:state.step===2?`Revisar • ${formatBRL(o.total)}`:`Total ${formatBRL(o.total)} • Confirmar`;
    $('#nextBtn').disabled=false;
  }
  function renderReview(){
    const o=calculateOrder();
    if(!state.selectedSize){$('#reviewBox').innerHTML='<p>Escolha tamanho antes.</p>';return;}
    $('#reviewBox').innerHTML=`
      <div><span>Tamanho</span><b>${state.selectedSize.label} (máx ${state.selectedSize.maxToppings})</b></div>
      <div><span>Adicionais (${o.allItems.length}/${state.selectedSize.maxToppings})</span><b>${o.allItems.map(t=>t.name).join(', ')||'Nenhum'}</b></div>
      <div><span>Grátis</span><b>${o.freeUsed}/${FREE_LIMIT}</b></div>
      <div style="border-top:1px dashed #E6DDFF;padding-top:8px;font-weight:800;font-size:16px"><span>Total</span><b>${formatBRL(o.total)}</b></div>`;
  }
  function syncSteps(){
    $$('.steps__item').forEach(b=>b.classList.toggle('is-active',Number(b.dataset.step)===state.step));
    $$('.panel').forEach(p=>p.classList.remove('is-active')); $(`#step${state.step}`).classList.add('is-active');
    $('#progressBar').style.width={1:'33%',2:'66%',3:'100%'}[state.step]; renderSummary();
  }
  function renderAll(){ renderSizes(); renderFilters(); renderToppings(); renderSummary(); renderCup(); syncSteps(); renderReview(); }
  
  function validateDelivery(){
    const get = id => document.getElementById(id);
    const fields = [
      {el:get('clientName'), name:'Nome', min:3},
      {el:get('clientPhone'), name:'WhatsApp', min:8},
      {el:get('clientCep'), name:'CEP', pattern:/^\d{5}-?\d{3}$/},
      {el:get('clientStreet'), name:'Rua', min:3},
      {el:get('clientNumber'), name:'Número', min:1},
      {el:get('clientNeighborhood'), name:'Bairro', min:3},
    ];
    for(const f of fields){
      const v = f.el.value.trim();
      if(!v){ f.el.classList.add('is-invalid'); f.el.focus(); showToast(`⚠ Preencha o campo ${f.name}`, true); return false; }
      if(f.min && v.length < f.min){ f.el.classList.add('is-invalid'); f.el.focus(); showToast(`⚠ ${f.name} muito curto`, true); return false; }
      if(f.pattern && !f.pattern.test(v)){ f.el.classList.add('is-invalid'); f.el.focus(); showToast(`⚠ ${f.name} inválido. Ex: 80000-000`, true); return false; }
      f.el.classList.remove('is-invalid');
    }
    const phoneDigits = get('clientPhone').value.replace(/\D/g,'');
    if(phoneDigits.length < 10){ get('clientPhone').classList.add('is-invalid'); showToast('⚠ WhatsApp inválido. Use (41) 99999-9999', true); return false; }
    if(get('clientNumber').value.trim().toLowerCase()==='s/n' || get('clientNumber').value.trim()==='0'){ get('clientNumber').classList.add('is-invalid'); showToast('⚠ Número não pode ser S/N ou 0 - motoboy precisa do número real', true); return false; }
    if(!get('confirmAddress').checked){ showToast('⚠ Confirme que seu endereço existe ✅', true); get('confirmAddress').focus(); return false; }
    return true;
  }
  
  function setupEvents(){
    $('#nextBtn').onclick=()=>{
      if(state.step===1&&!state.selectedSize){showToast('Escolha tamanho', true);return;}
      if(state.step<3){state.step++;syncSteps();if(state.step===3)renderReview();}
      else handleCheckout(); saveToStorage();
    };
    $('#backTo2').onclick=()=>{state.step=2;syncSteps();saveToStorage();};
    $('#cartToggle').onclick=()=>$('#summary').classList.add('is-open');
    $('#closeSummary').onclick=()=>$('#summary').classList.remove('is-open');
    $('#applyCoupon').onclick=()=>{
      const v=$('#couponInput').value.trim().toUpperCase();
      if(v==='BEMVINDO10'){state.coupon=v;showToast('Cupom -10% 🎉');}
      else if(v===''){state.coupon=null;}
      else {showToast('Cupom inválido. Tente BEMVINDO10', true); return;}
      renderSummary();renderReview();saveToStorage();
    };
    $('#finishBtn').onclick=handleCheckout;
    $('#clearBtn').onclick=clearStorage;
    $$('#clientName, #clientPhone, #clientCep, #clientStreet, #clientNumber, #clientNeighborhood, #clientComplement, #obsInput, #couponInput').forEach(el=>{
      if(!el) return;
      el.addEventListener('input', ()=>{ el.classList.remove('is-invalid'); saveToStorage(); });
    });
    // Máscaras leves
    const cepEl = $('#clientCep'); if(cepEl) cepEl.addEventListener('input', e=>{
      let v=e.target.value.replace(/\D/g,''); if(v.length>5) v=v.replace(/^(\d{5})(\d)/,'$1-$2'); e.target.value=v;
    });
    const phoneEl = $('#clientPhone'); if(phoneEl) phoneEl.addEventListener('input', e=>{
      let v=e.target.value.replace(/\D/g,''); v=v.replace(/^(\d{2})(\d)/g,'($1) $2'); v=v.replace(/(\d{5})(\d{4})$/,'$1-$2'); e.target.value=v;
    });
    $('#confirmAddress')?.addEventListener('change', saveToStorage);
    document.addEventListener('click', e=>{
      const btn=e.target.closest('.steps__item'); if(!btn) return;
      const target=Number(btn.dataset.step);
      if(target===1 || (target===2 && state.selectedSize) || (target===3 && state.selectedSize)){
        state.step=target;syncSteps();if(target===3)renderReview();saveToStorage();
      }
    });
  }
  
  function handleCheckout(){
    if(!state.selectedSize){ showToast('Escolha um tamanho primeiro', true); state.step=1; syncSteps(); return; }
    if(!validateDelivery()) return;
    const o=calculateOrder();
    const c = {
      name: $('#clientName').value.trim(),
      phone: $('#clientPhone').value.trim(),
      cep: $('#clientCep').value.trim(),
      street: $('#clientStreet').value.trim(),
      number: $('#clientNumber').value.trim(),
      bairro: $('#clientNeighborhood').value.trim(),
      comp: $('#clientComplement').value.trim(),
    };
    const obs=$('#obsInput').value.trim();
    const msg = `Olá! Quero pedir:%0A🥤 *${state.selectedSize.label}* - ${formatBRL(state.selectedSize.price)}%0AAdicionais (${o.allItems.length}/${state.selectedSize.maxToppings}): ${o.allItems.map(t=>t.name).join(', ')||'Nenhum'}%0A%0A*Entrega:*%0A👤 ${c.name}%0A📱 ${c.phone}%0A📍 ${c.street}, ${c.number} - ${c.bairro}%0A📦 CEP: ${c.cep}${c.comp?` - ${c.comp}`:''}%0A%0ATotal: *${formatBRL(o.total)}*${o.discount>0?` (com cupom ${state.coupon})`:''}${obs?`%0AObs: ${obs}`:''}%0A%0A_Endereço confirmado pelo cliente ✅_`;
    window.open(`https://wa.me/5541999999999?text=${msg}`,'_blank');
    showToast('Pedido enviado pro WhatsApp com endereço completo 🚀');
  }
  
  function init(){
    const saved = loadFromStorage(); if(saved){ showToast('Pedido restaurado! ✅'); }
    renderAll(); setupEvents();
  }
  init();