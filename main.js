// Page load animations
document.addEventListener("DOMContentLoaded", () => {
  // Add fade-in animation to main sections
  const sections = document.querySelectorAll(".hero, .product-section")
  sections.forEach((section, index) => {
    section.style.opacity = "0"
    section.style.transform = "translateY(30px)"

    setTimeout(() => {
      section.style.transition = "all 0.8s ease-out"
      section.style.opacity = "1"
      section.style.transform = "translateY(0)"
    }, index * 200)
  })

  // Product image hover effects
  const productImage = document.getElementById("productImage")
  const productShowcase = document.querySelector(".product-showcase")

  if (productShowcase) {
    productShowcase.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-8px) scale(1.02)"
    })

    productShowcase.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0) scale(1)"
    })
  }

  // Gallery thumbnail functionality
  const thumbs = document.querySelectorAll(".thumb")
  const mainImage = document.getElementById("mainImage")

  thumbs.forEach((thumb) => {
    thumb.addEventListener("click", function () {
      // Remove active class from all thumbs
      thumbs.forEach((t) => t.classList.remove("active"))

      // Add active class to clicked thumb
      this.classList.add("active")

      // Update main image with smooth transition
      const newImageSrc = this.dataset.image

      mainImage.style.opacity = "0"
      setTimeout(() => {
        mainImage.src = newImageSrc
        mainImage.style.opacity = "1"
      }, 150)
    })
  })

  // Smooth scroll for navigation links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault()
      const target = document.querySelector(this.getAttribute("href"))
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    })
  })

  // Button click animations
  const buttons = document.querySelectorAll(".btn-primary, .btn-secondary, .customize-btn")
  buttons.forEach((button) => {
    button.addEventListener("click", function (e) {
      // Create ripple effect
      const ripple = document.createElement("span")
      const rect = this.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height)
      const x = e.clientX - rect.left - size / 2
      const y = e.clientY - rect.top - size / 2

      ripple.style.width = ripple.style.height = size + "px"
      ripple.style.left = x + "px"
      ripple.style.top = y + "px"
      ripple.classList.add("ripple")

      this.appendChild(ripple)

      setTimeout(() => {
        ripple.remove()
      }, 600)
    })
  })

  // Customize button functionality
  const customizeBtn = document.getElementById("customizeBtn")
  const startDesignBtn = document.getElementById("startDesignBtn")

  function navigateToCustomization() {
    // Add page transition effect
    document.body.style.opacity = "0"
    document.body.style.transform = "scale(0.95)"
    document.body.style.transition = "all 0.3s ease-out"

    setTimeout(() => {
      window.location.href = "designer.html"
    }, 300)
  }

  if (customizeBtn) {
    customizeBtn.addEventListener("click", navigateToCustomization)
  }

  if (startDesignBtn) {
    startDesignBtn.addEventListener("click", navigateToCustomization)
  }

  // Header scroll effect
  const header = document.querySelector(".header")
  let lastScrollY = window.scrollY

  window.addEventListener("scroll", () => {
    const currentScrollY = window.scrollY

    if (currentScrollY > 100) {
      header.style.background = "rgba(255, 255, 255, 0.95)"
      header.style.backdropFilter = "blur(10px)"
    } else {
      header.style.background = "var(--white)"
      header.style.backdropFilter = "none"
    }

    lastScrollY = currentScrollY
  })

  // Intersection Observer for scroll animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("fade-in-up")
      }
    })
  }, observerOptions)

  // Observe elements for scroll animations
  const animateElements = document.querySelectorAll(".product-features, .cta-section, .footer-section")
  animateElements.forEach((el) => {
    observer.observe(el)
  })

  // Add CSS for ripple effect
  const style = document.createElement("style")
  style.textContent = `
        .ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.6);
            transform: scale(0);
            animation: ripple-animation 0.6s linear;
            pointer-events: none;
        }
        
        @keyframes ripple-animation {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        .btn-primary, .btn-secondary, .customize-btn {
            position: relative;
            overflow: hidden;
        }
    `
  document.head.appendChild(style)
})

// Preload images for better performance
function preloadImages() {
  const imageUrls = [
    "images/right.png",
    "images/front.png",
    "images/left.png",
  ]

  imageUrls.forEach((url) => {
    const img = new Image()
    img.src = url
  })
}

// Call preload function
preloadImages()
