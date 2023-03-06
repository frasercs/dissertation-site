document.addEventListener('DOMContentLoaded', function () {
    const loader = document.querySelector('#loading');
    const btn = document.getElementById('diagnosis-btn');
    const select = document.getElementById('animal-select');
    const checkbox = document.getElementById('prior-checkbox');
    const diagnoseUrl = 'https://frasercs.pythonanywhere.com/api/diagnose/';
    const animalListUrl = 'https://frasercs.pythonanywhere.com/api/data/valid_animals'
    const diseasesUrl = 'https://frasercs.pythonanywhere.com/api/data/animal_details/'
    const signsAndCodesUrl = 'https://frasercs.pythonanywhere.com/api/data/signs_and_codes/'
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
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
            displayLoading();
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
                 ;
            setTimeout(() => {
                hideLoading();
                populatePageSigns(signs, texts);
                populatePagePriors(priors)
            }, 4000);
        }

        function checkboxHandler(event){
            
            var priors = document.getElementById('priors');
            if(checkbox.checked){
                priors.setAttribute('class', 'd-block')
            }
            else{
                priors.setAttribute('class', 'd-none')
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
        
        function addSign(sign, signText, first){
            var table = document.getElementById('signs-table');
            var tbody = document.getElementById('signs-body');
            
            if (first){
                //create the table head and append it to the table
                var thead = document.createElement('thead');
                thead.setAttribute('id', 'signs-head');
                var row = document.createElement('tr');
                var th1 = document.createElement('th');
                th1.setAttribute('scope', 'col');
                var th2 = document.createElement('th');
                th2.setAttribute('scope', 'col');
                var th3 = document.createElement('th');
                th3.setAttribute('scope', 'col');
                var th4 = document.createElement('th');
                th4.setAttribute('scope', 'col');
                var text1 = document.createTextNode('Sign');
                var text2 = document.createTextNode('Present');
                var text3 = document.createTextNode('Not Observed');
                var text4 = document.createTextNode('Not Present');
                th1.appendChild(text1);
                th2.appendChild(text2);
                th3.appendChild(text3);
                th4.appendChild(text4);
                row.appendChild(th1);
                row.appendChild(th2);
                row.appendChild(th3);
                row.appendChild(th4);
                thead.appendChild(row);
                table.appendChild(thead);
                
                var tbody = document.createElement('tbody');
                tbody.setAttribute('id', 'signs-body');
                table.appendChild(tbody);
            }
            var row = document.createElement('tr');
            //set the row id to sign
            row.setAttribute('id', sign);
            var th = document.createElement('th');
            //create the text node for the th column with signText
            var text = document.createTextNode(signText);
            //append the text node to the th column
            th.appendChild(text);
            //append image to the th column <i class="bi bi-question-circle"></i>
            var icon = document.createElement('i');
            icon.setAttribute('class', 'bi bi-question-circle mx-2');
            icon.setAttribute('data-bs-toggle', 'tooltip');
            icon.setAttribute('data-bs-placement', 'top');
            icon.setAttribute('title', 'Tooltip on top');
            th.appendChild(icon);
            //append the th column to the row
            row.appendChild(th);
            //append the row to the tbody
            tbody.appendChild(row);
            //create the 3 td columns
            var td1 = document.createElement('td');
            var td2 = document.createElement('td');
            var td3 = document.createElement('td');
            //create the 3 radio buttons
            var radio1 = document.createElement('input');
            var radio2 = document.createElement('input');
            var radio3 = document.createElement('input');
            //set the type of the radio buttons to radio
            radio1.setAttribute('type', 'radio');
            radio2.setAttribute('type', 'radio');
            radio3.setAttribute('type', 'radio');
            //set the name of the radio buttons to sign
            radio1.setAttribute('name', sign);
            radio2.setAttribute('name', sign);
            radio3.setAttribute('name', sign);
            //set the value of the radio buttons to 1, 0, -1
            radio1.setAttribute('value', 1);
            radio2.setAttribute('value', 0);
            radio2.setAttribute('checked', true);
            radio3.setAttribute('value', -1);
            //append the radio buttons to the td columns
            td1.appendChild(radio1);
            td2.appendChild(radio2);
            td3.appendChild(radio3);
            //append the td columns to the row
            row.appendChild(td1);
            row.appendChild(td2);
            row.appendChild(td3);
        }


        function populatePageSigns(signs, signTexts, first)
        {
            var table = document.getElementById('signs-table');
            while (table.firstChild) {
                table.removeChild(table.firstChild);
            }
            
            for (var i = 0; i < signs.length; i++) {
                if(i == 0){
                    addSign(signs[i], signTexts[signs[i]][0], true);
                }
                else{
                    var signCode = signs[i];
                    addSign(signCode, signTexts[signCode][0], false);
                }
            }
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
        
        
        function populatePagePriors(priors)
        {
            last = false;
            var div = document.getElementById('priors');
            
            while (div.firstChild) {
                div.removeChild(div.firstChild);
            }
            
            for (var i = 0; i < priors.length; i++) {
                if(i == priors.length - 1){
                    last = true;
                }
                addPrior(priors[i], priors.length, last);
            }
            div.setAttribute('class', 'd-none')
        }

        function getData() {
            var signs = document.getElementById('signs-body').children;
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
                var signvalue = parseInt(signs[i].querySelector('input:checked').value);
                data.signs[sign] = signvalue;
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
                var resultContainer = document.createElement('div');
                resultContainer.setAttribute('class', 'd-flex center-items');
                resultContainer.setAttribute('id', items[i][0]);
                div.appendChild(resultContainer);

                var item = items[i];
                item[1] = Math.round(item[1])+ '%';
                if(item[1] == '100%'){
                    break;
                }
                var p = document.createElement('p');
                
                var text = document.createTextNode(item[0] + ': ' + item[1]);
                p.appendChild(text);
                resultContainer.appendChild(p);
                var icon = document.createElement('i');
                icon.setAttribute('class', 'bi bi-question-circle mx-2 ');
                icon.setAttribute('data-bs-toggle', 'tooltip');
                icon.setAttribute('data-bs-placement', 'top');
                if(item[0] == 'ZZ_Other'){
                    icon.setAttribute('title', 'This indicates the disease may be one of the diseases not included in the model.');
                    icon.setAttribute('data-bs-content', 'This indicates the disease may be one of the diseases not included in the model.');
                }
                else{
                    icon.setAttribute('title', 'Tooltip on top');
                    icon.setAttribute('data-bs-content', 'Tooltip on top');
                }
                icon.setAttribute('data-bs-html', 'true');
                icon.setAttribute('data-bs-trigger', 'hover');
                resultContainer.appendChild(icon);
                
            }
        }
}
});