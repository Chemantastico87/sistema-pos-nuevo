from sqlalchemy import Column, String, Boolean, ForeignKey, Text
from app.core.database import Base

class TicketTemplateModel(Base):
    __tablename__ = "ticket_templates"
    id = Column(String(36), primary_key=True)
    company_id = Column(String(36), ForeignKey("companies.id"), nullable=False)
    header_text = Column(Text)
    footer_text = Column(Text)
    show_logo = Column(Boolean, default=False)
    paper_width = Column(String(10), default="80mm")
