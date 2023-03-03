
document.addEventListener('DOMContentLoaded', function () {
    const loader = document.querySelector('#loading');
    const btn = document.getElementById('diagnosis-btn');
    const select = document.getElementById('animal-select');
    const diagnoseUrl = 'https://frasercs.pythonanywhere.com/api/diagnose/';
    const animalListUrl = 'https://frasercs.pythonanywhere.com/api/data/valid_animals'
    const signsUrl = 'https://frasercs.pythonanywhere.com/api/signs/'
    const diseasesUrl = 'https://frasercs.pythonanywhere.com/api/data/'
    let diagnosis = null;
    if(btn && select){

        btn.addEventListener('click', diagnoseHandler);
        select.addEventListener('change', animalHandler);
        getAnimalList();

        function diagnoseHandler(event){
            displayLoading();
            data = getData();
            console.log(JSON.stringify(data));
            fetch(diagnoseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                mode: "cors",
                body: JSON.stringify(data)
            })
                .then(function (response) { return response.json(); })
                .then(function (json) { 
                    hideLoading()
                    displayResults(json)
                    console.log("pls") })["catch"](function (error) { return console.error(error); });
            }


        function animalHandler(event){
            var animal = select.value;
            fetch(diseasesUrl + animal)
                .then(function (response) { return response.json(); })
                .then(function (json) { 
                    populatePageSigns(json.signs)
                    populatePageDiseases(json.diseases)
                 })["catch"](function (error) { return console.error(error); });
        }


        function displayLoading(){
            loader.classList.add("display");
            setTimeout(() => {
                loader.classList.remove("display");
                }, 60000);
        }

        function hideLoading(){
            loader.classList.remove("display");
        }


        function getAnimalList() {
            fetch(animalListUrl)
                .then(function (response) { return response.json(); })
                .then(function (json) {
                    populateSelect(json);
                })["catch"](function (error) { return console.error(error); });
        }
        
        function addOption(text, value) {
            var option = document.createElement('OPTION');
            option.setAttribute('value', value);
            var text = document.createTextNode(text);
            option.appendChild(text);
            select.appendChild(option);
        }
        
        function populateSelect(animals) {
            for (var i = 0; i < animals.length; i++) {
                addOption(animals[i], animals[i]);
            }
        }
        
        function addSign(sign){
            var div = document.createElement('div');
            div.setAttribute('id', sign);
            div.setAttribute('class', "flex-container");

            var signText = document.createTextNode(sign + ': ');
            div.appendChild(signText);

            var present = document.createElement("INPUT")
            var presentText = document.createTextNode('Present');
            present.setAttribute('type', 'radio');
            present.setAttribute('name', sign);
            present.setAttribute('value', 1);
            
            
            var notObserved = document.createElement("INPUT")
            var notObservedText = document.createTextNode('Not Observed');
            notObserved.setAttribute('type', 'radio');
            notObserved.setAttribute('name', sign);
            notObserved.setAttribute('value', 0);
            notObserved.setAttribute('checked', 'checked');

            var notPresent = document.createElement("INPUT")
            var notPresentText = document.createTextNode('Not Present');
            notPresent.setAttribute('type', 'radio');
            notPresent.setAttribute('name', sign);
            notPresent.setAttribute('value', -1);

            div.appendChild(present);
            div.appendChild(presentText);
            div.appendChild(notObserved);
            div.appendChild(notObservedText);
            div.appendChild(notPresent);
            div.appendChild(notPresentText);
            document.getElementById('signs').appendChild(div);
        }


        function addPrior(prior){
            var div = document.createElement('div');
            div.setAttribute('id', prior);

            var priorText = document.createTextNode(prior + ': ');
            div.appendChild(priorText);

            var value = document.createElement("INPUT")
            value.setAttribute('type', 'number');
            value.setAttribute('name', prior);
            value.setAttribute('value', 0);
            value.setAttribute('min', 0);
            value.setAttribute('max', 100);
            value.setAttribute('step', 1);
            div.appendChild(value);
            document.getElementById("priors").appendChild(div);
        }
        
        function populatePageSigns(signs)
        {
            var div = document.getElementById('signs');
            while (div.firstChild) {
                div.removeChild(div.firstChild);
            }
            
            for (var i = 0; i < signs.length; i++) {
                addSign(signs[i]);
            }
        }
        function populatePageDiseases(priors)
        {
            var div = document.getElementById('priors');
            while (div.firstChild) {
                div.removeChild(div.firstChild);
            }

            
            for (var i = 0; i < priors.length; i++) {
                addPrior(priors[i]);
            }
        }

        function getData() {
            var signs = document.getElementById('signs').children;
            var priors = document.getElementById('priors').children;
            var data = {
                animal: select.value,
                signs: {
                    
                },
                priors: {

                }
            }
            for (var i = 0; i < signs.length; i++) {
                var sign = signs[i].id;
                var value = signs[i].querySelector('input:checked').value;
                var number = parseInt(value);
                data.signs[sign] = number;
            }
            var total = 0;
            for (var i = 0; i < priors.length; i++) {
                var prior = priors[i].id;
                var priorvalue = parseInt(priors[i].querySelector('input').value);
                total += priorvalue;             
                data.priors[prior] = priorvalue;
            }
            console.log("total: " + total + " " + typeof(total));
            if(total != 100){
                alert('Priors must add up to 100%');
                return;
            
            }
            return data;
        }


        function displayResults(data) {

            var results = data.results

            var items = Object.keys(results).map(function(key) {
                return [key, results[key]];
            });
            
            // Sort the array based on the second element
            items.sort(function(first, second) {
            return second[1] - first[1];
            });
            
            // Create a new array with only the first 5 items
            console.log(items.slice(0, 5));
            var div = document.getElementById('results');
            while (div.firstChild) {
                div.removeChild(div.firstChild);
            }
            div.appendChild(document.createTextNode('Top results:'));
            for(var i = 0; i < items.slice(0,5).length; i++){
                var item = items[i];
                item[1] = Math.round(item[1])+ '%';
                var p = document.createElement('p');
                var text = document.createTextNode(item[0] + ': ' + item[1]);
                p.appendChild(text);
                div.appendChild(p);
                if( item[1] == '100%'){
                    break;
                }
            }
        }

    }
});