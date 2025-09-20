
// Global variables for libraries loaded via CDN
const fabric = window.fabric

import * as THREE from "three"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"

// Constants
const SAFE_ZONE = { left: 50, right: 50, top: 10, bottom: 10 }
const BLEED_MARGIN = 10
const DEBOUNCE_TIME = 300
const DEFAULT_CANVAS_WIDTH = 614
const DEFAULT_CANVAS_HEIGHT = 230
const ASPECT_RATIO = DEFAULT_CANVAS_WIDTH / DEFAULT_CANVAS_HEIGHT

class MugDesigner {
  constructor() {
    this.meshes = {}
    this.mug = null
    this.history = []
    this.redoHistory = [] // Added redo history
    this.lastCanvasState = null
    this.patternMovable = false
    this.versions = [] // Added version control
    this.currentVersion = 0
    this.analytics = {
      // Added analytics tracking
      colors: {},
      fonts: {},
      elementsCount: 0,
    }
    this.collaborators = new Map() // Added collaboration support
    this.currentMaterial = "glossy" // Added material tracking
    this.safeZoneVisible = true
    this.bleedVisible = true

    this.init()
    this.setupScene()
    this.setupLights()
    this.setupControls()
    this.setupFabric()
    this.setupEventListeners()
    this.setupUI()
    this.setupAdvancedFeatures() // Added advanced features setup
    this.loadMug()
    this.animate()
  }

  setupAdvancedFeatures() {
    this.setupAIFeatures()
    this.setupExportOptions()
    this.setupVersionControl()
    this.setupCollaboration()
    this.setupAnalytics()
    this.setupMaterialControls()
    this.setupPatternGenerator()
    this.setupAdvancedTextFeatures()
  }

  setupAIFeatures() {
    // AI Panel Toggle
    document.getElementById("aiToggle").addEventListener("click", () => {
      this.togglePanel("aiPanel", "aiToggle")
    })

    // Generate AI Image
    document.getElementById("generateAIImage").addEventListener("click", async () => {
      const prompt = document.getElementById("aiPrompt").value
      if (!prompt.trim()) {
        this.showModal("Please enter a description for the image.")
        return
      }

      this.showAIProcessing("Generating image from your description...")

      // Simulate AI image generation (replace with actual AI API)
      setTimeout(() => {
        this.hideAIProcessing()
        // For demo, use a placeholder image
        const aiImageUrl = `https://picsum.photos/400/300?random=${Date.now()}`
        this.addAIGeneratedImage(aiImageUrl)
        this.showModal("AI image generated successfully!")
      }, 3000)
    })

    // Smart Color Suggestions
    document.getElementById("suggestColors").addEventListener("click", () => {
      this.generateColorSuggestions()
    })

    // Font Recommendations
    document.getElementById("suggestFonts").addEventListener("click", () => {
      this.generateFontSuggestions()
    })
  }

  async processImageWithAI(file, options = {}) {
    const { removeBackground, vectorize } = options

    if (removeBackground) {
      this.showAIProcessing("Removing background...")
      // Simulate background removal (replace with actual AI API)
      await new Promise((resolve) => setTimeout(resolve, 2000))
    }

    if (vectorize) {
      this.showAIProcessing("Vectorizing image...")
      // Simulate vectorization (replace with actual AI API)
      await new Promise((resolve) => setTimeout(resolve, 2000))
    }

    this.hideAIProcessing()
    return file // Return processed file
  }

  addAIGeneratedImage(url) {
    fabric.Image.fromURL(
      url,
      (img) => {
        const scale = Math.min(0.3, (this.canvas.width - 40) / img.width, (this.canvas.height - 40) / img.height)

        img.set({
          left: this.canvas.width / 2,
          top: this.canvas.height / 2,
          originX: "center",
          originY: "center",
          scaleX: scale,
          scaleY: scale,
        })

        this.canvas.add(img)
        this.canvas.setActiveObject(img)
        this.checkBounds(img)
        img.setCoords()
        this.canvas.renderAll()
        this.saveHistory()
        this.updateLayersPanel()
        this.debouncedUpdate()
        this.updateAnalytics()
      },
      { crossOrigin: "Anonymous" },
    )
  }

  generateColorSuggestions() {
    // Analyze current design colors and suggest complementary ones
    const currentColors = this.extractColorsFromDesign()
    const suggestions = this.getComplementaryColors(currentColors)

    // Update color panel with suggestions
    this.highlightSuggestedColors(suggestions)
    this.showModal("Smart color suggestions highlighted in the color panel!")
  }

  generateFontSuggestions() {
    // Analyze current design and suggest appropriate fonts
    const currentFonts = this.extractFontsFromDesign()
    const suggestions = this.getComplementaryFonts(currentFonts)

    // Update font dropdown with suggestions
    this.highlightSuggestedFonts(suggestions)
    this.showModal("Font recommendations updated in the text panel!")
  }

  setupExportOptions() {
    document.getElementById("exportToggle").addEventListener("click", () => {
      document.getElementById("exportModal").style.display = "block"
    })

    document.getElementById("exportPNG").addEventListener("click", () => {
      this.exportHighResPNG()
    })

    document.getElementById("exportPDF").addEventListener("click", () => {
      this.exportPrintReadyPDF()
    })

    document.getElementById("exportJSON").addEventListener("click", () => {
      this.exportDesignJSON()
    })
  }

  exportHighResPNG() {
    this.hideExportElements()

    const dataURL = this.canvas.toDataURL({
      format: "png",
      multiplier: 12.5, // 300 DPI equivalent
      quality: 1,
    })

    this.showExportElements()

    const link = document.createElement("a")
    link.href = dataURL
    link.download = `mug_design_300dpi_${Date.now()}.png`
    link.click()

    document.getElementById("exportModal").style.display = "none"
    this.showModal("High-resolution PNG exported successfully!")
  }

