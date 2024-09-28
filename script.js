if (typeof navigator.serviceWorker !== 'undefined') {
    navigator.serviceWorker.register('sw.js')
}
const URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT_jDlK16raPFNfxz-rvNX9DQYDT0LnNTOGJAa5DqFJlMnnkZyr8Gutgb8yciiXy10a2sordGS8DPe4/pubhtml?gid=0&single=true';

function getData() {
    $.ajax({
        url: URL,
        type: 'GET',
        success: function(data) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(data, 'text/html');
            const json_data = $(doc).find('table tbody tr:first td:first').text();
            const result = JSON.parse(json_data);
            renderEvents(result);
            /* summLessons(data) */;
        },
        error: function(error) {
            console.error('Error:', error);
        }
    });
}


function summLessons(data) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(data, 'text/html');
    const rows = $(doc).find('table tr');

    var day = '<div class="col s12 m6">'+
                '<ul class="collection with-header z-depth-5">'+
                    '<li class="collection-header"><h4>Занять за місяць</h4></li>';

            const result = [];
            rows.each(function() {
                const cells = $(this).find('td:nth-child(n+5):nth-child(-n+6)');
                const rowData = cells.map(function() {
                    return $(this).text().trim();
                }).get();
                if(rowData[0] && (rowData[0] != 'Ім\'я')){
                    day += '<li class="collection-item">'+rowData[0].replace(/\(.*?\)/g, '')+'<span class="secondary-content">'+rowData[1]+'</span></li>';
                }

            });
            day += '</ul>'+
        '</div>';
        $('.row').append(day);
}

function groupEventsByDate(events) {
    const groupedEvents = {};
    events.forEach(event => {
        const [start, end, title] = event;
        const ds = new Date(parseInt(start));
        const date = ds.getDate().toString().padStart(2, '0')+'.'+(ds.getMonth()+1).toString().padStart(2, '0');
        if (end) {
            if (!groupedEvents[date]) {
                groupedEvents[date] = [];
            }
            groupedEvents[date].push({ start, end, title });
        }else if(title){
            $('.row').append('<div class="col s12"><div class="card"><div class="card-content"><h6>Оновлено: '+title+'</h6></div></div></div>');
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
    	if((parseInt(groupedEvents[date][0]["start"]) >= today.getTime()) && (parseInt(groupedEvents[date][0]["start"]) <= new Date(today.getFullYear(),today.getMonth(),today.getDate() + 7).getTime())){
                var day = '<div class="col s12 m6">'+
                    '<ul class="collection with-header z-depth-5">'+
                        '<li class="collection-header"><h4><i class="material-icons">date_range</i> ' + date + '</h4></li>';
                        groupedEvents[date].forEach(event => {
                            const ds = new Date(parseInt(event.start));
                            const de = new Date(parseInt(event.end));  
                            day += '<li class="collection-item">'+
                            '<span class="">'+
                            '<i class="tiny material-icons">access_time</i> '+
                            '</span>'+
                            ds.getHours().toString().padStart(2, '0')+":"+ds.getMinutes().toString().padStart(2, '0')+
                            "-"+
                            de.getHours().toString().padStart(2, '0')+":"+de.getMinutes().toString().padStart(2, '0')+
                            '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+
                            event.title.replace(/\(.*?\)/g, '')+
                            (event.title.indexOf("особ") >= 0?'<span class="secondary-content"><i class="material-icons">grade</i></span>':"")+
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
});