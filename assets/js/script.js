// variables
let city="";

let searchCities = $("#search-cities");
let searchBtn = $("#search-btn");
let currentCity = $("#current-city");
let temp = $("#temp");
let wind=$("#wind");
let humidity= $("#humidity");
let uvIndex= $("#uv-index");
let searchCity=[];

// checks existing entries
function find(c){
    for (var i=0; i<searchCity.length; i++){
        if(c.toUpperCase()===searchCity[i]){
            return -1;
        }
    }
    return 1;
}

// personal key
let APIKey="fc4c24a2291954f5352d73bc5feb0257";

// displays weather
function displayWeather(event){
    event.preventDefault();
    if(searchCities.val().trim()!==""){
        city=searchCities.val().trim();
        currentWeather(city);
    }
}

function currentWeather(city){

    const queryURL= "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&APPID=" + APIKey;
    $.ajax({
        url:queryURL,
        method:"GET",
    }).then(function(response){
        console.log(response);
        const weathericon= response.weather[0].icon;
        const iconurl="https://openweathermap.org/img/wn/"+weathericon +"@2x.png";
        const date=new Date(response.dt*1000).toLocaleDateString();
        $(currentCity).html(response.name +"("+date+")" + "<img src="+iconurl+">");
        const tempF = (response.main.temp - 273.15) * 1.80 + 32;
        $(temp).html((tempF).toFixed(2)+"&#8457");
        $(humidity).html(response.main.humidity+"%");
        const ws=response.wind.speed;
        const windsmph=(ws*2.237).toFixed(1);
        $(wind).html(windsmph+"MPH");
        UVIndex(response.coord.lon,response.coord.lat);
        forecast(response.id);
        if(response.cod==200){
            JSON.parse(localStorage.getItem("city-name"));
            console.log(searchCity);
            if (searchCity==null){
                searchCity=[];
                searchCity.push(city.toUpperCase()
                );
                localStorage.setItem("-city-name",JSON.stringify(searchCity));
                addToList(city);
            }
            else {
                if(find(city)>0){
                    searchCity.push(city.toUpperCase());
                    localStorage.setItem("city-name",JSON.stringify(searchCity));
                    addToList(city);
                }
            }
        }
    });
}
    
function UVIndex(ln,lt){
    
    const uvqURL="https://api.openweathermap.org/data/2.5/uvi?appid="+ APIKey+"&lat="+lt+"&lon="+ln;
    $.ajax({
            url:uvqURL,
            method:"GET"
            }).then(function(response){
                $(uvIndex).html(response.value);
            });
}
    
function forecast(cityid){
    const dayover= false;
    const queryforcastURL="https://api.openweathermap.org/data/2.5/forecast?id="+cityid+"&appid="+APIKey;
    $.ajax({
        url:queryforcastURL,
        method:"GET"
    }).then(function(response){
        
        for (i=0;i<5;i++){
            const date= new Date((response.list[((i+1)*8)-1].dt)*1000).toLocaleDateString();
            const iconcode= response.list[((i+1)*8)-1].weather[0].icon;
            const iconurl="https://openweathermap.org/img/wn/"+iconcode+".png";
            const tempK= response.list[((i+1)*8)-1].main.temp;
            const tempF=(((tempK-273.5)*1.80)+32).toFixed(2);
            const humidity= response.list[((i+1)*8)-1].main.humidity;
        
            $("#Date"+i).html(date);
            $("#Img"+i).html("<img src="+iconurl+">");
            $("#iTemp"+i).html(tempF+"&#8457");
            $("#iHumidity"+i).html(humidity+"%");
        }
    });
}

function addToList(c){
    const listEl= $("<li>"+c.toUpperCase()+"</li>");
    $(listEl).attr("class","list-group-item");
    $(listEl).attr("data-value",c.toUpperCase());
    $(".list-group").append(listEl);
}

function invokePastSearch(event){
    const liEl=event.target;
    if (event.target.matches("li")){
        city=liEl.textContent.trim();
        currentWeather(city);
    }
}

function loadLastCity(){
    $("ul").empty();
    const searchCity = JSON.parse(localStorage.getItem("city-name"));
    if(searchCity!==null){
        searchCity=JSON.parse(localStorage.getItem("city-name"));
        for(i=0; i<searchCity.length;i++){
            addToList(searchCity[i]);
        }
        city=searchCity[i-1];
        currentWeather(city);
    }
}

$("#search-btn").on("click",displayWeather);
$(document).on("click",invokePastSearch);
$(window).on("load",loadLastCity);