  exportPrintReadyPDF() {
    this.hideExportElements()

    const { jsPDF } = window.jspdf
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: [210, 297], // A4
    })

    const dataURL = this.canvas.toDataURL({
      format: "png",
      multiplier: 8,
      quality: 1,
    })

    // Add design to PDF with proper dimensions for printing
    pdf.addImage(dataURL, "PNG", 10, 10, 190, 73)

    // Add print specifications
    pdf.setFontSize(10)
    pdf.text("Print Specifications:", 10, 100)
    pdf.text("• Resolution: 300 DPI", 10, 110)
    pdf.text("• Size: 614x230px (print area)", 10, 120)
    pdf.text("• Safe zone: 60px margins", 10, 130)
    pdf.text("• Bleed: 10px all sides", 10, 140)

    this.showExportElements()

    pdf.save(`mug_design_print_ready_${Date.now()}.pdf`)
    document.getElementById("exportModal").style.display = "none"
    this.showModal("Print-ready PDF exported successfully!")
  }

  exportDesignJSON() {
    const designData = {
      version: "1.0",
      timestamp: new Date().toISOString(),
      canvas: this.canvas.toJSON(["patternImage", "excludeFromLayers", "excludeFromExport"]),
      metadata: {
        dimensions: {
          width: this.canvas.width,
          height: this.canvas.height,
        },
        safeZone: SAFE_ZONE,
        bleedMargin: BLEED_MARGIN,
        material: this.currentMaterial,
      },
      analytics: this.analytics,
      versions: this.versions,
    }

    const blob = new Blob([JSON.stringify(designData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.download = `mug_design_data_${Date.now()}.json`
    link.click()

    URL.revokeObjectURL(url)
    document.getElementById("exportModal").style.display = "none"
    this.showModal("Design data exported successfully!")
  }

  hideExportElements() {
    this.canvas.getObjects().forEach((obj) => {
      if (obj.excludeFromExport) {
        obj.set({ visible: false })
      }
    })
    this.canvas.renderAll()
  }

  showExportElements() {
    this.canvas.getObjects().forEach((obj) => {
      if (obj.excludeFromExport) {
        obj.set({ visible: true })
      }
    })
    this.canvas.renderAll()
  }

  setupVersionControl() {
    document.getElementById("versionsBtn").addEventListener("click", () => {
      this.showVersionsModal()
    })
  }

  saveVersion(name = null) {
    const versionName = name || `Version ${this.versions.length + 1}`
    const versionData = {
      id: Date.now(),
      name: versionName,
      timestamp: new Date().toISOString(),
      canvas: JSON.stringify(this.canvas.toJSON()),
      thumbnail: this.canvas.toDataURL({ multiplier: 0.2 }),
    }

    this.versions.push(versionData)
    this.currentVersion = this.versions.length - 1
    this.updateAnalytics()
  }

  loadVersion(versionId) {
    const version = this.versions.find((v) => v.id === versionId)
    if (version) {
      this.canvas.loadFromJSON(version.canvas, () => {
        this.canvas.renderAll()
        this.updateLayersPanel()
        this.debouncedUpdate()
        this.currentVersion = this.versions.indexOf(version)
      })
    }
  }

  setupCollaboration() {
    document.getElementById("collaborateBtn").addEventListener("click", () => {
      this.showCollaborationModal()
    })

    // Simulate real-time collaboration
    this.simulateCollaboration()
  }

  simulateCollaboration() {
    // Simulate other users' cursors (for demo purposes)
    setInterval(() => {
      if (Math.random() > 0.7) {
        this.showCollaboratorCursor({
          id: "user123",
          name: "John Doe",
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          color: "#10b981",
        })
      }
    }, 5000)
  }

  showCollaboratorCursor(user) {
    const cursor = document.createElement("div")
    cursor.className = "collaboration-cursor"
    cursor.style.left = user.x + "px"
    cursor.style.top = user.y + "px"
    cursor.style.borderLeftColor = user.color

    const userLabel = document.createElement("div")
    userLabel.className = "collaboration-user"
    userLabel.textContent = user.name
    userLabel.style.background = user.color

    cursor.appendChild(userLabel)
    document.body.appendChild(cursor)

    setTimeout(() => {
      cursor.remove()
    }, 3000)
  }

  setupAnalytics() {
    this.updateAnalytics()
  }

  updateAnalytics() {
    // Count elements
    const objects = this.canvas.getObjects().filter((obj) => !obj.excludeFromLayers && !obj.excludeFromExport)
    this.analytics.elementsCount = objects.length

    // Track colors and fonts
    objects.forEach((obj) => {
      if (obj.type === "i-text") {
        const font = obj.fontFamily
        this.analytics.fonts[font] = (this.analytics.fonts[font] || 0) + 1

        const color = obj.fill
        this.analytics.colors[color] = (this.analytics.colors[color] || 0) + 1
      }
    })

    this.renderAnalytics()
  }

  renderAnalytics() {
    // Update elements count
    document.getElementById("elementsCount").textContent = this.analytics.elementsCount

    // Update popular colors
    const popularColors = Object.entries(this.analytics.colors)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)

    const colorsContainer = document.getElementById("popularColors")
    colorsContainer.innerHTML = ""
    popularColors.forEach(([color]) => {
      const chip = document.createElement("div")
      chip.className = "color-chip"
      chip.style.backgroundColor = color
      chip.title = color
      colorsContainer.appendChild(chip)
    })

    // Update popular fonts
    const popularFonts = Object.entries(this.analytics.fonts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)

    const fontsContainer = document.getElementById("popularFonts")
    fontsContainer.innerHTML = ""
    popularFonts.forEach(([font, count]) => {
      const item = document.createElement("div")
      item.className = "font-item"
      item.textContent = `${font} (${count})`
      fontsContainer.appendChild(item)
    })
  }

  setupMaterialControls() {
    document.getElementById("glossyMaterial").addEventListener("click", () => {
      this.setMaterial("glossy")
    })

    document.getElementById("matteMaterial").addEventListener("click", () => {
      this.setMaterial("matte")
    })

    document.getElementById("spotUVMaterial").addEventListener("click", () => {
      this.setMaterial("spotUV")
    })
  }

  setMaterial(type) {
    this.currentMaterial = type

    // Update button states
    document.querySelectorAll(".material-btn").forEach((btn) => btn.classList.remove("active"))
    document.getElementById(`${type}Material`).classList.add("active")

    // Update 3D material
    const outerMug = this.meshes["Object_4"]
    if (outerMug) {
      switch (type) {
        case "glossy":
          outerMug.material.metalness = 0.1
          outerMug.material.roughness = 0.1
          break
        case "matte":
          outerMug.material.metalness = 0.0
          outerMug.material.roughness = 0.8
          break
        case "spotUV":
          outerMug.material.metalness = 0.3
          outerMug.material.roughness = 0.2
          // Add UV effect simulation
          break
      }
      outerMug.material.needsUpdate = true
    }
  }

  setupPatternGenerator() {
    const sizeSlider = document.getElementById("patternSize")
    const rotationSlider = document.getElementById("patternRotation")

    sizeSlider.addEventListener("input", (e) => {
      document.getElementById("patternSizeValue").textContent = e.target.value + "%"
      this.updatePatternProperties()
    })

    rotationSlider.addEventListener("input", (e) => {
      document.getElementById("patternRotationValue").textContent = e.target.value + "°"
      this.updatePatternProperties()
    })
  }

  updatePatternProperties() {
    const size = document.getElementById("patternSize").value / 100
    const rotation = document.getElementById("patternRotation").value

    this.canvas.getObjects().forEach((obj) => {
      if (obj.patternImage) {
        const baseScale = Math.max((this.canvas.width - 120) / obj.width, (this.canvas.height - 20) / obj.height)
        obj.set({
          scaleX: baseScale * size,
          scaleY: baseScale * size,
          angle: Number.parseFloat(rotation),
        })
      }
    })

    this.canvas.renderAll()
    this.debouncedUpdate()
  }

  setupAdvancedTextFeatures() {
    // Letter spacing control
    document.getElementById("letterSpacing").addEventListener("input", (e) => {
      document.getElementById("letterSpacingValue").textContent = e.target.value
      this.updateActiveTextProperties()
    })

    // Baseline offset control
    document.getElementById("baselineOffset").addEventListener("input", (e) => {
      document.getElementById("baselineOffsetValue").textContent = e.target.value
      this.updateActiveTextProperties()
    })

    // Curved text toggle
    document.getElementById("curvedText").addEventListener("change", (e) => {
      this.toggleCurvedText(e.target.checked)
    })
  }

  updateActiveTextProperties() {
    const activeObject = this.canvas.getActiveObject()
    if (activeObject && activeObject.type === "i-text") {
      const letterSpacing = document.getElementById("letterSpacing").value
      const baselineOffset = document.getElementById("baselineOffset").value

      activeObject.set({
        charSpacing: Number.parseFloat(letterSpacing),
        // Note: Fabric.js doesn't have direct baseline offset, simulate with top adjustment
        top: activeObject.top + (Number.parseFloat(baselineOffset) - (activeObject.baselineOffset || 0)),
      })

      activeObject.baselineOffset = Number.parseFloat(baselineOffset)
      this.canvas.renderAll()
      this.debouncedUpdate()
    }
  }

  toggleCurvedText(enabled) {
    const activeObject = this.canvas.getActiveObject()
    if (activeObject && activeObject.type === "i-text") {
      if (enabled) {
        this.createCurvedText(activeObject)
      } else {
        this.straightenText(activeObject)
      }
    }
  }

  createCurvedText(textObject) {
    // Create a curved path for text (simplified implementation)
    const path = new fabric.Path("M 100 200 Q 200 100 300 200")
    path.set({
      stroke: "rgba(37, 99, 235, 0.5)",
      strokeWidth: 2,
      fill: "",
      selectable: false,
      evented: false,
      excludeFromExport: true,
    })

    // Convert text to path text (simplified - would need more complex implementation)
    textObject.set({
      path: path,
      curved: true,
    })

    this.canvas.add(path)
    this.canvas.renderAll()
  }

  setupRedoUndo() {
    document.getElementById("redoBtn").addEventListener("click", () => {
      this.redo()
    })
  }

  redo() {
    if (this.redoHistory.length > 0) {
      const state = this.redoHistory.pop()
      this.history.push(JSON.stringify(this.canvas.toJSON()))

      this.canvas.loadFromJSON(state, () => {
        this.canvas.renderAll()
        this.updateLayersPanel()
        this.debouncedUpdate()
        this.updateAnalytics()
      })
    }
  }

  saveHistory() {
    const currentState = JSON.stringify(this.canvas.toJSON())
    this.history.push(currentState)
    this.redoHistory = [] // Clear redo history when new action is performed

    if (this.history.length > 50) this.history.shift()
  }

  setupSafeZoneControls() {
    document.getElementById("toggleSafeZone").addEventListener("click", () => {
      this.safeZoneVisible = !this.safeZoneVisible
      this.safeRect.set({ visible: this.safeZoneVisible })
      this.canvas.renderAll()

      const btn = document.getElementById("toggleSafeZone")
      btn.classList.toggle("active", this.safeZoneVisible)
    })

    document.getElementById("toggleBleed").addEventListener("click", () => {
      this.bleedVisible = !this.bleedVisible
      this.bleedRect.set({ visible: this.bleedVisible })
      this.canvas.renderAll()

      const btn = document.getElementById("toggleBleed")
      btn.classList.toggle("active", this.bleedVisible)
    })
  }

  showAIProcessing(message) {
    document.getElementById("aiProcessingMessage").textContent = message
    document.getElementById("aiProcessingModal").style.display = "block"
  }

  hideAIProcessing() {
    document.getElementById("aiProcessingModal").style.display = "none"
  }

  updateLayersPanel() {
    const layersPanel = document.getElementById("layersPanel")
    if (!layersPanel) return

    layersPanel.innerHTML = ""
    const objects = this.canvas.getObjects()
    const designObjects = objects.filter(
      (obj) =>
        obj !== this.safeRect &&
        obj !== this.bleedRect &&
        obj !== this.vGuide &&
        obj !== this.hGuide &&
        !obj.excludeFromLayers,
    )

    if (designObjects.length === 0) {
      layersPanel.innerHTML =
        '<p style="text-align: center; color: #94a3b8; font-size: 0.875rem; padding: 1rem;">No layers yet</p>'
      return
    }

    designObjects.reverse().forEach((obj, index) => {
      const layerDiv = document.createElement("div")
      layerDiv.className = "layer-item"
      layerDiv.draggable = true
      layerDiv.dataset.objectId = objects.indexOf(obj)

      const layerInfo = document.createElement("div")
      layerInfo.className = "layer-info"

      const layerName = document.createElement("div")
      layerName.className = "layer-name"
      layerName.textContent =
        obj.type === "i-text"
          ? `${obj.text.substring(0, 20)}${obj.text.length > 20 ? "..." : ""}`
          : obj.patternImage
            ? "Pattern"
            : `Image ${index + 1}`

      const layerType = document.createElement("div")
      layerType.className = "layer-type"
      layerType.textContent = obj.type === "i-text" ? "Text" : "Image"

      layerInfo.appendChild(layerName)
      layerInfo.appendChild(layerType)

      const layerActions = document.createElement("div")
      layerActions.className = "layer-actions"

      // Visibility toggle
      const visibilityBtn = document.createElement("button")
      visibilityBtn.innerHTML = obj.visible ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>'
      visibilityBtn.title = "Toggle Visibility"
      visibilityBtn.addEventListener("click", (e) => {
        e.stopPropagation()
        obj.set({ visible: !obj.visible })
        visibilityBtn.innerHTML = obj.visible ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>'
        this.canvas.renderAll()
        this.debouncedUpdate()
      })

      // Lock toggle
      const lockBtn = document.createElement("button")
      lockBtn.innerHTML = obj.selectable ? '<i class="fas fa-unlock"></i>' : '<i class="fas fa-lock"></i>'
      lockBtn.title = "Toggle Lock"
      lockBtn.addEventListener("click", (e) => {
        e.stopPropagation()
        obj.set({
          selectable: !obj.selectable,
          evented: !obj.evented,
          hasControls: !obj.hasControls,
        })
        lockBtn.innerHTML = obj.selectable ? '<i class="fas fa-unlock"></i>' : '<i class="fas fa-lock"></i>'
        this.canvas.renderAll()
        this.debouncedUpdate()
      })

      // Delete button
      const deleteBtn = document.createElement("button")
      deleteBtn.innerHTML = '<i class="fas fa-trash"></i>'
      deleteBtn.title = "Delete Layer"
      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation()
        this.canvas.remove(obj)
        this.canvas.discardActiveObject()
        this.canvas.renderAll()
        this.saveHistory()
        this.updateLayersPanel()
        this.debouncedUpdate()
        this.updateAnalytics()
      })

      layerActions.appendChild(visibilityBtn)
      layerActions.appendChild(lockBtn)
      layerActions.appendChild(deleteBtn)

      layerDiv.appendChild(layerInfo)
      layerDiv.appendChild(layerActions)

      // Layer selection
      layerDiv.addEventListener("click", () => {
        this.canvas.setActiveObject(obj)
        this.canvas.renderAll()

        // Update active state
        document.querySelectorAll(".layer-item").forEach((item) => item.classList.remove("active"))
        layerDiv.classList.add("active")
      })

      // Drag and drop for layer reordering
      layerDiv.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", index)
        layerDiv.classList.add("dragging")
      })

      layerDiv.addEventListener("dragend", () => {
        layerDiv.classList.remove("dragging")
      })

      layerDiv.addEventListener("dragover", (e) => {
        e.preventDefault()
        layerDiv.classList.add("drop-target")
      })

      layerDiv.addEventListener("dragleave", () => {
        layerDiv.classList.remove("drop-target")
      })

      layerDiv.addEventListener("drop", (e) => {
        e.preventDefault()
        layerDiv.classList.remove("drop-target")

        const draggedIndex = Number.parseInt(e.dataTransfer.getData("text/plain"))
        const targetIndex = index

        if (draggedIndex !== targetIndex) {
          this.reorderLayers(draggedIndex, targetIndex)
        }
      })

      layersPanel.appendChild(layerDiv)
    })
  }

  reorderLayers(fromIndex, toIndex) {
    const objects = this.canvas
      .getObjects()
      .filter(
        (obj) =>
          obj !== this.safeRect &&
          obj !== this.bleedRect &&
          obj !== this.vGuide &&
          obj !== this.hGuide &&
          !obj.excludeFromLayers,
      )

    const draggedObject = objects[fromIndex]

    // Remove and re-add at new position
    this.canvas.remove(draggedObject)

    if (toIndex === 0) {
      this.canvas.insertAt(draggedObject, this.canvas.size() - 1)
    } else {
      const targetObject = objects[toIndex]
      const targetCanvasIndex = this.canvas.getObjects().indexOf(targetObject)
      this.canvas.insertAt(draggedObject, targetCanvasIndex)
    }

    this.canvas.renderAll()
    this.saveHistory()
    this.updateLayersPanel()
    this.debouncedUpdate()
  }

  // ... existing code continues with all the other methods ...

  debounce(func, wait) {
    let timeout
    return (...args) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func.apply(this, args), wait)
    }
  }

  init() {
    this.container = document.getElementById("modelViewer")
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0xffffff)

    this.camera = new THREE.PerspectiveCamera(45, this.container.clientWidth / this.container.clientHeight, 0.1, 1000)
    this.camera.position.set(0, 0, 10)

    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight)
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.container.appendChild(this.renderer.domElement)
  }

  setupScene() {
    this.scene.background = new THREE.Color(0xffffff)
  }

  setupLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
    this.scene.add(ambientLight)

    const mainLight = new THREE.DirectionalLight(0xffffff, 1)
    mainLight.position.set(10, 10, 10)
    this.scene.add(mainLight)

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5)
    fillLight.position.set(-10, 0, -10)
    this.scene.add(fillLight)

    const topLight = new THREE.DirectionalLight(0xffffff, 0.3)
    topLight.position.set(0, 10, 0)
    this.scene.add(topLight)

    const frontLight = new THREE.DirectionalLight(0xffffff, 0.8)
    frontLight.position.set(0, 0, 20)
    this.scene.add(frontLight)
  }

  setupControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.05
    this.controls.minDistance = 20
    this.controls.maxDistance = 80
    this.controls.target.set(0, 0, 0)
    this.controls.minPolarAngle = Math.PI / 3
    this.controls.maxPolarAngle = Math.PI / 1.7
    this.controls.enablePan = false
  }

  setupFabric() {
    const mode = "Printful"
    const marginTop = 3
    const marginBottom = 5
    const marginLeft = 60
    const marginRight = 60

    let printWidth = DEFAULT_CANVAS_WIDTH
    let printHeight = DEFAULT_CANVAS_HEIGHT

    if (mode !== "Printful") {
      printWidth = DEFAULT_CANVAS_WIDTH + marginLeft + marginRight
      printHeight = DEFAULT_CANVAS_HEIGHT + marginTop + marginBottom
    }

    this.canvas = new fabric.Canvas("designCanvas", {
      backgroundColor: "white",
      width: printWidth,
      height: printHeight,
      preserveObjectStacking: true,
    })

    if (mode === "Printful") {
      this.safeRect = new fabric.Rect({
        left: marginLeft,
        top: marginTop,
        width: printWidth - (marginLeft + marginRight),
        height: printHeight - (marginTop + marginBottom),
        fill: "transparent",
        stroke: "#ef4444",
        strokeWidth: 0.4,
        strokeDashArray: [15, 10],
        selectable: false,
        evented: false,
        excludeFromLayers: true,
        excludeFromExport: true,
      })
      this.canvas.add(this.safeRect)
      this.canvas.sendToBack(this.safeRect)
    }

    this.bleedRect = new fabric.Rect({
      left: -BLEED_MARGIN,
      top: -BLEED_MARGIN,
      width: printWidth + BLEED_MARGIN * 2,
      height: printHeight + BLEED_MARGIN * 2,
      fill: "transparent",
      stroke: "#f97316",
      strokeDashArray: [5, 5],
      selectable: false,
      evented: false,
      excludeFromLayers: true,
      excludeFromExport: true,
    })
    this.canvas.add(this.bleedRect)
    this.canvas.sendToBack(this.bleedRect)

    this.vGuide = new fabric.Line([printWidth / 2, 0, printWidth / 2, printHeight], {
      stroke: "rgba(37, 99, 235, 0.5)",
      selectable: false,
      evented: false,
      visible: false,
      excludeFromLayers: true,
      excludeFromExport: true,
    })
    this.hGuide = new fabric.Line([0, printHeight / 2, printWidth, printHeight / 2], {
      stroke: "rgba(37, 99, 235, 0.5)",
      selectable: false,
      evented: false,
      visible: false,
      excludeFromLayers: true,
      excludeFromExport: true,
    })
    this.canvas.add(this.vGuide, this.hGuide)

    // Enhanced fabric controls
    fabric.Object.prototype.transparentCorners = false
    fabric.Object.prototype.cornerStyle = "circle"
    fabric.Object.prototype.cornerColor = "rgba(37, 99, 235, 0.9)"
    fabric.Object.prototype.borderColor = "rgba(37, 99, 235, 0.6)"
    fabric.Object.prototype.cornerSize = 10
    fabric.Object.prototype.padding = 5

    // Custom controls
    fabric.Object.prototype.controls.deleteControl = new fabric.Control({
      x: 0.5,
      y: -0.5,
      offsetX: 16,
      offsetY: -16,
      cursorStyle: "pointer",
      mouseUpHandler: (eventData, transform) => {
        const target = transform.target
        const canvas = target.canvas
        canvas.remove(target)
        canvas.discardActiveObject()
        canvas.requestRenderAll()
        this.saveHistory()
        this.updateLayersPanel()
        this.debouncedUpdate()
        this.updateAnalytics()
        return true
      },
      render: (ctx, left, top) => {
        ctx.save()
        ctx.translate(left, top)
        ctx.beginPath()
        ctx.arc(0, 0, 10, 0, Math.PI * 2, false)
        ctx.fillStyle = "#ef4444"
        ctx.fill()
        ctx.strokeStyle = "#fff"
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.fillStyle = "#fff"
        ctx.font = "12px Inter"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText("✕", 0, 1)
        ctx.restore()
      },
    })

    fabric.Object.prototype.controls.cloneControl = new fabric.Control({
      x: -0.5,
      y: -0.5,
      offsetX: -16,
      offsetY: -16,
      cursorStyle: "copy",
      mouseUpHandler: (eventData, transform) => {
        const target = transform.target
        const canvas = target.canvas
        if (target) {
          target.clone((clone) => {
            clone.set({
              left: target.left + 30,
              top: target.top + 30,
              evented: true,
            })
            canvas.add(clone)
            canvas.setActiveObject(clone)
            canvas.requestRenderAll()
            this.saveHistory()
            this.updateLayersPanel()
            this.debouncedUpdate()
            this.updateAnalytics()
          })
        }
        return true
      },
      render: (ctx, left, top) => {
        ctx.save()
        ctx.translate(left, top)
        ctx.beginPath()
        ctx.arc(0, 0, 10, 0, Math.PI * 2, false)
        ctx.fillStyle = "#10b981"
        ctx.fill()
        ctx.strokeStyle = "#fff"
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.fillStyle = "#fff"
        ctx.font = "12px Inter"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText("+", 0, 1)
        ctx.restore()
      },
    })

    this.updateLayersPanel()
  }

  setupUI() {
    // Panel management
    const panels = ["textPanel", "imagePanel", "patternsPanel", "colorsPanel", "aiPanel"]
    const toggles = ["addTextBtn", "addImageBtn", "patternsToggle", "colorsToggle", "aiToggle"]

    toggles.forEach((toggleId, index) => {
      const toggle = document.getElementById(toggleId)
      const panel = document.getElementById(panels[index])

      toggle.addEventListener("click", () => {
        this.togglePanel(panels[index], toggleId)
      })
    })

    // Close panel buttons
    document.querySelectorAll(".panel-close").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const panel = e.target.closest(".sidebar-panel")
        panel.classList.remove("active")

        // Remove active state from corresponding toggle
        const panelId = panel.id
        const index = panels.indexOf(panelId)
        if (index !== -1) {
          document.getElementById(toggles[index]).classList.remove("active")
        }
      })
    })

    // Upload area drag and drop
    const uploadArea = document.getElementById("uploadArea")
    const imageInput = document.getElementById("imageInput")

    uploadArea.addEventListener("click", () => imageInput.click())

    uploadArea.addEventListener("dragover", (e) => {
      e.preventDefault()
      uploadArea.style.borderColor = "#2563eb"
      uploadArea.style.background = "#dbeafe"
    })

    uploadArea.addEventListener("dragleave", () => {
      uploadArea.style.borderColor = "#cbd5e1"
      uploadArea.style.background = "transparent"
    })

    uploadArea.addEventListener("drop", (e) => {
      e.preventDefault()
      uploadArea.style.borderColor = "#cbd5e1"
      uploadArea.style.background = "transparent"

      const files = e.dataTransfer.files
      if (files.length > 0) {
        this.handleImageUpload(files[0])
      }
    })

    // Setup safe zone controls
    this.setupSafeZoneControls()
  }

  togglePanel(panelId, toggleId) {
    const panels = ["textPanel", "imagePanel", "patternsPanel", "colorsPanel", "aiPanel"]
    const toggles = ["addTextBtn", "addImageBtn", "patternsToggle", "colorsToggle", "aiToggle"]

    // Close all other panels
    panels.forEach((id, i) => {
      const p = document.getElementById(id)
      const t = document.getElementById(toggles[i])
      if (id !== panelId) {
        p.classList.remove("active")
        t.classList.remove("active")
      }
    })

    // Toggle current panel
    const panel = document.getElementById(panelId)
    const toggle = document.getElementById(toggleId)
    panel.classList.toggle("active")
    toggle.classList.toggle("active")
  }

  async handleImageUpload(file) {
    if (file && file.type.startsWith("image/")) {
      // Check for AI processing options
      const removeBackground = document.getElementById("removeBackground")?.checked
      const vectorizeImage = document.getElementById("vectorizeImage")?.checked

      if (removeBackground || vectorizeImage) {
        await this.processImageWithAI(file, { removeBackground, vectorizeImage })
      }

      const imgURL = URL.createObjectURL(file)
      fabric.Image.fromURL(
        imgURL,
        (img) => {
          const scale = Math.min(0.3, (this.canvas.width - 40) / img.width, (this.canvas.height - 40) / img.height)
          const marginLeft = 60
          const marginRight = 60
          const marginTop = 10
          const marginBottom = 10
          const safeW = this.canvas.width - (marginLeft + marginRight)
          const safeH = this.canvas.height - (marginTop + marginBottom)

          img.set({
            left: this.canvas.width / 2,
            top: this.canvas.height / 2,
            originX: "center",
            originY: "center",
            scaleX: scale,
            scaleY: scale,
          })

          const clipRect = new fabric.Rect({
            left: marginLeft,
            top: marginTop,
            width: safeW,
            height: safeH,
            absolutePositioned: true,
          })
          img.clipPath = clipRect

          if (document.getElementById("grayscaleFilter")?.checked) {
            img.filters.push(new fabric.Image.filters.Grayscale())
            img.applyFilters()
          }

          this.canvas.add(img)
          this.canvas.setActiveObject(img)
          this.checkBounds(img)
          img.setCoords()
          this.canvas.renderAll()
          this.saveHistory()
          this.updateLayersPanel()
          this.debouncedUpdate()
          this.updateAnalytics()

          // Close image panel
          document.getElementById("imagePanel").classList.remove("active")
          document.getElementById("addImageBtn").classList.remove("active")
        },
        { crossOrigin: "Anonymous" },
      )
    }
  }

  async loadMug() {
    const loader = new GLTFLoader()
    try {
      // ✅ هنا حط لينك أو المسار بتاع المج الخاص بيك
      const mugUrl = "images/mug.glb"
      // أو لو رافع على GitHub مثلاً:
      // const mugUrl = "https://username.github.io/project/images/mug.glb"

      const gltf = await new Promise((resolve, reject) => {
        loader.load(mugUrl, resolve, undefined, reject)
      })

      if (this.mug) this.scene.remove(this.mug)
      this.mug = gltf.scene

      this.mug.traverse((child) => {
        if (child.isMesh) {
          this.meshes[child.name] = child
          if (!child.material) {
            child.material = new THREE.MeshStandardMaterial({
              metalness: 0.3,
              roughness: 0.4,
              color: 0xffffff,
            })
          }
          child.castShadow = true
          child.receiveShadow = true
        }
      })

      // ✅ عدّل قيمة الـ scale على حسب حجم المج في الـ GLB
      const scale = 40
      this.mug.scale.set(scale, scale, scale)

      const box = new THREE.Box3().setFromObject(this.mug)
      const center = box.getCenter(new THREE.Vector3())
      this.mug.position.sub(center)

      this.mug.rotation.y = Math.PI * 0.3
      this.scene.add(this.mug)

      this.controls.target.set(0, 0, 0)
      this.camera.position.set(0, 5, 15)
      this.camera.lookAt(0, 0, 0)
      this.controls.minDistance = 10
      this.controls.maxDistance = 25
      this.controls.update()
    } catch (error) {
      console.error("Error loading mug:", error)
      // fallback
      this.createFallbackMug()
    }
  }

  createFallbackMug() {
    const geometry = new THREE.CylinderGeometry(8, 10, 15, 32)
    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.3,
      roughness: 0.4,
    })

    this.mug = new THREE.Mesh(geometry, material)
    this.meshes["Object_4"] = this.mug // Outer mug
    this.meshes["Object_5"] = this.mug // Inner mug (same for fallback)

    this.scene.add(this.mug)

    this.controls.target.set(0, 0, 0)
    this.camera.position.set(0, 0, 40)
    this.camera.lookAt(0, 0, 0)
    this.controls.update()
  }

  updateMugTexture() {
    const outerMug = this.meshes["Object_4"]
    if (!outerMug) return

    this.canvas.getObjects().forEach((obj) => {
      if (obj.excludeFromExport) {
        obj.set({ visible: false })
      }
    })
    this.canvas.renderAll()

    const multiplier = Math.min(4, window.innerWidth / 500)
    const dataURL = this.canvas.toDataURL({
      format: "png",
      multiplier,
      quality: 1,
    })

    this.canvas.getObjects().forEach((obj) => {
      if (obj.excludeFromExport) {
        obj.set({ visible: true })
      }
    })
    this.canvas.renderAll()

    const texture = new THREE.TextureLoader().load(dataURL, (tex) => {
      tex.anisotropy = this.renderer.capabilities.getMaxAnisotropy()
      tex.encoding = THREE.sRGBEncoding
      if (outerMug.material.map) outerMug.material.map.dispose()
      outerMug.material.map = tex
      outerMug.material.needsUpdate = true
    })
  }

  // ... existing code continues with remaining methods ...

  setupEventListeners() {
    this.debouncedUpdate = this.debounce(() => this.updateMugTexture(), DEBOUNCE_TIME)

    // Canvas events
    this.canvas.on("object:moving", ({ target }) => {
      this.snapToCenter(target)
      this.checkBounds(target)
    })

    this.canvas.on("object:scaling", ({ target }) => {
      this.checkBounds(target)
    })

    this.canvas.on("object:modified", ({ target }) => {
      this.vGuide.visible = false
      this.hGuide.visible = false
      this.checkBounds(target)
      target.setCoords()
      this.canvas.renderAll()
      this.saveHistory()
      this.updateLayersPanel()
      this.debouncedUpdate()
      this.updateAnalytics()
    })

    this.canvas.on("object:added", () => {
      this.saveHistory()
      this.updateLayersPanel()
      this.debouncedUpdate()
      this.updateAnalytics()
    })

    this.canvas.on("object:removed", () => {
      this.canvas.discardActiveObject()
      this.canvas.requestRenderAll()
      this.saveHistory()
      this.updateLayersPanel()
      this.debouncedUpdate()
      this.updateAnalytics()
    })

    // Text functionality
    document.getElementById("addTextConfirm").addEventListener("click", () => {
      const text = document.getElementById("textInput").value || "Sample Text"
      const fontStyle = document.getElementById("fontStyleSelect")?.value || "normal"
      const fabricText = new fabric.IText(text, {
        left: this.canvas.width / 2,
        top: this.canvas.height / 2,
        fontSize: 40,
        fill: document.getElementById("colorPicker")?.value || "#000000",
        fontFamily: document.getElementById("fontSelect").value,
        originX: "center",
        originY: "center",
        fontWeight: fontStyle.includes("bold") ? "bold" : "normal",
        fontStyle: fontStyle.includes("italic") ? "italic" : "normal",
        stroke: "#000000",
        strokeWidth: fontStyle.includes("outline") ? 1 : 0,
      })
      this.canvas.add(fabricText)
      this.canvas.setActiveObject(fabricText)
      this.checkBounds(fabricText)
      fabricText.setCoords()
      this.canvas.renderAll()

      // Close text panel
      document.getElementById("textPanel").classList.remove("active")
      document.getElementById("addTextBtn").classList.remove("active")
    })

    // Image upload
    const imageInput = document.getElementById("imageInput")
    imageInput.addEventListener("change", (e) => {
      const file = e.target.files[0]
      if (file) {
        this.handleImageUpload(file)
      }
    })

    // Color swatches
    document.querySelectorAll(".color-swatch").forEach((swatch) => {
      swatch.addEventListener("click", (e) => {
        const color = e.target.dataset.color
        const innerMug = this.meshes["Object_5"]
        if (innerMug) {
          innerMug.material.color.setStyle(color)
          innerMug.material.needsUpdate = true
        }
        document.querySelectorAll(".color-swatch").forEach((s) => s.classList.remove("active"))
        e.target.classList.add("active")
      })
    })

    // Pattern selection
    document.querySelectorAll(".pattern-item").forEach((item) => {
      item.addEventListener("click", () => {
        const img = item.querySelector("img")
        const url = img.getAttribute("src")
        this.addPatternImage(url)

        // Close patterns panel
        document.getElementById("patternsPanel").classList.remove("active")
        document.getElementById("patternsToggle").classList.remove("active")
      })
    })

    // Control buttons
    document.getElementById("exportBtn").addEventListener("click", () => {
      document.getElementById("exportModal").style.display = "block"
    })

    document.getElementById("resetBtn").addEventListener("click", () => {
      if (confirm("Are you sure you want to reset the design? This action cannot be undone.")) {
        this.resetDesign()
      }
    })

    document.getElementById("undoBtn").addEventListener("click", () => {
      if (this.history.length > 1) {
        this.redoHistory.push(this.history.pop())
        const lastState = this.history[this.history.length - 1]
        if (lastState) {
          this.canvas.loadFromJSON(lastState, () => {
            this.canvas.renderAll()
            this.updateLayersPanel()
            this.debouncedUpdate()
            this.updateAnalytics()
          })
        }
      }
    })

    document.getElementById("togglePatternBtn").addEventListener("click", () => {
      this.patternMovable = !this.patternMovable
      const button = document.getElementById("togglePatternBtn")
      const icon = button.querySelector("i")

      if (this.patternMovable) {
        button.innerHTML = '<i class="fas fa-unlock"></i> Disable Pattern Movement'
        icon.className = "fas fa-unlock"
      } else {
        button.innerHTML = '<i class="fas fa-lock"></i> Enable Pattern Movement'
        icon.className = "fas fa-lock"
      }

      this.canvas.getObjects().forEach((obj) => {
        if (obj.patternImage) {
          obj.set({
            selectable: this.patternMovable,
            evented: this.patternMovable,
            hasControls: this.patternMovable,
            lockScalingX: !this.patternMovable,
            lockScalingY: !this.patternMovable,
            lockRotation: !this.patternMovable,
          })
          obj.setCoords()
        }
      })
      this.canvas.renderAll()
      this.debouncedUpdate()
    })

    // Modal close buttons
    document.querySelectorAll(".close-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.target.closest(".modal").style.display = "none"
      })
    })

    // Splitter functionality
    this.setupSplitter()

    // Window resize
    window.addEventListener("resize", () => {
      const width = this.container.clientWidth
      const height = this.container.clientHeight
      this.camera.aspect = width / height
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(width, height)

      const canvasContainer = document.querySelector(".canvas-container .canvas-wrapper")
      this.updateCanvasSize(canvasContainer.clientWidth, canvasContainer.clientHeight)
    })
  }

  // Helper methods for AI features
  extractColorsFromDesign() {
    const colors = []
    this.canvas.getObjects().forEach((obj) => {
      if (obj.fill && obj.fill !== "transparent") {
        colors.push(obj.fill)
      }
    })
    return [...new Set(colors)]
  }

  getComplementaryColors(currentColors) {
    // Simple complementary color algorithm
    const suggestions = []
    currentColors.forEach((color) => {
      // Convert hex to RGB, calculate complement, convert back
      const hex = color.replace("#", "")
      const r = 255 - Number.parseInt(hex.substr(0, 2), 16)
      const g = 255 - Number.parseInt(hex.substr(2, 2), 16)
      const b = 255 - Number.parseInt(hex.substr(4, 2), 16)
      const complement = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
      suggestions.push(complement)
    })
    return suggestions
  }

  highlightSuggestedColors(suggestions) {
    document.querySelectorAll(".color-swatch").forEach((swatch) => {
      const color = swatch.dataset.color
      if (suggestions.includes(color)) {
        swatch.style.boxShadow = "0 0 10px rgba(37, 99, 235, 0.8)"
        swatch.style.transform = "scale(1.1)"
      }
    })

    setTimeout(() => {
      document.querySelectorAll(".color-swatch").forEach((swatch) => {
        swatch.style.boxShadow = ""
        swatch.style.transform = ""
      })
    }, 3000)
  }

  extractFontsFromDesign() {
    const fonts = []
    this.canvas.getObjects().forEach((obj) => {
      if (obj.type === "i-text" && obj.fontFamily) {
        fonts.push(obj.fontFamily)
      }
    })
    return [...new Set(fonts)]
  }

  getComplementaryFonts(currentFonts) {
    const fontPairs = {
      Inter: ["Georgia", "Times New Roman"],
      Arial: ["Georgia", "Verdana"],
      Helvetica: ["Times New Roman", "Georgia"],
      "Times New Roman": ["Arial", "Helvetica"],
      Georgia: ["Arial", "Inter"],
      Verdana: ["Times New Roman", "Georgia"],
    }

    const suggestions = []
    currentFonts.forEach((font) => {
      if (fontPairs[font]) {
        suggestions.push(...fontPairs[font])
      }
    })

    return [...new Set(suggestions)]
  }

  highlightSuggestedFonts(suggestions) {
    const fontSelect = document.getElementById("fontSelect")
    Array.from(fontSelect.options).forEach((option) => {
      if (suggestions.includes(option.value)) {
        option.style.backgroundColor = "rgba(37, 99, 235, 0.1)"
        option.style.fontWeight = "bold"
      }
    })

    setTimeout(() => {
      Array.from(fontSelect.options).forEach((option) => {
        option.style.backgroundColor = ""
        option.style.fontWeight = ""
      })
    }, 3000)
  }

  // Continue with remaining methods...
  snapToCenter(obj, snapPx = 10) {
    const center = obj.getCenterPoint()
    let snapped = false

    if (Math.abs(center.x - this.canvas.width / 2) < snapPx) {
      obj.setPositionByOrigin(new fabric.Point(this.canvas.width / 2, center.y), "center", "center")
      this.vGuide.set({ visible: true })
      snapped = true
    } else {
      this.vGuide.set({ visible: false })
    }

    if (Math.abs(center.y - this.canvas.height / 2) < snapPx) {
      obj.setPositionByOrigin(new fabric.Point(center.x, this.canvas.height / 2), "center", "center")
      this.hGuide.set({ visible: true })
      snapped = true
    } else {
      this.hGuide.set({ visible: false })
    }

    if (snapped) this.canvas.requestRenderAll()
  }

  checkBounds(obj) {
    if (!obj) return

    const bounds = obj.getBoundingRect(true)
    const safe = this.safeRect.getBoundingRect(true)
    const bleed = this.bleedRect.getBoundingRect(true)

    if (
      bounds.left < bleed.left ||
      bounds.left + bounds.width > bleed.left + bleed.width ||
      bounds.top < bleed.top ||
      bounds.top + bounds.height > bleed.top + bleed.height
    ) {
      this.showModal("⚠ Element is outside the safe printing area!")
    }

    if (obj.type === "i-text") {
      let objWidth = obj.width * obj.scaleX
      let objHeight = obj.height * obj.scaleY

      const maxWidth = safe.width
      const maxHeight = safe.height

      if (objWidth > maxWidth) {
        obj.scaleX = maxWidth / obj.width
        objWidth = maxWidth
      }
      if (objHeight > maxHeight) {
        obj.scaleY = maxHeight / obj.height
        objHeight = maxHeight
      }

      const objHalfW = objWidth / 2
      const objHalfH = objHeight / 2

      const minX = safe.left + objHalfW
      const maxX = safe.left + safe.width - objHalfW
      const minY = safe.top + objHalfH
      const maxY = safe.top + safe.height - objHalfH

      if (obj.left < minX) obj.left = minX
      if (obj.left > maxX) obj.left = maxX
      if (obj.top < minY) obj.top = minY
      if (obj.top > maxY) obj.top = maxY
    }
  }

  showModal(message) {
    const modal = document.getElementById("warningModal")
    const messageEl = document.getElementById("warningMessage")
    messageEl.textContent = message
    modal.style.display = "block"

    setTimeout(() => {
      modal.style.display = "none"
    }, 3000)
  }

  updateCanvasSize(containerWidth, containerHeight) {
    let newWidth = Math.min(containerWidth - 32, DEFAULT_CANVAS_WIDTH)
    let newHeight = newWidth / ASPECT_RATIO

    if (newHeight > containerHeight - 32) {
      newHeight = containerHeight - 32
      newWidth = newHeight * ASPECT_RATIO
    }

    this.canvas.setDimensions({
      width: newWidth,
      height: newHeight,
    })

    const marginLeft = 60
    const marginRight = 60
    const marginTop = 3
    const marginBottom = 5

    this.safeRect.set({
      left: marginLeft,
      top: marginTop,
      width: newWidth - (marginLeft + marginRight),
      height: newHeight - (marginTop + marginBottom),
    })

    this.bleedRect.set({
      left: -BLEED_MARGIN,
      top: -BLEED_MARGIN,
      width: newWidth + BLEED_MARGIN * 2,
      height: newHeight + BLEED_MARGIN * 2,
    })

    this.vGuide.set({
      x1: newWidth / 2,
      x2: newWidth / 2,
      y2: newHeight,
    })
    this.hGuide.set({
      y1: newHeight / 2,
      y2: newHeight / 2,
      x2: newWidth,
    })

    this.canvas.renderAll()
    this.debouncedUpdate()
  }

  setupSplitter() {
    const splitter = document.querySelector(".splitter")
    const handle = document.querySelector(".splitter-handle")
    const modelContainer = document.querySelector(".model-container")
    const canvasContainer = document.querySelector(".canvas-container")
    const splitContainer = document.querySelector(".split-container")

    let isDragging = false

    const startDrag = (e) => {
      isDragging = true
      e.preventDefault()
      document.body.style.cursor = "col-resize"
      document.body.style.userSelect = "none"
    }

    const drag = (e) => {
      if (!isDragging) return

      const containerRect = splitContainer.getBoundingClientRect()
      const x = e.clientX - containerRect.left
      const minWidth = 300
      const splitterWidth = splitter.offsetWidth
      const maxWidth = containerRect.width - minWidth - splitterWidth

      const modelWidth = Math.max(minWidth, Math.min(x, maxWidth))
      const canvasWidth = containerRect.width - modelWidth - splitterWidth

      modelContainer.style.flex = `0 0 ${modelWidth}px`
      canvasContainer.style.flex = `0 0 ${canvasWidth}px`

      // Update 3D renderer
      this.renderer.setSize(modelContainer.clientWidth, modelContainer.clientHeight)
      this.camera.aspect = modelContainer.clientWidth / modelContainer.clientHeight
      this.camera.updateProjectionMatrix()

      // Update canvas
      const canvasWrapper = canvasContainer.querySelector(".canvas-wrapper")
      this.updateCanvasSize(canvasWrapper.clientWidth, canvasWrapper.clientHeight)
    }

    const stopDrag = () => {
      isDragging = false
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }

    handle.addEventListener("mousedown", startDrag)
    splitter.addEventListener("mousedown", startDrag)
    document.addEventListener("mousemove", drag)
    document.addEventListener("mouseup", stopDrag)

    // Touch events for mobile
    handle.addEventListener("touchstart", (e) => startDrag(e.touches[0]))
    document.addEventListener("touchmove", (e) => {
      if (isDragging) drag(e.touches[0])
    })
    document.addEventListener("touchend", stopDrag)
  }

  resetDesign() {
    this.canvas.clear()
    this.canvas.backgroundColor = "white"

    // Recreate guide elements
    const marginLeft = 60
    const marginRight = 60
    const marginTop = 3
    const marginBottom = 5

    this.safeRect = new fabric.Rect({
      left: marginLeft,
      top: marginTop,
      width: this.canvas.width - marginLeft - marginRight,
      height: this.canvas.height - marginTop - marginBottom,
      fill: "transparent",
      stroke: "#ef4444",
      strokeWidth: 0.4,
      strokeDashArray: [15, 10],
      selectable: false,
      evented: false,
      excludeFromLayers: true,
      excludeFromExport: true,
    })

    this.bleedRect = new fabric.Rect({
      left: -BLEED_MARGIN,
      top: -BLEED_MARGIN,
      width: this.canvas.width + BLEED_MARGIN * 2,
      height: this.canvas.height + BLEED_MARGIN * 2,
      fill: "transparent",
      stroke: "#f97316",
      strokeDashArray: [5, 5],
      selectable: false,
      evented: false,
      excludeFromLayers: true,
      excludeFromExport: true,
    })

    this.canvas.add(this.bleedRect, this.safeRect, this.vGuide, this.hGuide)
    this.canvas.sendToBack(this.bleedRect)
    this.canvas.sendToBack(this.safeRect)

    // Reset mug texture
    const outerMug = this.meshes["Object_4"]
    if (outerMug) {
      if (outerMug.material.map) outerMug.material.map.dispose()
      outerMug.material.map = null
      outerMug.material.needsUpdate = true
    }

    this.history = []
    this.redoHistory = []
    this.analytics = { colors: {}, fonts: {}, elementsCount: 0 }
    this.updateLayersPanel()
    this.updateAnalytics()
    this.canvas.renderAll()
    this.debouncedUpdate()
  }

  addPatternImage(url) {
    fabric.Image.fromURL(
      url,
      (fImg) => {
        const marginTop = 3
        const marginBottom = 5
        const marginLeft = 60
        const marginRight = 60

        const safeW = this.canvas.width - (marginLeft + marginRight)
        const safeH = this.canvas.height - (marginTop + marginBottom)

        const scale = Math.max(safeW / fImg.width, safeH / fImg.height)

        fImg.set({
          scaleX: scale,
          scaleY: scale,
          left: this.canvas.width / 2,
          top: this.canvas.height / 2,
          originX: "center",
          originY: "center",
          selectable: false,
          evented: false,
          hasControls: false,
          lockScalingX: true,
          lockScalingY: true,
          lockRotation: true,
          crossOrigin: "Anonymous",
        })

        // Remove existing patterns
        this.canvas.getObjects().forEach((obj) => {
          if (obj.patternImage) this.canvas.remove(obj)
        })

        fImg.patternImage = true

        const clipRect = new fabric.Rect({
          left: marginLeft,
          top: marginTop,
          width: safeW,
          height: safeH,
          absolutePositioned: true,
        })

        fImg.clipPath = clipRect

        this.canvas.add(fImg)
        this.canvas.sendToBack(fImg)
        this.canvas.renderAll()
        this.debouncedUpdate()
      },
      { crossOrigin: "Anonymous" },
    )
  }

  animate() {
    requestAnimationFrame(() => this.animate())
    if (this.controls) this.controls.update()
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera)
    }
  }
}

// Initialize the application
new MugDesigner()
