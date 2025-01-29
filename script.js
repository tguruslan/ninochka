if (typeof navigator.serviceWorker !== 'undefined') {
    navigator.serviceWorker.register('sw.js')
}
const URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT_jDlK16raPFNfxz-rvNX9DQYDT0LnNTOGJAa5DqFJlMnnkZyr8Gutgb8yciiXy10a2sordGS8DPe4/pubhtml?gid=0&single=true';

let skip = ["набирає","вихідний","відпустка","day off","time off","набір закрито"];
let skip_summ = skip.concat(["зустріч","pictorial meeting"]);

function filterData(data, skip){
  const resp = [];
  let i = 0;
  data.forEach(event => {
    const[start,end,title,alias]=event;
    let add=true;
    for (let part of skip){
      if(title.toLowerCase().includes(part.toLowerCase())){
        add=false;
      }
    }
    if(add){
      resp[i]=event;
      i++;
    }
  });
  return resp;
}

function getData() {
    $.ajax({
        url: URL,
        type: 'GET',
        success: function(data) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(data, 'text/html');
            const json_data = $(doc).find('table tbody tr:first td:first').text();
            const result = JSON.parse(json_data);
            renderEvents(filterData(result, skip));
            summLessons(filterData(result, skip_summ));
        },
        error: function(error) {
            console.error('Error:', error);
        }
    });
}

function getPrice(name, hours){
    if(name.toLowerCase().includes("pair")){
  	    price=220;
    }else{
  	    price=180;
    }
    return price*hours;
}


function summLessons(data) {
    var today = new Date();
    var summ_data={};
    for (const lesson in data){
    	lesson_data=data[lesson];
    	if(
      		(lesson_data[3] == "work") &&
        	(lesson_data[0] < new Date(today.getFullYear(),today.getMonth() + 1 ,1).getTime())
        ){
            if (!summ_data[lesson_data[2]]) {
            	summ_data[lesson_data[2]] = 0;
            }
            summ_data[lesson_data[2]]+=((lesson_data[1]-lesson_data[0])/1000/60/60);
      }
    }
    var totalSumm=0;
    var totalHours=0;
    var summ = '<div class="col s12">'+
                '<ul class="collection with-header z-depth-5">';
    summ += '<li class="collection-header"><h4>Підсумок за місяць</h4></li>';
    for (const student in summ_data){
        var studentSumm=getPrice(student,summ_data[student]);
        totalSumm+=studentSumm;
        totalHours+=summ_data[student];
        summ += '<li class="collection-item">'+student+
        '<span class="secondary-content">'+summ_data[student]+
        " год\t&nbsp;\t&nbsp;\t"+studentSumm+' грн</span>'+
        '</li>';
    }
    summ += '<li class="collection-item">'+'Всього:'+
        '<span class="secondary-content">'+totalHours+
        " год\t&nbsp;\t&nbsp;\t"+totalSumm+' грн</span>'+
        '</li>';

    summ += '</ul>'+
        '</div>';
    $('.row').append(summ);
}

function groupEventsByDate(events) {
    const groupedEvents = {};
    events.forEach(event => {
        const [start, end, title, alias] = event;
        const ds = new Date(parseInt(start));
        const date = ds.getDate().toString().padStart(2, '0')+'.'+(ds.getMonth()+1).toString().padStart(2, '0');
        if (end) {
            if (!groupedEvents[date]) {
                groupedEvents[date] = [];
            }
            groupedEvents[date].push({ start, end, title, alias});
        }else if(title){
            $('.row').append(
                '<div class="col s12"><div class="card"><div class="card-content"><h6>Оновлено: '+
                title+
                '</h6></div></div></div>'
            );
        }
    });
    return groupedEvents;
}

function renderEvents(events) {
    const container = $('.row');
    const groupedEvents = groupEventsByDate(events);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (const date in groupedEvents) {
    	if(
      	(parseInt(groupedEvents[date][0]["start"]) >= today.getTime()) &&
      	(parseInt(groupedEvents[date][0]["start"]) <= new Date(today.getFullYear(),today.getMonth(),today.getDate() + 14).getTime())
      ){
            var day = '<div class="col s12">'+
                '<ul class="collection with-header z-depth-5">'+
                '<li class="collection-header"><h4><i class="material-icons">date_range</i> ' + date + ' ' + [
                    'Неділя',
                    'Понеділок',
                    'Вівторок',
                    'Середа',
                    'Четвер',
                    'П`ятниця',
                    'Субота',
                ][new Date(parseInt(groupedEvents[date][0]["start"])).getDay()] +'</h4></li>';
            groupedEvents[date].forEach(event => {
                const ds = new Date(parseInt(event.start));
                const de = new Date(parseInt(event.end));
                const now = new Date();
                day += '<li class="collection-item'+
                (event.alias=="work"?" blue lighten-5":"")+
                ((de < now)?" grey grey-text":"")+
                (((ds <= now) && (now <= de))?" cyan accent-4":"")+
                '"'+
                ' time="'+ds.getTime()+'"'+
                '>'+
                '<span class="">'+
                '<i class="tiny material-icons">access_time</i> '+
                '</span>'+
                ds.getHours().toString().padStart(2, '0')+":"+ds.getMinutes().toString().padStart(2, '0')+
                "-"+
                de.getHours().toString().padStart(2, '0')+":"+de.getMinutes().toString().padStart(2, '0')+
                '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+
                event.title.replace(/\(.*?\)/g, '')+
                '</li>';
            });

            day += '</ul>'+
                '</div>';
            container.append(day);
        }
    }
}

$(document).ready(function() {
    getData();

    if (! Cookies.get("notification")){
        Notification.requestPermission().then((result) => {
            if (result === "granted") {
                Cookies.set("notification","1");
            }
        });
    }

    if (Cookies.get("notification")){
        setTimeout(function(){
            const now = new Date();
            const now_ts = now.getTime();

            $("[time]").each(function(){
                diff_time = $(this).attr("time") - now_ts
                if(diff_time > 0 && diff_time < (10 * 60 * 1000)){
                    const options = {
                        body: $(this).text().replace("access_time ",""),
                        icon: "icons/icon-48-48.png",
                    }
                    new Notification("rozklad", options);
                    $(this).removeAttr("time");
                }
            });
        }, 5000);
    }
});
