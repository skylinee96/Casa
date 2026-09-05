(() => {
  const dictionary = {
    en: {sharedHome:'Shared home · August',greeting:'Good morning, {name}',monthlyBudget:'Household budget · this month',monthlyIncome:'Monthly budget',planned:'100% of the monthly budget planned',toDo:'To do',upcomingPlans:'Upcoming plans',yourMoney:'Your money',budget:'Budget',budgetAllocation:'Budget allocation',total:'Total',savings:'Savings',dailySpending:'Everyday spending',householdBills:'Household bills',allocationHint:'Move the sliders to set your monthly allocation.',savingsHistory:'Savings · last 6 months',recentExpenses:'Recent expenses',together:'Together',plans:'Plans',sharedLists:'Shared lists',lists:'Lists',home:'Home',invitePeople:'Invite people',inviteDescription:'Send this private link to the people in your household. Changes appear for everyone immediately when cloud sync is enabled.',copyInvite:'Copy invite link',copied:'Link copied',yourName:'Your name',save:'Save',addExpense:'Add expense',expenseName:'Name',amount:'Amount (PLN)',addPlan:'Add plan',eventName:'Name',eventNotes:'Additional information',date:'Date',addTask:'Add task or list item',taskName:'Item',deleteTask:'Delete item',add:'Add'},
    pl: {sharedHome:'Wspólny dom · sierpień',greeting:'Dzień dobry, {name}',monthlyBudget:'Budżet domowy · w tym miesiącu',monthlyIncome:'Miesięczny budżet',planned:'Zaplanowano 100% miesięcznego budżetu',toDo:'Do zrobienia',upcomingPlans:'Najbliższe plany',yourMoney:'Twoje pieniądze',budget:'Budżet',budgetAllocation:'Podział budżetu',total:'Suma',savings:'Oszczędności',dailySpending:'Codzienne wydatki',householdBills:'Opłaty domowe',allocationHint:'Przesuń suwaki, aby ustawić własny podział.',savingsHistory:'Oszczędności · ostatnie 6 miesięcy',recentExpenses:'Ostatnie wydatki',together:'Razem',plans:'Plany',sharedLists:'Wspólne listy',lists:'Listy',home:'Dom',invitePeople:'Zaproś uczestników',inviteDescription:'Wyślij ten prywatny link osobom w swoim domu. Zmiany pojawią się u wszystkich natychmiast po włączeniu synchronizacji w chmurze.',copyInvite:'Kopiuj link zaproszenia',copied:'Link skopiowany',yourName:'Twoje imię',save:'Zapisz',addExpense:'Dodaj wydatek',expenseName:'Nazwa',amount:'Kwota (PLN)',addPlan:'Dodaj plan',eventName:'Nazwa',eventNotes:'Dodatkowe informacje',date:'Data',addTask:'Dodaj zadanie lub element listy',taskName:'Element',deleteTask:'Usuń element',add:'Dodaj'}
  };
  const initial = {income:4800, allocation:{savings:20,daily:45,bills:35}, tasks:[{id:'shop',name:'Weekend shopping',done:false},{id:'internet',name:'Pay internet bill',done:false}], events:[{id:'porto',name:'Weekend in Porto',date:'2026-09-06',description:''}], expenses:[{id:'groceries',name:'Groceries',amount:218},{id:'utilities',name:'Internet',amount:75}], savings:[520,760,930,1160,1520,960], name:'Marta'};
  const params = new URLSearchParams(location.search);
  const homeId = params.get('home') || localStorage.getItem('casa-home') || crypto.randomUUID();
  localStorage.setItem('casa-home', homeId);
  const saved = localStorage.getItem(`casa-state-${homeId}`);
  let state = saved ? JSON.parse(saved) : initial;
  let language = localStorage.getItem('casa-language') || 'en';
  let memberName = localStorage.getItem('casa-member-name') || state.name || 'Marta';
  let remoteSave = null;
  const $ = (id) => document.getElementById(id);
  const formatMoney = (value) => `${Number(value).toLocaleString(language === 'pl' ? 'pl-PL' : 'en-US')} ${language === 'pl' ? 'zł' : 'PLN'}`;
  const text = (key) => dictionary[language][key];
  const persist = () => { localStorage.setItem(`casa-state-${homeId}`, JSON.stringify(state)); if (remoteSave) remoteSave(state); };
  const dateLabel = (date) => new Intl.DateTimeFormat(language === 'pl' ? 'pl-PL' : 'en-GB',{day:'2-digit',month:'short'}).format(new Date(`${date}T12:00:00`));
  const translate = () => { document.documentElement.lang=language; document.querySelectorAll('[data-i18n]').forEach(el => el.textContent=text(el.dataset.i18n)); $('languageButton').textContent=language === 'en' ? 'PL' : 'EN'; };
  const render = () => {
    translate();
    $('monthlyIncome').textContent=formatMoney(state.income);
    const total = state.allocation.savings + state.allocation.daily + state.allocation.bills;
    $('allocationSum').textContent=`${text('total') || 'Total'}: ${total}%`;
    $('allocationSum').style.color=total===100?'':'#ad3154';
    [['savings','savingsRange','savingsValue'],['daily','dailyRange','dailyValue'],['bills','billsRange','billsValue']].forEach(([key,range,value])=>{ $(range).value=state.allocation[key]; $(value).textContent=`${state.allocation[key]}% · ${formatMoney(state.income*state.allocation[key]/100)}`; });
    const taskMarkup = state.tasks.map(task => `<li><input type="checkbox" data-task="${task.id}" ${task.done?'checked':''}><label class="${task.done?'done':''}">${escape(task.name)}</label><button class="delete-task" type="button" data-delete-task="${task.id}" aria-label="${text('deleteTask')}">×</button></li>`).join('');
    $('homeTasks').innerHTML=taskMarkup || `<li>${language==='pl'?'Brak zadań':'No tasks yet'}</li>`;
    $('listItems').innerHTML=state.tasks.map(task => `<li><input type="checkbox" data-task="${task.id}" ${task.done?'checked':''}><span class="event-name ${task.done?'done':''}">${escape(task.name)}</span><button class="delete-task" type="button" data-delete-task="${task.id}" aria-label="${text('deleteTask')}">×</button></li>`).join('');
    const eventMarkup=state.events.sort((a,b)=>a.date.localeCompare(b.date)).map(event=>`<li><span class="event-date">${dateLabel(event.date)}</span><span class="event-copy"><span class="event-name">${escape(event.name)}</span><span class="event-sub">${language==='pl'?'Wspólny plan':'Shared plan'}</span>${event.description?`<span class="event-description">${escape(event.description)}</span>`:''}</span></li>`).join('');
    $('homeEvents').innerHTML=eventMarkup; $('planList').innerHTML=eventMarkup;
    $('expenseList').innerHTML=state.expenses.slice().reverse().map(expense=>`<li><span><span class="expense-name">${escape(expense.name)}</span><span class="expense-sub">${language==='pl'?'Wydatek domowy':'Household expense'}</span></span><span class="expense-amount">−${formatMoney(expense.amount)}</span></li>`).join('');
    const savingTotal=state.savings.reduce((sum,value)=>sum+value,0); $('savingsTotal').textContent=language==='pl'?`Łącznie: ${formatMoney(savingTotal)}`:`Total: ${formatMoney(savingTotal)}`;
    const months=language==='pl'?['Mar','Kwi','Maj','Cze','Lip','Sie']:['Mar','Apr','May','Jun','Jul','Aug']; const max=Math.max(...state.savings);
    $('savingsChart').innerHTML=state.savings.map((value,index)=>`<div class="chart-item ${index===state.savings.length-1?'current':''}"><div class="chart-bar" style="height:${Math.max(9,value/max*100)}%"></div><span>${months[index] || index+1}</span></div>`).join('');
    $('chartSummary').textContent=language==='pl'?`W tym miesiącu: +${formatMoney(state.savings.at(-1))}`:`This month: +${formatMoney(state.savings.at(-1))}`;
    $('homeTitle').textContent=text('greeting').replace('{name}', memberName);
    $('memberName').value=memberName; $('householdButton').textContent=(memberName || 'M').slice(0,1).toUpperCase();
  };
  const escape = (value) => String(value).replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  document.querySelectorAll('.bottom-nav button').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('.bottom-nav button').forEach(el=>el.classList.toggle('selected',el===button));document.querySelectorAll('.screen').forEach(el=>el.classList.toggle('active',el.id===button.dataset.target));location.hash=button.dataset.target;}));
  document.querySelectorAll('[data-open]').forEach(button=>button.addEventListener('click',()=>$(button.dataset.open).showModal()));
  $('householdButton').addEventListener('click',()=> $('householdModal').showModal());
  $('languageButton').addEventListener('click',()=>{language=language==='en'?'pl':'en';localStorage.setItem('casa-language',language);render();});
  ['savings','daily','bills'].forEach(key=> $(`${key}Range`).addEventListener('input',event=>{state.allocation[key]=Number(event.target.value);render();persist();}));
  document.addEventListener('change',event=>{if(event.target.dataset.task){state.tasks=state.tasks.map(task=>task.id===event.target.dataset.task?{...task,done:event.target.checked}:task);render();persist();}});
  document.addEventListener('click',event=>{const button=event.target.closest('[data-delete-task]');if(button){state.tasks=state.tasks.filter(task=>task.id!==button.dataset.deleteTask);render();persist();}const close=event.target.closest('[data-close]');if(close) $(close.dataset.close).close();});
  $('expenseForm').addEventListener('submit',event=>{event.preventDefault();const data=new FormData(event.target);state.expenses.push({id:crypto.randomUUID(),name:data.get('name'),amount:Number(data.get('amount'))});event.target.closest('dialog').close();event.target.reset();render();persist();});
  $('eventForm').addEventListener('submit',event=>{event.preventDefault();const data=new FormData(event.target);state.events.push({id:crypto.randomUUID(),name:data.get('name'),date:data.get('date'),description:data.get('description').trim()});event.target.closest('dialog').close();event.target.reset();render();persist();});
  $('listForm').addEventListener('submit',event=>{event.preventDefault();const data=new FormData(event.target);state.tasks.push({id:crypto.randomUUID(),name:data.get('name'),done:false});event.target.closest('dialog').close();event.target.reset();render();persist();});
  $('incomeForm').addEventListener('submit',event=>{event.preventDefault();state.income=Number(new FormData(event.target).get('amount'));event.target.closest('dialog').close();render();persist();});
  $('householdForm').addEventListener('submit',event=>{event.preventDefault();memberName=$('memberName').value.trim() || 'Marta';localStorage.setItem('casa-member-name',memberName);$('householdModal').close();render();});
  $('copyInvite').addEventListener('click',async()=>{await navigator.clipboard.writeText(`${location.origin}${location.pathname}?home=${homeId}`);$('copyInvite').textContent=text('copied');setTimeout(()=> $('copyInvite').textContent=text('copyInvite'),1500);});
  window.addEventListener('casa-sync-ready', event=>{remoteSave=event.detail.save;event.detail.watch(nextState=>{if(nextState){state=nextState;localStorage.setItem(`casa-state-${homeId}`,JSON.stringify(state));render();}else{remoteSave(state);}});});
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
  render();
})();
