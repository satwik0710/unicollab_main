from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from app.api import deps
from app.models import models
from app.schemas import schemas

router = APIRouter()

@router.post("/create", response_model=schemas.Project)
def create_project(
    *,
    db: Session = Depends(deps.get_db),
    project_in: schemas.ProjectCreate,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Create new project. Only Founders can create.
    """
    project_data = project_in.dict(exclude={"roles"})
    project = models.Project(
        **project_data,
        founder_id=current_user.id
    )
    db.add(project)
    db.commit()
    db.refresh(project)

    if project_in.roles:
        for role_data in project_in.roles:
            role = models.ProjectRole(
                project_id=project.id,
                **role_data.dict()
            )
            db.add(role)
        db.commit()
        db.refresh(project)

    return project

@router.get("/my-projects", response_model=List[schemas.Project])
def read_my_projects(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get current user's projects.
    """
    # Get projects founded by user OR where user is a team member
    return db.query(models.Project).outerjoin(
        models.Team, models.Project.id == models.Team.project_id
    ).filter(
        or_(
            models.Project.founder_id == current_user.id,
            models.Team.member_id == current_user.id
        )
    ).all()

@router.get("/{project_id}", response_model=schemas.Project)
def read_project(
    project_id: str,
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Get project by ID.
    """
    project = db.query(models.Project)\
        .options(joinedload(models.Project.founder))\
        .options(joinedload(models.Project.roles))\
        .options(joinedload(models.Project.teams).joinedload(models.Team.member))\
        .filter(models.Project.id == project_id)\
        .first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.put("/{project_id}", response_model=schemas.Project)
def update_project(
    *,
    db: Session = Depends(deps.get_db),
    project_id: str,
    project_in: schemas.ProjectUpdate,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Update project. Only Owner can update.
    """
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.founder_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    project_data = project_in.dict(exclude_unset=True)
    for field, value in project_data.items():
        setattr(project, field, value)
    
    db.add(project)
    db.commit()
    db.refresh(project)
    return project

@router.delete("/{project_id}", response_model=schemas.Project)
def delete_project(
    *,
    db: Session = Depends(deps.get_db),
    project_id: str,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Delete project. Only Owner can delete.
    """
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.founder_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    db.delete(project)
    db.commit()
    return project

@router.get("/similar/{project_id}", response_model=List[schemas.Project])
def read_similar_projects(
    project_id: str,
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Get similar projects by domain.
    """
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    similar = db.query(models.Project).filter(
        models.Project.domain == project.domain,
        models.Project.id != project_id,
        models.Project.status == "open"
    ).limit(4).all()
    
    return similar
