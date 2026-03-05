"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import api from "@/lib/api"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { GraduationCap, MapPin, BookOpen, Briefcase, ExternalLink, ArrowLeft, Loader2, Link as LinkIcon } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

export default function PublicProfilePage() {
    const { userId } = useParams<{ userId: string }>()
    const [profileData, setProfileData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchProfile()
    }, [userId])

    const fetchProfile = async () => {
        try {
            console.log("Fetching profile for:", userId);
            const { data } = await api.get(`/users/profile/${userId}`);
            console.log("Profile data received:", data);
            setProfileData(data);
        } catch (error) {
            console.error(error)
            toast.error("Failed to load user profile")
        } finally {
            setLoading(false)
        }
    }

    // Calculate initials
    const getInitials = (name: string) => {
        if (!name) return "U"
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .substring(0, 2)
            .toUpperCase()
    }

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    // If profile is not found or null
    if (!profileData || !profileData.profile) {
        return (
            <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center space-y-4">
                <h2 className="text-2xl font-bold text-foreground">Profile Not Found</h2>
                <Link to="/marketplace" className="text-primary hover:underline">
                    Back to Marketplace
                </Link>
            </div>
        )
    }

    const { profile, founded_projects, team_projects } = profileData
    const name = profile.full_name || "Unknown User"
    const initials = getInitials(name)
    const domain = profile.domain || "No domain specified"
    const year = profile.year_of_study || "No year specified"
    const bio = profile.interests || "No bio available."
    const skills = profile.skills || []
    const portfolio = profile.portfolio_links || []

    return (
        <div className="mx-auto max-w-5xl space-y-6 pb-12 px-4 sm:px-6 mt-4">
            <Link
                to={-1 as any}
                className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-2"
                onClick={(e) => {
                    e.preventDefault();
                    window.history.back();
                }}
            >
                <ArrowLeft className="size-4" />
                Back
            </Link>

            {/* Profile Hero Card */}
            <div className="rounded-2xl bg-card border border-border p-8 shadow-sm">
                <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                    <Avatar className="size-32 bg-secondary text-secondary-foreground shrink-0 border-4 border-background shadow-lg">
                        <AvatarImage src={profile.avatar_url || ""} />
                        <AvatarFallback className="text-4xl font-bold bg-primary/10 text-primary">
                            {initials}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-4">
                        <div>
                            <h1 className="text-4xl font-bold text-card-foreground tracking-tight">{name}</h1>
                            <p className="text-primary/80 font-semibold mt-1.5 uppercase tracking-wider text-sm">{profile.role === 'founder' ? 'Founder' : 'Collaborator'}</p>
                        </div>

                        <p className="text-muted-foreground max-w-2xl text-[1.05rem] opacity-90 leading-relaxed">
                            {bio}
                        </p>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
                            <div className="flex items-center gap-2 text-card-foreground bg-secondary/50 px-3 py-1.5 rounded-lg border border-border/50 shadow-sm">
                                <Briefcase className="size-4 text-primary" />
                                <span className="text-sm font-medium">{domain}</span>
                            </div>
                            <div className="flex items-center gap-2 text-card-foreground bg-secondary/50 px-3 py-1.5 rounded-lg border border-border/50 shadow-sm">
                                <GraduationCap className="size-4 text-primary" />
                                <span className="text-sm font-medium">{year}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column - Details */}
                <div className="space-y-6 col-span-1">
                    {/* Skills Selection */}
                    <div className="rounded-2xl bg-card border border-border p-6 shadow-sm">
                        <h3 className="flex items-center gap-2 text-lg font-semibold text-card-foreground mb-4">
                            <BookOpen className="size-5 text-primary" />
                            Skills
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {skills.length > 0 ? (
                                skills.map((skill: string) => (
                                    <span
                                        key={skill}
                                        className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary uppercase tracking-wider border border-primary/20"
                                    >
                                        {skill}
                                    </span>
                                ))
                            ) : (
                                <span className="text-sm text-muted-foreground/70 italic">No skills listed</span>
                            )}
                        </div>
                    </div>

                    {/* Portfolio Selection */}
                    <div className="rounded-2xl bg-card border border-border p-6 shadow-sm">
                        <h3 className="flex items-center gap-2 text-lg font-semibold text-card-foreground mb-4">
                            <ExternalLink className="size-5 text-primary" />
                            Links
                        </h3>
                        <div className="space-y-3">
                            {portfolio.length > 0 ? (
                                portfolio.map((link: string, index: number) => (
                                    <a
                                        key={index}
                                        href={link.startsWith("http") ? link : `https://${link}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 rounded-xl border border-border/60 bg-secondary/20 p-3 transition-all hover:bg-secondary hover:border-border group"
                                    >
                                        <div className="bg-background rounded-md p-1.5 group-hover:scale-110 transition-transform">
                                            <ExternalLink className="size-4 text-primary" />
                                        </div>
                                        <span className="text-sm font-medium truncate group-hover:text-primary transition-colors">{link.replace(/^https?:\/\//, '')}</span>
                                    </a>
                                ))
                            ) : (
                                <span className="text-sm text-muted-foreground/70 italic">No links available</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column - Projects */}
                <div className="space-y-6 col-span-1 md:col-span-2">
                    {/* Founded Projects */}
                    <div className="rounded-2xl bg-card border border-border p-6 shadow-sm">
                        <h3 className="text-xl font-bold text-card-foreground mb-4 flex items-center gap-2">
                            <span className="text-primary">✦</span> Projects Founded
                        </h3>
                        {founded_projects && founded_projects.length > 0 ? (
                            <div className="grid gap-4 sm:grid-cols-2">
                                {founded_projects.map((project: any) => (
                                    <Link
                                        key={project.id}
                                        to={`/projects/${project.id}`}
                                        className="block p-5 rounded-xl border border-border bg-background hover:bg-secondary/40 hover:border-primary/30 transition-all group shadow-sm"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <Badge variant="outline" className="bg-secondary text-secondary-foreground text-xs font-semibold border-0">
                                                {project.domain}
                                            </Badge>
                                            <Badge className="bg-primary/20 text-primary border-0 text-[10px] tracking-wider">
                                                {project.status.toUpperCase()}
                                            </Badge>
                                        </div>
                                        <h4 className="font-bold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1 text-lg">{project.title}</h4>
                                        <p className="text-sm text-muted-foreground line-clamp-2">{project.tagline || 'No description provided.'}</p>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center rounded-xl border border-dashed border-border/60 bg-secondary/10">
                                <p className="text-muted-foreground font-medium">No projects founded yet.</p>
                            </div>
                        )}
                    </div>

                    {/* Team Projects */}
                    <div className="rounded-2xl bg-card border border-border p-6 shadow-sm">
                        <h3 className="text-xl font-bold text-card-foreground mb-4 flex items-center gap-2">
                            <span className="text-primary">✦</span> Associated Projects
                        </h3>
                        {team_projects && team_projects.length > 0 ? (
                            <div className="grid gap-4 sm:grid-cols-2">
                                {team_projects.map((project: any) => (
                                    <Link
                                        key={project.id}
                                        to={`/projects/${project.id}`}
                                        className="block p-5 rounded-xl border border-border bg-background hover:bg-secondary/40 hover:border-primary/30 transition-all group shadow-sm"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <Badge variant="outline" className="bg-secondary text-secondary-foreground text-xs font-semibold border-0">
                                                Role: {project.role_in_team || 'Member'}
                                            </Badge>
                                            <Badge className="bg-primary/20 text-primary border-0 text-[10px] tracking-wider">
                                                {project.status.toUpperCase()}
                                            </Badge>
                                        </div>
                                        <h4 className="font-bold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1 text-lg">{project.title}</h4>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center rounded-xl border border-dashed border-border/60 bg-secondary/10">
                                <p className="text-muted-foreground font-medium">Hasn't joined any project teams yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
