document.addEventListener('DOMContentLoaded', function () {
    const loader = document.querySelector('#loading')
    const btn = document.getElementById('diagnosis-btn')
    const select = document.getElementById('animal-select')
    const checkbox = document.getElementById('prior-checkbox')
    const diagnoseUrl =
        'https://frasercs.pythonanywhere.com/diagnosis/diagnose/'
    const animalListUrl =
        'https://frasercs.pythonanywhere.com/data/valid_animals'
    const dataUrl = 'https://frasercs.pythonanywhere.com/data/full_animal_data/'
    const tooltipTriggerList = document.querySelectorAll(
        '[data-bs-toggle="tooltip"]',
    )
    const tooltipList = [...tooltipTriggerList].map(
        (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl),
    )
    if (btn && select && checkbox) {
        btn.addEventListener('click', diagnoseHandler)
        select.addEventListener('change', animalHandler)
        checkbox.addEventListener('change', checkboxHandler)

        getAnimalList()

        function diagnoseHandler(_event) {
            if (select.value === 'Choose an animal') {
                alert('Please choose an animal')
                return
            }
            displayLoading()
            data = getData()
            if (data == null) {
                hideLoading()
                return
            }
            fetch(diagnoseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                mode: 'cors',
                body: JSON.stringify(data),
            })
                .then(function (response) {
                    return response.json()
                })
                .then(function (json) {
                    hideLoading()
                    displayResults(json)
                    window.scrollTo(0, document.body.scrollHeight)
                })
                ['catch'](function (error) {
                    return console.error(error)
                })
        }

        function animalHandler(_event) {
            checkbox.checked = false
            if (select.value === 'Choose an animal') {
                clearResults()
                clearSigns()
                clearPriors()
                return
            }
            displayLoading()
            let animal = select.value
            let signs = null
            let priors = null

            fetch(dataUrl + animal)
                .then(function (response) {
                    return response.json()
                })
                .then(function (json) {
                    signs = json.signs
                    priors = json.diseases
                    priors['ZZ_Other'] = 'N/A'
                    populatePageSigns(signs)
                    populatePagePriors(priors)
                    hideLoading()
                })
                ['catch'](function (error) {
                    return console.error(error)
                })
        }
        function checkboxHandler(_event) {
            let priors = document.getElementById('priors-table')
            if (checkbox.checked) {
                priors.setAttribute('class', 'd-block')
            } else {
                priors.setAttribute('class', 'd-none')
            }
        }

        function displayLoading() {
            loader.classList.add('display')
            setTimeout(() => {
                loader.classList.remove('display')
            }, 60000)
        }

        function hideLoading() {
            loader.classList.remove('display')
        }

        function getAnimalList() {
            fetch(animalListUrl)
                .then(function (response) {
                    return response.json()
                })
                .then(function (json) {
                    populateSelect(json)
                })
                ['catch'](function (error) {
                    return console.error(error)
                })
        }

        function addOption(text, value) {
            let option = document.createElement('OPTION')
            option.setAttribute('value', value)
            option.appendChild(document.createTextNode(text))
            select.appendChild(option)
        }

        function populateSelect(animals) {
            for (let i = 0; i < animals.length; i++) {
                addOption(animals[i], animals[i])
            }
        }

        function createTableHead() {
            const thead = document.createElement('thead')
            thead.setAttribute('id', 'signs-head')

            const row = document.createElement('tr')
            const th1 = document.createElement('th')
            th1.setAttribute('scope', 'col')
            const th2 = document.createElement('th')
            th2.setAttribute('scope', 'col')
            const th3 = document.createElement('th')
            th3.setAttribute('scope', 'col')
            const th4 = document.createElement('th')
            th4.setAttribute('scope', 'col')

            th1.textContent = 'Sign'
            th2.textContent = 'Present'
            th3.textContent = 'Not Observed'
            th4.textContent = 'Not Present'

            row.appendChild(th1)
            row.appendChild(th2)
            row.appendChild(th3)
            row.appendChild(th4)
            thead.appendChild(row)

            return thead
        }

        function createTableBody() {
            const tbody = document.createElement('tbody')
            tbody.setAttribute('id', 'signs-body')
            return tbody
        }

        function addSign(sign, signText, signCode, first) {
            const table = document.getElementById('signs-table')

            if (first) {
                const thead = createTableHead()
                table.appendChild(thead)
                const tbody = createTableBody()
                table.appendChild(tbody)
            }

            const row = document.createElement('tr')
            row.setAttribute('id', sign)

            const th = document.createElement('th')
            th.appendChild(document.createTextNode(signText))

            if (signCode.includes(',')) {
                const link = createWikiDataLink(signCode.split(',')[0])
                th.appendChild(link)
            } else if (signCode.includes('-')) {
                const img = createInfoIcon(
                    'No WikiData page exists for this sign',
                )
                th.appendChild(img)
            } else {
                const link = createWikiDataLink(signCode)
                th.appendChild(link)
            }
            row.appendChild(th)

            const values = [1, 0, -1]
            for (const val of values) {
                const td = document.createElement('td')
                const radio = createRadioButton(sign, val)
                td.appendChild(radio)
                row.appendChild(td)
            }

            const tbody = document.getElementById('signs-body')
            tbody.appendChild(row)
        }

        function createWikiDataLink(code) {
            const link = document.createElement('a')
            const img = createInfoIcon(
                'Click to view WikiData page for this sign',
            )
            link.setAttribute('href', `https://www.wikidata.org/wiki/${code}`)
            link.setAttribute('target', '_blank')
            link.setAttribute(
                'title',
                'Click to view WikiData page for this sign',
            )
            link.setAttribute(
                'data-bs-content',
                'Click to view WikiData page for this sign',
            )
            link.appendChild(img)
            return link
        }

        function createInfoIcon(title) {
            const img = document.createElement('i')
            img.setAttribute('class', 'bi bi-question-circle mx-2')
            img.setAttribute('width', '20')
            img.setAttribute('height', '20')
            img.setAttribute('title', title)
            img.setAttribute('data-bs-content', title)
            return img
        }

        function createRadioButton(sign, value) {
            const radio = document.createElement('input')
            radio.setAttribute('type', 'radio')
            radio.setAttribute('name', sign)
            radio.setAttribute('value', value)
            if (value === 0) {
                radio.setAttribute('checked', true)
            }

            return radio
        }

        function populatePageSigns(signs) {
            clearSigns()

            let i = 0
            for (const [key, value] of Object.entries(signs)) {
                const sign = key
                const signText = value.name
                const signCode = value.code
                const isFirstSign = i === 0
                addSign(sign, signText, signCode, isFirstSign)
                i++
            }
        }

        function createPriorsTableHead() {
            const thead = document.createElement('thead')
            thead.setAttribute('id', 'priors-head')

            const row = document.createElement('tr')
            const th1 = document.createElement('th')
            th1.setAttribute('scope', 'col')
            const th2 = document.createElement('th')
            th2.setAttribute('scope', 'col')

            th1.textContent = 'Disease'
            th2.textContent = 'Prior Value'

            row.appendChild(th1)
            row.appendChild(th2)
            thead.appendChild(row)

            return thead
        }

        function createPriorsTableBody() {
            const tbody = document.createElement('tbody')
            tbody.setAttribute('id', 'priors-body')
            return tbody
        }

        function addPrior(prior, length, first, last) {
            const table = document.getElementById('priors-table')

            if (first) {
                const thead = createPriorsTableHead()
                table.appendChild(thead)
                const tbody = createPriorsTableBody()
                table.appendChild(tbody)
            }

            const row = document.createElement('tr')
            row.setAttribute('id', prior)
            th = document.createElement('th')
            th.appendChild(document.createTextNode(`${prior}: `))
            row.appendChild(th)

            const td = document.createElement('td')
            const value = document.createElement('input')
            value.classList.add('my-2')
            value.type = 'number'
            value.name = prior
            value.value = last
                ? Math.floor(100 / length) + (100 % length)
                : parseInt(Math.floor(100 / length))
            value.min = 0
            value.max = 100
            value.step = 0.1
            td.appendChild(value)
            row.appendChild(td)

            const tbody = document.getElementById('priors-body')
            tbody.appendChild(row)
        }

        function populatePagePriors(priors) {
            clearPriors()

            let priorList = Object.keys(priors)

            priorList.forEach((prior, index) => {
                if (index === 0) {
                    addPrior(prior, priorList.length, true, false)
                } else if (index === priorList.length - 1) {
                    addPrior(prior, priorList.length, false, true)
                } else {
                    addPrior(prior, priorList.length, false, false)
                }
            })
            document.getElementById('priors-table').classList.add('d-none')
        }

        function getData() {
            const signs = document.getElementById('signs-body').children
            const priors = document.getElementById('priors-body').children

            const data = {
                animal: select.value,
                signs: {},
                priors: {},
            }

            for (const sign of signs) {
                const id = sign.id
                const value = parseInt(
                    sign.querySelector('input:checked').value,
                )
                data.signs[id] = value
            }

            let total = 0

            if (checkbox.checked) {
                for (const prior of priors) {
                    const id = prior.id
                    const value = parseFloat(prior.querySelector('input').value)
                    total += value
                    data.priors[id] = value
                }

                if (total !== 100) {
                    alert('Priors must add up to 100%')
                    return
                }
            } else {
                delete data.priors
            }

            return data
        }

        function displayResults(data) {
            let results = data.results
            let codes = data.wiki_ids

            let items = Object.keys(results).map(function (key) {
                return [key, results[key]]
            })

            // Sort the array based on the second element
            items.sort(function (first, second) {
                return second[1] - first[1]
            })

            // Create a new array with only the first 5 items
            let div = document.getElementById('results')
            clearResults()
            div.appendChild(document.createTextNode('Top results:'))
            for (let i = 0; i < items.slice(0, 5).length; i++) {
                let resultContainer = document.createElement('div')
                resultContainer.setAttribute('class', 'd-flex center-items')
                resultContainer.setAttribute('id', items[i][0])
                div.appendChild(resultContainer)

                let item = items[i]
                let code = codes[item[0]]
                item[1] = Math.round(item[1]) + '%'
                if (item[1] == '100%') {
                    break
                }
                let p = document.createElement('p')

                let result_text = document.createTextNode(
                    item[0] + ': ' + item[1],
                )
                p.appendChild(result_text)
                resultContainer.appendChild(p)
                let link = document.createElement('a')
                link.setAttribute(
                    'href',
                    'https://www.wikidata.org/wiki/' + code,
                )
                link.setAttribute('target', '_blank')
                let img = document.createElement('i')
                img.setAttribute('class', 'bi bi-question-circle mx-2')
                img.setAttribute('data-bs-toggle', 'tooltip')

                if (item[0] == 'ZZ_Other') {
                    img.setAttribute(
                        'title',
                        'This indicates the disease may be one of the diseases not included in the model.',
                    )
                    img.setAttribute(
                        'data-bs-content',
                        'This indicates the disease may be one of the diseases not included in the model.',
                    )
                    resultContainer.appendChild(img)
                } else if (codes[item[0]] != 'N/A') {
                    link.appendChild(img)
                    link.setAttribute(
                        'title',
                        'Click to view WikiData page for this disease',
                    )
                    link.setAttribute(
                        'data-bs-content',
                        'Click to view WikiData page for this disease',
                    )
                    resultContainer.appendChild(link)
                } else {
                    img.setAttribute(
                        'title',
                        'No WikiData page exists for this disease',
                    )
                    img.setAttribute(
                        'data-bs-content',
                        'No WikiData page exists for this disease',
                    )
                    resultContainer.appendChild(img)
                }
                img.setAttribute('data-bs-html', 'true')
                img.setAttribute('data-bs-trigger', 'hover')
            }
        }

        function clearResults() {
            let div = document.getElementById('results')
            while (div.firstChild) {
                div.removeChild(div.firstChild)
            }
        }
        function clearPriors() {
            const table = document.getElementById('priors-table')
            while (table.firstChild) {
                table.removeChild(table.firstChild)
            }
        }

        function clearSigns() {
            const table = document.getElementById('signs-table')
            while (table.firstChild) {
                table.removeChild(table.firstChild)
            }
        }
    }
})
