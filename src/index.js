document.addEventListener('DOMContentLoaded', function () {
    const loader = document.querySelector('#loading');
    const btn = document.getElementById('diagnosis-btn');
    const select = document.getElementById('animal-select');
    const checkbox = document.getElementById('prior-checkbox');
    const diagnoseUrl = 'https://frasercs.pythonanywhere.com/api/diagnose/';
    const animalListUrl = 'https://frasercs.pythonanywhere.com/api/data/valid_animals'
    const dataUrl = 'https://frasercs.pythonanywhere.com/api/data/full_animal_data/'
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
            clearResults();
            var animal = select.value;
            var signs = null;
            var textAndCodes = null;
            var priors = null;
            
            fetch(dataUrl + animal)
                .then(function (response) { return response.json(); })
                .then(function (json) { 
                    signs = json.signs;
                    console.log(signs)
                    priors = json.diseases;
                    console.log(priors)
                    populatePageSigns(signs);
                    populatePagePriors(priors);
                    hideLoading();
                 })["catch"](function (error) { return console.error(error); });
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
        
        function createTableHead() {
            const thead = document.createElement('thead');
            thead.setAttribute('id', 'signs-head');
          
            const row = document.createElement('tr');
            const th1 = document.createElement('th');
            th1.setAttribute('scope', 'col');
            const th2 = document.createElement('th');
            th2.setAttribute('scope', 'col');
            const th3 = document.createElement('th');
            th3.setAttribute('scope', 'col');
            const th4 = document.createElement('th');
            th4.setAttribute('scope', 'col');
          
            th1.textContent = 'Sign';
            th2.textContent = 'Present';
            th3.textContent = 'Not Observed';
            th4.textContent = 'Not Present';
          
            row.appendChild(th1);
            row.appendChild(th2);
            row.appendChild(th3);
            row.appendChild(th4);
            thead.appendChild(row);
          
            return thead;
          }
          
          function createTableBody() {
            
            const tbody = document.createElement('tbody');
            tbody.setAttribute('id', 'signs-body');
            return tbody;
          }
          
          /*function createRadioButtonColumn(sign, value, checked = false) {
            const td = document.createElement('td');
            const radio = document.createElement('input');
            radio.setAttribute('type', 'radio');
            radio.setAttribute('name', sign);
            radio.setAttribute('value', value);
          
            if (checked) {
              radio.setAttribute('checked', '');
            }
          
            td.appendChild(radio);
          
            return td;
          }*/
          
          function addSign(sign, signText, signCode, first) {
            const table = document.getElementById('signs-table');
            
            if (first) {
                const thead = createTableHead();
                table.appendChild(thead);
                const tbody = createTableBody();
                table.appendChild(tbody);
            }
            
            const row = document.createElement('tr');
            row.setAttribute('id', sign);
            
            const th = document.createElement('th');
            const text = document.createTextNode(signText);
            th.appendChild(text);
            
            if (signCode.includes(',')) {
              const link = createWikiDataLink(signCode.split(',')[0]);
              th.appendChild(link);
            } else if (signCode.includes('-')) {
              const img = createInfoIcon('No WikiData page exists for this sign');
              th.appendChild(img);
            } else {
              const link = createWikiDataLink(signCode);
              th.appendChild(link);
            }
            row.appendChild(th);
          
            const values = [1, 0, -1];
            for (const val of values) {
              const td = document.createElement('td');
              const radio = createRadioButton(sign, val);
              td.appendChild(radio);
              row.appendChild(td);
            }
          
            const tbody = document.getElementById('signs-body');
            tbody.appendChild(row);
          }
          
          function createWikiDataLink(code) {
            const link = document.createElement('a');
            const img = createInfoIcon('Click to view WikiData page for this sign');
            link.setAttribute('href', `https://www.wikidata.org/wiki/${code}`);
            link.setAttribute('target', '_blank');
            link.setAttribute('title', 'Click to view WikiData page for this sign');
            link.setAttribute('data-bs-content', 'Click to view WikiData page for this sign');
            link.appendChild(img);
            return link;
          }
          
          function createInfoIcon(title) {
            const img = document.createElement('i');
            img.setAttribute('class', 'bi bi-question-circle mx-2');
            img.setAttribute('width', '20');
            img.setAttribute('height', '20');
            img.setAttribute('title', title);
            img.setAttribute('data-bs-content', title);
            return img;
          }
          
          function createRadioButton(sign, value) {
            const radio = document.createElement('input');
            radio.setAttribute('type', 'radio');
            radio.setAttribute('name', sign);
            radio.setAttribute('value', value);
            if (value === 0) {
              radio.setAttribute('checked', true);
            }
            return radio;
          }


        function populatePageSigns(signs) {
        const table = document.getElementById('signs-table');
        while (table.firstChild) {
            table.removeChild(table.firstChild);
        }
        let i = 0;
        for (const [key, value] of Object.entries(signs)) {
            const sign = key;
            const signText = value.name;
            const signCode = value.code;
            const isFirstSign = i === 0;
            addSign(sign, signText, signCode, isFirstSign);
            i++;
        }
        }



        function addPrior(prior, length, last) {
            const div = document.createElement('div');
            div.id = prior;
          
            const priorText = document.createTextNode(`${prior}: `);
            div.appendChild(priorText);
          
            const value = document.createElement('input');
            value.type = 'number';
            value.name = prior;
            value.value = last ? Math.floor(100 / length) + 100 % length : parseInt(Math.floor(100 / length));
            value.min = 0;
            value.max = 100;
            value.step = 0.1;
            div.appendChild(value);
          
            document.getElementById('priors').appendChild(div);
          }
        
        
        function populatePagePriors(priors) {
            const div = document.getElementById('priors');
            div.innerHTML = '';
            let last = false;

            let priorList = Object.keys(priors);
            priorList.push('ZZ_Other')

          
            priorList.forEach((prior, index) => {
              if (index === priorList.length - 1) {
                last = true;
              }
              addPrior(prior, priorList.length, last);
            });
          
            div.classList.add('d-none');
          }

        function getData() {
            const signs = document.getElementById('signs-body').children;
            const priors = document.getElementById('priors').children;

            if (select.value === 'Choose an animal') {
                alert('Please choose an animal');
                return;
            }

            const data = {
                animal: select.value,
                signs: {},
                priors: {}
            };

            for (const sign of signs) {
                const id = sign.id;
                const value = parseInt(sign.querySelector('input:checked').value);
                data.signs[id] = value;
            }

            let total = 0;

            if (checkbox.checked) {
                for (const prior of priors) {
                const id = prior.id;
                const value = parseFloat(prior.querySelector('input').value);
                total += value;
                data.priors[id] = value;
                }

                if (total !== 100) {
                alert('Priors must add up to 100%');
                return;
                }
            } else {
                delete data.priors;
            }

            return data;
            
            
        }


        function displayResults(data) {
            const { results, wiki_ids } = data;
            const items = Object.entries(results).sort((a, b) => b[1] - a[1]);
            const topItems = items.slice(0, 5);
          
            const div = document.getElementById('results');
            while (div.firstChild) {
              div.removeChild(div.firstChild);
            }
            
            div.appendChild(document.createTextNode('Top results:'));
          
            topItems.forEach(([key, value]) => {
              const resultContainer = document.createElement('div');
              resultContainer.classList.add('d-flex', 'center-items');
              resultContainer.id = key;
              div.appendChild(resultContainer);
          
              const code = wiki_ids[key];
              const roundedValue = Math.round(value) + '%';
          
              if (roundedValue === '100%') {
                return;
              }
          
              const p = document.createElement('p');
              const text = document.createTextNode(`${key}: ${roundedValue}`);
              p.appendChild(text);
              resultContainer.appendChild(p);
          
              const link = document.createElement('a');
              link.href = `https://www.wikidata.org/wiki/${code}`;
              link.target = '_blank';
          
              const img = document.createElement('i');
              img.classList.add('bi', 'bi-question-circle', 'mx-2');
              img.dataset.bsToggle = 'tooltip';
              img.dataset.bsHtml = 'true';
              img.dataset.bsTrigger = 'hover';
          
              if (key === 'ZZ_Other') {
                img.title = 'This indicates the disease may be one of the diseases not included in the model.';
                img.dataset.bsContent = 'This indicates the disease may be one of the diseases not included in the model.';
                resultContainer.appendChild(img);
              } else if (code !== 'N/A') {
                link.title = 'Click to view WikiData page for this disease';
                link.dataset.bsContent = 'Click to view WikiData page for this disease';
                link.appendChild(img);
                resultContainer.appendChild(link);
              } else {
                img.title = 'No WikiData page exists for this disease';
                img.dataset.bsContent = 'No WikiData page exists for this disease';
                resultContainer.appendChild(img);
              }
            });
          }

        function clearResults(){
            var div = document.getElementById('results');
            while (div.firstChild) {
                div.removeChild(div.firstChild);
            }
        }
}
});