import React, { Component } from 'react'
import CyborgScanner from './CyborgScanner'

const states = {
  SCANNING: 'scanning',
  FOUND: 'found',
  ERROR: 'error'
}

class App extends Component {

  constructor() {
    super()

    this.state = {
      currentState: states.SCANNING,
      errorName: ''
    }
  }

  componentDidMount() {
    navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: window.innerWidth <= 800 && window.innerHeight <= 600 ?  {
          exact: 'environment'
        } : 'environment',
        width: 1280,
        height: 720
      }
    })
      .then(this.handleSuccess)
      .catch(this.handleError)
  }

  handleError = (error) => {
    this.setState({
      errorName: error.name,
      currentState: states.ERROR
    })
  }

  handleSuccess = (stream) => {
    this.video.srcObject = stream
    this.video.oncanplay = this.cameraReady
  }

  cameraReady = () => {
    this.cyborgScanner = new CyborgScanner(this.video, 0, 0, window.innerWidth, window.innerHeight)
    this.lineY = 0
    // video stops buffering if display: none, force it to play
    this.video.play()
    requestAnimationFrame(this.renderFrame)
  }

  renderFrame = () => {
    this.cyborgScanner.scanFrameForHumanFace()
    // draw a scanning line
    this.layerCanvas.getContext('2d').clearRect(0, 0, window.innerWidth, window.innerHeight)
    this.layerCanvas.getContext('2d').beginPath()
    this.layerCanvas.getContext('2d').strokeStyle = 'blue'
    this.layerCanvas.getContext('2d').lineWidth = 4

    this.layerCanvas.getContext('2d').moveTo(0, this.lineY)
    this.layerCanvas.getContext('2d').lineTo(window.innerWidth, this.lineY)
    this.layerCanvas.getContext('2d').stroke()

    // scanning line goes down and then repeats once it hits the bottom
    if (this.lineY >= window.innerHeight) {
      this.lineY = 0
    }
    this.lineY += 6

    //clearing the canvas each frame
    this.canvas.getContext('2d').clearRect(0, 0, window.innerWidth, window.innerHeight)
    // aspectFix = ( 1280 / 720 - window.innerHeight / window.innerWidth ) * window.innerHeight = 0.3 * window.innerHeight
    const aspectFix = (0.3 * window.innerHeight)
    // Redrawing each frame of the video to the canvas while applying a fix the difference in aspect ratios
    this.canvas.getContext('2d').drawImage(this.video, 0, 0, window.innerWidth, window.innerHeight + aspectFix)
    requestAnimationFrame(this.renderFrame)
  }

  render() {
    const styles = {
      container: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        width: window.innerWidth,
        height: window.innerHeight
      },
      canvas: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
      },
      video: {
        display: 'none'
      }
    }

    if(this.state.errorName){
      return <div>{this.state.errorName}</div>
    }
    return (
      <div style={styles.container}>
        <video style={styles.video} playsInline autoPlay ref={(video) => this.video = video} />
        <canvas width={styles.container.width} height={styles.container.height} style={styles.canvas} ref={canvas => this.canvas = canvas}></canvas>
        <canvas width={styles.container.width} height={styles.container.height} style={styles.canvas} ref={canvas => this.layerCanvas = canvas}></canvas>
      </div>
    )
  }
}

export default App