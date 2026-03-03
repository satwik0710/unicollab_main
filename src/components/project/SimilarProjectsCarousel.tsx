import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Users, Eye } from "lucide-react"
import { Link } from "react-router-dom"
import api from "@/lib/api"
import type { Project } from "@/types/project"

interface SimilarProjectsProps {
    projectId: string
}

export function SimilarProjectsCarousel({ projectId }: SimilarProjectsProps) {
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!projectId) return

        const fetchSimilar = async () => {
            try {
                const { data } = await api.get(`/projects/similar/${projectId}`)
                setProjects(data)
            } catch (error) {
                console.error("Failed to fetch similar projects", error)
            } finally {
                setLoading(false)
            }
        }

        fetchSimilar()
    }, [projectId])

    if (loading || projects.length === 0) {
        return null
    }

    return (
        <div className="mt-12">
            <h2 className="text-xl font-bold text-foreground mb-6">Similar Projects</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
                {projects.map((project) => {
                    let skills: string[] = []
                    if (project.required_skills) {
                        skills = project.required_skills
                    }
                    const currentMembers = project.teams ? project.teams.length : 0

                    return (
                        <div
                            key={project.id}
                            className="group flex min-w-[300px] max-w-[320px] flex-col rounded-2xl bg-card p-5 transition-transform hover:-translate-y-0.5 snap-start shrink-0"
                        >
                            <div className="flex items-start justify-between">
                                <Badge
                                    className={
                                        project.status === "recruiting"
                                            ? "border-0 bg-accent/20 text-accent"
                                            : "border-0 bg-primary/20 text-primary"
                                    }
                                >
                                    {project.status.toUpperCase()}
                                </Badge>
                                <span className="text-xs text-card-foreground/50">{project.domain}</span>
                            </div>
                            <h3 className="mt-3 font-semibold text-card-foreground text-balance">
                                {project.title}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1">
                                by {project.founder?.full_name || "Unknown"}
                            </p>
                            <p className="mt-2.5 flex-1 text-sm text-card-foreground/70 line-clamp-2 leading-relaxed">
                                {project.description}
                            </p>
                            <div className="mt-4 flex flex-wrap gap-1.5">
                                {skills.slice(0, 3).map((skill) => (
                                    <span
                                        key={skill}
                                        className="rounded-lg bg-secondary px-2 py-0.5 text-xs text-muted-foreground"
                                    >
                                        {skill}
                                    </span>
                                ))}
                                {skills.length > 3 && (
                                    <span className="rounded-lg bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                                        +{skills.length - 3}
                                    </span>
                                )}
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-xs text-card-foreground/70">
                                    <Users className="size-3.5" />
                                    <span>
                                        {currentMembers}/{project.team_size_required}
                                    </span>
                                </div>
                                <Link
                                    to={`/projects/${project.id}`}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground transition-colors hover:bg-accent/90"
                                >
                                    <Eye className="size-3" />
                                    View Project
                                </Link>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
