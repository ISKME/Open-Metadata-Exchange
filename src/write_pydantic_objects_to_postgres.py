# from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import declarative_base, sessionmaker

from education_resource import EducationResource
# from .pedigree_record import PedigreeRecord

# Set up SQLAlchemy base and engine
Base = declarative_base()
DATABASE_URL = "postgresql://cclauss:@localhost/mydatabase"  # Replace with your actual database details
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Define a SQLAlchemy model corresponding to your Pydantic model
class EducationResourceDB(Base):
    __tablename__ = "education_resources"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)


# Create the database tables
Base.metadata.create_all(bind=engine)


# Function to add a new user to the database
def add_education_resource_to_db(education_resource: EducationResource):
    db = SessionLocal()
    try:
        # Convert the Pydantic user model to SQLAlchemy model
        db_education_resource = EducationResourceDB(title=education_resource.title)
        db.add(db_education_resource)
        db.commit()
        db.refresh(db_education_resource)
        return db_education_resource
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()


# Example usage
if __name__ == "__main__":
    education_resource = EducationResource(title="2024 Debate")
    education_resource_in_db = add_education_resource_to_db(education_resource)
    print(
        f"EducationResource added to DB: {education_resource.title} (ID: {education_resource.id})"
    )
