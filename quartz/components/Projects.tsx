import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { useMemo, useState } from "preact/hooks"

interface Project {
  id: string
  name: string
  github_link: string
  description?: string
  tags?: string[]
  stars?: string
}

interface Options {
  title?: string
}

const defaultOptions: Options = {
  title: "Projects",
}

export default ((userOpts?: Partial<Options>) => {
  const opts: Options = { ...defaultOptions, ...userOpts }

  const Projects: QuartzComponent = ({ allFiles }: QuartzComponentProps) => {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedTag, setSelectedTag] = useState<string | null>(null)
    
    const projects = useMemo(() => {
      // Find the projects.md file
      const projectsFile = allFiles.find(file => file.slug === "projects")
      if (!projectsFile) return []

      // Parse the markdown content to extract table data
      const content = projectsFile.text
      if (!content) return []
      
      const lines = content.split('\n')
      
      // Find the table section
      let inTable = false
      let tableLines: string[] = []
      
      for (const line of lines) {
        if (line.includes('| id | name | github_link |')) {
          inTable = true
          continue
        }
        if (inTable && line.trim() === '') {
          break
        }
        if (inTable && line.includes('|')) {
          tableLines.push(line)
        }
      }

      // Parse table rows (skip header separator line)
      const projects: Project[] = []
      for (let i = 1; i < tableLines.length; i++) {
        const line = tableLines[i]
        if (line.includes('|----|')) continue // Skip separator line
        
        const columns = line.split('|').map(col => col.trim()).filter(col => col)
        if (columns.length >= 3) {
          // Validate that the github_link is a valid URL
          try {
            new URL(columns[2])
            const project: Project = {
              id: columns[0],
              name: columns[1],
              github_link: columns[2]
            }
            
            // Add optional fields if they exist
            if (columns[3]) project.description = columns[3]
            if (columns[4]) project.tags = columns[4].split(',').map(tag => tag.trim())
            if (columns[5]) project.stars = columns[5]
            
            projects.push(project)
          } catch {
            // Skip invalid URLs
            console.warn(`Invalid URL in projects table: ${columns[2]}`)
          }
        }
      }

      return projects
    }, [allFiles])

    // Filter projects based on search and tag selection
    const filteredProjects = useMemo(() => {
      return projects.filter(project => {
        const matchesSearch = searchTerm === "" || 
          project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
        
        const matchesTag = selectedTag === null || 
          (project.tags && project.tags.includes(selectedTag))
        
        return matchesSearch && matchesTag
      })
    }, [projects, searchTerm, selectedTag])

    // Get all unique tags for filtering
    const allTags = useMemo(() => {
      const tags = new Set<string>()
      projects.forEach(project => {
        if (project.tags) {
          project.tags.forEach(tag => tags.add(tag))
        }
      })
      return Array.from(tags).sort()
    }, [projects])

    if (projects.length === 0) {
      return null
    }

    return (
      <div class="projects">
        <h3>{opts.title}</h3>
        
        {/* Search and Filter Controls */}
        <div class="projects-controls">
          <div class="search-container">
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onInput={(e) => setSearchTerm((e.target as HTMLInputElement).value)}
              class="search-input"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="search-icon"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          
          {allTags.length > 0 && (
            <div class="tag-filters">
              <button
                class={`tag-filter ${selectedTag === null ? 'active' : ''}`}
                onClick={() => setSelectedTag(null)}
              >
                All
              </button>
              {allTags.map(tag => (
                <button
                  key={tag}
                  class={`tag-filter ${selectedTag === tag ? 'active' : ''}`}
                  onClick={() => setSelectedTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        <div class="projects-list">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
            <div key={project.id} class="project-item">
              <a 
                href={project.github_link} 
                target="_blank" 
                rel="noopener noreferrer"
                class="project-link"
                title={`View ${project.name} on GitHub`}
              >
                <div class="project-info">
                  <div class="project-header">
                    <span class="project-name">{project.name}</span>
                    {project.stars && (
                      <span class="project-stars">
                        ⭐ {project.stars}
                      </span>
                    )}
                  </div>
                  <span class="project-id">#{project.id}</span>
                  {project.description && (
                    <span class="project-description">{project.description}</span>
                  )}
                  {project.tags && project.tags.length > 0 && (
                    <div class="project-tags">
                      {project.tags.map((tag, index) => (
                        <span key={index} class="project-tag">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div class="project-actions">
                  <span class="github-button">Github</span>
                </div>
              </a>
            </div>
          ))
          ) : (
            <div class="no-results">
              <div class="no-results-icon">🔍</div>
              <div class="no-results-text">
                <h4>No projects found</h4>
                <p>Try adjusting your search or filter criteria</p>
              </div>
            </div>
          )}
        </div>
        {projects.length > 0 && (
          <div class="projects-footer">
            <span class="projects-count">
              {filteredProjects.length} of {projects.length} project{projects.length !== 1 ? 's' : ''} shown
              {searchTerm && ` for "${searchTerm}"`}
              {selectedTag && ` in ${selectedTag}`}
            </span>
          </div>
        )}
      </div>
    )
  }

  Projects.css = `
    .projects {
      margin-top: 1rem;
      padding: 1rem;
      border-radius: 0.5rem;
      background: linear-gradient(135deg, var(--secondary) 0%, var(--tertiary) 100%);
      border: 1px solid var(--border);
      box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1);
      position: relative;
      overflow: hidden;
      animation: slideInUp 0.6s ease-out;
    }

    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .projects::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899);
      border-radius: 0.75rem 0.75rem 0 0;
    }

    .projects h3 {
      margin: 0 0 0.75rem 0;
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-normal);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .projects h3::before {
      content: "🚀";
      font-size: 1rem;
      filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
      animation: rocketPulse 2s ease-in-out infinite;
    }

    @keyframes rocketPulse {
      0%, 100% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.1);
      }
    }

    .projects-controls {
      margin-bottom: 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .search-container {
      position: relative;
      width: 100%;
    }

    .search-input {
      width: 100%;
      padding: 0.5rem 0.75rem 0.5rem 2rem;
      border: 1px solid var(--border);
      border-radius: 0.375rem;
      background: var(--background);
      color: var(--text-normal);
      font-size: 0.85rem;
      transition: all 0.2s ease;
      outline: none;
    }

    .search-input:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .search-input::placeholder {
      color: var(--text-muted);
      opacity: 0.7;
    }

    .search-icon {
      position: absolute;
      left: 0.5rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
      opacity: 0.6;
    }

    .tag-filters {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .tag-filter {
      padding: 0.375rem 0.5rem;
      border: 1px solid var(--border);
      border-radius: 0.25rem;
      background: var(--background);
      color: var(--text-normal);
      font-size: 0.75rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      outline: none;
    }

    .tag-filter:hover {
      background: var(--secondary);
      border-color: var(--accent);
    }

    .tag-filter.active {
      background: var(--accent);
      color: white;
      border-color: var(--accent);
    }

    .projects-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .project-item {
      border-radius: 0.375rem;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid var(--border);
      background: var(--background);
      overflow: hidden;
      position: relative;
    }

    .project-item::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, transparent 0%, rgba(59, 130, 246, 0.05) 100%);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .project-item:hover {
      background: var(--tertiary);
      border-color: var(--accent);
      transform: translateY(-2px);
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }

    .project-item:hover::before {
      opacity: 1;
    }

    .project-link {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem;
      text-decoration: none;
      color: var(--text-normal);
      border-radius: 0.375rem;
      transition: all 0.3s ease;
      position: relative;
      z-index: 1;
    }

    .project-link:hover {
      text-decoration: none;
      color: var(--text-normal);
    }

    .project-info {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
      flex: 1;
    }

    .project-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
    }

    .project-name {
      font-weight: 600;
      font-size: 0.9rem;
      color: var(--text-normal);
      line-height: 1.3;
      flex: 1;
    }

    .project-stars {
      font-size: 0.75rem;
      color: var(--accent);
      font-weight: 500;
      background: rgba(59, 130, 246, 0.1);
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      white-space: nowrap;
    }

    .project-description {
      font-size: 0.75rem;
      color: var(--text-muted);
      line-height: 1.3;
      opacity: 0.9;
      font-style: italic;
    }

    .project-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.2rem;
      margin-top: 0.2rem;
    }

    .project-tag {
      font-size: 0.65rem;
      color: var(--text-muted);
      background: var(--secondary);
      padding: 0.15rem 0.3rem;
      border-radius: 0.2rem;
      border: 1px solid var(--border);
      font-family: var(--font-mono);
      transition: all 0.2s ease;
    }

    .project-tag:hover {
      background: var(--accent);
      color: white;
      transform: scale(1.05);
    }

    .project-id {
      font-size: 0.7rem;
      color: var(--text-muted);
      opacity: 0.9;
      font-family: var(--font-mono);
      background: var(--secondary);
      padding: 0.2rem 0.4rem;
      border-radius: 0.2rem;
      display: inline-block;
      width: fit-content;
    }

    .project-actions {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      flex-shrink: 0;
    }

    .github-button {
      font-size: 0.7rem;
      font-weight: 600;
      color: var(--accent);
      background: rgba(59, 130, 246, 0.1);
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      border: 1px solid var(--accent);
      transition: all 0.2s ease;
      white-space: nowrap;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }

    .project-link:hover .github-button {
      background: var(--accent);
      color: white;
      transform: scale(1.05);
    }

    .projects-footer {
      margin-top: 0.75rem;
      padding-top: 0.75rem;
      border-top: 1px solid var(--border);
      text-align: center;
    }

    .projects-count {
      font-size: 0.7rem;
      color: var(--text-muted);
      opacity: 0.8;
      font-style: italic;
    }

    .no-results {
      text-align: center;
      padding: 2rem 1rem;
      color: var(--text-muted);
    }

    .no-results-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
      opacity: 0.6;
    }

    .no-results-text h4 {
      margin: 0 0 0.5rem 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--text-normal);
    }

    .no-results-text p {
      margin: 0;
      font-size: 0.9rem;
      opacity: 0.8;
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .projects {
        margin-top: 1rem;
        padding: 1rem;
      }
      
      .projects h3 {
        font-size: 1.1rem;
      }
      
      .project-link {
        padding: 0.875rem;
      }
      
      .project-name {
        font-size: 0.95rem;
      }
    }

    /* Ensure dark mode looks great by default */
    :root {
      color-scheme: dark;
    }
  `

  return Projects
}) satisfies QuartzComponentConstructor
