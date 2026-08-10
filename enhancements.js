// Cross-view task syncing and journal entry history.
const daylightEscape=value=>String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
const daylightDateKey=date=>{let d=new Date(date),month=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');return `${d.getFullYear()}-${month}-${day}`};
let selectedJournalDate=daylightDateKey(new Date());

function journalEntries(){
  data.journalEntries??={};
  if(data.journal&&!data.journalEntries[daylightDateKey(new Date())])data.journalEntries[daylightDateKey(new Date())]=data.journal;
  return data.journalEntries;
}
function renderJournal(){
  let entries=journalEntries(),editor=$('#journalText'),keys=Object.keys(entries).filter(key=>entries[key].trim()).sort((a,b)=>b.localeCompare(a));
  if(document.activeElement!==editor)editor.value=entries[selectedJournalDate]||'';
  $('#journalDate').textContent=new Date(`${selectedJournalDate}T12:00:00`).toLocaleDateString('en-IN',{weekday:'long',month:'long',day:'numeric'});
  $('#journalHistory').innerHTML=keys.length?keys.slice(0,12).map(key=>`<button class="journal-entry ${key===selectedJournalDate?'active':''}" data-journal-date="${key}"><strong>${new Date(`${key}T12:00:00`).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</strong><small>${daylightEscape(entries[key].replace(/\s+/g,' ').slice(0,74))}</small></button>`).join(''):'<p class="muted empty-state">Your saved entries will appear here.</p>';
  $$('[data-journal-date]').forEach(button=>button.onclick=()=>{selectedJournalDate=button.dataset.journalDate;renderJournal()});
}
function bindDashboardTaskActions(){
  $$('[data-task]').forEach(input=>input.onchange=()=>{let task=data.tasks.find(item=>String(item.id)===input.dataset.task);if(!task)return;task.done=input.checked;persist();refreshAll()});
  $$('[data-remove-task]').forEach(button=>button.onclick=()=>{let task=data.tasks.find(item=>String(item.id)===button.dataset.removeTask);if(!task||!confirm(`Remove “${task.name}”?`))return;data.tasks=data.tasks.filter(item=>item!==task);persist();refreshAll()});
}
let daylightRefresh=refreshAll;
refreshAll=()=>{daylightRefresh();renderJournal();bindDashboardTaskActions()};
$('#saveJournal').onclick=()=>{let content=$('#journalText').value.trim(),entries=journalEntries();if(content)entries[selectedJournalDate]=content;else delete entries[selectedJournalDate];data.journal=entries[daylightDateKey(new Date())]||'';persist();renderJournal();$('#saveStatus').textContent=content?'Saved securely.':'Entry removed.';setTimeout(()=>$('#saveStatus').textContent='',2400)};
refreshAll();

function bindExpenseDeletes(){
  $$('#expenseList .expense').forEach((row,index)=>{let expense=data.expenses[index];if(!expense)return;let button=document.createElement('button');button.className='remove-btn';button.type='button';button.title='Remove expense';button.setAttribute('aria-label',`Remove ${expense.name}`);button.textContent='×';button.onclick=()=>{if(!confirm(`Remove “${expense.name}”?`))return;data.expenses=data.expenses.filter(item=>item!==expense);persist();refreshAll()};row.append(button)});
}
function bindCalendarEventDeletes(){
  let year=calDate.getFullYear(),month=calDate.getMonth(),visible=data.events.filter(event=>{let date=new Date(event.scheduledAt);return date.getFullYear()===year&&date.getMonth()===month}).sort((a,b)=>new Date(a.scheduledAt)-new Date(b.scheduledAt));
  $$('#calendarEvents .calendar-event').forEach((row,index)=>{let event=visible[index];if(!event)return;let button=document.createElement('button');button.className='remove-btn';button.type='button';button.title='Remove event';button.setAttribute('aria-label',`Remove ${event.name}`);button.textContent='×';button.onclick=()=>{if(!confirm(`Remove “${event.name}”?`))return;data.events=data.events.filter(item=>item!==event);persist();refreshAll()};row.append(button)});
}
let daylightAuditRefresh=refreshAll;
refreshAll=()=>{daylightAuditRefresh();bindExpenseDeletes();bindCalendarEventDeletes()};
refreshAll();
