const daylightAddDays=(key,amount)=>{let date=new Date(`${key}T12:00:00`);date.setDate(date.getDate()+amount);return daylightDateKey(date)};
const daylightTenYears=()=>{let date=new Date();date.setFullYear(date.getFullYear()+10);return daylightDateKey(date)};

function habitHistory(habit){
  habit.history??={};
  let today=daylightDateKey(new Date());
  if(habit.checked&&!Object.prototype.hasOwnProperty.call(habit.history,today))habit.history[today]=true;
  return habit.history;
}
function habitCompleted(habit,key){return habitHistory(habit)[key]===true}
function habitStreak(habit){let count=0,key=daylightDateKey(new Date());while(habitCompleted(habit,key)){count++;key=daylightAddDays(key,-1)}return count}
function renderHabitGraph(){
  let today=daylightDateKey(new Date()),days=Array.from({length:7},(_,index)=>daylightAddDays(today,index-6)),total=data.habits.length||1,counts=days.map(key=>data.habits.filter(habit=>habitCompleted(habit,key)).length),completed=counts.reduce((sum,count)=>sum+count,0);
  $('#habitGraphSummary').textContent=`${completed} check-ins this week`;
  $('#habitGraph').innerHTML=days.map((key,index)=>{let date=new Date(`${key}T12:00:00`),count=counts[index];return `<div class="habit-day ${key===today?'today':''}"><i style="height:${Math.max(5,count/total*120)}px"></i><b>${date.toLocaleDateString('en-IN',{weekday:'short'})}</b><span>${count}/${data.habits.length}</span></div>`}).join('');
}
renderHabits=()=>{
  let today=daylightDateKey(new Date()),done=data.habits.filter(habit=>habitCompleted(habit,today)).length;
  $('#habitSummary').textContent=`${done} of ${data.habits.length} complete today`;
  $('#streakStat').innerHTML=`${data.habits.length?Math.max(...data.habits.map(habitStreak)):0} <em>days</em>`;
  let row=habit=>{let complete=habitCompleted(habit,today),streak=habitStreak(habit);return `<div class="habit-row"><span class="habit-icon ${habit.id%2?'':'lav'}">${daylightEscape(habit.icon||'✦')}</span><p>${daylightEscape(habit.name)}<small>${streak?`${streak} day streak`:'Check in today to start your streak'}</small></p><button class="habit-check ${complete?'checked':''}" data-daily-habit="${habit.id}" aria-label="Mark ${daylightEscape(habit.name)} as ${complete?'not done':'done'} today">${complete?'✓':''}</button><button class="remove-btn" data-daily-remove-habit="${habit.id}" aria-label="Remove ${daylightEscape(habit.name)}" title="Remove habit">×</button></div>`};
  $('#habitList').innerHTML=data.habits.length?data.habits.map(row).join(''):'<p class="muted empty-state">Create a habit to begin daily check-ins.</p>';
  $('#habitDots').innerHTML=data.habits.map(habit=>`<i class="${habitCompleted(habit,today)?'active':''}"></i>`).join('');
  $('#habitsPage').innerHTML=data.habits.map(habit=>{let history=habitHistory(habit),streak=habitStreak(habit);return `<article class="panel habit-card"><button class="remove-btn" data-daily-remove-habit="${habit.id}" aria-label="Remove ${daylightEscape(habit.name)}" title="Remove habit">×</button><span class="habit-icon">${daylightEscape(habit.icon||'✦')}</span><h2>${daylightEscape(habit.name)}</h2><p class="muted">${streak?`${streak} day streak`:'No current streak yet'}</p><div class="week-track">${Array.from({length:7},(_,index)=>{let key=daylightAddDays(today,index-6),date=new Date(`${key}T12:00:00`);return `<div>${date.toLocaleDateString('en-IN',{weekday:'narrow'})}<i class="${history[key]?'good':''}"></i></div>`}).join('')}</div><p class="habit-status">Tap the checkmark on the Overview page to record today.</p></article>`}).join('');
  $$('[data-daily-habit]').forEach(button=>button.onclick=()=>{let habit=data.habits.find(item=>String(item.id)===button.dataset.dailyHabit);if(!habit)return;let history=habitHistory(habit);history[today]=!history[today];habit.checked=history[today];persist();refreshAll()});
  $$('[data-daily-remove-habit]').forEach(button=>button.onclick=()=>{let habit=data.habits.find(item=>String(item.id)===button.dataset.dailyRemoveHabit);if(!habit||!confirm(`Remove “${habit.name}”?`))return;data.habits=data.habits.filter(item=>item!==habit);persist();refreshAll()});
  renderHabitGraph();
};

renderJournal=()=>{
  let entries=journalEntries(),editor=$('#journalText'),keys=Object.keys(entries).filter(key=>entries[key].trim()).sort((a,b)=>b.localeCompare(a));
  if(document.activeElement!==editor)editor.value=entries[selectedJournalDate]||'';
  $('#journalPicker').value=selectedJournalDate;$('#journalDate').textContent=new Date(`${selectedJournalDate}T12:00:00`).toLocaleDateString('en-IN',{weekday:'long',month:'long',day:'numeric'});
  $('#journalHistory').innerHTML=keys.length?keys.slice(0,20).map(key=>`<button class="journal-entry ${key===selectedJournalDate?'active':''}" data-journal-date="${key}"><strong>${new Date(`${key}T12:00:00`).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</strong><small>${daylightEscape(entries[key].replace(/\s+/g,' ').slice(0,74))}</small></button>`).join(''):'<p class="muted empty-state">Your saved entries will appear here.</p>';
  $$('[data-journal-date]').forEach(button=>button.onclick=()=>{selectedJournalDate=button.dataset.journalDate;renderJournal()});
};
$('#journalPrev').onclick=()=>{selectedJournalDate=daylightAddDays(selectedJournalDate,-1);renderJournal()};$('#journalNext').onclick=()=>{selectedJournalDate=daylightAddDays(selectedJournalDate,1);renderJournal()};$('#journalPicker').onchange=()=>{if($('#journalPicker').value){selectedJournalDate=$('#journalPicker').value;renderJournal()}};
$('#entrySchedule').max=`${daylightTenYears()}T23:59`;$('#calendarPicker').max=daylightTenYears().slice(0,7);
function syncCalendarPicker(){$('#calendarPicker').value=`${calDate.getFullYear()}-${String(calDate.getMonth()+1).padStart(2,'0')}`}
$('#calendarPicker').onchange=()=>{if(!$('#calendarPicker').value)return;let [year,month]=$('#calendarPicker').value.split('-').map(Number);calDate=new Date(year,month-1,1);renderCalendar();syncCalendarPicker()};
$('#prevMonth').onclick=()=>{calDate.setMonth(calDate.getMonth()-1);renderCalendar();syncCalendarPicker()};$('#nextMonth').onclick=()=>{calDate.setMonth(calDate.getMonth()+1);renderCalendar();syncCalendarPicker()};$('#goToday').onclick=()=>{calDate=new Date();renderCalendar();syncCalendarPicker()};
let daylightDailyRefresh=refreshAll;refreshAll=()=>{daylightDailyRefresh();syncCalendarPicker()};refreshAll();
