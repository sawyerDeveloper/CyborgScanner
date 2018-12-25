import jsfeat from 'jsfeat'

jsfeat.haar.frontalface = require('./lib/data/frontalface').frontalface

class CyborgScanner {

    constructor(video, x, y, _width, _height) {

        this.options = {
            min_scale: 1,
            scale_factor: 1.13,
            edges_density: 0.12,
        }

        let scale = Math.min(160 / _width, 160 / _height)

        let width = (_width * scale)
        let height = (_height * scale)
        this.x = Math.floor(x * scale)
        this.y = Math.floor(y * scale)
        this.video = video
        this.classifier = jsfeat.haar.frontalface
        this.workCanvas = document.createElement('canvas')
        this.workCanvas.width = width
        this.workCanvas.height = height
        this.workContext = this.workCanvas.getContext('2d')

        this.imgU8 = new jsfeat.matrix_t(width, height, jsfeat.U8_t | jsfeat.C1_t)
        this.edg = new jsfeat.matrix_t(width, height, jsfeat.U8_t | jsfeat.C1_t)
        this.iiSum = new Int32Array((width + 1) * (height + 1))
        this.iiSqsum = new Int32Array((width + 1) * (height + 1))
        this.iiTilted = new Int32Array((width + 1) * (height + 1))
        this.iiCanny = new Int32Array((width + 1) * (height + 1))

    }

    scanFrameForHumanFace = () => {

        this.workContext.drawImage(this.video, this.x, this.y, this.workCanvas.height, this.workCanvas.width)
        let imageData = this.workContext.getImageData(0, 0, this.workCanvas.width, this.workCanvas.height)
        jsfeat.imgproc.grayscale(imageData.data, this.workCanvas.width, this.workCanvas.height, this.imgU8)
        jsfeat.imgproc.compute_integral_image(this.imgU8, this.iiSum, this.iiSqsum, this.classifier.tilted ? this.iiTilted : null)
        jsfeat.haar.edges_density = this.options.edges_density
        let rects = jsfeat.haar.detect_multi_scale(this.iiSum, this.iiSqsum, this.iiTilted, this.options.use_canny ? this.iiCanny : null, this.imgU8.cols, this.imgU8.rows, this.classifier, this.options.scale_factor, this.options.min_scale)
        rects = jsfeat.haar.group_rectangles(rects, 1)
        console.log(rects)
    }

}

export default CyborgScanner
