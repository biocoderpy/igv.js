import {DOMUtils,StringUtils} from '../../node_modules/igv-utils/src/index.js'
import ROISet, {ROI_DEFAULT_COLOR, ROI_HEADER_DEFAULT_COLOR, screenCoordinates} from './ROISet.js'

class ROIManager {
    constructor(browser, roiMenu, roiTable, top, roiSets) {

        this.browser = browser
        this.roiMenu = roiMenu
        this.roiTable = roiTable
        this.top = top
        this.roiSets = roiSets || []

        const interativeROISetConfig =
            {
                name: `Interactive ROI Set`,
                features:
                [

                ],
                color: ROI_HEADER_DEFAULT_COLOR
            };

        this.interativeROISet = new ROISet(interativeROISetConfig, browser.genome)

        browser.on('locuschange',       () => this.renderAllROISets())
        // browser.on('trackremoved',      () => this.paint(browser, top, this.roiSets))
        // browser.on('trackorderchanged', () => this.paint(browser, top, this.roiSets))
    }

    async initialize() {

        const promises = this.roiSets.map(roiSet => {

            const config =
                {
                    browser: this.browser,
                    pixelTop: this.top,
                    roiSet
                };

            return this.renderROISet(config)

        })

        if (promises.length > 0) {
            await Promise.all(promises)
        }

    }

    updateInteractiveROISet(region) {

        this.interativeROISet.features.push(region)

        this.renderROISet({browser: this.browser, pixelTop: this.top, roiSet: this.interativeROISet})

    }

    async renderAllROISets() {

        const list = this.interativeROISet.features.length > 0 ? [ ...this.roiSets, this.interativeROISet ]  : this.roiSets

        for (let roiSet of list) {

            const config =
                {
                    browser: this.browser,
                    pixelTop: this.top,
                    roiSet
                };

            await this.renderROISet(config)

        }
    }

    async renderROISet({browser, pixelTop, roiSet}) {

        const columns = browser.columnContainer.querySelectorAll('.igv-column')

        for (let i = 0; i < columns.length; i++) {

            let { chr, start:startBP, end:endBP, bpPerPixel:bpp } = browser.referenceFrameList[ i ]

            const regions = await roiSet.getFeatures(chr, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER)

            if (regions && regions.length > 0) {

                for (let { chr:featureChr, start:featureStartBP, end:featureEndBP } of regions) {

                    featureStartBP = Math.floor(featureStartBP)
                    featureEndBP = Math.floor(featureEndBP)

                    const featureKey = `feature-key-${ featureStartBP }-${ featureEndBP }`
                    const selector = `[data-feature="${ featureKey }"]`

                    const el = columns[ i ].querySelector(selector)
                    const featureIsInDOM = null !== el

                    if (featureEndBP < startBP || featureStartBP > endBP || chr !== featureChr) {

                        if (featureIsInDOM) {
                            el.remove()
                        }

                    } else {

                        const { x:pixelX, width:pixelWidth } = screenCoordinates(Math.max(featureStartBP, startBP), Math.min(featureEndBP, endBP), startBP, bpp)

                        if (featureIsInDOM) {
                            el.style.left = `${pixelX}px`
                            el.style.width = `${pixelWidth}px`
                        } else {
                            const featureDOM = this.createRegionDOM(browser, browser.columnContainer, pixelTop, pixelX, pixelWidth, roiSet, featureKey)
                            columns[ i ].appendChild(featureDOM)
                        }

                    }

                }
            }

        }

    }

    createRegionDOM(browser, columnContainer, pixelTop, pixelX, pixelWidth, roiSet, featureKey) {

        // ROISet container
        const container = DOMUtils.div({class: 'igv-roi'})

        container.style.top = `${pixelTop}px`
        container.style.left = `${pixelX}px`

        container.style.width = `${pixelWidth}px`

        container.style.backgroundColor = ROI_DEFAULT_COLOR

        container.dataset.feature = featureKey

        // header
        const header = DOMUtils.div()
        header.style.backgroundColor = roiSet.color
        container.appendChild(header)

        if (false === roiSet.isImmutable) {

            header.addEventListener('click', event => {
                const {x, y} = DOMUtils.translateMouseCoordinates(event, columnContainer)
                this.roiMenu.present(x, y)
                console.log(`ROI Set "${ roiSet.name }" feature ${ featureKey }`)
            })

        }

        return container
    }

}

export default ROIManager
