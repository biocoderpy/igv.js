import { StringUtils, DOMUtils, Icon, makeDraggable } from '../../node_modules/igv-utils/src/index.js'
import { createRegionKey, parseRegionKey, deleteRegionWithKey } from './ROIManager.js'
import { appleCrayonRGB, appleCrayonRGBA } from '../util/colorPalletes.js'

const tableRowSelectionList = []

class ROITable {

    constructor(parent) {

        this.container = DOMUtils.div({ class: 'igv-roi-table' })
        parent.appendChild(this.container)

        const header = createHeaderDOM(this.container)

        this.upperButtonDOM = this.createUpperButtonDOM(this.container)

        this.columnTitleDOM = createColumnTitleDOM(this.container)

        this.footerDOM = this.createFooterDOM(this.container)

        makeDraggable(this.container, header)

        this.container.style.display = 'none'

    }

    present(x, y, userDefinedROISet) {

        const removable = this.container.querySelectorAll('.igv-roi-table-row')
        Array.from(removable).forEach(el => el.remove())

        // this.container.style.left = `${ x }px`
        // this.container.style.top  = `${ y }px`

        this.container.style.left = `${ 0 }px`
        this.container.style.top  = `${ 0 }px`

        if (userDefinedROISet.features && userDefinedROISet.features.length > 0) {

            for (let { chr, start, end } of userDefinedROISet.features.reverse()) {
                const row = this.createTableRowDOM(chr, start, end)
                this.columnTitleDOM.after(row)
            }

        }

        this.container.style.display = 'flex'
    }

    createUpperButtonDOM(container) {

        const dom = DOMUtils.div()
        container.appendChild(dom)

        // Remove Button
        const html = `<button id="igv-roi-table-remove-button">Remove</button>`
        const fragment = document.createRange().createContextualFragment(html)

        dom.appendChild(fragment.firstChild)

        const button = dom.querySelector('#igv-roi-table-remove-button')
        button.disabled = true

        button.addEventListener('click', event => {
            event.stopPropagation()

            const removable = container.querySelectorAll('.igv-roi-table-row-selected')

            for (let regionElement of Array.from(removable)) {
                deleteRegionWithKey(this.browser.roiManager.userDefinedROISet, regionElement.dataset.region, this.browser.columnContainer)
            }

        })

        return dom
    }

    createTableRowDOM(chr, start, end) {

        const dom = DOMUtils.div({ class: 'igv-roi-table-row' })
        dom.dataset.region = createRegionKey(chr, start, end)

        const strings = [ chr, StringUtils.numberFormatter(start), StringUtils.numberFormatter(end) ]
        for (let string of strings) {
            const el = DOMUtils.div()
            el.innerText = string
            dom.appendChild(el)
        }

        dom.addEventListener('click', event => {
            event.stopPropagation()
            dom.classList.toggle('igv-roi-table-row-selected')
            this.setButtonState(dom.classList.contains('igv-roi-table-row-selected'))
        })

        return dom
    }

    createFooterDOM(container) {

        const dom = DOMUtils.div()
        container.appendChild(dom)

        let fragment

        // View Button
        fragment = document.createRange().createContextualFragment(`<button id="igv-roi-table-view-button">View</button>`)
        dom.appendChild(fragment.firstChild)

        const regionViewButton = dom.querySelector('#igv-roi-table-view-button')
        regionViewButton.disabled = true

        regionViewButton.addEventListener('click', event => {

            event.stopPropagation()

            const selected = container.querySelectorAll('.igv-roi-table-row-selected')
            const loci = []
            for (let el of selected) {
                // console.log(`${el.dataset.region}`)
                const { locus } = parseRegionKey(el.dataset.region)
                loci.push(locus)
            }

            if (loci.length > 0) {
                this.browser.search(loci.join(' '))
            }

        })


        // Import Button
        fragment = document.createRange().createContextualFragment(`<button id="igv-roi-table-import-button">Import</button>`)
        dom.appendChild(fragment.firstChild)

        const regionImportButton = dom.querySelector('#igv-roi-table-import-button')
        regionImportButton.disabled = true

        regionImportButton.addEventListener('click', event => {

            event.stopPropagation()

        })

        // View Button
        fragment = document.createRange().createContextualFragment(`<button id="igv-roi-table-export-button">Export</button>`)
        dom.appendChild(fragment.firstChild)

        const regionExportButton = dom.querySelector('#igv-roi-table-export-button')
        regionExportButton.disabled = true

        regionExportButton.addEventListener('click', event => {

            event.stopPropagation()

        })

        return dom
    }

    setButtonState(isTableRowSelected) {

        isTableRowSelected ? tableRowSelectionList.push(1) : tableRowSelectionList.pop()

        const regionRemovalButton = this.upperButtonDOM.querySelector('#igv-roi-table-remove-button')
        const regionViewButton = this.footerDOM.querySelector('#igv-roi-table-view-button')
        const regionImportButton = this.footerDOM.querySelector('#igv-roi-table-import-button')
        const regionExportButton = this.footerDOM.querySelector('#igv-roi-table-export-button')

        regionImportButton.disabled =
            regionExportButton.disabled =
                regionRemovalButton.disabled =
                    regionViewButton.disabled = !(tableRowSelectionList.length > 0)

    }

}

function createColumnTitleDOM(container) {

    const dom = DOMUtils.div({ class: 'igv-roi-table-column-titles' })
    container.appendChild(dom)

    const columnTitles =
        [
            'Chr',
            'Start',
            'End'
        ]

    columnTitles.forEach(title => {
        const col = DOMUtils.div()
        col.innerText = title
        dom.appendChild(col)
    })

    return dom
}

function createHeaderDOM(container) {

    // header
    const header = DOMUtils.div()
    container.appendChild(header)

    // title
    const title = DOMUtils.div()
    header.appendChild(title)
    title.innerText = 'Regions of Interest'

    // dismiss button
    const dismiss = DOMUtils.div()
    header.appendChild(dismiss)
    dismiss.appendChild(Icon.createIcon('times'))

    dismiss.addEventListener('click', event => {
        event.stopPropagation()
        event.preventDefault()
        container.style.display = 'none'
    })

    return header

}

export default ROITable
