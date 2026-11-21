import { useEffect, useState } from "react";
import { Play, X } from "lucide-react";
import { cn } from "../lib/utils";

const slides = [
  {
    image: "/images/slides/11.png",
    title: "Welcome",
    subtitle: "Glorify. Grow. Go.",
  },
  {
    image: "/images/slides/21.jpg",
    title: "Join Us in Worship",
    subtitle: "Sundays at 9:00 AM",
  },
  {
    image: "/images/slides/31.jpg",
    title: "Grow in Faith",
    subtitle: "Discipleship. You. & I.",
  },
  {
    image: "/images/slides/41.png",
    title: "Serve Together",
    subtitle: "Finding purpose through service",
  },
  {
    image: "/images/slides/51.jpg",
    title: "Faith in Community",
    subtitle: "Growing together in Christ",
  },
];

const youtubeUrl =
  "https://www.youtube.com/embed/fxSB0h_iSkQ?si=DfszbDHV5myu-T99";

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentSlide((current) => (current + 1) % slides.length);
    }, 6000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!showVideo) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowVideo(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [showVideo]);

  return (
    <section className="home-hero" aria-label="Welcome to New Covenant Church">
      {slides.map((slide, index) => (
        <div
          className={cn("home-hero-slide", currentSlide === index && "active")}
          key={slide.title}
          aria-hidden={currentSlide !== index}
        >
          <div
            className="home-hero-image"
            style={{ backgroundImage: `url("${slide.image}")` }}
          />
          <div className="home-hero-overlay" />
          <div className="home-hero-content">
            <span className="eyebrow">FAITH · COMMUNITY · HOPE</span>
            <h1>{slide.title}</h1>
            <p>{slide.subtitle}</p>
            <div className="home-hero-actions">
              <button className="button" onClick={() => setShowVideo(true)}>
                Watch video <Play size={16} fill="currentColor" />
              </button>
            </div>
          </div>
        </div>
      ))}

      <div className="home-hero-dots" aria-label="Choose a slide">
        {slides.map((slide, index) => (
          <button
            key={slide.title}
            className={cn("home-hero-dot", currentSlide === index && "active")}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}: ${slide.title}`}
            aria-current={currentSlide === index ? "true" : undefined}
          />
        ))}
      </div>

      {showVideo && (
        <div
          className="video-modal"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowVideo(false);
          }}
        >
          <div
            className="video-modal-content"
            role="dialog"
            aria-modal="true"
            aria-label="Church video"
          >
            <button
              className="video-modal-close"
              onClick={() => setShowVideo(false)}
              aria-label="Close video"
            >
              <X />
            </button>
            <iframe
              src={youtubeUrl}
              title="New Covenant Church video"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </section>
  );
}
