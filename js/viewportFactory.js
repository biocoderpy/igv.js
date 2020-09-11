import IdeogramViewport from "./ideogramViewport.js";
import ViewPort from "./viewport.js";
import RulerViewport from "./rulerViewport.js";

const createViewport = (trackView, genomicStateList, index, width) => {

    if ('ruler' === trackView.track.type) {
        return new RulerViewport(trackView, trackView.$viewportContainer, genomicStateList[index], width);
    } else if ('ideogram' === trackView.track.type) {
        return new IdeogramViewport(trackView, trackView.$viewportContainer, genomicStateList[index], width);
    } else {
        return new ViewPort(trackView, trackView.$viewportContainer, genomicStateList[index], width);
    }

}

export { createViewport }
