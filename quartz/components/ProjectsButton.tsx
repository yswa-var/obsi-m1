import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { useMemo } from "preact/hooks"

interface ProjectsButtonOptions {
  text?: string
  variant?: "primary" | "secondary" | "outline" | "ghost"
  size?: "sm" | "md" | "lg"
  centered?: boolean
  fullWidth?: boolean
  showIcon?: boolean
  showCount?: boolean
}

const defaultOptions: ProjectsButtonOptions = {
  text: "Projects",
  variant: "primary",
  size: "md",
  centered: true,
  fullWidth: false,
  showIcon: true,
  showCount: true,
}

export default ((userOpts?: Partial<ProjectsButtonOptions>) => {
  const opts: ProjectsButtonOptions = { ...defaultOptions, ...userOpts }

  const ProjectsButton: QuartzComponent = ({ allFiles }: QuartzComponentProps) => {
    const projectsCount = useMemo(() => {
      const projectsFile = allFiles.find(file => file.slug === "projects")
      if (!projectsFile) return 0

      const content = projectsFile.text
      if (!content) return 0
      
      const lines = content.split('\n')
      let count = 0
      
      for (const line of lines) {
        if (line.includes('|') && !line.includes('|----|') && !line.includes('| id |')) {
          count++
        }
      }
      
      return count
    }, [allFiles])

    const getButtonClasses = () => {
      const baseClasses = ["projects-button"]
      
      if (opts.variant) baseClasses.push(`projects-button--${opts.variant}`)
      if (opts.size) baseClasses.push(`projects-button--${opts.size}`)
      if (opts.centered) baseClasses.push("projects-button--centered")
      if (opts.fullWidth) baseClasses.push("projects-button--full-width")
      
      return baseClasses.join(" ")
    }

    return (
      <div class="projects-button-container">
        <a href="./projects" class={getButtonClasses()}>
          {opts.showIcon && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="projects-button-icon"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15,3 21,3 21,9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          )}
          <span class="projects-button-text">{opts.text}</span>
          {opts.showCount && projectsCount > 0 && (
            <span class="projects-button-count">{projectsCount}</span>
          )}
          <div class="projects-button-ripple"></div>
        </a>
      </div>
    )
  }

  ProjectsButton.css = `
    .projects-button-container {
      display: flex;
      justify-content: ${opts.centered ? 'center' : 'flex-start'};
      width: ${opts.fullWidth ? '100%' : 'auto'};
    }

    .projects-button {
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem 1.5rem;
      font-size: 1rem;
      font-weight: 600;
      text-decoration: none;
      border-radius: 0.75rem;
      border: 2px solid transparent;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      min-width: 140px;
      justify-content: center;
    }

    .projects-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      text-decoration: none;
    }

    .projects-button:active {
      transform: translateY(0);
    }

    .projects-button-icon {
      transition: transform 0.3s ease;
    }

    .projects-button:hover .projects-button-icon {
      transform: scale(1.1) rotate(5deg);
    }

    .projects-button-text {
      font-weight: 600;
      letter-spacing: 0.025em;
    }

    .projects-button-count {
      background: rgba(255, 255, 255, 0.2);
      color: inherit;
      padding: 0.25rem 0.5rem;
      border-radius: 0.5rem;
      font-size: 0.8rem;
      font-weight: 700;
      min-width: 1.5rem;
      text-align: center;
      backdrop-filter: blur(4px);
    }

    .projects-button-ripple {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      transform: translate(-50%, -50%);
      transition: width 0.6s, height 0.6s;
      pointer-events: none;
    }

    .projects-button:hover .projects-button-ripple {
      width: 300px;
      height: 300px;
    }

    /* Primary Variant */
    .projects-button--primary {
      background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
      color: white;
      border-color: #3b82f6;
    }

    .projects-button--primary:hover {
      background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
      border-color: #2563eb;
    }

    /* Secondary Variant */
    .projects-button--secondary {
      background: linear-gradient(135deg, #6b7280 0%, #9ca3af 100%);
      color: white;
      border-color: #6b7280;
    }

    .projects-button--secondary:hover {
      background: linear-gradient(135deg, #4b5563 0%, #6b7280 100%);
      border-color: #4b5563;
    }

    /* Outline Variant */
    .projects-button--outline {
      background: transparent;
      color: var(--text-normal);
      border-color: var(--border);
    }

    .projects-button--outline:hover {
      background: var(--secondary);
      border-color: var(--accent);
      color: var(--accent);
    }

    /* Ghost Variant */
    .projects-button--ghost {
      background: transparent;
      color: var(--text-normal);
      border-color: transparent;
      box-shadow: none;
    }

    .projects-button--ghost:hover {
      background: var(--secondary);
      border-color: var(--border);
    }

    /* Size Variants */
    .projects-button--sm {
      padding: 0.625rem 1.25rem;
      font-size: 0.875rem;
      min-width: 120px;
    }

    .projects-button--sm .projects-button-icon {
      width: 16px;
      height: 16px;
    }

    .projects-button--lg {
      padding: 1.125rem 2rem;
      font-size: 1.125rem;
      min-width: 160px;
    }

    .projects-button--lg .projects-button-icon {
      width: 24px;
      height: 24px;
    }

    /* Centered Variant */
    .projects-button--centered {
      justify-content: center;
    }

    /* Full Width Variant */
    .projects-button--full-width {
      width: 100%;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .projects-button {
        padding: 0.75rem 1.25rem;
        font-size: 0.9rem;
        min-width: 120px;
      }
      
      .projects-button-icon {
        width: 18px;
        height: 18px;
      }
      
      .projects-button-count {
        font-size: 0.75rem;
        padding: 0.2rem 0.4rem;
      }
    }

    /* Dark mode adjustments */
    @media (prefers-color-scheme: dark) {
      .projects-button--outline {
        border-color: var(--border);
        color: var(--text-normal);
      }
      
      .projects-button--outline:hover {
        background: var(--tertiary);
        border-color: var(--accent);
        color: var(--accent);
      }
    }
  `

  return ProjectsButton
}) satisfies QuartzComponentConstructor
