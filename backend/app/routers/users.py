from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models import models
from app.schemas import schemas

router = APIRouter()

@router.get("/profile", response_model=schemas.User)
def read_user_profile(
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get current user profile.
    """
    return current_user

@router.put("/update-profile", response_model=schemas.User)
def update_user_profile(
    *,
    db: Session = Depends(deps.get_db),
    profile_in: schemas.ProfileUpdate,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Update current user profile.
    """
    profile = current_user.profile
    if not profile:
        profile = models.Profile(id=current_user.id, email=current_user.email, role=current_user.role)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    
    profile_data = profile_in.dict(exclude_unset=True)
    for field, value in profile_data.items():
        setattr(profile, field, value)
    
    db.add(profile)
    db.commit()
    db.refresh(profile)
    db.refresh(current_user)
    return current_user

from pydantic import UUID4

@router.get("/profile/{user_id}")
def read_public_profile(
    user_id: UUID4,
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Get public profile of a user by user_id.
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    profile = db.query(models.Profile).filter(models.Profile.id == user_id).first()
    
    founded_projects = db.query(models.Project).filter(models.Project.founder_id == user_id).all()
    teams = db.query(models.Team).filter(models.Team.member_id == user_id).all()
    
    team_projects = []
    for t in teams:
        if t.project:
            team_projects.append({
                "id": t.project.id,
                "title": t.project.title,
                "domain": t.project.domain,
                "status": t.project.status,
                "role_in_team": t.role_in_team
            })

    return {
        "profile": {
            "id": profile.id if profile else user.id,
            "full_name": profile.full_name if profile else user.full_name,
            "email": profile.email if profile else user.email,
            "role": profile.role if profile else user.role,
            "domain": profile.domain if profile else None,
            "skills": profile.skills if profile else [],
            "interests": profile.interests if profile else None,
            "year_of_study": profile.year_of_study if profile else None,
            "portfolio_links": profile.portfolio_links if profile else [],
            "avatar_url": profile.avatar_url if profile else None,
            "created_at": profile.created_at if profile else user.created_at
        },
        "founded_projects": [
            {
                "id": p.id,
                "title": p.title,
                "domain": p.domain,
                "status": p.status,
                "tagline": p.tagline
            } for p in founded_projects
        ],
        "team_projects": team_projects
    }
