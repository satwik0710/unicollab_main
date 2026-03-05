import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, User, ArrowLeft, Calendar, Share2, Bookmark, Clock, CheckCircle2 } from "lucide-react"
import api from "@/lib/api"
import { toast } from "sonner"
import type { Project, TeamMember, ProjectRole } from "@/types/project"
import { JoinRequestModal } from "@/components/project/JoinRequestModal"
import { SimilarProjectsCarousel } from "@/components/project/SimilarProjectsCarousel"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"

export default function ProjectDescriptionPage() {
    const { projectId } = useParams<{ projectId: string }>()
    const [project, setProject] = useState<Project | null>(null)
    const [loading, setLoading] = useState(true)
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false)
    const currentUserId = localStorage.getItem("user_id") || ""

    useEffect(() => {
        fetchProject()
    }, [projectId])

    const fetchProject = async () => {
        if (!projectId) return
        setLoading(true)
        try {
            const { data } = await api.get(`/projects/${projectId}`)
            setProject(data)
        } catch (error) {
            console.error(error)
            toast.error("Failed to load project details")
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
                <p className="text-muted-foreground animate-pulse">Loading project details...</p>
            </div>
        )
    }

    if (!project) {
        return (
            <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center space-y-4">
                <h2 className="text-2xl font-bold text-foreground">Project Not Found</h2>
                <Link to="/marketplace">
                    <Button>Back to Marketplace</Button>
                </Link>
            </div>
        )
    }

    const currentMembers = project.teams ? project.teams.length : 0

    // Calculate open slots for the team grid
    const teamSize = project.team_size_required || 4 // Fallback if old project
    const openSlotsCount = Math.max(0, teamSize - currentMembers)
    const emptySlotsArray = Array.from({ length: openSlotsCount })

    // Safely parse required skills
    let parsedSkills: string[] = []
    if (project.required_skills) {
        if (Array.isArray(project.required_skills)) {
            parsedSkills = project.required_skills
        } else if (typeof project.required_skills === "string") {
            try {
                // Sometimes it's a JSON string
                parsedSkills = JSON.parse(project.required_skills)
            } catch (e) {
                // Or a comma separated string
                parsedSkills = (project.required_skills as string).split(", ")
            }
        }
    }

    return (
        <div className="mx-auto max-w-7xl w-full p-6 space-y-8">

            <Link
                to="/marketplace"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
                <ArrowLeft className="size-4" />
                Back to Marketplace
            </Link>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Main Content Area */}
                <div className="flex-1 space-y-8">

                    {/* 2) Project Hero Card */}
                    <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="space-y-4">
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge className="bg-primary/20 text-primary border-0 hover:bg-primary/20">
                                        {project.status.toUpperCase()}
                                    </Badge>
                                    <Badge variant="outline" className="border-border text-muted-foreground">
                                        {project.domain}
                                    </Badge>
                                    {project.level && (
                                        <Badge variant="outline" className="border-border text-muted-foreground hidden sm:inline-flex">
                                            {project.level} Level
                                        </Badge>
                                    )}
                                </div>

                                <div>
                                    <h1 className="text-3xl font-bold text-card-foreground tracking-tight sm:text-4xl">
                                        {project.title}
                                    </h1>
                                    <p className="mt-2 text-lg text-muted-foreground">
                                        {project.tagline || project.description.substring(0, 100) + '...'}
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1.5">
                                        <Users className="size-4" />
                                        <span>{currentMembers} / {project.team_size_required} Members</span>
                                    </div>
                                    {project.collaboration_mode && (
                                        <div className="flex items-center gap-1.5 hidden sm:flex">
                                            <CheckCircle2 className="size-4" />
                                            <span>{project.collaboration_mode}</span>
                                        </div>
                                    )}
                                    {project.duration_weeks && (
                                        <div className="flex items-center gap-1.5 hidden sm:flex">
                                            <Clock className="size-4" />
                                            <span>{project.duration_weeks} Weeks</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col sm:items-end gap-3 shrink-0 mt-2 sm:mt-0">
                                {project.founder_id !== currentUserId && (
                                    <Button
                                        className="w-full sm:w-auto bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold"
                                        onClick={() => setIsJoinModalOpen(true)}
                                    >
                                        Request to Join
                                    </Button>
                                )}
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                                        <Bookmark className="size-4 mr-2" />
                                        Save Project
                                    </Button>
                                    <Button variant="ghost" size="sm" className="flex-1 sm:flex-none">
                                        <Share2 className="size-4 mr-2" />
                                        Share
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3) About This Project */}
                    <div className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-6">
                        <div>
                            <h3 className="text-xl font-semibold text-card-foreground mb-3">About the Project</h3>
                            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                {project.description}
                            </p>
                        </div>

                        {project.problem_statement && (
                            <div>
                                <h4 className="font-medium text-card-foreground mb-2">Problem Statement</h4>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    {project.problem_statement}
                                </p>
                            </div>
                        )}

                        {project.goals && (
                            <div>
                                <h4 className="font-medium text-card-foreground mb-2">Goals</h4>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    {project.goals}
                                </p>
                            </div>
                        )}

                        {project.expected_outcome && (
                            <div>
                                <h4 className="font-medium text-card-foreground mb-2">Expected Outcome</h4>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    {project.expected_outcome}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* 4) Skills Required & 5) Open Roles */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="rounded-2xl border border-border bg-card p-6">
                            <h3 className="text-lg font-semibold text-card-foreground mb-4">Skills Required</h3>
                            <div className="flex flex-wrap gap-2">
                                {parsedSkills.map((skill, index) => (
                                    <Badge key={index} variant="secondary" className="px-3 py-1 bg-secondary text-secondary-foreground">
                                        {skill}
                                    </Badge>
                                ))}
                                {parsedSkills.length === 0 && (
                                    <p className="text-sm text-muted-foreground">No specific skills listed.</p>
                                )}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-border bg-card p-6">
                            <h3 className="text-lg font-semibold text-card-foreground mb-4">Open Roles</h3>
                            {project.roles && project.roles.length > 0 ? (
                                <div className="space-y-4">
                                    {project.roles.map((role) => (
                                        <div key={role.id} className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="font-medium text-card-foreground">{role.role_name}</span>
                                                <span className="text-muted-foreground text-xs">
                                                    {role.spots_filled} / {role.spots_total} filled
                                                </span>
                                            </div>
                                            <Progress value={(role.spots_filled / role.spots_total) * 100} className="h-2" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full min-h-[80px]">
                                    <p className="text-sm text-muted-foreground">General collaborators needed.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 6) The Team Section */}
                    <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold text-card-foreground">The Team</h3>
                            <Badge variant="outline" className="font-normal text-muted-foreground">
                                {currentMembers} / {project.team_size_required}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                            {/* Founder Card */}
                            <Link to={`/profile/${project.founder_id}`} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors">
                                <Avatar className="size-12 border-2 border-primary/20">
                                    <AvatarImage src={project.founder?.avatar_url || ""} />
                                    <AvatarFallback className="bg-primary/10 text-primary">
                                        {project.founder?.full_name?.charAt(0) || "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 overflow-hidden">
                                    <h4 className="font-medium text-card-foreground truncate group-hover:text-primary transition-colors">
                                        {project.founder?.full_name || "Unknown"}
                                    </h4>
                                    <p className="text-xs text-primary font-medium mt-0.5">Project Founder</p>
                                </div>
                            </Link>

                            {/* Joined Members */}
                            {project.teams?.map((teamMember) => (
                                <Link key={teamMember.id} to={`/profile/${teamMember.member_id}`} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors">
                                    <Avatar className="size-12">
                                        <AvatarImage src={teamMember.member?.avatar_url || ""} />
                                        <AvatarFallback className="bg-secondary text-muted-foreground">
                                            {teamMember.member?.full_name?.charAt(0) || "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 overflow-hidden">
                                        <h4 className="font-medium text-card-foreground truncate group-hover:text-primary transition-colors">
                                            {teamMember.member?.full_name || "Unknown User"}
                                        </h4>
                                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                            {teamMember.role_in_team || "Collaborator"}
                                        </p>
                                    </div>
                                </Link>
                            ))}

                            {/* Empty Slots */}
                            {emptySlotsArray.map((_, index) => (
                                <div
                                    key={`empty-${index}`}
                                    className="flex items-center justify-center gap-3 p-4 rounded-xl border-2 border-dashed border-border bg-background/50 text-muted-foreground transition-colors hover:bg-secondary/20 hover:text-foreground hover:border-muted-foreground cursor-pointer"
                                    onClick={() => setIsJoinModalOpen(true)}
                                >
                                    <User className="size-5" />
                                    <span className="font-medium text-sm">Open Position</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 7) Similar Projects Carousel */}
                    <SimilarProjectsCarousel projectId={project.id} />

                </div>

                {/* 8) Creator Details Sidebar */}
                <div className="lg:w-[320px] shrink-0">
                    <div className="sticky top-6 rounded-2xl border border-border bg-card p-6">
                        <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">
                            Project Founder
                        </h3>

                        <div className="flex flex-col items-center text-center">
                            <Avatar className="size-24 border-4 border-background shadow-xl mb-4">
                                <AvatarImage src={project.founder?.avatar_url || ""} />
                                <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                                    {project.founder?.full_name?.charAt(0) || "U"}
                                </AvatarFallback>
                            </Avatar>

                            <h4 className="text-xl font-bold text-card-foreground">
                                {project.founder?.full_name || "Unknown User"}
                            </h4>

                            <p className="text-sm text-muted-foreground mt-1">
                                {project.founder?.domain || "Unknown Domain"}
                                {project.founder?.year_of_study && ` • ${project.founder.year_of_study}`}
                            </p>

                            {project.founder?.bio && (
                                <p className="text-sm text-card-foreground/80 mt-4 line-clamp-3">
                                    "{project.founder.bio}"
                                </p>
                            )}

                            {project.founder?.skills && project.founder.skills.length > 0 && (
                                <div className="flex flex-wrap items-center justify-center gap-1.5 mt-5">
                                    {project.founder.skills.slice(0, 4).map((skill, index) => (
                                        <span key={index} className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full text-[10px] font-medium uppercase tracking-wide">
                                            {skill}
                                        </span>
                                    ))}
                                    {project.founder.skills.length > 4 && (
                                        <span className="px-2 py-0.5 bg-secondary/50 text-muted-foreground rounded-full text-[10px] font-medium">
                                            +{project.founder.skills.length - 4}
                                        </span>
                                    )}
                                </div>
                            )}

                            <div className="w-full space-y-3 mt-6 pt-6 border-t border-border">
                                <Button asChild className="w-full bg-primary hover:bg-primary/90">
                                    <Link to={`/profile/${project.founder_id}`}>View Full Profile</Link>
                                </Button>
                                <Button variant="outline" className="w-full">
                                    Message Founder
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <JoinRequestModal
                projectId={project.id}
                isOpen={isJoinModalOpen}
                onClose={() => setIsJoinModalOpen(false)}
            />
        </div>
    )
}
