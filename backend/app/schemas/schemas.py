from pydantic import BaseModel, EmailStr, UUID4
from typing import Optional, List, Any
from datetime import datetime
from app.models.models import UserRole, ProjectStatus, RequestStatus

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Profile Schemas
class ProfileBase(BaseModel):
    full_name: Optional[str] = None
    role: Optional[str] = None
    domain: Optional[str] = None
    skills: Optional[List[str]] = None
    interests: Optional[str] = None
    year_of_study: Optional[str] = None
    portfolio_links: Optional[List[str]] = None
    avatar_url: Optional[str] = None

class ProfileCreate(ProfileBase):
    pass

class ProfileUpdate(ProfileBase):
    pass

class Profile(ProfileBase):
    id: UUID4
    email: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    role: Optional[UserRole] = UserRole.COLLABORATOR

class UserCreate(UserBase):
    password: str
    full_name: Optional[str] = None

class UserUpdate(BaseModel):
    password: Optional[str] = None
    email: Optional[EmailStr] = None

class User(UserBase):
    id: UUID4
    created_at: datetime
    profile: Optional[Profile] = None

    class Config:
        from_attributes = True

# Link User Schema for minimal data inclusion
class LinkUser(BaseModel):
    id: UUID4
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    domain: Optional[str] = None

    class Config:
        from_attributes = True

# Project Role Schemas
class ProjectRoleBase(BaseModel):
    role_name: str
    spots_total: int

class ProjectRoleCreate(ProjectRoleBase):
    pass

class ProjectRole(ProjectRoleBase):
    id: UUID4
    project_id: UUID4
    spots_filled: int

    class Config:
        from_attributes = True

# Team Member Schemas
class TeamMemberBase(BaseModel):
    role_id: Optional[UUID4] = None
    role_in_team: Optional[str] = None

class TeamMemberCreate(TeamMemberBase):
    member_id: UUID4

class TeamMember(TeamMemberBase):
    id: UUID4
    project_id: UUID4
    member_id: UUID4
    joined_at: Optional[datetime] = None
    member: Optional[LinkUser] = None 

    class Config:
        from_attributes = True

# Brief project representation for relations
class ProjectBrief(BaseModel):
    id: UUID4
    title: str
    domain: str
    status: str

    class Config:
        from_attributes = True

# Collaboration Request Schemas
class CollaborationRequestBase(BaseModel):
    message: Optional[str] = None

class CollaborationRequestCreate(CollaborationRequestBase):
    project_id: UUID4

class CollaborationRequestUpdate(CollaborationRequestBase):
    status: RequestStatus

class CollaborationRequest(CollaborationRequestBase):
    id: UUID4
    project_id: UUID4
    sender_id: UUID4
    receiver_id: Optional[UUID4] = None
    status: RequestStatus
    created_at: datetime
    sender: Optional[LinkUser] = None
    receiver: Optional[LinkUser] = None
    project: Optional[ProjectBrief] = None

    class Config:
        from_attributes = True

# Project Schemas
class ProjectBase(BaseModel):
    title: str
    tagline: str
    description: str
    problem_statement: str
    goals: str
    expected_outcome: str
    domain: str
    level: str
    collaboration_mode: str
    required_skills: List[str]
    team_size_required: int
    start_date: Optional[datetime] = None
    duration_weeks: int

class ProjectCreate(ProjectBase):
    roles: Optional[List[ProjectRoleCreate]] = []

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    tagline: Optional[str] = None
    description: Optional[str] = None
    problem_statement: Optional[str] = None
    goals: Optional[str] = None
    expected_outcome: Optional[str] = None
    domain: Optional[str] = None
    level: Optional[str] = None
    collaboration_mode: Optional[str] = None
    required_skills: Optional[List[str]] = None
    team_size_required: Optional[int] = None
    start_date: Optional[datetime] = None
    duration_weeks: Optional[int] = None
    status: Optional[ProjectStatus] = None

class Project(ProjectBase):
    id: UUID4
    founder_id: UUID4
    status: ProjectStatus
    created_at: datetime
    founder: Optional[Profile] = None
    teams: List[TeamMember] = []
    roles: List[ProjectRole] = []

    class Config:
        from_attributes = True

# Dashboard Analytics Schema
class DashboardAnalytics(BaseModel):
    total_projects: int
    active_projects: int
    total_requests: int
    total_teammates: int
    project_wise_team_progress: List[dict] # {project_id: x, title: string, current: y, total: z}
