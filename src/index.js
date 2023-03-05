
document.addEventListener('DOMContentLoaded', function () {
    const loader = document.querySelector('#loading');
    const btn = document.getElementById('diagnosis-btn');
    const select = document.getElementById('animal-select');
    const checkbox = document.getElementById('prior-checkbox');
    const diagnoseUrl = 'https://frasercs.pythonanywhere.com/api/diagnose/';
    const animalListUrl = 'https://frasercs.pythonanywhere.com/api/data/valid_animals'
    const diseasesUrl = 'https://frasercs.pythonanywhere.com/api/data/animal_details/'
    const signsAndCodesUrl = 'https://frasercs.pythonanywhere.com/api/data/signs_and_codes/'
    let diagnosis = null;
    if(btn && select && checkbox){

        btn.addEventListener('click', diagnoseHandler);
        select.addEventListener('change', animalHandler);
        checkbox.addEventListener('change', checkboxHandler);

        getAnimalList();

        function diagnoseHandler(event){
            displayLoading();
            data = getData(); 
            if (data == null){
                hideLoading();
                return;
            }
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
                    })["catch"](function (error) { return console.error(error); });
            }


        function animalHandler(event){
            var animal = select.value;
            var signs = null;
            var texts = null;
            var priors = null;
            
            fetch(diseasesUrl + animal)
                .then(function (response) { return response.json(); })
                .then(function (json) { 
                    signs= json.signs;
                    priors = json.diseases;
                 })["catch"](function (error) { return console.error(error); });
            fetch(signsAndCodesUrl + animal)
                .then(function (response) { return response.json(); })
                .then(function (json) {
                    texts = json.full_names_and_codes;
                 })["catch"](function (error) { return console.error(error); });
            setTimeout(() => {
                populatePageSigns(signs, texts);
                populatePagePriors(priors)
            }, 1000);
        }

        function checkboxHandler(event){
            
            var priors = document.getElementById('priors');
            if(checkbox.checked){
                priors.hidden = false;
            }
            else{
                priors.hidden = true;
            }
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
        
        function addSign(sign, signText){
            var div = document.createElement('div');
            div.setAttribute('id', sign);
            //div.setAttribute('class', "flex-container");

            var signText = document.createTextNode(signText + ': ');
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


        function addPrior(prior, length, last){
            if (last){
                var val = Math.floor(100/length) + 100 % length;
            }
            else {
                var val = parseInt(Math.floor(100/length));
            }
            var div = document.createElement('div');
            div.setAttribute('id', prior);

            var priorText = document.createTextNode(prior + ': ');
            div.appendChild(priorText);

            var value = document.createElement("INPUT")
            value.setAttribute('type', 'number');
            value.setAttribute('name', prior);
            value.setAttribute('value', val);
            value.setAttribute('min', 0);
            value.setAttribute('max', 100);
            value.setAttribute('step', 0.1);
            div.appendChild(value);
            document.getElementById("priors").appendChild(div);
        }
        
        function populatePageSigns(signs, signTexts)
        {
            var div = document.getElementById('signs');
            while (div.firstChild) {
                div.removeChild(div.firstChild);
            }
            div.appendChild(document.createTextNode('Signs:'));
            
            for (var i = 0; i < signs.length; i++) {
                var signCode = signs[i];
                addSign(signCode, signTexts[signCode][0]);
            }
        }
        function populatePagePriors(priors)
        {
            last = false;
            var div = document.getElementById('priors');
            while (div.firstChild) {
                div.removeChild(div.firstChild);
            }
            div.appendChild(document.createTextNode('Priors:'));
            
            for (var i = 0; i < priors.length; i++) {
                if(i == priors.length - 1){
                    last = true;
                }
                addPrior(priors[i], priors.length, last);
            }
        }

        function getData() {
            var signs = document.getElementById('signs').children;
            var priors = document.getElementById('priors').children;
            var dataNoPriors = {
                animal: select.value,
                signs: {

                }
            }
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
            
            var total = 0.00000000000;
            if(checkbox.checked){
                for (var i = 0; i < priors.length; i++) {
                    var prior = priors[i].id;
                    
                    var priorvalue = parseFloat(priors[i].querySelector('input').value);
                    total += priorvalue;             
                    data.priors[prior] = priorvalue;
                }
                if(total != 100){
                    alert('Priors must add up to 100%');
                    return;
                }
            }
            else{
                delete data.priors;
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