from pydantic import BaseModel

class WasteResponse(BaseModel):
    waste_type: str
    category: str
    recyclable: bool
    disposal_method: str
    environmental_impact: str
