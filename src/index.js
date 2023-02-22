document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('diagnosis-btn');
    var select = document.getElementById('animal-select');
    var diagnoseUrl = 'https://frasercs.pythonanywhere.com/api/diagnose/';
    var animalListUrl = 'https://frasercs.pythonanywhere.com/api/data/valid_animals'
    var signsUrl = 'https://frasercs.pythonanywhere.com/api/signs/'
    var diagnosis = null;
    if(btn && select){
        btn.addEventListener('click', function () {
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
                .then(function (json) { displayResults(json) })["catch"](function (error) { return console.error(error); });
        });
        select.addEventListener('change', function () {
            var animal = select.value;
            fetch(signsUrl + animal)
                .then(function (response) { return response.json(); })
                .then(function (json) { populatePage(json) })["catch"](function (error) { return console.error(error); });
        });


        function getAnimalList() {
            fetch(animalListUrl)
                .then(function (response) { return response.json(); })
                .then(function (json) {
                    populateSelect(json);
                })["catch"](function (error) { return console.error(error); });
        }
        getAnimalList();
        
        
        function addOption(text, value) {
            var option = document.createElement('OPTION');
            option.setAttribute('value', value);
            var text = document.createTextNode(text);
            option.appendChild(text);
            select.appendChild(option);
        }
        addOption('Select an animal', 'select');
        
        function populateSelect(animals) {
            for (var i = 0; i < animals.length; i++) {
                addOption(animals[i], animals[i]);
            }
        }
        
        function addSign(sign){
            var div = document.createElement('div');
            div.setAttribute('class', sign);

            var signText = document.createTextNode(sign + ': ');
            div.appendChild(signText);

            var present = document.createElement("INPUT")
            var presentText = document.createTextNode('Present');
            present.setAttribute('type', 'radio');
            present.setAttribute('name', sign);
            present.setAttribute('value', 1);
            present.setAttribute('checked', 'checked');
            
            var notObserved = document.createElement("INPUT")
            var notObservedText = document.createTextNode('Not Observed');
            notObserved.setAttribute('type', 'radio');
            notObserved.setAttribute('name', sign);
            notObserved.setAttribute('value', 0);

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
        
        function populatePage(signs)
        {
            var div = document.getElementById('signs');
            while (div.firstChild) {
                div.removeChild(div.firstChild);
            }
            
            for (var i = 0; i < signs.length; i++) {
                addSign(signs[i]);
            }

        }
        function getData() {
            var signs = document.getElementById('signs').children;
            var data = {
                animal: select.value,
                signs: {
                    
                }
            }
            for (var i = 0; i < signs.length; i++) {
                var sign = signs[i].className;
                var value = signs[i].querySelector('input:checked').value;
                var number = parseInt(value);
                data.signs[sign] = number;
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