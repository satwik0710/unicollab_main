export interface Profile {
    id: string;
    email: string;
    full_name: string;
    domain: string;
    year_of_study: string;
    bio: string;
    interests: string;
    skills: string[];
    portfolio_links: string[];
    avatar_url: string;
    created_at: string;
}

export interface ProjectRole {
    id: string;
    project_id: string;
    role_name: string;
    spots_total: number;
    spots_filled: number;
}

export interface TeamMember {
    id: string;
    project_id: string;
    member_id: string;
    role_id: string | null;
    role_in_team: string;
    joined_at: string;
    member: {
        id: string;
        email: string;
        full_name: string;
        avatar_url: string;
        domain: string;
    };
}

export interface Project {
    id: string;
    founder_id: string;
    title: string;
    tagline: string;
    description: string;
    problem_statement: string;
    goals: string;
    expected_outcome: string;
    domain: string;
    level: string;
    collaboration_mode: string;
    required_skills: string[];
    team_size_required: number;
    start_date: string | null;
    duration_weeks: number;
    status: string;
    created_at: string;
    founder: Profile;
    roles: ProjectRole[];
    teams: TeamMember[];
}
