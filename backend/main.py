from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import firebase_admin
from firebase_admin import credentials, firestore, auth
import os
from dotenv import load_dotenv
import json
from loguru import logger

# Load environment variables
load_dotenv()

# Initialize Firebase Admin SDK
if not firebase_admin._apps:
    # For production, use service account key
    # For development, you can use the Firebase emulator
    try:
        cred = credentials.Certificate("firebase-service-account.json")
        firebase_admin.initialize_app(cred)
        logger.info("Firebase initialized successfully")
    except Exception as e:
        logger.warning(f"Firebase initialization failed: {e}")
        # Fallback for development
        firebase_admin.initialize_app()

# Initialize Firestore
db = firestore.client()

# FastAPI app
app = FastAPI(
    title="Project Odysseus API",
    description="🧭 Transform your career goals into epic skill trees",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Pydantic Models
class SkillNode(BaseModel):
    id: str
    name: str
    description: str
    type: str  # "inicial", "intermediaria", "avancada"
    dependencies: List[str] = []
    completed: bool = False
    resources: List[Dict[str, str]] = []
    proof_link: Optional[str] = None
    position: Dict[str, float] = {"x": 0, "y": 0}

class SkillTree(BaseModel):
    career: str
    description: str
    skills: List[SkillNode]
    total_skills: int
    completed_skills: int
    progress_percentage: float

class UserProgress(BaseModel):
    user_id: str
    skill_id: str
    completed: bool
    proof_link: Optional[str] = None
    completed_at: Optional[str] = None

class CareerRequest(BaseModel):
    career_name: str
    user_preferences: Optional[Dict[str, Any]] = {}

# Authentication middleware
async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        logger.error(f"Token verification failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token"
        )

# Skill Tree Generation Logic
def generate_skill_tree(career_name: str) -> SkillTree:
    """Generate a skill tree based on career name"""
    
    # Predefined skill trees (in production, this could be AI-generated)
    skill_trees = {
        "desenvolvedor-fullstack-rust": {
            "career": "Desenvolvedor Full-Stack com Rust",
            "description": "Domine o desenvolvimento web moderno com Rust, desde o backend até o frontend",
            "skills": [
                {
                    "id": "rust-basics",
                    "name": "Fundamentos de Rust",
                    "description": "Sintaxe, ownership, borrowing e conceitos básicos",
                    "type": "inicial",
                    "dependencies": [],
                    "resources": [
                        {"title": "The Rust Book", "link": "https://doc.rust-lang.org/book/"},
                        {"title": "Rustlings", "link": "https://github.com/rust-lang/rustlings"}
                    ],
                    "position": {"x": 0, "y": 0}
                },
                {
                    "id": "web-fundamentals",
                    "name": "Fundamentos Web",
                    "description": "HTML, CSS, JavaScript e conceitos de HTTP",
                    "type": "inicial",
                    "dependencies": [],
                    "resources": [
                        {"title": "MDN Web Docs", "link": "https://developer.mozilla.org/"},
                        {"title": "FreeCodeCamp", "link": "https://freecodecamp.org"}
                    ],
                    "position": {"x": 200, "y": 0}
                },
                {
                    "id": "actix-web",
                    "name": "Actix Web Framework",
                    "description": "Framework web performático para Rust",
                    "type": "intermediaria",
                    "dependencies": ["rust-basics"],
                    "resources": [
                        {"title": "Actix Web Docs", "link": "https://actix.rs/"}
                    ],
                    "position": {"x": 0, "y": 150}
                },
                {
                    "id": "database-integration",
                    "name": "Integração com Banco de Dados",
                    "description": "SQLx, Diesel e PostgreSQL com Rust",
                    "type": "intermediaria",
                    "dependencies": ["actix-web"],
                    "resources": [
                        {"title": "SQLx Documentation", "link": "https://github.com/launchbadge/sqlx"}
                    ],
                    "position": {"x": 0, "y": 300}
                },
                {
                    "id": "frontend-rust",
                    "name": "Frontend com Rust",
                    "description": "Yew, Leptos ou Tauri para interfaces",
                    "type": "avancada",
                    "dependencies": ["web-fundamentals", "rust-basics"],
                    "resources": [
                        {"title": "Yew Framework", "link": "https://yew.rs/"}
                    ],
                    "position": {"x": 200, "y": 150}
                },
                {
                    "id": "deployment",
                    "name": "Deploy e DevOps",
                    "description": "Docker, CI/CD e cloud deployment",
                    "type": "avancada",
                    "dependencies": ["actix-web", "database-integration"],
                    "resources": [
                        {"title": "Docker Docs", "link": "https://docs.docker.com/"}
                    ],
                    "position": {"x": 100, "y": 450}
                }
            ]
        },
        "ux-designer": {
            "career": "UX Designer",
            "description": "Crie experiências digitais excepcionais centradas no usuário",
            "skills": [
                {
                    "id": "design-thinking",
                    "name": "Design Thinking",
                    "description": "Metodologia centrada no usuário para solução de problemas",
                    "type": "inicial",
                    "dependencies": [],
                    "resources": [
                        {"title": "IDEO Design Kit", "link": "https://www.designkit.org/"}
                    ],
                    "position": {"x": 0, "y": 0}
                },
                {
                    "id": "user-research",
                    "name": "Pesquisa com Usuários",
                    "description": "Entrevistas, surveys e análise comportamental",
                    "type": "inicial",
                    "dependencies": ["design-thinking"],
                    "resources": [
                        {"title": "Nielsen Norman Group", "link": "https://www.nngroup.com/"}
                    ],
                    "position": {"x": 0, "y": 150}
                },
                {
                    "id": "wireframing",
                    "name": "Wireframing & Prototipagem",
                    "description": "Figma, Sketch e criação de protótipos",
                    "type": "intermediaria",
                    "dependencies": ["user-research"],
                    "resources": [
                        {"title": "Figma Academy", "link": "https://www.figma.com/academy/"}
                    ],
                    "position": {"x": 200, "y": 150}
                },
                {
                    "id": "usability-testing",
                    "name": "Testes de Usabilidade",
                    "description": "Validação de designs com usuários reais",
                    "type": "intermediaria",
                    "dependencies": ["wireframing"],
                    "resources": [
                        {"title": "Maze Testing", "link": "https://maze.co/"}
                    ],
                    "position": {"x": 0, "y": 300}
                },
                {
                    "id": "design-systems",
                    "name": "Design Systems",
                    "description": "Criação e manutenção de sistemas de design escaláveis",
                    "type": "avancada",
                    "dependencies": ["wireframing", "usability-testing"],
                    "resources": [
                        {"title": "Design Systems Handbook", "link": "https://www.designbetter.co/design-systems-handbook"}
                    ],
                    "position": {"x": 100, "y": 450}
                }
            ]
        }
    }
    
    # Normalize career name
    career_key = career_name.lower().replace(" ", "-")
    
    if career_key not in skill_trees:
        # Default fallback or generate dynamically
        return SkillTree(
            career=career_name,
            description=f"Skill tree personalizada para {career_name}",
            skills=[],
            total_skills=0,
            completed_skills=0,
            progress_percentage=0.0
        )
    
    tree_data = skill_trees[career_key]
    skills = [SkillNode(**skill) for skill in tree_data["skills"]]
    
    return SkillTree(
        career=tree_data["career"],
        description=tree_data["description"],
        skills=skills,
        total_skills=len(skills),
        completed_skills=0,
        progress_percentage=0.0
    )

# API Routes
@app.get("/")
async def root():
    return {
        "message": "🧭 Welcome to Project Odysseus API",
        "version": "1.0.0",
        "description": "Transform your career goals into epic skill trees"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "odysseus-api"}

@app.post("/api/skill-tree", response_model=SkillTree)
async def get_skill_tree(request: CareerRequest):
    """Generate or retrieve a skill tree for a specific career"""
    try:
        skill_tree = generate_skill_tree(request.career_name)
        logger.info(f"Generated skill tree for: {request.career_name}")
        return skill_tree
    except Exception as e:
        logger.error(f"Error generating skill tree: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate skill tree"
        )

@app.get("/api/skill-tree/{career_name}", response_model=SkillTree)
async def get_skill_tree_by_name(career_name: str):
    """Get skill tree by career name (GET endpoint)"""
    try:
        skill_tree = generate_skill_tree(career_name)
        return skill_tree
    except Exception as e:
        logger.error(f"Error retrieving skill tree: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve skill tree"
        )

@app.post("/api/user/progress")
async def update_user_progress(
    progress: UserProgress,
    user_data: dict = Depends(verify_token)
):
    """Update user progress for a specific skill"""
    try:
        # Store progress in Firestore
        progress_ref = db.collection("users").document(user_data["uid"]).collection("progress").document(progress.skill_id)
        
        progress_data = {
            "skill_id": progress.skill_id,
            "completed": progress.completed,
            "proof_link": progress.proof_link,
            "completed_at": firestore.SERVER_TIMESTAMP if progress.completed else None,
            "updated_at": firestore.SERVER_TIMESTAMP
        }
        
        progress_ref.set(progress_data, merge=True)
        
        logger.info(f"Updated progress for user {user_data['uid']}, skill {progress.skill_id}")
        return {"message": "Progress updated successfully"}
        
    except Exception as e:
        logger.error(f"Error updating progress: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update progress"
        )

@app.get("/api/user/progress")
async def get_user_progress(
    user_data: dict = Depends(verify_token)
):
    """Get all progress for the authenticated user"""
    try:
        progress_ref = db.collection("users").document(user_data["uid"]).collection("progress")
        progress_docs = progress_ref.stream()
        
        progress_data = {}
        for doc in progress_docs:
            progress_data[doc.id] = doc.to_dict()
        
        return {"progress": progress_data}
        
    except Exception as e:
        logger.error(f"Error retrieving progress: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve progress"
        )

@app.get("/api/careers")
async def list_available_careers():
    """List all available career paths"""
    careers = [
        {
            "id": "desenvolvedor-fullstack-rust",
            "name": "Desenvolvedor Full-Stack com Rust",
            "description": "Domine o desenvolvimento web moderno com Rust",
            "difficulty": "Avançado",
            "estimated_time": "8-12 meses"
        },
        {
            "id": "ux-designer",
            "name": "UX Designer",
            "description": "Crie experiências digitais excepcionais",
            "difficulty": "Intermediário",
            "estimated_time": "6-9 meses"
        }
    ]
    
    return {"careers": careers}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)