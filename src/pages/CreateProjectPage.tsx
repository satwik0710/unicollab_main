import { useState } from "react"
import { domains, allSkills } from "@/lib/data"
import { ArrowLeft, X, Plus } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import api from "@/lib/api"
import { toast } from "sonner"

export default function CreateProjectPage() {
  const navigate = useNavigate()
  const [title, setTitle] = useState("")
  const [tagline, setTagline] = useState("")
  const [description, setDescription] = useState("")
  const [problemStatement, setProblemStatement] = useState("")
  const [goals, setGoals] = useState("")
  const [expectedOutcome, setExpectedOutcome] = useState("")
  const [domain, setDomain] = useState("")
  const [level, setLevel] = useState("Beginner")
  const [collaborationMode, setCollaborationMode] = useState("Remote")
  const [durationWeeks, setDurationWeeks] = useState("4")
  const [teamSize, setTeamSize] = useState("3")

  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState("")
  const [showSkillDropdown, setShowSkillDropdown] = useState(false)
  const [loading, setLoading] = useState(false)

  const filteredSkills = allSkills.filter(
    (s) =>
      s.toLowerCase().includes(skillInput.toLowerCase()) &&
      !selectedSkills.includes(s)
  )

  const addSkill = (skill: string) => {
    setSelectedSkills([...selectedSkills, skill])
    setSkillInput("")
    setShowSkillDropdown(false)
  }

  const removeSkill = (skill: string) => {
    setSelectedSkills(selectedSkills.filter((s) => s !== skill))
  }

  const handleSubmit = async () => {
    if (!title || !description || !domain || !tagline || selectedSkills.length === 0) {
      toast.error("Please fill in all required fields (marked with *)")
      return
    }

    setLoading(true)
    try {
      await api.post("/projects/create", {
        title,
        tagline: tagline || "A new uncollaboration project",
        description,
        problem_statement: problemStatement || "N/A",
        goals: goals || "N/A",
        expected_outcome: expectedOutcome || "N/A",
        domain,
        level,
        collaboration_mode: collaborationMode,
        required_skills: selectedSkills,
        team_size_required: parseInt(teamSize) || 1,
        duration_weeks: parseInt(durationWeeks) || 1
      })
      toast.success("Project created successfully!")
      navigate("/marketplace")
    } catch (error: any) {
      console.error(error)
      toast.error(error.response?.data?.detail || "Failed to create project")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/projects"
          className="flex size-9 items-center justify-center rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Create New Project</h1>
          <p className="text-sm text-muted-foreground">
            Fill in the details to list your project on the marketplace
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-2xl bg-card p-6 md:p-8 space-y-8">

        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">Basic Information</h3>

          {/* Project Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-card-foreground">
              Project Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your project title"
              className="h-10 w-full rounded-xl border border-border bg-secondary px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Tagline */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-card-foreground">
              Tagline (Short Summary) *
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="A catchy one-liner for your project"
              className="h-10 w-full rounded-xl border border-border bg-secondary px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Domain & Level */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-card-foreground">Domain *</label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="h-10 w-full rounded-xl border border-border bg-secondary px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
              >
                <option value="">Select a domain</option>
                {domains.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-card-foreground">Experience Level *</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="h-10 w-full rounded-xl border border-border bg-secondary px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">Project Details</h3>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-card-foreground">
              Detailed Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your project comprehensively..."
              rows={4}
              className="w-full rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none leading-relaxed"
            />
          </div>

          {/* Problem Statement */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-card-foreground">
              Problem Statement
            </label>
            <textarea
              value={problemStatement}
              onChange={(e) => setProblemStatement(e.target.value)}
              placeholder="What problem does this project solve?"
              rows={2}
              className="w-full rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none leading-relaxed"
            />
          </div>

          {/* Goals */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-card-foreground">
              Goals
            </label>
            <textarea
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              placeholder="What are the main milestones or goals?"
              rows={2}
              className="w-full rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none leading-relaxed"
            />
          </div>

          {/* Expected Outcome */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-card-foreground">
              Expected Outcome / Deliverable
            </label>
            <textarea
              value={expectedOutcome}
              onChange={(e) => setExpectedOutcome(e.target.value)}
              placeholder="What is the final product or result?"
              rows={2}
              className="w-full rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none leading-relaxed"
            />
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">Logistics & Team</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Team Size */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-card-foreground">Team Size *</label>
              <input
                type="number"
                min={2}
                max={20}
                value={teamSize}
                onChange={(e) => setTeamSize(e.target.value)}
                className="h-10 w-full rounded-xl border border-border bg-secondary px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-card-foreground">Duration (Weeks) *</label>
              <input
                type="number"
                min={1}
                max={52}
                value={durationWeeks}
                onChange={(e) => setDurationWeeks(e.target.value)}
                className="h-10 w-full rounded-xl border border-border bg-secondary px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Collaboration Mode */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-card-foreground">Collaboration *</label>
              <select
                value={collaborationMode}
                onChange={(e) => setCollaborationMode(e.target.value)}
                className="h-10 w-full rounded-xl border border-border bg-secondary px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
              >
                <option value="Remote">Remote</option>
                <option value="In-Person">In-Person</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          {/* Required Skills */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-card-foreground">
              Required Skills *
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {selectedSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 rounded-lg bg-primary/20 px-2.5 py-1 text-xs text-primary"
                >
                  {skill}
                  <button onClick={() => removeSkill(skill)} className="hover:text-accent">
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="relative">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => {
                  setSkillInput(e.target.value)
                  setShowSkillDropdown(true)
                }}
                onFocus={() => setShowSkillDropdown(true)}
                placeholder="Type to search skills..."
                className="h-10 w-full rounded-xl border border-border bg-secondary px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {showSkillDropdown && filteredSkills.length > 0 && (
                <div className="absolute top-full left-0 z-10 mt-1 w-full rounded-xl border border-border bg-popover p-1 shadow-lg max-h-40 overflow-y-auto">
                  {filteredSkills.map((skill) => (
                    <button
                      key={skill}
                      onClick={() => addSkill(skill)}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-popover-foreground hover:bg-secondary transition-colors"
                    >
                      <Plus className="size-3" />
                      {skill}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full rounded-xl bg-accent py-3 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90 disabled:opacity-50"
          >
            {loading ? "Creating Project..." : "List Project on Marketplace"}
          </button>
        </div>
      </div>
    </div>
  )
}
